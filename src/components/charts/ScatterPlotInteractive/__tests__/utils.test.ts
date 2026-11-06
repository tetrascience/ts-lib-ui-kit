import { describe, it, expect } from "vitest";

import { DEFAULT_MAX_POINTS } from "../constants";
import {
  applySelection,
  calculateRange,
  downsampleData,
  getSelectionMode,
  getUniqueCategories,
  lttbDownsample,
} from "../utils";

import type { ScatterPoint } from "../types";

function pt(x: number, y: number): ScatterPoint {
  return { id: `${x},${y}`, x, y };
}

function pts(ys: number[]): ScatterPoint[] {
  return ys.map((y, i) => pt(i, y));
}

// ─── threshold edge cases ──────────────────────────────────────────────────

describe("threshold <= 0", () => {
  it("returns [] for threshold = 0", () => {
    expect(lttbDownsample(pts([1, 2, 3, 4, 5]), 0)).toEqual([]);
  });

  it("returns [] for negative threshold", () => {
    expect(lttbDownsample(pts([1, 2, 3, 4, 5]), -10)).toEqual([]);
  });
});

describe("threshold = 1", () => {
  it("returns only the first point", () => {
    const data = pts([10, 20, 30, 40, 50]);
    const result = lttbDownsample(data, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(data[0]);
  });
});

describe("threshold = 2", () => {
  it("returns the first and last points", () => {
    const data = pts([10, 20, 30, 40, 50]);
    const result = lttbDownsample(data, 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(data[0]);
    expect(result[1]).toBe(data[data.length - 1]);
  });
});

describe("threshold >= data.length", () => {
  it("returns the original array reference when threshold equals data.length", () => {
    const data = pts([1, 2, 3, 4, 5]);
    expect(lttbDownsample(data, 5)).toBe(data);
  });

  it("returns the original array reference when threshold exceeds data.length", () => {
    const data = pts([1, 2, 3]);
    expect(lttbDownsample(data, 100)).toBe(data);
  });
});

// ─── small dataset edge cases ─────────────────────────────────────────────

describe("empty dataset", () => {
  it("returns [] for any positive threshold", () => {
    expect(lttbDownsample([], 5)).toEqual([]);
  });

  it("returns [] for threshold = 1", () => {
    expect(lttbDownsample([], 1)).toEqual([]);
  });
});

describe("single-point dataset", () => {
  it("returns the original reference (threshold >= dataLength)", () => {
    const data = [pt(1, 42)];
    expect(lttbDownsample(data, 1)).toBe(data);
    expect(lttbDownsample(data, 5)).toBe(data);
  });
});

describe("two-point dataset", () => {
  it("returns the original reference (threshold >= dataLength)", () => {
    const data = [pt(0, 0), pt(1, 1)];
    expect(lttbDownsample(data, 2)).toBe(data);
    expect(lttbDownsample(data, 5)).toBe(data);
  });

  it("returns [first] for threshold = 1", () => {
    const data = [pt(0, 0), pt(1, 1)];
    const result = lttbDownsample(data, 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(data[0]);
  });
});

// ─── output length guarantee ──────────────────────────────────────────────

describe("output length", () => {
  const data = pts(Array.from({ length: 100 }, (_, i) => Math.sin(i / 10)));

  it.each([3, 5, 10, 20, 50])("returns exactly %i points for threshold = %i", (t) => {
    expect(lttbDownsample(data, t)).toHaveLength(t);
  });

  it("always returns the first point as element [0]", () => {
    const result = lttbDownsample(data, 10);
    expect(result[0]).toBe(data[0]);
  });

  it("always returns the last point as the final element", () => {
    const result = lttbDownsample(data, 10);
    expect(result[result.length - 1]).toBe(data[data.length - 1]);
  });

  it("minimum viable case: 4 data points, threshold = 3", () => {
    const d = pts([0, 5, 3, 10]);
    const result = lttbDownsample(d, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(d[0]);
    expect(result[2]).toBe(d[3]);
  });

  it("data.length one more than threshold (every = 1)", () => {
    const d = pts([0, 1, 2, 3, 4, 5]);
    expect(lttbDownsample(d, 5)).toHaveLength(5);
  });
});

// ─── all returned points belong to the original dataset ───────────────────

describe("point identity", () => {
  it("every returned point is a reference from the input array", () => {
    const data = pts([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
    for (const p of lttbDownsample(data, 5)) {
      expect(data).toContain(p);
    }
  });
});

// ─── algorithm correctness ────────────────────────────────────────────────

describe("peak selection", () => {
  it("selects the prominent peak in a 5-point dataset with threshold = 3", () => {
    // Indices: 0   1   2    3   4
    //     y:  0   1  10    1   0   ← peak at index 2 should be selected
    const data = pts([0, 1, 10, 1, 0]);
    const result = lttbDownsample(data, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(data[0]);
    expect(result[1]).toBe(data[2]); // peak
    expect(result[2]).toBe(data[4]);
  });

  it("selects the higher of two competing peaks", () => {
    // Two peaks at indices 2 (y=10) and 4 (y=5); bucket covering both should pick y=10
    const data = pts([0, 1, 10, 1, 5, 1, 0]);
    const result = lttbDownsample(data, 3);
    expect(result[1]).toBe(data[2]);
  });
});

describe("monotonic data", () => {
  it("preserves first and last on strictly increasing data", () => {
    const data = pts([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const result = lttbDownsample(data, 5);
    expect(result).toHaveLength(5);
    expect(result[0]).toBe(data[0]);
    expect(result[4]).toBe(data[9]);
  });

  it("preserves first and last on strictly decreasing data", () => {
    const data = pts([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    const result = lttbDownsample(data, 5);
    expect(result[0]).toBe(data[0]);
    expect(result[4]).toBe(data[9]);
  });
});

describe("uniform Y values", () => {
  it("produces no NaN coordinates when all Y values are identical", () => {
    const data = pts([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    const result = lttbDownsample(data, 4);
    expect(result).toHaveLength(4);
    for (const p of result) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });
});

describe("NaN / Infinity propagation", () => {
  it("produces no NaN coordinates on a sinusoidal dataset", () => {
    const data = pts(Array.from({ length: 200 }, (_, i) => Math.sin(i / 20)));
    for (const p of lttbDownsample(data, 40)) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });
});

const points = (metas: Array<Record<string, unknown>>): ScatterPoint[] =>
  metas.map((metadata, i) => ({ id: i, x: i, y: i, metadata }));

describe("getUniqueCategories", () => {
  it("returns sorted unique string values and skips non-strings", () => {
    expect(getUniqueCategories(points([{ g: "b" }, { g: "a" }, { g: "b" }, { g: 3 }, {}]), "g")).toEqual(["a", "b"]);
  });

  it("returns an empty list when the field is absent", () => {
    expect(getUniqueCategories(points([{ other: "x" }]), "g")).toEqual([]);
  });
});

describe("calculateRange", () => {
  it("returns min/max of a numeric metadata field", () => {
    const data = points([{ v: 3 }, { v: -1 }, { v: 7 }]);
    expect(calculateRange(data, "v")).toEqual({ min: -1, max: 7 });
  });

  it("returns {0, 1} when no values are numeric", () => {
    const data = points([{ v: "a" }, {}]);
    expect(calculateRange(data, "v")).toEqual({ min: 0, max: 1 });
  });

  it("widens the range when min equals max", () => {
    const data = points([{ v: 5 }, { v: 5 }]);
    expect(calculateRange(data, "v")).toEqual({ min: 4, max: 6 });
  });
});

describe("downsampleData", () => {
  const data = pts(Array.from({ length: 50 }, (_, i) => i));

  it("returns the data unchanged when disabled", () => {
    expect(downsampleData(data, { enabled: false })).toBe(data);
  });

  it("returns the data unchanged when below maxPoints", () => {
    expect(downsampleData(data, { enabled: true, maxPoints: 100 })).toBe(data);
  });

  it("downsamples with lttb when above maxPoints", () => {
    const result = downsampleData(data, { enabled: true, maxPoints: 10 });
    expect(result).toHaveLength(10);
  });

  it("returns the data unchanged for unknown strategies", () => {
    const result = downsampleData(data, {
      enabled: true,
      maxPoints: 10,
      strategy: "uniform",
    });
    expect(result).toBe(data);
  });

  it("applies the default maxPoints and lttb strategy when not specified", () => {
    const large = pts(Array.from({ length: DEFAULT_MAX_POINTS + 1 }, (_, i) => i % 13));
    const result = downsampleData(large, { enabled: true });
    expect(result).toHaveLength(DEFAULT_MAX_POINTS);
  });
});

describe("getSelectionMode", () => {
  const event = (mods: Partial<{ shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }>) => ({
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    ...mods,
  });

  it("replaces by default", () => {
    expect(getSelectionMode(event({}))).toBe("replace");
  });

  it("adds with shift", () => {
    expect(getSelectionMode(event({ shiftKey: true }))).toBe("add");
  });

  it("removes with ctrl or cmd", () => {
    expect(getSelectionMode(event({ ctrlKey: true }))).toBe("remove");
    expect(getSelectionMode(event({ metaKey: true }))).toBe("remove");
  });

  it("toggles with shift + ctrl", () => {
    expect(getSelectionMode(event({ shiftKey: true, ctrlKey: true }))).toBe("toggle");
  });
});

describe("applySelection", () => {
  const current = () => new Set<string | number>([1, 2]);

  it("replaces the selection", () => {
    expect(applySelection(current(), new Set([3]), "replace")).toEqual(new Set([3]));
  });

  it("adds to the selection", () => {
    expect(applySelection(current(), new Set([3]), "add")).toEqual(new Set([1, 2, 3]));
  });

  it("removes from the selection", () => {
    expect(applySelection(current(), new Set([2]), "remove")).toEqual(new Set([1]));
  });

  it("toggles membership", () => {
    expect(applySelection(current(), new Set([2, 3]), "toggle")).toEqual(new Set([1, 3]));
  });

  it("returns the current selection for unknown modes", () => {
    expect(applySelection(current(), new Set([3]), "unknown" as never)).toEqual(new Set([1, 2]));
  });
});
