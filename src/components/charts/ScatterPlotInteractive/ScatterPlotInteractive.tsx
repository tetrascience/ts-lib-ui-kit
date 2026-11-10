import type { ScatterPlotInteractiveProps } from "@/components/composed/Chart/kinds/ScatterPlotInteractive";

import { ScatterPlotInteractiveChart } from "@/components/composed/Chart/kinds/ScatterPlotInteractive";

export type { ScatterPlotInteractiveProps } from "@/components/composed/Chart/kinds/ScatterPlotInteractive";

/** Draws a scatter plot interactive through the shared `Chart` component. */
export function ScatterPlotInteractive(props: ScatterPlotInteractiveProps) {
  return <ScatterPlotInteractiveChart {...props} />;
}
