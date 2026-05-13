import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef } from "react";

import {
  groupOverlappingPeaks,
  createGroupAnnotations,
  resolveSelectionAppearance,
} from "./annotations";
import { CHROMATOGRAM_TRACE } from "./constants";
import {
  validateSeriesData,
  applyBaselineCorrection,
  processUserAnnotations,
} from "./dataProcessing";
import { detectPeaks } from "./peakDetection";
import { buildTraceData, buildLayout, buildConfig } from "./plotBuilder";

import type {
  ChromatogramSeries,
  PeakAnnotation,
  PeakSelectEvent,
  PeakSelectionAppearance,
  BaselineCorrectionMethod,
  BoundaryMarkerStyle,
  BoundaryMarkerType,
  PeakDetectionOptions,
  ChromatogramChartProps,
  PeakWithMeta,
} from "./types";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";

// Re-export types for external use
export type {
  ChromatogramSeries,
  PeakAnnotation,
  PeakSelectEvent,
  PeakSelectionAppearance,
  BaselineCorrectionMethod,
  BoundaryMarkerStyle,
  BoundaryMarkerType,
  PeakDetectionOptions,
  ChromatogramChartProps,
};


const ChromatogramChart: React.FC<ChromatogramChartProps> = ({
  series,
  width = 900,
  height = 500,
  title,
  xAxisTitle = "Retention Time (min)",
  yAxisTitle = "Signal (mAU)",
  annotations = [],
  xRange,
  yRange,
  showLegend = true,
  showGridX = true,
  showGridY = true,
  showMarkers = false,
  markerSize = 4,
  showCrosshairs = false,
  baselineCorrection = "none",
  baselineWindowSize = 50,
  peakDetectionOptions,
  showPeakAreas = false,
  boundaryMarkers = "none",
  annotationOverlapThreshold = 0.4,
  showExportButton = true,
  selectedPeakIds,
  onPeakClick,
  onPeakHover,
  selectionAppearance,
  annotationStyle = "arrow",
  titleFontSize = 20,
  titleTopMargin,
}) => {
  const enablePeakDetection = peakDetectionOptions !== undefined;
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();

  // Stable refs for callbacks — avoids including them in effect dep arrays
  // (consumers often pass arrow functions that change identity every render).
  const onPeakClickRef = useRef(onPeakClick);
  const onPeakHoverRef = useRef(onPeakHover);
  onPeakClickRef.current = onPeakClick;
  onPeakHoverRef.current = onPeakHover;

  // Tracks the series index whose line is currently thickened on hover.
  const thickenedSeriesRef = useRef<number | null>(null);

  // Holds the latest peak Plotly annotations so that closures in effects always
  // read the latest selection-styled annotations.
  const peakAnnotationsRef = useRef<Partial<Plotly.Annotations>[]>([]);

  // Memoize processed series with baseline correction
  const processedSeries = useMemo(() => {
    return series.map((s) => {
      const validated = validateSeriesData(s.x, s.y);
      return {
        ...s,
        x: validated.x,
        y: applyBaselineCorrection(validated.y, baselineCorrection, baselineWindowSize),
      };
    });
  }, [series, baselineCorrection, baselineWindowSize]);

  // Process user annotations to convert startX/endX to indices and compute areas
  const processedAnnotations = useMemo(() => {
    if (annotations.length === 0 || processedSeries.length === 0) {
      return annotations;
    }
    const { x, y } = processedSeries[0];
    return processUserAnnotations(annotations, x, y);
  }, [annotations, processedSeries]);

  // Memoize peak detection results
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

  // Resolve selection appearance defaults once (stable as long as individual
  // fields don't change — consumers should memoize selectionAppearance if needed).
  const resolvedAppearance = useMemo(
    () => resolveSelectionAppearance(selectionAppearance),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectionAppearance?.selected?.borderColor,
      selectionAppearance?.selected?.backgroundColor,
      selectionAppearance?.selected?.bold,
      selectionAppearance?.unselected?.opacity,
      selectionAppearance?.hoverLineWidthMultiplier,
    ]
  );

  // All peaks that can be interacted with (clicked / hovered / selected),
  // each with a stable ID and the metadata needed for PeakSelectEvent.
  const allPeaksForInteraction = useMemo(() => {
    const result: Array<{
      peak: PeakAnnotation & { id: string };
      seriesIndex: number;
      seriesName: string;
      isAutoDetected: boolean;
    }> = [];

    processedAnnotations.forEach((ann, i) => {
      result.push({
        peak: { ...ann, id: ann.id ?? `user-ann-${i}` },
        seriesIndex: 0,
        seriesName: series[0]?.name ?? "",
        isAutoDetected: false,
      });
    });

    allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
      peaks.forEach((peak, peakIndex) => {
        result.push({
          peak: { ...peak, id: `peak-${seriesIndex}-${peakIndex}` },
          seriesIndex,
          seriesName: series[seriesIndex]?.name ?? `Series ${seriesIndex + 1}`,
          isAutoDetected: true,
        });
      });
    });

    return result;
  }, [processedAnnotations, allDetectedPeaks, series]);

  // Build Plotly annotation objects for all peaks, applying selection styling.
  // This memo re-runs when selectedPeakIds or resolvedAppearance changes so the
  // selection effect can call Plotly.relayout with updated annotations without
  // triggering a full chart rebuild.
  const peakAnnotations = useMemo(() => {
    const anySelected = (selectedPeakIds?.length ?? 0) > 0;
    const options = {
      selectedPeakIds: selectedPeakIds ?? [],
      anySelected,
      appearance: resolvedAppearance,
      annotationStyle,
    };

    const allPeaksWithMeta: PeakWithMeta[] = [];

    processedAnnotations.forEach((ann, i) => {
      allPeaksWithMeta.push({
        peak: { ...ann, id: ann.id ?? `user-ann-${i}` },
        seriesIndex: -1,
      });
    });

    if (showPeakAreas && enablePeakDetection) {
      allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
        peaks.forEach((peak, peakIndex) => {
          allPeaksWithMeta.push({
            peak: { ...peak, id: `peak-${seriesIndex}-${peakIndex}` },
            seriesIndex,
          });
        });
      });
    }

    const groups = groupOverlappingPeaks(allPeaksWithMeta, annotationOverlapThreshold);
    const result: Partial<Plotly.Annotations>[] = [];
    for (const group of groups) {
      result.push(...createGroupAnnotations(group, options));
    }
    return result;
  }, [
    processedAnnotations,
    allDetectedPeaks,
    showPeakAreas,
    enablePeakDetection,
    annotationOverlapThreshold,
    selectedPeakIds,
    resolvedAppearance,
    annotationStyle,
  ]);

  // Keep the ref in sync every render so that closures in effects always read
  // the latest selection-styled annotations.
  peakAnnotationsRef.current = peakAnnotations;

  // ── Main chart effect ──────────────────────────────────────────────────────
  // Rebuilds the full chart when structural props change (data, size, axes, …).
  // selectedPeakIds and selectionAppearance are intentionally excluded from
  // deps — selection changes are handled by the lightweight selection effect
  // below via Plotly.relayout, which preserves the user's current zoom/pan.
  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef || series.length === 0) return;

    const plotData = buildTraceData({
      processedSeries,
      processedAnnotations,
      allDetectedPeaks,
      allPeaksForInteraction,
      showMarkers,
      markerSize,
      xAxisTitle,
      yAxisTitle,
      boundaryMarkers,
    });

    const layout = buildLayout({
      title,
      titleFontSize,
      titleTopMargin,
      width,
      height,
      xAxisTitle,
      yAxisTitle,
      xRange,
      yRange,
      showLegend,
      seriesCount: series.length,
      showGridX,
      showGridY,
      showCrosshairs,
      theme,
      peakAnnotations: peakAnnotationsRef.current,
    });

    const config = buildConfig({ showExportButton, width, height });

    Plotly.newPlot(currentRef, plotData, layout, config);

    // ── Event: peak click ──────────────────────────────────────────────────
    (currentRef as unknown as Plotly.PlotlyHTMLElement).on(
      "plotly_click",
      (eventData: Plotly.PlotMouseEvent) => {
        if (!onPeakClickRef.current) return;
        const peakPoint = eventData.points.find((p) => p.customdata != null);
        if (!peakPoint) return;
        onPeakClickRef.current(peakPoint.customdata as unknown as PeakSelectEvent);
      }
    );

    // ── Event: trace hover / peak hover ───────────────────────────────────
    // Trace thickening fires on hover over any point on a series trace (matches
    // SST ChromatogramPanel behaviour). The onPeakHover callback fires only when
    // the cursor is over an invisible peak hit-area marker.
    (currentRef as unknown as Plotly.PlotlyHTMLElement).on(
      "plotly_hover",
      (eventData: Plotly.PlotHoverEvent) => {
        // General trace thickening — first hovered point that belongs to a series trace
        const pt = eventData.points[0];
        if (pt && pt.curveNumber < processedSeries.length) {
          const targetIdx = pt.curveNumber;
          if (thickenedSeriesRef.current !== targetIdx) {
            if (thickenedSeriesRef.current !== null) {
              Plotly.restyle(currentRef, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
            }
            Plotly.restyle(
              currentRef,
              { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH * resolvedAppearance.hoverLineWidthMultiplier } as Plotly.Data,
              [targetIdx]
            );
            thickenedSeriesRef.current = targetIdx;
          }
        }

        // Peak-specific callback — only when near an invisible hit-area marker
        const peakPoint = eventData.points.find((p) => p.customdata != null);
        if (peakPoint) {
          onPeakHoverRef.current?.(peakPoint.customdata as unknown as PeakSelectEvent);
        }
      }
    );

    (currentRef as unknown as Plotly.PlotlyHTMLElement).on(
      "plotly_unhover",
      () => {
        onPeakHoverRef.current?.(null);
        if (thickenedSeriesRef.current !== null) {
          Plotly.restyle(currentRef, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
          thickenedSeriesRef.current = null;
        }
      }
    );

    return () => {
      thickenedSeriesRef.current = null;
      if (currentRef) Plotly.purge(currentRef);
    };
  }, [
    processedSeries, allDetectedPeaks, allPeaksForInteraction, series.length,
    width, height, title, titleFontSize, titleTopMargin, xAxisTitle, yAxisTitle,
    processedAnnotations, xRange, yRange, showLegend, showGridX, showGridY,
    showMarkers, markerSize, showCrosshairs, enablePeakDetection, peakDetectionOptions,
    showPeakAreas, boundaryMarkers, annotationOverlapThreshold, showExportButton,
    theme,
    // resolvedAppearance included so hover multiplier stays in sync with the
    // event handler closure without it being in a ref itself.
    resolvedAppearance,
  ]);

  // ── Selection update effect ────────────────────────────────────────────────
  // Runs when selectedPeakIds / selectionAppearance change (peakAnnotations
  // recomputes). Uses Plotly.relayout so the user's zoom/pan state is preserved.
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    // Guard: skip if the chart hasn't been initialized by the main effect yet.
    if (!(el as { _fullLayout?: unknown })._fullLayout) return;

    Plotly.relayout(el, {
      annotations: peakAnnotations,
    } as unknown as Partial<Plotly.Layout>);
  }, [peakAnnotations]);

  return (
    <div className="chromatogram-chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ChromatogramChart };
