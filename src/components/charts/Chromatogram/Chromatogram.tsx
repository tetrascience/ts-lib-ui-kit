import type { ChromatogramProps } from "@/components/composed/Chart/kinds/Chromatogram";

import { Chart } from "@/components/composed/Chart";

export type {
  BaselineCorrectionMethod,
  BoundaryMarkerStyle,
  BoundaryMarkerType,
  ChromatogramProps,
  ChromatogramSeries,
  PeakAnnotation,
  PeakDetectionOptions,
  PeakSelectEvent,
  PeakSelectionAppearance,
} from "@/components/composed/Chart/kinds/Chromatogram";

/** Draws a chromatogram through the shared `Chart` component. */
export function Chromatogram(props: ChromatogramProps) {
  return <Chart type="chromatogram" {...props} />;
}
