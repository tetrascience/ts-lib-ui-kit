/**
 * Annotation utilities for ChromatogramChart
 */

import { COLORS, CHART_COLORS } from "../../../utils/colors";

import { CHROMATOGRAM_ANNOTATION } from "./constants";

import type { PeakAnnotation, PeakSelectionAppearance, PeakWithMeta } from "./types";
import type Plotly from "plotly.js-dist";

// ── Selection appearance helpers ─────────────────────────────────────────────

export interface ResolvedSelectionAppearance {
  selected: {
    borderColor: string;
    backgroundColor: string;
    bold: boolean;
  };
  unselected: {
    opacity: number;
  };
  hoverLineWidthMultiplier: number;
}

const DEFAULT_RESOLVED_APPEARANCE: ResolvedSelectionAppearance = {
  selected: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
    bold: true,
  },
  unselected: { opacity: 0.4 },
  hoverLineWidthMultiplier: 5 / 3,
};

export function resolveSelectionAppearance(
  appearance?: PeakSelectionAppearance
): ResolvedSelectionAppearance {
  if (!appearance) return DEFAULT_RESOLVED_APPEARANCE;
  const d = DEFAULT_RESOLVED_APPEARANCE;
  return {
    selected: {
      borderColor: appearance.selected?.borderColor ?? d.selected.borderColor,
      backgroundColor: appearance.selected?.backgroundColor ?? d.selected.backgroundColor,
      bold: appearance.selected?.bold ?? d.selected.bold,
    },
    unselected: {
      opacity: appearance.unselected?.opacity ?? d.unselected.opacity,
    },
    hoverLineWidthMultiplier:
      appearance.hoverLineWidthMultiplier ?? d.hoverLineWidthMultiplier,
  };
}

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

interface PeakAnnotationOptions {
  selectedPeakIds?: string[];
  anySelected?: boolean;
  appearance?: ResolvedSelectionAppearance;
}

interface AnnotationBorderStyle {
  bgcolor: string;
  bordercolor: string | undefined;
  borderwidth: number;
  opacity?: number;
}

/** Derives border/background/opacity from selection state — extracted to keep
 *  createPeakAnnotation within the allowed cognitive complexity budget. */
function resolveAnnotationBorderStyle(
  isSelected: boolean,
  isDimmed: boolean,
  isUserDefined: boolean,
  seriesColor: string,
  appearance: ResolvedSelectionAppearance
): AnnotationBorderStyle {
  const bgcolor = isSelected ? appearance.selected.backgroundColor : COLORS.WHITE;
  let bordercolor: string | undefined;
  if (isSelected) {
    bordercolor = appearance.selected.borderColor;
  } else {
    bordercolor = isUserDefined ? undefined : seriesColor;
  }
  const borderwidth = isSelected ? 2 : isUserDefined ? 0 : 1;
  const opacity = isDimmed ? appearance.unselected.opacity : undefined;
  return { bgcolor, bordercolor, borderwidth, ...(opacity === undefined ? {} : { opacity }) };
}

/**
 * Create a Plotly annotation for a peak.
 * seriesIndex of -1 indicates a user-defined annotation (uses grey/black styling).
 */
export function createPeakAnnotation(
  peak: PeakAnnotation,
  seriesIndex: number,
  slot: { ax: number; ay: number },
  options: PeakAnnotationOptions = {}
): Partial<Plotly.Annotations> {
  const {
    selectedPeakIds = [],
    anySelected = false,
    appearance = DEFAULT_RESOLVED_APPEARANCE,
  } = options;

  const isUserDefined = seriesIndex === -1;
  const color = isUserDefined
    ? COLORS.GREY_500
    : CHART_COLORS[seriesIndex % CHART_COLORS.length];
  const textColor = isUserDefined ? COLORS.BLACK_900 : color;

  const rawText = peak.text ?? (peak._computed?.area === undefined ? "" : `Area: ${peak._computed.area.toFixed(2)}`);

  const isSelected = peak.id !== undefined && selectedPeakIds.includes(peak.id);
  const isDimmed = !isSelected && anySelected;

  const text = isSelected && appearance.selected.bold ? `<b>${rawText}</b>` : rawText;

  // For user-defined annotations, respect their ax/ay if provided
  const ax = isUserDefined && peak.ax !== undefined ? peak.ax : slot.ax;
  const ay = isUserDefined && peak.ay !== undefined ? peak.ay : slot.ay;

  const borderStyle = resolveAnnotationBorderStyle(
    isSelected, isDimmed, isUserDefined, color, appearance
  );

  return {
    x: peak.x,
    y: peak.y,
    text,
    showarrow: true,
    arrowhead: 2,
    arrowsize: 1,
    arrowwidth: 1,
    arrowcolor: color,
    ax,
    ay,
    font: {
      size: isUserDefined
        ? CHROMATOGRAM_ANNOTATION.USER_ANNOTATION_FONT_SIZE
        : CHROMATOGRAM_ANNOTATION.AUTO_ANNOTATION_FONT_SIZE,
      color: textColor,
      family: "Inter, sans-serif",
    },
    borderpad: 2,
    ...borderStyle,
  };
}

/**
 * Create annotations for a group of peaks, handling overlap positioning
 */
export function createGroupAnnotations(
  group: PeakWithMeta[],
  options: PeakAnnotationOptions = {}
): Partial<Plotly.Annotations>[] {
  if (group.length === 1) {
    const { peak, seriesIndex } = group[0];
    return [createPeakAnnotation(peak, seriesIndex, ANNOTATION_SLOTS.default, options)];
  }

  // Sort by intensity (y, lowest first) so lower peaks get closer annotations
  const sortedGroup = [...group].sort((a, b) => a.peak.y - b.peak.y);

  return sortedGroup.map(({ peak, seriesIndex }, slotIndex) => {
    const slot =
      ANNOTATION_SLOTS.overlap[slotIndex % ANNOTATION_SLOTS.overlap.length];
    return createPeakAnnotation(peak, seriesIndex, slot, options);
  });
}

