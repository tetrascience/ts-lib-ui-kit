import type { ElectropherogramProps } from "@/components/composed/Chart/kinds/Electropherogram";

import { ElectropherogramChart } from "@/components/composed/Chart/kinds/Electropherogram";

export type { ElectropherogramProps, PeakData } from "@/components/composed/Chart/kinds/Electropherogram";

/** Draws a electropherogram through the shared `Chart` component. */
export function Electropherogram(props: ElectropherogramProps) {
  return <ElectropherogramChart {...props} />;
}
