import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./ChromatogramChart.scss";
import { COLORS, CHART_COLORS } from "../../../utils/colors";

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
  // Default values optimized for typical HPLC data with ~600 data points over 30 minutes
  const {
    minHeight = 0.05,    // 5% of max signal - balances noise rejection vs sensitivity
    minDistance = 5,     // ~5 data points - prevents detecting shoulder artifacts
    prominence = 0.02,   // 2% of max signal - ensures peaks stand out from neighbors
    relativeThreshold = true,
  } = options;

  if (y.length < 3) return [];

  const maxY = Math.max(...y);
  const threshold = relativeThreshold ? minHeight * maxY : minHeight;
  const prominenceThreshold = relativeThreshold ? prominence * maxY : prominence;

  const peaks: DetectedPeak[] = [];

  // Find local maxima
  for (let i = 1; i < y.length - 1; i++) {
    if (y[i] > y[i - 1] && y[i] > y[i + 1] && y[i] >= threshold) {
      // Check prominence (how much peak stands out from neighbors)
      let leftMin = y[i];
      let rightMin = y[i];

      for (let j = i - 1; j >= Math.max(0, i - minDistance * 3); j--) {
        leftMin = Math.min(leftMin, y[j]);
      }
      for (let j = i + 1; j < Math.min(y.length, i + minDistance * 3); j++) {
        rightMin = Math.min(rightMin, y[j]);
      }

      const peakProminence = y[i] - Math.max(leftMin, rightMin);

      if (peakProminence >= prominenceThreshold) {
        // Find peak boundaries
        let startIndex = i;
        let endIndex = i;

        // Walk left to find start
        for (let j = i - 1; j >= 0; j--) {
          if (y[j] <= y[j + 1]) {
            startIndex = j;
          } else {
            break;
          }
        }

        // Walk right to find end
        for (let j = i + 1; j < y.length; j++) {
          if (y[j] <= y[j - 1]) {
            endIndex = j;
          } else {
            break;
          }
        }

        // Calculate area using trapezoidal integration
        let area = 0;
        const baselineY = Math.min(y[startIndex], y[endIndex]);
        for (let j = startIndex; j < endIndex; j++) {
          const h = x[j + 1] - x[j];
          const y1 = y[j] - baselineY;
          const y2 = y[j + 1] - baselineY;
          area += (y1 + y2) * h / 2;
        }

        // Calculate width at half maximum
        const halfMax = (y[i] + baselineY) / 2;
        let leftHalf = i;
        let rightHalf = i;

        for (let j = i; j >= startIndex; j--) {
          if (y[j] < halfMax) {
            leftHalf = j;
            break;
          }
        }
        for (let j = i; j <= endIndex; j++) {
          if (y[j] < halfMax) {
            rightHalf = j;
            break;
          }
        }

        peaks.push({
          index: i,
          retentionTime: x[i],
          intensity: y[i],
          area,
          startIndex,
          endIndex,
          widthAtHalfMax: x[rightHalf] - x[leftHalf],
        });
      }
    }
  }

  // Filter by minimum distance
  const filteredPeaks: DetectedPeak[] = [];
  for (const peak of peaks) {
    const tooClose = filteredPeaks.some(
      (p) => Math.abs(p.index - peak.index) < minDistance
    );
    if (!tooClose || (filteredPeaks.length > 0 &&
        peak.intensity > filteredPeaks[filteredPeaks.length - 1].intensity)) {
      if (tooClose) {
        filteredPeaks.pop();
      }
      filteredPeaks.push(peak);
    }
  }

  return filteredPeaks.sort((a, b) => a.retentionTime - b.retentionTime);
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
      ay: ann.ay ?? -30,
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
      // Step 1: Collect all peaks with metadata
      type PeakWithMeta = { peak: DetectedPeak; seriesIndex: number };
      const allPeaksWithMeta: PeakWithMeta[] = [];
      allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
        peaks.forEach((peak) => {
          allPeaksWithMeta.push({ peak, seriesIndex });
        });
      });

      // Step 2: Sort by retention time
      allPeaksWithMeta.sort(
        (a, b) => a.peak.retentionTime - b.peak.retentionTime
      );

      // Step 3: Group overlapping peaks by retention time proximity
      // Threshold of 0.4 minutes works well for typical HPLC/UPLC runs (0.05 min resolution)
      // where annotation labels are ~60-80px wide at 10pt font
      const overlapThreshold = peakDetectionOptions?.annotationOverlapThreshold ?? 0.4;
      const groups: PeakWithMeta[][] = [];
      let currentGroup: PeakWithMeta[] = [];

      for (let i = 0; i < allPeaksWithMeta.length; i++) {
        const current = allPeaksWithMeta[i];

        if (currentGroup.length === 0) {
          currentGroup.push(current);
        } else {
          const lastInGroup = currentGroup[currentGroup.length - 1];
          if (
            Math.abs(
              current.peak.retentionTime - lastInGroup.peak.retentionTime
            ) < overlapThreshold
          ) {
            // Overlaps with group - add to it
            currentGroup.push(current);
          } else {
            // No overlap - save current group and start new one
            groups.push(currentGroup);
            currentGroup = [current];
          }
        }
      }
      // Don't forget the last group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      // Step 4: Define annotation slots for positioning labels
      // Slots alternate left/right and increase in vertical offset (ay) to create
      // a staggered pattern. Values are in pixels relative to the peak point.
      // - ax: horizontal offset (positive = right, negative = left)
      // - ay: vertical offset (negative = above the peak)
      // Offsets are sized to accommodate ~10pt font labels (~60-80px wide)
      const defaultSlot = { ax: 0, ay: -35 }; // Centered directly above peak
      const overlapSlots = [
        { ax: 50, ay: -35 },   // Right, level 1
        { ax: -60, ay: -35 },  // Left, level 1 (slightly wider to avoid arrow overlap)
        { ax: 70, ay: -55 },   // Right, level 2 (20px higher)
        { ax: -80, ay: -55 },  // Left, level 2
        { ax: 50, ay: -75 },   // Right, level 3 (20px higher)
        { ax: -60, ay: -75 },  // Left, level 3
      ];

      // Step 5: Process each group
      for (const group of groups) {
        if (group.length === 1) {
          // Single peak - use centered slot
          const { peak, seriesIndex } = group[0];
          plotlyAnnotations.push({
            x: peak.retentionTime,
            y: peak.intensity,
            text: `Area: ${peak.area.toFixed(2)}`,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            arrowwidth: 1,
            arrowcolor: CHART_COLORS[seriesIndex % CHART_COLORS.length],
            ax: defaultSlot.ax,
            ay: defaultSlot.ay,
            font: {
              size: 10,
              color: CHART_COLORS[seriesIndex % CHART_COLORS.length],
              family: "Inter, sans-serif",
            },
            bgcolor: COLORS.WHITE,
            borderpad: 2,
            bordercolor: CHART_COLORS[seriesIndex % CHART_COLORS.length],
            borderwidth: 1,
          });
        } else {
          // Multiple peaks - sort by y position (lowest first) so peaks lower
          // on the graph get annotations closer to them, avoiding arrow crossings
          const sortedGroup = [...group].sort(
            (a, b) => a.peak.intensity - b.peak.intensity
          );

          sortedGroup.forEach(({ peak, seriesIndex }, slotIndex) => {
            const slot = overlapSlots[slotIndex % overlapSlots.length];
            plotlyAnnotations.push({
              x: peak.retentionTime,
              y: peak.intensity,
              text: `Area: ${peak.area.toFixed(2)}`,
              showarrow: true,
              arrowhead: 2,
              arrowsize: 1,
              arrowwidth: 1,
              arrowcolor: CHART_COLORS[seriesIndex % CHART_COLORS.length],
              ax: slot.ax,
              ay: slot.ay,
              font: {
                size: 10,
                color: CHART_COLORS[seriesIndex % CHART_COLORS.length],
                family: "Inter, sans-serif",
              },
              bgcolor: COLORS.WHITE,
              borderpad: 2,
              bordercolor: CHART_COLORS[seriesIndex % CHART_COLORS.length],
              borderwidth: 1,
            });
          });
        }
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
      margin: { l: 70, r: 30, b: 60, t: title ? 50 : 30, pad: 5 },
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

