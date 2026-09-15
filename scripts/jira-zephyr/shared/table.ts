/** Tiny fixed-width table renderer for terminal reports (no dependency). */

export function renderTable(headers: readonly string[], rows: ReadonlyArray<readonly string[]>): string {
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => (row[column] ?? "").length)),
  );
  const line = (cells: readonly string[]) =>
    cells
      .map((cell, column) => (column === cells.length - 1 ? cell : cell.padEnd(widths[column])))
      .join("  ")
      .trimEnd();
  return [line(headers), ...rows.map(line)].join("\n");
}

/** "SW-T1,SW-T2,+3" style summary of an id list, or "-" when empty. */
export function formatIdList(ids: readonly string[], max = 3): string {
  if (ids.length === 0) return "-";
  const shown = ids.slice(0, max).join(",");
  return ids.length > max ? `${shown},+${ids.length - max}` : shown;
}
