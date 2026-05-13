import { describe, it, expect } from "vitest";

import { applyStackingTransform } from "../transforms";

import type { ChromatogramSeries, PeakAnnotation, RangeAnnotation } from "../../ChromatogramChart";

const makeSeries = (y: number[], name = "S"): ChromatogramSeries => ({
  name,
  x: y.map((_, i) => i),
  y,
});

describe("applyStackingTransform - overlay mode", () => {
  it("returns the input series unchanged", () => {
    const series = [makeSeries([1, 2, 3]), makeSeries([4, 5, 6])];
    const result = applyStackingTransform(series, undefined, undefined, "overlay", 10);
    expect(result.series).toBe(series);
  });

  it("flattens annotations from all series", () => {
    const series = [makeSeries([1, 2]), makeSeries([3, 4])];
    const annotations: PeakAnnotation[][] = [
      [{ x: 0, y: 1 }],
      [{ x: 1, y: 3 }],
    ];
    const result = applyStackingTransform(series, annotations, undefined, "overlay", 10);
    expect(result.annotations).toHaveLength(2);
  });

  it("returns empty annotations when undefined", () => {
    const series = [makeSeries([1, 2])];
    const result = applyStackingTransform(series, undefined, undefined, "overlay", 10);
    expect(result.annotations).toHaveLength(0);
  });

  it("flattens range annotations from all series", () => {
    const series = [makeSeries([1]), makeSeries([2])];
    const rangeAnns: RangeAnnotation[][] = [
      [{ label: "A", startX: 0, endX: 1 }],
      [{ label: "B", startX: 2, endX: 3 }],
    ];
    const result = applyStackingTransform(series, undefined, rangeAnns, "overlay", 10);
    expect(result.rangeAnnotations).toHaveLength(2);
  });

  it("computes yRange spanning all series values including 0 minimum", () => {
    const series = [makeSeries([5, 10]), makeSeries([3, 8])];
    const result = applyStackingTransform(series, undefined, undefined, "overlay", 10);
    expect(result.yRange[0]).toBe(0); // min(..., 0)
    expect(result.yRange[1]).toBe(10);
  });

  it("preserves negative yMin below 0", () => {
    const series = [makeSeries([-5, 10])];
    const result = applyStackingTransform(series, undefined, undefined, "overlay", 10);
    expect(result.yRange[0]).toBe(-5);
  });
});

describe("applyStackingTransform - stack mode (first-on-bottom)", () => {
  it("shifts each series y values by index * stackOffset", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const result = applyStackingTransform(series, undefined, undefined, "stack", 10, "first-on-bottom");
    // series 0: no shift; series 1: +10
    expect(result.series[0].y).toEqual([0, 5]);
    expect(result.series[1].y).toEqual([10, 15]);
  });

  it("preserves original series objects (does not mutate)", () => {
    const originalY = [0, 5];
    const series = [makeSeries(originalY)];
    applyStackingTransform(series, undefined, undefined, "stack", 10);
    expect(series[0].y).toEqual([0, 5]);
  });

  it("shifts peak annotation y values matching their series", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const annotations: PeakAnnotation[][] = [
      [{ x: 1, y: 5 }],
      [{ x: 1, y: 5 }],
    ];
    const result = applyStackingTransform(series, annotations, undefined, "stack", 10);
    expect(result.annotations[0].y).toBe(5); // series 0, no shift
    expect(result.annotations[1].y).toBe(15); // series 1, +10
  });

  it("shifts numeric yAnchor in range annotations", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const rangeAnns: RangeAnnotation[][] = [
      [],
      [{ label: "B", startX: 0, endX: 1, yAnchor: 2 }],
    ];
    const result = applyStackingTransform(series, undefined, rangeAnns, "stack", 10);
    // series 1 gets +10 shift; numeric yAnchor 2 → 12
    expect(result.rangeAnnotations[0].yAnchor).toBe(12);
  });

  it("does not shift string yAnchor values ('top', 'auto')", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const rangeAnns: RangeAnnotation[][] = [
      [],
      [{ label: "B", startX: 0, endX: 1, yAnchor: "top" }],
    ];
    const result = applyStackingTransform(series, undefined, rangeAnns, "stack", 10);
    expect(result.rangeAnnotations[0].yAnchor).toBe("top");
  });

  it("does not shift 'auto' yAnchor", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const rangeAnns: RangeAnnotation[][] = [
      [],
      [{ label: "B", startX: 0, endX: 1, yAnchor: "auto" }],
    ];
    const result = applyStackingTransform(series, undefined, rangeAnns, "stack", 10);
    expect(result.rangeAnnotations[0].yAnchor).toBe("auto");
  });

  it("handles undefined annotations gracefully", () => {
    const series = [makeSeries([0, 5])];
    const result = applyStackingTransform(series, undefined, undefined, "stack", 10);
    expect(result.annotations).toHaveLength(0);
    expect(result.rangeAnnotations).toHaveLength(0);
  });

  it("computes stacked yRange including annotation y values", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const anns: PeakAnnotation[][] = [[{ x: 0, y: 5 }], [{ x: 1, y: 5 }]];
    const result = applyStackingTransform(series, anns, undefined, "stack", 10);
    // series[1] is shifted by 10 → max y = 15; annotations[1].y = 15
    expect(result.yRange[1]).toBe(15);
    expect(result.yRange[0]).toBe(0);
  });
});

describe("applyStackingTransform - stack mode (first-on-top)", () => {
  it("reverses stacking: last series gets no shift, first gets max shift", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5]), makeSeries([0, 5])];
    // N=3, first-on-top: index 0 → shift (3-1-0)*10=20, index 1 → 10, index 2 → 0
    const result = applyStackingTransform(series, undefined, undefined, "stack", 10, "first-on-top");
    expect(result.series[0].y).toEqual([20, 25]);
    expect(result.series[1].y).toEqual([10, 15]);
    expect(result.series[2].y).toEqual([0, 5]);
  });

  it("shifts annotations by first-on-top offset", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const annotations: PeakAnnotation[][] = [
      [{ x: 0, y: 5 }],
      [{ x: 1, y: 5 }],
    ];
    // N=2: index 0 → (2-1-0)*10=10; index 1 → 0
    const result = applyStackingTransform(series, annotations, undefined, "stack", 10, "first-on-top");
    expect(result.annotations[0].y).toBe(15);
    expect(result.annotations[1].y).toBe(5);
  });

  it("default stackingOrder is first-on-bottom", () => {
    const series = [makeSeries([0, 5]), makeSeries([0, 5])];
    const resultDefault = applyStackingTransform(series, undefined, undefined, "stack", 10);
    const resultExplicit = applyStackingTransform(series, undefined, undefined, "stack", 10, "first-on-bottom");
    expect(resultDefault.series[1].y).toEqual(resultExplicit.series[1].y);
  });
});
