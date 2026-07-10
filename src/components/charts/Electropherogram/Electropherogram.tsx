import Plotly from "plotly.js-dist";
import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";

import { CHART_FONT_FAMILY, usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { CHART_COLORS } from "@/utils/colors";
import "./Electropherogram.scss";

/** Height offset for the plot area in pixels */
const PLOT_HEIGHT_OFFSET = 75;
/** Scale factor for y-axis range to add padding above max value */
const Y_AXIS_PADDING_FACTOR = 1.05;

interface PeakData {
  position: number;
  base?: string;
  peakA: number;
  peakT: number;
  peakG: number;
  peakC: number;
}

interface ElectropherogramProps {
  data?: PeakData[];
  width?: number;
  height?: number;
  positionInterval?: number;
  colorA?: string;
  colorT?: string;
  colorG?: string;
  colorC?: string;
}

const determineBase = (item: PeakData): string => {
  const peakValues = {
    A: item.peakA,
    T: item.peakT,
    G: item.peakG,
    C: item.peakC,
  };

  const values = Object.values(peakValues);
  const allEqual = values.every((val) => val === values[0]);

  if (allEqual) {
    return "";
  }

  let highestBase = "";
  let highestValue = 0;

  Object.entries(peakValues).forEach(([base, value]) => {
    if (value > highestValue) {
      highestBase = base;
      highestValue = value;
    }
  });

  return highestBase;
};

const Electropherogram: React.FC<ElectropherogramProps> = ({
  data = [],
  width = 900,
  height = 600,
  positionInterval = 10,
  colorA = CHART_COLORS[0], // blue
  colorT = CHART_COLORS[2], // teal/green
  colorG = CHART_COLORS[3], // red
  colorC = CHART_COLORS[1], // orange
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();
  const { bindTooltip, tooltipElement } = useChartTooltip({
    xLabel: "Position",
    yLabel: "Intensity",
  });

  const positions = useMemo(() => data.map((item) => item.position), [data]);
  const sequence = useMemo(() => data.map((item) => determineBase(item)), [data]);
  const peakA = useMemo(() => data.map((item) => item.peakA), [data]);
  const peakT = useMemo(() => data.map((item) => item.peakT), [data]);
  const peakG = useMemo(() => data.map((item) => item.peakG), [data]);
  const peakC = useMemo(() => data.map((item) => item.peakC), [data]);

  const aTrace = useMemo(
    () => ({
      x: positions,
      y: peakA,
      type: "scatter" as const,
      mode: "lines" as const,
      hoverinfo: "none" as const,
      name: "A",
      line: { color: colorA, width: 2, shape: "spline" as const },
    }),
    [positions, peakA, colorA],
  );

  const tTrace = useMemo(
    () => ({
      x: positions,
      y: peakT,
      type: "scatter" as const,
      mode: "lines" as const,
      hoverinfo: "none" as const,
      name: "T",
      line: { color: colorT, width: 2, shape: "spline" as const },
    }),
    [positions, peakT, colorT],
  );

  const gTrace = useMemo(
    () => ({
      x: positions,
      y: peakG,
      type: "scatter" as const,
      mode: "lines" as const,
      hoverinfo: "none" as const,
      name: "G",
      line: { color: colorG, width: 2, shape: "spline" as const },
    }),
    [positions, peakG, colorG],
  );

  const cTrace = useMemo(
    () => ({
      x: positions,
      y: peakC,
      type: "scatter" as const,
      mode: "lines" as const,
      hoverinfo: "none" as const,
      name: "C",
      line: { color: colorC, width: 2, shape: "spline" as const },
    }),
    [positions, peakC, colorC],
  );

  const maxValue = useMemo(
    () => Math.max(...peakA, ...peakT, ...peakG, ...peakC),
    [peakA, peakT, peakG, peakC],
  );

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const plotData = [aTrace, tTrace, gTrace, cTrace];

    const layout: Partial<Plotly.Layout> = {
      width: width,
      height: height - PLOT_HEIGHT_OFFSET,
      margin: { l: 0, r: 0, b: 20, t: 10, pad: 0 },
      paper_bgcolor: theme.paperBg,
      plot_bgcolor: theme.plotBg,
      font: {
        family: CHART_FONT_FAMILY,
      },
      showlegend: false,
      xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        showline: false,
        range: [Math.min(...positions), Math.max(...positions)],
        fixedrange: true,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        showline: false,
        range: [0, maxValue * Y_AXIS_PADDING_FACTOR],
        fixedrange: true,
      },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      fillFrame: true,
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
  }, [data, width, height, aTrace, tTrace, gTrace, cTrace, maxValue, positions, theme, bindTooltip]);

  if (data.length === 0) {
    return <div className="chart-container">No data available</div>;
  }

  const renderSequence = () => {
    const renderSequenceLetters = () => {
      const minPosition = Math.min(...positions);
      const maxPosition = Math.max(...positions);
      const chartWidth = width;

      return (
        <div className="sequence-letters-container">
          {sequence.map((base, index) => {
            const position = positions[index];
            const color =
              base === "A"
                ? colorA
                : base === "T"
                ? colorT
                : base === "G"
                ? colorG
                : base === "C"
                ? colorC
                : theme.textColor;

            const percentage =
              (position - minPosition) / (maxPosition - minPosition);
            const leftPosition = percentage * chartWidth;

            return (
              <span
                key={`base-${index}`}
                className="sequence-letter"
                style={{
                  left: `${leftPosition}px`,
                  color,
                }}
              >
                {base}
              </span>
            );
          })}
        </div>
      );
    };

    const renderPositionNumbers = () => {
      const minPosition = Math.min(...positions);
      const maxPosition = Math.max(...positions);
      const chartWidth = width;

      const startPos =
        Math.ceil(minPosition / positionInterval) * positionInterval;

      const regularPositionLabels: Array<{ position: number; label: string }> =
        [];

      for (let pos = startPos; pos <= maxPosition; pos += positionInterval) {
        regularPositionLabels.push({
          position: pos,
          label: pos.toString(),
        });
      }

      return (
        <div className="position-numbers-container">
          {regularPositionLabels.map((label) => {
            const percentage =
              (label.position - minPosition) / (maxPosition - minPosition);
            const leftPosition = percentage * chartWidth;

            return (
              <span
                key={`pos-${label.position}`}
                className="position-number"
                style={{
                  left: `${leftPosition}px`,
                }}
              >
                {label.label}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <div className="sequence-header">
        {renderSequenceLetters()}
        {renderPositionNumbers()}
      </div>
    );
  };

  return (
    <div className="electropherogram-container relative" style={{ width, height }}>
      {renderSequence()}
      <div className="electropherogram-chart">
        <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {tooltipElement}
    </div>
  );
};

export { Electropherogram };
export type { PeakData, ElectropherogramProps };
