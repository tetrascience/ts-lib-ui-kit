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
  ...restProps
}: StackedChromatogramChartProps) {
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
    <ChromatogramChart
      {...restProps}
      series={transformedSeries}
      annotations={transformedAnnotations}
      yRange={yRange}
    />
  );
}

export default StackedChromatogramChart;
