import { useMemo } from "react";

import { seriesPalettes, uniqueSeriesNames } from "./series";

import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { VizChart } from "@/components/charts/viz/VizChart";
import { plot } from "@/vendor/ts-lib-viz/core";

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
  const names = uniqueSeriesNames(dataSeries);
  return dataSeries.flatMap((series, seriesIndex) =>
    series.y.map((y, index) => ({
      // A single x labels the whole box, as in SW-2298; otherwise one x per sample.
      x: String(series.x?.length === 1 ? series.x[0] : (series.x?.[index] ?? series.name)),
      y,
      series: names[seriesIndex],
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

const BoxPlotChart: React.FC<BoxPlotProps> = ({
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
  const palettes = useMemo(
    () =>
      seriesPalettes(
        dataSeries,
        dataSeries.map((series) => series.y.length > 0),
      ),
    [dataSeries],
  );
  const rows = useMemo(() => buildBoxRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(
    () => buildBoxSpec(rows, { showPoints, title, xTitle, yTitle, xRange, yRange }),
    [rows, showPoints, title, xTitle, yTitle, xRange, yRange],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { BoxPlotChart };
export type { BoxDataSeries, BoxPlotProps };
