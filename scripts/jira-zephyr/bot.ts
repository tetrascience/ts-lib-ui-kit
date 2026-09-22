#!/usr/bin/env tsx
/**
 * Cap'n Bugsby — the Jira coverage bot (CLI front end).
 *
 *   yarn jira-zephyr:bot notify  artifacts/zephyr-audit-epic-SW-2301.json
 *   yarn jira-zephyr:bot notify  <artifact> --execute
 *   yarn jira-zephyr:bot respond <artifact> --execute
 *
 * This file is only argument parsing, client construction and printing: all the
 * behaviour lives in `bot/service.ts`, which takes injected clients and returns
 * data. That split is deliberate — the service is what a Forge app or hosted
 * API will call, and it must never depend on a CLI being present.
 *
 * Dry run is the default for both verbs; `--execute` is required to write.
 *
 * Environment: JIRA_EMAIL + JIRA_API_TOKEN (JIRA_BASE_URL optional),
 *              ZEPHYR_TOKEN for applying and for test-case titles.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { validateAuditArtifact } from "./apply/validator";
import { BOT_HANDLE, BOT_NAME } from "./bot/persona";
import { notify, respond, type NotifyResult, type RespondResult } from "./bot/service";
import { jiraEnv, resolveProjectKey, zephyrEnv } from "./clients/env";
import { JiraClient } from "./clients/jira-client";
import { JiraCommentClient } from "./clients/jira-comment-client";
import { createZephyrTransport, ZephyrClient } from "./clients/zephyr-client";
import { displayPath } from "./shared/paths";

export const USAGE = `Usage:
  yarn jira-zephyr:bot notify  <audit.json> [--execute]
  yarn jira-zephyr:bot respond <audit.json> [--execute]

Verbs:
  notify    Post ${BOT_NAME}'s suggested Zephyr links as a comment on each issue
  respond   Read "@${BOT_HANDLE} apply" replies and link what they ask for

Options:
  --execute            Actually write to Jira/Zephyr (default: dry run)
  --only <KEYS>        Comma-separated issue keys to limit to
  --force              notify: comment again even if ${BOT_NAME} already has
  --audit-url <URL>    Link to the run that produced the artifact
  --min-confidence <l> respond: lowest confidence to apply (default: high)
  -h, --help           Show this help

Both verbs are dry-run by default and print exactly what they would do.`;

interface CliDeps {
  cwd?: string;
  out?: (message: string) => void;
  log?: (message: string) => void;
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderNotify(results: NotifyResult[], execute: boolean): string {
  const lines: string[] = [`${BOT_NAME} — notify${execute ? "" : " (dry run)"}`, ""];
  for (const result of results) {
    if (result.outcome === "nothing-to-say") continue;
    lines.push(`${result.jira.padEnd(9)} ${result.outcome.padEnd(18)} ${result.suggested.length} suggestion(s)`);
    if (result.detail) lines.push(`${" ".repeat(10)}${result.detail}`);
    // A dry run is only useful if the operator can read what would be posted.
    if (!execute && result.body) {
      lines.push(
        "",
        result.body
          .split("\n")
          .map((line) => `    │ ${line}`)
          .join("\n"),
        "",
      );
    }
  }
  const posted = results.filter((result) => result.outcome === (execute ? "posted" : "would-post")).length;
  const skipped = results.filter((result) => result.outcome === "already-commented").length;
  const errors = results.filter((result) => result.outcome === "error").length;
  lines.push(
    "",
    `Summary: ${posted} ${execute ? "posted" : "would post"}, ${skipped} already commented, ${errors} error(s)`,
  );
  if (!execute && posted > 0) lines.push("Add --execute to post these comments.");
  return lines.join("\n");
}

function renderRespond(results: RespondResult[], execute: boolean): string {
  const lines: string[] = [`${BOT_NAME} — respond${execute ? "" : " (dry run)"}`, ""];
  for (const result of results) {
    if (result.outcome === "no-request") continue;
    lines.push(`${result.jira.padEnd(9)} ${result.outcome.padEnd(12)} ${result.requested.join(", ") || "—"}`);
    if (result.detail) lines.push(`${" ".repeat(10)}${result.detail}`);
    for (const applied of result.applied) {
      lines.push(`${" ".repeat(10)}${applied.outcome}: ${applied.detail}`);
    }
  }
  const acted = results.filter((result) => result.outcome === "applied" || result.outcome === "would-apply").length;
  const rejected = results.filter((result) => result.outcome === "rejected").length;
  const errors = results.filter((result) => result.outcome === "error").length;
  lines.push("", `Summary: ${acted} ${execute ? "applied" : "would apply"}, ${rejected} rejected, ${errors} error(s)`);
  if (!execute && acted > 0) lines.push("Add --execute to apply these links.");
  return lines.join("\n");
}

export async function runBot(argv: string[], deps: CliDeps = {}): Promise<number> {
  const out = deps.out ?? ((message: string) => console.log(message));
  const log = deps.log ?? ((message: string) => console.error(message));
  const cwd = deps.cwd ?? process.cwd();

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      execute: { type: "boolean" },
      only: { type: "string" },
      force: { type: "boolean" },
      "audit-url": { type: "string" },
      "min-confidence": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help || positionals.length === 0) {
    out(USAGE);
    return 0;
  }

  const [verb, artifactArg] = positionals;
  if (verb !== "notify" && verb !== "respond") {
    log(`[ERROR] Unknown verb "${verb}"\n\n${USAGE}`);
    return 1;
  }
  if (!artifactArg) {
    log(`[ERROR] ${verb} needs an audit artifact path\n\n${USAGE}`);
    return 1;
  }

  const artifactPath = path.resolve(cwd, artifactArg);
  const artifact = validateAuditArtifact(JSON.parse(fs.readFileSync(artifactPath, "utf8")));
  log(`[INFO] Artifact: ${displayPath(artifactPath, cwd)} (${artifact.tickets.length} ticket(s))`);

  const execute = values.execute === true;
  const jiraConfig = jiraEnv();
  const comments = new JiraCommentClient({ ...jiraConfig, readOnly: !execute });

  const projectKey = resolveProjectKey();
  const { transport } = await createZephyrTransport({ ...zephyrEnv(), projectKey });
  // Titles are read-only; applying needs a writable client, so respond --execute
  // gets one and every other path keeps the read-only guarantee.
  const needsWrite = verb === "respond" && execute;
  const zephyr = new ZephyrClient(transport, { readOnly: !needsWrite });

  if (verb === "notify") {
    const results = await notify(
      artifact,
      { comments, zephyr, log },
      {
        execute,
        force: values.force === true,
        auditUrl: values["audit-url"],
        only: values.only ? splitList(values.only) : undefined,
      },
    );
    out(renderNotify(results, execute));
    return results.some((result) => result.outcome === "error") ? 1 : 0;
  }

  const results = await respond(
    artifact,
    { comments, zephyr, apply: { jira: new JiraClient(jiraConfig), zephyr }, log },
    {
      execute,
      minConfidence: values["min-confidence"],
      only: values.only ? splitList(values.only) : undefined,
    },
  );
  out(renderRespond(results, execute));
  return results.some((result) => result.outcome === "error") ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runBot(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error("[ERROR]", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
