import { describe, expect, it } from "vitest";

import { combineEvidenceConfidence, meetsThreshold, strongest, weakest } from "../shared/confidence";
import {
  compareIssueKeys,
  extractJiraKeys,
  isJiraKey,
  isZephyrTestCaseKey,
  parseZephyrIds,
  uniqueSorted,
} from "../shared/keys";

describe("keys", () => {
  it("tells Jira keys and Zephyr test case keys apart", () => {
    expect(isJiraKey("SW-2540")).toBe(true);
    expect(isJiraKey("SW-T5655")).toBe(false);
    expect(isZephyrTestCaseKey("SW-T5655")).toBe(true);
    expect(isZephyrTestCaseKey("SW-2540")).toBe(false);
  });

  it("extracts unique Jira keys in order and never matches Zephyr keys", () => {
    const text = "feat: SW-2540 Add Tree (SW-T5655) — see SW-2541 and SW-2540 again";
    expect(extractJiraKeys(text)).toEqual(["SW-2540", "SW-2541"]);
  });

  it("filters key-like prose tokens when project keys are known", () => {
    const text = "Encode as UTF-8, target ES-2020, fixes SW-12 and PUI-5938";
    expect(extractJiraKeys(text, new Set(["SW"]))).toEqual(["SW-12"]);
    expect(extractJiraKeys(text)).toContain("UTF-8");
  });

  it("sorts issue keys numerically within a project", () => {
    expect(["SW-10", "SW-9", "AB-1", "SW-100"].sort(compareIssueKeys)).toEqual(["AB-1", "SW-9", "SW-10", "SW-100"]);
    expect(uniqueSorted(["SW-T10", "SW-T9", "SW-T10"])).toEqual(["SW-T9", "SW-T10"]);
  });

  it("splits comma-separated testCaseId literals", () => {
    expect(parseZephyrIds("SW-T1, SW-T2,,")).toEqual(["SW-T1", "SW-T2"]);
    expect(parseZephyrIds("")).toEqual([]);
  });
});

describe("confidence", () => {
  it("orders low < medium < high < exact", () => {
    expect(meetsThreshold("high", "high")).toBe(true);
    expect(meetsThreshold("medium", "high")).toBe(false);
    expect(meetsThreshold("exact", "medium")).toBe(true);
    expect(strongest(["low", "exact", "medium"])).toBe("exact");
    expect(weakest(["high", "medium", "exact"])).toBe("medium");
    expect(strongest([])).toBeUndefined();
  });

  it("keeps the best single signal", () => {
    expect(combineEvidenceConfidence([{ type: "story-reference", confidence: "exact" }])).toBe("exact");
    expect(combineEvidenceConfidence([{ type: "file-touched-by-commit", confidence: "low" }])).toBe("low");
    expect(combineEvidenceConfidence([])).toBe("low");
  });

  it("promotes two independent medium signals to high, but not the same signal twice", () => {
    expect(
      combineEvidenceConfidence([
        { type: "story-modified-by-commit", confidence: "medium" },
        { type: "file-reference", confidence: "medium" },
      ]),
    ).toBe("high");
    expect(
      combineEvidenceConfidence([
        { type: "story-modified-by-commit", confidence: "medium" },
        { type: "story-modified-by-commit", confidence: "medium" },
      ]),
    ).toBe("medium");
  });
});
