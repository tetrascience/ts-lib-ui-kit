import React, { useEffect, useRef } from "react";
import { COLORS } from "@utils/colors";
import Plotly from "plotly.js-dist";
import "./DotPlot.scss";

type MarkerSymbol =
  | "circle"
  | "square"
  | "diamond"
  | "triangle-up"
  | "triangle-down"
  | "star";

interface DotPlotDataSeries {
  x: number[];
  y: number[];
  name: string;
  color?: string;
  symbol?: MarkerSymbol;
  size?: number;
}

type DotPlotVariant = "default" | "stacked";

type DotPlotProps = {
  dataSeries: DotPlotDataSeries | DotPlotDataSeries[];
  width?: number;
  height?: number;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  variant?: DotPlotVariant;
  markerSize?: number;
};

const DotPlot: React.FC<DotPlotProps> = ({
  dataSeries,
  width = 1000,
  height = 600,
  title = "Dot Plot",
  xTitle = "Columns",
  yTitle = "Rows",
  variant = "default",
  markerSize = 8,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const seriesArray = Array.isArray(dataSeries) ? dataSeries : [dataSeries];

  const defaultColors = [
    COLORS.ORANGE,
    COLORS.RED,
    COLORS.GREEN,
    COLORS.BLUE,
    COLORS.YELLOW,
    COLORS.PURPLE,
  ];

  const defaultSymbols: MarkerSymbol[] = [
    "circle",
    "square",
    "diamond",
    "triangle-up",
    "triangle-down",
    "star",
  ];

  const getSeriesWithColors = () => {
    return seriesArray.map((series, index) => {
      if (variant === "default") {
        // Default variant: all circles, use first color or series color
        return {
          ...series,
          color: series.color || defaultColors[0],
          symbol: "circle" as MarkerSymbol,
          size: series.size || markerSize,
        };
      } else {
        // Stacked variant: different symbols and colors for each series
        return {
          ...series,
          color: series.color || defaultColors[index % defaultColors.length],
          symbol:
            series.symbol || defaultSymbols[index % defaultSymbols.length],
          size: series.size || markerSize,
        };
      }
    });
  };

  const seriesWithColors = getSeriesWithColors();

  const gridColor = COLORS.GREY_200;

  const plotData = seriesWithColors.map((series) => ({
    type: "scatter" as const,
    x: series.x,
    y: series.y,
    mode: "markers" as const,
    name: series.name,
    marker: {
      color: series.color,
      size: series.size,
      symbol: series.symbol,
      line: {
        color: COLORS.WHITE,
        width: 1,
      },
    },
    hovertemplate: `${xTitle}: %{x}<br>${yTitle}: %{y}<extra>${series.name}</extra>`,
  }));

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

  const titleOptions = {
    text: title,
    x: 0.5,
    y: 0.95,
    xanchor: "center" as const,
    yanchor: "top" as const,
    font: {
      size: 32,
      weight: 600,
      family: "Inter, sans-serif",
      color: COLORS.BLACK_900,
      lineheight: 1.2,
      standoff: 30,
    },
  };

  useEffect(() => {
    if (!plotRef.current) return;

    const layout = {
      width,
      height,
      font: {
        family: "Inter, sans-serif",
      },
      title: titleOptions,
      margin: { l: 80, r: 40, b: 80, t: 80, pad: 0 },
      showlegend: true,
      legend: {
        x: 0.5,
        y: -0.2,
        xanchor: "center" as const,
        yanchor: "top" as const,
        orientation: "h" as const,
        font: {
          size: 13,
          color: COLORS.BLUE_900,
          family: "Inter, sans-serif",
          weight: 500,
          lineheight: 18,
        },
      },
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: COLORS.BLACK_600,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 15,
        },
        gridcolor: gridColor,
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
          standoff: 15,
        },
        gridcolor: gridColor,
        ...tickOptions,
      },
      paper_bgcolor: COLORS.WHITE,
      plot_bgcolor: COLORS.WHITE,
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
    xTitle,
    yTitle,
    variant,
    markerSize,
    plotData,
  ]);

  return (
    <div className="dotplot-container" style={{ width: width }}>
      <div
        ref={plotRef}
        style={{
          width: "100%",
          height: "100%",
          margin: "0",
        }}
      />
    </div>
  );
};

export { DotPlot };
export type { DotPlotDataSeries, DotPlotProps, DotPlotVariant, MarkerSymbol };
