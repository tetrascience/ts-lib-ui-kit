import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { chartDensityTokens, type ChartDensity } from "@/utils/chartDensity";
import { CHART_COLORS } from "@/utils/colors";

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
  /** Sizing preset; `"compact"` shrinks the title and margins for dashboard tiles */
  density?: ChartDensity;
};

const DEFAULT_COLORS = CHART_COLORS;

const PieChart: React.FC<PieChartProps> = ({
  dataSeries,
  width = 400,
  height = 400,
  title = "Pie Chart",
  textInfo = "percent",
  hole = 0,
  rotation = 0,
  density = "comfortable",
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const compact = density === "compact";
  // Slices are large hover targets, so the tooltip tracks the cursor (clamped
  // to the viewport) rather than pinning to the slice centroid
  const { bindTooltip, tooltipElement } = useChartTooltip({ followCursor: true });

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
        hoverinfo: "none" as const,
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
        color: theme.textColor,
      },
      showlegend: false,
      // Pie has no axes, so compact only needs to trim whitespace around the slices
      margin: compact ? { l: 8, r: 8, b: 8, t: 8 } : { l: 40, r: 40, b: 40, t: 40 },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
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

    return () => {
      if (plotElement) {
        Plotly.purge(plotElement);
      }
    };
  }, [colors, dataSeries.labels, dataSeries.name, dataSeries.values, width, height, textInfo, hole, rotation, theme, bindTooltip, compact]);

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
    <div className="card-container relative" style={{ width: width }}>
      <div className="chart-container">
        {title && (
          <div className="title-container">
            <h2
              className="title"
              style={compact ? { fontSize: chartDensityTokens(density).titleFontSize } : undefined}
            >
              {title}
            </h2>
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
      {tooltipElement}
    </div>
  );
};

export { PieChart };
export type { PieDataSeries, PieTextInfo, PieChartProps };
