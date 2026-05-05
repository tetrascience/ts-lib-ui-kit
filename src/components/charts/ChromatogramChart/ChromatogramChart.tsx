import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef } from "react";

import { CHART_COLORS } from "../../../utils/colors";

import {
  groupOverlappingPeaks,
  createGroupAnnotations,
  resolveSelectionAppearance,
} from "./annotations";
import { createBoundaryMarkerTraces } from "./boundaryMarkers";
import { CHROMATOGRAM_LAYOUT, CHROMATOGRAM_TRACE } from "./constants";
import {
  validateSeriesData,
  applyBaselineCorrection,
  buildHoverExtraContent,
  collectPeaksWithBoundaryData,
  processUserAnnotations,
} from "./dataProcessing";
import { detectPeaks } from "./peakDetection";
import { buildRangeAnnotationElements } from "./rangeAnnotations";

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
  RangeAnnotation,
} from "./types";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";

// Re-export types for external use
export type {
  ChromatogramSeries,
  PeakAnnotation,
  PeakSelectEvent,
  PeakSelectionAppearance,
  RangeAnnotation,
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
  rangeAnnotations = [],
  rangeAnnotationOverlapThreshold = 0,
  selectedPeakIds,
  onPeakClick,
  onPeakHover,
  selectionAppearance,
}) => {
  const enablePeakDetection = peakDetectionOptions !== undefined;
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();

  // Prevents the plotly_relayout fired by our own annotation update from
  // being treated as a user-initiated zoom and triggering another update cycle.
  const isAnnotationRelayout = useRef(false);

  // Stable refs for callbacks — avoids including them in effect dep arrays
  // (consumers often pass arrow functions that change identity every render).
  const onPeakClickRef = useRef(onPeakClick);
  const onPeakHoverRef = useRef(onPeakHover);
  onPeakClickRef.current = onPeakClick;
  onPeakHoverRef.current = onPeakHover;

  // Tracks the series index whose line is currently thickened on hover.
  const thickenedSeriesRef = useRef<number | null>(null);

  // Holds the latest peak Plotly annotations so that closures (e.g. the range
  // repositioning handler) always use the current selection-styled annotations.
  const peakAnnotationsRef = useRef<Partial<Plotly.Annotations>[]>([]);

  // Holds the latest range annotation labels, kept in sync by both the main
  // effect (initial render) and the range-repositioning handler (on pan/zoom).
  // The selection effect reads this ref so it can combine peak + range labels
  // in Plotly.relayout without wiping out any repositioning done by the user.
  const rangeAnnotationLabelsRef = useRef<Partial<Plotly.Annotations>[]>([]);

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

    // Build trace data
    const plotData: Plotly.Data[] = processedSeries.map((s, index) => {
      const traceColor = s.color || CHART_COLORS[index % CHART_COLORS.length];
      const extraContent = buildHoverExtraContent(s.name, s.metadata);

      const trace: Plotly.Data = {
        x: s.x,
        y: s.y,
        type: "scatter" as const,
        mode: showMarkers ? "lines+markers" as const : "lines" as const,
        name: s.name,
        line: {
          color: traceColor,
          width: CHROMATOGRAM_TRACE.BASE_LINE_WIDTH,
        },
        hovertemplate: `%{x:.2f} ${xAxisTitle}<br>%{y:.2f} ${yAxisTitle}<extra>${extraContent}</extra>`,
      };
      if (showMarkers) {
        trace.marker = { size: markerSize, color: traceColor };
      }
      return trace;
    });

    // Peak boundary markers
    if (boundaryMarkers !== "none") {
      const peaksWithData = collectPeaksWithBoundaryData(allDetectedPeaks, processedAnnotations, processedSeries);
      if (peaksWithData.length > 0) {
        plotData.push(...createBoundaryMarkerTraces(peaksWithData));
      }
    }

    // Invisible hit-area markers for click / hover on peaks.
    // hovertemplate "<extra></extra>" suppresses the tooltip entry while still
    // allowing plotly_click and plotly_hover to fire for these points.
    if (allPeaksForInteraction.length > 0) {
      const hitAreaTrace: Plotly.Data = {
        x: allPeaksForInteraction.map((p) => p.peak.x),
        y: allPeaksForInteraction.map((p) => p.peak.y),
        type: "scatter" as const,
        mode: "markers" as const,
        marker: { size: 14, opacity: 0 },
        hovertemplate: "<extra></extra>",
        showlegend: false,
        name: "",
        customdata: allPeaksForInteraction.map((p) => ({
          id: p.peak.id,
          peak: p.peak,
          seriesIndex: p.seriesIndex,
          seriesName: p.seriesName,
          isAutoDetected: p.isAutoDetected,
        })) as unknown as Plotly.Datum[],
      };
      plotData.push(hitAreaTrace);
    }

    // Range annotation shapes and labels
    const { shapes: rangeShapes, annotations: rangeAnnotationLabels, yDomainMax } =
      rangeAnnotations.length > 0
        ? buildRangeAnnotationElements(
            rangeAnnotations,
            rangeAnnotationOverlapThreshold,
            processedSeries
          )
        : { shapes: [], annotations: [], yDomainMax: 1.0 };

    // Store initial range labels so the selection effect can combine them
    rangeAnnotationLabelsRef.current = rangeAnnotationLabels;

    const layout: Partial<Plotly.Layout> = {
      title: title
        ? {
            text: title,
            font: { size: 20, family: "Inter, sans-serif", color: theme.textColor },
          }
        : undefined,
      width,
      height,
      margin: {
        l: CHROMATOGRAM_LAYOUT.MARGIN_LEFT,
        r: CHROMATOGRAM_LAYOUT.MARGIN_RIGHT,
        b: CHROMATOGRAM_LAYOUT.MARGIN_BOTTOM,
        t: title ? CHROMATOGRAM_LAYOUT.MARGIN_TOP_WITH_TITLE : CHROMATOGRAM_LAYOUT.MARGIN_TOP_NO_TITLE,
        pad: CHROMATOGRAM_LAYOUT.MARGIN_PAD,
      },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: { family: "Inter, sans-serif" },
      hovermode: showCrosshairs ? "x" as const : "x unified" as const,
      dragmode: "zoom" as const,
      xaxis: {
        title: {
          text: xAxisTitle,
          font: { size: 14, color: theme.textSecondary, family: "Inter, sans-serif" },
          standoff: 15,
        },
        showgrid: showGridX,
        gridcolor: theme.gridColor,
        linecolor: theme.lineColor,
        linewidth: 1,
        range: xRange,
        autorange: !xRange,
        zeroline: false,
        tickfont: { size: 12, color: theme.textColor, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: theme.spikeColor,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          font: { size: 14, color: theme.textSecondary, family: "Inter, sans-serif" },
          standoff: 10,
        },
        showgrid: showGridY,
        gridcolor: theme.gridColor,
        linecolor: theme.lineColor,
        linewidth: 1,
        range: yRange,
        autorange: !yRange,
        domain: [0, yDomainMax] as [number, number],
        zeroline: false,
        tickfont: { size: 12, color: theme.textColor, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: theme.spikeColor,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: "center" as const,
        yanchor: "top" as const,
        orientation: "h" as const,
        font: { size: 12, color: theme.textColor, family: "Inter, sans-serif" },
      },
      showlegend: showLegend && series.length > 1,
      annotations: [...peakAnnotationsRef.current, ...rangeAnnotationLabels],
      shapes: rangeShapes,
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: [
        "lasso2d",
        "select2d",
        ...(showExportButton ? [] : ["toImage"] as Plotly.ModeBarDefaultButtons[]),
      ] as Plotly.ModeBarDefaultButtons[],
      ...(showExportButton && {
        toImageButtonOptions: {
          format: "png",
          filename: "chromatogram",
          width,
          height,
        },
      }),
    };

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

    // ── Range annotation label repositioning on pan / zoom ─────────────────
    // Deferred via requestAnimationFrame to avoid re-entering Plotly's own RAF
    // rendering pass. isAnnotationRelayout guards against feedback loops.
    let pendingLabelUpdate: ReturnType<typeof requestAnimationFrame> | null = null;

    if (rangeAnnotations.length > 0) {
      (currentRef as unknown as Plotly.PlotlyHTMLElement).on(
        "plotly_relayout",
        (eventData: Plotly.PlotRelayoutEvent) => {
          const ed = eventData as Record<string, unknown>;
          if (isAnnotationRelayout.current) return;

          const isXAxisChange =
            "xaxis.range[0]" in ed ||
            ("xaxis.range" in ed && Array.isArray(ed["xaxis.range"])) ||
            ed["xaxis.autorange"] === true;
          if (!isXAxisChange) return;

          const isAutorange = ed["xaxis.autorange"] === true;
          const xMin = isAutorange
            ? null
            : "xaxis.range[0]" in ed
              ? (ed["xaxis.range[0]"] as number)
              : (ed["xaxis.range"] as [number, number])[0];
          const xMax = isAutorange
            ? null
            : "xaxis.range[0]" in ed
              ? (ed["xaxis.range[1]"] as number)
              : (ed["xaxis.range"] as [number, number])[1];

          if (pendingLabelUpdate !== null) cancelAnimationFrame(pendingLabelUpdate);

          pendingLabelUpdate = requestAnimationFrame(() => {
            pendingLabelUpdate = null;
            if (!currentRef) return;

            const updatedRangeLabels = (() => {
              if (isAutorange || xMin === null || xMax === null) {
                return rangeAnnotationLabels;
              }
              return rangeAnnotationLabels.map((labelAnn, i) => {
                const rangeAnn = rangeAnnotations[i];
                if (!rangeAnn) return labelAnn;
                const visibleStart = Math.max(rangeAnn.startX, xMin);
                const visibleEnd = Math.min(rangeAnn.endX, xMax);
                if (visibleStart >= visibleEnd) {
                  return { ...labelAnn, visible: false, x: (xMin + xMax) / 2 };
                }
                return { ...labelAnn, x: (visibleStart + visibleEnd) / 2, visible: true };
              });
            })();

            isAnnotationRelayout.current = true;
            (Plotly.relayout(currentRef, {
              annotations: [...peakAnnotationsRef.current, ...updatedRangeLabels],
            } as unknown as Partial<Plotly.Layout>) as unknown as Promise<unknown>)
              .finally(() => {
                // Keep rangeAnnotationLabelsRef in sync with the repositioned labels
                // so the selection effect can use them correctly.
                rangeAnnotationLabelsRef.current = updatedRangeLabels;
                isAnnotationRelayout.current = false;
              });
          });
        }
      );
    }

    return () => {
      if (pendingLabelUpdate !== null) cancelAnimationFrame(pendingLabelUpdate);
      isAnnotationRelayout.current = false;
      thickenedSeriesRef.current = null;
      if (currentRef) Plotly.purge(currentRef);
    };
  }, [
    processedSeries, allDetectedPeaks, allPeaksForInteraction, series.length,
    width, height, title, xAxisTitle, yAxisTitle,
    processedAnnotations, xRange, yRange, showLegend, showGridX, showGridY,
    showMarkers, markerSize, showCrosshairs, enablePeakDetection, peakDetectionOptions,
    showPeakAreas, boundaryMarkers, annotationOverlapThreshold, showExportButton,
    theme, rangeAnnotations, rangeAnnotationOverlapThreshold,
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
      annotations: [...peakAnnotations, ...rangeAnnotationLabelsRef.current],
    } as unknown as Partial<Plotly.Layout>);
  }, [peakAnnotations]);

  return (
    <div className="chromatogram-chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ChromatogramChart };
