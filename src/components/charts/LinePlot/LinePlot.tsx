import type { LinePlotProps } from "@/components/composed/Chart/kinds/LinePlot";

import { Chart } from "@/components/composed/Chart";

export { lineRows } from "@/components/composed/Chart/kinds/LinePlot";
export type {
  LineDataSeries,
  LinePlotProps,
  LinePlotVariant,
  MarkerSymbol,
} from "@/components/composed/Chart/kinds/LinePlot";

/** Draws a line plot through the shared `Chart` component. */
export function LinePlot(props: LinePlotProps) {
  return <Chart type="line" {...props} />;
}
