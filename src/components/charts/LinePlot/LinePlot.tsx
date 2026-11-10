import type { LinePlotProps } from "@/components/composed/Chart/kinds/LinePlot";

import { LinePlotChart } from "@/components/composed/Chart/kinds/LinePlot";

export { lineRows } from "@/components/composed/Chart/kinds/LinePlot";
export type {
  LineDataSeries,
  LinePlotProps,
  LinePlotVariant,
  MarkerSymbol,
} from "@/components/composed/Chart/kinds/LinePlot";

/** Draws a line plot through the shared `Chart` component. */
export function LinePlot(props: LinePlotProps) {
  return <LinePlotChart {...props} />;
}
