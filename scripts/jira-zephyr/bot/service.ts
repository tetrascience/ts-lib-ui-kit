/**
 * The bot's transport-free core: what to post, and what a reply should do.
 *
 * Everything here takes injected clients and returns plain data. That is the
 * point — this is the surface a Forge app or hosted API calls later, with the
 * CLI in `bot.ts` being just one caller. Nothing in this module reads
 * `process.argv`, prints, or touches the filesystem.
 *
 * Two operations:
 *   notify(artifact) — post Bugsby's suggestion comment on each entry
 *   respond(artifact) — read replies, apply what they ask for, answer
 *
 * Both are idempotent by design: `notify` skips issues Bugsby has already
 * commented on, and `respond` skips replies it has already answered. Re-running
 * is the expected mode of operation (a cron job), not an edge case.
 */
import { parseMinConfidence } from "../apply/validator";
import { runApply, type ApplyClients } from "../apply/writer";

import { renderComment, buildSuggestions } from "./comment";
import { appliedMessage, BOT_HANDLE, refusedMessage } from "./persona";
import { parseReply, resolveRequest } from "./reply";

import type { JiraComment, JiraCommentClient } from "../clients/jira-comment-client";
import type { ZephyrClient } from "../clients/zephyr-client";
import type { ApplyResult, AuditArtifact, AuditEntry, Confidence } from "../shared/types";

/** Marks Bugsby's own comments so they are never mistaken for a human reply. */
export const BOT_SIGNATURE = "<!-- zephyr-bot:bugsby -->";
/** Appended to an answer so a re-run does not answer the same reply twice. */
export const ANSWER_PREFIX = "<!-- zephyr-bot:answered ";

export type CommentReader = Pick<JiraCommentClient, "getComments" | "addComment" | "readOnly">;
export type TitleReader = Pick<ZephyrClient, "getTestCase">;

export interface BotDeps {
  comments: CommentReader;
  zephyr?: TitleReader;
  apply?: ApplyClients;
  log?: (message: string) => void;
}

export interface NotifyOptions {
  execute: boolean;
  /** Post again even if Bugsby already commented. */
  force?: boolean;
  auditUrl?: string;
  only?: string[];
}

export type NotifyOutcome = "posted" | "would-post" | "already-commented" | "nothing-to-say" | "error";

export interface NotifyResult {
  jira: string;
  outcome: NotifyOutcome;
  suggested: string[];
  body?: string;
  detail?: string;
}

function isBotComment(comment: JiraComment): boolean {
  return comment.body.includes(BOT_SIGNATURE);
}

function sign(body: string): string {
  return `${body}\n\n${BOT_SIGNATURE}`;
}

/** Test case titles for one entry's missing IDs; failures degrade to no title. */
async function titlesFor(entry: AuditEntry, zephyr?: TitleReader): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  if (!zephyr) return titles;
  for (const id of entry.missingZephyrIds) {
    try {
      const testCase = await zephyr.getTestCase(id);
      if (testCase?.name) titles.set(id, testCase.name);
    } catch {
      // A title is decoration; never fail a comment over one.
    }
  }
  return titles;
}

/** Posts Bugsby's suggestions for every entry that has any. */
export async function notify(artifact: AuditArtifact, deps: BotDeps, options: NotifyOptions): Promise<NotifyResult[]> {
  const only = options.only?.map((key) => key.toUpperCase());
  const results: NotifyResult[] = [];

  for (const entry of artifact.tickets) {
    if (only && !only.includes(entry.jira)) continue;
    if (entry.missingZephyrIds.length === 0) {
      results.push({ jira: entry.jira, outcome: "nothing-to-say", suggested: [] });
      continue;
    }
    try {
      if (!options.force) {
        const existing = await deps.comments.getComments(entry.jira);
        if (existing.some(isBotComment)) {
          results.push({
            jira: entry.jira,
            outcome: "already-commented",
            suggested: entry.missingZephyrIds,
            detail: "Bugsby has already commented; pass --force to post again",
          });
          continue;
        }
      }

      const body = renderComment(entry, await titlesFor(entry, deps.zephyr), { auditUrl: options.auditUrl });
      if (!body) {
        results.push({ jira: entry.jira, outcome: "nothing-to-say", suggested: [] });
        continue;
      }
      if (!options.execute) {
        results.push({ jira: entry.jira, outcome: "would-post", suggested: entry.missingZephyrIds, body });
        continue;
      }
      await deps.comments.addComment(entry.jira, sign(body));
      results.push({ jira: entry.jira, outcome: "posted", suggested: entry.missingZephyrIds, body });
      deps.log?.(`  ${entry.jira.padEnd(9)} posted (${entry.missingZephyrIds.length} suggestion(s))`);
    } catch (error) {
      results.push({
        jira: entry.jira,
        outcome: "error",
        suggested: entry.missingZephyrIds,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

export interface RespondOptions {
  execute: boolean;
  minConfidence?: string;
  only?: string[];
}

export type RespondOutcome = "applied" | "would-apply" | "no-request" | "rejected" | "error";

export interface RespondResult {
  jira: string;
  outcome: RespondOutcome;
  requested: string[];
  applied: ApplyResult[];
  detail?: string;
}

/** True when Bugsby has already answered the reply at `commentId`. */
function alreadyAnswered(comments: JiraComment[], commentId: string): boolean {
  return comments.some((comment) => isBotComment(comment) && comment.body.includes(`${ANSWER_PREFIX}${commentId} `));
}

/**
 * Reads each issue's comments, finds the newest unanswered `@bugsby apply`, and
 * applies exactly what it asks for.
 *
 * Applying goes through `runApply`, never a direct Zephyr write, so every
 * protection the CLI has — approval gate, confidence threshold, frozen scope,
 * stale-state refusal — applies identically here. A reply cannot bypass them.
 */
export async function respond(
  artifact: AuditArtifact,
  deps: BotDeps,
  options: RespondOptions,
): Promise<RespondResult[]> {
  const only = options.only?.map((key) => key.toUpperCase());
  const minConfidence: Confidence = parseMinConfidence(options.minConfidence);
  const results: RespondResult[] = [];

  for (const entry of artifact.tickets) {
    if (only && !only.includes(entry.jira)) continue;
    try {
      const comments = await deps.comments.getComments(entry.jira);
      // Newest first: a later instruction supersedes an earlier one.
      const request = [...comments]
        .reverse()
        .find((comment) => !isBotComment(comment) && parseReply(comment.body).kind === "apply");
      if (!request || alreadyAnswered(comments, request.id)) {
        results.push({ jira: entry.jira, outcome: "no-request", requested: [], applied: [] });
        continue;
      }

      const suggested = buildSuggestions(entry).map((item) => item.zephyrId);
      const { ids, rejected } = resolveRequest(parseReply(request.body), suggested);
      if (ids.length === 0) {
        const reason =
          rejected.length > 0
            ? `${rejected.join(", ")} ${rejected.length === 1 ? "was" : "were"} not among my suggestions for ${entry.jira}`
            : "there is nothing left to link";
        if (options.execute) {
          await deps.comments.addComment(entry.jira, answer(refusedMessage(reason), request.id));
        }
        results.push({ jira: entry.jira, outcome: "rejected", requested: rejected, applied: [], detail: reason });
        continue;
      }

      if (!deps.apply) throw new Error("respond() needs apply clients to link test cases");
      // `approved` gates runApply; a human reply IS the approval, recorded here
      // rather than mutating the stored artifact.
      const scoped: AuditArtifact = {
        ...artifact,
        scopeSnapshot: { ...artifact.scopeSnapshot, issueKeys: [entry.jira] },
        tickets: [{ ...entry, approved: true, missingZephyrIds: ids }],
      };
      const applied = await runApply(scoped, deps.apply, {
        execute: options.execute,
        minConfidence,
        only: [entry.jira],
      });

      if (options.execute) {
        const added = applied.flatMap((result) => result.added);
        const failed = applied.filter((result) => result.outcome === "error" || result.outcome === "stale");
        const message =
          failed.length > 0 ? refusedMessage(failed.map((result) => result.detail).join("; ")) : appliedMessage(added);
        await deps.comments.addComment(entry.jira, answer(message, request.id));
      }
      results.push({
        jira: entry.jira,
        outcome: options.execute ? "applied" : "would-apply",
        requested: ids,
        applied,
      });
    } catch (error) {
      results.push({
        jira: entry.jira,
        outcome: "error",
        requested: [],
        applied: [],
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

/** Bot answer carrying the id of the reply it answers, so re-runs stay idempotent. */
function answer(body: string, replyToCommentId: string): string {
  return `${body}\n\n${BOT_SIGNATURE}\n${ANSWER_PREFIX}${replyToCommentId} -->`;
}

export { BOT_HANDLE };
