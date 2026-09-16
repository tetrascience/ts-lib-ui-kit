#!/usr/bin/env tsx
/**
 * Jira ↔ Zephyr audit (read-only).
 *
 *   yarn jira-zephyr:audit --epic SW-2301
 *   yarn jira-zephyr:audit --fix-version "ts-lib-ui-kit:v1.1.0"
 *   yarn jira-zephyr:audit SW-2540 SW-2528
 *   yarn jira-zephyr:audit --jql 'project = SW AND sprint in openSprints()'
 *
 * Resolves the scope to an exact, frozen list of issue keys, derives the Zephyr
 * IDs the repository attributes to each issue, compares them with the COVERAGE
 * links Zephyr currently holds, and writes a reviewable JSON artifact. It never
 * writes to Jira or Zephyr: the Zephyr client is constructed read-only and
 * throws on any non-GET call.
 *
 * Environment: JIRA_EMAIL + JIRA_API_TOKEN (JIRA_BASE_URL optional),
 *              ZEPHYR_TOKEN (ZEPHYR_BASE_URL / ZEPHYR_PROJECT_KEY optional).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { jiraEnv, resolveProjectKey, zephyrEnv } from "../clients/env";
import { JiraClient } from "../clients/jira-client";
import { createZephyrTransport, ZephyrClient } from "../clients/zephyr-client";
import { AUDIT_SCHEMA_VERSION, AUDIT_TOOL_NAME, parseAuditArtifact } from "../shared/audit-schema";
import { projectKeyOf } from "../shared/keys";
import { displayPath } from "../shared/paths";

import { buildAuditEntry, deriveEvidence, summarize } from "./mapper";
import { buildRepoIndex, describeRepoState, type RepoIndex, type RepoState } from "./repo-scanner";
import { auditArtifactFileName, renderAuditReport } from "./reporter";
import { DEFAULT_ISSUE_TYPES, parseSelector, resolveScope, ScopeError, type JiraReader } from "./scope";

import type { AuditArtifact, AuditEntry } from "../shared/types";

export const USAGE = `Usage:
  yarn jira-zephyr:audit --epic <KEY> [--epic <KEY> …]
  yarn jira-zephyr:audit --fix-version <NAME> [--fix-version <NAME> …]
  yarn jira-zephyr:audit <KEY> [<KEY> …]
  yarn jira-zephyr:audit --jql '<JQL>'

Options:
  --epic <KEY>            Audit every applicable issue whose parent is this Epic (repeatable)
  --fix-version <NAME>    Audit every applicable issue assigned to this Fix Version (repeatable)
  --jql <JQL>             Advanced escape hatch: audit the issues this JQL returns
  --intersect             Required when --epic and --fix-version are both given (issues matching BOTH)
  --project <KEY>         Jira/Zephyr project key (default: $JIRA_PROJECT_KEY, $ZEPHYR_PROJECT_KEY, or SW)
  --issue-types <list>    Comma-separated issue types to audit (default: ${DEFAULT_ISSUE_TYPES.join(",")})
  --out <file>            Artifact path (default: artifacts/zephyr-audit-<scope>.json)
  --artifacts-dir <dir>   Directory for the default artifact name (default: artifacts)
  -h, --help              Show this help

The audit is read-only. It writes only the JSON artifact.`;

/** The read-only slice of the Zephyr client the audit needs (tests inject fakes). */
export type ZephyrReadClient = Pick<ZephyrClient, "getLinkedTestCaseKeys" | "getTestCase" | "readOnly">;

export interface AuditDeps {
  cwd?: string;
  jira?: JiraReader & { baseUrl: string; verifyCredentials?: () => Promise<unknown> };
  zephyr?: { client: ZephyrReadClient; baseUrl: string; projectKey: string };
  index?: RepoIndex;
  repoState?: RepoState;
  now?: () => Date;
  log?: (message: string) => void;
  out?: (message: string) => void;
}

export interface AuditRunResult {
  artifact: AuditArtifact;
  artifactPath: string;
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function verifyMissingExist(zephyr: ZephyrReadClient, entry: AuditEntry): Promise<string[]> {
  const notFound: string[] = [];
  for (const id of entry.missingZephyrIds) {
    if ((await zephyr.getTestCase(id)) === null) notFound.push(id);
  }
  return notFound;
}

async function connectZephyr(
  deps: AuditDeps,
  log: (message: string) => void,
  projectKey: string,
): Promise<{ client: ZephyrReadClient; baseUrl: string; projectKey: string }> {
  if (deps.zephyr) return deps.zephyr;
  const config = zephyrEnv();
  // `--project` (or the shared env key) names the Jira project; a Zephyr Scale
  // project key is the same value, so the Zephyr connection follows it too.
  const { transport, source } = await createZephyrTransport({ ...config, projectKey });
  log(`[INFO] Zephyr transport: ${source} (read-only)`);
  return {
    client: new ZephyrClient(transport, { readOnly: true }),
    baseUrl: config.baseUrl,
    projectKey,
  };
}

export async function runAudit(argv: string[], deps: AuditDeps = {}): Promise<AuditRunResult | null> {
  const log = deps.log ?? ((message: string) => console.error(message));
  const out = deps.out ?? ((message: string) => console.log(message));
  const cwd = deps.cwd ?? process.cwd();
  const now = deps.now ?? (() => new Date());

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      epic: { type: "string", multiple: true },
      "fix-version": { type: "string", multiple: true },
      jql: { type: "string" },
      intersect: { type: "boolean" },
      project: { type: "string" },
      "issue-types": { type: "string" },
      out: { type: "string" },
      "artifacts-dir": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    out(USAGE);
    return null;
  }

  const selector = parseSelector({
    epics: values.epic ?? [],
    fixVersions: values["fix-version"] ?? [],
    keys: positionals,
    jql: values.jql,
    intersect: values.intersect === true,
  });
  const projectKey = values.project?.trim().toUpperCase() || resolveProjectKey();
  const issueTypes = values["issue-types"] ? splitList(values["issue-types"]) : DEFAULT_ISSUE_TYPES;

  const jira = deps.jira ?? new JiraClient(jiraEnv());
  if (jira.verifyCredentials) {
    // Rejected credentials would otherwise surface as "Epic … not found": Jira
    // downgrades them to an anonymous request, and anonymous users get 404s.
    await jira.verifyCredentials();
    log("[INFO] Jira: credentials accepted");
  }
  const zephyr = await connectZephyr(deps, log, projectKey);
  if (!zephyr.client.readOnly) throw new Error("The audit requires a read-only Zephyr client");

  log(`[INFO] Resolving scope (${selector.type}) in project ${projectKey}…`);
  const resolved = await resolveScope(jira, selector, { projectKey, issueTypes });
  log(
    `[INFO] Resolved ${resolved.issues.length} issue(s): ${resolved.audited.length} to audit, ${resolved.skipped.length} skipped by issue type`,
  );

  const projectKeys = new Set([projectKey, ...resolved.audited.map((issue) => projectKeyOf(issue.key))]);
  const index = deps.index ?? buildRepoIndex({ cwd, projectKeys });
  log(`[INFO] Indexed ${index.files.size} story files carrying ${index.storiesByZephyrId.size} Zephyr IDs`);

  const tickets: AuditEntry[] = [];
  for (const issue of resolved.audited) {
    const evidence = deriveEvidence(index, issue);
    const existingZephyrIds = await zephyr.client.getLinkedTestCaseKeys(issue.key);
    let entry = buildAuditEntry({ issue, evidence, existingZephyrIds, index });
    const missingNotFoundInZephyr = await verifyMissingExist(zephyr.client, entry);
    if (missingNotFoundInZephyr.length > 0) {
      entry = buildAuditEntry({ issue, evidence, existingZephyrIds, index, missingNotFoundInZephyr });
    }
    tickets.push(entry);
    log(`  ${issue.key.padEnd(9)} ${entry.status.padEnd(14)} ${entry.confidence.padEnd(7)} ${entry.recommendedAction}`);
  }

  const generatedAt = now().toISOString();
  const artifact: AuditArtifact = {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    tool: AUDIT_TOOL_NAME,
    generatedAt,
    scope: resolved.scope,
    scopeSnapshot: { resolvedAt: generatedAt, issueKeys: resolved.audited.map((issue) => issue.key) },
    skipped: resolved.skipped,
    repo: deps.repoState ?? describeRepoState(cwd),
    jira: { baseUrl: jira.baseUrl, projectKey },
    zephyr: { baseUrl: zephyr.baseUrl, projectKey: zephyr.projectKey },
    tickets,
    summary: summarize(tickets),
  };
  parseAuditArtifact(artifact); // never write an artifact the apply script would reject

  const artifactPath = path.resolve(
    cwd,
    values.out ?? path.join(values["artifacts-dir"] ?? "artifacts", auditArtifactFileName(resolved.scope, generatedAt)),
  );
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  out(
    renderAuditReport(artifact, {
      labels: resolved.labels,
      artifactPath: displayPath(artifactPath, cwd),
      totalResolved: resolved.issues.length,
    }),
  );
  return { artifact, artifactPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runAudit(process.argv.slice(2)).catch((error: unknown) => {
    if (error instanceof ScopeError) {
      console.error(`[ERROR] ${error.message}\n\n${USAGE}`);
    } else {
      console.error("[ERROR]", error instanceof Error ? error.message : error);
    }
    process.exit(1);
  });
}
