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

/**
 * Builds the ts-lib-viz spec for a chromatogram. Layers do not share one table:
 * each carries the rows it draws, so a region or a boundary marker can use its
 * own slice of a series without a null-padded column.
 */
export function buildChromatogramSpec(input: ChromatogramSpecInput): ChromatogramSpec {
  const {
    processedSeries,
    processedAnnotations,
    allDetectedPeaks,
    showPeakAreas,
    enablePeakDetection,
    boundaryMarkers,
    showMarkers,
    markerSize,
    title,
    xAxisTitle,
    yAxisTitle,
    xRange,
    yRange,
    showGridX,
    showGridY,
  } = input;

  const emptyRows: Row[] = [];
  let builder = plot(emptyRows, { x: "x", y: "y" });

  processedSeries.forEach((series, index) => {
    const color = seriesColor(series, index);
    const rows = seriesRows(series);
    builder = builder.line({
      data: rows,
      aes: { x: "x", y: "y" },
      color,
      linewidth: CHROMATOGRAM_TRACE.BASE_LINE_WIDTH,
      name: series.name,
    });
    if (showMarkers) {
      builder = builder.point({ data: rows, aes: { x: "x", y: "y" }, color, size: markerSize });
    }
  });

  // Region overlays draw over the trace between a peak's start and end.
  const overlayPeaks: Array<{ peak: PeakAnnotation; seriesIndex: number }> = [
    ...processedAnnotations.map((peak) => ({ peak, seriesIndex: 0 })),
    ...allDetectedPeaks.flatMap(({ peaks, seriesIndex }) => peaks.map((peak) => ({ peak, seriesIndex }))),
  ];
  for (const { peak, seriesIndex } of overlayPeaks) {
    const series = processedSeries[seriesIndex];
    const startIdx = peak._computed?.startIndex;
    const endIdx = peak._computed?.endIndex;
    if (!peak.regionOverlay || !series || startIdx === undefined || endIdx === undefined) continue;
    builder = builder.line({
      data: seriesRows(series, startIdx, endIdx),
      aes: { x: "x", y: "y" },
      color: peak.color ?? seriesColor(series, seriesIndex),
      linewidth: peak.regionOverlayWidth ?? DEFAULT_REGION_OVERLAY_WIDTH,
    });
  }

  if (boundaryMarkers !== "none") {
    const peaksWithData = collectPeaksWithBoundaryData(allDetectedPeaks, processedAnnotations, processedSeries);
    const markerEntries: Array<{ key: string; row: Row }> = [];
    for (const { peaks, seriesIndex, x } of peaksWithData) {
      const fallbackColor = seriesColor(processedSeries[seriesIndex] ?? { name: "", x: [], y: [] }, seriesIndex);
      const startY = BOUNDARY_MARKER_START_Y + seriesIndex * BOUNDARY_MARKER_SERIES_OFFSET;
      const endY = BOUNDARY_MARKER_END_Y + seriesIndex * BOUNDARY_MARKER_SERIES_OFFSET;
      for (const peak of peaks) {
        const startX = x[peak._computed?.startIndex ?? 0];
        const endX = x[peak._computed?.endIndex ?? 0];
        const color = peak.color ?? fallbackColor;
        const startShape: BoundaryMarkerType = peak.startMarker ?? "triangle";
        const endShape: BoundaryMarkerType = peak.endMarker ?? "diamond";
        markerEntries.push({ key: `${color}|${startShape}`, row: { x: startX, y: startY } });
        markerEntries.push({ key: `${color}|${endShape}`, row: { x: endX, y: endY } });
      }
    }
    for (const [key, rows] of groupRows(markerEntries)) {
      const [color, shape] = key.split("|") as [string, BoundaryMarkerType];
      if (shape === "none") continue;
      builder = builder.point({ data: rows, aes: { x: "x", y: "y" }, color, shape });
    }
  }

  // Peak labels: user annotations always, detected peaks only when their areas are shown.
  const labelPeaks: Array<{ peak: PeakAnnotation; seriesIndex: number; userDefined: boolean }> = [
    ...processedAnnotations.map((peak) => ({ peak, seriesIndex: 0, userDefined: true })),
    ...(showPeakAreas && enablePeakDetection
      ? allDetectedPeaks.flatMap(({ peaks, seriesIndex }) =>
          peaks.map((peak) => ({ peak, seriesIndex, userDefined: false })),
        )
      : []),
  ];
  const labelEntries: Array<{ key: string; row: Row }> = [];
  for (const { peak, seriesIndex, userDefined } of labelPeaks) {
    const text = peakLabel(peak);
    if (text === "") continue;
    const series = processedSeries[seriesIndex];
    const defaultColor =
      userDefined && !peak.color
        ? CHROMATOGRAM_ANNOTATION.USER_ANNOTATION_TEXT_COLOR
        : series
          ? seriesColor(series, seriesIndex)
          : CHROMATOGRAM_ANNOTATION.USER_ANNOTATION_TEXT_COLOR;
    labelEntries.push({ key: peak.color ?? defaultColor, row: { x: peak.x, y: peak.y, label: text } });
  }
  for (const [color, rows] of groupRows(labelEntries)) {
    builder = builder.text({ data: rows, aes: { x: "x", y: "y", label: "label" }, color, vjust: 0 });
  }

  const spec = builder
    .labs({ headline: title })
    .scales({
      x: { title: xAxisTitle, limits: xRange, grid: showGridX },
      y: { title: yAxisTitle, limits: yRange, grid: showGridY },
    })
    .spec();

  return { spec, data: [] };
}
