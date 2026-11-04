import { CHROMATOGRAM_ANNOTATION, CHROMATOGRAM_TRACE } from "./constants";
import { collectPeaksWithBoundaryData } from "./dataProcessing";

import type { ChromatogramSeries, PeakAnnotation, BoundaryMarkerStyle, BoundaryMarkerType } from "./types";
import type { ChartSpec, VizData } from "@/vendor/ts-lib-viz/core";

import { CHART_COLORS } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

/** Marker rows sit below the baseline, staggered per series so they do not overlap. */
const BOUNDARY_MARKER_START_Y = -5;
const BOUNDARY_MARKER_END_Y = -12;
const BOUNDARY_MARKER_SERIES_OFFSET = -16;
/** Default width of a region overlay line, in pixels. */
const DEFAULT_REGION_OVERLAY_WIDTH = 3.5;

type Row = Record<string, string | number | boolean | null>;

const emptyRows: Row[] = [];
const newBuilder = () => plot(emptyRows, { x: "x", y: "y" });
type Builder = ReturnType<typeof newBuilder>;

export interface DetectedPeaks {
  peaks: PeakAnnotation[];
  seriesIndex: number;
}

export interface ChromatogramSpecInput {
  processedSeries: ChromatogramSeries[];
  processedAnnotations: PeakAnnotation[];
  allDetectedPeaks: DetectedPeaks[];
  showPeakAreas: boolean;
  enablePeakDetection: boolean;
  boundaryMarkers: BoundaryMarkerStyle;
  showMarkers: boolean;
  markerSize: number;
  title?: string;
  xAxisTitle: string;
  yAxisTitle: string;
  xRange?: [number, number];
  yRange?: [number, number];
  showGridX: boolean;
  showGridY: boolean;
}

export interface ChromatogramSpec {
  spec: ChartSpec;
  /** Rows the spec's layers read from. Each layer carries its own rows, so this is empty. */
  data: VizData;
}

const seriesColor = (series: ChromatogramSeries, index: number): string =>
  series.color || CHART_COLORS[index % CHART_COLORS.length];

/** The points of one series as rows, with the x and y columns the layers read. */
function seriesRows(series: ChromatogramSeries, from = 0, to = series.x.length): Row[] {
  const rows: Row[] = [];
  for (let i = from; i <= to && i < series.x.length; i++) {
    rows.push({ x: series.x[i], y: series.y[i] });
  }
  return rows;
}

/** A peak's label: its own text, or its area once detection has computed one. */
function peakLabel(peak: PeakAnnotation): string {
  if (peak.text !== undefined) return peak.text;
  const area = peak._computed?.area;
  return area === undefined ? "" : `Area: ${area.toFixed(2)}`;
}

/** Groups rows by a key, so each group becomes one layer that draws in one colour and shape. */
function groupRows<K extends string>(entries: Array<{ key: K; row: Row }>): Map<K, Row[]> {
  const groups = new Map<K, Row[]>();
  for (const { key, row } of entries) {
    const existing = groups.get(key);
    if (existing) existing.push(row);
    else groups.set(key, [row]);
  }
  return groups;
}

/** One line per series, and a point layer over it when markers are shown. */
function addSeriesLayers(builder: Builder, input: ChromatogramSpecInput): Builder {
  let next = builder;
  input.processedSeries.forEach((series, index) => {
    const color = seriesColor(series, index);
    const rows = seriesRows(series);
    next = next.line({
      data: rows,
      aes: { x: "x", y: "y" },
      color,
      linewidth: CHROMATOGRAM_TRACE.BASE_LINE_WIDTH,
      name: series.name,
    });
    if (input.showMarkers) {
      next = next.point({ data: rows, aes: { x: "x", y: "y" }, color, size: input.markerSize });
    }
  });
  return next;
}

/** Region overlays draw over the trace between a peak's start and end. */
function addRegionLayers(builder: Builder, input: ChromatogramSpecInput): Builder {
  const { processedSeries, processedAnnotations, allDetectedPeaks } = input;
  const overlayPeaks: Array<{ peak: PeakAnnotation; seriesIndex: number }> = [
    ...processedAnnotations.map((peak) => ({ peak, seriesIndex: 0 })),
    ...allDetectedPeaks.flatMap(({ peaks, seriesIndex }) => peaks.map((peak) => ({ peak, seriesIndex }))),
  ];
  let next = builder;
  for (const { peak, seriesIndex } of overlayPeaks) {
    const series = processedSeries[seriesIndex];
    const startIdx = peak._computed?.startIndex;
    const endIdx = peak._computed?.endIndex;
    if (!peak.regionOverlay || !series || startIdx === undefined || endIdx === undefined) continue;
    next = next.line({
      data: seriesRows(series, startIdx, endIdx),
      aes: { x: "x", y: "y" },
      color: peak.color ?? seriesColor(series, seriesIndex),
      linewidth: peak.regionOverlayWidth ?? DEFAULT_REGION_OVERLAY_WIDTH,
    });
  }
  return next;
}

/** Start and end markers, one point layer per colour and shape, staggered below each series. */
function addBoundaryLayers(builder: Builder, input: ChromatogramSpecInput): Builder {
  const { processedSeries, processedAnnotations, allDetectedPeaks } = input;
  const peaksWithData = collectPeaksWithBoundaryData(allDetectedPeaks, processedAnnotations, processedSeries);
  const entries: Array<{ key: string; row: Row }> = [];
  for (const { peaks, seriesIndex, x } of peaksWithData) {
    const fallbackColor = seriesColor(processedSeries[seriesIndex] ?? { name: "", x: [], y: [] }, seriesIndex);
    const startY = BOUNDARY_MARKER_START_Y + seriesIndex * BOUNDARY_MARKER_SERIES_OFFSET;
    const endY = BOUNDARY_MARKER_END_Y + seriesIndex * BOUNDARY_MARKER_SERIES_OFFSET;
    for (const peak of peaks) {
      const color = peak.color ?? fallbackColor;
      const startShape: BoundaryMarkerType = peak.startMarker ?? "triangle";
      const endShape: BoundaryMarkerType = peak.endMarker ?? "diamond";
      entries.push({ key: `${color}|${startShape}`, row: { x: x[peak._computed?.startIndex ?? 0], y: startY } });
      entries.push({ key: `${color}|${endShape}`, row: { x: x[peak._computed?.endIndex ?? 0], y: endY } });
    }
  }
  let next = builder;
  for (const [key, rows] of groupRows(entries)) {
    const [color, shape] = key.split("|") as [string, BoundaryMarkerType];
    if (shape === "none") continue;
    next = next.point({ data: rows, aes: { x: "x", y: "y" }, color, shape });
  }
  return next;
}

/** The colour a peak's label is drawn in, when the peak does not state one. */
function labelColor(processedSeries: ChromatogramSeries[], seriesIndex: number, userDefined: boolean): string {
  if (userDefined) return CHROMATOGRAM_ANNOTATION.USER_ANNOTATION_TEXT_COLOR;
  const series = processedSeries[seriesIndex];
  return series ? seriesColor(series, seriesIndex) : CHROMATOGRAM_ANNOTATION.USER_ANNOTATION_TEXT_COLOR;
}

/** Peak labels: user annotations always, detected peaks only when their areas are shown. */
function addLabelLayers(builder: Builder, input: ChromatogramSpecInput): Builder {
  const { processedSeries, processedAnnotations, allDetectedPeaks, showPeakAreas, enablePeakDetection } = input;
  const detected = showPeakAreas && enablePeakDetection ? allDetectedPeaks : [];
  const labelPeaks = [
    ...processedAnnotations.map((peak) => ({ peak, seriesIndex: 0, userDefined: true })),
    ...detected.flatMap(({ peaks, seriesIndex }) => peaks.map((peak) => ({ peak, seriesIndex, userDefined: false }))),
  ];
  const entries: Array<{ key: string; row: Row }> = [];
  for (const { peak, seriesIndex, userDefined } of labelPeaks) {
    const text = peakLabel(peak);
    if (text === "") continue;
    const color = peak.color ?? labelColor(processedSeries, seriesIndex, userDefined && !peak.color);
    entries.push({ key: color, row: { x: peak.x, y: peak.y, label: text } });
  }
  let next = builder;
  for (const [color, rows] of groupRows(entries)) {
    next = next.text({ data: rows, aes: { x: "x", y: "y", label: "label" }, color, vjust: 0 });
  }
  return next;
}

/**
 * Builds the ts-lib-viz spec for a chromatogram. Layers do not share one table:
 * each carries the rows it draws, so a region or a boundary marker can use its
 * own slice of a series without a null-padded column.
 */
export function buildChromatogramSpec(input: ChromatogramSpecInput): ChromatogramSpec {
  let builder = addSeriesLayers(newBuilder(), input);
  builder = addRegionLayers(builder, input);
  if (input.boundaryMarkers !== "none") {
    builder = addBoundaryLayers(builder, input);
  }
  builder = addLabelLayers(builder, input);

  const spec = builder
    .labs({ headline: input.title })
    .scales({
      x: { title: input.xAxisTitle, limits: input.xRange, grid: input.showGridX },
      y: { title: input.yAxisTitle, limits: input.yRange, grid: input.showGridY },
    })
    .spec();

  return { spec, data: [] };
}
