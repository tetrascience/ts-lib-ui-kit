import { useMemo } from "react";

import { useChartDeprecationWarning } from "../viz/deprecation";
import { VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { CHART_COLORS } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

/** Scale factor for y-axis range to add padding above max value */
const Y_AXIS_PADDING_FACTOR = 1.05;
/** Where the base letters sit, as a fraction of the y range: near the top, above the traces. */
const LETTER_HEIGHT = 0.96;

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
  lettersY: number;
  letterA: string;
  letterT: string;
  letterG: string;
  letterC: string;
}

type BaseColors = Record<"A" | "T" | "G" | "C", string>;

/** Builds the rows and spec ts-lib-viz draws the trace from. */
function buildElectropherogramSpec(
  data: PeakData[],
  positionInterval: number,
  colors: BaseColors,
): { rows: TraceRow[]; spec: ChartSpec } {
  const maxValue = Math.max(0, ...data.flatMap((item) => [item.peakA, item.peakT, item.peakG, item.peakC]));
  const yMax = maxValue * Y_AXIS_PADDING_FACTOR;
  const positions = data.map((item) => item.position);
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);

  // Pad by half a sample step on each side so the outermost peaks are not clipped (SW-2298).
  const step = positions.length > 1 ? (maxPosition - minPosition) / (positions.length - 1) : 1;

  const rows: TraceRow[] = data.map((item) => {
    const base = determineBase(item);
    return {
      position: item.position,
      peakA: item.peakA,
      peakT: item.peakT,
      peakG: item.peakG,
      peakC: item.peakC,
      lettersY: yMax * LETTER_HEIGHT,
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

  const spec = plot(rows, { x: "position" })
    .line({ aes: { y: "peakA" }, color: colors.A, linewidth: 2 })
    .line({ aes: { y: "peakT" }, color: colors.T, linewidth: 2 })
    .line({ aes: { y: "peakG" }, color: colors.G, linewidth: 2 })
    .line({ aes: { y: "peakC" }, color: colors.C, linewidth: 2 })
    .text({ aes: { y: "lettersY", label: "letterA" }, color: colors.A })
    .text({ aes: { y: "lettersY", label: "letterT" }, color: colors.T })
    .text({ aes: { y: "lettersY", label: "letterG" }, color: colors.G })
    .text({ aes: { y: "lettersY", label: "letterC" }, color: colors.C })
    .scales({
      x: { limits: [minPosition - step / 2, maxPosition + step / 2], breaks: tickPositions, grid: false },
      y: { limits: [0, yMax], breaks: [], grid: false },
    })
    .spec();

  return { rows, spec };
}

/**
 * Plotly-era electropherogram: four base traces, with the called base lettered
 * along the top and position numbers on the x-axis.
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
  colorA = CHART_COLORS[0], // blue
  colorT = CHART_COLORS[2], // teal/green
  colorG = CHART_COLORS[3], // red
  colorC = CHART_COLORS[1], // orange
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

  return <VizChart spec={built.spec} data={built.rows} width={width ?? 900} height={height ?? 600} />;
};

export { Electropherogram };
export type { PeakData, ElectropherogramProps };
