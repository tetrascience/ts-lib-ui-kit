/**
 * Type definitions for ChromatogramChart component
 */

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
  /** Optional metadata for the trace (displayed in tooltip on hover) */
  metadata?: Record<string, unknown>;
}

/**
 * Peak annotation for labeling peaks on the chromatogram.
 * Used for both user-provided annotations and auto-detected peaks.
 */
export interface PeakAnnotation {
  /** Retention time of the peak (x-axis position) */
  x: number;
  /** Signal intensity at peak (y-axis position) */
  y: number;
  /** Label text (e.g., compound name). If not provided, auto-generated from area. */
  text?: string;
  /** Vertical arrow offset in pixels (negative = above peak, default: -30) */
  ay?: number;
  /** Horizontal arrow offset in pixels (default: 0) */
  ax?: number;
  /** Peak area - used to auto-generate text label if text is not provided */
  area?: number;
  /** Peak index in the data array */
  index?: number;
  /** Start index of peak boundary (for boundary markers) */
  startIndex?: number;
  /** End index of peak boundary (for boundary markers) */
  endIndex?: number;
  /** Peak width at half maximum */
  widthAtHalfMax?: number;
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
  /** Show export button in modebar (default: true) */
  showExportButton?: boolean;
}

/**
 * Metadata for a peak annotation with its series index.
 */
export type PeakWithMeta = {
  peak: PeakAnnotation;
  seriesIndex: number;
};
