/**
 * Boundary marker utilities for ChromatogramChart
 */

import { CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, BoundaryMarkerType } from "./types";
import type Plotly from "plotly.js-dist";

/** Y position for boundary markers (below the x-axis) */
const BOUNDARY_MARKER_Y = -5;

/**
 * Create a marker trace for a boundary point.
 * Markers are placed on the x-axis below 0.
 */
function createMarkerTrace(
  xPos: number,
  markerType: BoundaryMarkerType,
  color: string
): Plotly.Data[] {
  if (markerType === "none") {
    return [];
  }

  return [
    {
      x: [xPos],
      y: [BOUNDARY_MARKER_Y],
      type: "scatter" as const,
      mode: "markers" as const,
      marker: {
        symbol: markerType === "diamond" ? ("diamond" as const) : ("triangle-up" as const),
        size: 8,
        color,
      },
      showlegend: false,
      hoverinfo: "skip" as const,
    },
  ];
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

  for (const { peaks, seriesIndex, x } of allPeaks) {
    const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];

    for (const peak of peaks) {
      const startIdx = peak._computed?.startIndex ?? 0;
      const endIdx = peak._computed?.endIndex ?? 0;
      const startX = x[startIdx];
      const endX = x[endIdx];

      // Get marker types with defaults: triangle at start, diamond at end
      const startMarkerType = peak.startMarker ?? "triangle";
      const endMarkerType = peak.endMarker ?? "diamond";

      // Create start boundary marker (on x-axis below 0)
      traces.push(...createMarkerTrace(startX, startMarkerType, color));

      // Create end boundary marker (on x-axis below 0)
      traces.push(...createMarkerTrace(endX, endMarkerType, color));
    }
  }

  return traces;
}

