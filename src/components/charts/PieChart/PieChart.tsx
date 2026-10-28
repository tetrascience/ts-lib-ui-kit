import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { useMemo } from "react";

import { categoricalPalettes, VizChart } from "../viz/VizChart";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";


import { CHART_COLORS } from "@/utils/colors";

interface PieDataSeries {
  labels: string[];
  values: number[];
  name: string;
  colors?: string[];
}

type PieTextInfo =
  | "none"
  | "label"
  | "percent"
  | "value"
  | "label+percent"
  | "label+value"
  | "value+percent"
  | "label+value+percent";

type PieChartProps = {
  dataSeries: PieDataSeries;
  width?: number;
  height?: number;
  title?: string;
  /**
   * Accepted for compatibility and not applied. ts-lib-viz has no equivalent, so slice labels
   * are not drawn from this value.
   */
  textInfo?: PieTextInfo;
  hole?: number;
  /**
   * Accepted for compatibility and not applied. ts-lib-viz has no equivalent, so the start
   * angle stays at its default.
   */
  rotation?: number;
};

/** One row per slice. */
export interface PieRow {
  label: string;
  value: number;
}

/** Pairs each label with its value. */
export function buildPieRows(dataSeries: PieDataSeries): PieRow[] {
  return dataSeries.labels.map((label, index) => ({ label, value: dataSeries.values[index] }));
}

interface PieSpecOptions {
  hole: number;
  title?: string;
}

/** Builds the ts-lib-viz pie spec. `hole` sets the inner radius, so 0 gives a full pie. */
export function buildPieSpec(rows: PieRow[], options: PieSpecOptions): ChartSpec {
  const { hole, title } = options;
  return plot(rows, { x: "label", y: "value", fill: "label" })
    .pie({ innerRadius: hole })
    .labs({ headline: title })
    .spec();
}

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const PieChart: React.FC<PieChartProps> = ({
  dataSeries,
  width,
  height,
  title,
  hole = 0,
}) => {
  const colors = dataSeries.colors ?? CHART_COLORS;
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildPieRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(() => buildPieSpec(rows, { hole, title }), [rows, hole, title]);

  return <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />;
};

export { PieChart };
export type { PieDataSeries, PieTextInfo, PieChartProps };
