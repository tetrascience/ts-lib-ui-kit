import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { CHART_FONT_FAMILY, usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { seriesColor } from "@/utils/colors";

/** Default point position offset from the box edge */
const DEFAULT_POINT_POSITION = -1.8;

interface BoxDataSeries {
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  x?: string[] | number[];
  boxpoints?: "all" | "outliers" | "suspectedoutliers" | false;
  jitter?: number;
  pointpos?: number;
}

interface BoxPlotProps {
  dataSeries: BoxDataSeries[];
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
  xTitle?: string;
  yTitle?: string;
  title?: string;
  showPoints?: boolean;
}

const BoxPlot: React.FC<BoxPlotProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  xTitle,
  yTitle,
  title = "Box Plot",
  showPoints = false,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel: xTitle, yLabel: yTitle });

  // Omitted width/height → fill the container and track its measured size;
  // explicit pixel values override. See AreaPlot for the reference pattern.
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
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    dataSeries.forEach((series) => {
      series.y.forEach((y) => {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });

    const yPadding = (maxY - minY) * 0.1;

    return {
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

  const tickOptions = useMemo(
    () => ({
      tickcolor: theme.tickColor,
      ticklen: 12,
      tickwidth: 1,
      ticks: "outside" as const,
      tickfont: {
        size: 16,
        color: theme.textColor,
        family: CHART_FONT_FAMILY,
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
        family: CHART_FONT_FAMILY,
        color: theme.textColor,
        lineheight: 1.2,
        standoff: 30,
      },
    }),
    [title, theme],
  );

  useEffect(() => {
    if (!plotRef.current || !hasSize) return;

    const data = dataSeries.map((series, index) => {
      const color = seriesColor(index, series.color);
      return {
        y: series.y,
        x: series.x,
        type: "box" as const,
        name: series.name,
        hoverinfo: "none" as const,
        marker: {
          color,
        },
        line: {
          color,
        },
        fillcolor:
          typeof color === "string" && color.startsWith("#") && color.length === 7
            ? `${color}40`
            : color, // Add transparency for hex colors only
        boxpoints: showPoints
          ? series.boxpoints || "outliers"
          : (false as const),
        jitter: series.jitter || 0.3,
        pointpos: series.pointpos || DEFAULT_POINT_POSITION,
      };
    });

    const layout = {
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      title: titleOptions,
      // Bottom margin reserves room for tick labels, the x-axis title, and the
      // container-anchored bottom legend stacked beneath them.
      margin: { l: 80, r: 40, b: 96, t: 80, pad: 0 },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: {
        family: CHART_FONT_FAMILY,
      },
      dragmode: false as const,
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: theme.textSecondary,
            family: CHART_FONT_FAMILY,
            weight: 400,
          },
          standoff: 15,
        },
        gridcolor: theme.gridColor,
        range: xRange,
        autorange: !xRange,
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
            family: CHART_FONT_FAMILY,
            weight: 400,
          },
          standoff: 15,
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
          size: 13,
          color: theme.legendColor,
          family: CHART_FONT_FAMILY,
          weight: 500,
          lineheight: 18,
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
  }, [dataSeries, hasSize, xRange, yRange, effectiveYRange, xTitle, yTitle, showPoints, titleOptions, tickOptions, yTicks, theme, bindTooltip]);

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
      className={cn("boxplot-container relative", fillWidth && "w-full", fillHeight && "h-full")}
    >
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { BoxPlot };
export type { BoxDataSeries, BoxPlotProps };
