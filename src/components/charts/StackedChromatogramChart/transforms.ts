import type {
  ChromatogramSeries,
  PeakAnnotation,
  RangeAnnotation,
} from "../ChromatogramChart";
import type { StackingMode } from "./types";

interface TransformResult {
  series: ChromatogramSeries[];
  annotations: PeakAnnotation[];
  rangeAnnotations: RangeAnnotation[];
  yRange: [number, number];
}

export function applyStackingTransform(
  inputSeries: ChromatogramSeries[],
  inputAnnotations: PeakAnnotation[][] | undefined,
  inputRangeAnnotations: RangeAnnotation[][] | undefined,
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
      rangeAnnotations: inputRangeAnnotations ? inputRangeAnnotations.flat() : [],
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

  // Shift numeric yAnchor values; "top" and "auto" anchors are unaffected
  // because they derive position from paper-space or the already-shifted data.
  const offsetRangeAnnotations: RangeAnnotation[] = [];
  if (inputRangeAnnotations) {
    inputRangeAnnotations.forEach((seriesRangeAnnotations, seriesIndex) => {
      const yShift = seriesIndex * stackOffset;
      seriesRangeAnnotations.forEach((ann) => {
        offsetRangeAnnotations.push({
          ...ann,
          yAnchor:
            typeof ann.yAnchor === "number"
              ? ann.yAnchor + yShift
              : ann.yAnchor,
        });
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
    rangeAnnotations: offsetRangeAnnotations,
    yRange: [stackedYMin, stackedYMax],
  };
}
