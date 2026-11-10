import type { PieChartProps } from "@/components/composed/Chart/kinds/PieChart";

import { PieChartChart } from "@/components/composed/Chart/kinds/PieChart";

export { buildPieRows, buildPieSpec } from "@/components/composed/Chart/kinds/PieChart";
export type { PieChartProps, PieDataSeries, PieRow, PieTextInfo } from "@/components/composed/Chart/kinds/PieChart";

/** Draws a pie chart through the shared `Chart` component. */
export function PieChart(props: PieChartProps) {
  return <PieChartChart {...props} />;
}
