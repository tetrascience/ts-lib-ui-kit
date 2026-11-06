import { useMemo } from "react";

import type { StackedChromatogramProps } from "@/components/charts/StackedChromatogram/types";

import { applyStackingTransform } from "@/components/charts/StackedChromatogram/transforms";
import { ChromatogramChart as Chromatogram } from "@/components/composed/Chart/kinds/Chromatogram";

export function StackedChromatogramChart({
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
    () => applyStackingTransform(series, annotations, stackingMode, stackOffset, stackingOrder),
    [series, annotations, stackingMode, stackOffset, stackingOrder],
  );

  return (
    <Chromatogram {...restProps} series={transformedSeries} annotations={transformedAnnotations} yRange={yRange} />
  );
}
export type { StackedChromatogramProps };
