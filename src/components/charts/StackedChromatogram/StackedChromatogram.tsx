import type { StackedChromatogramProps } from "@/components/composed/Chart/kinds/StackedChromatogram";

import { Chart } from "@/components/composed/Chart";

export type { StackedChromatogramProps } from "@/components/composed/Chart/kinds/StackedChromatogram";

/** Draws a stacked chromatogram through the shared `Chart` component. */
export function StackedChromatogram(props: StackedChromatogramProps) {
  return <Chart type="stackedChromatogram" {...props} />;
}

export default StackedChromatogram;
