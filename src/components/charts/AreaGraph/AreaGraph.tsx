import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { chartTooltipLines, useChartTooltip } from "../ChartTooltip";

import { useElementSize } from "@/hooks/use-element-size";
import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import {
  COMPACT_AXIS_TITLE_STANDOFF,
  COMPACT_CHART_MARGIN,
  chartDensityTokens,
  type ChartDensity,
} from "@/utils/chartDensity";
import { seriesColor } from "@/utils/colors";

interface AreaDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  fill?: "tozeroy" | "tonexty" | "toself";
}

type AreaGraphVariant = "normal" | "stacked";

/** Comfortable-density gap between each axis title and its ticks */
const COMFORTABLE_AXIS_TITLE_STANDOFF = 15;

/** Top margin reserving room for the 32px title; reduced when no title is set */
const TITLE_MARGIN_TOP = 80;
const NO_TITLE_MARGIN_TOP = 40;

interface AreaGraphProps {
  dataSeries: AreaDataSeries[];
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
  variant?: AreaGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  /** Sizing preset; `"compact"` shrinks fonts and margins for dashboard tiles */
  density?: ChartDensity;
  /**
   * Categorical labels for the x-axis ticks. When provided, the x data values
   * still drive area positioning but the displayed tick labels match these
   * strings in order (e.g. ["Mon", "Tue", …]). Should align 1:1 with the
   * unique, ordered x values across all series.
   */
  xTickText?: string[];
}

const AreaGraph: React.FC<AreaGraphProps> = ({
  dataSeries,
  width,
  height,
  xRange,
  yRange,
  variant = "normal",
  xTitle,
  yTitle,
  title,
  density = "comfortable",
  xTickText,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();

  // When width/height are omitted the chart fills its container; otherwise the
  // explicit pixel size wins. The container is measured either way (cheap) but
  // only used as the resolved size for the omitted dimension(s).
  const [containerRef, measured] = useElementSize<HTMLDivElement>();
  const resolvedWidth = width ?? measured.width;
  const resolvedHeight = height ?? measured.height;
  const hasSize = resolvedWidth > 0 && resolvedHeight > 0;
  // Fill is per-dimension: omit width to fill the container width, omit height
  // to fill its height (so e.g. a fixed width with a container-driven height works).
  const fillWidth = width === undefined;
  const fillHeight = height === undefined;

  // Hold the latest resolved size in a ref so the newPlot effect can read it
  // without listing it as a dependency — size changes are handled by a
  // separate relayout effect rather than by tearing down and recreating the plot.
  const sizeRef = useRef({ width: resolvedWidth, height: resolvedHeight });
  sizeRef.current = { width: resolvedWidth, height: resolvedHeight };
  const plotInitedRef = useRef(false);
  // Size last applied to the plot, so the resize effect can skip a redundant
  // relayout right after newPlot already drew at that size.
  const appliedSizeRef = useRef({ width: 0, height: 0 });
  const { bindTooltip, tooltipElement } = useChartTooltip({
    // Stacked traces carry the original series values as customdata;
    // display those instead of the cumulative stack heights
    getLines: (points) =>
      chartTooltipLines(
        points.map((point) =>
          typeof point.customdata === "number"
            ? { ...point, y: point.customdata }
            : point,
        ),
        { xLabel: xTitle, yLabel: yTitle },
      ),
  });

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
      yMin: variant === "stacked" ? 0 : minY - yPadding,
      yMax: maxY + yPadding,
    };
  }, [dataSeries, variant]);

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

  const tokens = useMemo(() => chartDensityTokens(density), [density]);
  const compact = density === "compact";

  // When categorical labels are supplied, ticks must sit on the actual data
  // x-positions rather than the computed nice-step values above. Sorted
  // ascending so labels map deterministically to x regardless of series order.
  const xDataValues = useMemo(
    () => [...new Set(dataSeries.flatMap((s) => s.x))].sort((a, b) => a - b),
    [dataSeries],
  );

  // Only apply categorical labels when they align 1:1 with the tick positions;
  // a mismatch would silently mis-label ticks, so fall back to numeric ticks.
  const useCategoricalX = !!xTickText && xTickText.length === xDataValues.length;

  const tickOptions = useMemo(
    () => ({
      tickcolor: theme.tickColor,
      ticklen: 12,
      tickwidth: 1,
      ticks: "outside" as const,
      tickfont: {
        size: tokens.tickFontSize,
        color: theme.textColor,
        family: "Inter, sans-serif",
        weight: 400,
      },
      linecolor: theme.lineColor,
      linewidth: 1,
      position: 0,
      zeroline: false,
    }),
    [theme, tokens.tickFontSize],
  );

  const titleOptions = useMemo(
    () =>
      title
        ? {
            text: title,
            x: 0.5,
            y: 0.95,
            xanchor: "center" as const,
            yanchor: "top" as const,
            font: {
              size: tokens.titleFontSize,
              weight: 600,
              family: "Inter, sans-serif",
              color: theme.textColor,
              lineheight: 1.2,
              standoff: 30,
            },
          }
        : undefined,
    [title, theme, tokens.titleFontSize],
  );

  useEffect(() => {
    if (!plotRef.current || !hasSize) return;

    let data;

    if (variant === "stacked") {
      // For stacked mode, we need to calculate cumulative values
      const cumulativeY = new Array(dataSeries[0]?.x.length || 0).fill(0);

      data = dataSeries.map((series, index) => {
        // Calculate cumulative values for this series
        const stackedY = series.y.map((value, i) => {
          const result = cumulativeY[i] + value;
          cumulativeY[i] = result;
          return result;
        });

        const color = seriesColor(index, series.color);
        return {
          x: series.x,
          y: stackedY,
          // Tooltips report the series' own values, not the stacked sums
          customdata: series.y,
          type: "scatter" as const,
          mode: "lines" as const,
          name: series.name,
          hoverinfo: "none" as const,
          fill: index === 0 ? ("tozeroy" as const) : ("tonexty" as const),
          fillcolor: color,
          line: {
            color,
            width: 2,
          },
        };
      });
    } else {
      // Normal mode - each area fills independently from zero
      data = dataSeries.map((series, index) => {
        const color = seriesColor(index, series.color);
        return {
          x: series.x,
          y: series.y,
          type: "scatter" as const,
          mode: "lines" as const,
          name: series.name,
          hoverinfo: "none" as const,
          fill: series.fill || ("tozeroy" as const),
          fillcolor: color,
          line: {
            color,
            width: 2,
          },
        };
      });
    }

    const layout = {
      width: sizeRef.current.width,
      height: sizeRef.current.height,
      ...(titleOptions ? { title: titleOptions } : {}),
      margin: compact
        ? COMPACT_CHART_MARGIN
        : {
            l: 80,
            r: 40,
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
      dragmode: false as const,
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: tokens.axisTitleFontSize,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: compact ? COMPACT_AXIS_TITLE_STANDOFF : COMFORTABLE_AXIS_TITLE_STANDOFF,
        },
        gridcolor: theme.gridColor,
        range: xRange,
        autorange: !xRange,
        tickmode: "array" as const,
        tickvals: useCategoricalX ? xDataValues : xTicks,
        ...(useCategoricalX ? { ticktext: xTickText } : {}),
        showgrid: true,
        // Reserve space for tick labels + the axis title so the bottom legend
        // can't overlap them at small sizes (SW-2157).
        automargin: !compact,
        ...tickOptions,
      },
      yaxis: {
        title: {
          text: yTitle,
          font: {
            size: tokens.axisTitleFontSize,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: compact ? COMPACT_AXIS_TITLE_STANDOFF : COMFORTABLE_AXIS_TITLE_STANDOFF,
        },
        gridcolor: theme.gridColor,
        range: yRange,
        autorange: !yRange,
        tickmode: "array" as const,
        tickvals: yTicks,
        showgrid: true,
        automargin: !compact,
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
          family: "Inter, sans-serif",
          weight: 500,
          lineheight: 18,
        },
      },
      // Compact tiles are too short to fit a legend below the plot without
      // Plotly's automargin eating most of the data area
      showlegend: !compact,
    };

    const config = {
      // We drive sizing explicitly from the measured container, so Plotly's own
      // window-resize responsiveness is disabled (it can't see container resizes).
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
  }, [dataSeries, hasSize, xRange, yRange, effectiveXRange, effectiveYRange, variant, xTitle, yTitle, title, titleOptions, tickOptions, xTicks, yTicks, xDataValues, useCategoricalX, xTickText, theme, bindTooltip, compact, tokens]);

  // Resize in place when the measured/overridden size changes — far cheaper
  // than recreating the plot (and it preserves tooltip/event bindings).
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
      className={cn("area-graph-container relative", fillWidth && "w-full", fillHeight && "h-full")}
    >
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { AreaGraph };
export type { AreaDataSeries, AreaGraphVariant, AreaGraphProps };
