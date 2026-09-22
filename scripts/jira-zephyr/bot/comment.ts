/**
 * Renders one audit entry into the Jira comment Bugsby posts.
 *
 * Deliberately a **pure function**: (entry, test-case titles) → text. It makes
 * no network calls and touches no clients, so the same renderer serves the CLI
 * today and a Forge panel or hosted API later — which is the whole reason this
 * lives apart from the posting code in `../clients/jira-comment-client.ts`.
 *
 * Output is Jira wiki markup, not Markdown: Jira's REST v2 comment endpoint
 * renders wiki markup, and its table syntax (`||header||`, `|cell|`) is the one
 * that survives. Markdown tables render as literal pipes in Jira.
 */
import { strongest, weakest, type Confidence } from "../shared/confidence";

import { applyInvitation, BOT_HANDLE, CONFIDENCE_MARKERS, CONFIDENCE_WORDS, greeting, hedge } from "./persona";

import type { AuditEntry, Evidence } from "../shared/types";

/** Longest a rendered title may be before it is cut; keeps the table scannable. */
const MAX_TITLE = 60;

export interface SuggestedLink {
  zephyrId: string;
  /** Test case title from Zephyr; absent when it could not be fetched. */
  title?: string;
  confidence: Confidence;
  /** One short phrase saying why, e.g. "PR #204 changed DataAppShell.tsx". */
  evidence: string;
}

/**
 * Condenses one Zephyr ID's evidence into a single phrase.
 *
 * The audit can attach several evidence items to one ID (a PR *and* a commit,
 * say). A table cell has room for one, so the strongest wins and the rest are
 * summarised as a count — the full detail stays in the audit artifact, which
 * the comment links to rather than reproduces.
 */
export function summarizeEvidence(items: Evidence[]): { confidence: Confidence; evidence: string } {
  if (items.length === 0) return { confidence: "low", evidence: "no direct evidence" };
  const best = strongest(items.map((item) => item.confidence)) ?? "low";
  const leader = items.find((item) => item.confidence === best) ?? items[0];
  const phrase = phraseFor(leader);
  const others = items.length - 1;
  return { confidence: best, evidence: others > 0 ? `${phrase} (+${others} more)` : phrase };
}

/** Turns one evidence item into a short human phrase, by type. */
function phraseFor(item: Evidence): string {
  const file = basename(item.file);
  switch (item.type) {
    case "story-reference":
      return `${item.jira} written in ${file}`;
    case "story-introduced-by-commit":
      return `story added by ${item.commit ?? "a keyed commit"}`;
    case "story-modified-by-commit":
      return `story edited by ${item.commit ?? "a keyed commit"}`;
    case "pr-changed-file":
      return prPhrase(item, file);
    case "file-reference":
      return `${item.jira} referenced in ${file}`;
    case "file-touched-by-commit":
      return `${item.commit ?? "a keyed commit"} touched ${file}`;
    case "existing-coverage-link":
      return "already linked in Zephyr, and the repo agrees";
    case "summary-similarity":
      return `name match only (${file})`;
    case "zephyr-attribution":
      return `already owned by ${file}`;
  }
}

/** PR evidence carries the PR number in `detail`; surfacing it is the useful part. */
function prPhrase(item: Evidence, file: string): string {
  const pr = /PR #(\d+)/.exec(item.detail)?.[1];
  return pr ? `PR #${pr} changed code beside ${file}` : `a PR changed code beside ${file}`;
}

function basename(file: string): string {
  return file.slice(file.lastIndexOf("/") + 1);
}

function truncate(value: string, max = MAX_TITLE): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Jira wiki tables are pipe-delimited, so a literal pipe would break the row. */
function cell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim() || "—";
}

/**
 * Builds the per-ID rows for an entry.
 *
 * Only `missingZephyrIds` are offered: an ID already linked in Zephyr needs no
 * suggestion, and offering it would invite a duplicate COVERAGE link.
 */
export function buildSuggestions(entry: AuditEntry, titles: ReadonlyMap<string, string> = new Map()): SuggestedLink[] {
  return entry.missingZephyrIds.map((zephyrId) => {
    const items = entry.evidence.filter((item) => item.zephyrIds.includes(zephyrId));
    const { confidence, evidence } = summarizeEvidence(items);
    return { zephyrId, title: titles.get(zephyrId), confidence, evidence };
  });
}

export interface CommentOptions {
  /** Link back to the run that produced this, for anyone asking "says who?". */
  auditUrl?: string;
  /** Omits the reply invitation, for a comment posted after applying. */
  invite?: boolean;
}

/**
 * The comment body. Returns null when there is nothing worth saying — Bugsby
 * stays quiet rather than posting "no suggestions", which would be noise on
 * every ticket the audit happens to touch.
 */
export function renderComment(
  entry: AuditEntry,
  titles: ReadonlyMap<string, string> = new Map(),
  options: CommentOptions = {},
): string | null {
  const suggestions = buildSuggestions(entry, titles);
  if (suggestions.length === 0) return null;

  const lowest = weakest(suggestions.map((item) => item.confidence)) ?? "low";
  const lines = [greeting(suggestions.length, entry.jira), "", hedge(lowest), ""];

  // When every row shares one reason — the common case, since a single PR maps
  // to all of a story file's test cases — repeating it down the widest column
  // is pure noise. Say it once and drop the column.
  const reasons = new Set(suggestions.map((item) => item.evidence));
  const shared = reasons.size === 1 ? [...reasons][0] : null;

  if (shared) {
    lines.push(`All of these: ${shared}.`, "");
    lines.push("||Test case||Title||");
    for (const item of suggestions) {
      const marker = CONFIDENCE_MARKERS[item.confidence];
      lines.push(`|${marker} ${item.zephyrId}|${cell(truncate(item.title ?? ""))}|`);
    }
  } else {
    lines.push("||Test case||Title||Why I think so||");
    for (const item of suggestions) {
      const marker = CONFIDENCE_MARKERS[item.confidence];
      const title = cell(truncate(item.title ?? ""));
      lines.push(`|${item.zephyrId}|${title}|${marker} ${cell(item.evidence)}|`);
    }
  }

  lines.push("");
  lines.push(`_${legend(suggestions)}_`);
  if (options.invite !== false) {
    lines.push("");
    lines.push(applyInvitation(suggestions.length));
  }
  if (options.auditUrl) {
    lines.push("");
    lines.push(`_Full evidence: [audit run|${options.auditUrl}]_`);
  }
  return lines.join("\n");
}

/** Legend for only the markers actually used, so it never explains absent symbols. */
function legend(suggestions: SuggestedLink[]): string {
  const used = new Set(suggestions.map((item) => item.confidence));
  const order: Confidence[] = ["exact", "high", "medium", "low"];
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const confidence of order) {
    if (!used.has(confidence)) continue;
    const marker = CONFIDENCE_MARKERS[confidence];
    if (seen.has(marker)) continue;
    seen.add(marker);
    parts.push(`${marker} ${CONFIDENCE_WORDS[confidence]}`);
  }
  return parts.join(" · ");
}

/** Marker shown in a CLI preview, mirroring the comment's own legend. */
export { CONFIDENCE_MARKERS, BOT_HANDLE };
