import { describe, expect, it } from "vitest";

import { applyApproval } from "../approve";
import { auditArtifactFileName, renderAuditReport } from "../audit/reporter";
import { formatIdList, renderTable } from "../shared/table";

import { makeArtifact, makeEntry } from "./fixtures";

describe("auditArtifactFileName", () => {
  const at = "2026-09-10T18:42:00.123Z";
  it("names single-scope artifacts after the scope value and sanitises characters", () => {
    expect(auditArtifactFileName({ type: "epic", values: ["SW-2301"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-epic-SW-2301.json",
    );
    expect(auditArtifactFileName({ type: "fix-version", values: ["ts-lib-ui-kit:v1.1.0"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-fix-version-ts-lib-ui-kit-v1.1.0.json",
    );
    expect(auditArtifactFileName({ type: "keys", values: ["SW-1", "SW-2"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-keys-SW-1-SW-2.json",
    );
  });
  it("falls back to a timestamp for multi-value and JQL scopes", () => {
    expect(auditArtifactFileName({ type: "epic", values: ["SW-1", "SW-2"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-epic-multi-2026-09-10T18-42-00Z.json",
    );
    expect(auditArtifactFileName({ type: "jql", values: ["project = SW"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-jql-2026-09-10T18-42-00Z.json",
    );
    expect(auditArtifactFileName({ type: "keys", values: ["SW-1", "SW-2", "SW-3", "SW-4"], issueTypes: [] }, at)).toBe(
      "zephyr-audit-keys-multi-2026-09-10T18-42-00Z.json",
    );
  });
});

describe("renderAuditReport", () => {
  it("prints the scope, one row per ticket, unexpected links, skipped issues and the summary", () => {
    const artifact = makeArtifact(
      [
        makeEntry({
          jira: "SW-1",
          existingZephyrIdsAtAudit: ["SW-T1"],
          expectedZephyrIds: ["SW-T1", "SW-T2"],
          missingZephyrIds: ["SW-T2"],
        }),
        makeEntry({
          jira: "SW-2",
          issueType: "Bug",
          existingZephyrIdsAtAudit: ["SW-T9"],
          expectedZephyrIds: ["SW-T3"],
          missingZephyrIds: ["SW-T3"],
          unexpectedZephyrIds: ["SW-T9"],
          confidence: "medium",
          recommendedAction: "review",
          status: "manual-review",
        }),
      ],
      { skipped: [{ jira: "SW-3", issueType: "Epic", reason: "not audited" }] },
    );
    const report = renderAuditReport(artifact, {
      labels: ["SW-100 (Release epic)"],
      artifactPath: "artifacts/x.json",
      totalResolved: 3,
    });
    expect(report).toContain("Epic: SW-100 (Release epic)");
    expect(report).toContain("Issues resolved: 3 (2 audited, 1 skipped by issue type)");
    expect(report).toMatch(/JIRA\s+TYPE\s+EXISTING\s+EXPECTED\s+MISSING\s+CONFIDENCE\s+ACTION/);
    expect(report).toMatch(/SW-1\s+Story\s+·\s+SW-T1\s+SW-T1,SW-T2\s+SW-T2\s+exact\s+ADD/);
    expect(report).toMatch(/SW-2\s+Bug\s+·\s+SW-T9\s+SW-T3\s+SW-T3\s+medium\s+REVIEW/);
    expect(report).toContain("SW-2: SW-T9");
    expect(report).toContain("SW-3 (Epic)");
    expect(report).toContain("Tickets scanned: 2");
    expect(report).toContain("Needs changes: 1");
    expect(report).toContain("Manual review: 1");
    expect(report).toContain("Coverage gaps: 0 of 2 Story/Bug/Defect (·) issue(s) map to no story");
    expect(report).toContain("Artifact: artifacts/x.json");
  });
});

describe("table helpers", () => {
  it("pads columns and abbreviates long id lists", () => {
    expect(renderTable(["A", "BB"], [["xxx", "y"]])).toBe("A    BB\nxxx  y");
    expect(formatIdList([])).toBe("-");
    expect(formatIdList(["a", "b", "c", "d", "e"])).toBe("a,b,c,+2");
  });
});

describe("renderAuditReport issue types", () => {
  it("marks only coverage-expected types and names the unmapped ones", () => {
    const report = renderAuditReport(
      makeArtifact([
        makeEntry({
          jira: "SW-1",
          issueType: "Task",
          expectedZephyrIds: [],
          missingZephyrIds: [],
          status: "no-mapping",
          recommendedAction: "review",
        }),
        makeEntry({
          jira: "SW-2",
          issueType: "Bug",
          expectedZephyrIds: [],
          missingZephyrIds: [],
          status: "no-mapping",
          recommendedAction: "review",
        }),
        makeEntry({
          jira: "SW-3",
          issueType: "Spike",
          expectedZephyrIds: [],
          missingZephyrIds: [],
          status: "no-mapping",
          recommendedAction: "review",
        }),
      ]),
    );
    expect(report).toMatch(/SW-1\s+Task\s+-/);
    expect(report).toMatch(/SW-2\s+Bug\s+·\s+-/);
    expect(report).toContain("Coverage gaps: 1 of 1 Story/Bug/Defect (·) issue(s) map to no story: SW-2");
  });
});
describe("applyApproval", () => {
  const artifact = makeArtifact([
    makeEntry({ jira: "SW-1" }),
    makeEntry({ jira: "SW-2", confidence: "low", recommendedAction: "review", status: "manual-review" }),
    makeEntry({ jira: "SW-3", missingZephyrIds: [], recommendedAction: "none", status: "correct" }),
  ]);

  it("approves applicable entries (case-insensitively) and records a note", () => {
    const updated = applyApproval(artifact, { keys: ["sw-1"], approve: true, note: "QE reviewed" });
    expect(updated.tickets[0]).toMatchObject({ approved: true, reviewNote: "QE reviewed" });
    expect(updated.tickets[1].approved).toBe(false);
    expect(artifact.tickets[0].approved).toBe(false);
  });

  it("refuses low-confidence, no-change and unknown keys without modifying anything", () => {
    expect(() => applyApproval(artifact, { keys: ["SW-2"], approve: true })).toThrow(/low confidence/);
    expect(() => applyApproval(artifact, { keys: ["SW-3"], approve: true })).toThrow(/nothing to add/);
    expect(() => applyApproval(artifact, { keys: ["SW-9"], approve: true })).toThrow(
      /not in this audit's frozen scope/,
    );
  });

  it("can revoke approval", () => {
    const approved = applyApproval(artifact, { keys: ["SW-1"], approve: true });
    expect(applyApproval(approved, { keys: ["SW-1"], approve: false }).tickets[0].approved).toBe(false);
  });
});
