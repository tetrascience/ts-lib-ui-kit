/**
 * Parses replies addressed to the bot: `@bugsby apply [SW-T1 SW-T2 …]`.
 *
 * This is the trust boundary. Anyone who can comment on a Jira issue can ask
 * Bugsby to write to Zephyr, so the parser is deliberately strict — it is far
 * easier to loosen a narrow rule later than to recall links written from a
 * sloppy match.
 *
 * Rules:
 *  - The mention must start the comment (after optional whitespace/quoting), so
 *    a passing reference — "@bugsby apply looks wrong to me" — is not a command.
 *  - Only `apply` exists. An unknown verb is reported, never guessed at.
 *  - Explicit IDs are a *filter* over what Bugsby already suggested; an ID that
 *    was never suggested is rejected rather than linked. This keeps the reply
 *    path from becoming a way to attach arbitrary test cases.
 */
import { uniqueSorted } from "../shared/keys";

import { BOT_HANDLE } from "./persona";

/** `@bugsby` or `[~bugsby]` (Jira's own mention markup), at the start, then a verb. */
const COMMAND_RE = new RegExp(
  String.raw`^\s*(?:>[^\n]*\n\s*)*(?:@|\[~)(?:accountid:[^\]]+\]\s*)?${BOT_HANDLE}\]?\s+(\w+)([\s\S]*)$`,
  "i",
);
const ZEPHYR_ID_RE = /\b([A-Z][A-Z0-9_]+-T\d+)\b/gi;

export type ReplyCommand =
  | { kind: "none" }
  | { kind: "unknown"; verb: string }
  | { kind: "apply"; ids: string[] | "all" };

/**
 * Reads a comment body. `{ kind: "none" }` means "not addressed to Bugsby" —
 * the overwhelmingly common case, and never an error.
 */
export function parseReply(body: string): ReplyCommand {
  const match = COMMAND_RE.exec(body ?? "");
  if (!match) return { kind: "none" };

  const verb = match[1].toLowerCase();
  if (verb !== "apply") return { kind: "unknown", verb };

  const ids = uniqueSorted([...(match[2] ?? "").matchAll(ZEPHYR_ID_RE)].map((found) => found[1].toUpperCase()));
  return { kind: "apply", ids: ids.length > 0 ? ids : "all" };
}

export interface ResolvedRequest {
  /** IDs to link: always a subset of what Bugsby suggested. */
  ids: string[];
  /** IDs the reply named that Bugsby never suggested; reported, never applied. */
  rejected: string[];
}

/**
 * Intersects a reply with the suggestions Bugsby actually made.
 *
 * `suggested` comes from the audit artifact's `missingZephyrIds`, so an operator
 * cannot use a reply to link a test case the audit never proposed — the reply
 * chooses among suggestions, it does not author new ones.
 */
export function resolveRequest(command: ReplyCommand, suggested: readonly string[]): ResolvedRequest {
  if (command.kind !== "apply") return { ids: [], rejected: [] };
  if (command.ids === "all") return { ids: [...suggested], rejected: [] };
  const known = new Set(suggested.map((id) => id.toUpperCase()));
  const ids = command.ids.filter((id) => known.has(id));
  const rejected = command.ids.filter((id) => !known.has(id));
  return { ids, rejected };
}
