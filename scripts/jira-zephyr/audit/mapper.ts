/**
 * Mapper: turns the repo index into per-issue evidence, then compares the
 * expected Zephyr IDs with what Zephyr currently links.
 *
 * Evidence is derived in the deterministic order the README documents —
 * explicit source references first, then git history (introduced / modified /
 * touched), then name similarity as a low-confidence fallback. Every Zephyr ID
 * that ends up in `expectedZephyrIds` is backed by at least medium-confidence
 * evidence; low-confidence candidates are surfaced in `evidence` only.
 */
import {
  AUTO_ADD_THRESHOLD,
  combineEvidenceConfidence,
  meetsThreshold,
  strongest,
  weakest,
  type Confidence,
} from "../shared/confidence";
import { uniqueSorted } from "../shared/keys";

import type { CommitInfo, RepoIndex, StoryFileRecord, StoryRecord } from "./repo-scanner";
import type { AuditEntry, Evidence, JiraIssue, RecommendedAction, TicketStatus } from "../shared/types";

export interface EvidenceOptions {
  /** A summary/component-name match spanning more files than this is too generic to report. */
  maxSimilarityFiles?: number;
  /** Story-level evidence from one commit across more files than this is downgraded as a sweep. */
  sweepFileThreshold?: number;
}

const DEFAULT_MAX_SIMILARITY_FILES = 3;
/** A commit with story-level evidence in more files than this is a cross-cutting sweep, not the stories' origin. */
const DEFAULT_SWEEP_FILE_THRESHOLD = 5;
const SHORT_HASH_LENGTH = 7;
const MAX_LISTED_IDS = 10;
/**
 * Lines that carry no authorship signal: the `parameters: { zephyr: { testCaseId } }`
 * block the sync workflow writes, and pure punctuation/bracket lines.
 */
const GENERATED_LINE_RE = /testCaseId|zephyr:|^parameters:\s*\{$|^[{}[\](),;]*$/;
const SUMMARY_STOPWORDS = new Set([
  "about",
  "added",
  "adding",
  "after",
  "also",
  "component",
  "components",
  "correct",
  "default",
  "existing",
  "from",
  "into",
  "issue",
  "issues",
  "kit",
  "make",
  "missing",
  "react",
  "review",
  "should",
  "state",
  "states",
  "storybook",
  "stories",
  "story",
  "support",
  "that",
  "their",
  "them",
  "this",
  "update",
  "using",
  "when",
  "with",
]);

function short(commit: CommitInfo): string {
  return commit.hash.slice(0, SHORT_HASH_LENGTH);
}

function fileZephyrIds(record: StoryFileRecord): string[] {
  return uniqueSorted(record.stories.flatMap((story) => story.zephyrIds));
}

function listIds(ids: string[]): string {
  if (ids.length <= MAX_LISTED_IDS) return ids.join(", ");
  const shown = ids.slice(0, MAX_LISTED_IDS).join(", ");
  return `${shown}, … (${ids.length} total)`;
}

function storyEvidence(
  type: Evidence["type"],
  confidence: Confidence,
  jira: string,
  story: StoryRecord,
  detail: string,
  commit?: CommitInfo,
): Evidence {
  return {
    type,
    confidence,
    jira,
    file: story.file,
    story: story.exportName,
    storyName: story.storyName,
    line: story.declarationLine,
    zephyrIds: [...story.zephyrIds],
    ...(commit ? { commit: short(commit), commitSubject: commit.subject } : {}),
    detail,
  };
}

function sourceReferenceEvidence(index: RepoIndex, jira: string): Evidence[] {
  const evidence: Evidence[] = [];
  for (const record of index.files.values()) {
    let referencedInAStory = false;
    for (const story of record.stories) {
      if (!story.jiraKeys.includes(jira)) continue;
      referencedInAStory = true;
      const where = `${record.file}:${story.declarationLine}`;
      evidence.push(
        storyEvidence(
          "story-reference",
          "exact",
          jira,
          story,
          `${jira} is written in the source of story "${story.storyName}" (${where})`,
        ),
      );
    }
    if (referencedInAStory || !record.fileLevelJiraKeys.includes(jira)) continue;
    const single = record.stories.length === 1;
    evidence.push({
      type: "file-reference",
      confidence: single ? "medium" : "low",
      jira,
      file: record.file,
      zephyrIds: fileZephyrIds(record),
      detail: single
        ? `${jira} is referenced in ${record.file}, which defines a single story`
        : `${jira} is referenced in ${record.file} outside any story; its ${record.stories.length} stories are only candidates`,
    });
  }
  return evidence;
}

function introducedDetail(story: StoryRecord, commit: CommitInfo, createdFile: boolean): string {
  const by = `${short(commit)} (${commit.subject})`;
  return createdFile
    ? `story "${story.storyName}" and its file were both introduced by ${by}`
    : `story "${story.storyName}" was introduced by ${by} in a pre-existing file`;
}

function historyEvidenceForFile(index: RepoIndex, jira: string, record: StoryFileRecord): Evidence[] {
  const evidence: Evidence[] = [];
  const blame = index.blame(record.file);
  const origin = index.originCommit(record.file);
  let storyLevelHit = false;

  for (const story of record.stories) {
    const declaration = blame.get(story.declarationLine);
    if (declaration?.commit.jiraKeys.includes(jira)) {
      const createdFile = origin !== null && origin.hash === declaration.commit.hash;
      evidence.push(
        storyEvidence(
          "story-introduced-by-commit",
          createdFile ? "exact" : "high",
          jira,
          story,
          introducedDetail(story, declaration.commit, createdFile),
          declaration.commit,
        ),
      );
      storyLevelHit = true;
      continue;
    }

    const linesByCommit = new Map<string, { commit: CommitInfo; lines: number }>();
    for (let line = story.startLine; line <= story.endLine; line++) {
      const blamed = blame.get(line);
      const content = blamed?.content.trim() ?? "";
      if (!blamed || content.length === 0 || GENERATED_LINE_RE.test(content)) continue;
      if (!blamed.commit.jiraKeys.includes(jira)) continue;
      const entry = linesByCommit.get(blamed.commit.hash) ?? { commit: blamed.commit, lines: 0 };
      entry.lines += 1;
      linesByCommit.set(blamed.commit.hash, entry);
    }
    for (const { commit, lines } of linesByCommit.values()) {
      const by = `${short(commit)} (${commit.subject})`;
      evidence.push(
        storyEvidence(
          "story-modified-by-commit",
          "medium",
          jira,
          story,
          `${lines} line(s) of story "${story.storyName}" were last changed by ${by}; the story itself predates the ticket`,
          commit,
        ),
      );
      storyLevelHit = true;
    }
  }

  if (!storyLevelHit) {
    const keyed = (index.commitsByFile.get(record.file) ?? []).filter((commit) => commit.jiraKeys.includes(jira));
    for (const commit of keyed) {
      const by = `${short(commit)} (${commit.subject})`;
      evidence.push({
        type: "file-touched-by-commit",
        confidence: "low",
        jira,
        file: record.file,
        zephyrIds: [],
        commit: short(commit),
        commitSubject: commit.subject,
        detail: `${by} touched ${record.file}, but none of its story lines survive in the current blame`,
      });
    }
  }
  return evidence;
}

export function summaryTokens(summary: string): Set<string> {
  const words = summary
    .replace(/\[[^\]]*\]/g, " ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !SUMMARY_STOPWORDS.has(word));
  const tokens = new Set(words);
  for (let i = 0; i + 1 < words.length; i++) tokens.add(`${words[i]}${words[i + 1]}`);
  return tokens;
}

function similarityEvidence(index: RepoIndex, issue: JiraIssue, exclude: Set<string>, maxFiles: number): Evidence[] {
  const tokens = summaryTokens(issue.fields.summary);
  const matches: StoryFileRecord[] = [];
  for (const record of index.files.values()) {
    if (exclude.has(record.file)) continue;
    const component = record.componentName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (component.length >= 4 && tokens.has(component) && fileZephyrIds(record).length > 0) matches.push(record);
  }
  if (matches.length === 0 || matches.length > maxFiles) return [];
  return matches.map((record) => ({
    type: "summary-similarity" as const,
    confidence: "low" as const,
    jira: issue.key,
    file: record.file,
    zephyrIds: fileZephyrIds(record),
    detail: `Jira summary mentions "${record.componentName}"; the ${record.stories.length} stories in ${record.file} are name-similarity candidates only`,
  }));
}

/**
 * A ticket whose commit edits stories in many files (a docs sweep, an a11y pass,
 * a regroup) is not the origin of those stories. Its story-level evidence is
 * kept for the reviewer but downgraded: introduced → medium, modified → low.
 */
function downgradeSweeps(evidence: Evidence[], threshold: number): Evidence[] {
  const filesPerCommit = new Map<string, Set<string>>();
  for (const item of evidence) {
    if (!item.commit || !item.type.startsWith("story-")) continue;
    filesPerCommit.set(item.commit, new Set([...(filesPerCommit.get(item.commit) ?? []), item.file]));
  }
  return evidence.map((item) => {
    const files = item.commit ? (filesPerCommit.get(item.commit)?.size ?? 0) : 0;
    if (files <= threshold || !item.type.startsWith("story-") || item.type === "story-reference") return item;
    const confidence: Confidence = item.type === "story-introduced-by-commit" ? "medium" : "low";
    return {
      ...item,
      confidence,
      detail: `${item.detail} — downgraded: that commit touched stories in ${files} files, so it is a cross-cutting sweep rather than the story's origin`,
    };
  });
}

/** Derives every piece of repo evidence linking `issue` to Zephyr IDs, strongest signals first. */
export function deriveEvidence(index: RepoIndex, issue: JiraIssue, options: EvidenceOptions = {}): Evidence[] {
  const jira = issue.key;
  const evidence = sourceReferenceEvidence(index, jira);

  const touchedFiles = [...(index.filesByJiraKey.get(jira) ?? [])].sort();
  for (const file of touchedFiles) {
    const record = index.files.get(file);
    if (record) evidence.push(...historyEvidenceForFile(index, jira, record));
  }
  const graded = downgradeSweeps(evidence, options.sweepFileThreshold ?? DEFAULT_SWEEP_FILE_THRESHOLD);

  // Name similarity is a fallback only: never add candidates next to real evidence.
  if (graded.some((item) => meetsThreshold(item.confidence, "medium"))) return graded;
  const filesWithEvidence = new Set(graded.map((item) => item.file));
  return [
    ...graded,
    ...similarityEvidence(index, issue, filesWithEvidence, options.maxSimilarityFiles ?? DEFAULT_MAX_SIMILARITY_FILES),
  ];
}

function attributionEvidence(index: RepoIndex, jira: string, zephyrId: string): Evidence | null {
  const story = index.storiesByZephyrId.get(zephyrId)?.[0];
  if (!story) return null;
  const declaration = index.blame(story.file).get(story.declarationLine);
  const commit = declaration?.commit;
  const attributed = commit && commit.jiraKeys.length > 0 ? ` → attributed to ${commit.jiraKeys.join(", ")}` : "";
  const owner = `${zephyrId} belongs to story "${story.storyName}" in ${story.file}`;
  return {
    type: "zephyr-attribution",
    confidence: "low",
    jira,
    file: story.file,
    story: story.exportName,
    storyName: story.storyName,
    line: story.declarationLine,
    zephyrIds: [zephyrId],
    ...(commit ? { commit: short(commit), commitSubject: commit.subject } : {}),
    detail: commit ? `${owner}, introduced by ${short(commit)} (${commit.subject})${attributed}` : owner,
  };
}

export interface EntryInputs {
  issue: JiraIssue;
  evidence: Evidence[];
  existingZephyrIds: string[];
  index: RepoIndex;
  /** Expected-but-missing IDs that Zephyr reports as non-existent (checked by the audit script). */
  missingNotFoundInZephyr?: string[];
}

function idConfidences(evidence: Evidence[]): Map<string, Confidence> {
  const perId = new Map<string, Evidence[]>();
  for (const item of evidence) {
    if (item.type === "zephyr-attribution") continue;
    for (const id of item.zephyrIds) perId.set(id, [...(perId.get(id) ?? []), item]);
  }
  return new Map([...perId].map(([id, items]) => [id, combineEvidenceConfidence(items)]));
}

function awaitingSyncNotes(index: RepoIndex, evidence: Evidence[]): string[] {
  const notes: string[] = [];
  for (const item of evidence) {
    if (!item.story || !item.type.startsWith("story-") || item.zephyrIds.length > 0) continue;
    const story = index.files.get(item.file)?.stories.find((candidate) => candidate.exportName === item.story);
    if (story) {
      notes.push(
        `Story "${story.storyName}" (${story.file}) is attributed to this issue but has no Zephyr ID yet — apply the zephyr_sync label / run sync-storybook-zephyr, then re-audit`,
      );
    }
  }
  return notes;
}

/** Builds the reviewable audit entry for one issue. Pure: no I/O beyond the cached repo index. */
export function buildAuditEntry(inputs: EntryInputs): AuditEntry {
  const { issue, index } = inputs;
  const evidence = [...inputs.evidence];
  const confidences = idConfidences(evidence);

  const expected = uniqueSorted([...confidences].filter(([, c]) => meetsThreshold(c, "medium")).map(([id]) => id));
  const existing = uniqueSorted(inputs.existingZephyrIds);
  const missing = expected.filter((id) => !existing.includes(id));
  const notExpected = existing.filter((id) => !expected.includes(id));
  const unexpected = notExpected.filter((id) => index.storiesByZephyrId.has(id));
  const unmanaged = notExpected.filter((id) => !index.storiesByZephyrId.has(id));
  const lowOnly = uniqueSorted([...confidences].filter(([, c]) => !meetsThreshold(c, "medium")).map(([id]) => id));

  for (const id of unexpected) {
    const attribution = attributionEvidence(index, issue.key, id);
    if (attribution) evidence.push(attribution);
  }

  const confidence: Confidence =
    (missing.length > 0
      ? weakest(missing.map((id) => confidences.get(id) ?? "low"))
      : strongest([...confidences.values()])) ??
    strongest(evidence.map((item) => item.confidence)) ??
    "low";

  const notFound = new Set(inputs.missingNotFoundInZephyr ?? []);
  const notes = awaitingSyncNotes(index, evidence);
  for (const id of notFound) {
    notes.push(
      `${id} is expected by the repo but does not exist in Zephyr — check for a deleted or re-keyed test case`,
    );
  }
  if (unexpected.length > 0) {
    notes.push(
      `Linked in Zephyr but attributed elsewhere by the repo: ${listIds(unexpected)} — this tool never removes links; resolve manually`,
    );
  }
  if (unmanaged.length > 0) {
    notes.push(`Linked in Zephyr but not managed by this repository (manual tests?): ${listIds(unmanaged)}`);
  }
  if (expected.length === 0 && lowOnly.length > 0) {
    notes.push(
      `Only low-confidence candidates were found (${listIds(lowOnly)}); nothing is expected until stronger evidence exists`,
    );
  }

  const hasRepoSignal = evidence.some((item) => item.type !== "zephyr-attribution");
  let status: TicketStatus;
  let recommendedAction: RecommendedAction;
  if (expected.length === 0 && !hasRepoSignal) {
    status = "no-mapping";
    recommendedAction = "review";
    notes.unshift(
      `No story in the repository is attributed to this issue (Jira status: ${issue.fields.status.name}): no Jira-keyed commit introduced or modified a story, and no story source references the key`,
    );
  } else if (missing.length === 0 && unexpected.length === 0 && expected.length > 0) {
    status = "correct";
    recommendedAction = "none";
  } else if (
    missing.length > 0 &&
    unexpected.length === 0 &&
    notFound.size === 0 &&
    meetsThreshold(confidence, AUTO_ADD_THRESHOLD)
  ) {
    status = "needs-changes";
    recommendedAction = "add";
  } else {
    status = "manual-review";
    recommendedAction = "review";
  }

  return {
    jira: issue.key,
    jiraIssueId: issue.id,
    summary: issue.fields.summary,
    issueType: issue.fields.issuetype.name,
    issueStatus: issue.fields.status.name,
    existingZephyrIdsAtAudit: existing,
    expectedZephyrIds: expected,
    missingZephyrIds: missing,
    unexpectedZephyrIds: unexpected,
    unmanagedZephyrIds: unmanaged,
    confidence,
    recommendedAction,
    status,
    approved: false,
    evidence,
    notes,
  };
}

export interface AuditSummary {
  ticketsScanned: number;
  correct: number;
  needsChanges: number;
  manualReview: number;
  noMapping: number;
}

export function summarize(tickets: AuditEntry[]): AuditSummary {
  return {
    ticketsScanned: tickets.length,
    correct: tickets.filter((ticket) => ticket.status === "correct").length,
    needsChanges: tickets.filter((ticket) => ticket.status === "needs-changes").length,
    manualReview: tickets.filter((ticket) => ticket.status === "manual-review").length,
    noMapping: tickets.filter((ticket) => ticket.status === "no-mapping").length,
  };
}
