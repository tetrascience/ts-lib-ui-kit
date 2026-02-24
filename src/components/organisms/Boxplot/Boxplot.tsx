import { COLORS } from "@utils/colors";
import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";
import "./Boxplot.scss";

/** Default point position offset from the box edge */
const DEFAULT_POINT_POSITION = -1.8;

export interface BoxDataSeries {
  y: number[];
  name: string;
  color: string;
  x?: string[] | number[];
  boxpoints?: "all" | "outliers" | "suspectedoutliers" | false;
  jitter?: number;
  pointpos?: number;
}

/** Props for the Boxplot component */
export interface BoxplotProps {
  dataSeries: BoxDataSeries[];
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  xTitle?: string;
  yTitle?: string;
  title?: string;
  showPoints?: boolean;
}

/** A box plot chart using Plotly for visualizing data distribution with optional outlier points */
export const Boxplot: React.FC<BoxplotProps> = ({
  dataSeries,
  width = 1000,
  height = 600,
  xRange,
  yRange,
  xTitle = "Columns",
  yTitle = "Rows",
  title = "Boxplot",
  showPoints = false,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);

  const { yMin, yMax } = useMemo(() => {
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    dataSeries.forEach((series) => {
      series.y.forEach((y) => {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });

    const yPadding = (maxY - minY) * 0.1;

    return {
      yMin: minY - yPadding,
      yMax: maxY + yPadding,
    };
  }, [dataSeries]);

  const effectiveYRange = useMemo(
    () => yRange || [yMin, yMax],
    [yRange, yMin, yMax],
  );

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
    }),
    [],
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
        color: COLORS.BLACK_900,
        lineheight: 1.2,
        standoff: 30,
      },
    }),
    [title],
  );

  useEffect(() => {
    if (!plotRef.current) return;

    const data = dataSeries.map((series) => ({
      y: series.y,
      x: series.x,
      type: "box" as const,
      name: series.name,
      marker: {
        color: series.color,
      },
      line: {
        color: series.color,
      },
      fillcolor: series.color + "40", // Add transparency
      boxpoints: showPoints ? series.boxpoints || "outliers" : (false as const),
      jitter: series.jitter || 0.3,
      pointpos: series.pointpos || DEFAULT_POINT_POSITION,
    }));

    const layout = {
      width,
      height: height,
      title: titleOptions,
      margin: { l: 80, r: 40, b: 80, t: 80, pad: 0 },
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
          standoff: 15,
        },
        gridcolor: COLORS.GREY_200,
        range: xRange,
        autorange: !xRange,
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
          standoff: 15,
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
          size: 13,
          color: COLORS.BLUE_900,
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

    // Capture ref value for cleanup
    const plotElement = plotRef.current;

    // Cleanup function
    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
      }
    };
  }, [dataSeries, width, height, xRange, yRange, effectiveYRange, xTitle, yTitle, showPoints, titleOptions, tickOptions, yTicks]);

  return (
    <div className="boxplot-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Boxplot;
