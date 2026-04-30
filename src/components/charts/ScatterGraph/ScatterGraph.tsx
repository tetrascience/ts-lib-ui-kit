import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { withVisualization } from "@/lib/visualization";

interface ScatterDataPoint {
  x: number;
  y: number;
  additionalInfo?: Record<string, string | number>;
}

interface ScatterDataSeries {
  x: number[];
  y: number[];
  name: string;
  color: string;
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

  const effectiveXRange = useMemo(() => xRange || [xMin, xMax], [xRange, xMin, xMax]);

  const effectiveYRange = useMemo(() => yRange || [yMin, yMax], [yRange, yMin, yMax]);

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

  const spikeOptions = useMemo(
    () => ({
      showspikes: true,
      spikemode: "across" as const,
      spikedash: "solid" as const,
      spikecolor: theme.spikeColor,
      spikethickness: 2,
    }),
    [theme],
  );

  useEffect(() => {
    if (!plotRef.current) return;

    const plotData = dataSeries.map((series) => ({
      x: series.x,
      y: series.y,
      type: "scatter" as const,
      mode: "markers" as const,
      name: series.name,
      marker: {
        color: series.color,
        size: 10,
        symbol: "circle" as const,
      },
      hovertemplate: `${xTitle}: %{x}<br>${yTitle}: %{y}<extra>${series.name}</extra>`,
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
        ...spikeOptions,
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
        ...spikeOptions,
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

    // Capture ref value for cleanup
    const plotElement = plotRef.current;

    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
      }
    };
  }, [
    dataSeries,
    width,
    height,
    xRange,
    yRange,
    xTitle,
    yTitle,
    title,
    effectiveXRange,
    effectiveYRange,
    xTicks,
    yTicks,
    tickOptions,
    spikeOptions,
    theme,
  ]);

  return (
    <div className="chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

const ScatterGraphWithMeta = withVisualization(ScatterGraph, {
  id: "scatter-graph",
  inputKind: "plot",
  description: "Scatter graph for one or more numeric X/Y point series.",
  tunableProps: [
    {
      name: "height",
      type: "number",
      description: "Chart height in pixels.",
      default: 600,
      validation: { min: 200, max: 1200 },
    },
  ],
});

export { ScatterGraphWithMeta as ScatterGraph };
export type { ScatterDataPoint, ScatterDataSeries, ScatterGraphProps };
