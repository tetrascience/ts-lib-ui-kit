/**
 * Scope selection: turns `--epic`, `--fix-version`, explicit keys or raw `--jql`
 * into one JQL query, runs it, and freezes the exact issue keys into the audit.
 *
 * Verified against the SW project (company-managed): epic children carry the
 * `parent` field (and the legacy "Epic Link" custom field — both return the
 * same 68 issues for SW-2301), so `parent in (…)` is used. Fix versions are
 * project-scoped names (e.g. `ts-lib-ui-kit:v1.1.0`); they are resolved to the
 * version id so the query cannot drift onto a same-named version elsewhere.
 */
import { jqlString, type JiraClient } from "../clients/jira-client";
import { compareIssueKeys, isJiraKey } from "../shared/keys";

import type { AuditScope, JiraIssue, ScopeSelector } from "../shared/types";

/** Issue types that produce code + stories in this project; everything else is reported as skipped. */
export const DEFAULT_ISSUE_TYPES = ["Story", "Task", "Bug", "Defect", "Spike"];

/** The read-only slice of the Jira client scope resolution needs (tests pass fakes). */
export type JiraReader = Pick<JiraClient, "getIssue" | "getProjectVersions" | "searchAll">;

export interface SelectorArgs {
  epics: string[];
  fixVersions: string[];
  keys: string[];
  jql?: string;
  intersect: boolean;
}

export class ScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScopeError";
  }
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/** Validates the CLI selection and decides the scope type; mixed selectors need `--intersect`. */
export function parseSelector(args: SelectorArgs): ScopeSelector {
  const epics = dedupe(args.epics.map((key) => key.toUpperCase()));
  const fixVersions = dedupe(args.fixVersions);
  const keys = dedupe(args.keys.map((key) => key.toUpperCase()));
  const jql = args.jql?.trim() || undefined;

  const selected = [epics.length > 0, fixVersions.length > 0, keys.length > 0, jql !== undefined].filter(
    Boolean,
  ).length;
  if (selected === 0)
    throw new ScopeError("Nothing selected: pass --epic, --fix-version, --jql or explicit issue keys");

  for (const key of [...epics, ...keys]) {
    if (!isJiraKey(key)) throw new ScopeError(`"${key}" is not a Jira issue key (expected e.g. SW-1234)`);
  }

  if (selected > 1) {
    if (keys.length > 0 || jql !== undefined) {
      throw new ScopeError("Explicit keys and --jql cannot be combined with other selectors; run separate audits");
    }
    if (!args.intersect) {
      throw new ScopeError(
        "Both --epic and --fix-version were given. Pass --intersect to audit issues that match BOTH, or run two audits",
      );
    }
    return { type: "intersection", epics, fixVersions, keys: [], jql: undefined };
  }
  if (epics.length > 0) return { type: "epic", epics, fixVersions: [], keys: [] };
  if (fixVersions.length > 0) return { type: "fix-version", epics: [], fixVersions, keys: [] };
  if (keys.length > 0) return { type: "keys", epics: [], fixVersions: [], keys };
  return { type: "jql", epics: [], fixVersions: [], keys: [], jql };
}

function epicClause(epics: string[]): string {
  return `parent in (${epics.join(", ")})`;
}

function fixVersionClause(projectKey: string, versionIds: string[]): string {
  return `project = ${jqlString(projectKey)} AND fixVersion in (${versionIds.join(", ")})`;
}

export function buildScopeJql(selector: ScopeSelector, context: { projectKey: string; versionIds: string[] }): string {
  switch (selector.type) {
    case "epic":
      return `${epicClause(selector.epics)} ORDER BY key ASC`;
    case "fix-version":
      return `${fixVersionClause(context.projectKey, context.versionIds)} ORDER BY key ASC`;
    case "intersection":
      return `(${epicClause(selector.epics)}) AND (${fixVersionClause(context.projectKey, context.versionIds)}) ORDER BY key ASC`;
    case "keys":
      return `key in (${selector.keys.join(", ")}) ORDER BY key ASC`;
    case "jql":
      return selector.jql ?? "";
  }
}

export interface ResolvedScope {
  scope: AuditScope;
  /** Every issue the query returned, before the issue-type filter. */
  issues: JiraIssue[];
  audited: JiraIssue[];
  skipped: Array<{ jira: string; issueType: string; reason: string }>;
  /** Summaries of the selected epics / versions, for the report header. */
  labels: string[];
}

async function verifyEpics(jira: JiraReader, epics: string[]): Promise<string[]> {
  const labels: string[] = [];
  for (const key of epics) {
    const issue = await jira.getIssue(key);
    if (!issue) throw new ScopeError(`Epic ${key} was not found (or is not visible to this account)`);
    const type = issue.fields.issuetype;
    if (type.name !== "Epic" && type.hierarchyLevel !== 1) {
      throw new ScopeError(`${key} is a ${type.name}, not an Epic — pass it as an explicit key instead`);
    }
    labels.push(`${key} (${issue.fields.summary})`);
  }
  return labels;
}

async function resolveVersionIds(
  jira: JiraReader,
  projectKey: string,
  names: string[],
): Promise<{ ids: string[]; labels: string[] }> {
  const versions = await jira.getProjectVersions(projectKey);
  const ids: string[] = [];
  const labels: string[] = [];
  for (const name of names) {
    const exact = versions.filter((version) => version.name === name);
    if (exact.length === 1) {
      ids.push(exact[0].id);
      labels.push(`${name} (id ${exact[0].id})`);
      continue;
    }
    if (exact.length > 1) throw new ScopeError(`Fix Version "${name}" is ambiguous in project ${projectKey}`);
    const similar = versions
      .filter((version) => version.name.toLowerCase().includes(name.toLowerCase()))
      .map((version) => version.name)
      .slice(0, 8);
    const hint = similar.length > 0 ? ` Similar: ${similar.join(", ")}` : "";
    throw new ScopeError(`Fix Version "${name}" does not exist in project ${projectKey}.${hint}`);
  }
  return { ids, labels };
}

export function partitionByIssueType(
  issues: JiraIssue[],
  issueTypes: readonly string[],
): Pick<ResolvedScope, "audited" | "skipped"> {
  const allowed = new Set(issueTypes.map((type) => type.toLowerCase()));
  const audited: JiraIssue[] = [];
  const skipped: ResolvedScope["skipped"] = [];
  for (const issue of issues) {
    const typeName = issue.fields.issuetype.name;
    if (allowed.has(typeName.toLowerCase())) {
      audited.push(issue);
    } else {
      skipped.push({
        jira: issue.key,
        issueType: typeName,
        reason: `issue type "${typeName}" is not audited (allowed: ${issueTypes.join(", ")})`,
      });
    }
  }
  return { audited, skipped };
}

export async function resolveScope(
  jira: JiraReader,
  selector: ScopeSelector,
  options: { projectKey: string; issueTypes?: readonly string[] },
): Promise<ResolvedScope> {
  const issueTypes = options.issueTypes ?? DEFAULT_ISSUE_TYPES;
  const labels: string[] = [];
  let versionIds: string[] = [];

  if (selector.epics.length > 0) labels.push(...(await verifyEpics(jira, selector.epics)));
  if (selector.fixVersions.length > 0) {
    const resolved = await resolveVersionIds(jira, options.projectKey, selector.fixVersions);
    versionIds = resolved.ids;
    labels.push(...resolved.labels);
  }

  const resolvedJql = buildScopeJql(selector, { projectKey: options.projectKey, versionIds });
  const found = await jira.searchAll(resolvedJql);

  if (selector.type === "keys") {
    const foundKeys = new Set(found.map((issue) => issue.key));
    const missing = selector.keys.filter((key) => !foundKeys.has(key));
    if (missing.length > 0) throw new ScopeError(`Issue(s) not found or not visible: ${missing.join(", ")}`);
  }

  const byKey = new Map<string, JiraIssue>();
  for (const issue of found) byKey.set(issue.key, issue);
  const issues = [...byKey.values()].sort((a, b) => compareIssueKeys(a.key, b.key));
  const { audited, skipped } = partitionByIssueType(issues, issueTypes);

  const values =
    selector.type === "epic" || selector.type === "intersection"
      ? [...selector.epics, ...selector.fixVersions]
      : selector.type === "fix-version"
        ? selector.fixVersions
        : selector.type === "keys"
          ? selector.keys
          : [selector.jql ?? ""];

  return {
    scope: { type: selector.type, values, resolvedJql, issueTypes: [...issueTypes] },
    issues,
    audited,
    skipped,
    labels,
  };
}
