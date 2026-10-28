import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { useMemo } from "react";

import { useChartDeprecationWarning } from "../viz/deprecation";
import { categoricalPalettes, VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";


import { seriesColor } from "@/utils/colors";

interface BoxDataSeries {
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  x?: string[] | number[];
  boxpoints?: "all" | "outliers" | "suspectedoutliers" | false;
  jitter?: number;
  pointpos?: number;
}

interface BoxPlotProps {
  dataSeries: BoxDataSeries[];
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
  xTitle?: string;
  yTitle?: string;
  title?: string;
  showPoints?: boolean;
}

/** One row per observation. `x` is the category the box is drawn under (the series name when none is given). */
export interface BoxRow {
  x: string;
  y: number;
  series: string;
}

/** Flattens the series into the rows ts-lib-viz draws. */
export function buildBoxRows(dataSeries: BoxDataSeries[]): BoxRow[] {
  return dataSeries.flatMap((series) =>
    series.y.map((y, index) => ({
      // A single x labels the whole box, as in SW-2298; otherwise one x per sample.
      x: String(series.x?.length === 1 ? series.x[0] : (series.x?.[index] ?? series.name)),
      y,
      series: series.name,
    })),
  );
}

interface BoxSpecOptions {
  showPoints: boolean;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  xRange?: [number, number];
  yRange?: [number, number];
}

/** Builds the ts-lib-viz spec. Points are drawn with jitter when `showPoints` is set. */
export function buildBoxSpec(rows: BoxRow[], options: BoxSpecOptions): ChartSpec {
  const { showPoints, title, xTitle, yTitle, xRange, yRange } = options;
  const builder = plot(rows, { x: "x", y: "y", color: "series", fill: "series" }).boxplot();
  const withPoints = showPoints ? builder.point({ position: "jitter" }) : builder;
  return withPoints
    .labs({ headline: title })
    .scales({
      x: { title: xTitle, limits: xRange },
      y: { title: yTitle, limits: yRange },
    })
    .spec();
}

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const BoxPlot: React.FC<BoxPlotProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  xTitle,
  yTitle,
  title,
  showPoints = false,
}) => {
  useChartDeprecationWarning("BoxPlot");
  const colors = useMemo(
    () => dataSeries.map((series, index) => seriesColor(index, series.color)),
    [dataSeries],
  );
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildBoxRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(
    () => buildBoxSpec(rows, { showPoints, title, xTitle, yTitle, xRange, yRange }),
    [rows, showPoints, title, xTitle, yTitle, xRange, yRange],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { BoxPlot };
export type { BoxDataSeries, BoxPlotProps };
