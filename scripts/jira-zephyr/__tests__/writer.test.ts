import { describe, expect, it, vi } from "vitest";

import { applyEntry, runApply, summarizeResults, type ApplyClients } from "../apply/writer";

import { makeArtifact, makeEntry, makeIssue } from "./fixtures";

interface FakeOptions {
  live?: string[];
  issueId?: string | null;
  missingCases?: string[];
  readOnly?: boolean;
  linkError?: string;
  linkAlreadyExists?: string[];
}

function fakeClients(options: FakeOptions = {}) {
  const linked: Array<[string, string]> = [];
  const clients: ApplyClients = {
    jira: {
      getIssue: vi.fn(async (key: string) =>
        options.issueId === null ? null : makeIssue(key, { id: options.issueId ?? "1001" }),
      ),
    },
    zephyr: {
      readOnly: options.readOnly ?? false,
      getLinkedTestCaseKeys: vi.fn(async () => options.live ?? []),
      getTestCase: vi.fn(async (key: string) => (options.missingCases?.includes(key) ? null : { key, name: key })),
      linkTestCaseToIssue: vi.fn(async (testCaseKey: string, issueId: string) => {
        if (options.linkError && testCaseKey === options.linkError)
          throw new Error(`POST /testcases/${testCaseKey}/links/issues → 500: boom`);
        linked.push([testCaseKey, issueId]);
        return { linkId: linked.length, alreadyExisted: options.linkAlreadyExists?.includes(testCaseKey) ?? false };
      }),
    },
  };
  return { clients, linked };
}

const approved = makeEntry({
  approved: true,
  expectedZephyrIds: ["SW-T1", "SW-T2"],
  missingZephyrIds: ["SW-T1", "SW-T2"],
  existingZephyrIdsAtAudit: [],
});
const dryRun = { execute: false, minConfidence: "high" as const };
const execute = { execute: true, minConfidence: "high" as const };

describe("applyEntry", () => {
  it("does not touch the network for unapproved entries", async () => {
    const { clients } = fakeClients();
    const result = await applyEntry(makeEntry({ approved: false }), clients, execute);
    expect(result.outcome).toBe("skipped-not-approved");
    expect(clients.jira.getIssue).not.toHaveBeenCalled();
    expect(clients.zephyr.getLinkedTestCaseKeys).not.toHaveBeenCalled();
  });

  it("reports would-apply on a dry run without linking", async () => {
    const { clients, linked } = fakeClients();
    const result = await applyEntry(approved, clients, dryRun);
    expect(result).toMatchObject({ outcome: "would-apply", added: ["SW-T1", "SW-T2"], liveZephyrIds: [] });
    expect(linked).toEqual([]);
  });

  it("links the missing ids by numeric Jira issue id when executing", async () => {
    const { clients, linked } = fakeClients();
    const result = await applyEntry(approved, clients, execute);
    expect(result).toMatchObject({ outcome: "applied", added: ["SW-T1", "SW-T2"], liveZephyrIds: ["SW-T1", "SW-T2"] });
    expect(linked).toEqual([
      ["SW-T1", "1001"],
      ["SW-T2", "1001"],
    ]);
  });

  it("skips duplicates: ids linked since the audit are not re-added, all present means already-correct", async () => {
    const partial = fakeClients({ live: ["SW-T1"] });
    const result = await applyEntry(approved, partial.clients, execute);
    expect(result).toMatchObject({ outcome: "applied", added: ["SW-T2"] });
    expect(partial.linked).toEqual([["SW-T2", "1001"]]);

    const complete = fakeClients({ live: ["SW-T2", "SW-T1"] });
    expect(await applyEntry(approved, complete.clients, execute)).toMatchObject({
      outcome: "already-correct",
      added: [],
    });
    expect(complete.linked).toEqual([]);
  });

  it("refuses stale entries when links were removed or added by someone else", async () => {
    const entry = makeEntry({
      approved: true,
      existingZephyrIdsAtAudit: ["SW-T5"],
      expectedZephyrIds: ["SW-T5", "SW-T1"],
      missingZephyrIds: ["SW-T1"],
    });
    const removed = fakeClients({ live: [] });
    expect(await applyEntry(entry, removed.clients, execute)).toMatchObject({
      outcome: "stale",
      detail: expect.stringContaining("removed: SW-T5"),
    });

    const addedByOthers = fakeClients({ live: ["SW-T5", "SW-T77"] });
    expect(await applyEntry(entry, addedByOthers.clients, execute)).toMatchObject({
      outcome: "stale",
      detail: expect.stringContaining("added by someone else: SW-T77"),
    });
    expect(addedByOthers.linked).toEqual([]);
  });

  it("refuses when the Jira issue id changed or the issue vanished", async () => {
    expect(await applyEntry(approved, fakeClients({ issueId: "9999" }).clients, execute)).toMatchObject({
      outcome: "stale",
      detail: expect.stringContaining("1001 → 9999"),
    });
    expect(await applyEntry(approved, fakeClients({ issueId: null }).clients, execute)).toMatchObject({
      outcome: "manual-review",
    });
  });

  it("asks for manual review when a test case to link no longer exists", async () => {
    const { clients, linked } = fakeClients({ missingCases: ["SW-T2"] });
    expect(await applyEntry(approved, clients, execute)).toMatchObject({
      outcome: "manual-review",
      detail: expect.stringContaining("SW-T2"),
    });
    expect(linked).toEqual([]);
  });

  it("records partial progress when a link call fails mid-way", async () => {
    const { clients } = fakeClients({ linkError: "SW-T2" });
    const result = await applyEntry(approved, clients, execute);
    expect(result).toMatchObject({
      outcome: "error",
      added: ["SW-T1"],
      detail: expect.stringContaining("failed at SW-T2"),
    });
  });

  it("treats Zephyr's already-exists answer as success", async () => {
    const { clients } = fakeClients({ linkAlreadyExists: ["SW-T1"] });
    const result = await applyEntry(approved, clients, execute);
    expect(result).toMatchObject({
      outcome: "applied",
      added: ["SW-T2"],
      detail: expect.stringContaining("already present: SW-T1"),
    });
  });

  it("errors instead of writing through a read-only client", async () => {
    const { clients, linked } = fakeClients({ readOnly: true });
    expect(await applyEntry(approved, clients, execute)).toMatchObject({
      outcome: "error",
      detail: expect.stringContaining("read-only"),
    });
    expect(linked).toEqual([]);
  });

  it("applies medium confidence only when the threshold allows it", async () => {
    const medium = makeEntry({ ...approved, confidence: "medium", recommendedAction: "review" });
    expect(await applyEntry(medium, fakeClients().clients, execute)).toMatchObject({
      outcome: "skipped-below-threshold",
    });
    expect(await applyEntry(medium, fakeClients().clients, { execute: true, minConfidence: "medium" })).toMatchObject({
      outcome: "applied",
    });
    const low = makeEntry({ ...approved, confidence: "low" });
    expect(await applyEntry(low, fakeClients().clients, { execute: true, minConfidence: "medium" })).toMatchObject({
      outcome: "skipped-below-threshold",
    });
  });
});

describe("runApply", () => {
  it("walks only the frozen snapshot, in order, and can be restricted with --only", async () => {
    const artifact = makeArtifact([
      makeEntry({ jira: "SW-1", jiraIssueId: "1001", approved: true }),
      makeEntry({ jira: "SW-2", jiraIssueId: "1002", approved: false }),
      makeEntry({
        jira: "SW-3",
        jiraIssueId: "1003",
        approved: true,
        missingZephyrIds: [],
        recommendedAction: "none",
        status: "correct",
      }),
    ]);
    const { clients } = fakeClients();
    (clients.jira.getIssue as ReturnType<typeof vi.fn>).mockImplementation(async (key: string) =>
      makeIssue(key, { id: String(1000 + Number(key.split("-")[1])) }),
    );

    const results = await runApply(artifact, clients, dryRun);
    expect(results.map((item) => [item.jira, item.outcome])).toEqual([
      ["SW-1", "would-apply"],
      ["SW-2", "skipped-not-approved"],
      ["SW-3", "skipped-no-changes"],
    ]);
    expect(summarizeResults(results)).toEqual({ "would-apply": 1, "skipped-not-approved": 1, "skipped-no-changes": 1 });

    const only = await runApply(artifact, clients, { ...dryRun, only: ["sw-2"] });
    expect(only.map((item) => item.jira)).toEqual(["SW-2"]);
    await expect(runApply(artifact, clients, { ...dryRun, only: ["SW-99"] })).rejects.toThrow(
      /not in the audit's frozen scope: SW-99/,
    );
  });
});
