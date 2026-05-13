import { describe, it, expect, vi, beforeEach } from "vitest";

import { CHROMATOGRAM_LAYOUT } from "../constants";
import { buildConfig, buildLayout, buildTraceData } from "../plotBuilder";

import type { PlotlyThemeColors } from "@/hooks/use-plotly-theme";

vi.mock("../dataProcessing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../dataProcessing")>();
  return {
    ...actual,
    collectPeaksWithBoundaryData: vi.fn(() => []),
  };
});

vi.mock("../boundaryMarkers", () => ({
  createBoundaryMarkerTraces: vi.fn(() => [{ type: "scatter", name: "__boundary__" }]),
}));

vi.mock("../regionOverlays", () => ({
  createRegionOverlayTraces: vi.fn(() => [{ type: "scatter", name: "__region__" }]),
}));

const mockTheme: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "rgba(26,26,26,1)",
  textSecondary: "rgba(26,26,26,0.6)",
  gridColor: "#e1e7ef",
  lineColor: "#1a1a1a",
  tickColor: "#e1e7ef",
  legendColor: "#04263f",
  spikeColor: "#64748b",
  isDark: false,
};

const baseSeries = { x: [1, 2, 3], y: [10, 20, 30], name: "Series A" };

// ── buildTraceData ──────────────────────────────────────────────────────────

describe("buildTraceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns one trace for a single series with no markers, boundaries, or peaks", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [],
      allPeaksForInteraction: [],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result).toHaveLength(1);
    expect(result[0].mode).toBe("lines");
    expect((result[0] as { marker?: unknown }).marker).toBeUndefined();
  });

  it("sets mode to lines+markers and adds marker property when showMarkers is true", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [],
      allPeaksForInteraction: [],
      showMarkers: true,
      markerSize: 6,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result[0].mode).toBe("lines+markers");
    expect((result[0] as { marker?: { size: number } }).marker).toMatchObject({ size: 6 });
  });

  it("appends boundary marker traces when boundaryMarkers is enabled and data exists", async () => {
    const { collectPeaksWithBoundaryData } = await import("../dataProcessing");
    vi.mocked(collectPeaksWithBoundaryData).mockReturnValueOnce([
      // non-empty to trigger createBoundaryMarkerTraces
      {} as ReturnType<typeof collectPeaksWithBoundaryData>[number],
    ]);

    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [{ peaks: [{ x: 2, y: 20 }], seriesIndex: 0 }],
      allPeaksForInteraction: [],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "enabled",
    });

    expect(result.some((t) => (t as { name?: string }).name === "__boundary__")).toBe(true);
  });

  it("does not append boundary traces when boundaryMarkers is none", async () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [{ peaks: [{ x: 2, y: 20 }], seriesIndex: 0 }],
      allPeaksForInteraction: [],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result.every((t) => (t as { name?: string }).name !== "__boundary__")).toBe(true);
  });

  it("appends a region overlay trace for a user annotation with regionOverlay: true", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [{ x: 2, y: 20, regionOverlay: true, startX: 1, endX: 3 }],
      allDetectedPeaks: [],
      allPeaksForInteraction: [],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result.some((t) => (t as { name?: string }).name === "__region__")).toBe(true);
  });

  it("appends region overlay traces for auto-detected peaks with regionOverlay: true", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [
        { peaks: [{ x: 2, y: 20, regionOverlay: true, _computed: { startIndex: 0, endIndex: 2 } }], seriesIndex: 0 },
      ],
      allPeaksForInteraction: [],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result.some((t) => (t as { name?: string }).name === "__region__")).toBe(true);
  });

  it("appends a hit-area trace as the last trace when allPeaksForInteraction is populated", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [],
      allPeaksForInteraction: [
        { peak: { x: 2, y: 20, id: "peak-0-0" }, seriesIndex: 0, seriesName: "Series A", isAutoDetected: true },
      ],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    expect(result).toHaveLength(2);
    const hitArea = result[result.length - 1] as { mode: string; marker: { opacity: number } };
    expect(hitArea.mode).toBe("markers");
    expect(hitArea.marker.opacity).toBe(0);
  });

  it("uses per-point hovertemplate array when any peak has hoverText", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [],
      allPeaksForInteraction: [
        { peak: { x: 2, y: 20, id: "peak-0-0", hoverText: "Peak A" }, seriesIndex: 0, seriesName: "S", isAutoDetected: true },
        { peak: { x: 3, y: 30, id: "peak-0-1" }, seriesIndex: 0, seriesName: "S", isAutoDetected: true },
      ],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    const hitArea = result[result.length - 1] as { hovertemplate: unknown };
    expect(Array.isArray(hitArea.hovertemplate)).toBe(true);
    const templates = hitArea.hovertemplate as string[];
    expect(templates[0]).toContain("Peak A");
    expect(templates[1]).toBe("<extra></extra>");
  });

  it("uses a single string hovertemplate when no peak has hoverText", () => {
    const result = buildTraceData({
      processedSeries: [baseSeries],
      processedAnnotations: [],
      allDetectedPeaks: [],
      allPeaksForInteraction: [
        { peak: { x: 2, y: 20, id: "peak-0-0" }, seriesIndex: 0, seriesName: "S", isAutoDetected: true },
      ],
      showMarkers: false,
      markerSize: 4,
      xAxisTitle: "Time",
      yAxisTitle: "Signal",
      boundaryMarkers: "none",
    });

    const hitArea = result[result.length - 1] as { hovertemplate: unknown };
    expect(typeof hitArea.hovertemplate).toBe("string");
    expect(hitArea.hovertemplate).toBe("<extra></extra>");
  });
});

// ── buildLayout ─────────────────────────────────────────────────────────────

describe("buildLayout", () => {
  const baseParams = {
    titleFontSize: 20,
    width: 900,
    height: 500,
    xAxisTitle: "Time",
    yAxisTitle: "Signal",
    showLegend: true,
    seriesCount: 2,
    showGridX: true,
    showGridY: true,
    showCrosshairs: false,
    theme: mockTheme,
    peakAnnotations: [],
  };

  it("sets title text and font when title is provided", () => {
    const layout = buildLayout({ ...baseParams, title: "My Chart" });

    const title = layout.title as { text: string; font: { size: number } };
    expect(title.text).toBe("My Chart");
    expect(title.font.size).toBe(20);
  });

  it("uses MARGIN_TOP_WITH_TITLE when title is provided", () => {
    const layout = buildLayout({ ...baseParams, title: "My Chart" });

    expect(layout.margin?.t).toBe(CHROMATOGRAM_LAYOUT.MARGIN_TOP_WITH_TITLE);
  });

  it("uses provided titleTopMargin when set, overriding the constant", () => {
    const layout = buildLayout({ ...baseParams, title: "My Chart", titleTopMargin: 80 });

    expect(layout.margin?.t).toBe(80);
  });

  it("sets title to undefined when no title is given", () => {
    const layout = buildLayout({ ...baseParams });

    expect(layout.title).toBeUndefined();
  });

  it("uses MARGIN_TOP_NO_TITLE when no title is provided", () => {
    const layout = buildLayout({ ...baseParams });

    expect(layout.margin?.t).toBe(CHROMATOGRAM_LAYOUT.MARGIN_TOP_NO_TITLE);
  });

  it("sets hovermode to x and enables spikes when showCrosshairs is true", () => {
    const layout = buildLayout({ ...baseParams, showCrosshairs: true });

    expect(layout.hovermode).toBe("x");
    expect(layout.xaxis?.showspikes).toBe(true);
    expect(layout.yaxis?.showspikes).toBe(true);
  });

  it("sets hovermode to x unified and disables spikes when showCrosshairs is false", () => {
    const layout = buildLayout({ ...baseParams, showCrosshairs: false });

    expect(layout.hovermode).toBe("x unified");
    expect(layout.xaxis?.showspikes).toBe(false);
    expect(layout.yaxis?.showspikes).toBe(false);
  });

  it("sets xaxis range and autorange false when xRange is provided", () => {
    const layout = buildLayout({ ...baseParams, xRange: [0, 10] });

    expect(layout.xaxis?.range).toEqual([0, 10]);
    expect(layout.xaxis?.autorange).toBe(false);
  });

  it("sets autorange to true when xRange is absent", () => {
    const layout = buildLayout({ ...baseParams });

    expect(layout.xaxis?.autorange).toBe(true);
  });

  it("shows legend when showLegend is true and seriesCount > 1", () => {
    const layout = buildLayout({ ...baseParams, showLegend: true, seriesCount: 2 });

    expect(layout.showlegend).toBe(true);
  });

  it("hides legend when seriesCount is 1 even if showLegend is true", () => {
    const layout = buildLayout({ ...baseParams, showLegend: true, seriesCount: 1 });

    expect(layout.showlegend).toBe(false);
  });

  it("hides xaxis grid when showGridX is false", () => {
    const layout = buildLayout({ ...baseParams, showGridX: false });

    expect(layout.xaxis?.showgrid).toBe(false);
  });
});

// ── buildConfig ─────────────────────────────────────────────────────────────

describe("buildConfig", () => {
  it("does not include toImage in removed buttons and adds toImageButtonOptions when showExportButton is true", () => {
    const config = buildConfig({ showExportButton: true, width: 900, height: 500 });

    expect(config.modeBarButtonsToRemove).not.toContain("toImage");
    expect(config.toImageButtonOptions).toBeDefined();
  });

  it("includes toImage in removed buttons and omits toImageButtonOptions when showExportButton is false", () => {
    const config = buildConfig({ showExportButton: false, width: 900, height: 500 });

    expect(config.modeBarButtonsToRemove).toContain("toImage");
    expect(config.toImageButtonOptions).toBeUndefined();
  });
});
