import type { StackedChromatogramProps } from "@/components/composed/Chart/kinds/StackedChromatogram";

import { StackedChromatogramChart } from "@/components/composed/Chart/kinds/StackedChromatogram";

export type { StackedChromatogramProps } from "@/components/composed/Chart/kinds/StackedChromatogram";

/** Draws a stacked chromatogram through the shared `Chart` component. */
export function StackedChromatogram(props: StackedChromatogramProps) {
  return <StackedChromatogramChart {...props} />;
}

export default StackedChromatogram;
