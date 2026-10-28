import { describe, it, expect } from "vitest";

import { buildBarRows, buildBarSpec } from "../BarChart";

import type { BarDataSeries } from "../BarChart";

const dataSeries: BarDataSeries[] = [
  { name: "Series 1", x: [0, 1, 2], y: [10, 18, 14] },
];

const withError: BarDataSeries[] = [
  {
    name: "A",
    x: [0, 1],
    y: [10, 20],
    error_y: { type: "data", array: [2, 3], visible: true },
  },
];

const positionOf = (layer: { position?: unknown }) =>
  typeof layer.position === "string"
    ? layer.position
    : (layer.position as { kind?: string } | undefined)?.kind;

describe("buildBarRows", () => {
  it("emits one row per point, tagged with its series name", () => {
    const rows = buildBarRows(dataSeries);
    expect(rows.map((row) => [row.x, row.y, row.series])).toEqual([
      [0, 10, "Series 1"],
      [1, 18, "Series 1"],
      [2, 14, "Series 1"],
    ]);
  });

  it("sets the error-bar ends to y +/- the error when the error is visible", () => {
    const rows = buildBarRows(withError);
    expect(rows.map((row) => [row.lo, row.hi])).toEqual([
      [8, 12],
      [17, 23],
    ]);
  });

  it("collapses the error-bar ends onto y when the error is hidden", () => {
    const rows = buildBarRows([
      { ...withError[0], error_y: { type: "data", array: [2, 3], visible: false } },
    ]);
    expect(rows.map((row) => [row.lo, row.hi])).toEqual([
      [10, 10],
      [20, 20],
    ]);
  });
});

describe("buildBarSpec", () => {
  const rows = buildBarRows(dataSeries);
  const base = { hasErrorBars: false };

  it("draws a bar layer dodged for the group variant", () => {
    const spec = buildBarSpec(rows, { ...base, variant: "group" });
    expect(spec.layers[0]?.kind).toBe("bar");
    expect(positionOf(spec.layers[0] ?? {})).toBe("dodge");
  });

  it("stacks the bars for the stack variant and leaves them identity for overlay", () => {
    const stacked = buildBarSpec(rows, { ...base, variant: "stack" });
    const overlaid = buildBarSpec(rows, { ...base, variant: "overlay" });
    expect(positionOf(stacked.layers[0] ?? {})).toBe("stack");
    expect(positionOf(overlaid.layers[0] ?? {})).toBe("identity");
  });

  it("adds an errorbar layer only when error bars are present", () => {
    const plain = buildBarSpec(rows, { ...base, variant: "group" });
    const errored = buildBarSpec(buildBarRows(withError), { hasErrorBars: true, variant: "group" });
    expect(plain.layers.map((layer) => layer.kind)).toEqual(["bar"]);
    expect(errored.layers.map((layer) => layer.kind)).toEqual(["bar", "errorbar"]);
  });

  it("carries the title and axis titles onto the spec", () => {
    const spec = buildBarSpec(rows, {
      ...base,
      variant: "group",
      title: "Bar Chart",
      xTitle: "Day",
      yTitle: "Runs",
    });
    expect(spec.headline).toBe("Bar Chart");
    expect(spec.scales?.x?.title).toBe("Day");
    expect(spec.scales?.y?.title).toBe("Runs");
  });

  it("maps sorted x values to xTickText labels by position", () => {
    const spec = buildBarSpec(rows, {
      ...base,
      variant: "group",
      xTickText: ["Mon", "Tue"],
    });
    expect(spec.scales?.x?.breaks).toEqual([0, 1, 2]);
    expect(spec.scales?.x?.labels).toEqual({ "0": "Mon", "1": "Tue", "2": "2" });
  });

  it("leaves the x scale without breaks or labels when xTickText is omitted", () => {
    const spec = buildBarSpec(rows, { ...base, variant: "group" });
    expect(spec.scales?.x?.breaks).toBeUndefined();
    expect(spec.scales?.x?.labels).toBeUndefined();
  });
});
