import type { AreaPlotProps } from "@/components/composed/Chart/kinds/AreaPlot";

import { AreaPlotChart } from "@/components/composed/Chart/kinds/AreaPlot";

export { areaRows } from "@/components/composed/Chart/kinds/AreaPlot";
export type { AreaDataSeries, AreaPlotProps, AreaPlotVariant } from "@/components/composed/Chart/kinds/AreaPlot";

/** Draws a area plot through the shared `Chart` component. */
export function AreaPlot(props: AreaPlotProps) {
  return <AreaPlotChart {...props} />;
}
