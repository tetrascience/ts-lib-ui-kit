import type { BarChartProps } from "@/components/composed/Chart/kinds/BarChart";

import { Chart } from "@/components/composed/Chart";

export { buildBarRows, buildBarSpec } from "@/components/composed/Chart/kinds/BarChart";
export type { BarChartProps, BarChartVariant, BarDataSeries, BarRow } from "@/components/composed/Chart/kinds/BarChart";

/** Draws a bar chart through the shared `Chart` component. */
export function BarChart(props: BarChartProps) {
  return <Chart type="bar" {...props} />;
}
