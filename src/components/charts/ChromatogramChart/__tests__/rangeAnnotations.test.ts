import { describe, it, expect } from "vitest";

import { assignRangeLanes, buildRangeAnnotationElements } from "../rangeAnnotations";
import { RANGE_ANNOTATION } from "../constants";

import type { RangeAnnotation } from "../types";

const makeAnn = (startX: number, endX: number, overrides: Partial<RangeAnnotation> = {}): RangeAnnotation => ({
  label: `${startX}-${endX}`,
  startX,
  endX,
  ...overrides,
});

describe("assignRangeLanes", () => {
  it("assigns lane 0 to a single annotation", () => {
    const result = assignRangeLanes([makeAnn(0, 5)], 0);
    expect(result).toEqual([0]);
  });

  it("assigns same lane to non-overlapping annotations", () => {
    const anns = [makeAnn(0, 2), makeAnn(3, 5)];
    const result = assignRangeLanes(anns, 0);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0);
  });

  it("assigns different lanes to overlapping annotations", () => {
    const anns = [makeAnn(0, 5), makeAnn(3, 8)];
    const result = assignRangeLanes(anns, 0);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });

  it("respects explicit lane values", () => {
    const anns = [makeAnn(0, 5, { lane: 2 })];
    const result = assignRangeLanes(anns, 0);
    expect(result[0]).toBe(2);
  });

  it("mixes explicit and auto-assigned lanes, avoiding collisions", () => {
    // Explicit at lane 0, auto should go to lane 1 because overlap
    const anns = [makeAnn(0, 10, { lane: 0 }), makeAnn(5, 15)];
    const result = assignRangeLanes(anns, 0);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });

  it("uses overlapThreshold to widen the no-overlap zone", () => {
    // Annotations don't touch but are within threshold
    const anns = [makeAnn(0, 3), makeAnn(3, 6)];
    // With threshold=1, startX=3 is NOT >= endX(3)-1=2 ... wait, let me recalc:
    // startX(3) >= end(3) - threshold(1) => 3 >= 2 → true → same lane
    const result = assignRangeLanes(anns, 1);
    // startX >= end - threshold means it fits: same lane
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0);
  });

  it("returns empty array for empty input", () => {
    expect(assignRangeLanes([], 0)).toEqual([]);
  });

  it("auto-assigns multiple non-overlapping annotations to lane 0", () => {
    const anns = [makeAnn(10, 12), makeAnn(0, 2), makeAnn(5, 7)];
    const result = assignRangeLanes(anns, 0);
    // All fit in lane 0 (processed in startX order: 0-2, 5-7, 10-12)
    expect(result.every((l) => l === 0)).toBe(true);
  });
});

describe("buildRangeAnnotationElements", () => {
  const seriesData = [{ x: [0, 1, 2, 3, 4, 5], y: [0, 10, 20, 15, 5, 0] }];

  it("returns empty shapes/annotations and yDomainMax=1 for empty input", () => {
    const result = buildRangeAnnotationElements([], 0, seriesData);
    expect(result.shapes).toHaveLength(0);
    expect(result.annotations).toHaveLength(0);
    expect(result.yDomainMax).toBe(1.0);
  });

  it("produces one shape and one annotation per range annotation", () => {
    const anns = [makeAnn(1, 3, { yAnchor: "top" })];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.shapes).toHaveLength(1);
    expect(result.annotations).toHaveLength(1);
  });

  it("uses 'top' yAnchor by default and shrinks yDomainMax", () => {
    const anns = [makeAnn(1, 3)];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.yDomainMax).toBeLessThan(1.0);
    expect(result.shapes[0].yref).toBe("paper");
  });

  it("does not shrink yDomainMax for 'auto' annotations", () => {
    const anns = [makeAnn(1, 3, { yAnchor: "auto" })];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.yDomainMax).toBe(1.0);
    expect(result.shapes[0].yref).toBe("paper");
  });

  it("uses 'y' yref for numeric yAnchor", () => {
    const anns = [makeAnn(1, 3, { yAnchor: 5 })];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.shapes[0].yref).toBe("y");
    expect(result.yDomainMax).toBe(1.0);
  });

  it("stacks two overlapping 'top' annotations in different lanes", () => {
    const anns = [makeAnn(0, 5), makeAnn(3, 8)];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    const [s0, s1] = result.shapes;
    // Lane 0 sits at paper y=1; lane 1 is lower → y1 of shape[1] < y1 of shape[0]
    expect((s1.y1 as number)).toBeLessThan((s0.y1 as number));
  });

  it("respects custom color, opacity, fontSize, labelColor", () => {
    const anns = [makeAnn(1, 3, { color: "#ff0000", opacity: 0.3, fontSize: 14, labelColor: "#0000ff" })];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.shapes[0].fillcolor).toBe("#ff0000");
    expect(result.shapes[0].opacity).toBe(0.3);
    const ann = result.annotations[0] as { font: { size: number; color: string } };
    expect(ann.font.size).toBe(14);
    expect(ann.font.color).toBe("#0000ff");
  });

  it("falls back to CHART_COLORS when no color specified", () => {
    const anns = [makeAnn(1, 3)];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(typeof result.shapes[0].fillcolor).toBe("string");
  });

  it("uses default opacity from RANGE_ANNOTATION constant", () => {
    const anns = [makeAnn(1, 3)];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.shapes[0].opacity).toBe(RANGE_ANNOTATION.DEFAULT_OPACITY);
  });

  it("auto yAnchor: uses paper yref and stacks multiple lanes", () => {
    const anns = [makeAnn(0, 5, { yAnchor: "auto" }), makeAnn(2, 7, { yAnchor: "auto" })];
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.shapes[0].yref).toBe("paper");
    expect(result.shapes[1].yref).toBe("paper");
  });

  it("handles empty seriesData for auto globalMaxY", () => {
    const anns = [makeAnn(1, 3, { yAnchor: "auto" })];
    const result = buildRangeAnnotationElements(anns, 0, []);
    expect(result.shapes).toHaveLength(1);
    // globalMaxY = 0 → uses fallback yDomainMax * 0.5
    expect(result.shapes[0].yref).toBe("paper");
  });

  it("caps yDomainMax at 0.5 minimum for many top lanes", () => {
    // 20 stacked top annotations will want to shrink yDomainMax below 0.5
    const anns = Array.from({ length: 20 }, (_, i) => makeAnn(i * 10, i * 10 + 5));
    const result = buildRangeAnnotationElements(anns, 0, seriesData);
    expect(result.yDomainMax).toBeGreaterThanOrEqual(0.5);
  });
});
