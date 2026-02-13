/**
 * Boundary marker utilities for ChromatogramChart
 */

import { CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, BoundaryMarkerType } from "./types";
import type Plotly from "plotly.js-dist";

/** Base Y position for boundary markers (below the x-axis) */
const BOUNDARY_MARKER_BASE_Y = -5;
/** Y offset between series to prevent overlap */
const BOUNDARY_MARKER_Y_OFFSET = -8;

/**
 * Create a marker trace for a boundary point.
 * Markers are placed on the x-axis below 0, staggered by series index.
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

  return [
    {
      x: [xPos],
      y: [yPos],
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
    // Stagger y position by series index to prevent overlap
    const markerY = BOUNDARY_MARKER_BASE_Y + seriesIndex * BOUNDARY_MARKER_Y_OFFSET;

    for (const peak of peaks) {
      const startIdx = peak._computed?.startIndex ?? 0;
      const endIdx = peak._computed?.endIndex ?? 0;
      const startX = x[startIdx];
      const endX = x[endIdx];

      // Get marker types with defaults: triangle at start, diamond at end
      const startMarkerType = peak.startMarker ?? "triangle";
      const endMarkerType = peak.endMarker ?? "diamond";

      // Create start boundary marker (on x-axis below 0, staggered by series)
      traces.push(...createMarkerTrace(startX, markerY, startMarkerType, color));

      // Create end boundary marker (on x-axis below 0, staggered by series)
      traces.push(...createMarkerTrace(endX, markerY, endMarkerType, color));
    }
  }

  return traces;
}

