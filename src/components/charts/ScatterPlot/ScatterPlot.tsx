import type { ScatterPlotProps } from "@/components/composed/Chart/kinds/ScatterPlot";

import { ScatterPlotChart } from "@/components/composed/Chart/kinds/ScatterPlot";

export type {
  MarkerSymbol,
  ScatterPlotDataSeries,
  ScatterPlotProps,
  ScatterPlotVariant,
} from "@/components/composed/Chart/kinds/ScatterPlot";

/** Draws a scatter plot through the shared `Chart` component. */
export function ScatterPlot(props: ScatterPlotProps) {
  return <ScatterPlotChart {...props} />;
}
