import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { useMemo } from "react";

import { categoricalPalettes, VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";


import { seriesColor } from "@/utils/colors";

interface BarDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type BarChartVariant = "group" | "stack" | "overlay";

interface BarChartProps {
  dataSeries: BarDataSeries[];
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
  variant?: BarChartVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  barWidth?: number;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive bar positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
}

/** One row per (series, x) point. `lo`/`hi` are the error-bar ends, equal to `y` when there is no error. */
export interface BarRow {
  x: number;
  y: number;
  series: string;
  lo: number;
  hi: number;
}

/** Flattens the series into the rows ts-lib-viz draws. */
export function buildBarRows(dataSeries: BarDataSeries[]): BarRow[] {
  return dataSeries.flatMap((series) =>
    series.x.map((x, index) => {
      const y = series.y[index];
      const error = series.error_y?.visible ? (series.error_y.array[index] ?? 0) : 0;
      return { x, y, series: series.name, lo: y - error, hi: y + error };
    }),
  );
}

interface BarSpecOptions {
  variant: BarChartVariant;
  hasErrorBars: boolean;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  xTickText?: string[];
}

/** Builds the ts-lib-viz spec for a bar chart. `xTickText` maps the sorted unique x values to labels by position. */
export function buildBarSpec(rows: BarRow[], options: BarSpecOptions): ChartSpec {
  const { variant, hasErrorBars, title, xTitle, yTitle, xRange, yRange, xTickText } = options;
  const xTicks = [...new Set(rows.map((row) => row.x))].sort((a, b) => a - b);
  const position = variant === "stack" ? "stack" : variant === "overlay" ? "identity" : "dodge";
  let builder = plot(rows, { x: "x", y: "y", fill: "series", color: "series" }).bar({ position });
  if (hasErrorBars) builder = builder.errorbar({ aes: { ymin: "lo", ymax: "hi" } });
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
}

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const BarChart: React.FC<BarChartProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "group",
  xTitle,
  yTitle,
  title,
  xTickText,
}) => {
  const colors = useMemo(
    () => dataSeries.map((series, index) => seriesColor(index, series.color)),
    [dataSeries],
  );
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const hasErrorBars = dataSeries.some((series) => series.error_y?.visible);
  const rows = useMemo(() => buildBarRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(
    () =>
      buildBarSpec(rows, {
        variant,
        hasErrorBars,
        title,
        xTitle,
        yTitle,
        xRange,
        yRange,
        xTickText,
      }),
    [rows, variant, hasErrorBars, title, xTitle, yTitle, xRange, yRange, xTickText],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { BarChart };
export type { BarDataSeries, BarChartVariant, BarChartProps };
