import { describe, expect, it } from "vitest";

import { buildAuditEntry, deriveEvidence, siblingStoryFiles } from "../audit/mapper";
import { NO_GITHUB, type GitHubReader, type PullRequestInfo } from "../clients/github-client";

import { makeCommit, makeFile, makeIndex, makeIssue, makeStory } from "./fixtures";

const SHELL_STORY = "src/components/composed/DataAppShell/DataAppShell.stories.tsx";
const SHELL_SOURCE = "src/components/composed/DataAppShell/DataAppShell.tsx";
const NAV_SOURCE = "src/components/composed/DataAppShell/PrimaryNav.tsx";
const ICONS_STORY = "src/components/ui/icons.stories.tsx";

function index() {
  return makeIndex([
    makeFile(SHELL_STORY, [makeStory(SHELL_STORY, "Default", { zephyrIds: ["SW-T5532", "SW-T5533"] })]),
    makeFile(ICONS_STORY, [makeStory(ICONS_STORY, "AllIcons", { zephyrIds: ["SW-T1414"] })]),
  ]);
}

function fakeGitHub(prs: Partial<PullRequestInfo>[]): GitHubReader {
  return {
    available: true,
    pullRequestsFor: () =>
      prs.map((pr) => ({
        number: pr.number ?? 204,
        title: pr.title ?? "fix: SW-2578 align side-nav icons to a shared gutter",
        state: pr.state ?? "MERGED",
        baseRefName: pr.baseRefName ?? "SW-2410-app-shell-simple-prototype",
        headRefName: pr.headRefName ?? "SW-2578-align-nav-icons",
        files: pr.files ?? [SHELL_SOURCE],
      })),
  };
}

describe("siblingStoryFiles", () => {
  it("maps a source file to the story file beside it", () => {
    expect(siblingStoryFiles(index(), SHELL_SOURCE).map((record) => record.file)).toEqual([SHELL_STORY]);
  });

  it("maps a story file to itself", () => {
    expect(siblingStoryFiles(index(), SHELL_STORY).map((record) => record.file)).toEqual([SHELL_STORY]);
  });

  /** PrimaryNav.tsx has no PrimaryNav.stories.tsx; its directory's stories still cover it. */
  it("falls back to other stories in the same directory when there is no same-named sibling", () => {
    expect(siblingStoryFiles(index(), NAV_SOURCE).map((record) => record.file)).toEqual([SHELL_STORY]);
  });

  it("does not reach into a different directory", () => {
    expect(siblingStoryFiles(index(), "src/components/ui/button.tsx")).toEqual([]);
  });
});

describe("pull-request evidence", () => {
  /**
   * The SW-2578 regression: PR #204 merged into a feature branch that was later
   * deleted, so no commit carrying the key is reachable from HEAD. Before PR
   * evidence the audit fell through to name similarity and matched the summary's
   * word "icons" to icons.stories.tsx — the wrong component entirely.
   */
  it("attributes a PR merged into a deleted branch, and suppresses the wrong similarity match", () => {
    const issue = makeIssue("SW-2578", { summary: "Align icons on the side nav" });
    const evidence = deriveEvidence(index(), issue, { github: fakeGitHub([{ files: [SHELL_SOURCE] }]) });

    expect(evidence.map((item) => [item.type, item.file])).toEqual([["pr-changed-file", SHELL_STORY]]);
    expect(evidence[0].confidence).toBe("medium");
    expect(evidence.some((item) => item.file === ICONS_STORY)).toBe(false);

    const entry = buildAuditEntry({ issue, evidence, existingZephyrIds: [], index: index() });
    expect(entry.expectedZephyrIds).toEqual(["SW-T5532", "SW-T5533"]);
    // Medium never auto-applies at the default --min-confidence high.
    expect(entry.recommendedAction).toBe("review");
  });

  it("still falls back to similarity when no PR names the issue", () => {
    const issue = makeIssue("SW-2578", { summary: "Align icons on the side nav" });
    const evidence = deriveEvidence(index(), issue, { github: fakeGitHub([]) });
    expect(evidence.map((item) => item.type)).toEqual(["summary-similarity"]);
  });

  it("is skipped entirely when git already found solid evidence", () => {
    const commit = makeCommit("abc", "feat: SW-1 Add the shell", ["SW-1"]);
    const story = makeStory(SHELL_STORY, "Default", { zephyrIds: ["SW-T5532"] });
    const withGit = makeIndex([makeFile(SHELL_STORY, [story])], {
      commits: { [SHELL_STORY]: [commit] },
      blame: { [SHELL_STORY]: new Map([[story.declarationLine, { commit, content: "export const Default" }]]) },
      origin: { [SHELL_STORY]: commit },
    });
    const github = fakeGitHub([{ files: ["src/components/ui/icons.tsx"] }]);
    const evidence = deriveEvidence(withGit, makeIssue("SW-1"), { github });
    expect(evidence.every((item) => item.type !== "pr-changed-file")).toBe(true);
  });

  it("ignores PR files whose sibling stories carry no Zephyr IDs", () => {
    const noIds = makeIndex([makeFile(SHELL_STORY, [makeStory(SHELL_STORY, "Default", { zephyrIds: [] })])]);
    const evidence = deriveEvidence(noIds, makeIssue("SW-2578", { summary: "Shell work" }), {
      github: fakeGitHub([{ files: [SHELL_SOURCE] }]),
    });
    expect(evidence.every((item) => item.type !== "pr-changed-file")).toBe(true);
  });

  it("deduplicates when several changed files share one sibling story file", () => {
    const evidence = deriveEvidence(index(), makeIssue("SW-2578", { summary: "Shell work" }), {
      github: fakeGitHub([{ files: [SHELL_SOURCE, NAV_SOURCE] }]),
    });
    expect(evidence).toHaveLength(1);
  });

  /**
   * SW-2305's PR changed 135 files and would otherwise claim ~400 test cases.
   * A sweep does not own the stories it happened to touch.
   */
  it("downgrades a PR that spans more story files than the sweep threshold", () => {
    const files = Array.from({ length: 8 }, (_, i) => `src/components/composed/C${i}/C${i}.stories.tsx`);
    const wide = makeIndex(
      files.map((file, i) => makeFile(file, [makeStory(file, "Default", { zephyrIds: [`SW-T${100 + i}`] })])),
    );
    const github = fakeGitHub([{ files }]);

    const swept = deriveEvidence(wide, makeIssue("SW-2305", { summary: "Sweep" }), {
      github,
      sweepFileThreshold: 5,
    });
    expect(swept).toHaveLength(8);
    expect(swept.every((item) => item.confidence === "low")).toBe(true);
    expect(swept[0].detail).toContain("cross-cutting sweep");
    const sweptEntry = buildAuditEntry({
      issue: makeIssue("SW-2305"),
      evidence: swept,
      existingZephyrIds: [],
      index: wide,
    });
    expect(sweptEntry.expectedZephyrIds).toEqual([]);

    // The same PR under a higher threshold is a normal, medium-confidence map.
    const narrow = deriveEvidence(wide, makeIssue("SW-2305", { summary: "Sweep" }), {
      github,
      sweepFileThreshold: 20,
    });
    expect(narrow.every((item) => item.confidence === "medium")).toBe(true);
  });

  it("does nothing when PR evidence is disabled", () => {
    const evidence = deriveEvidence(index(), makeIssue("SW-2578", { summary: "Shell work" }), { github: NO_GITHUB });
    expect(evidence.every((item) => item.type !== "pr-changed-file")).toBe(true);
  });
});
