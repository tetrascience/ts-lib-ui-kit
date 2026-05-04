import type {
  ChromatogramChartProps,
  ChromatogramSeries,
  PeakAnnotation,
  RangeAnnotation,
} from "../ChromatogramChart";

export type StackingMode = "overlay" | "stack";

export interface StackedChromatogramChartProps
  extends Omit<
    ChromatogramChartProps,
    "series" | "annotations" | "yRange" | "rangeAnnotations"
  > {
  /** Array of data series to display */
  series: ChromatogramSeries[];

  /** Stacking mode: 'overlay' (default) or 'stack' */
  stackingMode?: StackingMode;

  /**
   * Y-offset between stacked series in data units (e.g., AU).
   * Only applies in 'stack' mode; ignored in 'overlay'.
   */
  stackOffset?: number;

  /**
   * Peak annotations per series, parallel to the series array.
   * annotations[i] corresponds to series[i].
   * In stack mode, y values are shifted by the series offset.
   */
  annotations?: PeakAnnotation[][];

  /**
   * Range annotations per series, parallel to the series array.
   * rangeAnnotations[i] corresponds to series[i].
   * In stack mode, numeric yAnchor values are shifted by the series offset so
   * bars stay pinned to their trace. "top" and "auto" anchors are unaffected
   * (they derive their position from paper-space or the already-shifted data).
   */
  rangeAnnotations?: RangeAnnotation[][];
}
