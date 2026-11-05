import type { ScatterPlotInteractiveProps } from "@/components/composed/Chart/kinds/ScatterPlotInteractive";

import { Chart } from "@/components/composed/Chart";

export type { ScatterPlotInteractiveProps } from "@/components/composed/Chart/kinds/ScatterPlotInteractive";

/** Draws a scatter plot interactive through the shared `Chart` component. */
export function ScatterPlotInteractive(props: ScatterPlotInteractiveProps) {
  return <Chart type="scatterInteractive" {...props} />;
}
