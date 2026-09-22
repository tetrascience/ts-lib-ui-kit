/** Shared builders for the jira-zephyr unit tests. Not a test file itself. */
import { summarize } from "../audit/mapper";
import { extractJiraKeys } from "../shared/keys";

import type { BlameLine, CommitInfo, RepoIndex, StoryFileRecord, StoryRecord } from "../audit/repo-scanner";
import type { AuditArtifact, AuditEntry, JiraIssue } from "../shared/types";

const PROJECT_KEYS = new Set(["SW"]);

export function makeIssue(key: string, overrides: Partial<JiraIssue["fields"]> & { id?: string } = {}): JiraIssue {
  const { id, ...fields } = overrides;
  return {
    id: id ?? String(1000 + Number(key.split("-")[1])),
    key,
    fields: {
      summary: `Summary for ${key}`,
      issuetype: { name: "Story", subtask: false, hierarchyLevel: 0 },
      // Default to an audited status so tests about *other* things are not
      // silently filtered out by the workflow-status filter; tests that care
      // about that filter override it explicitly.
      status: { name: "Closed" },
      fixVersions: [],
      ...fields,
    },
  };
}

export function makeCommit(hash: string, subject: string, jiraKeys: string[] = []): CommitInfo {
  return { hash: hash.padEnd(40, "0"), subject, jiraKeys };
}

export function makeStory(file: string, exportName: string, overrides: Partial<StoryRecord> = {}): StoryRecord {
  const declarationLine = overrides.declarationLine ?? 10;
  const text = overrides.text ?? `export const ${exportName}: Story = {};`;
  return {
    file,
    exportName,
    storyName: exportName,
    declarationLine,
    startLine: declarationLine,
    endLine: declarationLine + 5,
    zephyrIds: [],
    hasEmptyZephyrId: false,
    text,
    jiraKeys: extractJiraKeys(text, PROJECT_KEYS),
    ...overrides,
  };
}

export function makeFile(
  file: string,
  stories: StoryRecord[],
  overrides: Partial<StoryFileRecord> = {},
): StoryFileRecord {
  const fullText = overrides.fullText ?? stories.map((story) => story.text).join("\n\n");
  const storyKeys = new Set(stories.flatMap((story) => story.jiraKeys));
  return {
    file,
    componentName: overrides.componentName ?? file.split("/").pop()!.replace(".stories.tsx", ""),
    stories,
    fullText,
    fileLevelJiraKeys: extractJiraKeys(fullText, PROJECT_KEYS).filter((key) => !storyKeys.has(key)),
  };
}

/** Blames every line of `story` to `commit` (a story that was introduced whole by one commit). */
export function blameStory(story: StoryRecord, commit: CommitInfo, content = "code"): Map<number, BlameLine> {
  const lines = new Map<number, BlameLine>();
  for (let line = story.startLine; line <= story.endLine; line++) lines.set(line, { commit, content });
  return lines;
}

export function mergeBlame(...maps: Array<Map<number, BlameLine>>): Map<number, BlameLine> {
  const merged = new Map<number, BlameLine>();
  for (const map of maps) for (const [line, blame] of map) merged.set(line, blame);
  return merged;
}

export interface IndexOptions {
  commits?: Record<string, CommitInfo[]>;
  blame?: Record<string, Map<number, BlameLine>>;
  origin?: Record<string, CommitInfo | null>;
  projectKeys?: string[];
  /** Every file each key's commits touched; defaults to the story files alone. */
  allFiles?: Record<string, string[]>;
}

export function makeIndex(files: StoryFileRecord[], options: IndexOptions = {}): RepoIndex {
  const fileMap = new Map(files.map((record) => [record.file, record]));
  const storiesByZephyrId = new Map<string, StoryRecord[]>();
  for (const record of files) {
    for (const story of record.stories) {
      for (const id of story.zephyrIds) storiesByZephyrId.set(id, [...(storiesByZephyrId.get(id) ?? []), story]);
    }
  }
  const commitsByFile = new Map(Object.entries(options.commits ?? {}));
  const filesByJiraKey = new Map<string, Set<string>>();
  for (const [file, commits] of commitsByFile) {
    for (const commit of commits) {
      for (const key of commit.jiraKeys) filesByJiraKey.set(key, new Set([...(filesByJiraKey.get(key) ?? []), file]));
    }
  }
  return {
    cwd: "/repo",
    files: fileMap,
    storiesByZephyrId,
    commitsByFile,
    filesByJiraKey,
    allFilesByJiraKey: () =>
      options.allFiles
        ? new Map(Object.entries(options.allFiles).map(([key, list]) => [key, new Set(list)]))
        : filesByJiraKey,
    projectKeys: new Set(options.projectKeys ?? ["SW"]),
    blame: (file) => options.blame?.[file] ?? new Map(),
    originCommit: (file) => options.origin?.[file] ?? null,
  };
}

export function makeEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    jira: "SW-1",
    jiraIssueId: "1001",
    summary: "Summary for SW-1",
    issueType: "Story",
    issueStatus: "Open",
    existingZephyrIdsAtAudit: [],
    expectedZephyrIds: ["SW-T1"],
    missingZephyrIds: ["SW-T1"],
    unexpectedZephyrIds: [],
    unmanagedZephyrIds: [],
    confidence: "exact",
    recommendedAction: "add",
    status: "needs-changes",
    approved: false,
    evidence: [],
    notes: [],
    ...overrides,
  };
}

export function makeArtifact(tickets: AuditEntry[], overrides: Partial<AuditArtifact> = {}): AuditArtifact {
  const generatedAt = "2026-09-10T18:00:00.000Z";
  return {
    schemaVersion: 1,
    tool: "jira-zephyr-audit",
    generatedAt,
    scope: {
      type: "epic",
      values: ["SW-100"],
      resolvedJql: "parent in (SW-100) ORDER BY key ASC",
      issueTypes: ["Story", "Task"],
      statuses: ["Code review", "Verification", "Closed"],
    },
    scopeSnapshot: { resolvedAt: generatedAt, issueKeys: tickets.map((ticket) => ticket.jira) },
    skipped: [],
    repo: { head: "a".repeat(40), branch: "main", dirty: false },
    jira: { baseUrl: "https://example.atlassian.net", projectKey: "SW" },
    zephyr: { baseUrl: "https://api.zephyrscale.smartbear.com/v2", projectKey: "SW" },
    tickets,
    summary: summarize(tickets),
    ...overrides,
  };
}
