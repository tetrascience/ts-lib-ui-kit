import type { BoxPlotProps } from "@/components/composed/Chart/kinds/BoxPlot";

import { BoxPlotChart } from "@/components/composed/Chart/kinds/BoxPlot";

export { buildBoxRows, buildBoxSpec } from "@/components/composed/Chart/kinds/BoxPlot";
export type { BoxDataSeries, BoxPlotProps, BoxRow } from "@/components/composed/Chart/kinds/BoxPlot";

/** Draws a box plot through the shared `Chart` component. */
export function BoxPlot(props: BoxPlotProps) {
  return <BoxPlotChart {...props} />;
}
