import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
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
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  xTitle?: string;
  yTitle?: string;
  title?: string;
}

const ScatterGraph: React.FC<ScatterGraphProps> = ({
  dataSeries,
  width = 1000,
  height = 600,
  xRange,
  yRange,
  xTitle = "Columns",
  yTitle = "Rows",
  title = "Scatter Plot",
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
    if (!plotRef.current) return;

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
      width,
      height,
      margin: { l: 80, r: 30, b: 80, t: 60, pad: 10 },
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
      showlegend: true,
      hovermode: "closest" as const,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, plotData, layout, config);
    bindTooltip(plotRef.current);

    // Capture ref value for cleanup
    const plotElement = plotRef.current;

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
      }
    };
  }, [dataSeries, width, height, xRange, yRange, xTitle, yTitle, title, effectiveXRange, effectiveYRange, xTicks, yTicks, tickOptions, theme, bindTooltip]);

  return (
    <div className="chart-container relative">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      {tooltipElement}
    </div>
  );
};

export { ScatterGraph };
export type { ScatterDataPoint, ScatterDataSeries, ScatterGraphProps };
