import { useMemo } from "react";

import { Chromatogram } from "../Chromatogram";
import { useChartDeprecationWarning } from "../viz/deprecation";

import { applyStackingTransform } from "./transforms";

import type { StackedChromatogramProps } from "./types";

/**
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
export function StackedChromatogram({
  series,
  stackingMode = "overlay",
  stackOffset = 0,
  stackingOrder = "first-on-bottom",
  annotations,
  ...restProps
}: StackedChromatogramProps) {
  useChartDeprecationWarning("StackedChromatogram");
  const {
    series: transformedSeries,
    annotations: transformedAnnotations,
    yRange,
  } = useMemo(
    () =>
      applyStackingTransform(
        series,
        annotations,
        stackingMode,
        stackOffset,
        stackingOrder
      ),
    [series, annotations, stackingMode, stackOffset, stackingOrder]
  );

  return (
    <Chromatogram
      {...restProps}
      series={transformedSeries}
      annotations={transformedAnnotations}
      yRange={yRange}
    />
  );
}

export default StackedChromatogram;
