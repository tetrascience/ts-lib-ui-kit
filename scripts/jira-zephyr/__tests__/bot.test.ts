import { describe, expect, it, vi } from "vitest";

import { buildSuggestions, renderComment, summarizeEvidence } from "../bot/comment";
import { BOT_HANDLE, CONFIDENCE_MARKERS } from "../bot/persona";
import { parseReply, resolveRequest } from "../bot/reply";
import { ANSWER_PREFIX, BOT_SIGNATURE, notify, respond, type CommentReader } from "../bot/service";

import { makeArtifact, makeEntry } from "./fixtures";

import type { JiraComment } from "../clients/jira-comment-client";
import type { Evidence } from "../shared/types";

function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    type: "pr-changed-file",
    confidence: "medium",
    jira: "SW-1",
    file: "src/components/composed/DataAppShell/DataAppShell.stories.tsx",
    zephyrIds: ["SW-T1"],
    detail: "PR #204 (fix: SW-1 thing) changed DataAppShell.tsx; its sibling …",
    ...overrides,
  };
}

function comment(id: string, body: string): JiraComment {
  return { id, body, created: "2026-09-10T00:00:00.000Z", authorDisplayName: "A Human" };
}

function fakeComments(existing: Record<string, JiraComment[]> = {}) {
  const posted: Array<{ issue: string; body: string }> = [];
  const client: CommentReader & { posted: typeof posted } = {
    readOnly: false,
    posted,
    getComments: vi.fn(async (issue: string) => existing[issue] ?? []),
    addComment: vi.fn(async (issue: string, body: string) => {
      posted.push({ issue, body });
      return comment(`new-${posted.length}`, body);
    }),
  };
  return client;
}

describe("summarizeEvidence", () => {
  it("picks the strongest item and counts the rest", () => {
    const result = summarizeEvidence([
      evidence({ confidence: "low", type: "file-touched-by-commit", commit: "abc1234" }),
      evidence({ confidence: "medium" }),
    ]);
    expect(result.confidence).toBe("medium");
    expect(result.evidence).toBe("PR #204 changed code beside DataAppShell.stories.tsx (+1 more)");
  });

  it("degrades gracefully with no evidence at all", () => {
    expect(summarizeEvidence([])).toEqual({ confidence: "low", evidence: "no direct evidence" });
  });
});

describe("renderComment", () => {
  const entry = makeEntry({
    jira: "SW-1",
    missingZephyrIds: ["SW-T1", "SW-T2"],
    expectedZephyrIds: ["SW-T1", "SW-T2"],
    evidence: [evidence({ zephyrIds: ["SW-T1", "SW-T2"] })],
  });

  it("renders a Jira wiki table with confidence markers and the apply invitation", () => {
    const body = renderComment(entry, new Map([["SW-T1", "Shell renders"]]));
    expect(body).toContain("||Test case||Title||");
    expect(body).toContain(`${CONFIDENCE_MARKERS.medium} SW-T1|Shell renders|`);
    expect(body).toContain(`@${BOT_HANDLE} apply`);
    expect(body).toContain("🟡 fairly sure");
  });

  /** A shared reason down every row wastes the widest column; say it once. */
  it("hoists a reason shared by every row out of the table", () => {
    const body = renderComment(entry) ?? "";
    expect(body).toContain("All of these: PR #204 changed code beside DataAppShell.stories.tsx.");
    expect(body).not.toContain("||Why I think so||");
  });

  it("keeps the why column when reasons differ", () => {
    const mixed = makeEntry({
      jira: "SW-1",
      missingZephyrIds: ["SW-T1", "SW-T2"],
      expectedZephyrIds: ["SW-T1", "SW-T2"],
      evidence: [
        evidence({ zephyrIds: ["SW-T1"] }),
        evidence({ zephyrIds: ["SW-T2"], type: "story-reference", confidence: "exact", commit: "abc1234" }),
      ],
    });
    expect(renderComment(mixed)).toContain("||Test case||Title||Why I think so||");
  });

  /** Silence beats a "nothing to report" comment on every audited ticket. */
  it("says nothing when there is nothing missing", () => {
    expect(renderComment(makeEntry({ jira: "SW-1", missingZephyrIds: [] }))).toBeNull();
  });

  it("escapes a pipe in a title so the table cannot break", () => {
    const body = renderComment(entry, new Map([["SW-T1", "a | b"]])) ?? "";
    expect(body).toContain("a \\| b");
  });

  it("only ever offers the missing ids, never ones already linked", () => {
    const partly = makeEntry({
      jira: "SW-1",
      expectedZephyrIds: ["SW-T1", "SW-T2"],
      existingZephyrIdsAtAudit: ["SW-T1"],
      missingZephyrIds: ["SW-T2"],
      evidence: [evidence({ zephyrIds: ["SW-T1", "SW-T2"] })],
    });
    expect(buildSuggestions(partly).map((item) => item.zephyrId)).toEqual(["SW-T2"]);
  });
});

describe("parseReply", () => {
  it("recognises an apply command addressed to the bot", () => {
    expect(parseReply(`@${BOT_HANDLE} apply`)).toEqual({ kind: "apply", ids: "all" });
    expect(parseReply(`  @${BOT_HANDLE}  APPLY  `)).toEqual({ kind: "apply", ids: "all" });
    expect(parseReply(`[~accountid:123] ${BOT_HANDLE} apply`)).toEqual({ kind: "apply", ids: "all" });
  });

  it("reads an explicit id list", () => {
    expect(parseReply(`@${BOT_HANDLE} apply SW-T5 SW-T3`)).toEqual({ kind: "apply", ids: ["SW-T3", "SW-T5"] });
  });

  /**
   * The trust boundary: anyone who can comment can trigger a Zephyr write, so a
   * mention that is not a command at the start of the comment must not count.
   */
  it("ignores a mention that is not an opening command", () => {
    expect(parseReply(`I think @${BOT_HANDLE} apply is wrong here`).kind).toBe("none");
    expect(parseReply("apply these please").kind).toBe("none");
    expect(parseReply("@someoneelse apply").kind).toBe("none");
    expect(parseReply("").kind).toBe("none");
  });

  it("reports an unknown verb rather than guessing", () => {
    expect(parseReply(`@${BOT_HANDLE} yolo`)).toEqual({ kind: "unknown", verb: "yolo" });
  });
});

describe("resolveRequest", () => {
  it("applies everything suggested when no ids are named", () => {
    expect(resolveRequest({ kind: "apply", ids: "all" }, ["SW-T1", "SW-T2"])).toEqual({
      ids: ["SW-T1", "SW-T2"],
      rejected: [],
    });
  });

  /** A reply chooses among suggestions; it can never author a new link. */
  it("rejects ids the bot never suggested", () => {
    expect(resolveRequest({ kind: "apply", ids: ["SW-T1", "SW-T999"] }, ["SW-T1"])).toEqual({
      ids: ["SW-T1"],
      rejected: ["SW-T999"],
    });
  });
});

describe("notify", () => {
  const artifact = makeArtifact([
    makeEntry({
      jira: "SW-1",
      missingZephyrIds: ["SW-T1"],
      expectedZephyrIds: ["SW-T1"],
      evidence: [evidence({ zephyrIds: ["SW-T1"] })],
    }),
  ]);

  it("dry-runs without writing and returns the body it would post", async () => {
    const comments = fakeComments();
    const [result] = await notify(artifact, { comments }, { execute: false });
    expect(result.outcome).toBe("would-post");
    expect(result.body).toContain("SW-T1");
    expect(comments.addComment).not.toHaveBeenCalled();
  });

  it("posts a signed comment when executing", async () => {
    const comments = fakeComments();
    const [result] = await notify(artifact, { comments }, { execute: true });
    expect(result.outcome).toBe("posted");
    expect(comments.posted[0].issue).toBe("SW-1");
    expect(comments.posted[0].body).toContain(BOT_SIGNATURE);
  });

  /** Re-running is the normal mode (a cron job), so it must not re-comment. */
  it("skips an issue it has already commented on, unless forced", async () => {
    const existing = { "SW-1": [comment("1", `old suggestion\n\n${BOT_SIGNATURE}`)] };
    const [skipped] = await notify(artifact, { comments: fakeComments(existing) }, { execute: true });
    expect(skipped.outcome).toBe("already-commented");

    const forced = fakeComments(existing);
    const [again] = await notify(artifact, { comments: forced }, { execute: true, force: true });
    expect(again.outcome).toBe("posted");
  });

  it("stays silent on entries with nothing missing", async () => {
    const quiet = makeArtifact([makeEntry({ jira: "SW-1", missingZephyrIds: [] })]);
    const comments = fakeComments();
    const [result] = await notify(quiet, { comments }, { execute: true });
    expect(result.outcome).toBe("nothing-to-say");
    expect(comments.addComment).not.toHaveBeenCalled();
  });

  it("still posts when a title lookup fails", async () => {
    const comments = fakeComments();
    const zephyr = {
      getTestCase: vi.fn(async () => {
        throw new Error("zephyr down");
      }),
    };
    const [result] = await notify(artifact, { comments, zephyr }, { execute: true });
    expect(result.outcome).toBe("posted");
  });
});

describe("respond", () => {
  const artifact = makeArtifact([
    makeEntry({
      jira: "SW-1",
      jiraIssueId: "1001",
      missingZephyrIds: ["SW-T1", "SW-T2"],
      expectedZephyrIds: ["SW-T1", "SW-T2"],
      confidence: "exact",
      approved: false,
      evidence: [evidence({ zephyrIds: ["SW-T1", "SW-T2"], confidence: "exact", type: "story-reference" })],
    }),
  ]);

  function applyClients() {
    return {
      jira: { getIssue: vi.fn(async () => ({ id: "1001", key: "SW-1", fields: {} }) as never) },
      zephyr: {
        readOnly: false,
        getLinkedTestCaseKeys: vi.fn(async () => []),
        getTestCase: vi.fn(async (key: string) => ({ key, name: key })),
        linkTestCaseToIssue: vi.fn(async () => ({ alreadyExisted: false, linkId: 1 })),
      },
    };
  }

  it("does nothing when no one has replied", async () => {
    const [result] = await respond(artifact, { comments: fakeComments() }, { execute: true });
    expect(result.outcome).toBe("no-request");
  });

  it("applies what a reply asks for and answers", async () => {
    const comments = fakeComments({ "SW-1": [comment("c1", `@${BOT_HANDLE} apply`)] });
    const apply = applyClients();
    const [result] = await respond(artifact, { comments, apply }, { execute: true });

    expect(result.outcome).toBe("applied");
    expect(result.requested).toEqual(["SW-T1", "SW-T2"]);
    expect(apply.zephyr.linkTestCaseToIssue).toHaveBeenCalledTimes(2);
    // The answer records which comment it answers, so a re-run stays idempotent.
    expect(comments.posted[0].body).toContain(`${ANSWER_PREFIX}c1 `);
  });

  it("does not answer the same reply twice", async () => {
    const comments = fakeComments({
      "SW-1": [
        comment("c1", `@${BOT_HANDLE} apply`),
        comment("c2", `done\n\n${BOT_SIGNATURE}\n${ANSWER_PREFIX}c1 -->`),
      ],
    });
    const [result] = await respond(artifact, { comments, apply: applyClients() }, { execute: true });
    expect(result.outcome).toBe("no-request");
    expect(comments.addComment).not.toHaveBeenCalled();
  });

  it("refuses ids it never suggested, and writes nothing", async () => {
    const comments = fakeComments({ "SW-1": [comment("c1", `@${BOT_HANDLE} apply SW-T999`)] });
    const apply = applyClients();
    const [result] = await respond(artifact, { comments, apply }, { execute: true });

    expect(result.outcome).toBe("rejected");
    expect(apply.zephyr.linkTestCaseToIssue).not.toHaveBeenCalled();
    expect(comments.posted[0].body).toContain("SW-T999");
  });

  it("dry-runs a reply without linking or answering", async () => {
    const comments = fakeComments({ "SW-1": [comment("c1", `@${BOT_HANDLE} apply`)] });
    const apply = applyClients();
    const [result] = await respond(artifact, { comments, apply }, { execute: false });

    expect(result.outcome).toBe("would-apply");
    expect(apply.zephyr.linkTestCaseToIssue).not.toHaveBeenCalled();
    expect(comments.addComment).not.toHaveBeenCalled();
  });

  it("obeys the confidence gate that guards the CLI", async () => {
    const weak = makeArtifact([
      makeEntry({
        jira: "SW-1",
        jiraIssueId: "1001",
        missingZephyrIds: ["SW-T1"],
        expectedZephyrIds: ["SW-T1"],
        confidence: "medium",
        evidence: [evidence({ zephyrIds: ["SW-T1"] })],
      }),
    ]);
    const comments = fakeComments({ "SW-1": [comment("c1", `@${BOT_HANDLE} apply`)] });
    const apply = applyClients();
    await respond(weak, { comments, apply }, { execute: true, minConfidence: "high" });
    expect(apply.zephyr.linkTestCaseToIssue).not.toHaveBeenCalled();
  });
});
