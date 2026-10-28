import { describe, it, expect } from "vitest";

import { buildHistogramRows, buildHistogramSpec } from "../Histogram";

import type { HistogramDataSeries } from "../Histogram";

const single: HistogramDataSeries = { name: "Series 1", x: [1, 2, 3, 4, 5, 6] };
const pair: HistogramDataSeries[] = [
  { name: "Series A", x: [1, 2, 3] },
  { name: "Series B", x: [4, 5] },
];

describe("buildHistogramRows", () => {
  it("emits one row per observation tagged with its series name", () => {
    const rows = buildHistogramRows([single]);
    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.series === "Series 1")).toBe(true);
    expect(rows.map((row) => row.x)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("keeps the rows of every series, in series order, so each series can take its own fill", () => {
    const rows = buildHistogramRows(pair);
    expect(rows.map((row) => [row.x, row.series])).toEqual([
      [1, "Series A"],
      [2, "Series A"],
      [3, "Series A"],
      [4, "Series B"],
      [5, "Series B"],
    ]);
  });

  it("returns no rows for an empty series", () => {
    expect(buildHistogramRows([{ name: "Empty", x: [] }])).toEqual([]);
  });
});

describe("buildHistogramSpec", () => {
  it("draws a histogram layer with identity positioning", () => {
    const spec = buildHistogramSpec(buildHistogramRows(pair), {});
    expect(spec.layers.map((layer) => layer.kind)).toEqual(["histogram"]);
    const position = spec.layers[0]?.position;
    expect(typeof position === "string" ? position : position?.kind).toBe("identity");
  });

  it("carries the title and axis titles onto the spec", () => {
    const spec = buildHistogramSpec(buildHistogramRows([single]), {
      title: "Histogram",
      xTitle: "Torque",
      yTitle: "Frequency",
    });
    expect(spec.headline).toBe("Histogram");
    expect(spec.scales?.x?.title).toBe("Torque");
    expect(spec.scales?.y?.title).toBe("Frequency");
  });
});
