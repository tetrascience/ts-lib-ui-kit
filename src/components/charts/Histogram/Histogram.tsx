import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { useMemo } from "react";

import { categoricalPalettes, VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";


import { CHART_COLORS } from "@/utils/colors";

interface HistogramDataSeries {
  x: number[];
  name: string;
  color?: string;
  autobinx?: boolean;
  xbins?: {
    start: number;
    end: number;
    size: number;
  };
  opacity?: number;
  showDistributionLine?: boolean;
  lineWidth?: number;
}

type HistogramProps = {
  dataSeries: HistogramDataSeries | HistogramDataSeries[];
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
  title?: string;
  xTitle?: string;
  yTitle?: string;
  bargap?: number;
  showDistributionLine?: boolean;
};

/** One row per observation, tagged with its series name so each series gets its own fill. */
export interface HistogramRow {
  x: number;
  series: string;
}

/** Flattens the series into the rows ts-lib-viz bins. */
export function buildHistogramRows(seriesArray: HistogramDataSeries[]): HistogramRow[] {
  return seriesArray.flatMap((series) => series.x.map((x) => ({ x, series: series.name })));
}

interface HistogramSpecOptions {
  title?: string;
  xTitle?: string;
  yTitle?: string;
}

/** Builds the ts-lib-viz spec: identity-positioned histogram bars, filled per series. */
export function buildHistogramSpec(rows: HistogramRow[], options: HistogramSpecOptions): ChartSpec {
  const { title, xTitle, yTitle } = options;
  return plot(rows, { x: "x", fill: "series" })
    .histogram({ position: "identity" })
    .labs({ headline: title })
    .scales({ x: { title: xTitle }, y: { title: yTitle } })
    .spec();
}

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const Histogram: React.FC<HistogramProps> = ({
  dataSeries,
  width,
  height,
  title,
  xTitle,
  yTitle,
}) => {
  const seriesArray = useMemo(
    () => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]),
    [dataSeries],
  );
  const colors = useMemo(
    () => seriesArray.map((series, index) => series.color ?? CHART_COLORS[index % CHART_COLORS.length]),
    [seriesArray],
  );
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildHistogramRows(seriesArray), [seriesArray]);
  const spec = useMemo<ChartSpec>(
    () => buildHistogramSpec(rows, { title, xTitle, yTitle }),
    [rows, title, xTitle, yTitle],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { Histogram };
export type { HistogramDataSeries, HistogramProps };
