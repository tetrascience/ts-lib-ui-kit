import { describe, it, expect } from "vitest";

import {
  resolveSelectionAppearance,
  groupOverlappingPeaks,
  createPeakAnnotation,
  createGroupAnnotations,
  ANNOTATION_SLOTS,
} from "../annotations";

import type { PeakWithMeta } from "../types";

describe("resolveSelectionAppearance", () => {
  it("returns defaults when called with no argument", () => {
    const result = resolveSelectionAppearance();
    expect(result.selected.borderColor).toBe("#3b82f6");
    expect(result.selected.backgroundColor).toBe("#dbeafe");
    expect(result.selected.bold).toBe(true);
    expect(result.unselected.opacity).toBe(0.4);
    expect(result.hoverLineWidthMultiplier).toBeCloseTo(5 / 3);
  });

  it("returns defaults when called with no overrides", () => {
    const result = resolveSelectionAppearance();
    expect(result.selected.borderColor).toBe("#3b82f6");
  });

  it("merges partial overrides, keeping defaults for omitted fields", () => {
    const result = resolveSelectionAppearance({
      selected: { borderColor: "red" },
    });
    expect(result.selected.borderColor).toBe("red");
    expect(result.selected.backgroundColor).toBe("#dbeafe");
    expect(result.selected.bold).toBe(true);
    expect(result.unselected.opacity).toBe(0.4);
  });

  it("respects full override", () => {
    const result = resolveSelectionAppearance({
      selected: { borderColor: "red", backgroundColor: "blue", bold: false },
      unselected: { opacity: 0.2 },
      hoverLineWidthMultiplier: 2,
    });
    expect(result.selected.borderColor).toBe("red");
    expect(result.selected.backgroundColor).toBe("blue");
    expect(result.selected.bold).toBe(false);
    expect(result.unselected.opacity).toBe(0.2);
    expect(result.hoverLineWidthMultiplier).toBe(2);
  });
});

describe("groupOverlappingPeaks", () => {
  const makePeak = (x: number, seriesIndex = 0): PeakWithMeta => ({
    peak: { x, y: 10 },
    seriesIndex,
  });

  it("returns empty array for empty input", () => {
    expect(groupOverlappingPeaks([], 0.5)).toEqual([]);
  });

  it("returns single group for a single peak", () => {
    const result = groupOverlappingPeaks([makePeak(1)], 0.5);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
  });

  it("groups peaks within the threshold", () => {
    const peaks = [makePeak(1.0), makePeak(1.2), makePeak(1.3)];
    const result = groupOverlappingPeaks(peaks, 0.5);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
  });

  it("separates peaks outside the threshold", () => {
    const peaks = [makePeak(1.0), makePeak(5.0)];
    const result = groupOverlappingPeaks(peaks, 0.5);
    expect(result).toHaveLength(2);
  });

  it("sorts by x before grouping", () => {
    const peaks = [makePeak(5.0), makePeak(1.0), makePeak(1.2)];
    const result = groupOverlappingPeaks(peaks, 0.5);
    expect(result).toHaveLength(2);
    expect(result[0][0].peak.x).toBe(1.0);
  });

  it("creates separate group when diff equals threshold (not strictly less)", () => {
    const peaks = [makePeak(1.0), makePeak(1.5)];
    // diff = 0.5, threshold = 0.5 → NOT less than threshold → new group
    const result = groupOverlappingPeaks(peaks, 0.5);
    expect(result).toHaveLength(2);
  });

  it("handles peaks exactly below threshold as same group", () => {
    const peaks = [makePeak(1.0), makePeak(1.49)];
    const result = groupOverlappingPeaks(peaks, 0.5);
    expect(result).toHaveLength(1);
  });
});

describe("createPeakAnnotation", () => {
  const slot = { ax: 0, ay: -35 };
  const basicPeak = { x: 5, y: 100, text: "Peak A" };

  it("creates a basic arrow annotation", () => {
    const ann = createPeakAnnotation(basicPeak, 0, slot);
    expect(ann.x).toBe(5);
    expect(ann.y).toBe(100);
    expect(ann.text).toBe("Peak A");
    expect(ann.showarrow).toBe(true);
    expect(ann.ax).toBe(0);
    expect(ann.ay).toBe(-35);
  });

  it("creates inline annotation when annotationStyle is inline", () => {
    const ann = createPeakAnnotation(basicPeak, 0, slot, { annotationStyle: "inline" });
    expect(ann.showarrow).toBe(false);
    expect(ann.yshift).toBe(4);
    expect(ann.yanchor).toBe("bottom");
    expect(ann.xanchor).toBe("center");
  });

  it("uses grey color for user-defined annotations (seriesIndex = -1)", () => {
    const ann = createPeakAnnotation(basicPeak, -1, slot);
    // User-defined: border should not be set (isUserDefined, no color override)
    expect(ann.borderwidth).toBe(0);
  });

  it("renders selected peak with bold text and selection border", () => {
    const peak = { x: 5, y: 100, text: "Peak A", id: "peak-0-0" };
    const ann = createPeakAnnotation(peak, 0, slot, {
      selectedPeakIds: ["peak-0-0"],
      anySelected: true,
    });
    expect(ann.text).toBe("<b>Peak A</b>");
    expect(ann.borderwidth).toBe(2);
    expect(ann.bordercolor).toBe("#3b82f6");
  });

  it("dims unselected peak when another is selected", () => {
    const peak = { x: 5, y: 100, text: "Peak B", id: "peak-0-1" };
    const ann = createPeakAnnotation(peak, 0, slot, {
      selectedPeakIds: ["peak-0-0"],
      anySelected: true,
    });
    expect(ann.opacity).toBe(0.4);
  });

  it("does not set opacity when nothing is selected", () => {
    const ann = createPeakAnnotation(basicPeak, 0, slot, { anySelected: false });
    expect(ann.opacity).toBeUndefined();
  });

  it("uses peak color override when provided", () => {
    const peak = { x: 5, y: 100, text: "Peak A", color: "#ff0000" };
    const ann = createPeakAnnotation(peak, 0, slot);
    expect(ann.arrowcolor).toBe("#ff0000");
    expect(ann.borderwidth).toBe(1);
  });

  it("auto-generates text from computed area when text is absent", () => {
    const peak = { x: 5, y: 100, _computed: { area: 42.1 } };
    const ann = createPeakAnnotation(peak, 0, slot);
    expect(ann.text).toBe("Area: 42.10");
  });

  it("uses empty text when neither text nor computed area is set", () => {
    const peak = { x: 5, y: 100 };
    const ann = createPeakAnnotation(peak, 0, slot);
    expect(ann.text).toBe("");
  });

  it("respects user-defined peak ax/ay override", () => {
    const peak = { x: 5, y: 100, text: "Peak A", ax: 30, ay: -50 };
    const ann = createPeakAnnotation(peak, -1, { ax: 0, ay: -35 });
    expect(ann.ax).toBe(30);
    expect(ann.ay).toBe(-50);
  });

  it("does not override ax/ay for non-user-defined peaks", () => {
    const peak = { x: 5, y: 100, text: "Peak A", ax: 30, ay: -50 };
    const ann = createPeakAnnotation(peak, 0, { ax: 0, ay: -35 });
    expect(ann.ax).toBe(0);
    expect(ann.ay).toBe(-35);
  });

  it("inline: dims unselected when another selected", () => {
    const peak = { x: 5, y: 100, text: "B", id: "b" };
    const ann = createPeakAnnotation(peak, 0, slot, {
      annotationStyle: "inline",
      selectedPeakIds: ["a"],
      anySelected: true,
    });
    expect(ann.opacity).toBe(0.4);
  });

  it("inline: no opacity when nothing selected", () => {
    const ann = createPeakAnnotation(basicPeak, 0, slot, {
      annotationStyle: "inline",
      anySelected: false,
    });
    expect(ann.opacity).toBeUndefined();
  });
});

describe("createGroupAnnotations", () => {
  it("uses default slot for a single-peak group", () => {
    const group: PeakWithMeta[] = [{ peak: { x: 5, y: 100, text: "A" }, seriesIndex: 0 }];
    const result = createGroupAnnotations(group);
    expect(result).toHaveLength(1);
    expect(result[0].ax).toBe(ANNOTATION_SLOTS.default.ax);
    expect(result[0].ay).toBe(ANNOTATION_SLOTS.default.ay);
  });

  it("assigns overlap slots for multiple peaks, sorted by y ascending", () => {
    const group: PeakWithMeta[] = [
      { peak: { x: 5, y: 200, text: "High" }, seriesIndex: 0 },
      { peak: { x: 5.1, y: 50, text: "Low" }, seriesIndex: 0 },
    ];
    const result = createGroupAnnotations(group);
    expect(result).toHaveLength(2);
    // First annotation (y=50, lowest) gets slot 0
    expect(result[0].ax).toBe(ANNOTATION_SLOTS.overlap[0].ax);
    // Second annotation (y=200) gets slot 1
    expect(result[1].ax).toBe(ANNOTATION_SLOTS.overlap[1].ax);
  });

  it("wraps around overlap slots when more peaks than slots", () => {
    const group: PeakWithMeta[] = Array.from({ length: 8 }, (_, i) => ({
      peak: { x: i * 0.05, y: i * 10, text: `P${i}` },
      seriesIndex: 0,
    }));
    const result = createGroupAnnotations(group);
    expect(result).toHaveLength(8);
    // slot index wraps: peak at slotIndex 6 → slot[6 % 6] = slot[0]
    expect(result[6].ax).toBe(ANNOTATION_SLOTS.overlap[0].ax);
  });
});
