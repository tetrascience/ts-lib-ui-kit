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
 * Peak detection algorithm options
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
}

/**
 * A horizontal colored bar spanning [startX, endX] with a centered label.
 * Used to annotate chromatographic fractions, compound windows, or regions of interest.
 */
export interface RangeAnnotation {
  /** Label text displayed centered within the bar */
  label: string;
  /** Left edge of the range (x-axis units, same as series data) */
  startX: number;
  /** Right edge of the range (x-axis units, same as series data) */
  endX: number;
  /** CSS color for the bar fill (defaults to next CHART_COLOR in sequence) */
  color?: string;
  /** Fill opacity for the bar (0–1, default: 0.5) */
  opacity?: number;
  /**
   * Vertical placement of the bar:
   * - "top" (default) — fixed near the top of the plot area in paper-space; always
   *   visible regardless of data scale
   * - "auto" — floats just above the tallest data point in [startX, endX]; placed
   *   in y data-coordinates so it tracks with zoom
   * - number — exact y data-coordinate for the bottom edge of the bar
   */
  yAnchor?: "auto" | "top" | number;
  /**
   * Height of the colored bar.
   * - When yAnchor is "top": fraction of plot height in paper-space (default: 0.04)
   * - When yAnchor is "auto" or a number: y data units (default: 4% of data max)
   */
  barHeight?: number;
  /** Font size of the label (default: 11) */
  fontSize?: number;
  /** Label text color (defaults to the bar color) */
  labelColor?: string;
  /**
   * Vertical stacking lane (0 = closest to data, higher = further away for "auto"/number;
   * 0 = topmost, higher = lower for "top").
   * When omitted, lane is auto-assigned to avoid overlapping bars.
   */
  lane?: number;
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
  /** Peak detection algorithm options - if provided, enables automatic peak detection */
  peakDetectionOptions?: PeakDetectionOptions;
  /** Show peak areas as annotations (default: false) */
  showPeakAreas?: boolean;
  /**
   * Show peak boundary markers (default: "none").
   * - "none": No boundary markers displayed
   * - "enabled": Show boundary markers using per-peak startMarker/endMarker settings
   *
   * Per-peak marker defaults: startMarker="triangle", endMarker="diamond"
   */
  boundaryMarkers?: BoundaryMarkerStyle;
  /**
   * Retention time threshold for grouping overlapping annotations (default: 0.4 minutes).
   * Peaks closer than this threshold will have their annotations staggered to avoid overlap.
   */
  annotationOverlapThreshold?: number;
  /** Show export button in modebar (default: true) */
  showExportButton?: boolean;
  /**
   * Horizontal range annotations displayed as colored bars with centered labels.
   * Rendered as Plotly shapes; independent of the peak annotation system.
   */
  rangeAnnotations?: RangeAnnotation[];
  /**
   * x-axis overlap threshold for auto lane assignment (same units as series x data).
   * Two range annotations whose ranges overlap by more than this amount are placed in
   * separate lanes. Default: 0 (only exact overlaps trigger stacking).
   */
  rangeAnnotationOverlapThreshold?: number;
}

/**
 * Metadata for a peak annotation with its series index.
 */
export type PeakWithMeta = {
  peak: PeakAnnotation;
  seriesIndex: number;
};
