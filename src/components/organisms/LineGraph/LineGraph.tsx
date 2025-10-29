import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./LineGraph.scss";
import { COLORS } from "../../../utils/colors";

type MarkerSymbol =
  | "circle"
  | "circle-open"
  | "circle-dot"
  | "circle-open-dot"
  | "square"
  | "square-open"
  | "square-dot"
  | "square-open-dot"
  | "diamond"
  | "diamond-open"
  | "diamond-dot"
  | "diamond-open-dot"
  | "cross"
  | "cross-open"
  | "cross-dot"
  | "cross-open-dot"
  | "x"
  | "x-open"
  | "x-dot"
  | "x-open-dot"
  | "triangle-up"
  | "triangle-up-open"
  | "triangle-up-dot"
  | "triangle-up-open-dot"
  | "triangle-down"
  | "triangle-down-open"
  | "triangle-down-dot"
  | "triangle-down-open-dot"
  | "triangle-left"
  | "triangle-left-open"
  | "triangle-left-dot"
  | "triangle-left-open-dot"
  | "triangle-right"
  | "triangle-right-open"
  | "triangle-right-dot"
  | "triangle-right-open-dot"
  | "triangle-ne"
  | "triangle-ne-open"
  | "triangle-ne-dot"
  | "triangle-ne-open-dot"
  | "triangle-se"
  | "triangle-se-open"
  | "triangle-se-dot"
  | "triangle-se-open-dot"
  | "triangle-sw"
  | "triangle-sw-open"
  | "triangle-sw-dot"
  | "triangle-sw-open-dot"
  | "triangle-nw"
  | "triangle-nw-open"
  | "triangle-nw-dot"
  | "triangle-nw-open-dot"
  | "pentagon"
  | "pentagon-open"
  | "pentagon-dot"
  | "pentagon-open-dot"
  | "hexagon"
  | "hexagon-open"
  | "hexagon-dot"
  | "hexagon-open-dot"
  | "hexagon2"
  | "hexagon2-open"
  | "hexagon2-dot"
  | "hexagon2-open-dot"
  | "octagon"
  | "octagon-open"
  | "octagon-dot"
  | "octagon-open-dot"
  | "star"
  | "star-open"
  | "star-dot"
  | "star-open-dot"
  | "hexagram"
  | "hexagram-open"
  | "hexagram-dot"
  | "hexagram-open-dot"
  | "star-triangle-up"
  | "star-triangle-up-open"
  | "star-triangle-up-dot"
  | "star-triangle-up-open-dot"
  | "star-triangle-down"
  | "star-triangle-down-open"
  | "star-triangle-down-dot"
  | "star-triangle-down-open-dot"
  | "star-square"
  | "star-square-open"
  | "star-square-dot"
  | "star-square-open-dot"
  | "star-diamond"
  | "star-diamond-open"
  | "star-diamond-dot"
  | "star-diamond-open-dot"
  | "diamond-tall"
  | "diamond-tall-open"
  | "diamond-tall-dot"
  | "diamond-tall-open-dot"
  | "diamond-wide"
  | "diamond-wide-open"
  | "diamond-wide-dot"
  | "diamond-wide-open-dot"
  | "hourglass"
  | "hourglass-open"
  | "bowtie"
  | "bowtie-open"
  | "circle-cross"
  | "circle-cross-open"
  | "circle-x"
  | "circle-x-open"
  | "square-cross"
  | "square-cross-open"
  | "square-x"
  | "square-x-open"
  | "diamond-cross"
  | "diamond-cross-open"
  | "diamond-x"
  | "diamond-x-open"
  | "cross-thin"
  | "cross-thin-open"
  | "x-thin"
  | "x-thin-open"
  | "asterisk"
  | "asterisk-open"
  | "hash"
  | "hash-open"
  | "hash-dot"
  | "hash-open-dot"
  | "y-up"
  | "y-up-open"
  | "y-down"
  | "y-down-open"
  | "y-left"
  | "y-left-open"
  | "y-right"
  | "y-right-open"
  | "line-ew"
  | "line-ew-open"
  | "line-ns"
  | "line-ns-open"
  | "line-ne"
  | "line-ne-open"
  | "line-nw"
  | "line-nw-open"
  | "arrow"
  | "arrow-open"
  | "arrow-wide"
  | "arrow-wide-open";

interface LineDataSeries {
  x: number[];
  y: number[];
  name: string;
  color: string;
  symbol?: MarkerSymbol;
  error_y?: {
    type: "data";
    array: number[];
    visible: boolean;
  };
}

type LineGraphVariant = "lines" | "lines+markers" | "lines+markers+error_bars";

type LineGraphProps = {
  dataSeries: LineDataSeries[];
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  variant?: LineGraphVariant;
  xTitle?: string;
  yTitle?: string;
  title?: string;
};

const LineGraph: React.FC<LineGraphProps> = ({
  dataSeries,
  width = 1000,
  height = 600,
  xRange,
  yRange,
  variant = "lines",
  xTitle = "Columns",
  yTitle = "Rows",
  title = "Line Graph",
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

  const { yMin, yMax } = calculateDataRanges();
  const effectiveYRange = yRange || [yMin, yMax];

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

  const getMode = () => {
    switch (variant) {
      case "lines+markers":
      case "lines+markers+error_bars":
        return "lines+markers";
      default:
        return "lines";
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

    const plotData = dataSeries.map((series) => ({
      x: series.x,
      y: series.y,
      type: "scatter" as const,
      mode: getMode() as "lines" | "lines+markers",
      name: series.name,
      line: {
        color: series.color,
        width: 1.5,
      },
      marker:
        variant !== "lines"
          ? {
              color: series.color,
              size: 8,
              symbol: series.symbol || "triangle-up",
            }
          : { opacity: 0 },
      error_y:
        variant === "lines+markers+error_bars"
          ? series.error_y || {
              type: "data" as const,
              array: series.y.map(() => 10),
              visible: true,
              color: series.color,
              thickness: 1,
              width: 5,
            }
          : undefined,
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
      showlegend: true,
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
  ]);

  return (
    <div className="chart-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { LineGraph };
export type { LineDataSeries, LineGraphVariant, LineGraphProps, MarkerSymbol };
