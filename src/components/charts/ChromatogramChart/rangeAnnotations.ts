import { CHART_COLORS } from "../../../utils/colors";

import { RANGE_ANNOTATION } from "./constants";

import type { RangeAnnotation } from "./types";
import type Plotly from "plotly.js-dist";

/**
 * Assign a lane index to each RangeAnnotation.
 *
 * Annotations with an explicit `lane` value keep it; the rest are greedy-assigned
 * (sorted by startX) to the lowest lane where they do not overlap any already-placed
 * annotation (within `overlapThreshold` x-units).
 */
export function assignRangeLanes(
  annotations: RangeAnnotation[],
  overlapThreshold: number
): number[] {
  const assignedLanes = new Array<number>(annotations.length).fill(-1);

  // Track the rightmost endX seen in each lane (initialised lazily).
  const laneEndX: number[] = [];

  const setLaneEnd = (lane: number, endX: number) => {
    while (laneEndX.length <= lane) laneEndX.push(-Infinity);
    laneEndX[lane] = Math.max(laneEndX[lane], endX);
  };

  // First pass: honour explicit lane values so they reserve space.
  annotations.forEach((ann, i) => {
    if (ann.lane !== undefined) {
      assignedLanes[i] = ann.lane;
      setLaneEnd(ann.lane, ann.endX);
    }
  });

  // Second pass: greedy auto-assign, processed in startX order.
  const autoIndices = annotations
    .map((_, i) => i)
    .filter((i) => assignedLanes[i] === -1)
    .sort((a, b) => annotations[a].startX - annotations[b].startX);

  for (const idx of autoIndices) {
    const ann = annotations[idx];

    // Find the lowest lane where this bar fits (no overlap with threshold).
    let chosenLane = laneEndX.findIndex(
      (end) => ann.startX >= end - overlapThreshold
    );

    if (chosenLane === -1) {
      chosenLane = laneEndX.length;
    }

    assignedLanes[idx] = chosenLane;
    setLaneEnd(chosenLane, ann.endX);
  }

  return assignedLanes;
}

/**
 * Build Plotly shapes (colored bars) and annotations (labels) for all range annotations.
 *
 * Also returns `yDomainMax`: the fraction of the plot height that the y-axis should
 * occupy. When "top" bars are present the y-axis is shrunk so that the reserved zone
 * above it (paper-y from yDomainMax to 1.0) is always blank, preventing the bars from
 * visually overlapping with the signal no matter how tall the data is.
 */
export function buildRangeAnnotationElements(
  rangeAnnotations: RangeAnnotation[],
  overlapThreshold: number,
  seriesData: { x: number[]; y: number[] }[]
): {
  shapes: Partial<Plotly.Shape>[];
  annotations: Partial<Plotly.Annotations>[];
  yDomainMax: number;
} {
  const lanes = assignRangeLanes(rangeAnnotations, overlapThreshold);
  const shapes: Partial<Plotly.Shape>[] = [];
  const annotations: Partial<Plotly.Annotations>[] = [];
  const globalMaxY = computeGlobalMaxY(seriesData);

  // Determine how many "top" lanes are used and shrink the y-axis domain accordingly.
  // Each lane needs BAR_HEIGHT_PAPER + LANE_GAP_PAPER of vertical space.
  let maxTopLane = -1;
  rangeAnnotations.forEach((ann, i) => {
    if ((ann.yAnchor ?? "top") === "top") {
      maxTopLane = Math.max(maxTopLane, lanes[i]);
    }
  });
  const topLaneCount = maxTopLane + 1;
  const defaultStride = RANGE_ANNOTATION.BAR_HEIGHT_PAPER + RANGE_ANNOTATION.LANE_GAP_PAPER;
  // Add one extra gap below the lowest bar so it doesn't sit flush against the data.
  const yDomainMax =
    topLaneCount > 0
      ? Math.max(1.0 - topLaneCount * defaultStride - RANGE_ANNOTATION.LANE_GAP_PAPER, 0.5)
      : 1.0;

  rangeAnnotations.forEach((ann, i) => {
    const lane = lanes[i];
    const color = ann.color ?? CHART_COLORS[i % CHART_COLORS.length];
    const opacity = ann.opacity ?? RANGE_ANNOTATION.DEFAULT_OPACITY;
    const fontSize = ann.fontSize ?? RANGE_ANNOTATION.DEFAULT_FONT_SIZE;
    const labelColor = ann.labelColor ?? color;
    const yAnchor = ann.yAnchor ?? "top";
    const centerX = (ann.startX + ann.endX) / 2;

    let shapeY0: number;
    let shapeY1: number;
    let yref: "paper" | "y";

    if (yAnchor === "top") {
      const barHeight = ann.barHeight ?? RANGE_ANNOTATION.BAR_HEIGHT_PAPER;
      const stride = barHeight + RANGE_ANNOTATION.LANE_GAP_PAPER;
      // Lane 0 sits flush with paper-y 1.0; higher lanes step downward.
      // Because the y-axis domain ends at yDomainMax, these bars render in the
      // reserved blank zone above the axes — always clear of the signal.
      shapeY1 = 1.0 - lane * stride;
      shapeY0 = shapeY1 - barHeight;
      yref = "paper";
    } else if (yAnchor === "auto") {
      // Estimate where the local peak sits in paper-space, scaled to yDomainMax so the
      // estimate is accurate after domain adjustment.
      const localMaxY = computeLocalMaxY(ann.startX, ann.endX, seriesData);
      const barHeight = ann.barHeight ?? RANGE_ANNOTATION.BAR_HEIGHT_PAPER;
      const stride = barHeight + RANGE_ANNOTATION.LANE_GAP_PAPER;
      const estimatedPeakPaperY =
        globalMaxY > 0
          ? (localMaxY / (globalMaxY * RANGE_ANNOTATION.AUTO_YRANGE_MARGIN)) * yDomainMax
          : yDomainMax * 0.5;
      const baseY = Math.min(
        estimatedPeakPaperY + RANGE_ANNOTATION.AUTO_PAPER_CLEARANCE,
        yDomainMax - barHeight
      );
      // Lane 0 = closest to the peak; higher lanes stack upward (away from data).
      shapeY1 = Math.min(baseY + lane * stride + barHeight, yDomainMax);
      shapeY0 = shapeY1 - barHeight;
      yref = "paper";
    } else {
      // Explicit data-coordinate placement.
      const barHeight = ann.barHeight ?? globalMaxY * RANGE_ANNOTATION.DATA_BAR_HEIGHT_FACTOR;
      const laneOffset = lane * barHeight * RANGE_ANNOTATION.LANE_DATA_STRIDE_FACTOR;
      shapeY0 = (yAnchor as number) + laneOffset;
      shapeY1 = shapeY0 + barHeight;
      yref = "y";
    }

    const labelY = (shapeY0 + shapeY1) / 2;

    shapes.push({
      type: "rect",
      xref: "x",
      yref,
      x0: ann.startX,
      x1: ann.endX,
      y0: shapeY0,
      y1: shapeY1,
      fillcolor: color,
      opacity,
      line: { width: 0 },
    });

    annotations.push({
      x: centerX,
      y: labelY,
      xref: "x",
      yref,
      text: ann.label,
      showarrow: false,
      font: {
        size: fontSize,
        color: labelColor,
        family: "Inter, sans-serif",
      },
      xanchor: "center",
      yanchor: "middle",
    });
  });

  return { shapes, annotations, yDomainMax };
}

function computeLocalMaxY(
  startX: number,
  endX: number,
  seriesData: { x: number[]; y: number[] }[]
): number {
  let maxY = 0;
  for (const s of seriesData) {
    for (let j = 0; j < s.x.length; j++) {
      if (s.x[j] >= startX && s.x[j] <= endX && s.y[j] > maxY) {
        maxY = s.y[j];
      }
    }
  }
  return maxY;
}

function computeGlobalMaxY(seriesData: { x: number[]; y: number[] }[]): number {
  let maxY = 0;
  for (const s of seriesData) {
    for (const y of s.y) {
      if (y > maxY) maxY = y;
    }
  }
  return maxY;
}
