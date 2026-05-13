import Plotly from "plotly.js-dist";

import { CHART_COLORS } from "../../../utils/colors";

import { createBoundaryMarkerTraces } from "./boundaryMarkers";
import { CHROMATOGRAM_LAYOUT, CHROMATOGRAM_TRACE } from "./constants";
import { buildHoverExtraContent, collectPeaksWithBoundaryData } from "./dataProcessing";
import { createRegionOverlayTraces } from "./regionOverlays";

import type { ChromatogramSeries, PeakAnnotation, BoundaryMarkerStyle, PeakSelectEvent } from "./types";
import type { PlotlyThemeColors } from "@/hooks/use-plotly-theme";

type PeakForInteraction = {
  peak: PeakAnnotation & { id: string };
  seriesIndex: number;
  seriesName: string;
  isAutoDetected: boolean;
};

type BuildTraceDataParams = {
  processedSeries: ChromatogramSeries[];
  processedAnnotations: PeakAnnotation[];
  allDetectedPeaks: { peaks: PeakAnnotation[]; seriesIndex: number }[];
  allPeaksForInteraction: PeakForInteraction[];
  showMarkers: boolean;
  markerSize: number;
  xAxisTitle: string;
  yAxisTitle: string;
  boundaryMarkers: BoundaryMarkerStyle;
};

type BuildLayoutParams = {
  title?: string;
  titleFontSize: number;
  titleTopMargin?: number;
  width: number;
  height: number;
  xAxisTitle: string;
  yAxisTitle: string;
  xRange?: [number, number];
  yRange?: [number, number];
  showLegend: boolean;
  seriesCount: number;
  showGridX: boolean;
  showGridY: boolean;
  showCrosshairs: boolean;
  theme: PlotlyThemeColors;
  peakAnnotations: Partial<Plotly.Annotations>[];
};

type BuildConfigParams = {
  showExportButton: boolean;
  width: number;
  height: number;
};

export type { PeakForInteraction, BuildTraceDataParams, BuildLayoutParams, BuildConfigParams };

export function buildTraceData(params: BuildTraceDataParams): Plotly.Data[] {
  const {
    processedSeries,
    processedAnnotations,
    allDetectedPeaks,
    allPeaksForInteraction,
    showMarkers,
    markerSize,
    xAxisTitle,
    yAxisTitle,
    boundaryMarkers,
  } = params;

  const plotData: Plotly.Data[] = processedSeries.map((s, index) => {
    const traceColor = s.color || CHART_COLORS[index % CHART_COLORS.length];
    const extraContent = buildHoverExtraContent(s.name, s.metadata);

    const trace: Plotly.Data = {
      x: s.x,
      y: s.y,
      type: "scatter" as const,
      mode: showMarkers ? ("lines+markers" as const) : ("lines" as const),
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

  if (boundaryMarkers !== "none") {
    const peaksWithData = collectPeaksWithBoundaryData(
      allDetectedPeaks,
      processedAnnotations,
      processedSeries
    );
    if (peaksWithData.length > 0) {
      plotData.push(...createBoundaryMarkerTraces(peaksWithData));
    }
  }

  processedAnnotations.forEach((ann) => {
    if (ann.regionOverlay && processedSeries[0]) {
      plotData.push(...createRegionOverlayTraces([ann], 0, processedSeries[0]));
    }
  });
  allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
    if (peaks.some((p) => p.regionOverlay) && processedSeries[seriesIndex]) {
      plotData.push(...createRegionOverlayTraces(peaks, seriesIndex, processedSeries[seriesIndex]));
    }
  });

  if (allPeaksForInteraction.length > 0) {
    const anyHoverText = allPeaksForInteraction.some((p) => p.peak.hoverText);
    const hitAreaTrace: Plotly.Data = {
      x: allPeaksForInteraction.map((p) => p.peak.x),
      y: allPeaksForInteraction.map((p) => p.peak.y),
      type: "scatter" as const,
      mode: "markers" as const,
      marker: { size: 14, opacity: 0 },
      showlegend: false,
      name: "",
      customdata: allPeaksForInteraction.map((p) => ({
        id: p.peak.id,
        peak: p.peak,
        seriesIndex: p.seriesIndex,
        seriesName: p.seriesName,
        isAutoDetected: p.isAutoDetected,
      })) as unknown as Plotly.Datum[],
      ...(anyHoverText
        ? {
            hovertemplate: allPeaksForInteraction.map((p) =>
              p.peak.hoverText ? `${p.peak.hoverText}<extra></extra>` : "<extra></extra>"
            ),
          }
        : { hovertemplate: "<extra></extra>" }),
    };
    plotData.push(hitAreaTrace);
  }

  return plotData;
}

export function buildLayout(params: BuildLayoutParams): Partial<Plotly.Layout> {
  const {
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
    seriesCount,
    showGridX,
    showGridY,
    showCrosshairs,
    theme,
    peakAnnotations,
  } = params;

  return {
    title: title
      ? {
          text: title,
          font: { size: titleFontSize, family: "Inter, sans-serif", color: theme.textColor },
        }
      : undefined,
    width,
    height,
    margin: {
      l: CHROMATOGRAM_LAYOUT.MARGIN_LEFT,
      r: CHROMATOGRAM_LAYOUT.MARGIN_RIGHT,
      b: CHROMATOGRAM_LAYOUT.MARGIN_BOTTOM,
      t: title
        ? (titleTopMargin ?? CHROMATOGRAM_LAYOUT.MARGIN_TOP_WITH_TITLE)
        : CHROMATOGRAM_LAYOUT.MARGIN_TOP_NO_TITLE,
      pad: CHROMATOGRAM_LAYOUT.MARGIN_PAD,
    },
    paper_bgcolor: theme.paperBg,
    plot_bgcolor: theme.plotBg,
    font: { family: "Inter, sans-serif" },
    hovermode: showCrosshairs ? ("x" as const) : ("x unified" as const),
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
    showlegend: showLegend && seriesCount > 1,
    annotations: peakAnnotations,
  };
}

export function buildConfig(params: BuildConfigParams): Partial<Plotly.Config> {
  const { showExportButton, width, height } = params;
  return {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "lasso2d",
      "select2d",
      ...(showExportButton ? [] : (["toImage"] as Plotly.ModeBarDefaultButtons[])),
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
}

type MutableRef<T> = { current: T };

export function createHoverHandler(
  domElement: HTMLElement,
  processedSeriesLength: number,
  thickenedSeriesRef: MutableRef<number | null>,
  onPeakHoverRef: MutableRef<((event: PeakSelectEvent | null) => void) | undefined>,
  hoverLineWidthMultiplier: number
): (eventData: Plotly.PlotHoverEvent) => void {
  return (eventData) => {
    const pt = eventData.points[0];
    if (pt && pt.curveNumber < processedSeriesLength) {
      const targetIdx = pt.curveNumber;
      if (thickenedSeriesRef.current !== targetIdx) {
        if (thickenedSeriesRef.current !== null) {
          Plotly.restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
        }
        Plotly.restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH * hoverLineWidthMultiplier } as Plotly.Data, [targetIdx]);
        thickenedSeriesRef.current = targetIdx;
      }
    }
    const peakPoint = eventData.points.find((p) => p.customdata != null);
    if (peakPoint) {
      onPeakHoverRef.current?.(peakPoint.customdata as unknown as PeakSelectEvent);
    }
  };
}

export function createUnhoverHandler(
  domElement: HTMLElement,
  thickenedSeriesRef: MutableRef<number | null>,
  onPeakHoverRef: MutableRef<((event: PeakSelectEvent | null) => void) | undefined>
): () => void {
  return () => {
    onPeakHoverRef.current?.(null);
    if (thickenedSeriesRef.current !== null) {
      Plotly.restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
      thickenedSeriesRef.current = null;
    }
  };
}
