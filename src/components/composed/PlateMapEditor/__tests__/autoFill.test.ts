import { describe, expect, it } from "vitest";

import { autoFillPositions, autoFillRecords } from "../autoFill";

import type { PlateDimensions } from "../types";

const DIMS_96: PlateDimensions = { rows: 8, columns: 12 };
const DIMS_SMALL: PlateDimensions = { rows: 3, columns: 4 };

describe("autoFillPositions", () => {
  it("returns empty for non-positive count or replicates", () => {
    expect(autoFillPositions({ dims: DIMS_96, count: 0 })).toEqual([]);
    expect(autoFillPositions({ dims: DIMS_96, count: 5, replicates: 0 })).toEqual([]);
  });

  it("defaults to row-major traversal", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 5 })).toEqual([
      "A01",
      "A02",
      "A03",
      "A04",
      "B01",
    ]);
  });

  it("walks column-major when requested", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 5, strategy: "column-major" })).toEqual([
      "A01",
      "B01",
      "C01",
      "A02",
      "B02",
    ]);
  });

  it("reverses every other row in row-snake", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 8, strategy: "row-snake" })).toEqual([
      "A01",
      "A02",
      "A03",
      "A04",
      "B04",
      "B03",
      "B02",
      "B01",
    ]);
  });

  it("reverses every other column in column-snake", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 8, strategy: "column-snake" })).toEqual([
      "A01",
      "B01",
      "C01",
      "C02",
      "B02",
      "A02",
      "A03",
      "B03",
    ]);
  });

  it("honors startWellId by skipping forward to that position", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 3, startWellId: "B02" })).toEqual([
      "B02",
      "B03",
      "B04",
    ]);
  });

  it("ignores an invalid startWellId and starts at the origin", () => {
    expect(autoFillPositions({ dims: DIMS_SMALL, count: 2, startWellId: "Z99" })).toEqual([
      "A01",
      "A02",
    ]);
  });

  it("repeats each item by replicates and truncates at plate boundary", () => {
    const out = autoFillPositions({ dims: DIMS_SMALL, count: 7, replicates: 2 });
    // 3x4=12 cells, 7 items * 2 replicates = 14 → truncated to 12
    expect(out).toHaveLength(12);
    expect(out.slice(0, 4)).toEqual(["A01", "A02", "A03", "A04"]);
  });
});

describe("autoFillRecords", () => {
  it("maps each item to a record using the builder, respecting replicates", () => {
    const items = ["alpha", "beta"];
    const records = autoFillRecords(
      items,
      (item, idx, wellId) => ({ item, idx, wellId }),
      { dims: DIMS_SMALL, replicates: 2 },
    );

    expect(records.get("A01")).toEqual({ item: "alpha", idx: 0, wellId: "A01" });
    expect(records.get("A02")).toEqual({ item: "alpha", idx: 0, wellId: "A02" });
    expect(records.get("A03")).toEqual({ item: "beta", idx: 1, wellId: "A03" });
    expect(records.get("A04")).toEqual({ item: "beta", idx: 1, wellId: "A04" });
    expect(records.size).toBe(4);
  });

  it("skips undefined items rather than placing empty records", () => {
    const items: (string | undefined)[] = ["alpha"];
    const records = autoFillRecords(
      items as string[],
      (item, idx, wellId) => ({ item, idx, wellId }),
      { dims: DIMS_SMALL, replicates: 1 },
    );
    expect(records.size).toBe(1);
    expect(records.get("A01")?.item).toBe("alpha");
  });
});
