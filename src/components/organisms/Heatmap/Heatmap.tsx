import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./Heatmap.scss";

interface HeatmapProps {
  data?: number[][];
  xLabels?: string[] | number[];
  yLabels?: string[] | number[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
  colorscale?: string | Array<[number, string]>;
  width?: number;
  height?: number;
  showScale?: boolean;
  precision?: number;
  zmin?: number;
  zmax?: number;
  valueUnit?: string;
}

function generateRandomData(
  rows: number,
  cols: number,
  min: number = 0,
  max: number = 1
): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(min + Math.random() * (max - min));
    }
    result.push(row);
  }
  return result;
}

function generateAlphabetLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}

function normalizeData(data: number[][]): number[][] {
  if (!data || data.length === 0) return [];

  const maxLength = Math.max(...data.map((row) => row.length));

  return data.map((row) => {
    if (row.length === maxLength) return row;

    const newRow = [...row];
    while (newRow.length < maxLength) {
      newRow.push(0);
    }
    return newRow;
  });
}

const defaultColorScale: Array<[number, string]> = [
  [0, "#092761"],
  [0.15, "#141950"],
  [0.3, "#282D73"],
  [0.45, "#463782"],
  [0.6, "#643C8C"],
  [0.7, "#8C4696"],
  [0.8, "#B45096"],
  [0.9, "#DC5A8C"],
  [0.95, "#FA6482"],
  [1, "#FF5C64"],
];

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  xLabels,
  yLabels,
  title,
  xTitle = "Columns",
  yTitle = "Rows",
  colorscale = defaultColorScale,
  width = 800,
  height = 600,
  showScale = true,
  precision = 0,
  zmin = 0,
  zmax = 50000,
  valueUnit = "",
}) => {
  const plotRef = useRef<HTMLDivElement>(null);

  let chartData = data || generateRandomData(16, 24, 5000, 50000);

  chartData = normalizeData(chartData);

  const maxCols = chartData.length > 0 ? chartData[0].length : 24;

  const defaultXLabels =
    xLabels || Array.from({ length: maxCols }, (_, i) => i + 1);
  const defaultYLabels = yLabels || generateAlphabetLabels(chartData.length);

  useEffect(() => {
    if (!plotRef.current) return;

    const plotData = [
      {
        z: chartData,
        x: defaultXLabels,
        y: defaultYLabels,
        type: "heatmap" as const,
        colorscale: colorscale,
        showscale: showScale,
        zsmooth: false as const,
        hovertemplate: `Row: %{y}<br>Column: %{x}<br>Value: %{z:.${precision}f}${valueUnit}<extra></extra>`,
        zmin: zmin,
        zmax: zmax,
        colorbar: {
          thickness: 28,
          len: 1,
          outlinewidth: 0,
          ticksuffix: valueUnit,
          y: 0.5,
          yanchor: "middle" as const,
        },
      },
    ];

    const layout = {
      title: {
        text: title || "",
        font: {
          family: "Inter, sans-serif",
          size: 20,
          color: "var(--black-300)",
        },
        y: 0.98,
        yanchor: "top" as const,
      },
      width: width,
      height: height,
      margin: { l: 70, r: 70, b: 70, t: 100, pad: 5 },
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        side: "top" as const,
        fixedrange: true,
      },
      yaxis: {
        title: {
          text: yTitle,
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        autorange: "reversed" as const,
        fixedrange: true,
      },
      paper_bgcolor: "var(--white-900)",
      plot_bgcolor: "var(--white-900)",
      font: {
        family: "Inter, sans-serif",
        color: "var(--grey-600)",
      },
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
    data,
    xLabels,
    yLabels,
    title,
    xTitle,
    yTitle,
    colorscale,
    width,
    height,
    showScale,
    precision,
    zmin,
    zmax,
    valueUnit,
  ]);

  return (
    <div className="heatmap-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { Heatmap };
export type { HeatmapProps };
