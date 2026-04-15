import { describe, it, expect } from "vitest";

import {
  generateRowLabels,
  generateColumnLabels,
  parseWellId,
  wellDataToGrid,
  calculateValueRange,
  hasMultiValueWells,
  extractLayerIds,
  isStringValueLayer,
  extractLayers,
  parseRegionWells,
  buildWellHoverText,
  buildColorbarConfig,
  buildPlotMargins,
  calculateTitleX,
  calculateAxisDomain,
  flattenGridData,
  calculateMarkerSize,
} from "../utils";

import type { WellData, LayerConfig } from "../types";

// ─── generateRowLabels ─────────────────────────────────────────────────────

describe("generateRowLabels", () => {
  it("generates A-H for 8 rows", () => {
    const labels = generateRowLabels(8);
    expect(labels).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  });

  it("generates A-Z for 26 rows", () => {
    const labels = generateRowLabels(26);
    expect(labels[0]).toBe("A");
    expect(labels[25]).toBe("Z");
    expect(labels).toHaveLength(26);
  });

  it("generates double-letter labels beyond Z", () => {
    const labels = generateRowLabels(32);
    expect(labels[26]).toBe("AA");
    expect(labels[27]).toBe("AB");
    expect(labels[31]).toBe("AF");
  });

  it("returns empty array for 0", () => {
    expect(generateRowLabels(0)).toEqual([]);
  });
});

// ─── generateColumnLabels ──────────────────────────────────────────────────

describe("generateColumnLabels", () => {
  it("generates 1-12 for 12 columns", () => {
    const labels = generateColumnLabels(12);
    expect(labels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("returns empty array for 0", () => {
    expect(generateColumnLabels(0)).toEqual([]);
  });
});

// ─── parseWellId ───────────────────────────────────────────────────────────

describe("parseWellId", () => {
  it("parses A1 correctly", () => {
    expect(parseWellId("A1")).toEqual({ row: 0, col: 0 });
  });

  it("parses H12 correctly", () => {
    expect(parseWellId("H12")).toEqual({ row: 7, col: 11 });
  });

  it("parses double-letter rows (AA1)", () => {
    expect(parseWellId("AA1")).toEqual({ row: 26, col: 0 });
  });

  it("parses AF48 correctly", () => {
    expect(parseWellId("AF48")).toEqual({ row: 31, col: 47 });
  });

  it("handles lowercase input", () => {
    expect(parseWellId("a1")).toEqual({ row: 0, col: 0 });
  });

  it("returns null for invalid well IDs", () => {
    expect(parseWellId("")).toBeNull();
    expect(parseWellId("123")).toBeNull();
    expect(parseWellId("A")).toBeNull();
    expect(parseWellId("AAA1")).toBeNull();
  });
});

// ─── wellDataToGrid ────────────────────────────────────────────────────────

describe("wellDataToGrid", () => {
  it("converts well data to numeric grid", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { RFU: 100 } },
      { wellId: "A2", values: { RFU: 200 } },
      { wellId: "B1", values: { RFU: 300 } },
    ];
    const result = wellDataToGrid(wells, 2, 2, "RFU");
    expect(result.grid[0][0]).toBe(100);
    expect(result.grid[0][1]).toBe(200);
    expect(result.grid[1][0]).toBe(300);
    expect(result.grid[1][1]).toBeNull();
  });

  it("handles string (categorical) values in categories grid", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { Type: "sample" } },
      { wellId: "A2", values: { Type: "control" } },
    ];
    const result = wellDataToGrid(wells, 1, 2, "Type");
    expect(result.categories[0][0]).toBe("sample");
    expect(result.categories[0][1]).toBe("control");
    // Numeric grid stays null for string values
    expect(result.grid[0][0]).toBeNull();
  });

  it("stores tooltipData in map", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { RFU: 100 }, tooltipData: { sampleId: "S1" } },
    ];
    const result = wellDataToGrid(wells, 1, 1, "RFU");
    expect(result.tooltipData.get("A1")).toEqual({ sampleId: "S1" });
  });

  it("stores all values in allValues map", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { RFU: 100, AU: 50 } },
    ];
    const result = wellDataToGrid(wells, 1, 1, "RFU");
    expect(result.allValues.get("A1")).toEqual({ RFU: 100, AU: 50 });
  });

  it("ignores out-of-bounds well IDs", () => {
    const wells: WellData[] = [
      { wellId: "Z99", values: { RFU: 100 } },
    ];
    const result = wellDataToGrid(wells, 2, 2, "RFU");
    expect(result.grid.flat().every((v) => v === null)).toBe(true);
  });

  it("uses first key when layerId is not specified", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { Signal: 42 } },
    ];
    const result = wellDataToGrid(wells, 1, 1);
    expect(result.grid[0][0]).toBe(42);
  });
});

// ─── calculateValueRange ───────────────────────────────────────────────────

describe("calculateValueRange", () => {
  it("calculates min/max from grid", () => {
    const grid = [[100, 200], [50, 300]];
    expect(calculateValueRange(grid)).toEqual({ min: 50, max: 300 });
  });

  it("ignores null values", () => {
    const grid: (number | null)[][] = [[null, 100], [200, null]];
    expect(calculateValueRange(grid)).toEqual({ min: 100, max: 200 });
  });

  it("returns 0/1 for all-null grid", () => {
    const grid: (number | null)[][] = [[null, null], [null, null]];
    expect(calculateValueRange(grid)).toEqual({ min: 0, max: 1 });
  });

  it("handles single value (min === max)", () => {
    const grid = [[5, 5], [5, 5]];
    const { min, max } = calculateValueRange(grid);
    expect(min).toBe(5);
    expect(max).toBe(6); // min + 1
  });
});

// ─── hasMultiValueWells ────────────────────────────────────────────────────

describe("hasMultiValueWells", () => {
  it("returns true when wells have values", () => {
    const wells: WellData[] = [{ wellId: "A1", values: { RFU: 100 } }];
    expect(hasMultiValueWells(wells)).toBe(true);
  });

  it("returns false for empty values", () => {
    const wells: WellData[] = [{ wellId: "A1", values: {} }];
    expect(hasMultiValueWells(wells)).toBe(false);
  });
});

// ─── extractLayerIds ───────────────────────────────────────────────────────

describe("extractLayerIds", () => {
  it("extracts unique layer IDs from well data", () => {
    const wells: WellData[] = [
      { wellId: "A1", values: { RFU: 100, AU: 50 } },
      { wellId: "A2", values: { RFU: 200, Signal: 42 } },
    ];
    const ids = extractLayerIds(wells);
    expect(ids).toContain("RFU");
    expect(ids).toContain("AU");
    expect(ids).toContain("Signal");
  });
});

// ─── isStringValueLayer ────────────────────────────────────────────────────

describe("isStringValueLayer", () => {
  it("returns true for string-valued layer", () => {
    const wells: WellData[] = [{ wellId: "A1", values: { Type: "sample" } }];
    expect(isStringValueLayer(wells, "Type")).toBe(true);
  });

  it("returns false for numeric-valued layer", () => {
    const wells: WellData[] = [{ wellId: "A1", values: { RFU: 100 } }];
    expect(isStringValueLayer(wells, "RFU")).toBe(false);
  });
});

// ─── extractLayers ─────────────────────────────────────────────────────────

describe("extractLayers", () => {
  it("auto-detects categorical mode for string layers", () => {
    const wells: WellData[] = [{ wellId: "A1", values: { Type: "sample", RFU: 100 } }];
    const layers = extractLayers(wells);
    const typeLayer = layers.find((l) => l.id === "Type");
    const rfuLayer = layers.find((l) => l.id === "RFU");
    expect(typeLayer?.visualizationMode).toBe("categorical");
    expect(rfuLayer?.visualizationMode).toBeUndefined();
  });

  it("merges user-provided layer configs", () => {
    const wells: WellData[] = [{ wellId: "A1", values: { RFU: 100 } }];
    const configs: LayerConfig[] = [{ id: "RFU", name: "Fluorescence", valueUnit: "RFU" }];
    const layers = extractLayers(wells, configs);
    expect(layers[0].name).toBe("Fluorescence");
    expect(layers[0].valueUnit).toBe("RFU");
  });
});

// ─── parseRegionWells ──────────────────────────────────────────────────────

describe("parseRegionWells", () => {
  const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const colLabels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  it("parses valid range A1:B6", () => {
    const result = parseRegionWells("A1:B6", rowLabels, colLabels);
    expect(result).toEqual({ minRow: 0, maxRow: 1, minCol: 0, maxCol: 5 });
  });

  it("handles reversed ranges (B6:A1)", () => {
    const result = parseRegionWells("B6:A1", rowLabels, colLabels);
    expect(result).toEqual({ minRow: 0, maxRow: 1, minCol: 0, maxCol: 5 });
  });

  it("returns null for invalid format", () => {
    expect(parseRegionWells("invalid", rowLabels, colLabels)).toBeNull();
    expect(parseRegionWells("A1-B6", rowLabels, colLabels)).toBeNull();
  });

  it("returns null for out-of-bounds ranges", () => {
    expect(parseRegionWells("A1:Z99", rowLabels, colLabels)).toBeNull();
  });
});

// ─── buildWellHoverText ────────────────────────────────────────────────────

describe("buildWellHoverText", () => {
  const emptyMap = new Map<string, LayerConfig>();

  it("shows well ID and value", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: 1234.567,
      allValues: undefined,
      tooltipExtra: undefined,
      activeLayerId: undefined,
      layerConfigMap: emptyMap,
      precision: 2,
      valueUnit: " RFU",
    });
    expect(text).toContain("Well A1");
    expect(text).toContain("1234.57");
    expect(text).toContain("RFU");
  });

  it("shows 'No data' for null value with no allValues", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: null,
      allValues: undefined,
      tooltipExtra: undefined,
      activeLayerId: undefined,
      layerConfigMap: emptyMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("No data");
  });

  it("shows active layer marker for null value with activeLayerId", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: null,
      allValues: undefined,
      tooltipExtra: undefined,
      activeLayerId: "RFU",
      layerConfigMap: emptyMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("▶ RFU: -");
  });

  it("includes all layer values when allValues provided", () => {
    const layerMap = new Map<string, LayerConfig>();
    layerMap.set("RFU", { id: "RFU", valueUnit: "RFU" });
    const text = buildWellHoverText({
      wellId: "A1",
      value: 100,
      allValues: { RFU: 100, AU: 50 },
      tooltipExtra: undefined,
      activeLayerId: "RFU",
      layerConfigMap: layerMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("▶ RFU: 100");
    expect(text).toContain("AU: 50");
  });

  it("includes tooltip extra data", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: 100,
      allValues: undefined,
      tooltipExtra: { sampleId: "S1", concentration: "100 nM" },
      activeLayerId: undefined,
      layerConfigMap: emptyMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("sampleId: S1");
    expect(text).toContain("concentration: 100 nM");
  });

  it("handles null values in allValues", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: null,
      allValues: { RFU: null },
      tooltipExtra: undefined,
      activeLayerId: "RFU",
      layerConfigMap: emptyMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("▶ RFU: -");
  });

  it("capitalizes string values in allValues", () => {
    const text = buildWellHoverText({
      wellId: "A1",
      value: null,
      allValues: { Type: "sample" },
      tooltipExtra: undefined,
      activeLayerId: undefined,
      layerConfigMap: emptyMap,
      precision: 0,
      valueUnit: "",
    });
    expect(text).toContain("Type: Sample");
  });
});

// ─── buildColorbarConfig ───────────────────────────────────────────────────

describe("buildColorbarConfig", () => {
  it("returns horizontal config for bottom position", () => {
    const config = buildColorbarConfig("bottom", " RFU");
    expect(config.orientation).toBe("h");
    expect(config.ticksuffix).toBe(" RFU");
    expect(config.yanchor).toBe("top");
  });

  it("returns horizontal config for top position", () => {
    const config = buildColorbarConfig("top", " AU");
    expect(config.orientation).toBe("h");
    expect(config.yanchor).toBe("bottom");
  });

  it("returns vertical config for right position", () => {
    const config = buildColorbarConfig("right", "");
    expect(config.orientation).toBeUndefined();
    expect(config.xanchor).toBe("left");
  });

  it("includes title when provided", () => {
    const config = buildColorbarConfig("bottom", "", "Signal");
    expect(config.title).toBeDefined();
    expect(config.title?.text).toBe("Signal");
  });
});

// ─── buildPlotMargins ──────────────────────────────────────────────────────

describe("buildPlotMargins", () => {
  it("returns margin object with expected keys", () => {
    const margins = buildPlotMargins("right", true, true);
    expect(margins).toHaveProperty("t");
    expect(margins).toHaveProperty("r");
    expect(margins).toHaveProperty("b");
    expect(margins).toHaveProperty("l");
  });
});

// ─── calculateTitleX ───────────────────────────────────────────────────────

describe("calculateTitleX", () => {
  it("returns a number", () => {
    const x = calculateTitleX("right", true, true);
    expect(typeof x).toBe("number");
  });
});

// ─── calculateAxisDomain ───────────────────────────────────────────────────

describe("calculateAxisDomain", () => {
  it("returns a [min, max] tuple", () => {
    const domain = calculateAxisDomain("right", true, true);
    expect(domain).toHaveLength(2);
    expect(domain[0]).toBeLessThan(domain[1]);
  });
});

// ─── flattenGridData ───────────────────────────────────────────────────────

describe("flattenGridData", () => {
  it("flattens 2D grid into scatter plot data", () => {
    const plotZ = [[1, 2], [3, 4]];
    const rowLabels = ["A", "B"];
    const hoverText = [["A1", "A2"], ["B1", "B2"]];
    const result = flattenGridData(plotZ, rowLabels, hoverText, 2, 2, 0);
    expect(result.xData).toEqual([1, 2, 1, 2]);
    expect(result.yData).toEqual(["A", "A", "B", "B"]);
    expect(result.colorData).toEqual([1, 2, 3, 4]);
    expect(result.textData).toEqual(["A1", "A2", "B1", "B2"]);
  });

  it("replaces null values with plotZMin", () => {
    const plotZ: (number | null)[][] = [[null, 5]];
    const rowLabels = ["A"];
    const hoverText = [["empty", "val"]];
    const result = flattenGridData(plotZ, rowLabels, hoverText, 1, 2, -1);
    expect(result.colorData[0]).toBe(-1);
    expect(result.colorData[1]).toBe(5);
  });
});

// ─── calculateMarkerSize ───────────────────────────────────────────────────

describe("calculateMarkerSize", () => {
  it("returns a positive number", () => {
    const size = calculateMarkerSize(700, 450, 8, 12, "circle", true, true);
    expect(size).toBeGreaterThan(0);
  });

  it("returns larger size for smaller plates", () => {
    const small = calculateMarkerSize(500, 400, 2, 3, "circle", false, false);
    const large = calculateMarkerSize(500, 400, 32, 48, "circle", false, false);
    expect(small).toBeGreaterThanOrEqual(large);
  });
});
