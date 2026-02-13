import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef } from "react";

import { COLORS, CHART_COLORS } from "../../../utils/colors";

import {
  groupOverlappingPeaks,
  createGroupAnnotations,
} from "./annotations";
import { createBoundaryMarkerTraces } from "./boundaryMarkers";
import { CHROMATOGRAM_ANNOTATION, CHROMATOGRAM_LAYOUT } from "./constants";
import {
  validateSeriesData,
  applyBaselineCorrection,
  buildHoverExtraContent,
  collectPeaksWithBoundaryData,
  processUserAnnotations,
} from "./dataProcessing";
import { detectPeaks } from "./peakDetection";

import type {
  ChromatogramSeries,
  PeakAnnotation,
  BaselineCorrectionMethod,
  BoundaryMarkerStyle,
  BoundaryMarkerType,
  PeakDetectionOptions,
  ChromatogramChartProps,
  PeakWithMeta,
} from "./types";
import "./ChromatogramChart.scss";

// Re-export types for external use
export type {
  ChromatogramSeries,
  PeakAnnotation,
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
  showExportButton = true,
}) => {
  // Derive peak detection state from options
  const enablePeakDetection = peakDetectionOptions !== undefined;
  const showPeakAreas = peakDetectionOptions?.showAreas ?? false;
  const plotRef = useRef<HTMLDivElement>(null);

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
    const boundaryMarkerStyle = peakDetectionOptions?.boundaryMarkers ?? "none";
    if (boundaryMarkerStyle !== "none") {
      const peaksWithData = collectPeaksWithBoundaryData(allDetectedPeaks, processedAnnotations, processedSeries);
      if (peaksWithData.length > 0) {
        const boundaryTraces = createBoundaryMarkerTraces(peaksWithData);
        plotData.push(...boundaryTraces);
      }
    }

    // Build Plotly annotations from peak annotations
    const plotlyAnnotations: Partial<Plotly.Annotations>[] = processedAnnotations.map((ann) => ({
      x: ann.x,
      y: ann.y,
      text: ann.text,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 1,
      arrowcolor: COLORS.GREY_500,
      ax: ann.ax ?? 0,
      ay: ann.ay ?? CHROMATOGRAM_ANNOTATION.DEFAULT_ARROW_OFFSET_Y,
      font: {
        size: 11,
        color: COLORS.BLACK_900,
        family: "Inter, sans-serif",
      },
      bgcolor: COLORS.WHITE,
      borderpad: 2,
    }));

    // Add peak area annotations if enabled
    if (showPeakAreas && enablePeakDetection) {
      // Collect all peaks with metadata
      const allPeaksWithMeta: PeakWithMeta[] = [];
      allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
        peaks.forEach((peak) => {
          allPeaksWithMeta.push({ peak, seriesIndex });
        });
      });

      // Group overlapping peaks and create annotations
      const overlapThreshold = peakDetectionOptions?.annotationOverlapThreshold ?? 0.4;
      const groups = groupOverlappingPeaks(allPeaksWithMeta, overlapThreshold);

      for (const group of groups) {
        plotlyAnnotations.push(...createGroupAnnotations(group));
      }
    }

    const layout: Partial<Plotly.Layout> = {
      title: title
        ? {
            text: title,
            font: {
              size: 20,
              family: "Inter, sans-serif",
              color: COLORS.BLACK_900,
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
      paper_bgcolor: COLORS.WHITE,
      plot_bgcolor: COLORS.WHITE,
      font: { family: "Inter, sans-serif" },
      hovermode: showCrosshairs ? "x" as const : "x unified" as const,
      dragmode: "zoom" as const,
      xaxis: {
        title: {
          text: xAxisTitle,
          font: { size: 14, color: COLORS.BLACK_600, family: "Inter, sans-serif" },
          standoff: 15,
        },
        showgrid: showGridX,
        gridcolor: COLORS.GREY_200,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        range: xRange,
        autorange: !xRange,
        zeroline: false,
        tickfont: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: COLORS.GREY_500,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          font: { size: 14, color: COLORS.BLACK_600, family: "Inter, sans-serif" },
          standoff: 10,
        },
        showgrid: showGridY,
        gridcolor: COLORS.GREY_200,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        range: yRange,
        autorange: !yRange,
        zeroline: false,
        tickfont: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
        showspikes: showCrosshairs,
        spikemode: "across" as const,
        spikesnap: "cursor" as const,
        spikecolor: COLORS.GREY_500,
        spikethickness: 1,
        spikedash: "dot" as const,
      },
      legend: {
        x: 0.5,
        y: -0.15,
        xanchor: "center" as const,
        yanchor: "top" as const,
        orientation: "h" as const,
        font: { size: 12, color: COLORS.BLACK_900, family: "Inter, sans-serif" },
      },
      showlegend: showLegend && series.length > 1,
      annotations: plotlyAnnotations,
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

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    processedSeries, allDetectedPeaks, series.length, width, height, title, xAxisTitle, yAxisTitle,
    processedAnnotations, xRange, yRange, showLegend, showGridX, showGridY, showMarkers, markerSize,
    showCrosshairs, enablePeakDetection, peakDetectionOptions, showPeakAreas, showExportButton,
  ]);

  return (
    <div className="chromatogram-chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ChromatogramChart };

