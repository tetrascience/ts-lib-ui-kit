import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import {
  COMPACT_AXIS_TITLE_STANDOFF,
  COMPACT_CHART_MARGIN,
  chartDensityTokens,
  type ChartDensity,
} from "@/utils/chartDensity";
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

/** Comfortable-density gaps between each axis title and its ticks */
const COMFORTABLE_X_AXIS_TITLE_STANDOFF = 32;
const COMFORTABLE_Y_AXIS_TITLE_STANDOFF = 30;

/** Top margin reserving room for the 32px title; reduced when no title is set */
const TITLE_MARGIN_TOP = 60;
const NO_TITLE_MARGIN_TOP = 30;

interface BarGraphProps {
  dataSeries: BarDataSeries[];
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  variant?: BarGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
  barWidth?: number;
  /** Sizing preset; `"compact"` shrinks fonts and margins for dashboard tiles */
  density?: ChartDensity;
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
  width = 1000,
  height = 600,
  xRange,
  yRange,
  variant = "group",
  xTitle = "Columns",
  yTitle = "Rows",
  title,
  barWidth = 24,
  density = "comfortable",
  xTickText,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel: xTitle, yLabel: yTitle });

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

  const tokens = useMemo(() => chartDensityTokens(density), [density]);
  const compact = density === "compact";

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

  useEffect(() => {
    if (!plotRef.current) return;

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
                size: tokens.titleFontSize,
                family: "Inter, sans-serif",
                color: theme.textColor,
              },
            },
          }
        : {}),
      width,
      height,
      margin: compact
        ? COMPACT_CHART_MARGIN
        : {
            l: 80,
            r: 30,
            b: 80,
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
            size: tokens.axisTitleFontSize,
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: compact ? COMPACT_AXIS_TITLE_STANDOFF : COMFORTABLE_X_AXIS_TITLE_STANDOFF,
        },
        gridcolor: theme.gridColor,
        range: xRange,
        autorange: !xRange,
        tickmode: "array" as const,
        tickvals: xTicks,
        ...(useCategoricalX ? { ticktext: xTickText } : {}),
        showgrid: true,
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
          standoff: compact ? COMPACT_AXIS_TITLE_STANDOFF : COMFORTABLE_Y_AXIS_TITLE_STANDOFF,
        },
        gridcolor: theme.gridColor,
        range: yRange,
        autorange: !yRange,
        tickmode: "array" as const,
        tickvals: yTicks,
        showgrid: true,
        ...tickOptions,
      },
      legend: {
        x: 0.5,
        y: -0.2,
        xanchor: "center" as const,
        yanchor: "top" as const,
        orientation: "h" as const,
        font: {
          size: 16,
          color: theme.legendColor,
          family: "Inter, sans-serif",
          weight: 500,
        },
      },
      // Compact tiles are too short to fit a legend below the plot without
      // Plotly's automargin eating most of the data area
      showlegend: !compact && dataSeries.length > 1,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, data, layout, config);
    bindTooltip(plotRef.current);

    // Capture ref value for cleanup
    const plotElement = plotRef.current;

    // Cleanup function
    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
      }
    };
  }, [dataSeries, width, height, xRange, yRange, xTitle, yTitle, title, barWidth, barMode, tickOptions, xTicks, yTicks, useCategoricalX, xTickText, theme, bindTooltip, compact, tokens]);

  return (
    <div className="bar-graph-container relative">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { BarGraph };
export type { BarDataSeries, BarGraphVariant, BarGraphProps };
