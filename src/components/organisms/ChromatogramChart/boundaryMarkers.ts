/**
 * Boundary marker utilities for ChromatogramChart
 */

import { CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, BoundaryMarkerType } from "./types";
import type Plotly from "plotly.js-dist";

/**
 * Create a marker trace for a boundary point
 */
function createMarkerTrace(
  xPos: number,
  yPos: number,
  markerType: BoundaryMarkerType,
  color: string
): Plotly.Data[] {
  if (markerType === "none") {
    return [];
  }

  const traces: Plotly.Data[] = [];

  if (markerType === "diamond") {
    // Diamond marker with vertical line
    traces.push({
      x: [xPos, xPos],
      y: [0, yPos],
      type: "scatter" as const,
      mode: "lines" as const,
      line: { color, width: 1, dash: "dot" as const },
      showlegend: false,
      hoverinfo: "skip" as const,
    });
    traces.push({
      x: [xPos],
      y: [yPos],
      type: "scatter" as const,
      mode: "markers" as const,
      marker: { symbol: "diamond" as const, size: 8, color },
      showlegend: false,
      hoverinfo: "skip" as const,
    });
  } else {
    // Triangle marker (default)
    traces.push({
      x: [xPos],
      y: [yPos],
      type: "scatter" as const,
      mode: "markers" as const,
      marker: { symbol: "triangle-up" as const, size: 8, color },
      showlegend: false,
      hoverinfo: "skip" as const,
    });
  }

  return traces;
}

/**
 * Create boundary marker traces for peaks.
 * Uses per-peak startMarker/endMarker settings with defaults:
 * - startMarker: "triangle" (default)
 * - endMarker: "diamond" (default)
 */
export function createBoundaryMarkerTraces(
  allPeaks: {
    peaks: PeakAnnotation[];
    seriesIndex: number;
    x: number[];
    y: number[];
  }[]
): Plotly.Data[] {
  const traces: Plotly.Data[] = [];

  for (const { peaks, seriesIndex, x, y } of allPeaks) {
    const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];

    for (const peak of peaks) {
      const startIdx = peak._computed?.startIndex ?? 0;
      const endIdx = peak._computed?.endIndex ?? 0;
      const startX = x[startIdx];
      const startY = y[startIdx];
      const endX = x[endIdx];
      const endY = y[endIdx];

      // Get marker types with defaults: triangle at start, diamond at end
      const startMarkerType = peak.startMarker ?? "triangle";
      const endMarkerType = peak.endMarker ?? "diamond";

      // Create start boundary marker
      traces.push(...createMarkerTrace(startX, startY, startMarkerType, color));

      // Create end boundary marker
      traces.push(...createMarkerTrace(endX, endY, endMarkerType, color));
    }
  }

  return traces;
}

