import Plotly from "plotly.js-dist";
import React, { useEffect, useRef } from "react";

import { COLORS, CHART_COLORS } from "../../../utils/colors";

import { CHROMATOGRAM_ANNOTATION, CHROMATOGRAM_LAYOUT } from "./constants";
import "./ChromatogramChart.scss";

/**
 * Data series for chromatogram visualization
 */
export interface ChromatogramSeries {
  /** Retention time values (x-axis) */
  x: number[];
  /** Signal intensity values (y-axis) */
  y: number[];
  /** Series label for legend */
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
}

/**
 * Peak annotation for labeling compounds
 */
export interface PeakAnnotation {
  /** Retention time of the peak */
  x: number;
  /** Signal intensity at peak */
  y: number;
  /** Label text (e.g., compound name) */
  text: string;
  /** Vertical arrow offset in pixels (negative = above peak, default: -30) */
  ay?: number;
  /** Horizontal arrow offset in pixels (default: 0) */
  ax?: number;
}

/**
 * Detected peak with integration data
 */
export interface DetectedPeak {
  /** Peak index in the data array */
  index: number;
  /** Retention time at peak apex */
  retentionTime: number;
  /** Signal intensity at peak apex */
  intensity: number;
  /** Peak area (integrated) */
  area: number;
  /** Start index of peak */
  startIndex: number;
  /** End index of peak */
  endIndex: number;
  /** Peak width at half maximum */
  widthAtHalfMax: number;
}

/**
 * Baseline correction method
 */
export type BaselineCorrectionMethod = "none" | "linear" | "rolling";

/**
 * Peak boundary marker style
 */
export type BoundaryMarkerStyle = "none" | "triangle" | "diamond" | "auto";

/**
 * Peak detection options
 */
export interface PeakDetectionOptions {
  /** Minimum peak height threshold (absolute or relative to max, default: 0.05) */
  minHeight?: number;
  /** Minimum distance between peaks in data points (default: 5) */
  minDistance?: number;
  /** Prominence threshold - how much a peak stands out from neighbors (default: 0.02) */
  prominence?: number;
  /** Use relative threshold as percentage of max signal (default: true) */
  relativeThreshold?: boolean;
  /** Show peak areas as annotations (default: false) */
  showAreas?: boolean;
  /**
   * Retention time threshold for grouping overlapping annotations (default: 0.4 minutes).
   * Peaks closer than this threshold will have their annotations staggered to avoid overlap.
   * Adjust based on your x-axis scale and label width.
   */
  annotationOverlapThreshold?: number;
  /**
   * Show peak boundary markers (default: "none").
   * - "none": No boundary markers
   * - "triangle": Triangle markers at peak start/end (for isolated peaks at baseline)
   * - "diamond": Diamond markers with vertical lines (for overlapping peaks)
   * - "auto": Automatically choose based on peak overlap detection
   */
  boundaryMarkers?: BoundaryMarkerStyle;
}

/**
 * Props for ChromatogramChart component
 */
export interface ChromatogramChartProps {
  /** Array of data series to display */
  series: ChromatogramSeries[];
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Chart title */
  title?: string;
  /** X-axis label */
  xAxisTitle?: string;
  /** Y-axis label */
  yAxisTitle?: string;
  /** Peak annotations to display */
  annotations?: PeakAnnotation[];
  /** Fixed x-axis range [min, max] */
  xRange?: [number, number];
  /** Fixed y-axis range [min, max] */
  yRange?: [number, number];
  /** Show legend (default: true) */
  showLegend?: boolean;
  /** Show vertical grid lines (default: true) */
  showGridX?: boolean;
  /** Show horizontal grid lines (default: true) */
  showGridY?: boolean;
  /** Show data point markers (default: false) */
  showMarkers?: boolean;
  /** Marker size when showMarkers is true (default: 4) */
  markerSize?: number;
  /** Show crosshairs on hover (default: false) */
  showCrosshairs?: boolean;
  /** Baseline correction method (default: "none") */
  baselineCorrection?: BaselineCorrectionMethod;
  /** Rolling baseline window size (default: 50) */
  baselineWindowSize?: number;
  /** Peak detection options - if provided, enables automatic peak detection */
  peakDetectionOptions?: PeakDetectionOptions;
  /**
   * Callback when peaks are detected.
   * This callback is internally stabilized using a ref pattern, so you don't need
   * to memoize it - the chart won't re-render when the callback reference changes.
   */
  onPeaksDetected?: (peaks: DetectedPeak[], seriesIndex: number) => void;
  /** Show export button in modebar (default: true) */
  showExportButton?: boolean;
}

/**
 * Validate and sanitize series data.
 * - Ensures x and y arrays have the same length (truncates to shorter)
 * - Replaces NaN and Infinity values with 0
 */
function validateSeriesData(
  x: number[],
  y: number[]
): { x: number[]; y: number[] } {
  // Ensure arrays have same length
  const length = Math.min(x.length, y.length);
  const validX = x.slice(0, length);
  const validY = y.slice(0, length);

  // Sanitize NaN and Infinity values
  const sanitizedY = validY.map((val) =>
    Number.isFinite(val) ? val : 0
  );
  const sanitizedX = validX.map((val) =>
    Number.isFinite(val) ? val : 0
  );

  return { x: sanitizedX, y: sanitizedY };
}

/**
 * Apply baseline correction to signal data
 */
function applyBaselineCorrection(
  y: number[],
  method: BaselineCorrectionMethod,
  windowSize: number = 50
): number[] {
  if (method === "none" || y.length === 0) return y;

  if (method === "linear") {
    // Linear baseline from first to last point
    const slope = (y[y.length - 1] - y[0]) / (y.length - 1);
    return y.map((val, i) => val - (y[0] + slope * i));
  }

  if (method === "rolling") {
    // Rolling minimum baseline
    const baseline: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < y.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(y.length, i + halfWindow + 1);
      const windowSlice = y.slice(start, end);
      baseline.push(Math.min(...windowSlice));
    }

    return y.map((val, i) => val - baseline[i]);
  }

  return y;
}

/**
 * Calculate prominence of a peak (how much it stands out from neighbors)
 */
function calculateProminence(
  y: number[],
  peakIndex: number,
  searchWindow: number
): number {
  let leftMin = y[peakIndex];
  let rightMin = y[peakIndex];

  for (let j = peakIndex - 1; j >= Math.max(0, peakIndex - searchWindow); j--) {
    leftMin = Math.min(leftMin, y[j]);
  }
  for (let j = peakIndex + 1; j < Math.min(y.length, peakIndex + searchWindow); j++) {
    rightMin = Math.min(rightMin, y[j]);
  }

  return y[peakIndex] - Math.max(leftMin, rightMin);
}

/**
 * Find peak boundary indices by walking outward from peak
 */
function findPeakBoundaries(
  y: number[],
  peakIndex: number
): { startIndex: number; endIndex: number } {
  let startIndex = peakIndex;
  let endIndex = peakIndex;

  // Walk left to find start
  for (let j = peakIndex - 1; j >= 0; j--) {
    if (y[j] <= y[j + 1]) {
      startIndex = j;
    } else {
      break;
    }
  }

  // Walk right to find end
  for (let j = peakIndex + 1; j < y.length; j++) {
    if (y[j] <= y[j - 1]) {
      endIndex = j;
    } else {
      break;
    }
  }

  return { startIndex, endIndex };
}

/**
 * Calculate peak area using trapezoidal integration
 */
function calculatePeakArea(
  x: number[],
  y: number[],
  startIndex: number,
  endIndex: number
): number {
  const baselineY = Math.min(y[startIndex], y[endIndex]);
  let area = 0;

  for (let j = startIndex; j < endIndex; j++) {
    const h = x[j + 1] - x[j];
    const y1 = y[j] - baselineY;
    const y2 = y[j + 1] - baselineY;
    area += (y1 + y2) * h / 2;
  }

  return area;
}

/**
 * Calculate width at half maximum of a peak
 */
function calculateWidthAtHalfMax(
  x: number[],
  y: number[],
  peakIndex: number,
  startIndex: number,
  endIndex: number
): number {
  const baselineY = Math.min(y[startIndex], y[endIndex]);
  const halfMax = (y[peakIndex] + baselineY) / 2;
  let leftHalf = peakIndex;
  let rightHalf = peakIndex;

  for (let j = peakIndex; j >= startIndex; j--) {
    if (y[j] < halfMax) {
      leftHalf = j;
      break;
    }
  }
  for (let j = peakIndex; j <= endIndex; j++) {
    if (y[j] < halfMax) {
      rightHalf = j;
      break;
    }
  }

  return x[rightHalf] - x[leftHalf];
}

/**
 * Filter peaks by minimum distance, keeping more intense peaks
 */
function filterPeaksByDistance(
  peaks: DetectedPeak[],
  minDistance: number
): DetectedPeak[] {
  const filtered: DetectedPeak[] = [];

  for (const peak of peaks) {
    const tooClose = filtered.some(
      (p) => Math.abs(p.index - peak.index) < minDistance
    );
    if (!tooClose) {
      filtered.push(peak);
    } else if (filtered.length > 0 && peak.intensity > filtered[filtered.length - 1].intensity) {
      filtered.pop();
      filtered.push(peak);
    }
  }

  return filtered.sort((a, b) => a.retentionTime - b.retentionTime);
}

/**
 * Metadata for a peak with its series index
 */
type PeakWithMeta = { peak: DetectedPeak; seriesIndex: number };

/**
 * Annotation slot positions for peak labels
 */
const ANNOTATION_SLOTS = {
  default: { ax: 0, ay: -35 },
  overlap: [
    { ax: 50, ay: -35 },   // Right, level 1
    { ax: -60, ay: -35 },  // Left, level 1
    { ax: 70, ay: -55 },   // Right, level 2
    { ax: -80, ay: -55 },  // Left, level 2
    { ax: 50, ay: -75 },   // Right, level 3
    { ax: -60, ay: -75 },  // Left, level 3
  ],
};

/**
 * Group overlapping peaks by retention time proximity
 */
function groupOverlappingPeaks(
  peaksWithMeta: PeakWithMeta[],
  overlapThreshold: number
): PeakWithMeta[][] {
  const sorted = [...peaksWithMeta].sort(
    (a, b) => a.peak.retentionTime - b.peak.retentionTime
  );

  const groups: PeakWithMeta[][] = [];
  let currentGroup: PeakWithMeta[] = [];

  for (const current of sorted) {
    if (currentGroup.length === 0) {
      currentGroup.push(current);
      continue;
    }

    const lastInGroup = currentGroup[currentGroup.length - 1];
    const timeDiff = Math.abs(current.peak.retentionTime - lastInGroup.peak.retentionTime);

    if (timeDiff < overlapThreshold) {
      currentGroup.push(current);
    } else {
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Create a Plotly annotation for a peak
 */
function createPeakAnnotation(
  peak: DetectedPeak,
  seriesIndex: number,
  slot: { ax: number; ay: number }
): Partial<Plotly.Annotations> {
  const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];
  return {
    x: peak.retentionTime,
    y: peak.intensity,
    text: `Area: ${peak.area.toFixed(2)}`,
    showarrow: true,
    arrowhead: 2,
    arrowsize: 1,
    arrowwidth: 1,
    arrowcolor: color,
    ax: slot.ax,
    ay: slot.ay,
    font: {
      size: 10,
      color: color,
      family: "Inter, sans-serif",
    },
    bgcolor: COLORS.WHITE,
    borderpad: 2,
    bordercolor: color,
    borderwidth: 1,
  };
}

/**
 * Create annotations for a group of peaks, handling overlap positioning
 */
function createGroupAnnotations(group: PeakWithMeta[]): Partial<Plotly.Annotations>[] {
  if (group.length === 1) {
    const { peak, seriesIndex } = group[0];
    return [createPeakAnnotation(peak, seriesIndex, ANNOTATION_SLOTS.default)];
  }

  // Sort by intensity (lowest first) so lower peaks get closer annotations
  const sortedGroup = [...group].sort(
    (a, b) => a.peak.intensity - b.peak.intensity
  );

  return sortedGroup.map(({ peak, seriesIndex }, slotIndex) => {
    const slot = ANNOTATION_SLOTS.overlap[slotIndex % ANNOTATION_SLOTS.overlap.length];
    return createPeakAnnotation(peak, seriesIndex, slot);
  });
}

/**
 * Check if two peaks overlap (share boundary indices)
 */
function peaksOverlap(peak1: DetectedPeak, peak2: DetectedPeak): boolean {
  return peak1.endIndex >= peak2.startIndex && peak2.endIndex >= peak1.startIndex;
}

/**
 * Determine if a peak boundary is shared with another peak
 */
function findOverlappingPeaks(
  peaks: DetectedPeak[],
  currentPeak: DetectedPeak
): { startOverlaps: boolean; endOverlaps: boolean } {
  let startOverlaps = false;
  let endOverlaps = false;

  for (const other of peaks) {
    if (other.index === currentPeak.index) continue;
    if (peaksOverlap(currentPeak, other)) {
      // Check if start boundary is shared
      if (Math.abs(currentPeak.startIndex - other.endIndex) <= 1) {
        startOverlaps = true;
      }
      // Check if end boundary is shared
      if (Math.abs(currentPeak.endIndex - other.startIndex) <= 1) {
        endOverlaps = true;
      }
    }
  }

  return { startOverlaps, endOverlaps };
}

/**
 * Create boundary marker traces for peaks
 */
function createBoundaryMarkerTraces(
  allPeaks: { peaks: DetectedPeak[]; seriesIndex: number; x: number[]; y: number[] }[],
  markerStyle: BoundaryMarkerStyle
): Plotly.Data[] {
  const traces: Plotly.Data[] = [];

  // Flatten all peaks for overlap detection
  const flatPeaks = allPeaks.flatMap(({ peaks }) => peaks);

  for (const { peaks, seriesIndex, x, y } of allPeaks) {
    const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];

    for (const peak of peaks) {
      const { startOverlaps, endOverlaps } = markerStyle === "auto"
        ? findOverlappingPeaks(flatPeaks, peak)
        : { startOverlaps: markerStyle === "diamond", endOverlaps: markerStyle === "diamond" };

      const startX = x[peak.startIndex];
      const startY = y[peak.startIndex];
      const endX = x[peak.endIndex];
      const endY = y[peak.endIndex];

      // Create start boundary marker
      if (startOverlaps) {
        // Diamond marker with vertical line for overlapping boundary
        traces.push({
          x: [startX, startX],
          y: [0, startY],
          type: "scatter" as const,
          mode: "lines" as const,
          line: { color, width: 1, dash: "dot" as const },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
        traces.push({
          x: [startX],
          y: [startY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "diamond" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      } else {
        // Triangle marker for isolated boundary at baseline
        traces.push({
          x: [startX],
          y: [startY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "triangle-up" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      }

      // Create end boundary marker
      if (endOverlaps) {
        // Diamond marker with vertical line for overlapping boundary
        traces.push({
          x: [endX, endX],
          y: [0, endY],
          type: "scatter" as const,
          mode: "lines" as const,
          line: { color, width: 1, dash: "dot" as const },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
        traces.push({
          x: [endX],
          y: [endY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "diamond" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      } else {
        // Triangle marker for isolated boundary at baseline
        traces.push({
          x: [endX],
          y: [endY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "triangle-up" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      }
    }
  }

  return traces;
}

/**
 * Detect peaks in signal data using derivative analysis.
 *
 * Default parameters are tuned for typical HPLC chromatograms:
 * - minHeight (0.05 = 5%): Filters noise while detecting small peaks
 * - minDistance (5 points): Prevents detecting noise as multiple peaks
 * - prominence (0.02 = 2%): Ensures peaks stand out from baseline/shoulders
 */
function detectPeaks(
  x: number[],
  y: number[],
  options: PeakDetectionOptions = {}
): DetectedPeak[] {
  const {
    minHeight = 0.05,
    minDistance = 5,
    prominence = 0.02,
    relativeThreshold = true,
  } = options;

  if (y.length < 3) return [];

  const maxY = Math.max(...y);
  const threshold = relativeThreshold ? minHeight * maxY : minHeight;
  const prominenceThreshold = relativeThreshold ? prominence * maxY : prominence;
  const searchWindow = minDistance * 3;

  const peaks: DetectedPeak[] = [];

  // Find local maxima
  for (let i = 1; i < y.length - 1; i++) {
    const isLocalMax = y[i] > y[i - 1] && y[i] > y[i + 1] && y[i] >= threshold;
    if (!isLocalMax) continue;

    const peakProminence = calculateProminence(y, i, searchWindow);
    if (peakProminence < prominenceThreshold) continue;

    const { startIndex, endIndex } = findPeakBoundaries(y, i);
    const area = calculatePeakArea(x, y, startIndex, endIndex);
    const widthAtHalfMax = calculateWidthAtHalfMax(x, y, i, startIndex, endIndex);

    peaks.push({
      index: i,
      retentionTime: x[i],
      intensity: y[i],
      area,
      startIndex,
      endIndex,
      widthAtHalfMax,
    });
  }

  return filterPeaksByDistance(peaks, minDistance);
}

const ChromatogramChart: React.FC<ChromatogramChartProps> = ({
  series,
  width = 900,
  height = 500,
  title,
  xAxisTitle = "Retention Time (min)",
  yAxisTitle = "Signal (mAU)",
  annotations = [],
  xRange,
  yRange,
  showLegend = true,
  showGridX = true,
  showGridY = true,
  showMarkers = false,
  markerSize = 4,
  showCrosshairs = false,
  baselineCorrection = "none",
  baselineWindowSize = 50,
  peakDetectionOptions,
  onPeaksDetected,
  showExportButton = true,
}) => {
  // Derive peak detection state from options
  const enablePeakDetection = peakDetectionOptions !== undefined;
  const showPeakAreas = peakDetectionOptions?.showAreas ?? false;
  const plotRef = useRef<HTMLDivElement>(null);

  // Use ref pattern to stabilize callback - prevents re-renders when callback reference changes
  const onPeaksDetectedRef = useRef(onPeaksDetected);
  onPeaksDetectedRef.current = onPeaksDetected;

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef || series.length === 0) return;

    // Validate and process series with baseline correction
    const processedSeries = series.map((s) => {
      const validated = validateSeriesData(s.x, s.y);
      return {
        ...s,
        x: validated.x,
        y: applyBaselineCorrection(validated.y, baselineCorrection, baselineWindowSize),
      };
    });

    // Detect peaks if enabled
    const allDetectedPeaks: { peaks: DetectedPeak[]; seriesIndex: number }[] = [];
    if (enablePeakDetection && peakDetectionOptions) {
      processedSeries.forEach((s, index) => {
        const peaks = detectPeaks(s.x, s.y, peakDetectionOptions);
        if (peaks.length > 0) {
          allDetectedPeaks.push({ peaks, seriesIndex: index });
          onPeaksDetectedRef.current?.(peaks, index);
        }
      });
    }

    // Build trace data with auto-assigned colors
    const plotData: Plotly.Data[] = processedSeries.map((s, index) => {
      const traceColor = s.color || CHART_COLORS[index % CHART_COLORS.length];
      const trace: Plotly.Data = {
        x: s.x,
        y: s.y,
        type: "scatter" as const,
        mode: showMarkers ? "lines+markers" as const : "lines" as const,
        name: s.name,
        line: {
          color: traceColor,
          width: 1.5,
        },
        hovertemplate: `%{y:.2f} ${yAxisTitle}<extra>${s.name}</extra>`,
      };
      if (showMarkers) {
        trace.marker = {
          size: markerSize,
          color: traceColor,
        };
      }
      return trace;
    });

    // Add peak boundary markers if enabled
    const boundaryMarkerStyle = peakDetectionOptions?.boundaryMarkers ?? "none";
    if (boundaryMarkerStyle !== "none" && allDetectedPeaks.length > 0) {
      const peaksWithData = allDetectedPeaks.map(({ peaks, seriesIndex }) => ({
        peaks,
        seriesIndex,
        x: processedSeries[seriesIndex].x,
        y: processedSeries[seriesIndex].y,
      }));
      const boundaryTraces = createBoundaryMarkerTraces(peaksWithData, boundaryMarkerStyle);
      plotData.push(...boundaryTraces);
    }

    // Build Plotly annotations from peak annotations
    const plotlyAnnotations: Partial<Plotly.Annotations>[] = annotations.map((ann) => ({
      x: ann.x,
      y: ann.y,
      text: ann.text,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 1,
      arrowcolor: COLORS.GREY_500,
      ax: ann.ax ?? 0,
      ay: ann.ay ?? CHROMATOGRAM_ANNOTATION.DEFAULT_ARROW_OFFSET_Y,
      font: {
        size: 11,
        color: COLORS.BLACK_900,
        family: "Inter, sans-serif",
      },
      bgcolor: COLORS.WHITE,
      borderpad: 2,
    }));

    // Add peak area annotations if enabled
    if (showPeakAreas && enablePeakDetection) {
      // Collect all peaks with metadata
      const allPeaksWithMeta: PeakWithMeta[] = [];
      allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
        peaks.forEach((peak) => {
          allPeaksWithMeta.push({ peak, seriesIndex });
        });
      });

      // Group overlapping peaks and create annotations
      const overlapThreshold = peakDetectionOptions?.annotationOverlapThreshold ?? 0.4;
      const groups = groupOverlappingPeaks(allPeaksWithMeta, overlapThreshold);

      for (const group of groups) {
        plotlyAnnotations.push(...createGroupAnnotations(group));
      }
    }

    const layout: Partial<Plotly.Layout> = {
      title: title
        ? {
            text: title,
            font: {
              size: 20,
              family: "Inter, sans-serif",
              color: COLORS.BLACK_900,
            },
          }
        : undefined,
      width,
      height,
      margin: {
        l: CHROMATOGRAM_LAYOUT.MARGIN_LEFT,
        r: CHROMATOGRAM_LAYOUT.MARGIN_RIGHT,
        b: CHROMATOGRAM_LAYOUT.MARGIN_BOTTOM,
        t: title ? CHROMATOGRAM_LAYOUT.MARGIN_TOP_WITH_TITLE : CHROMATOGRAM_LAYOUT.MARGIN_TOP_NO_TITLE,
        pad: CHROMATOGRAM_LAYOUT.MARGIN_PAD,
      },
      paper_bgcolor: COLORS.WHITE,
      plot_bgcolor: COLORS.WHITE,
      font: { family: "Inter, sans-serif" },
      hovermode: showCrosshairs ? "x" as const : "x unified" as const,
      dragmode: "zoom" as const,
      xaxis: {
        title: {
          text: xAxisTitle,
          font: { size: 14, color: COLORS.BLACK_600, family: "Inter, sans-serif" },
          standoff: 15,
        },
        showgrid: showGridX,
        gridcolor: COLORS.GREY_200,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        range: xRange,
        autorange: !xRange,
        zeroline: false,
        tickfont: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: COLORS.GREY_500,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          font: { size: 14, color: COLORS.BLACK_600, family: "Inter, sans-serif" },
          standoff: 10,
        },
        showgrid: showGridY,
        gridcolor: COLORS.GREY_200,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        range: yRange,
        autorange: !yRange,
        zeroline: false,
        tickfont: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: COLORS.GREY_500,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: "center" as const,
        yanchor: "top" as const,
        orientation: "h" as const,
        font: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
      },
      showlegend: showLegend && series.length > 1,
      annotations: plotlyAnnotations,
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"] as Plotly.ModeBarDefaultButtons[],
      toImageButtonOptions: showExportButton ? {
        format: "png",
        filename: "chromatogram",
        width: width,
        height: height,
      } : undefined,
    };

    Plotly.newPlot(currentRef, plotData, layout, config);

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    series, width, height, title, xAxisTitle, yAxisTitle, annotations, xRange, yRange,
    showLegend, showGridX, showGridY, showMarkers, markerSize, showCrosshairs,
    baselineCorrection, baselineWindowSize, enablePeakDetection, peakDetectionOptions,
    showPeakAreas, showExportButton
    // Note: onPeaksDetected is intentionally omitted - we use a ref to avoid re-renders
  ]);

  return (
    <div className="chromatogram-chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ChromatogramChart };

