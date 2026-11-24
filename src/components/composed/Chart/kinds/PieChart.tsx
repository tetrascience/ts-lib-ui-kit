import { useMemo } from "react";

import type { ChartSpec } from "@tetrascience-npm/ts-lib-viz/core";

import { withViz, plot } from "@/components/charts/viz/viz-loader";
import { categoricalPalettes, VizChart } from "@/components/charts/viz/VizChart";
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
   * Accepted for compatibility and not drawn. The Plotly pie hid its slice text, so the slices
   * stay unlabelled and the legend below names them.
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

/** One colour per slice: the caller's colours in order, padded with the default colours. */
function sliceColors(dataSeries: PieDataSeries): string[] {
  return dataSeries.labels.map((_, index) => dataSeries.colors?.[index] ?? CHART_COLORS[index % CHART_COLORS.length]);
}

/** The key under the pie: one swatch and label per slice, as the Plotly pie drew it. */
function PieLegend({ labels, colors }: { labels: string[]; colors: string[] }) {
  return (
    <div
      data-slot="pie-legend"
      className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 pt-2 text-foreground"
    >
      {labels.map((label, index) => (
        <div key={`${label}-${index}`} className="flex items-center text-[13px] leading-[18px] font-medium">
          <span
            data-slot="pie-legend-swatch"
            className="mr-1.5 inline-block size-3 rounded-[4px]"
            style={{ background: colors[index] }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

const PieChartChart: React.FC<PieChartProps> = ({ dataSeries, width, height, title, hole = 0 }) => {
  const colors = useMemo(() => sliceColors(dataSeries), [dataSeries]);
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => buildPieRows(dataSeries), [dataSeries]);
  const spec = useMemo<ChartSpec>(() => buildPieSpec(rows, { hole, title }), [rows, hole, title]);

  return (
    <div style={{ width: width ?? "100%" }}>
      <VizChart spec={spec} data={rows} palettes={palettes} width={width} height={height} />
      <PieLegend labels={dataSeries.labels} colors={colors} />
    </div>
  );
};

const PieChartChartLazy = withViz("PieChartChart", PieChartChart, "pie");

export { PieChartChartLazy as PieChartChart };
export type { PieDataSeries, PieTextInfo, PieChartProps };
