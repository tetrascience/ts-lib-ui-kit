import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/utils/colors";

type MarkerSymbol =
  | "circle"
  | "square"
  | "diamond"
  | "triangle-up"
  | "triangle-down"
  | "star";

interface DotPlotDataSeries {
  x: number[];
  y: number[];
  name: string;
  color?: string;
  symbol?: MarkerSymbol;
  size?: number;
}

type DotPlotVariant = "default" | "stacked";

type DotPlotProps = {
  dataSeries: DotPlotDataSeries | DotPlotDataSeries[];
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
  variant?: DotPlotVariant;
  markerSize?: number;
};

const DotPlot: React.FC<DotPlotProps> = ({
  dataSeries,
  width,
  height,
  title = "Dot Plot",
  xTitle,
  yTitle,
  variant = "default",
  markerSize = 8,
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
  const seriesArray = useMemo(
    () => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]),
    [dataSeries],
  );

  const defaultColors = CHART_COLORS;

  const defaultSymbols: MarkerSymbol[] = useMemo(
    () => [
      "circle",
      "square",
      "diamond",
      "triangle-up",
      "triangle-down",
      "star",
    ],
    [],
  );

  const seriesWithColors = useMemo(() => {
    return seriesArray.map((series, index) => {
      if (variant === "default") {
        // Default variant: all circles, use first color or series color
        return {
          ...series,
          color: series.color || defaultColors[0],
          symbol: "circle" as MarkerSymbol,
          size: series.size || markerSize,
        };
      } else {
        // Stacked variant: different symbols and colors for each series
        return {
          ...series,
          color: series.color || defaultColors[index % defaultColors.length],
          symbol:
            series.symbol || defaultSymbols[index % defaultSymbols.length],
          size: series.size || markerSize,
        };
      }
    });
  }, [seriesArray, variant, markerSize, defaultColors, defaultSymbols]);

  const gridColor = theme.gridColor;

  const plotData = useMemo(
    () =>
      seriesWithColors.map((series) => ({
        type: "scatter" as const,
        x: series.x,
        y: series.y,
        mode: "markers" as const,
        name: series.name,
        marker: {
          color: series.color,
          size: series.size,
          symbol: series.symbol,
          line: {
            color: theme.paperBg,
            width: 1,
          },
        },
        hoverinfo: "none" as const,
      })),
    [seriesWithColors, theme],
  );

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

  const titleOptions = useMemo(
    () => ({
      text: title,
      x: 0.5,
      y: 0.95,
      xanchor: "center" as const,
      yanchor: "top" as const,
      font: {
        size: 32,
        weight: 600,
        family: "Inter, sans-serif",
        color: theme.textColor,
        lineheight: 1.2,
        standoff: 30,
      },
    }),
    [title, theme],
  );

  useEffect(() => {
    if (!plotRef.current || !hasSize) return;

    const layout = {
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      font: {
        family: "Inter, sans-serif",
      },
      title: titleOptions,
      // Bottom margin reserves room for tick labels, the x-axis title, and the
      // container-anchored bottom legend stacked beneath them.
      margin: { l: 80, r: 40, b: 96, t: 80, pad: 0 },
      showlegend: true,
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
          size: 13,
          color: theme.legendColor,
          family: "Inter, sans-serif",
          weight: 500,
          lineheight: 18,
        },
      },
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 15,
        },
        gridcolor: gridColor,
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
          standoff: 15,
        },
        gridcolor: gridColor,
        automargin: true,
        ...tickOptions,
      },
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
  }, [hasSize, xTitle, yTitle, plotData, titleOptions, tickOptions, gridColor, theme, bindTooltip]);

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
    <div
      ref={containerRef}
      className={cn("dotplot-container relative", fillWidth && "w-full", fillHeight && "h-full")}
      style={width === undefined ? undefined : { width }}
    >
      <div
        ref={plotRef}
        style={{
          width: "100%",
          height: "100%",
          margin: "0",
        }}
      />
      {tooltipElement}
    </div>
  );
};

export { DotPlot };
export type { DotPlotDataSeries, DotPlotProps, DotPlotVariant, MarkerSymbol };
