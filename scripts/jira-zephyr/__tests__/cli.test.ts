import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runApplyCli } from "../apply/apply";
import { runApprove } from "../approve";
import { runAudit } from "../audit/audit";
import { displayPath } from "../shared/paths";

import { blameStory, makeCommit, makeFile, makeIndex, makeIssue, makeStory } from "./fixtures";

import type { ApplyClients } from "../apply/writer";

const FILE = "src/components/ui/tree.stories.tsx";
const featCommit = makeCommit("aaaa", "feat: SW-1 Add Tree (#1)", ["SW-1"]);
const epic = makeIssue("SW-100", { summary: "Release epic", issuetype: { name: "Epic", hierarchyLevel: 1 } });
const storyIssue = makeIssue("SW-1", { summary: "Add Tree" });
const emptyIssue = makeIssue("SW-2", { summary: "Docs only" });

function fakeJira() {
  return {
    baseUrl: "https://example.atlassian.net",
    getIssue: vi.fn(async (key: string) => [epic, storyIssue, emptyIssue].find((issue) => issue.key === key) ?? null),
    getProjectVersions: vi.fn(async () => []),
    searchAll: vi.fn(async () => [storyIssue, emptyIssue]),
  };
}

function fakeIndex() {
  const story = makeStory(FILE, "Default", { zephyrIds: ["SW-T1"] });
  return makeIndex([makeFile(FILE, [story])], {
    commits: { [FILE]: [featCommit] },
    blame: { [FILE]: blameStory(story, featCommit) },
    origin: { [FILE]: featCommit },
  });
}

describe("audit → approve → apply, end to end with injected clients", () => {
  let dir: string;
  let auditPath: string;
  const linked: Array<[string, string]> = [];
  const quiet = () => {};

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "jira-zephyr-cli-"));
    auditPath = path.join(dir, "audit.json");
  });
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("audits an epic into a frozen, schema-valid artifact and prints the report", async () => {
    const out: string[] = [];
    const zephyrClient = {
      readOnly: true,
      getLinkedTestCaseKeys: vi.fn(async () => []),
      getTestCase: vi.fn(async (key: string) => ({ key, name: key })),
    };
    const result = await runAudit(["--epic", "sw-100", "--out", auditPath], {
      cwd: dir,
      jira: fakeJira(),
      zephyr: { client: zephyrClient, baseUrl: "https://zephyr.example/v2", projectKey: "SW" },
      index: fakeIndex(),
      repoState: { head: "b".repeat(40), branch: "main", dirty: false },
      now: () => new Date("2026-09-10T18:00:00.000Z"),
      log: quiet,
      out: (message) => out.push(message),
    });

    expect(result?.artifactPath).toBe(auditPath);
    const written = JSON.parse(fs.readFileSync(auditPath, "utf8"));
    expect(written.scope).toEqual({
      type: "epic",
      values: ["SW-100"],
      resolvedJql: "parent in (SW-100) ORDER BY key ASC",
      issueTypes: ["Story", "Task", "Bug", "Defect", "Spike"],
    });
    expect(written.scopeSnapshot.issueKeys).toEqual(["SW-1", "SW-2"]);
    expect(
      written.tickets.map((t: { jira: string; status: string; recommendedAction: string }) => [
        t.jira,
        t.status,
        t.recommendedAction,
      ]),
    ).toEqual([
      ["SW-1", "needs-changes", "add"],
      ["SW-2", "no-mapping", "review"],
    ]);
    expect(written.tickets[0].missingZephyrIds).toEqual(["SW-T1"]);
    expect(written.tickets.every((t: { approved: boolean }) => t.approved === false)).toBe(true);
    expect(written.summary).toEqual({ ticketsScanned: 2, correct: 0, needsChanges: 1, manualReview: 0, noMapping: 1 });
    expect(out.join("\n")).toMatch(/Epic: SW-100 \(Release epic\)/);
    expect(out.join("\n")).toMatch(/SW-1\s+Story\s+·\s+-\s+SW-T1\s+SW-T1\s+exact\s+ADD/);
    expect(zephyrClient.getTestCase).toHaveBeenCalledWith("SW-T1");
  });

  it("refuses to audit through a client that is not read-only", async () => {
    await expect(
      runAudit(["SW-1"], {
        cwd: dir,
        jira: fakeJira(),
        zephyr: {
          client: { readOnly: false, getLinkedTestCaseKeys: async () => [], getTestCase: async () => null },
          baseUrl: "https://zephyr.example/v2",
          projectKey: "SW",
        },
        index: fakeIndex(),
        log: quiet,
        out: quiet,
      }),
    ).rejects.toThrow(/read-only/);
  });

  it("prints help without touching Jira", async () => {
    const out: string[] = [];
    const jira = fakeJira();
    expect(await runAudit(["--help"], { jira, out: (message) => out.push(message), log: quiet })).toBeNull();
    expect(out[0]).toMatch(/^Usage:/);
    expect(jira.searchAll).not.toHaveBeenCalled();
  });

  it("approves a reviewed entry in place", () => {
    const out: string[] = [];
    runApprove([auditPath, "SW-1", "--note", "QE ok"], (message) => out.push(message));
    const written = JSON.parse(fs.readFileSync(auditPath, "utf8"));
    expect(written.tickets[0]).toMatchObject({ approved: true, reviewNote: "QE ok" });
    expect(written.tickets[1].approved).toBe(false);
    expect(out[0]).toMatch(/^Approved SW-1 in /);
    expect(() => runApprove([auditPath, "SW-2"], quiet)).toThrow(/nothing to add/);
  });

  function applyClients(readOnly: boolean): ApplyClients {
    return {
      jira: { getIssue: vi.fn(async (key: string) => (key === "SW-1" ? storyIssue : emptyIssue)) },
      zephyr: {
        readOnly,
        getLinkedTestCaseKeys: vi.fn(async () => linked.map(([id]) => id)),
        getTestCase: vi.fn(async (key: string) => ({ key, name: key })),
        linkTestCaseToIssue: vi.fn(async (testCaseKey: string, issueId: string) => {
          linked.push([testCaseKey, issueId]);
          return { linkId: linked.length, alreadyExisted: false };
        }),
      },
    };
  }

  it("dry-runs by default: re-checks live state, writes a result file, links nothing", async () => {
    const out: string[] = [];
    const run = await runApplyCli([auditPath], {
      clients: applyClients(true),
      now: () => new Date("2026-09-11T09:00:00.000Z"),
      log: quiet,
      out: (message) => out.push(message),
    });
    expect(run?.hadErrors).toBe(false);
    expect(run?.artifact.mode).toBe("dry-run");
    expect(run?.artifact.results.map((r) => [r.jira, r.outcome])).toEqual([
      ["SW-1", "would-apply"],
      ["SW-2", "skipped-not-approved"],
    ]);
    expect(fs.existsSync(run!.resultPath)).toBe(true);
    expect(run!.resultPath.startsWith(dir)).toBe(true);
    expect(linked).toEqual([]);
    expect(out.join("\n")).toMatch(/Dry run — no changes were made/);
  });

  it("creates the approved links with --execute and records them", async () => {
    const run = await runApplyCli([auditPath, "--execute", "--result", path.join(dir, "result.json")], {
      clients: applyClients(false),
      log: quiet,
      out: quiet,
    });
    expect(run?.artifact.mode).toBe("execute");
    expect(run?.artifact.results[0]).toMatchObject({ jira: "SW-1", outcome: "applied", added: ["SW-T1"] });
    expect(linked).toEqual([["SW-T1", storyIssue.id]]);
    expect(JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8")).summary).toEqual({
      applied: 1,
      "skipped-not-approved": 1,
    });

    // Running again is idempotent: the link now exists, so nothing is written.
    const again = await runApplyCli([auditPath, "--execute"], { clients: applyClients(false), log: quiet, out: quiet });
    expect(again?.artifact.results[0].outcome).toBe("already-correct");
    expect(linked).toHaveLength(1);
  });

  it("refuses to apply when the environment points at a different Jira/Zephyr target than the audit", async () => {
    vi.stubEnv("JIRA_EMAIL", "me@example.com");
    vi.stubEnv("JIRA_API_TOKEN", "t");
    vi.stubEnv("ZEPHYR_TOKEN", "z");
    vi.stubEnv("JIRA_BASE_URL", "https://someone-else.atlassian.net");
    try {
      await expect(runApplyCli([auditPath], { log: quiet, out: quiet })).rejects.toThrow(/live targets do not match/);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("rejects an unreadable or invalid artifact before contacting anything", async () => {
    fs.writeFileSync(path.join(dir, "bad.json"), JSON.stringify({ schemaVersion: 1 }));
    const clients = applyClients(true);
    await expect(runApplyCli([path.join(dir, "bad.json")], { clients, log: quiet, out: quiet })).rejects.toThrow(
      /does not match schema/,
    );
    expect(clients.jira.getIssue).not.toHaveBeenCalled();
    await expect(runApplyCli([], { clients, log: quiet, out: quiet })).rejects.toThrow(
      /exactly one audit artifact path/,
    );
  });
});

describe("displayPath", () => {
  it("shows repo-relative paths inside cwd and absolute paths outside it", () => {
    expect(displayPath("/repo/artifacts/a.json", "/repo")).toBe("artifacts/a.json");
    expect(displayPath("/tmp/elsewhere/a.json", "/repo")).toBe("/tmp/elsewhere/a.json");
  });
});
