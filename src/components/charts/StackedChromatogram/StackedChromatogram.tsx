import { useMemo } from "react";

import { Chromatogram } from "../Chromatogram";

import { applyStackingTransform } from "./transforms";

import type { StackedChromatogramProps } from "./types";

export function StackedChromatogram({
  series,
  stackingMode = "overlay",
  stackOffset = 0,
  stackingOrder = "first-on-bottom",
  annotations,
  ...restProps
}: StackedChromatogramProps) {
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
