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
 */
export function buildRangeAnnotationElements(
  rangeAnnotations: RangeAnnotation[],
  overlapThreshold: number,
  seriesData: { x: number[]; y: number[] }[]
): {
  shapes: Partial<Plotly.Shape>[];
  annotations: Partial<Plotly.Annotations>[];
} {
  const lanes = assignRangeLanes(rangeAnnotations, overlapThreshold);
  const shapes: Partial<Plotly.Shape>[] = [];
  const annotations: Partial<Plotly.Annotations>[] = [];

  const globalMaxY = computeGlobalMaxY(seriesData);

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
      // Lane 0 is flush with the top of the plot; higher lanes step downward.
      shapeY1 = 1.0 - lane * stride;
      shapeY0 = shapeY1 - barHeight;
      yref = "paper";
    } else {
      const baseY =
        yAnchor === "auto"
          ? computeLocalPeakY(ann.startX, ann.endX, seriesData)
          : (yAnchor as number);
      const barHeight =
        ann.barHeight ?? globalMaxY * RANGE_ANNOTATION.AUTO_BAR_HEIGHT_FACTOR;
      const laneOffset =
        lane * barHeight * RANGE_ANNOTATION.LANE_DATA_STRIDE_FACTOR;
      // Lane 0 sits closest to the data; higher lanes stack away from the signal.
      shapeY0 = baseY + laneOffset;
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

  return { shapes, annotations };
}

function computeLocalPeakY(
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
  return maxY * RANGE_ANNOTATION.AUTO_Y_CLEARANCE_FACTOR;
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
