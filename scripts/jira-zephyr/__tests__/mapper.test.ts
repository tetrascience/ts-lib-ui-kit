import { describe, expect, it } from "vitest";

import { buildAuditEntry, deriveEvidence, summaryTokens, reviewIssueType } from "../audit/mapper";

import { blameStory, makeCommit, makeFile, makeIndex, makeIssue, makeStory, mergeBlame } from "./fixtures";

const FILE = "src/components/ui/tree.stories.tsx";
const featCommit = makeCommit("aaaa", "feat: SW-2540 Add accessible Tree compound component (#201)", ["SW-2540"]);
const laterCommit = makeCommit("bbbb", "feat: SW-2526 Add Text typography primitive (#200)", ["SW-2526"]);
const fixCommit = makeCommit("cccc", "fix: SW-2528 pad content placed directly in DialogContent (#205)", ["SW-2528"]);
const keyless = makeCommit("dddd", "chore: add Zephyr test case IDs to stories");

describe("deriveEvidence", () => {
  it("rates a story whose export and file were both introduced by the keyed commit as exact", () => {
    const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T5655"] });
    const index = makeIndex([makeFile(FILE, [story])], {
      commits: { [FILE]: [laterCommit, featCommit] },
      blame: { [FILE]: blameStory(story, featCommit) },
      origin: { [FILE]: featCommit },
    });

    const evidence = deriveEvidence(index, makeIssue("SW-2540"));

    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({
      type: "story-introduced-by-commit",
      confidence: "exact",
      story: "Default",
      zephyrIds: ["SW-T5655"],
      commit: "aaaa000",
    });
  });

  it("rates a story introduced by the keyed commit in a pre-existing file as high", () => {
    const story = makeStory(FILE, "RawContentPadding", { zephyrIds: ["SW-T9"] });
    const index = makeIndex([makeFile(FILE, [story])], {
      commits: { [FILE]: [fixCommit, featCommit] },
      blame: { [FILE]: blameStory(story, fixCommit) },
      origin: { [FILE]: featCommit },
    });

    const evidence = deriveEvidence(index, makeIssue("SW-2528"));

    expect(evidence.map((item) => [item.type, item.confidence])).toEqual([["story-introduced-by-commit", "high"]]);
  });

  it("ignores the auto-generated testCaseId line when judging modifications, but counts real edits as medium", () => {
    const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T1"], declarationLine: 10, startLine: 10, endLine: 14 });
    const generatedLine = new Map([[13, { commit: laterCommit, content: 'zephyr: { testCaseId: "SW-T1" },' }]]);
    const indexWithOnlyGeneratedLine = makeIndex([makeFile(FILE, [story])], {
      commits: { [FILE]: [laterCommit, featCommit] },
      blame: { [FILE]: mergeBlame(blameStory(story, featCommit), generatedLine) },
      origin: { [FILE]: featCommit },
    });
    const generatedOnly = deriveEvidence(indexWithOnlyGeneratedLine, makeIssue("SW-2526"));
    expect(generatedOnly.map((item) => item.type)).toEqual(["file-touched-by-commit"]);
    expect(generatedOnly[0].zephyrIds).toEqual([]);

    const realEdit = new Map([[12, { commit: laterCommit, content: "render: () => <Tree dense />," }]]);
    const indexWithRealEdit = makeIndex([makeFile(FILE, [story])], {
      commits: { [FILE]: [laterCommit, featCommit] },
      blame: { [FILE]: mergeBlame(blameStory(story, featCommit), realEdit) },
      origin: { [FILE]: featCommit },
    });
    const modified = deriveEvidence(indexWithRealEdit, makeIssue("SW-2526"));
    expect(modified.map((item) => [item.type, item.confidence])).toEqual([["story-modified-by-commit", "medium"]]);
  });

  it("ignores the sync workflow's parameters wrapper lines, not just the testCaseId line", () => {
    const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T1"], declarationLine: 10, startLine: 10, endLine: 15 });
    const wrapper = new Map([
      [12, { commit: laterCommit, content: "  parameters: {" }],
      [13, { commit: laterCommit, content: '    zephyr: { testCaseId: "SW-T1" },' }],
      [14, { commit: laterCommit, content: "  }," }],
    ]);
    const index = makeIndex([makeFile(FILE, [story])], {
      commits: { [FILE]: [laterCommit, featCommit] },
      blame: { [FILE]: mergeBlame(blameStory(story, featCommit), wrapper) },
      origin: { [FILE]: featCommit },
    });
    expect(deriveEvidence(index, makeIssue("SW-2526")).map((item) => item.type)).toEqual(["file-touched-by-commit"]);
  });

  it("downgrades a commit that edits stories across many files as a cross-cutting sweep", () => {
    const sweep = makeCommit("eeee", "docs: SW-2549 Audit Storybook docs code panels (#192)", ["SW-2549"]);
    const files = Array.from({ length: 6 }, (_, i) => {
      const file = `src/components/ui/c${i}.stories.tsx`;
      return { file, story: makeStory(file, "Default", { zephyrIds: [`SW-T${i + 1}`] }) };
    });
    const docsLine = { commit: sweep, content: "docs: { source: { type: 'dynamic' } }," };
    const index = makeIndex(
      files.map(({ file, story }) => makeFile(file, [story])),
      {
        commits: Object.fromEntries(files.map(({ file }) => [file, [sweep, featCommit]])),
        blame: Object.fromEntries(
          files.map(({ file, story }) => [file, mergeBlame(blameStory(story, featCommit), new Map([[12, docsLine]]))]),
        ),
        origin: Object.fromEntries(files.map(({ file }) => [file, featCommit])),
      },
    );

    const evidence = deriveEvidence(index, makeIssue("SW-2549"));
    expect(evidence).toHaveLength(6);
    expect(new Set(evidence.map((item) => item.confidence))).toEqual(new Set(["low"]));
    expect(evidence[0].detail).toMatch(/cross-cutting sweep/);

    const entry = buildAuditEntry({ issue: makeIssue("SW-2549"), evidence, existingZephyrIds: [], index });
    expect(entry.expectedZephyrIds).toEqual([]);
    expect(entry.status).toBe("manual-review");

    // Below the threshold the same shape is a legitimate multi-file change.
    const small = deriveEvidence(index, makeIssue("SW-2549"), { sweepFileThreshold: 6 });
    expect(new Set(small.map((item) => item.confidence))).toEqual(new Set(["medium"]));
  });

  it("treats a Jira key written in the story source as exact, and a file-level key as medium/low by story count", () => {
    const referenced = makeStory(FILE, "Regression", {
      zephyrIds: ["SW-T7"],
      text: "// SW-2528 — content placed straight into DialogContent must be inset\nexport const Regression: Story = {};",
    });
    const other = makeStory(FILE, "Other", { zephyrIds: ["SW-T8"], declarationLine: 30, startLine: 30, endLine: 33 });
    const multi = makeIndex([
      makeFile(FILE, [referenced, other], { fullText: `// SW-1000 file header\n${referenced.text}\n${other.text}` }),
    ]);

    expect(
      deriveEvidence(multi, makeIssue("SW-2528")).map((item) => [item.type, item.confidence, item.zephyrIds]),
    ).toEqual([["story-reference", "exact", ["SW-T7"]]]);
    expect(
      deriveEvidence(multi, makeIssue("SW-1000")).map((item) => [item.type, item.confidence, item.zephyrIds]),
    ).toEqual([["file-reference", "low", ["SW-T7", "SW-T8"]]]);

    const single = makeIndex([
      makeFile(FILE, [referenced], { fullText: `// SW-1000 file header\n${referenced.text}` }),
    ]);
    expect(deriveEvidence(single, makeIssue("SW-1000"))[0]).toMatchObject({
      type: "file-reference",
      confidence: "medium",
    });
  });

  it("falls back to summary/component-name similarity at low confidence only", () => {
    const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T1"] });
    const index = makeIndex([makeFile(FILE, [story], { componentName: "Tree" })]);

    const evidence = deriveEvidence(
      index,
      makeIssue("SW-42", { summary: "[Tree B] Roving tabindex and typeahead for the tree" }),
    );
    expect(evidence).toEqual([
      expect.objectContaining({ type: "summary-similarity", confidence: "low", zephyrIds: ["SW-T1"] }),
    ]);

    expect(deriveEvidence(index, makeIssue("SW-43", { summary: "Unrelated docs cleanup" }))).toEqual([]);
  });

  it("only falls back to similarity when no medium-or-better evidence exists", () => {
    const tree = makeStory(FILE, "Default", { zephyrIds: ["SW-T1"] });
    const buttonFile = "src/components/ui/button.stories.tsx";
    const button = makeStory(buttonFile, "Default", { zephyrIds: ["SW-T2"] });
    const index = makeIndex(
      [makeFile(FILE, [tree], { componentName: "Tree" }), makeFile(buttonFile, [button], { componentName: "Button" })],
      {
        commits: { [FILE]: [featCommit] },
        blame: { [FILE]: blameStory(tree, featCommit) },
        origin: { [FILE]: featCommit },
      },
    );
    const evidence = deriveEvidence(index, makeIssue("SW-2540", { summary: "Tree with button affordances" }));
    expect(evidence.map((item) => item.type)).toEqual(["story-introduced-by-commit"]);
  });

  it("tokenises summaries into words and adjacent-word joins, dropping stopwords and brackets", () => {
    const tokens = summaryTokens("[Tree A] Review button group colors");
    expect(tokens.has("button")).toBe(true);
    expect(tokens.has("buttongroup")).toBe(true);
    expect(tokens.has("tree")).toBe(false);
    expect(tokens.has("review")).toBe(false);
  });
});

describe("buildAuditEntry", () => {
  const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T1", "SW-T2"] });
  const otherStory = makeStory("src/components/ui/dialog.stories.tsx", "Other", { zephyrIds: ["SW-T99"] });
  const index = makeIndex([makeFile(FILE, [story]), makeFile(otherStory.file, [otherStory])], {
    commits: { [FILE]: [featCommit], [otherStory.file]: [fixCommit, keyless] },
    blame: { [FILE]: blameStory(story, featCommit), [otherStory.file]: blameStory(otherStory, fixCommit) },
    origin: { [FILE]: featCommit, [otherStory.file]: fixCommit },
  });
  const issue = makeIssue("SW-2540");

  it("recommends add when exact evidence exists and links are missing", () => {
    const entry = buildAuditEntry({ issue, evidence: deriveEvidence(index, issue), existingZephyrIds: [], index });
    expect(entry).toMatchObject({
      jira: "SW-2540",
      jiraIssueId: issue.id,
      expectedZephyrIds: ["SW-T1", "SW-T2"],
      missingZephyrIds: ["SW-T1", "SW-T2"],
      confidence: "exact",
      recommendedAction: "add",
      status: "needs-changes",
      approved: false,
    });
  });

  it("reports correct when Zephyr already links exactly the expected ids (unmanaged ids do not count against it)", () => {
    const entry = buildAuditEntry({
      issue,
      evidence: deriveEvidence(index, issue),
      existingZephyrIds: ["SW-T2", "SW-T1", "SW-T500"],
      index,
    });
    expect(entry.status).toBe("correct");
    expect(entry.recommendedAction).toBe("none");
    expect(entry.missingZephyrIds).toEqual([]);
    expect(entry.unexpectedZephyrIds).toEqual([]);
    expect(entry.unmanagedZephyrIds).toEqual(["SW-T500"]);
    expect(entry.notes.join("\n")).toMatch(/not managed by this repository/);
  });

  it("flags repo-known ids linked to the wrong issue as unexpected with attribution, and never recommends add", () => {
    const entry = buildAuditEntry({
      issue,
      evidence: deriveEvidence(index, issue),
      existingZephyrIds: ["SW-T99"],
      index,
    });
    expect(entry.unexpectedZephyrIds).toEqual(["SW-T99"]);
    expect(entry.status).toBe("manual-review");
    expect(entry.recommendedAction).toBe("review");
    const attribution = entry.evidence.find((item) => item.type === "zephyr-attribution");
    expect(attribution?.detail).toMatch(/attributed to SW-2528/);
  });

  it("downgrades to review when an expected id no longer exists in Zephyr", () => {
    const entry = buildAuditEntry({
      issue,
      evidence: deriveEvidence(index, issue),
      existingZephyrIds: [],
      index,
      missingNotFoundInZephyr: ["SW-T2"],
    });
    expect(entry.recommendedAction).toBe("review");
    expect(entry.notes.join("\n")).toMatch(/SW-T2 is expected by the repo but does not exist in Zephyr/);
  });

  it("uses the weakest confidence among the missing ids", () => {
    const evidence = [
      ...deriveEvidence(index, issue),
      {
        type: "story-modified-by-commit" as const,
        confidence: "medium" as const,
        jira: "SW-2540",
        file: otherStory.file,
        story: "Other",
        zephyrIds: ["SW-T99"],
        detail: "edited",
      },
    ];
    const entry = buildAuditEntry({ issue, evidence, existingZephyrIds: ["SW-T1", "SW-T2"], index });
    expect(entry.missingZephyrIds).toEqual(["SW-T99"]);
    expect(entry.confidence).toBe("medium");
    expect(entry.recommendedAction).toBe("review");
    expect(entry.status).toBe("manual-review");
  });

  it("reports no-mapping (with the Jira status) when the repo has no signal at all", () => {
    const entry = buildAuditEntry({ issue: makeIssue("SW-1"), evidence: [], existingZephyrIds: [], index });
    expect(entry.status).toBe("no-mapping");
    expect(entry.recommendedAction).toBe("review");
    expect(entry.expectedZephyrIds).toEqual([]);
    expect(entry.notes[0]).toMatch(/No story in the repository is attributed to this issue \(Jira status: Open\)/);
  });

  it("keeps low-only candidates out of expectedZephyrIds, asks for review and caps long id lists", () => {
    const ids = Array.from({ length: 12 }, (_, i) => `SW-T${100 + i}`);
    const stories = ids.map((id, i) => makeStory(FILE, `S${i}`, { zephyrIds: [id], declarationLine: 10 + i * 10 }));
    const lowIndex = makeIndex([makeFile(FILE, stories, { componentName: "Tree" })]);
    const lowIssue = makeIssue("SW-7", { summary: "Tree polish" });
    const entry = buildAuditEntry({
      issue: lowIssue,
      evidence: deriveEvidence(lowIndex, lowIssue),
      existingZephyrIds: [],
      index: lowIndex,
    });
    expect(entry.expectedZephyrIds).toEqual([]);
    expect(entry.confidence).toBe("low");
    expect(entry.status).toBe("manual-review");
    expect(entry.notes.join("\n")).toMatch(/Only low-confidence candidates were found \(SW-T100, .*… \(12 total\)\)/);
  });

  it("notes stories attributed to the issue that still have no Zephyr id", () => {
    const pending = makeStory(FILE, "Pending", {
      zephyrIds: [],
      hasEmptyZephyrId: true,
      declarationLine: 40,
      startLine: 40,
      endLine: 44,
    });
    const pendingIndex = makeIndex([makeFile(FILE, [story, pending])], {
      commits: { [FILE]: [featCommit] },
      blame: { [FILE]: mergeBlame(blameStory(story, featCommit), blameStory(pending, featCommit)) },
      origin: { [FILE]: featCommit },
    });
    const entry = buildAuditEntry({
      issue,
      evidence: deriveEvidence(pendingIndex, issue),
      existingZephyrIds: [],
      index: pendingIndex,
    });
    expect(entry.notes.join("\n")).toMatch(/"Pending".*has no Zephyr ID yet/);
  });
});

describe("reviewIssueType", () => {
  it("suggests re-typing a Task that the repository gives test cases to", () => {
    const review = reviewIssueType("Task", 5, "needs-changes");
    expect(review).toMatchObject({ signal: "retype-to-story-or-bug" });
    expect(review?.detail).toContain("Task with 5 test case(s)");
    expect(review?.detail).toMatch(/usually a Story or a Bug/);
  });

  it("stays quiet for a Task the repository maps to nothing", () => {
    expect(reviewIssueType("Task", 0, "no-mapping")).toBeUndefined();
    expect(reviewIssueType("Spike", 0, "manual-review")).toBeUndefined();
  });

  it("flags a Story or Bug the repository maps to nothing", () => {
    expect(reviewIssueType("Story", 0, "no-mapping")).toMatchObject({ signal: "missing-coverage" });
    expect(reviewIssueType("Bug", 0, "no-mapping")?.detail).toMatch(/needs test coverage, or it is really a Task/);
    expect(reviewIssueType("Defect", 0, "no-mapping")?.signal).toBe("missing-coverage");
  });

  it("stays quiet when a Story has coverage, whatever its status", () => {
    expect(reviewIssueType("Story", 3, "needs-changes")).toBeUndefined();
    expect(reviewIssueType("Story", 1, "correct")).toBeUndefined();
    expect(reviewIssueType("Story", 0, "manual-review")).toBeUndefined();
  });
});
