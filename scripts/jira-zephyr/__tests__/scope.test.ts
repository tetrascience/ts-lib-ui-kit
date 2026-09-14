import { describe, expect, it, vi } from "vitest";

import {
  buildScopeJql,
  DEFAULT_ISSUE_TYPES,
  parseSelector,
  partitionByIssueType,
  resolveScope,
  ScopeError,
  type JiraReader,
} from "../audit/scope";

import { makeIssue } from "./fixtures";

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

describe("partitionByIssueType", () => {
  it("skips non-participating types with an explanatory reason", () => {
    const issues = [
      makeIssue("SW-1"),
      makeIssue("SW-2", { issuetype: { name: "Epic", hierarchyLevel: 1 } }),
      makeIssue("SW-3", { issuetype: { name: "task" } }),
    ];
    const { audited, skipped } = partitionByIssueType(issues, DEFAULT_ISSUE_TYPES);
    expect(audited.map((issue) => issue.key)).toEqual(["SW-1", "SW-3"]);
    expect(skipped).toEqual([
      { jira: "SW-2", issueType: "Epic", reason: expect.stringContaining('issue type "Epic" is not audited') },
    ]);
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
    });
    expect(resolved.issues.map((issue) => issue.key)).toEqual(["SW-9", "SW-2528", "SW-2540"]);
    expect(resolved.audited.map((issue) => issue.key)).toEqual(["SW-2528", "SW-2540"]);
    expect(resolved.skipped.map((skipped) => skipped.jira)).toEqual(["SW-9"]);
    expect(resolved.labels).toEqual(["SW-2301 ([React UI Kit v1.1.0] Upcoming Release)"]);
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
