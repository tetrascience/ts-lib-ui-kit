import { describe, it, expect } from "vitest";

import { COLORS, DEFAULT_CATEGORY_COLORS, DEFAULT_MARKER_SIZE, DEFAULT_MAX_POINTS, DEFAULT_SIZE_RANGE } from "../constants";
import {
  applySelection,
  calculateAxisRange,
  calculateRange,
  downsampleData,
  generateTooltipContent,
  getPlotlyLayoutConfig,
  getSelectionMode,
  lttbDownsample,
  mapColors,
  mapShapes,
  mapSizes,
} from "../utils";

import type { ColorMapping, ScatterPoint } from "../types";
import type { PlotlyThemeColors } from "@/hooks/use-plotly-theme";

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

describe("mapColors", () => {
  it("fills with the primary token color when no mapping is provided", () => {
    let mapping: ColorMapping | undefined;
    expect(mapColors(points([{}, {}]), mapping)).toEqual([
      COLORS.primary,
      COLORS.primary,
    ]);
  });

  it("uses the static value when provided", () => {
    const colors = mapColors(points([{}]), {
      type: "static",
      value: "#123456",
    });
    expect(colors).toEqual(["#123456"]);
  });

  it("falls back to the primary token color for a static mapping without a value", () => {
    expect(mapColors(points([{}]), { type: "static" })).toEqual([
      COLORS.primary,
    ]);
  });

  it("uses explicit category colors and cycles defaults for the rest", () => {
    const data = points([{ kind: "a" }, { kind: "b" }, { kind: "c" }]);
    const colors = mapColors(data, {
      type: "categorical",
      field: "kind",
      categoryColors: { b: "#abcdef" },
    });
    // Categories are sorted (a, b, c); a and c take palette defaults by index
    expect(colors).toEqual([
      DEFAULT_CATEGORY_COLORS[0],
      "#abcdef",
      DEFAULT_CATEGORY_COLORS[2],
    ]);
  });

  it("falls back to the primary token color for unhandled mapping types", () => {
    const colors = mapColors(points([{}]), {
      type: "continuous",
      field: "value",
    });
    expect(colors).toEqual([COLORS.primary]);
  });

  it("assigns the first default color to points outside the category map", () => {
    const data = points([{ kind: "a" }, { other: 1 }]);
    const colors = mapColors(data, { type: "categorical", field: "kind" });
    expect(colors).toEqual([DEFAULT_CATEGORY_COLORS[0], DEFAULT_CATEGORY_COLORS[0]]);
  });

  it("falls back to the primary token color for a categorical mapping without a field", () => {
    expect(mapColors(points([{}]), { type: "categorical" })).toEqual([COLORS.primary]);
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

describe("mapShapes", () => {
  it("fills with circles when no mapping is provided", () => {
    expect(mapShapes(points([{}, {}]))).toEqual(["circle", "circle"]);
  });

  it("uses the static shape value", () => {
    expect(mapShapes(points([{}]), { type: "static", value: "star" })).toEqual(["star"]);
  });

  it("maps categories to explicit and default shapes", () => {
    const data = points([{ kind: "a" }, { kind: "b" }, { kind: "c" }]);
    const shapes = mapShapes(data, {
      type: "categorical",
      field: "kind",
      categoryShapes: { b: "diamond" },
    });
    expect(shapes).toEqual(["circle", "diamond", "diamond"]);
  });

  it("falls back to circle for points outside the category map", () => {
    const data = points([{ kind: "a" }, { other: 1 }]);
    const shapes = mapShapes(data, { type: "categorical", field: "kind" });
    expect(shapes).toEqual(["circle", "circle"]);
  });

  it("falls back to circle for a categorical mapping without a field", () => {
    expect(mapShapes(points([{}, {}]), { type: "categorical" })).toEqual(["circle", "circle"]);
  });
});

describe("mapSizes", () => {
  it("fills with the default marker size when no mapping is provided", () => {
    expect(mapSizes(points([{}]))).toEqual([DEFAULT_MARKER_SIZE]);
  });

  it("uses the static size value", () => {
    expect(mapSizes(points([{}]), { type: "static", value: 14 })).toEqual([14]);
  });

  it("assigns increasing default sizes per category", () => {
    const data = points([{ kind: "a" }, { kind: "b" }, { other: 1 }]);
    const sizes = mapSizes(data, { type: "categorical", field: "kind" });
    expect(sizes).toEqual([
      DEFAULT_MARKER_SIZE,
      DEFAULT_MARKER_SIZE + 2,
      DEFAULT_MARKER_SIZE,
    ]);
  });

  it("interpolates continuous values into the size range", () => {
    const data = points([{ v: 0 }, { v: 10 }, { v: "n/a" }]);
    const sizes = mapSizes(data, {
      type: "continuous",
      field: "v",
      sizeRange: [4, 20],
    });
    expect(sizes[0]).toBe(4);
    expect(sizes[1]).toBe(20);
    expect(sizes[2]).toBe(DEFAULT_MARKER_SIZE);
  });

  it("respects explicit min/max for continuous mapping", () => {
    const data = points([{ v: 5 }]);
    const sizes = mapSizes(data, {
      type: "continuous",
      field: "v",
      min: 0,
      max: 10,
      sizeRange: [0, 10],
    });
    expect(sizes).toEqual([5]);
  });

  it("uses explicit category sizes when provided", () => {
    const data = points([{ kind: "a" }, { kind: "b" }]);
    const sizes = mapSizes(data, {
      type: "categorical",
      field: "kind",
      categorySizes: { a: 12 },
    });
    expect(sizes).toEqual([12, DEFAULT_MARKER_SIZE + 2]);
  });

  it("uses the default size range for continuous mapping when none is given", () => {
    const data = points([{ v: 0 }, { v: 10 }]);
    const sizes = mapSizes(data, { type: "continuous", field: "v" });
    expect(sizes).toEqual([DEFAULT_SIZE_RANGE[0], DEFAULT_SIZE_RANGE[1]]);
  });

  it("falls back to the default marker size for a continuous mapping without a field", () => {
    expect(mapSizes(points([{}]), { type: "continuous" })).toEqual([DEFAULT_MARKER_SIZE]);
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

describe("generateTooltipContent", () => {
  it("always includes x and y", () => {
    expect(generateTooltipContent({ id: 1, x: 1.234, y: 5.678 })).toBe("X: 1.23<br>Y: 5.68");
  });

  it("includes the label and requested metadata fields only", () => {
    const point: ScatterPoint = {
      id: 1,
      x: 0,
      y: 0,
      label: "P1",
      metadata: { a: 1, b: 2 },
    };
    const content = generateTooltipContent(point, ["b", "missing"]);
    expect(content).toContain("Label: P1");
    expect(content).toContain("b: 2");
    expect(content).not.toContain("a: 1");
  });

  it("includes all metadata when no fields are specified", () => {
    const point: ScatterPoint = { id: 1, x: 0, y: 0, metadata: { a: 1, b: 2 } };
    const content = generateTooltipContent(point);
    expect(content).toContain("a: 1");
    expect(content).toContain("b: 2");
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

describe("calculateAxisRange", () => {
  it("pads a linear range by the given fraction", () => {
    const data = pts([0, 10]);
    const [min, max] = calculateAxisRange(data, "y", 0.1);
    expect(min).toBeCloseTo(-1);
    expect(max).toBeCloseTo(11);
  });

  it("returns [0, 1] when no values are finite", () => {
    const data: ScatterPoint[] = [{ id: 1, x: Number.NaN, y: Number.NaN }];
    expect(calculateAxisRange(data, "x")).toEqual([0, 1]);
  });

  it("widens the range when min equals max", () => {
    const data: ScatterPoint[] = [{ id: 1, x: 5, y: 5 }];
    expect(calculateAxisRange(data, "x")).toEqual([4, 6]);
  });

  it("computes log-space ranges for log scales", () => {
    const data: ScatterPoint[] = [
      { id: 1, x: 1, y: 1 },
      { id: 2, x: 100, y: 1 },
    ];
    const [min, max] = calculateAxisRange(data, "x", 0.1, "log");
    expect(min).toBeCloseTo(-0.2);
    expect(max).toBeCloseTo(2.2);
  });

  it("skips non-positive values on log scales", () => {
    const data: ScatterPoint[] = [
      { id: 1, x: -5, y: 1 },
      { id: 2, x: 0, y: 1 },
      { id: 3, x: 1, y: 1 },
      { id: 4, x: 100, y: 1 },
    ];
    const [min, max] = calculateAxisRange(data, "x", 0.1, "log");
    expect(min).toBeCloseTo(-0.2);
    expect(max).toBeCloseTo(2.2);
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

describe("getPlotlyLayoutConfig", () => {
  const theme: PlotlyThemeColors = {
    paperBg: "transparent",
    plotBg: "transparent",
    textColor: "rgba(26, 26, 26, 1)",
    textSecondary: "rgba(26, 26, 26, 0.6)",
    gridColor: "rgba(225, 231, 239, 1)",
    lineColor: "rgba(26, 26, 26, 1)",
    tickColor: "rgba(225, 231, 239, 1)",
    legendColor: "rgba(4, 38, 63, 1)",
    spikeColor: "rgba(100, 116, 139, 1)",
    markerOutline: "rgba(26, 26, 26, 0.45)",
    isDark: false,
  };

  const base = {
    title: "My Plot" as string | undefined,
    xAxis: {},
    yAxis: {},
    width: 800,
    height: 600,
    xRange: undefined,
    yRange: undefined,
    enableLassoSelection: false,
    enableBoxSelection: false,
    theme,
  };

  it("applies theme colors instead of hardcoded values", () => {
    const layout = getPlotlyLayoutConfig(base);
    expect(layout.paper_bgcolor).toBe(theme.paperBg);
    expect(layout.plot_bgcolor).toBe(theme.plotBg);
    expect(layout.font?.color).toBe(theme.textColor);
    expect(layout.xaxis?.gridcolor).toBe(theme.gridColor);
    expect(layout.yaxis?.linecolor).toBe(theme.lineColor);
  });

  it("renders a centered title when provided and omits it otherwise", () => {
    expect(getPlotlyLayoutConfig(base).title).toMatchObject({ text: "My Plot" });
    expect(getPlotlyLayoutConfig({ ...base, title: undefined }).title).toBeUndefined();
  });

  it("uses log axis types and explicit ranges when configured", () => {
    const layout = getPlotlyLayoutConfig({
      ...base,
      xAxis: { scale: "log" as const },
      xRange: [0, 2] as [number, number],
    });
    expect(layout.xaxis?.type).toBe("log");
    expect(layout.xaxis?.range).toEqual([0, 2]);
    expect(layout.xaxis?.autorange).toBe(false);
    expect(layout.yaxis?.type).toBe("linear");
  });

  it("selects dragmode from the enabled selection tools", () => {
    expect(getPlotlyLayoutConfig({ ...base, enableLassoSelection: true }).dragmode).toBe("lasso");
    expect(getPlotlyLayoutConfig({ ...base, enableBoxSelection: true }).dragmode).toBe("select");
    expect(getPlotlyLayoutConfig(base).dragmode).toBe(false);
  });

  it("uses the configured axis titles", () => {
    const layout = getPlotlyLayoutConfig({
      ...base,
      xAxis: { title: "Time (s)" },
      yAxis: { title: "Signal" },
    });
    expect(layout.xaxis?.title).toMatchObject({ text: "Time (s)" });
    expect(layout.yaxis?.title).toMatchObject({ text: "Signal" });
  });
});
