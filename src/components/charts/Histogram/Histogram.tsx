import type { HistogramProps } from "@/components/composed/Chart/kinds/Histogram";

import { HistogramChart } from "@/components/composed/Chart/kinds/Histogram";

export {
  buildHistogramRows,
  buildHistogramSpec,
  fitDistributionCurve,
} from "@/components/composed/Chart/kinds/Histogram";
export type {
  DistributionCurve,
  HistogramDataSeries,
  HistogramProps,
  HistogramRow,
} from "@/components/composed/Chart/kinds/Histogram";

/** Draws a histogram through the shared `Chart` component. */
export function Histogram(props: HistogramProps) {
  return <HistogramChart {...props} />;
}
