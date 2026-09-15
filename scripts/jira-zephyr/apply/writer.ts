/**
 * Writer: executes approved, still-valid additions from an audit artifact.
 *
 * It never discovers mappings — the only IDs it can link are the artifact's
 * `missingZephyrIds`. Before writing it re-fetches the Jira issue (same numeric
 * id?) and the live Zephyr links, and refuses to touch anything whose state
 * moved since the audit ("stale"). Dry-run is the default at the CLI; here it
 * is the `execute: false` path, which returns `would-apply` without a write.
 */
import { uniqueSorted } from "../shared/keys";

import { gateEntry } from "./validator";

import type { JiraClient } from "../clients/jira-client";
import type { ZephyrClient } from "../clients/zephyr-client";
import type { Confidence } from "../shared/confidence";
import type { ApplyOutcome, ApplyResult, AuditArtifact, AuditEntry } from "../shared/types";

export interface ApplyClients {
  jira: Pick<JiraClient, "getIssue">;
  zephyr: Pick<ZephyrClient, "getLinkedTestCaseKeys" | "getTestCase" | "linkTestCaseToIssue" | "readOnly">;
}

export interface ApplyOptions {
  execute: boolean;
  minConfidence: Confidence;
  /** Restrict to these keys (must all be in the frozen snapshot). */
  only?: string[];
  log?: (message: string) => void;
}

function result(jira: string, outcome: ApplyOutcome, detail: string, extra: Partial<ApplyResult> = {}): ApplyResult {
  return { jira, outcome, added: [], detail, ...extra };
}

/** Applies one entry. Never throws: failures become an `error` outcome so the run continues. */
export async function applyEntry(
  entry: AuditEntry,
  clients: ApplyClients,
  options: ApplyOptions,
): Promise<ApplyResult> {
  const gate = gateEntry(entry, options.minConfidence);
  if (!gate.proceed) return result(entry.jira, gate.outcome, gate.detail);

  try {
    const issue = await clients.jira.getIssue(entry.jira, ["summary", "issuetype", "status"]);
    if (!issue)
      return result(entry.jira, "manual-review", "Jira issue no longer exists or is not visible to this account");
    if (issue.id !== entry.jiraIssueId) {
      return result(
        entry.jira,
        "stale",
        `Jira issue id changed since the audit (${entry.jiraIssueId} → ${issue.id}); the key was moved or reused — re-audit`,
      );
    }

    const live = uniqueSorted(await clients.zephyr.getLinkedTestCaseKeys(entry.jira));
    const removedSinceAudit = entry.existingZephyrIdsAtAudit.filter((id) => !live.includes(id));
    const addedByOthers = live.filter((id) => !entry.existingZephyrIdsAtAudit.includes(id) && !gate.toAdd.includes(id));
    if (removedSinceAudit.length > 0 || addedByOthers.length > 0) {
      const changes = [
        removedSinceAudit.length > 0 ? `removed: ${removedSinceAudit.join(", ")}` : "",
        addedByOthers.length > 0 ? `added by someone else: ${addedByOthers.join(", ")}` : "",
      ].filter(Boolean);
      return result(
        entry.jira,
        "stale",
        `Zephyr links changed since the audit (${changes.join("; ")}); re-run the audit`,
        {
          liveZephyrIds: live,
        },
      );
    }

    const toAdd = gate.toAdd.filter((id) => !live.includes(id));
    if (toAdd.length === 0) {
      return result(entry.jira, "already-correct", "every expected link already exists in Zephyr", {
        liveZephyrIds: live,
      });
    }

    const missingCases: string[] = [];
    for (const id of toAdd) {
      if ((await clients.zephyr.getTestCase(id)) === null) missingCases.push(id);
    }
    if (missingCases.length > 0) {
      return result(entry.jira, "manual-review", `test case(s) not found in Zephyr: ${missingCases.join(", ")}`, {
        liveZephyrIds: live,
      });
    }

    if (!options.execute) {
      return result(entry.jira, "would-apply", `dry run: would link ${toAdd.join(", ")} to ${entry.jira}`, {
        added: toAdd,
        liveZephyrIds: live,
      });
    }
    if (clients.zephyr.readOnly) throw new Error("execute requested but the Zephyr client is read-only");

    const added: string[] = [];
    const alreadyPresent: string[] = [];
    for (const id of toAdd) {
      try {
        const link = await clients.zephyr.linkTestCaseToIssue(id, entry.jiraIssueId);
        (link.alreadyExisted ? alreadyPresent : added).push(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return result(entry.jira, "error", `linked ${added.join(", ") || "nothing"}; failed at ${id}: ${message}`, {
          added,
          liveZephyrIds: uniqueSorted([...live, ...added]),
        });
      }
    }
    const detail = [
      `linked ${added.join(", ") || "nothing new"}`,
      alreadyPresent.length > 0 ? `already present: ${alreadyPresent.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    return result(entry.jira, "applied", detail, { added, liveZephyrIds: uniqueSorted([...live, ...toAdd]) });
  } catch (error) {
    return result(entry.jira, "error", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Walks the frozen `scopeSnapshot.issueKeys` — never the live Epic / Fix Version —
 * so issues added to the scope after the audit are ignored by construction.
 */
export async function runApply(
  artifact: AuditArtifact,
  clients: ApplyClients,
  options: ApplyOptions,
): Promise<ApplyResult[]> {
  const log = options.log;
  const snapshot = artifact.scopeSnapshot.issueKeys;
  const only = options.only?.map((key) => key.toUpperCase());
  if (only) {
    const outside = only.filter((key) => !snapshot.includes(key));
    if (outside.length > 0) throw new Error(`--only keys are not in the audit's frozen scope: ${outside.join(", ")}`);
  }
  const byKey = new Map(artifact.tickets.map((ticket) => [ticket.jira, ticket]));
  const results: ApplyResult[] = [];
  for (const key of snapshot) {
    if (only && !only.includes(key)) continue;
    const entry = byKey.get(key);
    if (!entry) continue; // validator guarantees presence; belt and braces
    const outcome = await applyEntry(entry, clients, options);
    log?.(`  ${key.padEnd(9)} ${outcome.outcome.padEnd(24)} ${outcome.detail}`);
    results.push(outcome);
  }
  return results;
}

export function summarizeResults(results: ApplyResult[]): Partial<Record<ApplyOutcome, number>> {
  const summary: Partial<Record<ApplyOutcome, number>> = {};
  for (const item of results) summary[item.outcome] = (summary[item.outcome] ?? 0) + 1;
  return summary;
}
