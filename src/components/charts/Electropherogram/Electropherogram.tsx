import type { ElectropherogramProps } from "@/components/composed/Chart/kinds/Electropherogram";

import { Chart } from "@/components/composed/Chart";

export type { ElectropherogramProps, PeakData } from "@/components/composed/Chart/kinds/Electropherogram";

/** Draws a electropherogram through the shared `Chart` component. */
export function Electropherogram(props: ElectropherogramProps) {
  return <Chart type="electropherogram" {...props} />;
}
