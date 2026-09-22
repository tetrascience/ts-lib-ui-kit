import { describe, expect, it, vi } from "vitest";

import {
  buildScopeJql,
  DEFAULT_ISSUE_TYPES,
  parseSelector,
  partitionInScope,
  partitionStoryOnly,
  resolveScope,
  ScopeError,
  type JiraReader,
} from "../audit/scope";
import { DEFAULT_AUDITED_STATUSES, UnknownStatusError } from "../shared/statuses";

import { makeIssue } from "./fixtures";

import type { JiraIssue } from "../shared/types";

describe("parseSelector", () => {
  it("accepts a single selector kind and normalises keys", () => {
    expect(parseSelector({ epics: ["sw-100", "SW-100"], fixVersions: [], keys: [], intersect: false })).toEqual({
      type: "epic",
      epics: ["SW-100"],
      fixVersions: [],
      keys: [],
    });
    expect(parseSelector({ epics: [], fixVersions: ["ts-lib-ui-kit:v1.1.0"], keys: [], intersect: false }).type).toBe(
      "fix-version",
    );
    expect(parseSelector({ epics: [], fixVersions: [], keys: ["SW-1", "SW-2"], intersect: false }).keys).toEqual([
      "SW-1",
      "SW-2",
    ]);
    expect(
      parseSelector({ epics: [], fixVersions: [], keys: [], jql: " project = SW ", intersect: false }),
    ).toMatchObject({ type: "jql", jql: "project = SW" });
  });

  it("rejects empty, malformed and ambiguous selections", () => {
    expect(() => parseSelector({ epics: [], fixVersions: [], keys: [], intersect: false })).toThrow(ScopeError);
    expect(() => parseSelector({ epics: ["SW-T5"], fixVersions: [], keys: [], intersect: false })).toThrow(
      /not a Jira issue key/,
    );
    expect(() => parseSelector({ epics: ["SW-1"], fixVersions: ["v1"], keys: [], intersect: false })).toThrow(
      /--intersect/,
    );
    expect(() => parseSelector({ epics: ["SW-1"], fixVersions: [], keys: ["SW-2"], intersect: false })).toThrow(
      /cannot be combined/,
    );
    expect(() => parseSelector({ epics: [], fixVersions: ["v1"], keys: [], jql: "x", intersect: true })).toThrow(
      /cannot be combined/,
    );
  });

  it("returns an intersection when both epic and fix version are given with --intersect", () => {
    expect(parseSelector({ epics: ["SW-1"], fixVersions: ["v1"], keys: [], intersect: true })).toMatchObject({
      type: "intersection",
      epics: ["SW-1"],
      fixVersions: ["v1"],
    });
  });
});

describe("buildScopeJql", () => {
  it("builds predictable JQL per scope type", () => {
    const ctx = { projectKey: "SW", versionIds: ["32866"] };
    expect(buildScopeJql({ type: "epic", epics: ["SW-2301", "SW-2061"], fixVersions: [], keys: [] }, ctx)).toBe(
      "parent in (SW-2301, SW-2061) ORDER BY key ASC",
    );
    expect(buildScopeJql({ type: "fix-version", epics: [], fixVersions: ["x"], keys: [] }, ctx)).toBe(
      'project = "SW" AND fixVersion in (32866) ORDER BY key ASC',
    );
    expect(buildScopeJql({ type: "intersection", epics: ["SW-1"], fixVersions: ["x"], keys: [] }, ctx)).toBe(
      '(parent in (SW-1)) AND (project = "SW" AND fixVersion in (32866)) ORDER BY key ASC',
    );
    expect(buildScopeJql({ type: "keys", epics: [], fixVersions: [], keys: ["SW-1", "SW-2"] }, ctx)).toBe(
      "key in (SW-1, SW-2) ORDER BY key ASC",
    );
    expect(
      buildScopeJql({ type: "jql", epics: [], fixVersions: [], keys: [], jql: "sprint in openSprints()" }, ctx),
    ).toBe("sprint in openSprints()");
  });
});

describe("partitionInScope", () => {
  it("skips non-participating types with an explanatory reason", () => {
    const issues = [
      makeIssue("SW-1"),
      makeIssue("SW-2", { issuetype: { name: "Epic", hierarchyLevel: 1 } }),
      makeIssue("SW-3", { issuetype: { name: "task" } }),
    ];
    const { audited, skipped } = partitionInScope(issues, DEFAULT_ISSUE_TYPES);
    expect(audited.map((issue: JiraIssue) => issue.key)).toEqual(["SW-1", "SW-3"]);
    expect(skipped).toEqual([
      {
        jira: "SW-2",
        issueType: "Epic",
        status: "Closed",
        reason: expect.stringContaining('issue type "Epic" is not audited'),
      },
    ]);
  });

  it("audits code review and later, skipping work that has not got there yet", () => {
    const issues = [
      makeIssue("SW-1", { status: { name: "Open" } }),
      makeIssue("SW-2", { status: { name: "In Progress" } }),
      makeIssue("SW-3", { status: { name: "Code review" } }),
      makeIssue("SW-4", { status: { name: "Verification" } }),
      makeIssue("SW-5", { status: { name: "Closed" } }),
    ];
    const { audited, skipped } = partitionInScope(issues, DEFAULT_ISSUE_TYPES);
    expect(audited.map((issue: JiraIssue) => issue.key)).toEqual(["SW-3", "SW-4", "SW-5"]);
    expect(skipped.map((entry) => [entry.jira, entry.status])).toEqual([
      ["SW-1", "Open"],
      ["SW-2", "In Progress"],
    ]);
    expect(skipped[0].reason).toContain('status "Open" is earlier than code review');
  });

  it("matches status names case-insensitively and honours an explicit list", () => {
    const issues = [
      makeIssue("SW-1", { status: { name: "CODE REVIEW" } }),
      makeIssue("SW-2", { status: { name: "Done" } }),
    ];
    expect(partitionInScope(issues, DEFAULT_ISSUE_TYPES).audited.map((issue: JiraIssue) => issue.key)).toEqual([
      "SW-1",
    ]);
    expect(
      partitionInScope(issues, DEFAULT_ISSUE_TYPES, ["Done"]).audited.map((issue: JiraIssue) => issue.key),
    ).toEqual(["SW-2"]);
  });

  it("audits every status when the filter is disabled", () => {
    const issues = [makeIssue("SW-1", { status: { name: "Open" } }), makeIssue("SW-2", { status: { name: "Closed" } })];
    const { audited, skipped } = partitionInScope(issues, DEFAULT_ISSUE_TYPES, null);
    expect(audited.map((issue: JiraIssue) => issue.key)).toEqual(["SW-1", "SW-2"]);
    expect(skipped).toEqual([]);
  });

  it("reports an out-of-scope type by type even when its status is also out of scope", () => {
    const issues = [makeIssue("SW-1", { issuetype: { name: "Epic", hierarchyLevel: 1 }, status: { name: "Open" } })];
    expect(partitionInScope(issues, DEFAULT_ISSUE_TYPES).skipped[0].reason).toContain("issue type");
  });
});

describe("partitionStoryOnly", () => {
  const issues = [makeIssue("SW-1"), makeIssue("SW-2"), makeIssue("SW-3")];

  it("skips issues whose commits touched only story files", () => {
    const { audited, skipped } = partitionStoryOnly(
      issues,
      new Map([
        ["SW-1", new Set(["src/components/ui/button.stories.tsx"])],
        ["SW-2", new Set(["src/components/ui/button.stories.tsx", "src/components/ui/button.tsx"])],
        ["SW-3", new Set(["scripts/build/thing.ts"])],
      ]),
    );
    expect(audited.map((issue: JiraIssue) => issue.key)).toEqual(["SW-2", "SW-3"]);
    expect(skipped).toEqual([
      {
        jira: "SW-1",
        issueType: "Story",
        status: "Closed",
        reason: "commits touched only story files (1 file), so no shipped code changed",
      },
    ]);
  });

  /**
   * The load-bearing case: no keyed commits means "cannot tell", not "changed
   * nothing". Skipping here would hide precisely the unmapped tickets the audit
   * exists to surface.
   */
  it("keeps issues with no keyed commits at all", () => {
    const { audited, skipped } = partitionStoryOnly(issues, new Map([["SW-1", new Set<string>()]]));
    expect(audited.map((issue: JiraIssue) => issue.key)).toEqual(["SW-1", "SW-2", "SW-3"]);
    expect(skipped).toEqual([]);
  });

  it("pluralises the file count", () => {
    const { skipped } = partitionStoryOnly(
      [makeIssue("SW-1")],
      new Map([["SW-1", new Set(["a.stories.tsx", "b.stories.tsx"])]]),
    );
    expect(skipped[0].reason).toContain("(2 files)");
  });
});

describe("resolveScope", () => {
  function fakeJira(overrides: Partial<JiraReader> = {}): JiraReader {
    return {
      getIssue: vi.fn(async (key: string) =>
        key === "SW-2301"
          ? makeIssue("SW-2301", {
              summary: "[React UI Kit v1.1.0] Upcoming Release",
              issuetype: { name: "Epic", hierarchyLevel: 1 },
            })
          : null,
      ),
      getProjectStatuses: vi.fn(async () => [
        { name: "Open", category: "To Do" },
        { name: "In Progress", category: "In Progress" },
        { name: "Code review", category: "In Progress" },
        { name: "Verification", category: "In Progress" },
        { name: "Closed", category: "Done" },
      ]),
      getProjectVersions: vi.fn(async () => [
        { id: "32866", name: "ts-lib-ui-kit:v1.1.0" },
        { id: "1", name: "ts-lib-ui-kit:v1.0.0" },
      ]),
      searchAll: vi.fn(async () => [
        makeIssue("SW-2540"),
        makeIssue("SW-2540"),
        makeIssue("SW-9", { issuetype: { name: "Epic", hierarchyLevel: 1 } }),
        makeIssue("SW-2528"),
      ]),
      ...overrides,
    };
  }

  it("verifies the epic, freezes deduplicated sorted keys and records the JQL", async () => {
    const jira = fakeJira();
    const resolved = await resolveScope(
      jira,
      { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] },
      { projectKey: "SW" },
    );

    expect(jira.searchAll).toHaveBeenCalledWith("parent in (SW-2301) ORDER BY key ASC");
    expect(resolved.scope).toEqual({
      type: "epic",
      values: ["SW-2301"],
      resolvedJql: "parent in (SW-2301) ORDER BY key ASC",
      issueTypes: DEFAULT_ISSUE_TYPES,
      statuses: [...DEFAULT_AUDITED_STATUSES],
    });
    expect(resolved.issues.map((issue) => issue.key)).toEqual(["SW-9", "SW-2528", "SW-2540"]);
    expect(resolved.audited.map((issue) => issue.key)).toEqual(["SW-2528", "SW-2540"]);
    expect(resolved.skipped.map((skipped) => skipped.jira)).toEqual(["SW-9"]);
    expect(resolved.labels).toEqual(["SW-2301 ([React UI Kit v1.1.0] Upcoming Release)"]);
  });

  it("fails loudly when a configured status no longer exists in the project", async () => {
    const jira = fakeJira({
      getProjectStatuses: vi.fn(async () => [
        { name: "Open", category: "To Do" },
        { name: "In Review", category: "In Progress" },
        { name: "Closed", category: "Done" },
      ]),
    });
    await expect(
      resolveScope(jira, { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] }, { projectKey: "SW" }),
    ).rejects.toThrow(UnknownStatusError);
    // The message has to be actionable: what is missing, and what exists instead.
    await expect(
      resolveScope(jira, { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] }, { projectKey: "SW" }),
    ).rejects.toThrow(/"Code review".*In Review \(In Progress\)/s);
  });

  it("does not validate statuses when the project statuses cannot be read, or when filtering is off", async () => {
    const unreadable = fakeJira({ getProjectStatuses: vi.fn(async () => []) });
    await expect(
      resolveScope(unreadable, { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] }, { projectKey: "SW" }),
    ).resolves.toBeDefined();

    const renamed = fakeJira({ getProjectStatuses: vi.fn(async () => [{ name: "In Review" }]) });
    const resolved = await resolveScope(
      renamed,
      { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] },
      { projectKey: "SW", statuses: null },
    );
    expect(renamed.getProjectStatuses).not.toHaveBeenCalled();
    expect(resolved.scope.statuses).toBeUndefined();
  });

  it("rejects a non-epic or unknown --epic", async () => {
    await expect(
      resolveScope(fakeJira(), { type: "epic", epics: ["SW-1"], fixVersions: [], keys: [] }, { projectKey: "SW" }),
    ).rejects.toThrow(/not found/);
    const notEpic = fakeJira({ getIssue: vi.fn(async () => makeIssue("SW-5")) });
    await expect(
      resolveScope(notEpic, { type: "epic", epics: ["SW-5"], fixVersions: [], keys: [] }, { projectKey: "SW" }),
    ).rejects.toThrow(/is a Story, not an Epic/);
  });

  it("resolves fix versions to ids by exact name and suggests near matches otherwise", async () => {
    const jira = fakeJira();
    const resolved = await resolveScope(
      jira,
      { type: "fix-version", epics: [], fixVersions: ["ts-lib-ui-kit:v1.1.0"], keys: [] },
      { projectKey: "SW" },
    );
    expect(resolved.scope.resolvedJql).toBe('project = "SW" AND fixVersion in (32866) ORDER BY key ASC');
    expect(resolved.scope.values).toEqual(["ts-lib-ui-kit:v1.1.0"]);

    await expect(
      resolveScope(jira, { type: "fix-version", epics: [], fixVersions: ["v1.1.0"], keys: [] }, { projectKey: "SW" }),
    ).rejects.toThrow(/does not exist in project SW\. Similar: ts-lib-ui-kit:v1.1.0/);
  });

  it("fails loudly when an explicit key is not returned by Jira", async () => {
    await expect(
      resolveScope(
        fakeJira(),
        { type: "keys", epics: [], fixVersions: [], keys: ["SW-2540", "SW-404"] },
        { projectKey: "SW" },
      ),
    ).rejects.toThrow(/not found or not visible: SW-404/);
  });

  it("honours a custom issue-type allowlist", async () => {
    const resolved = await resolveScope(
      fakeJira(),
      { type: "epic", epics: ["SW-2301"], fixVersions: [], keys: [] },
      { projectKey: "SW", issueTypes: ["Epic"] },
    );
    expect(resolved.audited.map((issue) => issue.key)).toEqual(["SW-9"]);
    expect(resolved.scope.issueTypes).toEqual(["Epic"]);
  });
});
