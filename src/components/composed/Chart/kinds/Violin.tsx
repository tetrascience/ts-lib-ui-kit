import { useMemo } from "react";

import type { ChartAnnotationProps } from "@/components/composed/Chart/annotations";
import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { categoricalPalettes, VizChart } from "@/components/charts/viz/VizChart";
import { seriesColor } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

/** One group of raw samples. Each group becomes one violin, labelled by its name. */
interface ViolinDataSeries {
  name: string;
  /** The raw readings the density is estimated from. */
  y: number[];
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
}

interface ViolinProps extends ChartAnnotationProps {
  dataSeries: ViolinDataSeries[];
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
  yRange?: [number, number];
  xTitle?: string;
  yTitle?: string;
  title?: string;
  /**
   * Draws each raw reading as a jittered point over its violin, so a reader can see
   * how many readings sit behind the shape. Default false.
   */
  showPoints?: boolean;
}

/**
 * One row per reading. `x` is the group the reading belongs to, so ts-lib-viz draws one
 * violin per group and places its points under that violin.
 */
interface ViolinRow {
  x: string;
  y: number;
  series: string;
}

/** Flattens the groups into the rows ts-lib-viz draws. */
function buildViolinRows(dataSeries: ViolinDataSeries[]): ViolinRow[] {
  return dataSeries.flatMap((series) =>
    series.y.map((y) => ({
      x: series.name,
      y,
      series: series.name,
    })),
  );
}

interface ViolinSpecOptions {
  showPoints: boolean;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  yRange?: [number, number];
}

/**
 * Builds the ts-lib-viz spec. The violin geom draws the outline, the median tick and the
 * quartile lines itself; the points are a separate layer on top when `showPoints` is set.
 */
function buildViolinSpec(rows: ViolinRow[], options: ViolinSpecOptions): ChartSpec {
  const { showPoints, title, xTitle, yTitle, yRange } = options;
  const builder = plot(rows, { x: "x", y: "y", color: "series", fill: "series" }).violin();
  const withPoints = showPoints ? builder.point({ position: "jitter" }) : builder;
  return withPoints
    .labs({ headline: title })
    .scales({
      x: { title: xTitle },
      y: { title: yTitle, limits: yRange },
    })
    .spec();
}

const ViolinChart: React.FC<ViolinProps> = ({
  referenceLines,
  annotations,
  dataSeries,
  width,
  height,
  yRange,
  xTitle,
  yTitle,
  title,
  showPoints = false,
}) => {
  const colors = useMemo(() => dataSeries.map((series, index) => seriesColor(index, series.color)), [dataSeries]);
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildViolinRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(
    () => buildViolinSpec(rows, { showPoints, title, xTitle, yTitle, yRange }),
    [rows, showPoints, title, xTitle, yTitle, yRange],
  );

  return (
    <VizChart
      spec={spec}
      data={rows}
      palettes={palettes}
      width={width}
      height={height}
      referenceLines={referenceLines}
      annotations={annotations}
    />
  );
};

export { ViolinChart, buildViolinRows, buildViolinSpec };
export type { ViolinDataSeries, ViolinProps };
