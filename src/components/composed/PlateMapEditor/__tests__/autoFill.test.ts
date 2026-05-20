import { describe, expect, it, vi } from "vitest";

import { autoFillPositions, autoFillRecords } from "../autoFill";

const dims = { rows: 2, columns: 3 };

describe("autoFillPositions", () => {
  it("fills wells in row-major order by default", () => {
    expect(autoFillPositions({ dims, count: 4 })).toEqual([
      "A01",
      "A02",
      "A03",
      "B01",
    ]);
  });

  it("fills wells in column-major order", () => {
    expect(autoFillPositions({ dims, count: 4, strategy: "column-major" })).toEqual([
      "A01",
      "B01",
      "A02",
      "B02",
    ]);
  });

  it("fills wells with row and column snake traversal", () => {
    expect(autoFillPositions({ dims, count: 6, strategy: "row-snake" })).toEqual([
      "A01",
      "A02",
      "A03",
      "B03",
      "B02",
      "B01",
    ]);

    expect(
      autoFillPositions({
        dims: { rows: 3, columns: 2 },
        count: 6,
        strategy: "column-snake",
      }),
    ).toEqual(["A01", "B01", "C01", "C02", "B02", "A02"]);
  });

  it("starts at a valid well and truncates at the plate boundary", () => {
    expect(
      autoFillPositions({
        dims,
        count: 3,
        startWellId: "B02",
      }),
    ).toEqual(["B02", "B03"]);
  });

  it("falls back to the first well when the start well is missing or invalid", () => {
    expect(autoFillPositions({ dims, count: 2, startWellId: "Z99" })).toEqual([
      "A01",
      "A02",
    ]);

    expect(autoFillPositions({ dims, count: 2, startWellId: "A1" })).toEqual([
      "A01",
      "A02",
    ]);

    expect(autoFillPositions({ dims, count: 2 })).toEqual(["A01", "A02"]);
  });

  it("returns no positions for non-positive counts or replicates", () => {
    expect(autoFillPositions({ dims, count: 0 })).toEqual([]);
    expect(autoFillPositions({ dims, count: 2, replicates: 0 })).toEqual([]);
  });
});

describe("autoFillRecords", () => {
  it("maps replicated input items onto generated well positions", () => {
    const records = autoFillRecords(
      ["sample-1", "sample-2"],
      (item, index, wellId) => `${item}:${index}:${wellId}`,
      { dims, replicates: 2 },
    );

    expect([...records.entries()]).toEqual([
      ["A01", "sample-1:0:A01"],
      ["A02", "sample-1:0:A02"],
      ["A03", "sample-2:1:A03"],
      ["B01", "sample-2:1:B01"],
    ]);
  });

  it("skips sparse item slots instead of invoking the record builder", () => {
    const buildRecord = vi.fn();

    const records = autoFillRecords<string | undefined>(
      [undefined],
      buildRecord,
      { dims },
    );

    expect(records.size).toBe(0);
    expect(buildRecord).not.toHaveBeenCalled();
  });
});
