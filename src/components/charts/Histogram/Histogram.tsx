import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { CHART_FONT_FAMILY, usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/utils/colors";
import "./Histogram.scss";

/** Exponent coefficient for normal distribution calculation */
const NORMAL_DISTRIBUTION_EXPONENT_COEFF = -0.5;

interface HistogramDataSeries {
  x: number[];
  name: string;
  color?: string;
  autobinx?: boolean;
  xbins?: {
    start: number;
    end: number;
    size: number;
  };
  opacity?: number;
  showDistributionLine?: boolean;
  lineWidth?: number;
}

type HistogramProps = {
  dataSeries: HistogramDataSeries | HistogramDataSeries[];
  /**
   * Fixed width in pixels. When omitted, the chart fills its container and
   * tracks the container's width via a `ResizeObserver`.
   */
  width?: number;
  /**
   * Fixed height in pixels. When omitted, the chart fills its container and
   * tracks the container's height via a `ResizeObserver`.
   */
  height?: number;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  bargap?: number;
  showDistributionLine?: boolean;
};

const calculateMean = (data: number[]): number => {
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

const calculateStdDev = (data: number[], mean: number): number => {
  const squaredDiffs = data.map((value) => Math.pow(value - mean, 2));
  const variance =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length;
  return Math.sqrt(variance);
};

const generateNormalDistributionPoints = (
  mean: number,
  stdDev: number,
  start: number,
  end: number,
  points = 100
): { x: number[]; y: number[] } => {
  const xValues: number[] = [];
  const yValues: number[] = [];

  const step = (end - start) / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = start + i * step;
    xValues.push(x);

    const exponent = NORMAL_DISTRIBUTION_EXPONENT_COEFF * Math.pow((x - mean) / stdDev, 2);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    yValues.push(y);
  }

  return { x: xValues, y: yValues };
};

const scaleDistributionCurve = (
  yValues: number[],
  histogramData: number[],
  bins: { start: number; end: number; size: number }
): number[] => {
  const binCount = Math.ceil((bins.end - bins.start) / bins.size);
  const binFrequencies = Array(binCount).fill(0);

  histogramData.forEach((value) => {
    if (value >= bins.start && value <= bins.end) {
      const binIndex = Math.floor((value - bins.start) / bins.size);
      binFrequencies[binIndex]++;
    }
  });

  const maxBinFrequency = Math.max(...binFrequencies);
  const maxCurveValue = Math.max(...yValues);

  const scaleFactor = maxBinFrequency / maxCurveValue;

  return yValues.map((y) => y * scaleFactor);
};

const Histogram: React.FC<HistogramProps> = ({
  dataSeries,
  width,
  height,
  title = "Histogram",
  xTitle = "X Axis",
  yTitle = "Frequency",
  bargap = 0.2,
  showDistributionLine = false,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel: xTitle, yLabel: yTitle });

  // Omitted width/height → fill the container and track its measured size;
  // explicit pixel values override. Histogram has its own HTML title + legend,
  // so we measure a wrapper around just the Plotly canvas. See AreaPlot for
  // the reference pattern.
  const [plotAreaRef, measured] = useElementSize<HTMLDivElement>();
  const resolvedWidth = width ?? measured.width;
  const resolvedHeight = height ?? measured.height;
  const hasSize = resolvedWidth > 0 && resolvedHeight > 0;
  // Fill is per-dimension: omit width to fill the container width, omit height
  // to fill its height (so e.g. a fixed width with a container-driven height works).
  const fillWidth = width === undefined;
  const fillHeight = height === undefined;
  const sizeRef = useRef({ width: resolvedWidth, height: resolvedHeight });
  sizeRef.current = { width: resolvedWidth, height: resolvedHeight };
  const plotInitedRef = useRef(false);
  // Size last applied to the plot, so the resize effect can skip a redundant
  // relayout right after newPlot already drew at that size.
  const appliedSizeRef = useRef({ width: 0, height: 0 });
  const seriesArray = useMemo(
    () => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]),
    [dataSeries],
  );
  const effectiveBarMode = useMemo<
    "stack" | "group" | "overlay" | "relative" | undefined
  >(() => (seriesArray.length > 1 ? "stack" : undefined), [seriesArray.length]);

  const defaultColors = CHART_COLORS;

  const seriesWithColors = useMemo(() => {
    return seriesArray.map((series, index) => {
      const hasDistributionLine =
        typeof series.showDistributionLine === "undefined"
          ? showDistributionLine
          : series.showDistributionLine;

      return {
        ...series,
        color: series.color || defaultColors[index % defaultColors.length],
        opacity: hasDistributionLine ? 0.5 : series.opacity || 1,
        showDistributionLine: hasDistributionLine,
        lineWidth: series.lineWidth || 3,
      };
    });
  }, [seriesArray, showDistributionLine, defaultColors]);

  const gridColor = theme.gridColor;

  const histogramData = useMemo(
    () =>
      seriesWithColors.map((series) => ({
        type: "histogram" as const,
        x: series.x,
        name: series.name,
        marker: {
          color: series.color,
          line: {
            color: theme.paperBg,
            width: 1,
          },
          opacity: series.opacity,
        },
        autobinx: series.autobinx,
        xbins: series.xbins,
        hoverinfo: "none" as const,
      })),
    [seriesWithColors, theme],
  );

  const distributionLines = useMemo(
    () =>
      seriesWithColors
        .filter((series) => series.showDistributionLine)
        .map((series) => {
          const mean = calculateMean(series.x);
          const stdDev = calculateStdDev(series.x, mean);

          const min = Math.min(...series.x);
          const max = Math.max(...series.x);
          const range = max - min;
          const start = min - range * 0.1;
          const end = max + range * 0.1;

          const bins = series.xbins || {
            start: start,
            end: end,
            size: range / 10,
          };

          const curvePoints = generateNormalDistributionPoints(
            mean,
            stdDev,
            start,
            end,
            100,
          );

          const scaledYValues = scaleDistributionCurve(
            curvePoints.y,
            series.x,
            bins,
          );

          return {
            type: "scatter" as const,
            x: curvePoints.x,
            y: scaledYValues,
            mode: "lines" as const,
            name: `${series.name} Distribution`,
            line: {
              color: series.color,
              width: series.lineWidth,
            },
            hoverinfo: "none" as const,
          };
        }),
    [seriesWithColors],
  );

  const plotData = useMemo(
    () => [...histogramData, ...distributionLines],
    [histogramData, distributionLines],
  );

  useEffect(() => {
    if (!plotRef.current || !hasSize) return;

    const layout = {
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      font: {
        family: CHART_FONT_FAMILY,
      },
      showlegend: false,
      margin: { l: 90, r: 40, b: 80, t: 40 },
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: CHART_FONT_FAMILY,
            weight: 400,
          },
          standoff: 20,
        },
        gridcolor: gridColor,
        tickcolor: theme.tickColor,
        ticklen: 8,
        tickwidth: 1,
        ticks: "outside" as const,
        linecolor: theme.lineColor,
        linewidth: 1,
        zeroline: false,
        automargin: true,
      },
      yaxis: {
        title: {
          text: yTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: CHART_FONT_FAMILY,
            weight: 400,
          },
          standoff: 20,
        },
        gridcolor: gridColor,
        tickcolor: theme.tickColor,
        ticklen: 8,
        tickwidth: 1,
        ticks: "outside" as const,
        linecolor: theme.lineColor,
        linewidth: 1,
        zeroline: false,
        rangemode: "tozero" as const,
        automargin: true,
      },
      barmode: effectiveBarMode,
      bargap: bargap,
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
    };

    const config = {
      // Sizing is driven from the measured container; disable Plotly's own
      // window-resize responsiveness (it can't see container resizes).
      responsive: false,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, plotData, layout, config);
    bindTooltip(plotRef.current);

    // Capture ref value for cleanup
    const plotElement = plotRef.current;
    plotInitedRef.current = true;
    appliedSizeRef.current = { ...sizeRef.current };

    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
        plotInitedRef.current = false;
      }
    };
  }, [hasSize, xTitle, yTitle, bargap, plotData, effectiveBarMode, gridColor, theme, bindTooltip]);

  // Resize in place when the measured/overridden size changes — cheaper than
  // recreating the plot, and it preserves tooltip/event bindings.
  useEffect(() => {
    const plotElement = plotRef.current;
    if (!plotElement || !plotInitedRef.current || resolvedWidth <= 0 || resolvedHeight <= 0) {
      return;
    }
    // newPlot already drew at the current size; skip the redundant relayout
    // (it would queue an automargin redraw that can reject if we unmount first).
    if (
      appliedSizeRef.current.width === resolvedWidth &&
      appliedSizeRef.current.height === resolvedHeight
    ) {
      return;
    }
    appliedSizeRef.current = { width: resolvedWidth, height: resolvedHeight };
    // Swallow rejections from a relayout that races an unmount/purge.
    void Plotly.relayout(plotElement, { width: resolvedWidth, height: resolvedHeight }).catch(
      () => {},
    );
  }, [resolvedWidth, resolvedHeight]);

  const ChartLegend: React.FC<{
    series: Array<{ name: string; color: string }>;
  }> = ({ series }) => {
    const items = series.map((item, i) => (
      <React.Fragment key={item.name}>
        <div className="legend-item">
          <span className="color-box" style={{ background: item.color }} />
          {item.name}
          {i < series.length - 1 && <span className="divider" />}
        </div>
      </React.Fragment>
    ));

    const rows = [];
    const rowSize = 6;
    for (let i = 0; i < items.length; i += rowSize) {
      rows.push(
        <div className="legend-row" key={i}>
          {items.slice(i, i + rowSize)}
        </div>
      );
    }

    return <div className="legend-container">{rows}</div>;
  };

  return (
    <div
      className={cn("histogram-container relative", fillWidth && "w-full", fillHeight && "h-full")}
      style={width === undefined ? undefined : { width }}
    >
      <div className={cn("chart-container", fillHeight && "flex h-full flex-col")}>
        {title && (
          <div className="title-container">
            <h2 className="title">{title}</h2>
          </div>
        )}
        {/* Measured plot area — flexes to fill the space left by the title and
            legend in fill mode, so the Plotly canvas tracks it. */}
        <div ref={plotAreaRef} className={cn(fillHeight && "min-h-0 flex-1")}>
          <div
            ref={plotRef}
            style={{
              width: "100%",
              height: "100%",
              margin: "0",
            }}
          />
        </div>
        <ChartLegend series={seriesWithColors} />
      </div>
      {tooltipElement}
    </div>
  );
};

export { Histogram };
export type { HistogramDataSeries, HistogramProps };
