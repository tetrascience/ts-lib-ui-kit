/**
 * Boundary marker utilities for ChromatogramChart
 */

import { CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, BoundaryMarkerStyle } from "./types";
import type Plotly from "plotly.js-dist";

/**
 * Check if two peaks overlap (share boundary indices)
 */
export function peaksOverlap(
  peak1: PeakAnnotation,
  peak2: PeakAnnotation
): boolean {
  const p1End = peak1.endIndex ?? 0;
  const p1Start = peak1.startIndex ?? 0;
  const p2End = peak2.endIndex ?? 0;
  const p2Start = peak2.startIndex ?? 0;
  return p1End >= p2Start && p2End >= p1Start;
}

/**
 * Determine if a peak boundary is shared with another peak
 */
export function findOverlappingPeaks(
  peaks: PeakAnnotation[],
  currentPeak: PeakAnnotation
): { startOverlaps: boolean; endOverlaps: boolean } {
  let startOverlaps = false;
  let endOverlaps = false;

  const currentStart = currentPeak.startIndex ?? 0;
  const currentEnd = currentPeak.endIndex ?? 0;

  for (const other of peaks) {
    if (other.index === currentPeak.index) continue;
    if (peaksOverlap(currentPeak, other)) {
      const otherStart = other.startIndex ?? 0;
      const otherEnd = other.endIndex ?? 0;
      // Check if start boundary is shared
      if (Math.abs(currentStart - otherEnd) <= 1) {
        startOverlaps = true;
      }
      // Check if end boundary is shared
      if (Math.abs(currentEnd - otherStart) <= 1) {
        endOverlaps = true;
      }
    }
  }

  return { startOverlaps, endOverlaps };
}

/**
 * Create boundary marker traces for peaks
 */
export function createBoundaryMarkerTraces(
  allPeaks: {
    peaks: PeakAnnotation[];
    seriesIndex: number;
    x: number[];
    y: number[];
  }[],
  markerStyle: BoundaryMarkerStyle
): Plotly.Data[] {
  const traces: Plotly.Data[] = [];

  // Flatten all peaks for overlap detection
  const flatPeaks = allPeaks.flatMap(({ peaks }) => peaks);

  for (const { peaks, seriesIndex, x, y } of allPeaks) {
    const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];

    for (const peak of peaks) {
      const { startOverlaps, endOverlaps } =
        markerStyle === "auto"
          ? findOverlappingPeaks(flatPeaks, peak)
          : {
              startOverlaps: markerStyle === "diamond",
              endOverlaps: markerStyle === "diamond",
            };

      const startIdx = peak.startIndex ?? 0;
      const endIdx = peak.endIndex ?? 0;
      const startX = x[startIdx];
      const startY = y[startIdx];
      const endX = x[endIdx];
      const endY = y[endIdx];

      // Create start boundary marker
      if (startOverlaps) {
        // Diamond marker with vertical line for overlapping boundary
        traces.push({
          x: [startX, startX],
          y: [0, startY],
          type: "scatter" as const,
          mode: "lines" as const,
          line: { color, width: 1, dash: "dot" as const },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
        traces.push({
          x: [startX],
          y: [startY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "diamond" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      } else {
        // Triangle marker for isolated boundary at baseline
        traces.push({
          x: [startX],
          y: [startY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "triangle-up" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      }

      // Create end boundary marker
      if (endOverlaps) {
        // Diamond marker with vertical line for overlapping boundary
        traces.push({
          x: [endX, endX],
          y: [0, endY],
          type: "scatter" as const,
          mode: "lines" as const,
          line: { color, width: 1, dash: "dot" as const },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
        traces.push({
          x: [endX],
          y: [endY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "diamond" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      } else {
        // Triangle marker for isolated boundary at baseline
        traces.push({
          x: [endX],
          y: [endY],
          type: "scatter" as const,
          mode: "markers" as const,
          marker: { symbol: "triangle-up" as const, size: 8, color },
          showlegend: false,
          hoverinfo: "skip" as const,
        });
      }
    }
  }

  return traces;
}

