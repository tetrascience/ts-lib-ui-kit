import { useMemo } from "react";

import { seriesPalettes, uniqueSeriesNames } from "./series";

import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { VizChart } from "@/components/charts/viz/VizChart";
import { plot } from "@/vendor/ts-lib-viz/core";

type MarkerSymbol = "circle" | "square" | "diamond" | "triangle-up" | "triangle-down" | "star";

interface ScatterPlotDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  /** Optional marker symbol override (auto-assigned in the `stacked` variant) */
  symbol?: MarkerSymbol;
  /** Optional per-series marker size override (falls back to `markerSize`) */
  size?: number;
}

type ScatterPlotVariant = "default" | "stacked";

interface ScatterPlotProps {
  /** One or more data series to plot */
  dataSeries: ScatterPlotDataSeries | ScatterPlotDataSeries[];
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
  /**
   * `default` renders every series as circles; `stacked` cycles through
   * distinct marker symbols per series so overlapping series stay legible.
   */
  variant?: ScatterPlotVariant;
  /** Default marker diameter in pixels, as Plotly sized it (per-series `size` takes precedence) */
  markerSize?: number;
}

const ScatterPlotChart: React.FC<ScatterPlotProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  xTitle,
  yTitle,
  title,
  variant = "default",
  markerSize = 10,
}) => {
  const seriesArray = useMemo(() => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]), [dataSeries]);
  const palettes = useMemo(
    () =>
      seriesPalettes(
        seriesArray,
        seriesArray.map((series) => series.x.length > 0),
      ),
    [seriesArray],
  );
  const rows = useMemo(() => {
    const names = uniqueSeriesNames(seriesArray);
    return seriesArray.flatMap((series, seriesIndex) =>
      series.x.map((x, index) => ({ x, y: series.y[index], series: names[seriesIndex] })),
    );
  }, [seriesArray]);
  const spec = useMemo<ChartSpec>(() => {
    const aes =
      variant === "stacked"
        ? { x: "x", y: "y", color: "series", shape: "series" }
        : { x: "x", y: "y", color: "series" };
    return plot(rows, aes)
      .point({ size: markerSize / 2 })
      .labs({ headline: title })
      .scales({
        x: { title: xTitle, limits: xRange },
        y: { title: yTitle, limits: yRange },
      })
      .spec();
  }, [rows, variant, markerSize, title, xTitle, yTitle, xRange, yRange]);

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { ScatterPlotChart };
export type { MarkerSymbol, ScatterPlotDataSeries, ScatterPlotProps, ScatterPlotVariant };
