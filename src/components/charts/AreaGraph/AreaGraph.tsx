import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { CHART_COLORS } from "@/utils/colors";

interface AreaDataSeries {
  x: number[];
  y: number[];
  name: string;
  /** Optional color override (auto-assigned from CHART_COLORS if not provided) */
  color?: string;
  fill?: "tozeroy" | "tonexty" | "toself";
}

type AreaGraphVariant = "normal" | "stacked";

interface AreaGraphProps {
  dataSeries: AreaDataSeries[];
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  variant?: AreaGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
}

const AreaGraph: React.FC<AreaGraphProps> = ({
  dataSeries,
  width = 1000,
  height = 600,
  xRange,
  yRange,
  variant = "normal",
  xTitle = "Columns",
  yTitle = "Rows",
  title = "Area Graph",
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel: xTitle, yLabel: yTitle });

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
    if (!plotRef.current) return;

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

        const color = series.color ?? CHART_COLORS[index % CHART_COLORS.length];
        return {
          x: series.x,
          y: stackedY,
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
        const color = series.color ?? CHART_COLORS[index % CHART_COLORS.length];
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
      width,
      height: height,
      title: titleOptions,
      margin: { l: 80, r: 40, b: 80, t: 80, pad: 0 },
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
          standoff: 15,
        },
        gridcolor: theme.gridColor,
        range: xRange,
        autorange: !xRange,
        tickmode: "array" as const,
        tickvals: xTicks,
        showgrid: true,
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
          size: 13,
          color: theme.legendColor,
          family: "Inter, sans-serif",
          weight: 500,
          lineheight: 18,
        },
      },
      showlegend: true,
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
  }, [dataSeries, width, height, xRange, yRange, effectiveXRange, effectiveYRange, variant, xTitle, yTitle, titleOptions, tickOptions, xTicks, yTicks, theme, bindTooltip]);

  return (
    <div className="area-graph-container relative">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { AreaGraph };
export type { AreaDataSeries, AreaGraphVariant, AreaGraphProps };
