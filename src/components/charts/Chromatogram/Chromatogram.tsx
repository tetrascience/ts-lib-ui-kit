import { useMemo } from "react";

import { useChartDeprecationWarning } from "../viz/deprecation";
import { VizChart } from "../viz/VizChart";

import { applyBaselineCorrection, processUserAnnotations, validateSeriesData } from "./dataProcessing";
import { detectPeaks } from "./peakDetection";
import { buildChromatogramSpec } from "./spec";

import type {
  BaselineCorrectionMethod,
  BoundaryMarkerStyle,
  BoundaryMarkerType,
  ChromatogramProps,
  ChromatogramSeries,
  PeakAnnotation,
  PeakDetectionOptions,
  PeakSelectEvent,
  PeakSelectionAppearance,
} from "./types";

import { EmptyState } from "@/components/composed/EmptyState";

// Re-export types for external use
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
};

// Stable default so the no-annotations case keeps a constant identity.
const EMPTY_ANNOTATIONS: PeakAnnotation[] = [];

/**
 * Plotly-era chromatogram: series traces, detected or supplied peak labels,
 * region overlays and boundary markers, all drawn through ts-lib-viz.
 *
 * The click and hover selection props (`selectedPeakIds`, `onPeakClick`,
 * `onPeakHover`, `selectionAppearance`), the crosshair, the export button, the
 * legend toggle, the arrow-or-inline `annotationStyle`, the overlap stagger
 * (`annotationOverlapThreshold`) and `titleFontSize`/`titleTopMargin` are
 * accepted and ignored. ts-lib-viz has no equivalent for them.
 *
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 */
const Chromatogram: React.FC<ChromatogramProps> = ({
  series,
  width = 900,
  height = 500,
  title,
  xAxisTitle = "Retention Time (min)",
  yAxisTitle = "Signal (mAU)",
  annotations = EMPTY_ANNOTATIONS,
  xRange,
  yRange,
  showGridX = true,
  showGridY = true,
  showMarkers = false,
  markerSize = 4,
  baselineCorrection = "none",
  baselineWindowSize = 50,
  peakDetectionOptions,
  showPeakAreas = false,
  boundaryMarkers = "none",
}) => {
  useChartDeprecationWarning("Chromatogram");
  const enablePeakDetection = peakDetectionOptions !== undefined;

  // Memoize processed series with baseline correction
  const processedSeries = useMemo(
    () =>
      series.map((s) => {
        const validated = validateSeriesData(s.x, s.y);
        return {
          ...s,
          x: validated.x,
          y: applyBaselineCorrection(validated.y, baselineCorrection, baselineWindowSize),
        };
      }),
    [series, baselineCorrection, baselineWindowSize],
  );

  // Process user annotations to convert startX/endX to indices and compute areas
  const processedAnnotations = useMemo(() => {
    if (annotations.length === 0 || processedSeries.length === 0) {
      return annotations;
    }
    const { x, y } = processedSeries[0];
    return processUserAnnotations(annotations, x, y);
  }, [annotations, processedSeries]);

  const allDetectedPeaks = useMemo(() => {
    const peaks: { peaks: PeakAnnotation[]; seriesIndex: number }[] = [];
    if (enablePeakDetection && peakDetectionOptions) {
      processedSeries.forEach((s, index) => {
        const detected = detectPeaks(s.x, s.y, peakDetectionOptions);
        if (detected.length > 0) {
          peaks.push({ peaks: detected, seriesIndex: index });
        }
      });
    }
    return peaks;
  }, [processedSeries, enablePeakDetection, peakDetectionOptions]);

  const built = useMemo(
    () =>
      series.length === 0
        ? null
        : buildChromatogramSpec({
            processedSeries,
            processedAnnotations,
            allDetectedPeaks,
            showPeakAreas,
            enablePeakDetection,
            boundaryMarkers,
            showMarkers,
            markerSize,
            title,
            xAxisTitle,
            yAxisTitle,
            xRange,
            yRange,
            showGridX,
            showGridY,
          }),
    [
      series.length,
      processedSeries,
      processedAnnotations,
      allDetectedPeaks,
      showPeakAreas,
      enablePeakDetection,
      boundaryMarkers,
      showMarkers,
      markerSize,
      title,
      xAxisTitle,
      yAxisTitle,
      xRange,
      yRange,
      showGridX,
      showGridY,
    ],
  );

  // No data: render an explicit empty state instead of a blank chart.
  if (built === null) {
    return (
      <div className="chromatogram-chart-container relative flex items-center justify-center" style={{ width, height }}>
        <EmptyState
          variant="no-data"
          title="No chromatogram data"
          description="There is no signal data to display yet."
        />
      </div>
    );
  }

  return <VizChart spec={built.spec} data={built.data} width={width} height={height} />;
};

export { Chromatogram };
