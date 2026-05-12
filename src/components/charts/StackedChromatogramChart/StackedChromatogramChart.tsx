import { useMemo } from "react";

import { ChromatogramChart } from "../ChromatogramChart";

import { applyStackingTransform } from "./transforms";

import type { StackedChromatogramChartProps } from "./types";

export function StackedChromatogramChart({
  series,
  stackingMode = "overlay",
  stackOffset = 0,
  stackingOrder = "first-on-bottom",
  annotations,
  rangeAnnotations,
  ...restProps
}: StackedChromatogramChartProps) {
  const {
    series: transformedSeries,
    annotations: transformedAnnotations,
    rangeAnnotations: transformedRangeAnnotations,
    yRange,
  } = useMemo(
    () =>
      applyStackingTransform(
        series,
        annotations,
        rangeAnnotations,
        stackingMode,
        stackOffset,
        stackingOrder
      ),
    [series, annotations, rangeAnnotations, stackingMode, stackOffset, stackingOrder]
  );

  return (
    <ChromatogramChart
      {...restProps}
      series={transformedSeries}
      annotations={transformedAnnotations}
      rangeAnnotations={transformedRangeAnnotations}
      yRange={yRange}
    />
  );
}

export default StackedChromatogramChart;
