import type { ChromatogramSeries, PeakAnnotation } from "../ChromatogramChart";
import type { StackingMode } from "./types";

interface TransformResult {
  series: ChromatogramSeries[];
  annotations: PeakAnnotation[];
  yRange: [number, number];
}

export function applyStackingTransform(
  inputSeries: ChromatogramSeries[],
  inputAnnotations: PeakAnnotation[][] | undefined,
  mode: StackingMode,
  stackOffset: number
): TransformResult {
  const yValues = inputSeries.flatMap((s) => s.y);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues);
  const consistentYRange: [number, number] = [yMin, yMax];

  if (mode === "overlay") {
    return {
      series: inputSeries,
      annotations: inputAnnotations ? inputAnnotations.flat() : [],
      yRange: consistentYRange,
    };
  }

  // 'stack' mode: shift each series up by its index × stackOffset
  const offsetSeries: ChromatogramSeries[] = inputSeries.map(
    (series, index) => ({
      ...series,
      y: series.y.map((yVal) => yVal + index * stackOffset),
    })
  );

  const offsetAnnotations: PeakAnnotation[] = [];
  if (inputAnnotations) {
    inputAnnotations.forEach((seriesAnnotations, seriesIndex) => {
      const yShift = seriesIndex * stackOffset;
      seriesAnnotations.forEach((ann) => {
        offsetAnnotations.push({ ...ann, y: ann.y + yShift });
      });
    });
  }

  const allYValues = offsetSeries.flatMap((s) => s.y);
  const annotationYValues = offsetAnnotations.map((a) => a.y);
  const stackedYMin = Math.min(...allYValues, ...annotationYValues, 0);
  const stackedYMax = Math.max(...allYValues, ...annotationYValues);

  return {
    series: offsetSeries,
    annotations: offsetAnnotations,
    yRange: [stackedYMin, stackedYMax],
  };
}
