/**
 * Cap'n Bugsby — a weathered, faintly piratical bug-hunter who has charted these
 * waters before and would rather not do it again.
 *
 * Kept in its own module, free of Jira and Zephyr types, for two reasons: the
 * tone is the thing most likely to be tweaked without touching logic, and the
 * renderer must stay a pure function of (entry → text) so a future Forge UI can
 * reuse it verbatim.
 *
 * Tone rules, in priority order:
 *  1. Never claim certainty the evidence does not support. Bugsby grouses, but
 *     he does not overstate — the grumbling is about the *voyage*, never a way
 *     of sounding surer than the data allows.
 *  2. Grumble about the search, never at the reader. "I've been through the
 *     whole log" is funny; "nobody bothered to link these" is an accusation
 *     aimed at whoever opens the ticket. A bot that needles its colleagues gets
 *     muted, and then the coverage gap goes unread. This is the line that
 *     matters most: the humour has to cost the reader nothing.
 *  3. Be short, and land the joke in the first clause or not at all. This shows
 *     up on a ticket someone reads every day; a bit does not survive the
 *     fiftieth reading, but a wry aside does.
 *  4. The findings themselves are never played for laughs. Bugsby is theatrical
 *     about the *chore*; he is straight-faced about the evidence.
 *  5. Pirate seasoning, not a pirate accent — at most one nautical turn of
 *     phrase per message. "Ahoy me hearties, arrr" on every ticket is unreadable
 *     by the tenth one and buries the test case IDs someone came here to read.
 *     Never phonetic spelling in a line carrying real information.
 *  6. No emoji outside the confidence markers, which carry meaning (see
 *     CONFIDENCE_MARKERS) rather than decorate.
 */
import type { Confidence } from "../shared/confidence";

export const BOT_NAME = "Cap'n Bugsby";
export const BOT_HANDLE = "bugsby";
export const BOT_EMOJI = "🏴‍☠️";

/**
 * Confidence → marker. These are the only emoji in the body, and they are a
 * legend-backed scale rather than decoration: a reviewer should be able to scan
 * the column and know what needs a second look.
 */
export const CONFIDENCE_MARKERS: Record<Confidence, string> = {
  exact: "🟢",
  high: "🟢",
  medium: "🟡",
  low: "⚪",
};

export const CONFIDENCE_WORDS: Record<Confidence, string> = {
  exact: "certain",
  high: "confident",
  medium: "fairly sure",
  low: "guessing",
};

/** Opening line. `count` is how many links Bugsby is suggesting. */
export function greeting(count: number, jiraKey: string): string {
  if (count === 1) {
    return `${BOT_EMOJI} ${BOT_NAME} here. Sailed the whole commit history for this one — ${jiraKey} looks to be missing a test case link.`;
  }
  return `${BOT_EMOJI} ${BOT_NAME} here. Sailed the whole commit history so you don't have to — ${jiraKey} looks to be missing ${count} test case links.`;
}

/**
 * The hedge, scaled to the weakest evidence on offer — Bugsby should sound less
 * sure when the evidence is thinner, rather than uniformly salty. The grousing
 * is constant; the confidence is not.
 */
export function hedge(weakest: Confidence): string {
  switch (weakest) {
    case "exact":
    case "high":
      return "Clear sailing on this one — the commits spell it out. Still worth your eyes before it's official.";
    case "medium":
      return "I charted these from the files the PR touched. Reasonable, but it isn't proof — give them a look.";
    case "low":
      return "Honest warning: some of these are dead reckoning. Please check before you accept them.";
  }
}

export function applyInvitation(count: number): string {
  const what = count === 1 ? "it" : `all ${count}`;
  return `Reply \`@${BOT_HANDLE} apply\` and I'll link ${what}. Reply \`@${BOT_HANDLE} apply SW-T123 SW-T456\` to take only some. If I've steered you wrong, ignore this — no hard feelings.`;
}

/** Closing line after a successful apply. */
export function appliedMessage(added: string[]): string {
  if (added.length === 0) return `${BOT_EMOJI} All linked already. Saves me the trouble.`;
  const what = added.length === 1 ? "1 test case" : `${added.length} test cases`;
  return `${BOT_EMOJI} Done — linked ${what}: ${added.join(", ")}. Back to port.`;
}

/** Closing line when apply could not proceed. */
export function refusedMessage(reason: string): string {
  return `${BOT_EMOJI} Couldn't do that one: ${reason}`;
}
