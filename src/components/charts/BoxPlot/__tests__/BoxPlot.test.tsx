import { describe, it, expect } from "vitest";

import { buildBoxRows, buildBoxSpec } from "../BoxPlot";

import type { BoxDataSeries } from "../BoxPlot";

const dataSeries: BoxDataSeries[] = [{ name: "Series 1", y: [10, 18, 14, 22, 9] }];

describe("buildBoxRows", () => {
  it("emits one row per observation, categorised by the series name when no x is given", () => {
    const rows = buildBoxRows(dataSeries);
    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.x === "Series 1" && row.series === "Series 1")).toBe(true);
    expect(rows.map((row) => row.y)).toEqual([10, 18, 14, 22, 9]);
  });

  it("uses the per-point x category when one is given", () => {
    const rows = buildBoxRows([{ name: "S", y: [1, 2], x: ["200", "350"] }]);
    expect(rows.map((row) => row.x)).toEqual(["200", "350"]);
  });

  it("stringifies numeric x categories", () => {
    const rows = buildBoxRows([{ name: "S", y: [1], x: [200] }]);
    expect(rows[0]?.x).toBe("200");
  });
});

describe("buildBoxSpec", () => {
  const rows = buildBoxRows(dataSeries);

  it("draws a boxplot layer alone when points are hidden", () => {
    const spec = buildBoxSpec(rows, { showPoints: false });
    expect(spec.layers.map((layer) => layer.kind)).toEqual(["boxplot"]);
  });

  it("adds a point layer on top of the boxes when showPoints is set", () => {
    const spec = buildBoxSpec(rows, { showPoints: true });
    expect(spec.layers.map((layer) => layer.kind)).toEqual(["boxplot", "point"]);
  });

  it("carries the title and axis titles onto the spec", () => {
    const spec = buildBoxSpec(rows, {
      showPoints: false,
      title: "Box Plot",
      xTitle: "Group",
      yTitle: "Signal",
    });
    expect(spec.headline).toBe("Box Plot");
    expect(spec.scales?.x?.title).toBe("Group");
    expect(spec.scales?.y?.title).toBe("Signal");
  });

  it("applies the axis ranges as scale limits", () => {
    const spec = buildBoxSpec(rows, {
      showPoints: false,
      xRange: [0, 5],
      yRange: [0, 30],
    });
    expect(spec.scales?.x?.limits).toEqual([0, 5]);
    expect(spec.scales?.y?.limits).toEqual([0, 30]);
  });
});
