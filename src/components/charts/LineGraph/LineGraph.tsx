import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { seriesColor } from "@/utils/colors";

type MarkerSymbol =
  | "circle"
  | "circle-open"
  | "circle-dot"
  | "circle-open-dot"
  | "square"
  | "square-open"
  | "square-dot"
  | "square-open-dot"
  | "diamond"
  | "diamond-open"
  | "diamond-dot"
  | "diamond-open-dot"
  | "cross"
  | "cross-open"
  | "cross-dot"
  | "cross-open-dot"
  | "x"
  | "x-open"
  | "x-dot"
  | "x-open-dot"
  | "triangle-up"
  | "triangle-up-open"
  | "triangle-up-dot"
  | "triangle-up-open-dot"
  | "triangle-down"
  | "triangle-down-open"
  | "triangle-down-dot"
  | "triangle-down-open-dot"
  | "triangle-left"
  | "triangle-left-open"
  | "triangle-left-dot"
  | "triangle-left-open-dot"
  | "triangle-right"
  | "triangle-right-open"
  | "triangle-right-dot"
  | "triangle-right-open-dot"
  | "triangle-ne"
  | "triangle-ne-open"
  | "triangle-ne-dot"
  | "triangle-ne-open-dot"
  | "triangle-se"
  | "triangle-se-open"
  | "triangle-se-dot"
  | "triangle-se-open-dot"
  | "triangle-sw"
  | "triangle-sw-open"
  | "triangle-sw-dot"
  | "triangle-sw-open-dot"
  | "triangle-nw"
  | "triangle-nw-open"
  | "triangle-nw-dot"
  | "triangle-nw-open-dot"
  | "pentagon"
  | "pentagon-open"
  | "pentagon-dot"
  | "pentagon-open-dot"
  | "hexagon"
  | "hexagon-open"
  | "hexagon-dot"
  | "hexagon-open-dot"
  | "hexagon2"
  | "hexagon2-open"
  | "hexagon2-dot"
  | "hexagon2-open-dot"
  | "octagon"
  | "octagon-open"
  | "octagon-dot"
  | "octagon-open-dot"
  | "star"
  | "star-open"
  | "star-dot"
  | "star-open-dot"
  | "hexagram"
  | "hexagram-open"
  | "hexagram-dot"
  | "hexagram-open-dot"
  | "star-triangle-up"
  | "star-triangle-up-open"
  | "star-triangle-up-dot"
  | "star-triangle-up-open-dot"
  | "star-triangle-down"
  | "star-triangle-down-open"
  | "star-triangle-down-dot"
  | "star-triangle-down-open-dot"
  | "star-square"
  | "star-square-open"
  | "star-square-dot"
  | "star-square-open-dot"
  | "star-diamond"
  | "star-diamond-open"
  | "star-diamond-dot"
  | "star-diamond-open-dot"
  | "diamond-tall"
  | "diamond-tall-open"
  | "diamond-tall-dot"
  | "diamond-tall-open-dot"
  | "diamond-wide"
  | "diamond-wide-open"
  | "diamond-wide-dot"
  | "diamond-wide-open-dot"
  | "hourglass"
  | "hourglass-open"
  | "bowtie"
  | "bowtie-open"
  | "circle-cross"
  | "circle-cross-open"
  | "circle-x"
  | "circle-x-open"
  | "square-cross"
  | "square-cross-open"
  | "square-x"
  | "square-x-open"
  | "diamond-cross"
  | "diamond-cross-open"
  | "diamond-x"
  | "diamond-x-open"
  | "cross-thin"
  | "cross-thin-open"
  | "x-thin"
  | "x-thin-open"
  | "asterisk"
  | "asterisk-open"
  | "hash"
  | "hash-open"
  | "hash-dot"
  | "hash-open-dot"
  | "y-up"
  | "y-up-open"
  | "y-down"
  | "y-down-open"
  | "y-left"
  | "y-left-open"
  | "y-right"
  | "y-right-open"
  | "line-ew"
  | "line-ew-open"
  | "line-ns"
  | "line-ns-open"
  | "line-ne"
  | "line-ne-open"
  | "line-nw"
  | "line-nw-open"
  | "arrow"
  | "arrow-open"
  | "arrow-wide"
  | "arrow-wide-open";

interface LineDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  symbol?: MarkerSymbol;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type LineGraphVariant = "lines" | "lines+markers" | "lines+markers+error_bars";

/** Top margin reserving room for the 32px title; reduced when no title is set */
const TITLE_MARGIN_TOP = 60;
const NO_TITLE_MARGIN_TOP = 30;

type LineGraphProps = {
  dataSeries: LineDataSeries[];
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
  xRange?: [number, number];
  yRange?: [number, number];
  variant?: LineGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive line positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
};

const LineGraph: React.FC<LineGraphProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "lines",
  xTitle,
  yTitle,
  title,
  xTickText,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel: xTitle, yLabel: yTitle });

  // Omitted width/height → fill the container and track its measured size;
  // explicit pixel values override. See AreaGraph for the reference pattern.
  const [containerRef, measured] = useElementSize<HTMLDivElement>();
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

  const { yMin, yMax } = useMemo(() => {
    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    dataSeries.forEach((series) => {
      series.x.forEach((x) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      });
      series.y.forEach((y) => {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });

    const xPadding = (maxX - minX) * 0.1;
    const yPadding = (maxY - minY) * 0.1;

    return {
      xMin: minX - xPadding,
      xMax: maxX + xPadding,
      yMin: minY - yPadding,
      yMax: maxY + yPadding,
    };
  }, [dataSeries]);

  const effectiveYRange = useMemo(
    () => yRange || [yMin, yMax],
    [yRange, yMin, yMax],
  );

  const yTicks = useMemo(() => {
    const range = effectiveYRange[1] - effectiveYRange[0];
    let step = Math.pow(10, Math.floor(Math.log10(range)));

    if (range / step > 10) step = step * 2;
    if (range / step < 4) step = step / 2;

    const ticks = [];
    let current = Math.ceil(effectiveYRange[0] / step) * step;
    while (current <= effectiveYRange[1]) {
      ticks.push(current);
      current += step;
    }
    return ticks;
  }, [effectiveYRange]);

  const xTicks = useMemo(
    () => [...new Set(dataSeries.flatMap((s) => s.x))].sort((a, b) => a - b),
    [dataSeries],
  );

  // Only apply categorical labels when they align 1:1 with the tick positions;
  // a mismatch would silently mis-label ticks, so fall back to numeric ticks.
  const useCategoricalX = !!xTickText && xTickText.length === xTicks.length;

  const mode = useMemo((): "lines" | "lines+markers" => {
    switch (variant) {
      case "lines+markers":
      case "lines+markers+error_bars":
        return "lines+markers";
      default:
        return "lines";
    }
  }, [variant]);

  const tickOptions = useMemo(
    () => ({
      tickcolor: theme.tickColor,
      ticklen: 12,
      tickwidth: 1,
      ticks: "outside" as const,
      tickfont: {
        size: 16,
        color: theme.textColor,
        family: "Inter, sans-serif",
        weight: 400,
      },
      linecolor: theme.lineColor,
      linewidth: 1,
      position: 0,
      zeroline: false,
    }),
    [theme],
  );

  useEffect(() => {
    if (!plotRef.current || !hasSize) return;

    const plotData = dataSeries.map((series, index) => {
      const color = seriesColor(index, series.color);
      return {
        x: series.x,
        y: series.y,
        type: "scatter" as const,
        mode: mode,
        name: series.name,
        hoverinfo: "none" as const,
        line: {
          color,
          width: 1.5,
        },
        marker:
          variant === "lines"
            ? { opacity: 0 }
            : {
                color,
                size: 8,
                symbol: series.symbol || "triangle-up",
              },
        error_y:
          variant === "lines+markers+error_bars"
            ? series.error_y || {
                type: "data" as const,
                array: series.y.map(() => 10),
                visible: true,
                color,
                thickness: 1,
                width: 5,
              }
            : undefined,
      };
    });

    const layout = {
      ...(title
        ? {
            title: {
              text: title,
              font: {
                size: 32,
                family: "Inter, sans-serif",
                color: theme.textColor,
              },
            },
          }
        : {}),
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      margin: {
        l: 80,
        r: 30,
        // Reserve room for tick labels, the x-axis title, and the
        // container-anchored bottom legend stacked beneath them.
        b: 96,
        t: title ? TITLE_MARGIN_TOP : NO_TITLE_MARGIN_TOP,
        pad: 10,
      },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: {
        family: "Inter, sans-serif",
      },
      dragmode: false as const,
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 32,
        },
        gridcolor: theme.gridColor,
        range: xRange,
        autorange: !xRange,
        tickmode: "array" as const,
        tickvals: xTicks,
        ticktext: useCategoricalX ? xTickText : xTicks.map(String),
        showgrid: true,
        // Reserve space for tick labels + the axis title so the bottom legend
        // can't overlap them at small sizes (SW-2157).
        automargin: true,
        ...tickOptions,
      },
      yaxis: {
        title: {
          text: yTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 30,
        },
        gridcolor: theme.gridColor,
        range: yRange,
        autorange: !yRange,
        tickmode: "array" as const,
        tickvals: yTicks,
        showgrid: true,
        automargin: true,
        ...tickOptions,
      },
      legend: {
        // Anchor to the bottom of the container (not the plot area) so the
        // legend always clears the x-axis tick labels + title — a paper-relative
        // fractional offset collapses into the ticks at small heights (SW-2157).
        x: 0.5,
        y: 0,
        xanchor: "center" as const,
        yanchor: "bottom" as const,
        yref: "container" as const,
        orientation: "h" as const,
        font: {
          size: 16,
          color: theme.legendColor,
          family: "Inter, sans-serif",
          weight: 500,
        },
      },
      showlegend: true,
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
  }, [dataSeries, hasSize, xRange, yRange, xTitle, yTitle, title, mode, tickOptions, xTicks, yTicks, useCategoricalX, xTickText, effectiveYRange, variant, theme, bindTooltip]);

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

  return (
    <div ref={containerRef} className={cn("relative", fillWidth && "w-full", fillHeight && "h-full")}>
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { LineGraph };
export type { LineDataSeries, LineGraphVariant, LineGraphProps, MarkerSymbol };
