#!/usr/bin/env tsx
/**
 * Jira ↔ Zephyr apply: executes ONLY the approved changes recorded in an audit
 * artifact produced by scripts/jira-zephyr/audit/audit.ts.
 *
 *   yarn jira-zephyr:apply artifacts/zephyr-audit-epic-SW-2301.json            # dry run (default)
 *   yarn jira-zephyr:apply artifacts/zephyr-audit-epic-SW-2301.json --execute  # write links
 *
 * Guarantees:
 *   - operates on the frozen scopeSnapshot.issueKeys, never re-expanding the Epic / Fix Version
 *   - adds only the audit's `missingZephyrIds`; never discovers mappings, never removes links
 *   - re-fetches Jira + Zephyr and refuses entries whose state changed since the audit
 *   - low-confidence entries are never applied; the default threshold is `high`
 *   - dry run is the default; the Zephyr client is read-only unless --execute is passed
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { jiraEnv, zephyrEnv } from "../clients/env";
import { JiraClient } from "../clients/jira-client";
import { createZephyrTransport, ZephyrClient } from "../clients/zephyr-client";
import { applyArtifactSchema, APPLY_TOOL_NAME, AUDIT_SCHEMA_VERSION, formatZodIssues } from "../shared/audit-schema";
import { displayPath } from "../shared/paths";
import { formatIdList, renderTable } from "../shared/table";

import { AuditValidationError, parseMinConfidence, validateAuditArtifact } from "./validator";
import { runApply, summarizeResults, type ApplyClients } from "./writer";

import type { ApplyArtifact, ApplyResult } from "../shared/types";

export const USAGE = `Usage:
  yarn jira-zephyr:apply <audit.json> [--execute] [--min-confidence exact|high|medium] [--only SW-1,SW-2] [--result <file>]

Default is a DRY RUN: every entry is re-checked against live Jira/Zephyr and the
decision is printed, but nothing is written. Add --execute to create the links.

Options:
  --execute                 Create the approved COVERAGE links in Zephyr
  --min-confidence <level>  Lowest confidence to apply (default: high; low is never allowed)
  --only <keys>             Comma-separated subset of the frozen scope to process
  --result <file>           Where to write the apply-result JSON (default: next to the audit file)
  -h, --help                Show this help`;

const STALE_AUDIT_WARNING_DAYS = 14;
const MS_PER_DAY = 86_400_000;

export interface ApplyDeps {
  clients?: ApplyClients;
  now?: () => Date;
  log?: (message: string) => void;
  out?: (message: string) => void;
}

export interface ApplyRunResult {
  artifact: ApplyArtifact;
  resultPath: string;
  hadErrors: boolean;
}

function renderResults(results: ApplyResult[]): string {
  return renderTable(
    ["JIRA", "OUTCOME", "ADDED", "DETAIL"],
    results.map((item) => [item.jira, item.outcome, formatIdList(item.added), item.detail]),
  );
}

export async function runApplyCli(argv: string[], deps: ApplyDeps = {}): Promise<ApplyRunResult | null> {
  const log = deps.log ?? ((message: string) => console.error(message));
  const out = deps.out ?? ((message: string) => console.log(message));
  const now = deps.now ?? (() => new Date());

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      execute: { type: "boolean" },
      "min-confidence": { type: "string" },
      only: { type: "string" },
      result: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    out(USAGE);
    return null;
  }
  if (positionals.length !== 1) throw new AuditValidationError(`Expected exactly one audit artifact path\n\n${USAGE}`);

  const auditPath = path.resolve(positionals[0]);
  const execute = values.execute === true;
  const minConfidence = parseMinConfidence(values["min-confidence"]);
  const only = values.only
    ?.split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  const artifact = validateAuditArtifact(JSON.parse(fs.readFileSync(auditPath, "utf8")));
  const ageDays = (now().getTime() - Date.parse(artifact.generatedAt)) / MS_PER_DAY;
  log(
    `[INFO] Audit: ${path.basename(auditPath)} (${artifact.scope.type}: ${artifact.scope.values.join(", ")}; generated ${artifact.generatedAt})`,
  );
  log(
    `[INFO] Frozen scope: ${artifact.scopeSnapshot.issueKeys.length} issue(s); approved entries: ${artifact.tickets.filter((t) => t.approved).length}`,
  );
  if (ageDays > STALE_AUDIT_WARNING_DAYS) {
    log(`[WARN] This audit is ${Math.floor(ageDays)} days old; consider re-auditing before applying`);
  }
  log(
    `[INFO] Mode: ${execute ? "EXECUTE — links will be created" : "dry run — nothing will be written"}; min confidence: ${minConfidence}`,
  );

  let clients = deps.clients;
  if (!clients) {
    const zephyrConfig = zephyrEnv();
    const { transport, source } = await createZephyrTransport(zephyrConfig);
    clients = {
      jira: new JiraClient(jiraEnv()),
      zephyr: new ZephyrClient(transport, { readOnly: !execute }),
    };
    log(`[INFO] Zephyr transport: ${source} (${execute ? "read-write" : "read-only"})`);
  }

  const results = await runApply(artifact, clients, { execute, minConfidence, only, log });
  const applied: ApplyArtifact = {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    tool: APPLY_TOOL_NAME,
    appliedAt: now().toISOString(),
    auditFile: path.basename(auditPath),
    auditGeneratedAt: artifact.generatedAt,
    mode: execute ? "execute" : "dry-run",
    minConfidence,
    results,
    summary: summarizeResults(results),
  };
  const parsed = applyArtifactSchema.safeParse(applied);
  if (!parsed.success)
    throw new Error(`Internal error: apply result failed schema validation\n${formatZodIssues(parsed.error)}`);

  const resultPath = values.result
    ? path.resolve(values.result)
    : auditPath.replace(/\.json$/i, "") + `.apply-${applied.appliedAt.replace(/[:.]/g, "-")}.json`;
  fs.mkdirSync(path.dirname(resultPath), { recursive: true });
  fs.writeFileSync(resultPath, `${JSON.stringify(applied, null, 2)}\n`, "utf8");

  const lines = [`Zephyr Apply (${applied.mode})`, "", renderResults(results), "", "Summary"];
  for (const [outcome, count] of Object.entries(applied.summary).sort()) lines.push(`  ${outcome}: ${count}`);
  lines.push("", `Result written to: ${displayPath(resultPath)}`);
  if (!execute) lines.push("Dry run — no changes were made. Re-run with --execute to create the links above.");
  out(lines.join("\n"));

  return { artifact: applied, resultPath, hadErrors: results.some((item) => item.outcome === "error") };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runApplyCli(process.argv.slice(2))
    .then((run) => {
      if (run?.hadErrors) process.exit(1);
    })
    .catch((error: unknown) => {
      console.error("[ERROR]", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
