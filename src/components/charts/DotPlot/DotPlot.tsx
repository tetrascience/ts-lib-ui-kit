import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { COLORS } from "@/utils/colors";

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
  const theme = usePlotlyTheme();
  const seriesArray = useMemo(
    () => (Array.isArray(dataSeries) ? dataSeries : [dataSeries]),
    [dataSeries],
  );

  const defaultColors = useMemo(
    () => [
      COLORS.ORANGE,
      COLORS.RED,
      COLORS.GREEN,
      COLORS.BLUE,
      COLORS.YELLOW,
      COLORS.PURPLE,
    ],
    [],
  );

  const defaultSymbols: MarkerSymbol[] = useMemo(
    () => [
      "circle",
      "square",
      "diamond",
      "triangle-up",
      "triangle-down",
      "star",
    ],
    [],
  );

  const seriesWithColors = useMemo(() => {
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
  }, [seriesArray, variant, markerSize, defaultColors, defaultSymbols]);

  const gridColor = theme.gridColor;

  const plotData = useMemo(
    () =>
      seriesWithColors.map((series) => ({
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
            color: theme.paperBg,
            width: 1,
          },
        },
        hovertemplate: `${xTitle}: %{x}<br>${yTitle}: %{y}<extra>${series.name}</extra>`,
      })),
    [seriesWithColors, xTitle, yTitle, theme],
  );

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
          color: theme.legendColor,
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
            color: theme.textSecondary,
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
            color: theme.textSecondary,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 15,
        },
        gridcolor: gridColor,
        ...tickOptions,
      },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
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
  }, [width, height, xTitle, yTitle, plotData, titleOptions, tickOptions, gridColor, theme]);

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
