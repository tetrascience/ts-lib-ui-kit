import React, { useEffect, useRef } from "react";
import { COLORS } from "@utils/colors";
import Plotly from "plotly.js-dist";
import "./Histogram.scss";

interface HistogramDataSeries {
  x: number[];
  name: string;
  color?: string;
  autobinx?: boolean;
  xbins?: {
    start: number;
    end: number;
    size: number;
  };
  opacity?: number;
  showDistributionLine?: boolean;
  lineWidth?: number;
}

type HistogramProps = {
  dataSeries: HistogramDataSeries | HistogramDataSeries[];
  width?: number;
  height?: number;
  title?: string;
  xTitle?: string;
  yTitle?: string;
  bargap?: number;
  showDistributionLine?: boolean;
};

const calculateMean = (data: number[]): number => {
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

const calculateStdDev = (data: number[], mean: number): number => {
  const squaredDiffs = data.map((value) => Math.pow(value - mean, 2));
  const variance =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length;
  return Math.sqrt(variance);
};

const generateNormalDistributionPoints = (
  mean: number,
  stdDev: number,
  start: number,
  end: number,
  points = 100
): { x: number[]; y: number[] } => {
  const xValues: number[] = [];
  const yValues: number[] = [];

  const step = (end - start) / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = start + i * step;
    xValues.push(x);

    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    yValues.push(y);
  }

  return { x: xValues, y: yValues };
};

const scaleDistributionCurve = (
  yValues: number[],
  histogramData: number[],
  bins: { start: number; end: number; size: number }
): number[] => {
  const binCount = Math.ceil((bins.end - bins.start) / bins.size);
  const binFrequencies = Array(binCount).fill(0);

  histogramData.forEach((value) => {
    if (value >= bins.start && value <= bins.end) {
      const binIndex = Math.floor((value - bins.start) / bins.size);
      binFrequencies[binIndex]++;
    }
  });

  const maxBinFrequency = Math.max(...binFrequencies);
  const maxCurveValue = Math.max(...yValues);

  const scaleFactor = maxBinFrequency / maxCurveValue;

  return yValues.map((y) => y * scaleFactor);
};

const Histogram: React.FC<HistogramProps> = ({
  dataSeries,
  width = 480,
  height = 480,
  title = "Histogram",
  xTitle = "X Axis",
  yTitle = "Frequency",
  bargap = 0.2,
  showDistributionLine = false,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const seriesArray = Array.isArray(dataSeries) ? dataSeries : [dataSeries];
  const effectiveBarMode:
    | "stack"
    | "group"
    | "overlay"
    | "relative"
    | undefined = seriesArray.length > 1 ? "stack" : undefined;

  const defaultColors = [
    COLORS.ORANGE,
    COLORS.RED,
    COLORS.BLUE,
    COLORS.GREEN,
    COLORS.PURPLE,
    COLORS.YELLOW,
  ];

  const getSeriesWithColors = () => {
    return seriesArray.map((series, index) => {
      const hasDistributionLine =
        typeof series.showDistributionLine !== "undefined"
          ? series.showDistributionLine
          : showDistributionLine;

      return {
        ...series,
        color: series.color || defaultColors[index % defaultColors.length],
        opacity: hasDistributionLine ? 0.5 : series.opacity || 1,
        showDistributionLine: hasDistributionLine,
        lineWidth: series.lineWidth || 3,
      };
    });
  };

  const seriesWithColors = getSeriesWithColors();

  const gridColor = COLORS.GREY_200;

  const histogramData = seriesWithColors.map((series) => ({
    type: "histogram" as const,
    x: series.x,
    name: series.name,
    marker: {
      color: series.color,
      line: {
        color: COLORS.WHITE,
        width: 1,
      },
      opacity: series.opacity,
    },
    autobinx: series.autobinx,
    xbins: series.xbins,
    hovertemplate: `${xTitle}: %{x}<br>${yTitle}: %{y}<extra>${series.name}</extra>`,
  }));

  const distributionLines = seriesWithColors
    .filter((series) => series.showDistributionLine)
    .map((series) => {
      const mean = calculateMean(series.x);
      const stdDev = calculateStdDev(series.x, mean);

      const min = Math.min(...series.x);
      const max = Math.max(...series.x);
      const range = max - min;
      const start = min - range * 0.1;
      const end = max + range * 0.1;

      const bins = series.xbins || {
        start: start,
        end: end,
        size: range / 10,
      };

      const curvePoints = generateNormalDistributionPoints(
        mean,
        stdDev,
        start,
        end,
        100
      );

      const scaledYValues = scaleDistributionCurve(
        curvePoints.y,
        series.x,
        bins
      );

      return {
        type: "scatter" as const,
        x: curvePoints.x,
        y: scaledYValues,
        mode: "lines" as const,
        name: `${series.name} Distribution`,
        line: {
          color: series.color,
          width: series.lineWidth,
        },
        hoverinfo: "none" as const,
      };
    });

  const plotData = [...histogramData, ...distributionLines];

  useEffect(() => {
    if (!plotRef.current) return;

    const layout = {
      width,
      height,
      font: {
        family: "Inter, sans-serif",
      },
      showlegend: false,
      margin: { l: 90, r: 40, b: 80, t: 40 },
      xaxis: {
        title: {
          text: xTitle,
          font: {
            size: 16,
            color: COLORS.BLACK_600,
            family: "Inter, sans-serif",
            weight: 400,
          },
          standoff: 20,
        },
        gridcolor: gridColor,
        tickcolor: COLORS.GREY_200,
        ticklen: 8,
        tickwidth: 1,
        ticks: "outside" as const,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        zeroline: false,
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
          standoff: 20,
        },
        gridcolor: gridColor,
        tickcolor: COLORS.GREY_200,
        ticklen: 8,
        tickwidth: 1,
        ticks: "outside" as const,
        linecolor: COLORS.BLACK_900,
        linewidth: 1,
        zeroline: false,
        rangemode: "tozero" as const,
      },
      barmode: effectiveBarMode,
      bargap: bargap,
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
    title,
    xTitle,
    yTitle,
    bargap,
    showDistributionLine,
    plotData,
  ]);

  const ChartLegend: React.FC<{
    series: Array<{ name: string; color: string }>;
  }> = ({ series }) => {
    const items = series.map((item, i) => (
      <React.Fragment key={item.name}>
        <div className="legend-item">
          <span className="color-box" style={{ background: item.color }} />
          {item.name}
          {i < series.length - 1 && <span className="divider" />}
        </div>
      </React.Fragment>
    ));

    const rows = [];
    const rowSize = 6;
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
    <div className="histogram-container" style={{ width: width }}>
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
        <ChartLegend series={seriesWithColors} />
      </div>
    </div>
  );
};

export { Histogram };
export type { HistogramDataSeries, HistogramProps };
