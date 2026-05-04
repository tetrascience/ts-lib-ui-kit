import { useMemo } from "react";

import { ChromatogramChart } from "../ChromatogramChart";

import { applyStackingTransform } from "./transforms";

import type { StackedChromatogramChartProps } from "./types";

export function StackedChromatogramChart({
  series,
  stackingMode = "overlay",
  stackOffset = 0,
  annotations,
  ...restProps
}: StackedChromatogramChartProps) {
  const {
    series: transformedSeries,
    annotations: transformedAnnotations,
    yRange,
  } = useMemo(
    () => applyStackingTransform(series, annotations, stackingMode, stackOffset),
    [series, annotations, stackingMode, stackOffset]
  );

  return (
    <ChromatogramChart
      {...restProps}
      series={transformedSeries}
      annotations={transformedAnnotations}
      yRange={yRange}
    />
  );
}

export default StackedChromatogramChart;
