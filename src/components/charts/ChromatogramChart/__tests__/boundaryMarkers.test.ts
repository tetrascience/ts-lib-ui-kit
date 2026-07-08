import { describe, it, expect } from "vitest";

import { createBoundaryMarkerTraces } from "../boundaryMarkers";

describe("createBoundaryMarkerTraces", () => {
  it("returns empty array when allPeaks is empty", () => {
    expect(createBoundaryMarkerTraces([])).toEqual([]);
  });

  it("returns empty array when a series has no peaks", () => {
    const result = createBoundaryMarkerTraces([
      { peaks: [], seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    expect(result).toEqual([]);
  });

  it("creates two marker traces per peak (start + end) with default types", () => {
    const peaks = [
      {
        x: 5,
        y: 100,
        _computed: { startIndex: 0, endIndex: 2 },
      },
    ];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    expect(result).toHaveLength(2);
  });

  it("start marker uses triangle symbol by default", () => {
    const peaks = [{ x: 5, y: 100, _computed: { startIndex: 0, endIndex: 2 } }];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const startTrace = result[0] as { marker: { symbol: string } };
    expect(startTrace.marker.symbol).toBe("triangle-up");
  });

  it("end marker uses diamond symbol by default", () => {
    const peaks = [{ x: 5, y: 100, _computed: { startIndex: 0, endIndex: 2 } }];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const endTrace = result[1] as { marker: { symbol: string } };
    expect(endTrace.marker.symbol).toBe("diamond");
  });

  it("skips 'none' markers", () => {
    const peaks = [
      {
        x: 5,
        y: 100,
        startMarker: "none" as const,
        endMarker: "none" as const,
        _computed: { startIndex: 0, endIndex: 2 },
      },
    ];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    expect(result).toHaveLength(0);
  });

  it("respects explicit startMarker and endMarker types", () => {
    const peaks = [
      {
        x: 5,
        y: 100,
        startMarker: "diamond" as const,
        endMarker: "triangle" as const,
        _computed: { startIndex: 0, endIndex: 2 },
      },
    ];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const startTrace = result[0] as { marker: { symbol: string } };
    const endTrace = result[1] as { marker: { symbol: string } };
    expect(startTrace.marker.symbol).toBe("diamond");
    expect(endTrace.marker.symbol).toBe("triangle-up");
  });

  it("uses peak color override when provided", () => {
    const peaks = [
      {
        x: 5,
        y: 100,
        color: "#abcdef",
        _computed: { startIndex: 0, endIndex: 2 },
      },
    ];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const trace = result[0] as { marker: { color: string } };
    expect(trace.marker.color).toBe("#abcdef");
  });

  it("falls back to series color when no peak color override", () => {
    const peaks = [{ x: 5, y: 100, _computed: { startIndex: 0, endIndex: 2 } }];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const trace = result[0] as { marker: { color: string } };
    expect(typeof trace.marker.color).toBe("string");
    expect(trace.marker.color.length).toBeGreaterThan(0);
  });

  it("stacks y positions by series index", () => {
    const peaks = [{ x: 5, y: 100, _computed: { startIndex: 0, endIndex: 2 } }];
    const series0Result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const series1Result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 1, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    const y0 = (series0Result[0] as { y: number[] }).y[0];
    const y1 = (series1Result[0] as { y: number[] }).y[0];
    expect(y1).toBeLessThan(y0);
  });

  it("falls back to index 0 when _computed is undefined", () => {
    const peaks = [{ x: 5, y: 100 }];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2, 3], y: [10, 20, 30] },
    ]);
    // Should still produce 2 traces using x[0] for both
    expect(result).toHaveLength(2);
    const startTrace = result[0] as { x: number[] };
    expect(startTrace.x[0]).toBe(1); // x[0]
  });

  it("creates traces for multiple series", () => {
    const peaks = [{ x: 5, y: 100, _computed: { startIndex: 0, endIndex: 1 } }];
    const result = createBoundaryMarkerTraces([
      { peaks, seriesIndex: 0, x: [1, 2], y: [10, 20] },
      { peaks, seriesIndex: 1, x: [3, 4], y: [30, 40] },
    ]);
    // 2 traces per peak per series = 4
    expect(result).toHaveLength(4);
  });
});
