import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { seriesColor } from "@/utils/colors";

interface ScatterDataPoint {
  x: number;
  y: number;
  additionalInfo?: Record<string, string | number>;
}

interface ScatterDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
}

interface ScatterGraphProps {
  dataSeries: ScatterDataSeries[];
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
}

const ScatterGraph: React.FC<ScatterGraphProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  xTitle,
  yTitle,
  title = "Scatter Plot",
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

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
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

  const effectiveXRange = useMemo(
    () => xRange || [xMin, xMax],
    [xRange, xMin, xMax],
  );

  const effectiveYRange = useMemo(
    () => yRange || [yMin, yMax],
    [yRange, yMin, yMax],
  );

  const xTicks = useMemo(() => {
    const range = effectiveXRange[1] - effectiveXRange[0];
    let step = Math.pow(10, Math.floor(Math.log10(range)));

    if (range / step > 10) step = step * 2;
    if (range / step < 4) step = step / 2;

    const ticks = [];
    let current = Math.ceil(effectiveXRange[0] / step) * step;
    while (current <= effectiveXRange[1]) {
      ticks.push(current);
      current += step;
    }
    return ticks;
  }, [effectiveXRange]);

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

    const plotData = dataSeries.map((series, index) => ({
      x: series.x,
      y: series.y,
      type: "scatter" as const,
      mode: "markers" as const,
      name: series.name,
      marker: {
        color: seriesColor(index, series.color),
        size: 10,
        symbol: "circle" as const,
      },
      hoverinfo: "none" as const,
    }));

    const layout = {
      title: {
        text: title,
        font: {
          size: 32,
          family: "Inter, sans-serif",
          color: theme.textColor,
        },
      },
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      // Bottom margin reserves room for tick labels, the x-axis title, and the
      // container-anchored bottom legend stacked beneath them.
      margin: { l: 80, r: 30, b: 96, t: 60, pad: 10 },
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
        ticktext: xTicks.map(String),
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
      hovermode: "closest" as const,
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

    // Crosshair guide lines through the hovered point. Drawn as layout shapes
    // with `layer: "below"` so they sit behind the markers — native Plotly
    // spikelines always render on top and can't be moved behind.
    const emitter = plotElement as unknown as Plotly.PlotlyHTMLElement;
    const crosshairLine = { color: theme.spikeColor, width: 2 };
    emitter.on("plotly_hover", (eventData) => {
      const point = eventData.points[0];
      if (!point) return;
      void Plotly.relayout(plotElement, {
        shapes: [
          {
            type: "line",
            xref: "x",
            yref: "paper",
            x0: point.x,
            x1: point.x,
            y0: 0,
            y1: 1,
            line: crosshairLine,
            layer: "below",
          },
          {
            type: "line",
            xref: "paper",
            yref: "y",
            x0: 0,
            x1: 1,
            y0: point.y,
            y1: point.y,
            line: crosshairLine,
            layer: "below",
          },
        ],
      });
    });
    emitter.on("plotly_unhover", () => {
      void Plotly.relayout(plotElement, { shapes: [] });
    });

    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
        plotInitedRef.current = false;
      }
    };
  }, [dataSeries, hasSize, xRange, yRange, xTitle, yTitle, title, effectiveXRange, effectiveYRange, xTicks, yTicks, tickOptions, theme, bindTooltip]);

  // Resize in place when the measured/overridden size changes — cheaper than
  // recreating the plot, and it preserves the hover/crosshair event bindings.
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

export { ScatterGraph };
export type { ScatterDataPoint, ScatterDataSeries, ScatterGraphProps };
