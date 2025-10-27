import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./ScatterGraph.scss";
import { COLORS } from "../../../utils/colors";

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

  const calculateDataRanges = () => {
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
  };

  const { xMin, xMax, yMin, yMax } = calculateDataRanges();
  const effectiveXRange = xRange || [xMin, xMax];
  const effectiveYRange = yRange || [yMin, yMax];

  const generateXTicks = () => {
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
  };

  const generateYTicks = () => {
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
  };

  const xTicks = generateXTicks();
  const yTicks = generateYTicks();

  const tickOptions = {
    tickcolor: COLORS.GREY_200,
    ticklen: 12,
    tickwidth: 1,
    ticks: "outside" as const,
    tickfont: {
      size: 16,
      color: COLORS.BLACK_900,
      family: "Inter, sans-serif",
      weight: 400,
    },
    linecolor: COLORS.BLACK_900,
    linewidth: 1,
    position: 0,
    zeroline: false,
  };

  const spikeOptions = {
    showspikes: true,
    spikemode: "across" as const,
    spikedash: "solid" as const,
    spikecolor: COLORS.BLACK_OPACITY_20,
    spikethickness: 2,
  };

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
          color: COLORS.BLACK_900,
        },
      },
      width,
      height,
      margin: { l: 80, r: 30, b: 80, t: 60, pad: 10 },
      paper_bgcolor: COLORS.WHITE,
      plot_bgcolor: COLORS.WHITE,
      font: {
        family: "Inter, sans-serif",
      },
      dragmode: false as const,
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: COLORS.BLACK_600,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 32,
        },
        gridcolor: COLORS.GREY_200,
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
            color: COLORS.BLACK_600,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 30,
        },
        gridcolor: COLORS.GREY_200,
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
          color: COLORS.BLUE_900,
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

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [dataSeries, width, height, xRange, yRange, xTitle, yTitle, title]);

  return (
    <div className="chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { ScatterGraph };
export type { ScatterDataPoint, ScatterDataSeries, ScatterGraphProps };
