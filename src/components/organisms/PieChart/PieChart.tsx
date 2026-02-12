import { COLORS } from "@utils/colors";
import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";
import "./PieChart.scss";

interface PieDataSeries {
  labels: string[];
  values: number[];
  name: string;
  colors?: string[];
}

type PieTextInfo =
  | "none"
  | "label"
  | "percent"
  | "value"
  | "label+percent"
  | "label+value"
  | "value+percent"
  | "label+value+percent";

type PieChartProps = {
  dataSeries: PieDataSeries;
  width?: number;
  height?: number;
  title?: string;
  textInfo?: PieTextInfo;
  hole?: number;
  rotation?: number;
};

const DEFAULT_COLORS = [
  COLORS.BLUE,
  COLORS.GREEN,
  COLORS.ORANGE,
  COLORS.RED,
  COLORS.YELLOW,
  COLORS.PURPLE,
];

const PieChart: React.FC<PieChartProps> = ({
  dataSeries,
  width = 400,
  height = 400,
  title = "Pie Chart",
  textInfo = "percent",
  hole = 0,
  rotation = 0,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(() => {
    if (
      dataSeries.colors &&
      dataSeries.colors.length >= dataSeries.labels.length
    ) {
      return dataSeries.colors;
    }

    const result = [...(dataSeries.colors || [])];
    const missingColors = dataSeries.labels.length - result.length;

    if (missingColors <= 0) return result;

    for (let i = 0; i < missingColors; i++) {
      result.push(DEFAULT_COLORS[i % DEFAULT_COLORS.length]);
    }

    return result;
  }, [dataSeries.colors, dataSeries.labels.length]);

  useEffect(() => {
    if (!plotRef.current) return;

    const plotData = [
      {
        type: "pie" as const,
        labels: dataSeries.labels,
        values: dataSeries.values,
        name: dataSeries.name,
        marker: {
          colors: colors,
        },
        textinfo: textInfo,
        hoverinfo: "label+text+value" as const,
        insidetextfont: {
          size: 0,
          family: "Inter, sans-serif",
          color: "transparent",
        },
        hole: hole,
        rotation: rotation,
      },
    ];

    const layout = {
      width,
      height,
      font: {
        family: "Inter, sans-serif",
      },
      showlegend: false,
      margin: { l: 40, r: 40, b: 40, t: 40 },
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
  }, [colors, dataSeries.labels, dataSeries.name, dataSeries.values, width, height, textInfo, hole, rotation]);

  const PieChartLegend: React.FC<{ labels: string[]; colors: string[] }> = ({
    labels,
    colors,
  }) => {
    const items = labels.map((label, i) => (
      <React.Fragment key={label}>
        <div className="legend-item">
          <span className="color-box" style={{ background: colors[i] }} />
          {label}
          {i < labels.length - 1 && <span className="divider" />}
        </div>
      </React.Fragment>
    ));

    const rowSize = 6;
    const rows = [];
    for (let i = 0; i < items.length; i += rowSize) {
      rows.push(
        <div className="legend-row" key={i}>
          {items.slice(i, i + rowSize)}
        </div>
      );
    }
    return <div className="legend-container">{rows}</div>;
  };

  return (
    <div className="card-container" style={{ width: width }}>
      <div className="chart-container">
        {title && (
          <div className="title-container">
            <h2 className="title">{title}</h2>
          </div>
        )}
        <div
          ref={plotRef}
          style={{
            width: "100%",
            height: "100%",
            margin: "0",
          }}
        />
        <PieChartLegend labels={dataSeries.labels} colors={colors} />
      </div>
    </div>
  );
};

export { PieChart };
export type { PieDataSeries, PieTextInfo, PieChartProps };
