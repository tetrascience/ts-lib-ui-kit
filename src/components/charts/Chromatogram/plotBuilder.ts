import { CHART_COLORS } from "../../../utils/colors";
import { getLoadedPlotly } from "../plotly-loader";

import { createBoundaryMarkerTraces } from "./boundaryMarkers";
import { CHROMATOGRAM_LAYOUT, CHROMATOGRAM_TRACE } from "./constants";
import { buildHoverExtraContent, collectPeaksWithBoundaryData } from "./dataProcessing";
import { createRegionOverlayTraces } from "./regionOverlays";

import type { ChromatogramSeries, PeakAnnotation, BoundaryMarkerStyle, PeakSelectEvent } from "./types";
import type { ChartTooltipHoverPoint } from "../ChartTooltip";
import type Plotly from "plotly.js-dist";

import { CHART_FONT_FAMILY, type PlotlyThemeColors } from "@/hooks/use-plotly-theme";

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
    boundaryMarkers,
  } = params;

  const plotData: Plotly.Data[] = processedSeries.map((s, index) => {
    const traceColor = s.color || CHART_COLORS[index % CHART_COLORS.length];

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
      // Hover is rendered by the shared ChartTooltip (bound in Chromatogram);
      // "none" keeps plotly_hover firing without also drawing Plotly's own
      // label on top of it (SW-2298).
      hoverinfo: "none" as const,
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
      // Peak hoverText reaches the shared ChartTooltip through customdata
      // (see buildChromatogramTooltipLines), not Plotly's native label.
      hoverinfo: "none" as const,
    };
    plotData.push(hitAreaTrace);
  }

  return plotData;
}

type ChromatogramTooltipPoint = ChartTooltipHoverPoint & { curveNumber?: number };

type ChromatogramTooltipParams = {
  series: ChromatogramSeries[];
  xAxisTitle: string;
};

const formatTooltipNumber = (value: number | string): string =>
  typeof value === "number" ? value.toFixed(2) : String(value);

const splitHtmlLines = (text: string | undefined): string[] =>
  text ? text.split("<br>").filter(Boolean) : [];

/** "<name>: <y>" followed by the series metadata lines */
function seriesTooltipLines(seriesEntry: ChromatogramSeries, y: number | string): string[] {
  // buildHoverExtraContent yields "<name><br>Key: value…"; keep only the metadata
  const metadata = buildHoverExtraContent(seriesEntry.name, seriesEntry.metadata).split("<br>").slice(1);
  return [`${seriesEntry.name}: ${formatTooltipNumber(y)}`, ...metadata];
}

/** Peak text for a hit-area point (customdata) or a region overlay (trace text) */
function peakTooltipLines(point: ChromatogramTooltipPoint): string[] {
  const peak = (point.customdata as { peak?: PeakAnnotation } | null | undefined)?.peak;
  if (peak) return splitHtmlLines(peak.hoverText ?? peak.text);
  return typeof point.text === "string" ? splitHtmlLines(point.text) : [];
}

/**
 * Lines for the shared ChartTooltip: the shared x value, one line per hovered
 * series (plus its metadata), then any peak text/hoverText the cursor is on —
 * peaks arrive as the invisible hit-area trace's customdata, overlays carry
 * their text on the trace.
 */
export function buildChromatogramTooltipLines(
  points: ChromatogramTooltipPoint[],
  params: ChromatogramTooltipParams
): string[] {
  const { series, xAxisTitle } = params;
  const lines: string[] = [];
  const first = points.find((p) => p.x !== undefined);
  if (first?.x !== undefined) lines.push(`${xAxisTitle}: ${formatTooltipNumber(first.x)}`);

  for (const point of points) {
    const seriesEntry = point.curveNumber === undefined ? undefined : series[point.curveNumber];
    if (seriesEntry) {
      if (point.y !== undefined) lines.push(...seriesTooltipLines(seriesEntry, point.y));
    } else {
      lines.push(...peakTooltipLines(point));
    }
  }
  return lines;
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
          font: { size: titleFontSize, family: CHART_FONT_FAMILY, color: theme.textColor },
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
    font: { family: CHART_FONT_FAMILY },
    hovermode: showCrosshairs ? ("x" as const) : ("x unified" as const),
    dragmode: "zoom" as const,
    xaxis: {
      title: {
        text: xAxisTitle,
        font: { size: 14, color: theme.textSecondary, family: CHART_FONT_FAMILY },
        standoff: 15,
      },
      showgrid: showGridX,
      gridcolor: theme.gridColor,
      linecolor: theme.lineColor,
      linewidth: 1,
      range: xRange,
      autorange: !xRange,
      zeroline: false,
      tickfont: { size: 12, color: theme.textColor, family: CHART_FONT_FAMILY },
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
        font: { size: 14, color: theme.textSecondary, family: CHART_FONT_FAMILY },
        standoff: 10,
      },
      showgrid: showGridY,
      gridcolor: theme.gridColor,
      linecolor: theme.lineColor,
      linewidth: 1,
      range: yRange,
      autorange: !yRange,
      zeroline: false,
      tickfont: { size: 12, color: theme.textColor, family: CHART_FONT_FAMILY },
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
      font: { size: 12, color: theme.textColor, family: CHART_FONT_FAMILY },
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
        // Hover events can only fire once the plot is drawn, so the
        // lazily-loaded Plotly module is guaranteed to be available here.
        if (thickenedSeriesRef.current !== null) {
          getLoadedPlotly().restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
        }
        getLoadedPlotly().restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH * hoverLineWidthMultiplier } as Plotly.Data, [targetIdx]);
        thickenedSeriesRef.current = targetIdx;
      }
    }
    const peakPoint = eventData.points.find((p) => p.customdata != null);
    if (peakPoint) {
      onPeakHoverRef.current?.(peakPoint.customdata as unknown as PeakSelectEvent);
    }
  };
}

export function createClickHandler(
  onPeakClickRef: MutableRef<((event: PeakSelectEvent) => void) | undefined>
): (eventData: Plotly.PlotMouseEvent) => void {
  return (eventData) => {
    if (!onPeakClickRef.current) return;
    const peakPoint = eventData.points.find((p) => p.customdata != null);
    if (!peakPoint) return;
    onPeakClickRef.current(peakPoint.customdata as unknown as PeakSelectEvent);
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
      // Unhover events can only fire once the plot is drawn, so the
      // lazily-loaded Plotly module is guaranteed to be available here.
      getLoadedPlotly().restyle(domElement, { "line.width": CHROMATOGRAM_TRACE.BASE_LINE_WIDTH } as Plotly.Data, [thickenedSeriesRef.current]);
      thickenedSeriesRef.current = null;
    }
  };
}
