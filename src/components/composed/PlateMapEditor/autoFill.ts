import { parsePos, pos } from "./wellGrid";

import type { PlateDimensions, WellId } from "./types";

export type FillStrategy = "row-major" | "column-major" | "row-snake" | "column-snake";

export interface AutoFillOptions {
  dims: PlateDimensions;
  /** Number of distinct items to place. Each is repeated `replicates` times. */
  count: number;
  /** First well in fill order. Defaults to position (0,0). */
  startWellId?: WellId;
  /** Traversal strategy. Defaults to `"row-major"`. */
  strategy?: FillStrategy;
  /** Consecutive cells assigned per item. Defaults to 1. */
  replicates?: number;
}

function fullOrder(dims: PlateDimensions, strategy: FillStrategy): WellId[] {
  const out: WellId[] = [];
  const { rows, columns } = dims;
  if (strategy === "row-major") {
    for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) out.push(pos(r, c, columns));
    return out;
  }
  if (strategy === "column-major") {
    for (let c = 0; c < columns; c++) for (let r = 0; r < rows; r++) out.push(pos(r, c, columns));
    return out;
  }
  if (strategy === "row-snake") {
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < columns; c++) out.push(pos(r, c, columns));
      } else {
        for (let c = columns - 1; c >= 0; c--) out.push(pos(r, c, columns));
      }
    }
    return out;
  }
  for (let c = 0; c < columns; c++) {
    if (c % 2 === 0) {
      for (let r = 0; r < rows; r++) out.push(pos(r, c, columns));
    } else {
      for (let r = rows - 1; r >= 0; r--) out.push(pos(r, c, columns));
    }
  }
  return out;
}

/**
 * Compute the ordered list of well ids to assign to `count` items (each
 * repeated `replicates` times) starting from `startWellId`. Returns at most
 * `dims.rows * dims.columns` ids — overflow is silently truncated so callers
 * can paginate onto multiple plates themselves.
 */
export function autoFillPositions(options: AutoFillOptions): WellId[] {
  const { dims, count, startWellId, strategy = "row-major", replicates = 1 } = options;
  if (count <= 0 || replicates <= 0) return [];

  const order = fullOrder(dims, strategy);
  let startIdx = 0;
  if (startWellId) {
    const startIndex = order.indexOf(startWellId);
    if (startIndex >= 0) startIdx = startIndex;
    else {
      const parsed = parsePos(startWellId, dims);
      if (parsed) {
        const targetId = pos(parsed.row, parsed.col, dims.columns);
        const matched = order.indexOf(targetId);
        if (matched >= 0) startIdx = matched;
      }
    }
  }

  const totalNeeded = count * replicates;
  const slice = order.slice(startIdx, startIdx + totalNeeded);
  return slice;
}

/**
 * Convenience wrapper: assigns each input item to `replicates` consecutive
 * wells, returning a `Map<WellId, T>`. The mapper builds the record stored at
 * each well (e.g. stamp item-specific fields onto a base record).
 */
export function autoFillRecords<T>(
  items: T[],
  buildRecord: (item: T, index: number, wellId: WellId) => T,
  options: Omit<AutoFillOptions, "count">,
): Map<WellId, T> {
  const positions = autoFillPositions({ ...options, count: items.length });
  const replicates = options.replicates ?? 1;
  const next = new Map<WellId, T>();
  positions.forEach((wellId, idx) => {
    const itemIndex = Math.floor(idx / replicates);
    const item = items[itemIndex];
    if (item === undefined) return;
    next.set(wellId, buildRecord(item, itemIndex, wellId));
  });
  return next;
}
