/**
 * Annotation utilities for ChromatogramChart
 */

import { COLORS, CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, PeakWithMeta } from "./types";
import type Plotly from "plotly.js-dist";

/**
 * Annotation slot positions for peak labels
 */
export const ANNOTATION_SLOTS = {
  default: { ax: 0, ay: -35 },
  overlap: [
    { ax: 50, ay: -35 }, // Right, level 1
    { ax: -60, ay: -35 }, // Left, level 1
    { ax: 70, ay: -55 }, // Right, level 2
    { ax: -80, ay: -55 }, // Left, level 2
    { ax: 50, ay: -75 }, // Right, level 3
    { ax: -60, ay: -75 }, // Left, level 3
  ],
};

/**
 * Group overlapping peaks by retention time (x) proximity
 */
export function groupOverlappingPeaks(
  peaksWithMeta: PeakWithMeta[],
  overlapThreshold: number
): PeakWithMeta[][] {
  const sorted = [...peaksWithMeta].sort((a, b) => a.peak.x - b.peak.x);

  const groups: PeakWithMeta[][] = [];
  let currentGroup: PeakWithMeta[] = [];

  for (const current of sorted) {
    if (currentGroup.length === 0) {
      currentGroup.push(current);
      continue;
    }

    const lastInGroup = currentGroup[currentGroup.length - 1];
    const timeDiff = Math.abs(current.peak.x - lastInGroup.peak.x);

    if (timeDiff < overlapThreshold) {
      currentGroup.push(current);
    } else {
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Create a Plotly annotation for a peak
 */
export function createPeakAnnotation(
  peak: PeakAnnotation,
  seriesIndex: number,
  slot: { ax: number; ay: number }
): Partial<Plotly.Annotations> {
  const color = CHART_COLORS[seriesIndex % CHART_COLORS.length];
  // Use provided text or auto-generate from computed area
  const text = peak.text ?? (peak._computed?.area === undefined ? "" : `Area: ${peak._computed.area.toFixed(2)}`);
  return {
    x: peak.x,
    y: peak.y,
    text,
    showarrow: true,
    arrowhead: 2,
    arrowsize: 1,
    arrowwidth: 1,
    arrowcolor: color,
    ax: slot.ax,
    ay: slot.ay,
    font: {
      size: 10,
      color: color,
      family: "Inter, sans-serif",
    },
    bgcolor: COLORS.WHITE,
    borderpad: 2,
    bordercolor: color,
    borderwidth: 1,
  };
}

/**
 * Create annotations for a group of peaks, handling overlap positioning
 */
export function createGroupAnnotations(
  group: PeakWithMeta[]
): Partial<Plotly.Annotations>[] {
  if (group.length === 1) {
    const { peak, seriesIndex } = group[0];
    return [createPeakAnnotation(peak, seriesIndex, ANNOTATION_SLOTS.default)];
  }

  // Sort by intensity (y, lowest first) so lower peaks get closer annotations
  const sortedGroup = [...group].sort((a, b) => a.peak.y - b.peak.y);

  return sortedGroup.map(({ peak, seriesIndex }, slotIndex) => {
    const slot =
      ANNOTATION_SLOTS.overlap[slotIndex % ANNOTATION_SLOTS.overlap.length];
    return createPeakAnnotation(peak, seriesIndex, slot);
  });
}

