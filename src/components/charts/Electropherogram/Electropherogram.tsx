import { useMemo } from "react";

import { useChartDeprecationWarning } from "../viz/deprecation";
import { VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { plot } from "@/vendor/ts-lib-viz/core";

/** Headroom above the tallest peak, so the base letters have room above the traces. */
const Y_HEADROOM_FACTOR = 1.2;
/** A base letter sits just above the tallest peak at its position, as a multiple of that peak. */
const LETTER_HEIGHT_FACTOR = 1.06;
/** Target number of y-axis ticks. */
const Y_TICK_TARGET = 4;
const LETTER_SIZE = 12;
const TRACE_WIDTH = 1.5;
/** Size used when the caller states neither a width nor a height, in pixels. */
const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;

/**
 * Okabe-Ito colour-blind-safe defaults, one per base. Each clears 3:1 against both
 * the light and dark surfaces, so the traces stay distinct for deuteranopic readers.
 */
const DEFAULT_BASE_COLORS = {
  A: "#009E73", // bluish green
  T: "#D55E00", // vermillion
  G: "#CC79A7", // reddish purple
  C: "#0072B2", // blue
} as const;

interface PeakData {
  position: number;
  base?: string;
  peakA: number;
  peakT: number;
  peakG: number;
  peakC: number;
}

interface ElectropherogramProps {
  data?: PeakData[];
  width?: number;
  height?: number;
  positionInterval?: number;
  colorA?: string;
  colorT?: string;
  colorG?: string;
  colorC?: string;
}

const determineBase = (item: PeakData): string => {
  if (item.base !== undefined) return item.base;
  const peakValues = {
    A: item.peakA,
    T: item.peakT,
    G: item.peakG,
    C: item.peakC,
  };

  const values = Object.values(peakValues);
  const allEqual = values.every((val) => val === values[0]);

  if (allEqual) {
    return "";
  }

  let highestBase = "";
  let highestValue = 0;

  Object.entries(peakValues).forEach(([base, value]) => {
    if (value > highestValue) {
      highestBase = base;
      highestValue = value;
    }
  });

  return highestBase;
};

/** One row per position: the four trace heights, and the base letter in its own column. */
interface TraceRow {
  position: number;
  peakA: number;
  peakT: number;
  peakG: number;
  peakC: number;
  /** Height the called base's letter sits at: just above the tallest peak here. */
  callY: number;
  letterA: string;
  letterT: string;
  letterG: string;
  letterC: string;
}

type BaseColors = Record<"A" | "T" | "G" | "C", string>;

/** Evenly spaced y-axis ticks from zero to `max`, on a round step. */
function yAxisBreaks(max: number, targetCount: number = Y_TICK_TARGET): number[] {
  if (!(max > 0)) return [0];
  const rough = max / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? magnitude * 10;
  const breaks: number[] = [];
  for (let value = 0; value <= max; value += step) breaks.push(value);
  return breaks;
}

/** Points drawn between two called positions, so each trace curves through every peak. */
const CURVE_SAMPLES = 8;
const HERMITE_SQUARE_LIMIT = 9;

type CurvePoint = { x: number; y: number };

/**
 * Tangent at each point for a monotone cubic (Fritsch–Carlson). A tangent is zero
 * where the trace turns, so the curve never overshoots a peak or dips below the
 * baseline between peaks. Expects at least two points.
 */
function monotoneTangents(xs: number[], slopes: number[]): number[] {
  const last = xs.length - 1;
  const tangents = xs.map((_, k) => {
    if (k === 0) return slopes[0];
    if (k === last) return slopes[last - 1];
    return slopes[k - 1] * slopes[k] <= 0 ? 0 : (slopes[k - 1] + slopes[k]) / 2;
  });
  for (let k = 0; k < last; k++) {
    const slope = slopes[k];
    if (slope === 0) {
      tangents[k] = 0;
      tangents[k + 1] = 0;
      continue;
    }
    const alpha = tangents[k] / slope;
    const beta = tangents[k + 1] / slope;
    const magnitude = alpha * alpha + beta * beta;
    if (magnitude > HERMITE_SQUARE_LIMIT) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[k] = scale * alpha * slope;
      tangents[k + 1] = scale * beta * slope;
    }
  }
  return tangents;
}

/** Cubic Hermite interpolation across one segment of width `width`, at fraction `t`. */
function hermite(y0: number, y1: number, m0: number, m1: number, width: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * width * m0 + (3 * t2 - 2 * t3) * y1 + (t3 - t2) * width * m1;
}

/**
 * A smooth curve through every point, sampled densely enough to read as a curve.
 * `xs` must be ascending. The curve passes through each peak exactly.
 */
function monotoneCurve(xs: number[], ys: number[]): CurvePoint[] {
  if (xs.length < 2) return xs.map((x, k) => ({ x, y: ys[k] }));
  const slopes = xs.slice(1).map((x, k) => (ys[k + 1] - ys[k]) / (x - xs[k]));
  const tangents = monotoneTangents(xs, slopes);
  const curve: CurvePoint[] = [];
  for (let k = 0; k < xs.length - 1; k++) {
    const width = xs[k + 1] - xs[k];
    for (let i = 0; i < CURVE_SAMPLES; i++) {
      const t = i / CURVE_SAMPLES;
      curve.push({ x: xs[k] + t * width, y: hermite(ys[k], ys[k + 1], tangents[k], tangents[k + 1], width, t) });
    }
  }
  const end = xs.length - 1;
  curve.push({ x: xs[end], y: ys[end] });
  return curve;
}

/** Builds the rows and spec ts-lib-viz draws the trace from. */
function buildElectropherogramSpec(
  data: PeakData[],
  positionInterval: number,
  colors: BaseColors,
): { rows: TraceRow[]; spec: ChartSpec } {
  const maxValue = Math.max(0, ...data.flatMap((item) => [item.peakA, item.peakT, item.peakG, item.peakC]));
  const yMax = maxValue * Y_HEADROOM_FACTOR;
  const positions = data.map((item) => item.position);
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);

  // Pad by half a sample step on each side so the outermost peaks are not clipped (SW-2298).
  const step = positions.length > 1 ? (maxPosition - minPosition) / (positions.length - 1) : 1;

  const rows: TraceRow[] = data.map((item) => {
    const base = determineBase(item);
    const tallest = Math.max(item.peakA, item.peakT, item.peakG, item.peakC);
    return {
      position: item.position,
      peakA: item.peakA,
      peakT: item.peakT,
      peakG: item.peakG,
      peakC: item.peakC,
      callY: tallest * LETTER_HEIGHT_FACTOR,
      letterA: base === "A" ? "A" : "",
      letterT: base === "T" ? "T" : "",
      letterG: base === "G" ? "G" : "",
      letterC: base === "C" ? "C" : "",
    };
  });

  const startPos = Math.ceil(minPosition / positionInterval) * positionInterval;
  const tickPositions: number[] = [];
  for (let pos = startPos; pos <= maxPosition; pos += positionInterval) {
    tickPositions.push(pos);
  }

  const ordered = [...data].sort((a, b) => a.position - b.position);
  const xs = ordered.map((item) => item.position);
  const traceCurve = (pick: (item: PeakData) => number) => monotoneCurve(xs, ordered.map(pick));
  const curves = {
    A: traceCurve((item) => item.peakA),
    T: traceCurve((item) => item.peakT),
    G: traceCurve((item) => item.peakG),
    C: traceCurve((item) => item.peakC),
  };

  const letter = { fontSize: LETTER_SIZE, hjust: 0.5, vjust: 0 };
  const spec = plot(rows, { x: "position" })
    // Each trace is its own curve. The subtitle names each colour, so the field-named legend is hidden.
    .line({ data: curves.A, aes: { x: "x", y: "y" }, color: colors.A, linewidth: TRACE_WIDTH, showLegend: false })
    .line({ data: curves.T, aes: { x: "x", y: "y" }, color: colors.T, linewidth: TRACE_WIDTH, showLegend: false })
    .line({ data: curves.G, aes: { x: "x", y: "y" }, color: colors.G, linewidth: TRACE_WIDTH, showLegend: false })
    .line({ data: curves.C, aes: { x: "x", y: "y" }, color: colors.C, linewidth: TRACE_WIDTH, showLegend: false })
    .text({ aes: { y: "callY", label: "letterA" }, color: colors.A, showLegend: false, ...letter })
    .text({ aes: { y: "callY", label: "letterT" }, color: colors.T, showLegend: false, ...letter })
    .text({ aes: { y: "callY", label: "letterG" }, color: colors.G, showLegend: false, ...letter })
    .text({ aes: { y: "callY", label: "letterC" }, color: colors.C, showLegend: false, ...letter })
    .labs({
      headline: "Called sequence",
      subtitle: "Each trace is one base (A green, C blue, G pink, T orange). The letter marks the called base.",
    })
    .scales({
      x: {
        title: "Position",
        limits: [minPosition - step / 2, maxPosition + step / 2],
        breaks: tickPositions,
        grid: false,
      },
      y: { title: "Signal intensity", limits: [0, yMax], breaks: yAxisBreaks(maxValue), grid: false },
    })
    .spec();

  return { rows, spec };
}

/**
 * Plotly-era electropherogram: four base traces, with the called base lettered
 * just above its peak and position numbers on the x-axis.
 *
 * ts-lib-viz draws the traces as straight segments; the Plotly spline is not
 * supported. `colorA`–`colorC` colour each trace and its letters. The Plotly
 * hover readout is replaced by ts-lib-viz's own.
 *
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const Electropherogram: React.FC<ElectropherogramProps> = ({
  data = [],
  width,
  height,
  positionInterval = 10,
  colorA = DEFAULT_BASE_COLORS.A,
  colorT = DEFAULT_BASE_COLORS.T,
  colorG = DEFAULT_BASE_COLORS.G,
  colorC = DEFAULT_BASE_COLORS.C,
}) => {
  useChartDeprecationWarning("Electropherogram");

  const colors = useMemo<BaseColors>(
    () => ({ A: colorA, T: colorT, G: colorG, C: colorC }),
    [colorA, colorT, colorG, colorC],
  );
  const built = useMemo(
    () => (data.length === 0 ? null : buildElectropherogramSpec(data, positionInterval, colors)),
    [data, positionInterval, colors],
  );

  if (built === null) {
    return <div className="electropherogram-empty">No data available</div>;
  }

  return (
    <VizChart spec={built.spec} data={built.rows} width={width ?? DEFAULT_WIDTH} height={height ?? DEFAULT_HEIGHT} />
  );
};

export { Electropherogram };
export type { PeakData, ElectropherogramProps };
