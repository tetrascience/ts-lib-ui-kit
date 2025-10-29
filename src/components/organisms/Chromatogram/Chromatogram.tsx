import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./Chromatogram.scss";

interface PeakData {
  position: number;
  base?: string;
  peakA: number;
  peakT: number;
  peakG: number;
  peakC: number;
}

interface ChromatogramProps {
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

const Chromatogram: React.FC<ChromatogramProps> = ({
  data = [],
  width = 900,
  height = 600,
  positionInterval = 10,
  colorA = "#2D9CDB",
  colorT = "#A1C63C",
  colorG = "#FF5C64",
  colorC = "#FFA62E",
}) => {
  const plotRef = useRef<HTMLDivElement>(null);

  const positions = data.map((item) => item.position);
  const sequence = data.map((item) => determineBase(item));
  const peakA = data.map((item) => item.peakA);
  const peakT = data.map((item) => item.peakT);
  const peakG = data.map((item) => item.peakG);
  const peakC = data.map((item) => item.peakC);

  const aTrace = {
    x: positions,
    y: peakA,
    type: "scatter" as const,
    mode: "lines" as const,
    name: "A",
    line: { color: colorA, width: 2, shape: "spline" as const },
  };

  const tTrace = {
    x: positions,
    y: peakT,
    type: "scatter" as const,
    mode: "lines" as const,
    name: "T",
    line: { color: colorT, width: 2, shape: "spline" as const },
  };

  const gTrace = {
    x: positions,
    y: peakG,
    type: "scatter" as const,
    mode: "lines" as const,
    name: "G",
    line: { color: colorG, width: 2, shape: "spline" as const },
  };

  const cTrace = {
    x: positions,
    y: peakC,
    type: "scatter" as const,
    mode: "lines" as const,
    name: "C",
    line: { color: colorC, width: 2, shape: "spline" as const },
  };

  const maxValue = Math.max(...peakA, ...peakT, ...peakG, ...peakC);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const plotData = [aTrace, tTrace, gTrace, cTrace];

    const layout: Partial<Plotly.Layout> = {
      width: width,
      height: height - 75,
      margin: { l: 0, r: 0, b: 20, t: 10, pad: 0 },
      paper_bgcolor: "var(--white-900)",
      plot_bgcolor: "var(--white-900)",
      font: {
        family: "Inter, sans-serif",
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
        range: [0, maxValue * 1.05],
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

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [
    data,
    width,
    height,
    positionInterval,
    colorA,
    colorT,
    colorG,
    colorC,
    positions,
    peakA,
    peakT,
    peakG,
    peakC,
    maxValue,
  ]);

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
                : "var(--black-900)";

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
    <div className="chromatogram-container" style={{ width, height }}>
      {renderSequence()}
      <div className="chromatogram-chart">
        <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export { Chromatogram };
export type { PeakData, ChromatogramProps };
