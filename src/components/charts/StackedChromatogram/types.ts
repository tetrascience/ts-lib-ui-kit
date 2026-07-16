import type {
  ChromatogramProps,
  ChromatogramSeries,
  PeakAnnotation,
} from "../Chromatogram";

export type StackingMode = "overlay" | "stack";

export interface StackedChromatogramProps
  extends Omit<ChromatogramProps, "series" | "annotations" | "yRange"> {
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
   * Controls which end of the stack series[0] lands on (stack mode only).
   * - "first-on-bottom" (default) — series[0] sits at the base; series[N-1] is highest.
   * - "first-on-top" — series[0] is shifted to the top; series[N-1] is at the base.
   *   Annotations follow the chosen direction.
   */
  stackingOrder?: "first-on-bottom" | "first-on-top";
}
