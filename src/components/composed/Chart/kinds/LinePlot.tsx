import { useMemo } from "react";

import type { ChartAnnotationProps, ReferenceLine } from "@/components/composed/Chart/annotations";
import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { categoricalPalettes, VizChart } from "@/components/charts/viz/VizChart";
import { seriesColor } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

type MarkerSymbol =
  | "circle"
  | "circle-open"
  | "circle-dot"
  | "circle-open-dot"
  | "square"
  | "square-open"
  | "square-dot"
  | "square-open-dot"
  | "diamond"
  | "diamond-open"
  | "diamond-dot"
  | "diamond-open-dot"
  | "cross"
  | "cross-open"
  | "cross-dot"
  | "cross-open-dot"
  | "x"
  | "x-open"
  | "x-dot"
  | "x-open-dot"
  | "triangle-up"
  | "triangle-up-open"
  | "triangle-up-dot"
  | "triangle-up-open-dot"
  | "triangle-down"
  | "triangle-down-open"
  | "triangle-down-dot"
  | "triangle-down-open-dot"
  | "triangle-left"
  | "triangle-left-open"
  | "triangle-left-dot"
  | "triangle-left-open-dot"
  | "triangle-right"
  | "triangle-right-open"
  | "triangle-right-dot"
  | "triangle-right-open-dot"
  | "triangle-ne"
  | "triangle-ne-open"
  | "triangle-ne-dot"
  | "triangle-ne-open-dot"
  | "triangle-se"
  | "triangle-se-open"
  | "triangle-se-dot"
  | "triangle-se-open-dot"
  | "triangle-sw"
  | "triangle-sw-open"
  | "triangle-sw-dot"
  | "triangle-sw-open-dot"
  | "triangle-nw"
  | "triangle-nw-open"
  | "triangle-nw-dot"
  | "triangle-nw-open-dot"
  | "pentagon"
  | "pentagon-open"
  | "pentagon-dot"
  | "pentagon-open-dot"
  | "hexagon"
  | "hexagon-open"
  | "hexagon-dot"
  | "hexagon-open-dot"
  | "hexagon2"
  | "hexagon2-open"
  | "hexagon2-dot"
  | "hexagon2-open-dot"
  | "octagon"
  | "octagon-open"
  | "octagon-dot"
  | "octagon-open-dot"
  | "star"
  | "star-open"
  | "star-dot"
  | "star-open-dot"
  | "hexagram"
  | "hexagram-open"
  | "hexagram-dot"
  | "hexagram-open-dot"
  | "star-triangle-up"
  | "star-triangle-up-open"
  | "star-triangle-up-dot"
  | "star-triangle-up-open-dot"
  | "star-triangle-down"
  | "star-triangle-down-open"
  | "star-triangle-down-dot"
  | "star-triangle-down-open-dot"
  | "star-square"
  | "star-square-open"
  | "star-square-dot"
  | "star-square-open-dot"
  | "star-diamond"
  | "star-diamond-open"
  | "star-diamond-dot"
  | "star-diamond-open-dot"
  | "diamond-tall"
  | "diamond-tall-open"
  | "diamond-tall-dot"
  | "diamond-tall-open-dot"
  | "diamond-wide"
  | "diamond-wide-open"
  | "diamond-wide-dot"
  | "diamond-wide-open-dot"
  | "hourglass"
  | "hourglass-open"
  | "bowtie"
  | "bowtie-open"
  | "circle-cross"
  | "circle-cross-open"
  | "circle-x"
  | "circle-x-open"
  | "square-cross"
  | "square-cross-open"
  | "square-x"
  | "square-x-open"
  | "diamond-cross"
  | "diamond-cross-open"
  | "diamond-x"
  | "diamond-x-open"
  | "cross-thin"
  | "cross-thin-open"
  | "x-thin"
  | "x-thin-open"
  | "asterisk"
  | "asterisk-open"
  | "hash"
  | "hash-open"
  | "hash-dot"
  | "hash-open-dot"
  | "y-up"
  | "y-up-open"
  | "y-down"
  | "y-down-open"
  | "y-left"
  | "y-left-open"
  | "y-right"
  | "y-right-open"
  | "line-ew"
  | "line-ew-open"
  | "line-ns"
  | "line-ns-open"
  | "line-ne"
  | "line-ne-open"
  | "line-nw"
  | "line-nw-open"
  | "arrow"
  | "arrow-open"
  | "arrow-wide"
  | "arrow-wide-open";

interface LineDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  symbol?: MarkerSymbol;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

interface LineDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  symbol?: MarkerSymbol;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type LinePlotVariant = "lines" | "lines+markers" | "lines+markers+error_bars";

/**
 * A Levey-Jennings control chart over the series: a centre line and shaded sigma bands.
 *
 * `center` and `sigma` are the caller's. Take them from the reference period the lab has
 * qualified (its mean and standard deviation). The chart does not estimate them from the
 * plotted data, because the plotted data is what the limits are meant to judge. One centre
 * and sigma apply to every series on the chart.
 */
export interface ControlChart {
  /** The centre line, in the y units: the target or the mean. */
  center: number;
  /** One standard deviation, in the y units. Must be positive, or no bands or sigma lines are drawn. */
  sigma: number;
  /** Sigma multiples to shade and mark on each side of the centre. Defaults to `[1, 2, 3]`. */
  bands?: readonly number[];
  /** Text beside the centre line. Defaults to "Mean". */
  centerLabel?: string;
}

/** A shaded band from `lo` to `hi`, `multiple` sigma either side of the centre. */
export interface ControlBand {
  multiple: number;
  lo: number;
  hi: number;
}

const CONTROL_BANDS: readonly number[] = [1, 2, 3];
/** A neutral grey that reads on both themes. The bands stack, so the inner ones darken. */
const CONTROL_INK = "#737373";
const CONTROL_BAND_ALPHA = 0.1;

/**
 * The bands and reference lines a control chart draws. A centre without a usable sigma gives
 * the centre line alone. Bands come back widest first, so each inner band draws over the outer ones.
 */
export function controlChartMarks(control?: ControlChart): {
  bands: ControlBand[];
  lines: ReferenceLine[];
} {
  if (control === undefined || !Number.isFinite(control.center)) return { bands: [], lines: [] };
  const { center, sigma } = control;
  const lines: ReferenceLine[] = [{ axis: "y", value: center, label: control.centerLabel ?? "Mean" }];
  if (!Number.isFinite(sigma) || sigma <= 0) return { bands: [], lines };

  const multiples = [...new Set((control.bands ?? CONTROL_BANDS).filter((m) => Number.isFinite(m) && m > 0))].sort(
    (a, b) => a - b,
  );
  for (const multiple of multiples) {
    const label = String(multiple);
    lines.push(
      { axis: "y", value: center + multiple * sigma, label: `+${label}σ`, color: CONTROL_INK, linetype: "dashed" },
      { axis: "y", value: center - multiple * sigma, label: `-${label}σ`, color: CONTROL_INK, linetype: "dashed" },
    );
  }
  const bands = multiples
    .map((multiple) => ({ multiple, lo: center - multiple * sigma, hi: center + multiple * sigma }))
    .reverse();
  return { bands, lines };
}

type LinePlotProps = ChartAnnotationProps & {
  dataSeries: LineDataSeries[];
  /**
   * Fixed width in pixels. When omitted, the chart fills its container and
   * tracks the container's width via a `ResizeObserver`.
   */
  width?: number;
  /**
   * Fixed height in pixels. When omitted, the chart fills its container and
   * tracks the container's height via a `ResizeObserver`.
   */
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  variant?: LinePlotVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive line positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
  /** A centre line and sigma bands drawn over the series, for a control chart. */
  controlChart?: ControlChart;
};

/** One row per point: its series, x, y, and the error bar's lo/hi edges. */
interface LineRow {
  x: number;
  y: number;
  series: string;
  lo: number;
  hi: number;
}

/**
 * Flattens the series into rows for ts-lib-viz. The error bar spans y +/- the
 * per-point error when the series asks for it, and collapses to y otherwise.
 */
export function lineRows(dataSeries: LineDataSeries[]): LineRow[] {
  return dataSeries.flatMap((line) =>
    line.x.map((x, index) => {
      const y = line.y[index];
      const error = line.error_y?.visible ? (line.error_y.array[index] ?? 0) : 0;
      return { x, y, series: line.name, lo: y - error, hi: y + error };
    }),
  );
}

const LinePlotChart: React.FC<LinePlotProps> = ({
  referenceLines,
  annotations,
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "lines",
  xTitle,
  yTitle,
  title,
  xTickText,
  controlChart,
}) => {
  const colors = useMemo(() => dataSeries.map((line, index) => seriesColor(index, line.color)), [dataSeries]);
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => lineRows(dataSeries), [dataSeries]);
  const control = useMemo(() => controlChartMarks(controlChart), [controlChart]);
  const allReferenceLines = useMemo(
    () => [...control.lines, ...(referenceLines ?? [])],
    [control.lines, referenceLines],
  );
  const spec = useMemo<ChartSpec>(() => {
    const xTicks = [...new Set(rows.map((row) => row.x))].sort((a, b) => a - b);
    let builder = plot(rows, { x: "x", y: "y", color: "series" });
    // The bands go in before the series, so the lines and points draw over them.
    if (control.bands.length > 0 && xTicks.length > 0) {
      const x = [xTicks[0], xTicks[xTicks.length - 1]];
      for (const band of control.bands) {
        builder = builder.annotate("ribbon", {
          x,
          ymin: [band.lo, band.lo],
          ymax: [band.hi, band.hi],
          fill: CONTROL_INK,
          alpha: CONTROL_BAND_ALPHA,
        });
      }
    }
    builder = builder.line();
    if (variant !== "lines") builder = builder.point();
    if (variant === "lines+markers+error_bars") {
      builder = builder.errorbar({ aes: { ymin: "lo", ymax: "hi" } });
    }
    return builder
      .labs({ headline: title })
      .scales({
        x: {
          title: xTitle,
          limits: xRange,
          ...(xTickText
            ? {
                breaks: xTicks,
                labels: Object.fromEntries(
                  xTicks.map((tick, index) => [String(tick), xTickText[index] ?? String(tick)]),
                ),
              }
            : {}),
        },
        y: { title: yTitle, limits: yRange },
      })
      .spec();
  }, [rows, control, variant, title, xTitle, yTitle, xRange, yRange, xTickText]);

  return (
    <VizChart
      spec={spec}
      data={rows}
      palettes={palettes}
      width={width}
      height={height}
      referenceLines={allReferenceLines}
      annotations={annotations}
    />
  );
};

export { LinePlotChart };
export type { LineDataSeries, LinePlotVariant, LinePlotProps, MarkerSymbol };
