import { describe, expect, it } from "vitest";

import { assertTargetsMatch, gateEntry, parseMinConfidence, validateAuditArtifact } from "../apply/validator";
import { parseAuditArtifact } from "../shared/audit-schema";

import { makeArtifact, makeEntry } from "./fixtures";

describe("audit schema", () => {
  it("round-trips a valid artifact through JSON", () => {
    const artifact = makeArtifact([makeEntry()]);
    expect(parseAuditArtifact(JSON.parse(JSON.stringify(artifact)))).toEqual(artifact);
  });

  it("lists every schema violation in a readable error", () => {
    const broken = { ...makeArtifact([makeEntry({ jira: "not-a-key" })]), schemaVersion: 2 };
    expect(() => parseAuditArtifact(broken)).toThrow(/schemaVersion/);
    expect(() => parseAuditArtifact(broken)).toThrow(/tickets\.0\.jira/);
  });
});

describe("validateAuditArtifact", () => {
  it("accepts a consistent artifact", () => {
    expect(() => validateAuditArtifact(makeArtifact([makeEntry()]))).not.toThrow();
  });

  it("rejects tickets outside the frozen snapshot and snapshot keys without an entry", () => {
    const artifact = makeArtifact([makeEntry({ jira: "SW-1" })]);
    artifact.scopeSnapshot.issueKeys = ["SW-2"];
    expect(() => validateAuditArtifact(artifact)).toThrow(/SW-1 is not in scopeSnapshot/);
    expect(() => validateAuditArtifact(artifact)).toThrow(/SW-2 has no ticket entry/);
  });

  it("rejects duplicates and inconsistent id sets", () => {
    const duplicate = makeArtifact([makeEntry({ jira: "SW-1" }), makeEntry({ jira: "SW-1" })]);
    duplicate.scopeSnapshot.issueKeys = ["SW-1", "SW-1"];
    expect(() => validateAuditArtifact(duplicate)).toThrow(/duplicates/);
    expect(() => validateAuditArtifact(duplicate)).toThrow(/duplicate ticket entry/);

    const inconsistent = makeArtifact([
      makeEntry({ expectedZephyrIds: ["SW-T1"], missingZephyrIds: ["SW-T2"], existingZephyrIdsAtAudit: ["SW-T2"] }),
    ]);
    expect(() => validateAuditArtifact(inconsistent)).toThrow(/missing id SW-T2 is not in expectedZephyrIds/);
    expect(() => validateAuditArtifact(inconsistent)).toThrow(/already listed in existingZephyrIdsAtAudit/);
  });
});

describe("parseMinConfidence", () => {
  it("defaults to high and forbids low", () => {
    expect(parseMinConfidence()).toBe("high");
    expect(parseMinConfidence("medium")).toBe("medium");
    expect(() => parseMinConfidence("low")).toThrow(/never applied/);
    expect(() => parseMinConfidence("certain")).toThrow(/must be one of/);
  });
});

describe("gateEntry", () => {
  it("requires approval", () => {
    expect(gateEntry(makeEntry({ approved: false }), "high")).toMatchObject({
      proceed: false,
      outcome: "skipped-not-approved",
    });
  });

  it("skips approved entries with nothing to add", () => {
    expect(
      gateEntry(makeEntry({ approved: true, missingZephyrIds: [], recommendedAction: "none" }), "high"),
    ).toMatchObject({ outcome: "skipped-no-changes" });
    expect(
      gateEntry(makeEntry({ approved: true, missingZephyrIds: [], recommendedAction: "review" }), "high"),
    ).toMatchObject({
      outcome: "skipped-no-changes",
      detail: expect.stringContaining("review-only"),
    });
  });

  it("never lets low confidence through and honours the threshold", () => {
    expect(gateEntry(makeEntry({ approved: true, confidence: "low" }), "medium")).toMatchObject({
      outcome: "skipped-below-threshold",
    });
    expect(gateEntry(makeEntry({ approved: true, confidence: "medium" }), "high")).toMatchObject({
      outcome: "skipped-below-threshold",
    });
    expect(gateEntry(makeEntry({ approved: true, confidence: "medium" }), "medium")).toEqual({
      proceed: true,
      toAdd: ["SW-T1"],
    });
    expect(gateEntry(makeEntry({ approved: true, confidence: "exact" }), "high")).toEqual({
      proceed: true,
      toAdd: ["SW-T1"],
    });
  });
});

describe("assertTargetsMatch", () => {
  const artifact = makeArtifact([makeEntry()]);
  const live = {
    jiraBaseUrl: "https://example.atlassian.net/",
    zephyrBaseUrl: "https://api.zephyrscale.smartbear.com/v2",
    zephyrProjectKey: "sw",
  };

  it("accepts the recorded targets, ignoring trailing slashes and key case", () => {
    expect(() => assertTargetsMatch(artifact, live)).not.toThrow();
  });

  it("lists every mismatch and refuses", () => {
    expect(() =>
      assertTargetsMatch(artifact, { ...live, jiraBaseUrl: "https://other.atlassian.net", zephyrProjectKey: "QE" }),
    ).toThrow(/Jira base URL[\s\S]*Zephyr project/);
    expect(() => assertTargetsMatch(artifact, { ...live, zephyrBaseUrl: "https://zephyr.example/v2" })).toThrow(
      /Zephyr base URL/,
    );
  });
});
