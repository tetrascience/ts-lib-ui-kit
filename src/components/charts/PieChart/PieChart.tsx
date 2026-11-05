import type { PieChartProps } from "@/components/composed/Chart/kinds/PieChart";

import { Chart } from "@/components/composed/Chart";

export { buildPieRows, buildPieSpec } from "@/components/composed/Chart/kinds/PieChart";
export type { PieChartProps, PieDataSeries, PieRow, PieTextInfo } from "@/components/composed/Chart/kinds/PieChart";

/** Draws a pie chart through the shared `Chart` component. */
export function PieChart(props: PieChartProps) {
  return <Chart type="pie" {...props} />;
}
