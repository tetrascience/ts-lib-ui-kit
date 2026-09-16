import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { applyApproval, recommendedKeys, runApprove } from "../approve";
import { runReport } from "../report";
import { parseAuditArtifact } from "../shared/audit-schema";
import { escapeCell, renderApplyMarkdown, renderAuditMarkdown, renderRunMarkdown } from "../shared/markdown";
import { redactArtifact } from "../shared/redact";

import { makeArtifact, makeEntry } from "./fixtures";

import type { ApplyArtifact } from "../shared/types";

const JIRA = "https://example.atlassian.net";

const artifact = makeArtifact(
  [
    makeEntry({
      jira: "SW-1",
      summary: "Secret title one",
      existingZephyrIdsAtAudit: ["SW-T1"],
      expectedZephyrIds: ["SW-T1", "SW-T2"],
      missingZephyrIds: ["SW-T2"],
    }),
    makeEntry({
      jira: "SW-2",
      issueType: "Bug",
      summary: "Secret title two",
      expectedZephyrIds: ["SW-T3"],
      missingZephyrIds: ["SW-T3"],
      unexpectedZephyrIds: ["SW-T9"],
      unmanagedZephyrIds: ["SW-T50"],
      confidence: "medium",
      recommendedAction: "review",
      status: "manual-review",
    }),
    makeEntry({
      jira: "SW-3",
      summary: "Secret title three",
      existingZephyrIdsAtAudit: ["SW-T4"],
      expectedZephyrIds: ["SW-T4"],
      missingZephyrIds: [],
      recommendedAction: "none",
      status: "correct",
    }),
    makeEntry({
      jira: "SW-4",
      issueType: "Task",
      summary: "Secret title four",
      expectedZephyrIds: [],
      missingZephyrIds: [],
      confidence: "low",
      recommendedAction: "review",
      status: "no-mapping",
    }),
  ],
  { skipped: [{ jira: "SW-5", issueType: "Epic", reason: "not audited" }] },
);

function makeApply(overrides: Partial<ApplyArtifact> = {}): ApplyArtifact {
  return {
    schemaVersion: 1,
    tool: "jira-zephyr-apply",
    appliedAt: "2026-09-14T10:00:00.000Z",
    auditFile: "zephyr-audit.json",
    auditGeneratedAt: artifact.generatedAt,
    mode: "dry-run",
    minConfidence: "high",
    results: [
      { jira: "SW-1", outcome: "would-apply", added: ["SW-T2"], detail: "dry run: would link SW-T2 to SW-1" },
      { jira: "SW-2", outcome: "skipped-not-approved", added: [], detail: "approved is false" },
    ],
    summary: { "would-apply": 1, "skipped-not-approved": 1 },
    ...overrides,
  };
}

describe("renderAuditMarkdown", () => {
  const markdown = renderAuditMarkdown(artifact);

  it("leads with the scope, the resolved JQL and the summary counts", () => {
    expect(markdown).toContain("## Zephyr coverage audit — Epic: `SW-100`");
    expect(markdown).toContain("- **Resolved JQL:** `parent in (SW-100) ORDER BY key ASC`");
    expect(markdown).toContain("- **Issues:** 4 audited · 1 skipped by issue type (audited types: Story, Task)");
    expect(markdown).toContain("| Tickets scanned | Correct | Needs changes | Manual review | No mapping |");
    expect(markdown).toContain("| 4 | 1 | 1 | 1 | 1 |");
  });

  it("tabulates only the tickets needing changes or review, with Jira links and full id lists", () => {
    expect(markdown).toContain("### Tickets needing changes or review (2)");
    expect(markdown).toContain(
      `| [SW-1](${JIRA}/browse/SW-1) | Story | SW-T1 | SW-T1, SW-T2 | SW-T2 | - | exact | ADD | - |`,
    );
    expect(markdown).toContain(
      `| [SW-2](${JIRA}/browse/SW-2) | Bug | - | SW-T3 | SW-T3 | SW-T9 | medium | REVIEW | - |`,
    );
    expect(markdown).not.toMatch(/^\| \[SW-3\]/m);
    expect(markdown).not.toMatch(/^\| \[SW-4\]/m);
  });

  it("folds correct, unmapped, unmanaged and skipped tickets into collapsed sections", () => {
    expect(markdown).toContain("<summary>Correct — Zephyr already links exactly the expected IDs (1)</summary>");
    expect(markdown).toContain(`[SW-3](${JIRA}/browse/SW-3)`);
    expect(markdown).toMatch(
      /<summary>No repository mapping, but not expected to carry test cases \(1\)<\/summary>\n\n\[SW-4\]\([^)]*\) \(Task\)/,
    );
    expect(markdown).toMatch(
      /<summary>Linked in Zephyr but not managed[^<]*\(1\)<\/summary>\n\n- \[SW-2\][^\n]*: SW-T50/,
    );
    expect(markdown).toMatch(/<summary>Skipped by issue type \(1\)<\/summary>\n\n- \[SW-5\][^\n]*\(Epic\)/);
  });

  it("leads with the coverage gaps that matter and separates the types that need no test case", () => {
    expect(markdown).toContain(
      "**Coverage gaps: 0 of 3 Story/Bug/Defect issue(s)** map to no story in this repository.",
    );
    expect(markdown).toContain("are reported but not expected to carry test cases.");

    const gap = makeArtifact([
      makeEntry({
        jira: "SW-7",
        issueType: "Bug",
        expectedZephyrIds: [],
        missingZephyrIds: [],
        status: "no-mapping",
        recommendedAction: "review",
      }),
      makeEntry({
        jira: "SW-8",
        issueType: "Spike",
        expectedZephyrIds: [],
        missingZephyrIds: [],
        status: "no-mapping",
        recommendedAction: "review",
      }),
    ]);
    const gapMarkdown = renderAuditMarkdown(gap);
    expect(gapMarkdown).toContain("**Coverage gaps: 1 of 1 Story/Bug/Defect issue(s)** map to no story");
    expect(gapMarkdown).toMatch(
      /<summary>Coverage gaps — Story\/Bug\/Defect issues no story in this repository is attributed to \(1\)<\/summary>/,
    );
    expect(gapMarkdown).toMatch(
      /<summary>No repository mapping, but not expected to carry test cases \(1\)<\/summary>/,
    );
  });

  it("never prints Jira ticket titles unless asked (this repository is public)", () => {
    expect(markdown).not.toContain("Secret title");
    const withTitles = renderAuditMarkdown(artifact, { includeSummaries: true });
    expect(withTitles).toContain("| Jira | Type | Summary | Existing |");
    expect(withTitles).toContain("| Secret title one |");
  });

  it("names only the scope type for raw JQL audits, whose criterion may quote Jira text", () => {
    const jql = makeArtifact([artifact.tickets[0]], {
      scope: {
        type: "jql",
        values: ['summary ~ "Secret feature"'],
        resolvedJql: 'summary ~ "Secret feature"',
        issueTypes: ["Story"],
      },
    });
    const markdown = renderAuditMarkdown(jql);
    expect(markdown).toContain("## Zephyr coverage audit — JQL: (raw JQL — see the audit artifact)");
    expect(markdown).not.toContain("Secret feature");
    expect(markdown).not.toContain("Resolved JQL");
  });

  it("says so when nothing is actionable", () => {
    const quiet = makeArtifact([artifact.tickets[2]]);
    expect(renderAuditMarkdown(quiet)).toContain("None — every audited ticket is either already correct");
    expect(renderAuditMarkdown(quiet)).not.toContain("<summary>Skipped");
  });
});

describe("escapeCell", () => {
  it("neutralises pipes and line breaks so cells cannot break the table", () => {
    expect(escapeCell(" a|b\r\nc\nd ")).toBe("a\\|b c d");
    expect(escapeCell("a\\b|c")).toBe("a\\\\b\\|c");
  });
});

describe("renderApplyMarkdown", () => {
  it("shows the mode, outcome counts and one linked row per ticket with escaped detail", () => {
    const apply = makeApply({
      results: [...makeApply().results, { jira: "SW-3", outcome: "error", added: [], detail: "POST /x → 500: a|b" }],
    });
    const markdown = renderApplyMarkdown(apply, { jiraBaseUrl: JIRA });
    expect(markdown).toContain("## Zephyr apply — dry run (min confidence: high)");
    expect(markdown).toContain("- **Audit:** `zephyr-audit.json` generated 2026-09-10T18:00:00.000Z");
    expect(markdown).toContain("| skipped-not-approved | 1 |");
    expect(markdown).toContain("| would-apply | 1 |");
    expect(markdown).toContain(
      `| [SW-1](${JIRA}/browse/SW-1) | would-apply | SW-T2 | dry run: would link SW-T2 to SW-1 |`,
    );
    expect(markdown).toContain(
      "| SW-3 | error | - | POST /x → 500: a\\|b |".replace("| SW-3 |", `| [SW-3](${JIRA}/browse/SW-3) |`),
    );
    expect(renderApplyMarkdown(makeApply({ mode: "execute" }))).toContain("## Zephyr apply — executed");
  });
});

describe("renderRunMarkdown next steps", () => {
  it("tells a workflow user exactly how to preview and write this frozen audit", () => {
    const markdown = renderRunMarkdown(artifact, undefined, { runId: "123" });
    expect(markdown).toContain("### Next steps");
    expect(markdown).toContain("recommends adding 1 link to 1 ticket: SW-1.");
    expect(markdown).toContain("`mode: dry-run` and `audit_run_id: 123`");
    expect(markdown).toContain("`mode: write` and `audit_run_id: 123` with `approve: recommended`");
    expect(markdown).toContain("exactly this frozen audit (4 issue keys)");
  });

  it("falls back to the local commands without a run id", () => {
    const markdown = renderRunMarkdown(artifact);
    expect(markdown).toContain("`yarn jira-zephyr:approve <audit.json> --recommended`");
    expect(markdown).not.toContain("audit_run_id");
  });

  it("explains a dry run and how to turn it into a write", () => {
    const markdown = renderRunMarkdown(artifact, makeApply(), { runId: "123" });
    expect(markdown).toContain("## Zephyr apply — dry run");
    expect(markdown).toContain("Dry run: 1 link across 1 ticket would be created.");
    expect(markdown).toContain("To create them, run the workflow again with `mode: write` and `audit_run_id: 123`");
    const nothing = renderRunMarkdown(
      artifact,
      makeApply({ results: [makeApply().results[1]], summary: { "skipped-not-approved": 1 } }),
    );
    expect(nothing).toContain("Dry run: nothing would be written");
  });

  it("reports what an execute run created and what still needs a human", () => {
    const executed = makeApply({
      mode: "execute",
      results: [
        { jira: "SW-1", outcome: "applied", added: ["SW-T2"], detail: "linked SW-T2" },
        { jira: "SW-2", outcome: "stale", added: [], detail: "links changed" },
      ],
      summary: { applied: 1, stale: 1 },
    });
    const markdown = renderRunMarkdown(artifact, executed, { runId: "123" });
    expect(markdown).toContain("Created 1 COVERAGE link across 1 ticket.");
    expect(markdown).toContain("Needs attention — stale, manual-review or error, see the detail column: SW-2.");
    expect(markdown).not.toContain("audit_run_id");
  });

  it("says when there is nothing the tool can write automatically", () => {
    const reviewOnly = makeArtifact([artifact.tickets[1], artifact.tickets[3]]);
    expect(renderRunMarkdown(reviewOnly, undefined, { runId: "123" })).toContain(
      "Nothing the tool can write automatically",
    );
  });
});

describe("redactArtifact", () => {
  it("blanks Jira titles and nothing else, leaving a schema-valid, applicable audit", () => {
    const redacted = redactArtifact(artifact);
    expect(redacted.tickets.map((ticket) => ticket.summary)).toEqual(["", "", "", ""]);
    expect(redacted.tickets.map(({ summary: _, ...rest }) => rest)).toEqual(
      artifact.tickets.map(({ summary: _, ...rest }) => rest),
    );
    expect(artifact.tickets[0].summary).toBe("Secret title one");
    expect(() => parseAuditArtifact(redacted)).not.toThrow();
  });
});

describe("approve --recommended", () => {
  it("selects exactly the entries the audit recommends ADD", () => {
    expect(recommendedKeys(artifact)).toEqual(["SW-1"]);
    const updated = applyApproval(artifact, { keys: [], approve: true, recommended: true, note: "ci" });
    expect(updated.tickets.map((ticket) => ticket.approved)).toEqual([true, false, false, false]);
    expect(updated.tickets[0].reviewNote).toBe("ci");
  });

  it("--exclusive resets every approval outside the selection", () => {
    const previously = {
      ...artifact,
      tickets: artifact.tickets.map((ticket) => ({ ...ticket, approved: true, reviewNote: "old" })),
    };
    const updated = applyApproval(previously, { keys: ["SW-1"], approve: true, exclusive: true, note: "new" });
    expect(updated.tickets.map((ticket) => ticket.approved)).toEqual([true, false, false, false]);
    expect(updated.tickets[0].reviewNote).toBe("new");
    expect(updated.tickets[1].reviewNote).toBeUndefined();
    expect(() => applyApproval(previously, { keys: ["SW-1"], approve: false, exclusive: true })).toThrow(/--exclusive/);
  });

  it("combines with explicit keys and still refuses inapplicable explicit keys", () => {
    const updated = applyApproval(artifact, { keys: ["sw-1"], approve: true, recommended: true });
    expect(updated.tickets[0].approved).toBe(true);
    expect(() => applyApproval(artifact, { keys: ["SW-4"], approve: true, recommended: true })).toThrow(
      /low confidence/,
    );
  });
});

describe("report and approve CLIs", () => {
  let dir: string;
  let auditPath: string;
  const quiet = () => {};

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "jira-zephyr-report-"));
    auditPath = path.join(dir, "audit.json");
    fs.writeFileSync(auditPath, JSON.stringify(artifact, null, 2));
  });
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("prints Markdown to stdout by default and to --out when asked", () => {
    const out: string[] = [];
    runReport([auditPath], { out: (message) => out.push(message), log: quiet });
    expect(out.join("\n")).toContain("## Zephyr coverage audit — Epic: `SW-100`");

    const mdPath = path.join(dir, "nested", "report.md");
    runReport([auditPath, "--out", mdPath, "--with-summaries"], { out: quiet, log: quiet });
    const written = fs.readFileSync(mdPath, "utf8");
    expect(written).toContain("### Next steps");
    expect(written).toContain("Secret title one");
  });

  it("appends to $GITHUB_STEP_SUMMARY and writes a redacted upload copy", () => {
    const summaryPath = path.join(dir, "step-summary.md");
    const redactedPath = path.join(dir, "upload", "zephyr-audit.json");
    const env = { GITHUB_STEP_SUMMARY: summaryPath };
    runReport([auditPath, "--github-summary", "--run-id", "42", "--redacted-copy", redactedPath], {
      env,
      out: quiet,
      log: quiet,
    });
    runReport([auditPath, "--github-summary"], { env, out: quiet, log: quiet });
    const summary = fs.readFileSync(summaryPath, "utf8");
    expect(summary.match(/## Zephyr coverage audit/g)).toHaveLength(2);
    expect(summary).toContain("`audit_run_id: 42`");
    expect(summary).not.toContain("Secret title");

    const redacted = parseAuditArtifact(JSON.parse(fs.readFileSync(redactedPath, "utf8")));
    expect(redacted.tickets.every((ticket) => ticket.summary === "")).toBe(true);
    expect(redacted.scopeSnapshot).toEqual(artifact.scopeSnapshot);
  });

  it("includes a matching apply result and rejects one from another audit", () => {
    const applyPath = path.join(dir, "apply.json");
    fs.writeFileSync(applyPath, JSON.stringify(makeApply()));
    const result = runReport([auditPath, "--apply", applyPath], { out: quiet, log: quiet });
    expect(result?.markdown).toContain("## Zephyr apply — dry run");

    fs.writeFileSync(applyPath, JSON.stringify(makeApply({ auditGeneratedAt: "2026-01-01T00:00:00.000Z" })));
    expect(() => runReport([auditPath, "--apply", applyPath], { out: quiet, log: quiet })).toThrow(/different audit/);
  });

  it("validates its arguments", () => {
    expect(() => runReport([], { out: quiet, log: quiet })).toThrow(/exactly one audit artifact/);
    expect(() => runReport([auditPath, "--out", "x.md", "--github-summary"], { out: quiet, log: quiet })).toThrow(
      /mutually exclusive/,
    );
    expect(() =>
      runReport([auditPath, "--github-summary", "--with-summaries"], {
        env: { GITHUB_STEP_SUMMARY: path.join(dir, "never-written.md") },
        out: quiet,
        log: quiet,
      }),
    ).toThrow(/must not carry Jira titles/);
    expect(() => runReport([auditPath, "--github-summary"], { env: {}, out: quiet, log: quiet })).toThrow(
      /GITHUB_STEP_SUMMARY/,
    );
    const out: string[] = [];
    expect(runReport(["--help"], { out: (message) => out.push(message) })).toBeNull();
    expect(out[0]).toContain("Usage:");
  });

  it("approve --recommended writes the approvals back and reports them", () => {
    const messages: string[] = [];
    runApprove([auditPath, "--recommended", "--note", "approved via run 7"], (message) => messages.push(message));
    expect(messages[0]).toMatch(/^Approved SW-1 in /);
    const saved = parseAuditArtifact(JSON.parse(fs.readFileSync(auditPath, "utf8")));
    expect(saved.tickets[0]).toMatchObject({ approved: true, reviewNote: "approved via run 7" });
    expect(saved.tickets.slice(1).every((ticket) => !ticket.approved)).toBe(true);

    const reviewOnlyPath = path.join(dir, "review-only.json");
    fs.writeFileSync(reviewOnlyPath, JSON.stringify(makeArtifact([artifact.tickets[1]])));
    const before = fs.readFileSync(reviewOnlyPath, "utf8");
    runApprove([reviewOnlyPath, "--recommended"], (message) => messages.push(message));
    expect(messages[1]).toMatch(/No ticket has an ADD recommendation .*; nothing to approve$/);
    expect(fs.readFileSync(reviewOnlyPath, "utf8")).toBe(before);

    const staleApprovalsPath = path.join(dir, "stale-approvals.json");
    fs.writeFileSync(
      staleApprovalsPath,
      JSON.stringify({ ...artifact, tickets: artifact.tickets.map((ticket) => ({ ...ticket, approved: true })) }),
    );
    runApprove([staleApprovalsPath, "--recommended", "--exclusive"], (message) => messages.push(message));
    expect(messages[2]).toMatch(/^Approved SW-1; cleared prior approval of SW-2, SW-3, SW-4 in /);
    const exclusive = parseAuditArtifact(JSON.parse(fs.readFileSync(staleApprovalsPath, "utf8")));
    expect(exclusive.tickets.map((ticket) => ticket.approved)).toEqual([true, false, false, false]);
    expect(() => runApprove([auditPath], quiet)).toThrow(/at least one issue key \(or --recommended\)/);
  });
});
