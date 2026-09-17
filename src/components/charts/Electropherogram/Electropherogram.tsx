import React, { useEffect, useRef, useMemo } from "react";

import { useChartTooltip } from "../ChartTooltip";
import { getLoadedPlotly, loadPlotly } from "../plotly-loader";

import type Plotly from "plotly.js-dist";

import { CHART_FONT_FAMILY, usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { CHART_COLORS } from "@/utils/colors";
import "./Electropherogram.scss";

/**
 * Height of the sequence header above the plot (see Electropherogram.scss:
 * 12 + 6 padding, 35 + 6 letters row, 30 numbers row). The plot gets the rest.
 */
const PLOT_HEIGHT_OFFSET = 89;
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
  if (item.base !== undefined) return item.base;
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

  // The plot has no side margins, so an x-range that ends exactly on the first
  // and last sample clips the outermost peaks and pushes their base letters
  // half off the canvas (SW-2298). Pad by half a sample step on each side; the
  // header letters/numbers share this mapping so they stay aligned to peaks.
  const { xMin, xMax } = useMemo(() => {
    if (positions.length === 0) return { xMin: 0, xMax: 1 };
    const min = Math.min(...positions);
    const max = Math.max(...positions);
    const step = positions.length > 1 ? (max - min) / (positions.length - 1) : 1;
    const pad = step / 2;
    return { xMin: min - pad, xMax: max + pad };
  }, [positions]);
  const xToPx = (position: number) => ((position - xMin) / (xMax - xMin)) * width;

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
        range: [xMin, xMax],
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

    // Plotly is loaded lazily so it stays out of the consumer's main chunk
    // (SW-2007); the draw is skipped if the effect re-runs or unmounts first.
    let cancelled = false;
    let plotElement: HTMLDivElement | null = null;
    void loadPlotly().then((plotly) => {
      if (cancelled || !plotRef.current) return;
      plotly.newPlot(plotRef.current, plotData, layout, config);
      bindTooltip(plotRef.current);

      // Capture ref value for cleanup
      plotElement = plotRef.current;
    });

    return () => {
      cancelled = true;
      if (plotElement) {
        getLoadedPlotly().purge(plotElement);
      }
    };
  }, [data, width, height, aTrace, tTrace, gTrace, cTrace, maxValue, xMin, xMax, theme, bindTooltip]);

  if (data.length === 0) {
    return <div className="electropherogram-empty">No data available</div>;
  }

  const renderSequence = () => {
    const renderSequenceLetters = () => {
      return (
        <div className="electropherogram-sequence-letters">
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

            const leftPosition = xToPx(position);

            return (
              <span
                key={`base-${index}`}
                className="electropherogram-sequence-letter"
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
        <div className="electropherogram-position-numbers">
          {regularPositionLabels.map((label) => {
            const leftPosition = xToPx(label.position);

            return (
              <span
                key={`pos-${label.position}`}
                className="electropherogram-position-number"
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
      <div className="electropherogram-sequence-header">
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
