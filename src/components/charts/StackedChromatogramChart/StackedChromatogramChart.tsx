import { useMemo } from "react";

import { ChromatogramChart } from "../ChromatogramChart";

import { applyStackingTransform } from "./transforms";

import type { StackedChromatogramChartProps } from "./types";

export function StackedChromatogramChart({
  series,
  stackingMode = "overlay",
  stackOffset = 0,
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
        stackOffset
      ),
    [series, annotations, rangeAnnotations, stackingMode, stackOffset]
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
