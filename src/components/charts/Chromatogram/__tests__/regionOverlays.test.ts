import { describe, it, expect } from "vitest";

import { createRegionOverlayTraces } from "../regionOverlays";

import type { ChromatogramSeries, PeakAnnotation } from "../types";

const makeSeries = (overrides: Partial<ChromatogramSeries> = {}): ChromatogramSeries => ({
  name: "S1",
  x: [0, 1, 2, 3, 4, 5],
  y: [0, 10, 20, 15, 5, 0],
  ...overrides,
});

describe("createRegionOverlayTraces", () => {
  it("returns empty array when no peaks have regionOverlay", () => {
    const peaks: PeakAnnotation[] = [{ x: 2, y: 20, regionOverlay: false }];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    expect(result).toHaveLength(0);
  });

  it("skips peaks with regionOverlay but missing computed indices", () => {
    const peaks: PeakAnnotation[] = [{ x: 2, y: 20, regionOverlay: true }];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    expect(result).toHaveLength(0);
  });

  it("skips peaks with only startIndex defined (endIndex missing)", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    expect(result).toHaveLength(0);
  });

  it("creates one trace per peak with regionOverlay=true and valid indices", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    expect(result).toHaveLength(1);
  });

  it("slices series data between startIndex and endIndex (inclusive)", () => {
    const series = makeSeries();
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, series);
    const trace = result[0] as { x: number[]; y: number[] };
    expect(trace.x).toEqual([1, 2, 3]);
    expect(trace.y).toEqual([10, 20, 15]);
  });

  it("uses peak color when specified", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, color: "#ff0000", _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    const trace = result[0] as { line: { color: string } };
    expect(trace.line.color).toBe("#ff0000");
  });

  it("falls back to series color when no peak color", () => {
    const series = makeSeries({ color: "#00ff00" });
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, series);
    const trace = result[0] as { line: { color: string } };
    expect(trace.line.color).toBe("#00ff00");
  });

  it("falls back to CHART_COLORS when series has no color", () => {
    const series = makeSeries({ color: undefined });
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, series);
    const trace = result[0] as { line: { color: string } };
    expect(typeof trace.line.color).toBe("string");
    expect(trace.line.color.length).toBeGreaterThan(0);
  });

  it("uses default line width of 3.5 when regionOverlayWidth not set", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    const trace = result[0] as { line: { width: number } };
    expect(trace.line.width).toBe(3.5);
  });

  it("respects custom regionOverlayWidth", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, regionOverlayWidth: 6, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    const trace = result[0] as { line: { width: number } };
    expect(trace.line.width).toBe(6);
  });

  it("uses hovertemplate when hoverText is set", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, hoverText: "Peak info", _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    const trace = result[0] as { hovertemplate: string };
    expect(trace.hovertemplate).toBe("Peak info<extra></extra>");
  });

  it("sets hoverinfo skip when hoverText is absent", () => {
    const peaks: PeakAnnotation[] = [
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    const trace = result[0] as { hoverinfo: string };
    expect(trace.hoverinfo).toBe("skip");
  });

  it("handles multiple peaks, skipping non-overlay ones", () => {
    const peaks: PeakAnnotation[] = [
      { x: 1, y: 10, regionOverlay: false, _computed: { startIndex: 0, endIndex: 1 } },
      { x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 1, endIndex: 3 } },
      { x: 4, y: 5, regionOverlay: true, _computed: { startIndex: 3, endIndex: 5 } },
    ];
    const result = createRegionOverlayTraces(peaks, 0, makeSeries());
    expect(result).toHaveLength(2);
  });
});
