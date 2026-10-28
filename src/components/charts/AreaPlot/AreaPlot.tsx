import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { useMemo } from "react";

import { categoricalPalettes, VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";

import { seriesColor } from "@/utils/colors";

interface AreaDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  fill?: "tozeroy" | "tonexty" | "toself";
}

type AreaPlotVariant = "normal" | "stacked";

interface AreaPlotProps {
  dataSeries: AreaDataSeries[];
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
  variant?: AreaPlotVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive area positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
}

/** One row per reading: its series, x, and the ribbon's lo/hi edges. */
interface AreaRow {
  x: number;
  y: number;
  series: string;
  lo: number;
  hi: number;
}

/**
 * Flattens the series into rows for ts-lib-viz. In the stacked variant each
 * series sits on the running top of the series before it, per x value.
 */
export function areaRows(dataSeries: AreaDataSeries[], variant: AreaPlotVariant): AreaRow[] {
  const stackTop = new Map<number, number>();
  return dataSeries.flatMap((series) =>
    series.x.map((x, index) => {
      const y = series.y[index];
      const base = variant === "stacked" ? (stackTop.get(x) ?? 0) : 0;
      if (variant === "stacked") stackTop.set(x, base + y);
      return { x, y, series: series.name, lo: base, hi: base + y };
    }),
  );
}

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */

const AreaPlot: React.FC<AreaPlotProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "normal",
  xTitle,
  yTitle,
  title,
  xTickText,
}) => {
  const colors = useMemo(() => dataSeries.map((series, index) => seriesColor(index, series.color)), [dataSeries]);
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  // A ribbon from its baseline to its top, so the fill and its outline both draw
  // the readings one by one. An area geom would summarize them into bins.
  const rows = useMemo(() => areaRows(dataSeries, variant), [dataSeries, variant]);
  const spec = useMemo<ChartSpec>(() => {
    const xTicks = [...new Set(rows.map((row) => row.x))].sort((a, b) => a - b);
    return plot(rows, { x: "x", color: "series", fill: "series" })
      .ribbon({ aes: { ymin: "lo", ymax: "hi" } })
      .line({ aes: { y: "hi" } })
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
  }, [rows, title, xTitle, yTitle, xRange, yRange, xTickText]);

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { AreaPlot };
export type { AreaDataSeries, AreaPlotVariant, AreaPlotProps };
