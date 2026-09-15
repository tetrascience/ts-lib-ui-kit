import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildAuditEntry, deriveEvidence } from "../audit/mapper";
import {
  buildRepoIndex,
  describeRepoState,
  parseBlamePorcelain,
  parseHistory,
  parseStoryFile,
} from "../audit/repo-scanner";

import { makeIssue } from "./fixtures";

const STORY_FILE = "src/components/ui/widget.stories.tsx";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function commitAll(cwd: string, subject: string): void {
  git(cwd, "add", "-A");
  git(
    cwd,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-q",
    "-m",
    subject,
  );
}

const INITIAL = `import type { Meta, StoryObj } from "@storybook/react-vite";
import { Widget } from "./widget";

const meta = { title: "Components/Data Display/Widget", component: Widget } satisfies Meta<typeof Widget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Hi" },
};
`;

const WITH_REGRESSION = `${INITIAL}
// SW-200 — the label must not overflow its container
export const LongLabel: Story = {
  name: "Long label",
  args: { label: "x".repeat(200) },
};
`;

const WITH_IDS = WITH_REGRESSION.replace(
  'args: { label: "Hi" },\n',
  'args: { label: "Hi" },\n  parameters: {\n    zephyr: { testCaseId: "SW-T1" },\n  },\n',
).replace(
  'args: { label: "x".repeat(200) },\n',
  'args: { label: "x".repeat(200) },\n  parameters: { zephyr: { testCaseId: "SW-T2" } },\n',
);

describe("repo-scanner against a real git repository", () => {
  let cwd: string;

  beforeAll(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "jira-zephyr-scanner-"));
    git(cwd, "init", "-q", "-b", "main");
    fs.mkdirSync(path.join(cwd, "src/components/ui"), { recursive: true });
    fs.writeFileSync(path.join(cwd, STORY_FILE), INITIAL);
    commitAll(cwd, "feat: SW-100 Add Widget component (#1)");
    fs.writeFileSync(path.join(cwd, STORY_FILE), WITH_REGRESSION);
    commitAll(cwd, "fix: SW-200 Widget label overflow (#2)");
    fs.writeFileSync(path.join(cwd, STORY_FILE), WITH_IDS);
    commitAll(cwd, "chore: add Zephyr test case IDs to stories");
  });

  afterAll(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("indexes stories, Zephyr ids, history and blame", () => {
    const index = buildRepoIndex({ cwd, projectKeys: ["SW"] });
    const record = index.files.get(STORY_FILE);
    expect(record?.componentName).toBe("Widget");
    expect(record?.stories.map((story) => [story.exportName, story.storyName, story.zephyrIds])).toEqual([
      ["Default", "Default", ["SW-T1"]],
      ["LongLabel", "Long label", ["SW-T2"]],
    ]);
    expect([...index.storiesByZephyrId.keys()].sort()).toEqual(["SW-T1", "SW-T2"]);

    const subjects = index.commitsByFile.get(STORY_FILE)?.map((commit) => commit.subject);
    expect(subjects).toEqual([
      "chore: add Zephyr test case IDs to stories",
      "fix: SW-200 Widget label overflow (#2)",
      "feat: SW-100 Add Widget component (#1)",
    ]);
    expect([...(index.filesByJiraKey.get("SW-100") ?? [])]).toEqual([STORY_FILE]);
    expect([...(index.filesByJiraKey.get("SW-200") ?? [])]).toEqual([STORY_FILE]);

    const [defaultStory, longLabel] = record!.stories;
    expect(index.blame(STORY_FILE).get(defaultStory.declarationLine)?.commit.jiraKeys).toEqual(["SW-100"]);
    expect(index.blame(STORY_FILE).get(longLabel.declarationLine)?.commit.jiraKeys).toEqual(["SW-200"]);
    expect(index.originCommit(STORY_FILE)?.jiraKeys).toEqual(["SW-100"]);

    const state = describeRepoState(cwd);
    expect(state.branch).toBe("main");
    expect(state.dirty).toBe(false);
    expect(state.head).toMatch(/^[0-9a-f]{40}$/);
  });

  it("derives exact evidence for the ticket that created the file and high for a later story, ignoring the sync chore", () => {
    const index = buildRepoIndex({ cwd, projectKeys: ["SW"] });

    const created = buildAuditEntry({
      issue: makeIssue("SW-100"),
      evidence: deriveEvidence(index, makeIssue("SW-100")),
      existingZephyrIds: [],
      index,
    });
    expect(created.expectedZephyrIds).toEqual(["SW-T1"]);
    expect(created.confidence).toBe("exact");
    expect(created.recommendedAction).toBe("add");

    const regression = buildAuditEntry({
      issue: makeIssue("SW-200"),
      evidence: deriveEvidence(index, makeIssue("SW-200")),
      existingZephyrIds: [],
      index,
    });
    expect(regression.expectedZephyrIds).toEqual(["SW-T2"]);
    // Both the in-source comment (exact) and the introducing commit (high) point at SW-200.
    expect(regression.evidence.map((item) => item.type).sort()).toEqual([
      "story-introduced-by-commit",
      "story-reference",
    ]);
    expect(regression.confidence).toBe("exact");
  });
});

describe("parseStoryFile", () => {
  it("captures leading comments, ranges, names and empty testCaseId markers", () => {
    const source = `import type { StoryObj } from "@storybook/react-vite";
type Story = StoryObj;
export default { title: "Components/Forms & Inputs/Thing" };

/**
 * SW-2445: labelled multi-select.
 */
export const Variations: Story = {
  parameters: { zephyr: { testCaseId: "SW-T5648" } },
};

export const Pending: Story = {
  parameters: { zephyr: { testCaseId: "" } },
};

export const notAStory = 42;
`;
    const record = parseStoryFile("src/thing.stories.tsx", source);
    expect(record.componentName).toBe("Thing");
    expect(record.stories.map((story) => story.exportName)).toEqual(["Variations", "Pending"]);
    const [variations, pending] = record.stories;
    expect(variations.startLine).toBe(5);
    expect(variations.declarationLine).toBe(8);
    expect(variations.endLine).toBe(10);
    expect(variations.text).toContain("SW-2445");
    expect(variations.zephyrIds).toEqual(["SW-T5648"]);
    expect(pending.hasEmptyZephyrId).toBe(true);
    expect(pending.zephyrIds).toEqual([]);
  });
});

describe("git output parsers", () => {
  const keys = new Set(["SW"]);

  it("parses record-separated history blocks", () => {
    const rs = String.fromCharCode(0x1e);
    const us = String.fromCharCode(0x1f);
    const sha = "1".repeat(40);
    const output = `${rs}${sha}${us}feat: SW-1 thing\n\nsrc/a.stories.tsx\nsrc/b.stories.tsx\n${rs}${"2".repeat(40)}${us}chore: sync\n\nsrc/a.stories.tsx\n`;
    const history = parseHistory(output, keys);
    expect(history.get("src/a.stories.tsx")?.map((commit) => commit.jiraKeys)).toEqual([["SW-1"], []]);
    expect(history.get("src/b.stories.tsx")).toHaveLength(1);
  });

  it("parses blame porcelain, reusing the summary of repeated commits and marking uncommitted lines", () => {
    const sha = "3".repeat(40);
    const output = [
      `${sha} 1 1 2`,
      "author A",
      "summary feat: SW-9 add",
      "\texport const A: Story = {",
      `${sha} 2 2`,
      "\t};",
      `${"0".repeat(40)} 3 3 1`,
      "author Not Committed Yet",
      "summary Version of src/x.stories.tsx from src/x.stories.tsx",
      "\t// local edit",
      "",
    ].join("\n");
    const blame = parseBlamePorcelain(output, keys);
    expect(blame.get(1)?.commit.jiraKeys).toEqual(["SW-9"]);
    expect(blame.get(2)?.commit.subject).toBe("feat: SW-9 add");
    expect(blame.get(2)?.content).toBe("};");
    expect(blame.get(3)?.commit.jiraKeys).toEqual([]);
    expect(blame.get(3)?.commit.subject).toMatch(/uncommitted/);
  });
});
