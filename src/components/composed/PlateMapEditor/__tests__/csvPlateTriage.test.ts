import { describe, expect, it } from "vitest";

import { triagePlateMapCsvFile } from "../csvPlateTriage";

const CSV_CONTENT = "plate barcode,well,sample\nPLATE-001,A01,S-1\nPLATE-001,A02,S-2\nPLATE-002,B01,S-3";

describe("triagePlateMapCsvFile", () => {
  it("returns undefined for files that are not recognized as CSV", async () => {
    const file = new File(["not,a,csv"], "report.txt", { type: "text/plain" });
    const result = await triagePlateMapCsvFile(file);
    expect(result).toBeUndefined();
  });

  it("triages files whose name ends with .csv regardless of mime type", async () => {
    const file = new File([CSV_CONTENT], "plates.csv", { type: "" });
    const result = await triagePlateMapCsvFile(file);
    expect(result).toBeDefined();
    expect(result?.plateBarcodeColumn).toBe("plate barcode");
    expect(result?.plates.map((plate) => plate.barcode)).toEqual(["PLATE-001", "PLATE-002"]);
  });

  it("triages files whose mime type is text/csv even with a non-csv extension", async () => {
    const file = new File([CSV_CONTENT], "plates.dat", { type: "text/csv" });
    const result = await triagePlateMapCsvFile(file);
    expect(result).toBeDefined();
    expect(result?.headers).toEqual(["plate barcode", "well", "sample"]);
    expect(result?.plates).toHaveLength(2);
  });

  it("triages files reported as application/vnd.ms-excel", async () => {
    const file = new File([CSV_CONTENT], "plates.xls", { type: "application/vnd.ms-excel" });
    const result = await triagePlateMapCsvFile(file);
    expect(result).toBeDefined();
    expect(result?.plates).toHaveLength(2);
  });

  it("treats uppercase .CSV extensions as CSV files", async () => {
    const file = new File([CSV_CONTENT], "PLATES.CSV", { type: "" });
    const result = await triagePlateMapCsvFile(file);
    expect(result).toBeDefined();
    expect(result?.rows).toHaveLength(3);
  });

  it("forwards triage options when parsing the CSV file", async () => {
    const csv = "barcode,well\nPLATE-001,A01\nPLATE-002,A02";
    const file = new File([csv], "custom.csv", { type: "text/csv" });
    const result = await triagePlateMapCsvFile(file, { plateBarcodeColumn: "barcode" });
    expect(result?.plateBarcodeColumn).toBe("barcode");
    expect(result?.plates.map((plate) => plate.barcode)).toEqual(["PLATE-001", "PLATE-002"]);
  });
});
