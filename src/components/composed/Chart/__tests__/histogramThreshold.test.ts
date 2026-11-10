import { describe, it, expect } from "vitest";

import { buildHistogramGroups, buildHistogramSpec } from "../kinds/Histogram";

const colors = ["#111111", "#222222"];

describe("buildHistogramGroups", () => {
  it("keeps one group per series, in its series colour, when no threshold is given", () => {
    const groups = buildHistogramGroups(
      [
        { name: "A", x: [1, 2] },
        { name: "B", x: [3] },
      ],
      colors,
    );
    expect(groups.rows.map((row) => row.series)).toEqual(["A", "A", "B"]);
    expect(groups.colors).toEqual(["#111111", "#222222"]);
  });

  it("splits each series at the threshold, with values equal to it counted as at or above", () => {
    const groups = buildHistogramGroups([{ name: "Run", x: [1, 5, 9] }], colors, { value: 5 });
    expect(groups.rows.map((row) => row.series)).toEqual(["Run < 5", "Run ≥ 5", "Run ≥ 5"]);
  });

  it("colours the above-threshold group with the caller's colour and the below group with the series colour", () => {
    const groups = buildHistogramGroups([{ name: "Run", x: [1, 9] }], colors, { value: 5, above: "#b91c1c" });
    expect(groups.colors).toEqual(["#111111", "#b91c1c"]);
  });

  it("orders the colours by each group's first row, the order ts-lib-viz assigns its codes", () => {
    const groups = buildHistogramGroups([{ name: "Run", x: [9, 1] }], colors, { value: 5, above: "#b91c1c" });
    expect(groups.rows.map((row) => row.series)).toEqual(["Run ≥ 5", "Run < 5"]);
    expect(groups.colors).toEqual(["#b91c1c", "#111111"]);
  });

  it("uses a caution colour for the above group when none is given", () => {
    const groups = buildHistogramGroups([{ name: "Run", x: [9] }], colors, { value: 5 });
    expect(groups.colors).toHaveLength(1);
    expect(groups.colors[0]).toMatch(/^(#|rgb)/);
  });

  it("gives an empty series no group and no colour", () => {
    expect(buildHistogramGroups([{ name: "Empty", x: [] }], colors, { value: 5 })).toEqual({ rows: [], colors: [] });
  });
});

describe("buildHistogramSpec with a threshold", () => {
  it("stacks the two sides of one series, so a straddling bin keeps its full count", () => {
    const groups = buildHistogramGroups([{ name: "Run", x: [1, 9] }], colors, { value: 5 });
    expect(buildHistogramSpec(groups.rows, {}).layers[0]?.position).toBe("stack");
  });
});
