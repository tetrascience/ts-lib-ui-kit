import type {
  ChromatogramChartProps,
  ChromatogramSeries,
  PeakAnnotation,
} from "../ChromatogramChart";

export type StackingMode = "overlay" | "stack";

export interface StackedChromatogramChartProps
  extends Omit<ChromatogramChartProps, "series" | "annotations" | "yRange"> {
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
}
