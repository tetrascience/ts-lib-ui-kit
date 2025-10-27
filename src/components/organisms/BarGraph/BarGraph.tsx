import React, { useEffect, useRef } from "react";
import { COLORS } from "@utils/colors";
import Plotly from "plotly.js-dist";
import "./BarGraph.scss";

interface BarDataSeries {
  x: number[];
  y: number[];
  name: string;
  color: string;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type BarGraphVariant = "group" | "stack" | "overlay";

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
  title = "Bar Graph",
  barWidth = 24,
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
      yMin: variant === "stack" ? 0 : minY - yPadding,
      yMax: maxY + yPadding,
    };
  };

  const { yMin, yMax } = calculateDataRanges();
  // const effectiveXRange = xRange || [xMin, xMax];
  const effectiveYRange = yRange || [yMin, yMax];

  // const generateXTicks = () => {
  //   const range = effectiveXRange[1] - effectiveXRange[0];
  //   let step = Math.pow(10, Math.floor(Math.log10(range)));

  //   if (range / step > 10) step = step * 2;
  //   if (range / step < 4) step = step / 2;

  //   const ticks = [];
  //   let current = Math.ceil(effectiveXRange[0] / step) * step;
  //   while (current <= effectiveXRange[1]) {
  //     ticks.push(current);
  //     current += step;
  //   }
  //   return ticks;
  // };

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

  const xTicks = Array.from(new Set(dataSeries.flatMap((s) => s.x)));
  const yTicks = generateYTicks();

  const getBarMode = (): "group" | "stack" | "overlay" => {
    switch (variant) {
      case "stack":
        return "stack";
      case "overlay":
        return "overlay";
      case "group":
      default:
        return "group";
    }
  };

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

  useEffect(() => {
    if (!plotRef.current) return;

    const data = dataSeries.map((series) => ({
      x: series.x,
      y: series.y,
      type: "bar" as const,
      name: series.name,
      marker: {
        color: series.color,
      },
      width: barWidth,
      error_y: series.error_y,
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
      margin: { l: 80, r: 30, b: 80, t: 60, pad: 0 },
      paper_bgcolor: COLORS.WHITE,
      plot_bgcolor: COLORS.WHITE,
      font: {
        family: "Inter, sans-serif",
      },
      barmode: getBarMode(),
      bargap: 0.15,
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
        showgrid: true,
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
      showlegend: dataSeries.length > 1,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, data, layout, config);

    // Cleanup function
    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [
    dataSeries,
    width,
    height,
    xRange,
    yRange,
    variant,
    xTitle,
    yTitle,
    title,
    barWidth,
  ]);

  return (
    <div className="bar-graph-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { BarGraph };
export type { BarDataSeries, BarGraphVariant, BarGraphProps };
