#!/usr/bin/env tsx
/**
 * Optional helper: flips `approved` on specific entries of an audit artifact so
 * reviewers do not have to hand-edit JSON. Editing the file directly is equally
 * valid — the apply script validates whatever it is given.
 *
 *   yarn jira-zephyr:approve artifacts/zephyr-audit-epic-SW-2301.json SW-2540 SW-2528 [--note "reviewed by QE"]
 *   yarn jira-zephyr:approve artifacts/zephyr-audit-epic-SW-2301.json --recommended
 *   yarn jira-zephyr:approve artifacts/zephyr-audit-epic-SW-2301.json SW-2540 --unapprove
 *
 * `--recommended` selects every entry the audit itself recommends `add` —
 * confidence ≥ high, nothing unexpected, every test case exists — which is what
 * the GitHub workflow's `approve: recommended` input uses. Low-confidence
 * entries can never be approved by any route.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { AuditValidationError, validateAuditArtifact } from "./apply/validator";
import { NEVER_AUTO_APPLY } from "./shared/confidence";
import { uniqueSorted } from "./shared/keys";
import { displayPath } from "./shared/paths";

import type { AuditArtifact } from "./shared/types";

export const USAGE = `Usage:
  yarn jira-zephyr:approve <audit.json> <KEY> [<KEY> …] [--note "<text>"]
  yarn jira-zephyr:approve <audit.json> --recommended [<KEY> …] [--note "<text>"]
  yarn jira-zephyr:approve <audit.json> <KEY> [<KEY> …] --unapprove

Options:
  --recommended   Also select every entry the audit recommends ADD (confidence ≥ high)
  --note <text>   Free-text review note stored on each approved entry
  --unapprove     Revoke approval instead of granting it
  -h, --help      Show this help`;

export interface ApproveOptions {
  keys: string[];
  approve: boolean;
  note?: string;
  /** Also (un)approve every entry whose `recommendedAction` is `add`. */
  recommended?: boolean;
}

/** Keys of the entries the audit recommends adding links to — applicable by construction. */
export function recommendedKeys(artifact: AuditArtifact): string[] {
  return uniqueSorted(
    artifact.tickets.filter((ticket) => ticket.recommendedAction === "add").map((ticket) => ticket.jira),
  );
}

/** Pure: returns the updated artifact, or throws if any explicit key cannot be (un)approved. */
export function applyApproval(artifact: AuditArtifact, options: ApproveOptions): AuditArtifact {
  const byKey = new Map(artifact.tickets.map((ticket) => [ticket.jira, ticket]));
  const problems: string[] = [];
  for (const raw of options.keys) {
    const key = raw.toUpperCase();
    const ticket = byKey.get(key);
    if (!ticket) {
      problems.push(`${key} is not in this audit's frozen scope`);
      continue;
    }
    if (options.approve && ticket.missingZephyrIds.length === 0)
      problems.push(`${key} has nothing to add (nothing to approve)`);
    if (options.approve && ticket.confidence === NEVER_AUTO_APPLY) {
      problems.push(
        `${key} is low confidence; low-confidence mappings are never applied — fix the evidence and re-audit`,
      );
    }
  }
  if (problems.length > 0) throw new AuditValidationError(problems.map((p) => `  - ${p}`).join("\n"));

  const keys = new Set([
    ...options.keys.map((key) => key.toUpperCase()),
    ...(options.recommended ? recommendedKeys(artifact) : []),
  ]);
  return {
    ...artifact,
    tickets: artifact.tickets.map((ticket) =>
      keys.has(ticket.jira)
        ? {
            ...ticket,
            approved: options.approve,
            ...(options.note && options.approve ? { reviewNote: options.note } : {}),
          }
        : ticket,
    ),
  };
}

export function runApprove(argv: string[], out: (message: string) => void = console.log): void {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      recommended: { type: "boolean" },
      unapprove: { type: "boolean" },
      note: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    out(USAGE);
    return;
  }
  const [file, ...keys] = positionals;
  const recommended = values.recommended === true;
  if (!file || (keys.length === 0 && !recommended)) {
    throw new AuditValidationError(`Expected an audit file and at least one issue key (or --recommended)\n\n${USAGE}`);
  }

  const auditPath = path.resolve(file);
  const artifact = validateAuditArtifact(JSON.parse(fs.readFileSync(auditPath, "utf8")));
  const approve = values.unapprove !== true;
  const targets = uniqueSorted([
    ...keys.map((key) => key.toUpperCase()),
    ...(recommended ? recommendedKeys(artifact) : []),
  ]);
  if (targets.length === 0) {
    out(
      `No ticket has an ADD recommendation in ${displayPath(auditPath)}; nothing to ${approve ? "approve" : "unapprove"}`,
    );
    return;
  }

  const updated = applyApproval(artifact, { keys, approve, note: values.note, recommended });
  validateAuditArtifact(updated);
  fs.writeFileSync(auditPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  out(`${approve ? "Approved" : "Unapproved"} ${targets.join(", ")} in ${displayPath(auditPath)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runApprove(process.argv.slice(2));
  } catch (error) {
    console.error("[ERROR]", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
