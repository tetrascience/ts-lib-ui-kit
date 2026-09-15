/**
 * Confidence model for a repo-derived Jira → Zephyr mapping.
 *
 * Levels (weakest → strongest): low, medium, high, exact. The meaning is fixed
 * here so that the audit (which assigns) and the apply script (which gates on
 * `--min-confidence`) can never disagree about ordering.
 *
 *   exact  — direct, deterministic repository evidence: the Jira key is written
 *            in the story's own source, or the story export AND its file were
 *            both introduced by a commit keyed to the issue.
 *   high   — the story export was introduced by a commit keyed to the issue
 *            (file pre-existed), or two independent medium signals agree.
 *   medium — indirect: a keyed commit modified lines inside the story, or the
 *            key is referenced at file level in a single-story file.
 *   low    — weak or ambiguous: file-level reference in a multi-story file,
 *            a keyed commit touched the file without surviving story lines, or
 *            summary/component-name similarity. Never auto-applied.
 */

export const CONFIDENCE_LEVELS = ["low", "medium", "high", "exact"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const EVIDENCE_TYPES = [
  "story-reference",
  "story-introduced-by-commit",
  "story-modified-by-commit",
  "file-reference",
  "file-touched-by-commit",
  "summary-similarity",
  "zephyr-attribution",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** Confidence that never becomes an automatic recommendation, whatever the threshold. */
export const NEVER_AUTO_APPLY: Confidence = "low";

/** Minimum confidence at which the audit recommends `add` on its own. */
export const AUTO_ADD_THRESHOLD: Confidence = "high";

export function confidenceRank(confidence: Confidence): number {
  return CONFIDENCE_LEVELS.indexOf(confidence);
}

export function isConfidence(value: string): value is Confidence {
  return (CONFIDENCE_LEVELS as readonly string[]).includes(value);
}

export function meetsThreshold(confidence: Confidence, minimum: Confidence): boolean {
  return confidenceRank(confidence) >= confidenceRank(minimum);
}

export function strongest(confidences: Iterable<Confidence>): Confidence | undefined {
  let best: Confidence | undefined;
  for (const c of confidences) {
    if (best === undefined || confidenceRank(c) > confidenceRank(best)) best = c;
  }
  return best;
}

export function weakest(confidences: Iterable<Confidence>): Confidence | undefined {
  let worst: Confidence | undefined;
  for (const c of confidences) {
    if (worst === undefined || confidenceRank(c) < confidenceRank(worst)) worst = c;
  }
  return worst;
}

/**
 * Combines the confidences of every evidence item that supports one Zephyr ID.
 * The best single signal wins, except that two *different* medium-strength
 * signals corroborating each other are promoted to high.
 */
export function combineEvidenceConfidence(
  items: ReadonlyArray<{ type: EvidenceType; confidence: Confidence }>,
): Confidence {
  const best = strongest(items.map((item) => item.confidence)) ?? "low";
  if (best !== "medium") return best;
  const mediumTypes = new Set(items.filter((item) => item.confidence === "medium").map((item) => item.type));
  return mediumTypes.size >= 2 ? "high" : "medium";
}
