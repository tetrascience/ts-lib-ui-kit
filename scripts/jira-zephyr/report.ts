#!/usr/bin/env tsx
/**
 * Renders an audit artifact — and optionally the apply result written against
 * it — as Markdown: the GitHub Actions job summary, or something to paste into
 * a PR. It can also write a redacted copy of the audit (Jira titles blanked)
 * that is safe to upload from this public repository.
 *
 *   yarn jira-zephyr:report artifacts/zephyr-audit-epic-SW-2301.json                        # Markdown to stdout
 *   yarn jira-zephyr:report <audit.json> --apply <apply.json> --github-summary --run-id 123  # append to $GITHUB_STEP_SUMMARY
 *   yarn jira-zephyr:report <audit.json> --redacted-copy artifacts/upload/zephyr-audit.json
 *
 * Needs no credentials and makes no network call.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { AuditValidationError, validateAuditArtifact } from "./apply/validator";
import { parseApplyArtifact } from "./shared/audit-schema";
import { renderRunMarkdown } from "./shared/markdown";
import { displayPath } from "./shared/paths";
import { redactArtifact } from "./shared/redact";

export const USAGE = `Usage:
  yarn jira-zephyr:report <audit.json> [--apply <apply.json>] [--out <file> | --github-summary]
                          [--run-id <id>] [--with-summaries] [--redacted-copy <file>]

Options:
  --apply <file>          Include the apply result written by yarn jira-zephyr:apply for this audit
  --out <file>            Write the Markdown to a file instead of stdout
  --github-summary        Append the Markdown to $GITHUB_STEP_SUMMARY (GitHub Actions job summary)
  --run-id <id>           GitHub Actions run id that uploads this audit — enables the "how to apply" next steps
  --with-summaries        Include Jira ticket titles (never in a public job summary)
  --redacted-copy <file>  Also write a copy of the audit with Jira titles blanked (safe to upload)
  -h, --help              Show this help`;

export interface ReportDeps {
  env?: NodeJS.ProcessEnv;
  out?: (message: string) => void;
  log?: (message: string) => void;
}

export function runReport(argv: string[], deps: ReportDeps = {}): { markdown: string } | null {
  const env = deps.env ?? process.env;
  const out = deps.out ?? ((message: string) => console.log(message));
  const log = deps.log ?? ((message: string) => console.error(message));

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      apply: { type: "string" },
      out: { type: "string" },
      "github-summary": { type: "boolean" },
      "run-id": { type: "string" },
      "with-summaries": { type: "boolean" },
      "redacted-copy": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    out(USAGE);
    return null;
  }
  if (positionals.length !== 1) throw new AuditValidationError(`Expected exactly one audit artifact path\n\n${USAGE}`);
  if (values.out && values["github-summary"]) {
    throw new AuditValidationError("--out and --github-summary are mutually exclusive");
  }
  if (values["with-summaries"] && values["github-summary"]) {
    throw new AuditValidationError(
      "--with-summaries cannot be combined with --github-summary: the job summary of this public repository must not carry Jira titles",
    );
  }

  const auditPath = path.resolve(positionals[0]);
  const audit = validateAuditArtifact(JSON.parse(fs.readFileSync(auditPath, "utf8")));
  const apply = values.apply
    ? parseApplyArtifact(JSON.parse(fs.readFileSync(path.resolve(values.apply), "utf8")))
    : undefined;
  if (apply && apply.auditGeneratedAt !== audit.generatedAt) {
    throw new AuditValidationError(
      `The apply result was produced against a different audit (generated ${apply.auditGeneratedAt}, this audit ${audit.generatedAt})`,
    );
  }

  const markdown = renderRunMarkdown(audit, apply, {
    includeSummaries: values["with-summaries"] === true,
    runId: values["run-id"]?.trim() || undefined,
  });

  if (values["github-summary"]) {
    const target = env.GITHUB_STEP_SUMMARY?.trim();
    if (!target)
      throw new AuditValidationError("--github-summary requires $GITHUB_STEP_SUMMARY (set by GitHub Actions)");
    fs.appendFileSync(target, `${markdown}\n`, "utf8");
    log(`[INFO] Report appended to the job summary (${target})`);
  } else if (values.out) {
    const target = path.resolve(values.out);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${markdown}\n`, "utf8");
    log(`[INFO] Report written to ${displayPath(target)}`);
  } else {
    out(markdown);
  }

  if (values["redacted-copy"]) {
    const target = path.resolve(values["redacted-copy"]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(redactArtifact(audit), null, 2)}\n`, "utf8");
    log(`[INFO] Redacted copy (Jira titles blanked) written to ${displayPath(target)}`);
  }
  return { markdown };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runReport(process.argv.slice(2));
  } catch (error) {
    console.error("[ERROR]", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
