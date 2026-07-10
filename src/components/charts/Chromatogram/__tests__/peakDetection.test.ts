import { describe, it, expect } from "vitest";

import { filterPeaksByDistance } from "../peakDetection";

import type { PeakAnnotation } from "../types";

function makePeak(x: number, y: number, index: number): PeakAnnotation {
  return { x, y, _computed: { index, area: 0, startIndex: 0, endIndex: 0, widthAtHalfMax: 0 } };
}

describe("filterPeaksByDistance", () => {
  it("keeps all peaks that are far enough apart", () => {
    const peaks = [
      makePeak(1, 5, 0),
      makePeak(10, 3, 10),
      makePeak(20, 7, 20),
    ];
    const result = filterPeaksByDistance(peaks, 5);
    expect(result).toHaveLength(3);
  });

  it("keeps only the first peak when second is closer but shorter", () => {
    const peaks = [
      makePeak(1, 8, 0),
      makePeak(2, 3, 2), // within minDistance=5, shorter → discarded
    ];
    const result = filterPeaksByDistance(peaks, 5);
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(8);
  });

  it("replaces a peak with a closer but taller one", () => {
    const peaks = [
      makePeak(1, 3, 0),
      makePeak(2, 8, 2), // within minDistance=5, taller → replaces previous
    ];
    const result = filterPeaksByDistance(peaks, 5);
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(8);
  });

  it("returns peaks sorted by x after filtering", () => {
    // Two far-apart peaks passed in reverse x order
    const peaks = [
      makePeak(20, 5, 20),
      makePeak(1, 3, 0),
    ];
    const result = filterPeaksByDistance(peaks, 5);
    expect(result[0].x).toBe(1);
    expect(result[1].x).toBe(20);
  });

  it("returns empty array for empty input", () => {
    expect(filterPeaksByDistance([], 5)).toEqual([]);
  });

  it("handles a single peak", () => {
    const peaks = [makePeak(5, 10, 5)];
    const result = filterPeaksByDistance(peaks, 5);
    expect(result).toHaveLength(1);
  });
});
