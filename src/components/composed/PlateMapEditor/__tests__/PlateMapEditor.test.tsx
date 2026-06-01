import { describe, expect, it } from "vitest";

import { plateOptionsFromCsvTriage, triagePlateMapCsvByBarcode } from "../csvPlateTriage";

describe("PlateMapEditor CSV triage helpers", () => {
  it("triages CSV rows by user-provided plate barcode", () => {
    const triage = triagePlateMapCsvByBarcode(
      "plate barcode,well,sample\nPLATE-001,A01,S-1\nPLATE-002,A01,S-2\nPLATE-001,A02,S-3\n,A03,S-4",
    );

    expect(triage.plateBarcodeColumn).toBe("plate barcode");
    expect(triage.plates).toEqual([
      expect.objectContaining({ id: "PLATE-001", barcode: "PLATE-001", rowCount: 2 }),
      expect.objectContaining({ id: "PLATE-002", barcode: "PLATE-002", rowCount: 1 }),
    ]);
    expect(triage.missingBarcodeRows.map((row) => row.line)).toEqual([5]);
    expect(plateOptionsFromCsvTriage(triage)).toEqual([
      { id: "PLATE-001", barcode: "PLATE-001", count: 2 },
      { id: "PLATE-002", barcode: "PLATE-002", count: 1 },
    ]);
  });

  it("triages quoted CSV fields and skips blank records", () => {
    const triage = triagePlateMapCsvByBarcode(
      '"plate barcode",well,sample\r\n"PLATE,001",A01,"S ""alpha"""\r\n,,\r\nPLATE-002,A02,S-2',
    );

    expect(triage.headers).toEqual(["plate barcode", "well", "sample"]);
    expect(triage.rows).toHaveLength(2);
    expect(triage.rows[0]).toEqual({
      line: 2,
      values: {
        "plate barcode": "PLATE,001",
        well: "A01",
        sample: 'S "alpha"',
      },
    });
    expect(triage.plates.map((plate) => plate.barcode)).toEqual(["PLATE,001", "PLATE-002"]);
    expect(triage.missingBarcodeRows).toEqual([]);
  });
});
