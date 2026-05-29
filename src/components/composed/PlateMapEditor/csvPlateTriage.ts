import type {
  PlateMapCsvPlate,
  PlateMapCsvRow,
  PlateMapCsvTriage,
  PlateMapCsvTriageOptions,
  PlateMapPlateOption,
} from "./types";

const DEFAULT_PLATE_BARCODE_COLUMNS = [
  "plate barcode",
  "plate_barcode",
  "plate-barcode",
  "plateBarcode",
  "plate id",
  "plate_id",
  "plateId",
];

const CSV_MIME_TYPES = new Set(["text/csv", "application/vnd.ms-excel"]);

function normalizeColumnName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pushCsvField(record: string[], field: string): string[] {
  return [...record, field];
}

function pushCsvRecord(
  records: string[][],
  record: string[],
  field: string,
): { records: string[][]; record: string[] } {
  const nextRecord = pushCsvField(record, field);
  if (nextRecord.some((cell) => cell.trim() !== "")) {
    return { records: [...records, nextRecord], record: [] };
  }
  return { records, record: [] };
}

function readQuotedCsvCharacter(text: string, index: number, field: string) {
  const char = text[index];
  if (char !== '"') return { field: `${field}${char}`, quoted: true, index };
  if (text[index + 1] === '"') return { field: `${field}"`, quoted: true, index: index + 1 };
  return { field, quoted: false, index };
}

function parseCsvRecords(text: string): string[][] {
  let records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      const next = readQuotedCsvCharacter(text, index, field);
      field = next.field;
      quoted = next.quoted;
      index = next.index;
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === ",") {
      record = pushCsvField(record, field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      const next = pushCsvRecord(records, record, field);
      records = next.records;
      record = next.record;
      field = "";
      if (char === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field = `${field}${char}`;
    }
  }

  if (field !== "" || record.length > 0) {
    records = pushCsvRecord(records, record, field).records;
  }

  return records;
}

function resolvePlateBarcodeColumn(headers: string[], options?: PlateMapCsvTriageOptions): string | undefined {
  const candidates = [
    options?.plateBarcodeColumn,
    ...(options?.plateBarcodeColumnAliases ?? []),
    ...DEFAULT_PLATE_BARCODE_COLUMNS,
  ]
    .filter((candidate): candidate is string => !!candidate)
    .map(normalizeColumnName);

  return headers.find((header) => candidates.includes(normalizeColumnName(header)));
}

function recordToRow(headers: string[], record: string[], recordIndex: number): PlateMapCsvRow {
  const values = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
    acc[header] = record[headerIndex] ?? "";
    return acc;
  }, {});

  return {
    line: recordIndex + 2,
    values,
  };
}

function groupRowsByBarcode(rows: PlateMapCsvRow[], plateBarcodeColumn: string | undefined) {
  const plateRows = new Map<string, PlateMapCsvRow[]>();
  const missingBarcodeRows: PlateMapCsvRow[] = [];

  rows.forEach((row) => {
    const barcode = plateBarcodeColumn ? row.values[plateBarcodeColumn]?.trim() : "";
    if (!barcode) {
      missingBarcodeRows.push(row);
      return;
    }

    const rowsForBarcode = plateRows.get(barcode) ?? [];
    plateRows.set(barcode, [...rowsForBarcode, row]);
  });

  return { plateRows, missingBarcodeRows };
}

export function triagePlateMapCsvByBarcode(text: string, options?: PlateMapCsvTriageOptions): PlateMapCsvTriage {
  const records = parseCsvRecords(text);
  const headers = records[0]?.map((header) => header.trim()) ?? [];
  const plateBarcodeColumn = resolvePlateBarcodeColumn(headers, options);
  const rows = records.slice(1).map((record, recordIndex) => recordToRow(headers, record, recordIndex));
  const { plateRows, missingBarcodeRows } = groupRowsByBarcode(rows, plateBarcodeColumn);
  const plates: PlateMapCsvPlate[] = [...plateRows.entries()].map(([barcode, plateRowsForBarcode]) => ({
    id: barcode,
    barcode,
    rows: plateRowsForBarcode,
    rowCount: plateRowsForBarcode.length,
  }));

  return {
    headers,
    plateBarcodeColumn,
    rows,
    plates,
    missingBarcodeRows,
  };
}

export function plateOptionsFromCsvTriage(triage: PlateMapCsvTriage): PlateMapPlateOption[] {
  return triage.plates.map((plate) => ({
    id: plate.id,
    barcode: plate.barcode,
    count: plate.rowCount,
  }));
}

export async function triagePlateMapCsvFile(
  file: File,
  options?: PlateMapCsvTriageOptions,
): Promise<PlateMapCsvTriage | undefined> {
  const fileName = file.name.toLowerCase();
  const isCsv = fileName.endsWith(".csv") || CSV_MIME_TYPES.has(file.type);
  if (!isCsv) return undefined;

  return triagePlateMapCsvByBarcode(await file.text(), options);
}
