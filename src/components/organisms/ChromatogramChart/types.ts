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
 * Individual boundary marker type for a single boundary point
 */
export type BoundaryMarkerType = "none" | "triangle" | "diamond";

/**
 * Internal computed fields for peak annotations.
 * These are populated by the component during processing.
 * @internal
 */
export interface PeakComputedFields {
  /** Peak area calculated using trapezoidal integration */
  area?: number;
  /** Peak index in the data array */
  index?: number;
  /** Start index of peak boundary in the data array */
  startIndex?: number;
  /** End index of peak boundary in the data array */
  endIndex?: number;
  /** Peak width at half maximum */
  widthAtHalfMax?: number;
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
  /** Label text (e.g., compound name). If not provided, auto-generated from computed area. */
  text?: string;
  /** Vertical arrow offset in pixels (negative = above peak, default: -30) */
  ay?: number;
  /** Horizontal arrow offset in pixels (default: 0) */
  ax?: number;
  /** Start retention time for peak boundary */
  startX?: number;
  /** End retention time for peak boundary */
  endX?: number;
  /** Marker style for start boundary (default: "triangle") */
  startMarker?: BoundaryMarkerType;
  /** Marker style for end boundary (default: "diamond") */
  endMarker?: BoundaryMarkerType;
  /**
   * Internal computed fields populated by the component.
   * @internal Do not set these directly - they are computed from startX/endX or auto-detection.
   */
  _computed?: PeakComputedFields;
}

/**
 * Baseline correction method
 */
export type BaselineCorrectionMethod = "none" | "linear" | "rolling";

/**
 * Global boundary marker style setting
 * - "none": No boundary markers displayed
 * - "enabled": Show boundary markers using per-peak settings (startMarker/endMarker) or defaults
 */
export type BoundaryMarkerStyle = "none" | "enabled";

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
   * - "none": No boundary markers displayed
   * - "enabled": Show boundary markers using per-peak startMarker/endMarker settings
   *
   * Per-peak marker defaults: startMarker="triangle", endMarker="diamond"
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
