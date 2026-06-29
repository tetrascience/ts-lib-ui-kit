import { describe, it, expect } from "vitest";

import {
  buildHoverExtraContent,
  applyBaselineCorrection,
} from "../dataProcessing";

describe("buildHoverExtraContent", () => {
  it("returns seriesName when no metadata provided", () => {
    expect(buildHoverExtraContent("Sample A")).toBe("Sample A");
  });

  it("returns seriesName when metadata is undefined", () => {
    expect(buildHoverExtraContent("Sample A")).toBe("Sample A");
  });

  it("returns seriesName when metadata is empty object", () => {
    expect(buildHoverExtraContent("Sample A", {})).toBe("Sample A");
  });

  it("returns seriesName when all metadata values are empty/null/undefined", () => {
    expect(
      buildHoverExtraContent("Sample A", { a: null, b: undefined, c: "" })
    ).toBe("Sample A");
  });

  it("appends metadata fields as HTML key: value lines", () => {
    const result = buildHoverExtraContent("Sample A", { concentration: "10 mM" });
    expect(result).toBe("Sample A<br>Concentration: 10 mM");
  });

  it("converts camelCase keys to Title Case", () => {
    const result = buildHoverExtraContent("S", { sampleName: "X", batchId: "B1" });
    expect(result).toContain("Sample Name: X");
    expect(result).toContain("Batch Id: B1");
  });

  it("joins multiple metadata fields with <br>", () => {
    const result = buildHoverExtraContent("S", { a: "1", b: "2", c: "3" });
    const lines = result.split("<br>");
    expect(lines).toHaveLength(4); // seriesName + 3 fields
  });

  it("skips null, undefined, and empty-string values but keeps valid ones", () => {
    const result = buildHoverExtraContent("S", {
      good: "yes",
      bad: null,
      ugly: undefined,
      empty: "",
    });
    expect(result).toContain("Good: yes");
    expect(result).not.toContain("Bad");
    expect(result).not.toContain("Ugly");
    expect(result).not.toContain("Empty");
  });

  it("coerces numeric metadata values to strings", () => {
    const result = buildHoverExtraContent("S", { retention: 4.5 });
    expect(result).toContain("Retention: 4.5");
  });
});

describe("applyBaselineCorrection", () => {
  describe("rolling method", () => {
    it("returns array of the same length", () => {
      const y = [1, 2, 5, 2, 1, 2, 6, 2, 1];
      const result = applyBaselineCorrection(y, "rolling", 3);
      expect(result).toHaveLength(y.length);
    });

    it("subtracts the rolling minimum so all values are >= 0 for a flat baseline", () => {
      // Flat baseline of 1, peaks on top
      const y = [1, 1, 3, 1, 1, 1, 4, 1, 1];
      const result = applyBaselineCorrection(y, "rolling", 3);
      result.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    });

    it("corrects a signal with a sloped baseline", () => {
      // Linearly increasing baseline; peak in the middle should still be visible
      const y = [0, 1, 2, 5, 4, 5, 6, 7, 8];
      const result = applyBaselineCorrection(y, "rolling", 3);
      // The peak at index 3 (value 5) should have a larger corrected value than its neighbors
      expect(result[3]).toBeGreaterThan(result[0]);
    });

    it("handles windowSize larger than the array", () => {
      const y = [2, 3, 2];
      const result = applyBaselineCorrection(y, "rolling", 100);
      expect(result).toHaveLength(3);
      // With full-array window, baseline is the global minimum (2) everywhere
      expect(result[1]).toBeCloseTo(1); // 3 - 2
      expect(result[0]).toBeCloseTo(0); // 2 - 2
    });

    it("returns empty array unchanged", () => {
      expect(applyBaselineCorrection([], "rolling")).toEqual([]);
    });
  });

  describe("none method", () => {
    it("returns the original array unchanged", () => {
      const y = [1, 2, 3];
      expect(applyBaselineCorrection(y, "none")).toBe(y);
    });
  });

  describe("linear method", () => {
    it("corrects a linearly rising signal to near-zero", () => {
      const y = [0, 1, 2, 3, 4];
      const result = applyBaselineCorrection(y, "linear");
      result.forEach((v) => expect(v).toBeCloseTo(0, 10));
    });
  });
});
