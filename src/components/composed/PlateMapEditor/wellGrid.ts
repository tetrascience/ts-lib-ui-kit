import type { PlateDimensions, PlateFormat, WellId } from "./types";

const FORMAT_DIMENSIONS: Record<Exclude<PlateFormat, "custom">, PlateDimensions> = {
  "96": { rows: 8, columns: 12 },
  "384": { rows: 16, columns: 24 },
  "1536": { rows: 32, columns: 48 },
};

const ALPHABET_SIZE = 26;
const CHAR_CODE_A = 65;
const TRIPLE_DIGIT_THRESHOLD = 100;
const DOUBLE_DIGIT_PAD = 2;
const TRIPLE_DIGIT_PAD = 3;

export function resolveDimensions(
  format: PlateFormat,
  rows?: number,
  columns?: number,
): PlateDimensions {
  if (format === "custom") {
    return {
      rows: rows ?? 8,
      columns: columns ?? 12,
    };
  }
  return FORMAT_DIMENSIONS[format];
}

/** Letter for a row index. Supports A-Z then AA-ZZ for 1536-format plates. */
export function rowLabel(row: number): string {
  if (row < ALPHABET_SIZE) return String.fromCharCode(CHAR_CODE_A + row);
  const high = Math.floor(row / ALPHABET_SIZE) - 1;
  const low = row % ALPHABET_SIZE;
  return (
    String.fromCharCode(CHAR_CODE_A + high) +
    String.fromCharCode(CHAR_CODE_A + low)
  );
}

export function parseRowLabel(label: string): number {
  if (label.length === 1) return label.charCodeAt(0) - CHAR_CODE_A;
  return (
    (label.charCodeAt(0) - CHAR_CODE_A + 1) * ALPHABET_SIZE +
    (label.charCodeAt(1) - CHAR_CODE_A)
  );
}

/** Pad column number to a width that matches the plate's column count. */
function colPadWidth(columns: number): number {
  return columns >= TRIPLE_DIGIT_THRESHOLD ? TRIPLE_DIGIT_PAD : DOUBLE_DIGIT_PAD;
}

export function pos(row: number, col: number, columns: number): WellId {
  return `${rowLabel(row)}${String(col + 1).padStart(colPadWidth(columns), "0")}`;
}

export function parsePos(
  id: WellId,
  dims: PlateDimensions,
): { row: number; col: number } | null {
  if (!id) return null;
  const m = /^([A-Z]{1,2})(\d+)$/.exec(id);
  if (!m) return null;
  const row = parseRowLabel(m[1]);
  const col = parseInt(m[2], 10) - 1;
  if (
    Number.isNaN(col) ||
    row < 0 ||
    row >= dims.rows ||
    col < 0 ||
    col >= dims.columns
  ) {
    return null;
  }
  return { row, col };
}

export function rectPositions(
  r0: number,
  c0: number,
  r1: number,
  c1: number,
  columns: number,
): WellId[] {
  const rs = [Math.min(r0, r1), Math.max(r0, r1)];
  const cs = [Math.min(c0, c1), Math.max(c0, c1)];
  const out: WellId[] = [];
  for (let r = rs[0]; r <= rs[1]; r++) {
    for (let c = cs[0]; c <= cs[1]; c++) {
      out.push(pos(r, c, columns));
    }
  }
  return out;
}

export function allPositions(dims: PlateDimensions): WellId[] {
  const out: WellId[] = [];
  for (let r = 0; r < dims.rows; r++) {
    for (let c = 0; c < dims.columns; c++) {
      out.push(pos(r, c, dims.columns));
    }
  }
  return out;
}
