import { useMemo } from "react";

import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { categoricalPalettes, VizChart } from "@/components/charts/viz/VizChart";
import { CHART_COLORS } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

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

/** Flattens the series into the rows ts-lib-viz bins. */
export function buildHistogramRows(seriesArray: HistogramDataSeries[]): HistogramRow[] {
  return seriesArray.flatMap((series) => series.x.map((x) => ({ x, series: series.name })));
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
 * The normal curve fitted to a series, scaled so its peak matches the tallest bin.
 * Bins are the series' own `xbins`, or ten equal bins across its range padded by a tenth.
 */
export function fitDistributionCurve(series: HistogramDataSeries): Array<{ x: number; y: number }> {
  const average = mean(series.x);
  const deviation = standardDeviation(series.x, average);
  if (!(deviation > 0)) return [];

  const min = Math.min(...series.x);
  const max = Math.max(...series.x);
  const range = max - min;
  const start = min - range * 0.1;
  const end = max + range * 0.1;
  const bins = series.xbins ?? { start, end, size: range / 10 };

  const curve = normalDensity(average, deviation, start, end);
  const binCount = Math.ceil((bins.end - bins.start) / bins.size);
  const frequencies = Array.from({ length: binCount }, () => 0);
  for (const value of series.x) {
    if (value >= bins.start && value <= bins.end) {
      const index = Math.min(Math.floor((value - bins.start) / bins.size), binCount - 1);
      frequencies[index] += 1;
    }
  }
  const scale = Math.max(...frequencies) / Math.max(...curve.y);
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
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
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
  const colors = useMemo(
    () => seriesArray.map((series, index) => series.color ?? CHART_COLORS[index % CHART_COLORS.length]),
    [seriesArray],
  );
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildHistogramRows(seriesArray), [seriesArray]);
  const curves = useMemo<DistributionCurve[]>(
    () =>
      seriesArray.flatMap((series, index) => {
        const wanted = series.showDistributionLine ?? showDistributionLine;
        if (!wanted) return [];
        return [{ rows: fitDistributionCurve(series), color: colors[index] }];
      }),
    [seriesArray, showDistributionLine, colors],
  );
  const binning = useMemo(() => sharedBinning(seriesArray), [seriesArray]);
  const spec = useMemo<ChartSpec>(
    () => buildHistogramSpec(rows, { title, xTitle, yTitle, curves, binning }),
    [rows, title, xTitle, yTitle, curves, binning],
  );

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { HistogramChart };
export type { HistogramDataSeries, HistogramProps };
