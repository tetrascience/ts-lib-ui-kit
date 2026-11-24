import { useMemo } from "react";

import { seriesPalettes, uniqueSeriesNames } from "./series";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";

import { plot, withViz } from "@/components/charts/viz/viz-loader";
import { VizChart } from "@/components/charts/viz/VizChart";
import { seriesColor } from "@/utils/colors";

/** Points in the fitted normal curve, and the stroke width of the curve in pixels. */
const CURVE_POINTS = 100;
/** Exponent coefficient of the normal density: exp(-\frac12 z^2). */
const NORMAL_EXPONENT = -0.5;
const CURVE_LINE_WIDTH = 2;

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
  /**
   * Accepted for compatibility and ignored: ts-lib-viz sets its own bar spacing.
   */
  bargap?: number;
  /** Fit a normal curve to each series. A series' own `showDistributionLine` wins. */
  showDistributionLine?: boolean;
};

/** One row per observation, tagged with its series name so each series gets its own fill. */
export interface HistogramRow {
  x: number;
  series: string;
}

/** One fitted curve: its points, scaled to the bin counts, and the colour it draws in. */
export interface DistributionCurve {
  rows: Array<{ x: number; y: number }>;
  color: string;
}

/** Flattens the series into the rows ts-lib-viz bins. Each series groups under its own unique name. */
export function buildHistogramRows(seriesArray: HistogramDataSeries[]): HistogramRow[] {
  const names = uniqueSeriesNames(seriesArray);
  return seriesArray.flatMap((series, index) => series.x.map((x) => ({ x, series: names[index] })));
}

const mean = (data: number[]): number => data.reduce((acc, val) => acc + val, 0) / data.length;

const standardDeviation = (data: number[], average: number): number =>
  Math.sqrt(data.reduce((acc, val) => acc + (val - average) ** 2, 0) / data.length);

/** The normal density over `points` evenly spaced x values from `start` to `end`. */
function normalDensity(average: number, deviation: number, start: number, end: number): { x: number[]; y: number[] } {
  const step = (end - start) / (CURVE_POINTS - 1);
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < CURVE_POINTS; i++) {
    const at = start + i * step;
    x.push(at);
    y.push((1 / (deviation * Math.sqrt(2 * Math.PI))) * Math.exp(NORMAL_EXPONENT * ((at - average) / deviation) ** 2));
  }
  return { x, y };
}

/**
 * The normal curve fitted to a series, drawn at the scale of the bars: the count a normal of this
 * mean and spread puts in each bin of `binning`, so its height matches the histogram it is laid over.
 */
export function fitDistributionCurve(
  series: HistogramDataSeries,
  binning: HistogramBinning,
): Array<{ x: number; y: number }> {
  const average = mean(series.x);
  const deviation = standardDeviation(series.x, average);
  if (!(deviation > 0)) return [];

  const [min, max] = extent(series.x);
  const range = max - min;
  const curve = normalDensity(average, deviation, min - range * 0.1, max + range * 0.1);
  const scale = series.x.length * binning.binwidth;
  return curve.x.map((x, i) => ({ x, y: curve.y[i] * scale }));
}

interface HistogramSpecOptions {
  title?: string;
  xTitle?: string;
  yTitle?: string;
  curves?: DistributionCurve[];
  /** Bins shared by every series, so their bars sit on the same edges and stack. */
  binning?: HistogramBinning;
}

/** Bin width and the edge the bins start from. Every series bins on the same grid. */
export interface HistogramBinning {
  binwidth: number;
  boundary: number;
}

/** Bins across the chart's data, aiming for about ten, on a round step. */
const TARGET_BINS = 20;
const BIN_STEP_FACTORS = [1, 2, 5, 10];

/** Smallest and largest value, found in a loop: spreading a large array into Math.min/max throws. */
function extent(values: readonly number[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return [min, max];
}

/**
 * The bins every series shares. A series that states its own `xbins` sets them; otherwise
 * the bins cover the data from every series. Each series bins on its own range without this,
 * and its bars then miss the others' edges and do not stack.
 */
export function sharedBinning(seriesArray: HistogramDataSeries[]): HistogramBinning {
  const stated = seriesArray.find((series) => series.xbins !== undefined)?.xbins;
  if (stated) return { binwidth: stated.size, boundary: stated.start };
  const values = seriesArray.flatMap((series) => series.x);
  if (values.length === 0) return { binwidth: 1, boundary: 0 };
  const [min, maxValue] = extent(values);
  const range = maxValue - min;
  if (!(range > 0)) return { binwidth: 1, boundary: min };
  const rough = range / TARGET_BINS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const binwidth = BIN_STEP_FACTORS.map((factor) => factor * magnitude).find((step) => step >= rough) ?? magnitude * 10;
  return { binwidth, boundary: Math.floor(min / binwidth) * binwidth };
}

/**
 * Builds the ts-lib-viz spec: identity-positioned histogram bars, filled per series,
 * with any fitted curves drawn over them.
 */
export function buildHistogramSpec(rows: HistogramRow[], options: HistogramSpecOptions): ChartSpec {
  const { title, xTitle, yTitle, curves = [], binning } = options;
  // Several series stack, as the Plotly histograms did; a single series draws alone.
  const stacked = new Set(rows.map((row) => row.series)).size > 1;
  const bins = binning ? { binwidth: binning.binwidth, boundary: binning.boundary } : {};
  let builder = plot(rows, { x: "x", fill: "series" }).histogram({
    position: stacked ? "stack" : "identity",
    ...bins,
  });
  for (const curve of curves) {
    builder = builder.line({
      data: curve.rows,
      aes: { x: "x", y: "y" },
      color: curve.color,
      linewidth: CURVE_LINE_WIDTH,
      showLegend: false,
    });
  }
  return builder
    .labs({ headline: title })
    .scales({ x: { title: xTitle }, y: { title: yTitle }, fill: { title: "" } })
    .spec();
}

const HistogramChart: React.FC<HistogramProps> = ({
  dataSeries,
  width,
  height,
  title = "Histogram",
  xTitle = "X Axis",
  yTitle = "Frequency",
  showDistributionLine = false,
}) => {
  const seriesArray = useMemo(() => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]), [dataSeries]);
  const binning = useMemo(() => sharedBinning(seriesArray), [seriesArray]);
  // Palette slots go to the series that have rows, as ts-lib-viz numbers them.
  const palettes = useMemo(
    () =>
      seriesPalettes(
        seriesArray,
        seriesArray.map((series) => series.x.length > 0),
      ),
    [seriesArray],
  );
  const rows = useMemo(() => buildHistogramRows(seriesArray), [seriesArray]);
  const curves = useMemo<DistributionCurve[]>(
    () =>
      seriesArray.flatMap((series, index) => {
        const wanted = series.showDistributionLine ?? showDistributionLine;
        if (!wanted) return [];
        return [{ rows: fitDistributionCurve(series, binning), color: seriesColor(index, series.color) }];
      }),
    [seriesArray, showDistributionLine, binning],
  );
  const spec = useMemo<ChartSpec>(
    () => buildHistogramSpec(rows, { title, xTitle, yTitle, curves, binning }),
    [rows, title, xTitle, yTitle, curves, binning],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

const HistogramChartLazy = withViz("HistogramChart", HistogramChart, "histogram");

export { HistogramChartLazy as HistogramChart };
export type { HistogramDataSeries, HistogramProps };
