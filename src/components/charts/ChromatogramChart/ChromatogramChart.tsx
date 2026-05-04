import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef } from "react";

import { CHART_COLORS } from "../../../utils/colors";


import {
  groupOverlappingPeaks,
  createGroupAnnotations,
} from "./annotations";
import { createBoundaryMarkerTraces } from "./boundaryMarkers";
import { CHROMATOGRAM_LAYOUT } from "./constants";
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
}) => {
  // Derive peak detection state from options
  const enablePeakDetection = peakDetectionOptions !== undefined;
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  // Prevents the plotly_relayout fired by our own annotation update from
  // being treated as a user-initiated zoom and triggering another update cycle.
  const isAnnotationRelayout = useRef(false);

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
    // Use first series data for index lookup (user annotations apply to first series)
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

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef || series.length === 0) return;

    // Build trace data with auto-assigned colors
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
          width: 1.5,
        },
        hovertemplate: `%{x:.2f} ${xAxisTitle}<br>%{y:.2f} ${yAxisTitle}<extra>${extraContent}</extra>`,
      };
      if (showMarkers) {
        trace.marker = {
          size: markerSize,
          color: traceColor,
        };
      }
      return trace;
    });

    // Add peak boundary markers if enabled
    if (boundaryMarkers !== "none") {
      const peaksWithData = collectPeaksWithBoundaryData(allDetectedPeaks, processedAnnotations, processedSeries);
      if (peaksWithData.length > 0) {
        const boundaryTraces = createBoundaryMarkerTraces(peaksWithData);
        plotData.push(...boundaryTraces);
      }
    }

    // Collect all peaks for unified staggering logic
    const allPeaksWithMeta: PeakWithMeta[] = [];

    // Add user-defined annotations (seriesIndex -1 indicates user-defined)
    processedAnnotations.forEach((ann) => {
      allPeaksWithMeta.push({ peak: ann, seriesIndex: -1 });
    });

    // Add auto-detected peaks if enabled
    if (showPeakAreas && enablePeakDetection) {
      allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
        peaks.forEach((peak) => {
          allPeaksWithMeta.push({ peak, seriesIndex });
        });
      });
    }

    // Group all overlapping peaks and create annotations with staggering
    const groups = groupOverlappingPeaks(allPeaksWithMeta, annotationOverlapThreshold);
    const plotlyAnnotations: Partial<Plotly.Annotations>[] = [];

    for (const group of groups) {
      plotlyAnnotations.push(...createGroupAnnotations(group));
    }

    // Build range annotation shapes and labels.
    // yDomainMax shrinks the y-axis domain so "top" bars live in the blank zone above it.
    const { shapes: rangeShapes, annotations: rangeAnnotationLabels, yDomainMax } =
      rangeAnnotations.length > 0
        ? buildRangeAnnotationElements(
            rangeAnnotations,
            rangeAnnotationOverlapThreshold,
            processedSeries
          )
        : { shapes: [], annotations: [], yDomainMax: 1.0 };

    const layout: Partial<Plotly.Layout> = {
      title: title
        ? {
            text: title,
            font: {
              size: 20,
              family: "Inter, sans-serif",
              color: theme.textColor,
            },
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
      annotations: [...plotlyAnnotations, ...rangeAnnotationLabels],
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
          width: width,
          height: height,
        },
      }),
    };

    Plotly.newPlot(currentRef, plotData, layout, config);

    // Keep range annotation labels centred within the visible portion of their bars
    // when the user zooms or pans. Without repositioning, labels whose original x
    // (bar centre) is outside the current viewport float off-screen while the coloured
    // bar remains visible.
    //
    // We defer the relayout to requestAnimationFrame so it fires *after* Plotly has
    // finished its own RAF-based rendering pass. Calling Plotly.relayout synchronously
    // inside plotly_relayout re-enters Plotly's pipeline and blanks the chart.
    // isAnnotationRelayout guards against the annotation relayout itself firing another
    // round-trip through this handler.
    let pendingLabelUpdate: ReturnType<typeof requestAnimationFrame> | null = null;

    if (rangeAnnotations.length > 0) {
      (currentRef as unknown as Plotly.PlotlyHTMLElement).on(
        "plotly_relayout",
        (eventData: Plotly.PlotRelayoutEvent) => {
          const ed = eventData as Record<string, unknown>;

          // Skip events caused by our own annotation update to prevent feedback loops.
          if (isAnnotationRelayout.current) return;

          // Ignore relayout events that aren't x-axis range changes
          // (e.g. y-axis-only changes from the zoom-in/out buttons).
          const isXAxisChange =
            "xaxis.range[0]" in ed ||
            ("xaxis.range" in ed && Array.isArray(ed["xaxis.range"])) ||
            ed["xaxis.autorange"] === true;
          if (!isXAxisChange) return;

          // Capture values synchronously before the RAF fires.
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
            const el = currentRef;
            if (!el) return;

            const nextAnnotations = (() => {
              if (isAutorange || xMin === null || xMax === null) {
                return [...plotlyAnnotations, ...rangeAnnotationLabels];
              }

              const updatedLabels = rangeAnnotationLabels.map((labelAnn, i) => {
                const rangeAnn = rangeAnnotations[i];
                if (!rangeAnn) return labelAnn;

                const visibleStart = Math.max(rangeAnn.startX, xMin);
                const visibleEnd = Math.min(rangeAnn.endX, xMax);

                if (visibleStart >= visibleEnd) {
                  // Bar is fully outside the viewport — hide the label but keep x
                  // within the current range so Plotly cannot use it to expand the axis.
                  return { ...labelAnn, visible: false, x: (xMin + xMax) / 2 };
                }

                return {
                  ...labelAnn,
                  x: (visibleStart + visibleEnd) / 2,
                  visible: true,
                };
              });

              return [...plotlyAnnotations, ...updatedLabels];
            })();

            isAnnotationRelayout.current = true;
            (Plotly.relayout(el, {
              annotations: nextAnnotations,
            } as unknown as Partial<Plotly.Layout>) as unknown as Promise<unknown>)
              .finally(() => {
                isAnnotationRelayout.current = false;
              });
          });
        }
      );
    }

    return () => {
      if (pendingLabelUpdate !== null) cancelAnimationFrame(pendingLabelUpdate);
      isAnnotationRelayout.current = false;
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    processedSeries, allDetectedPeaks, series.length, width, height, title, xAxisTitle, yAxisTitle,
    processedAnnotations, xRange, yRange, showLegend, showGridX, showGridY, showMarkers, markerSize,
    showCrosshairs, enablePeakDetection, peakDetectionOptions, showPeakAreas, boundaryMarkers,
    annotationOverlapThreshold, showExportButton, theme, rangeAnnotations, rangeAnnotationOverlapThreshold,
  ]);

  return (
    <div className="chromatogram-chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ChromatogramChart };

