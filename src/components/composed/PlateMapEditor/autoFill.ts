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

function positionAtIndex(dims: PlateDimensions, strategy: FillStrategy, index: number): WellId {
  const { rows, columns } = dims;
  if (strategy === "row-major") {
    return pos(Math.floor(index / columns), index % columns, columns);
  }
  if (strategy === "column-major") {
    return pos(index % rows, Math.floor(index / rows), columns);
  }
  if (strategy === "row-snake") {
    const r = Math.floor(index / columns);
    const i = index % columns;
    const c = r % 2 === 0 ? i : columns - 1 - i;
    return pos(r, c, columns);
  }
  const c = Math.floor(index / rows);
  const i = index % rows;
  const r = c % 2 === 0 ? i : rows - 1 - i;
  return pos(r, c, columns);
}

function findStartIndex(dims: PlateDimensions, strategy: FillStrategy, startWellId: WellId | undefined): number {
  if (!startWellId) return 0;
  const parsed = parsePos(startWellId, dims);
  if (!parsed) return 0;
  const total = dims.rows * dims.columns;
  for (let i = 0; i < total; i++) {
    if (positionAtIndex(dims, strategy, i) === startWellId) return i;
  }
  return 0;
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

  const total = dims.rows * dims.columns;
  const startIdx = findStartIndex(dims, strategy, startWellId);
  const end = Math.min(total, startIdx + count * replicates);
  const out: WellId[] = [];
  for (let i = startIdx; i < end; i++) {
    out.push(positionAtIndex(dims, strategy, i));
  }
  return out;
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
