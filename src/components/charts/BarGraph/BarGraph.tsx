import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { seriesColor } from "@/utils/colors";

interface BarDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type BarGraphVariant = "group" | "stack" | "overlay";

/** Top margin reserving room for the 32px title; reduced when no title is set */
const TITLE_MARGIN_TOP = 60;
const NO_TITLE_MARGIN_TOP = 30;

interface BarGraphProps {
  dataSeries: BarDataSeries[];
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
  variant?: BarGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  barWidth?: number;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive bar positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
}

const BarGraph: React.FC<BarGraphProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "group",
  xTitle,
  yTitle,
  title,
  barWidth = 24,
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
      yMin: variant === "stack" ? 0 : minY - yPadding,
      yMax: maxY + yPadding,
    };
  }, [dataSeries, variant]);

  const effectiveYRange = useMemo(
    () => yRange || [yMin, yMax],
    [yRange, yMin, yMax],
  );

  const xTicks = useMemo(
    () => [...new Set(dataSeries.flatMap((s) => s.x))].sort((a, b) => a - b),
    [dataSeries],
  );

  // Only apply categorical labels when they align 1:1 with the tick positions;
  // a mismatch would silently mis-label ticks, so fall back to numeric ticks.
  const useCategoricalX = !!xTickText && xTickText.length === xTicks.length;

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

  const barMode = useMemo((): "group" | "stack" | "overlay" => {
    switch (variant) {
      case "stack":
        return "stack";
      case "overlay":
        return "overlay";
      case "group":
      default:
        return "group";
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

    const data = dataSeries.map((series, index) => ({
      x: series.x,
      y: series.y,
      type: "bar" as const,
      name: series.name,
      hoverinfo: "none" as const,
      marker: {
        color: seriesColor(index, series.color),
      },
      width: barWidth,
      error_y: series.error_y,
    }));

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
        pad: 0,
      },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: {
        family: "Inter, sans-serif",
      },
      barmode: barMode,
      bargap: 0.15,
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
        ...(useCategoricalX ? { ticktext: xTickText } : {}),
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
      showlegend: dataSeries.length > 1,
    };

    const config = {
      // Sizing is driven from the measured container; disable Plotly's own
      // window-resize responsiveness (it can't see container resizes).
      responsive: false,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, data, layout, config);
    bindTooltip(plotRef.current);

    // Capture ref value for cleanup
    const plotElement = plotRef.current;
    plotInitedRef.current = true;
    appliedSizeRef.current = { ...sizeRef.current };

    // Cleanup function
    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
        plotInitedRef.current = false;
      }
    };
  }, [dataSeries, hasSize, xRange, yRange, xTitle, yTitle, title, barWidth, barMode, tickOptions, xTicks, yTicks, useCategoricalX, xTickText, theme, bindTooltip]);

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
      className={cn("bar-graph-container relative", fillWidth && "w-full", fillHeight && "h-full")}
    >
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { BarGraph };
export type { BarDataSeries, BarGraphVariant, BarGraphProps };
