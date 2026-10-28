import { DEFAULT_MAX_POINTS } from "./constants";

import type { DownsamplingConfig, ScatterPoint, SelectionMode } from "./types";

/**
 * Calculate min and max values for a numeric field in the data
 */
export function calculateRange(data: ScatterPoint[], field: string): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const point of data) {
    const value = point.metadata?.[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  // Handle edge case where all values are invalid
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }

  // Handle edge case where min === max
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

/**
 * Get unique categorical values from a field
 */
export function getUniqueCategories(data: ScatterPoint[], field: string): string[] {
  const uniqueCategories = data
    .map((point) => point.metadata?.[field])
    .filter((value): value is string => typeof value === "string");

  return [...new Set(uniqueCategories)].sort();
}

/**
 * Downsample data using specified strategy
 */
export function downsampleData(data: ScatterPoint[], config: DownsamplingConfig): ScatterPoint[] {
  if (!config.enabled || data.length <= (config.maxPoints || DEFAULT_MAX_POINTS)) {
    return data;
  }

  const maxPoints = config.maxPoints || DEFAULT_MAX_POINTS;
  const strategy = config.strategy || "lttb";

  if (strategy === "lttb") {
    // Largest Triangle Three Buckets algorithm
    return lttbDownsample(data, maxPoints);
  }

  return data;
}

/**
 * Compute the (x, y) centroid of data[start..end).
 * Falls back to the point at clamp(start, 0, dataLength-1) when the range is
 * empty (only reachable under extreme floating-point drift) to prevent NaN.
 */
function bucketCentroid(
  data: ScatterPoint[],
  start: number,
  end: number,
  dataLength: number,
): { x: number; y: number } {
  const length = end - start;
  if (length > 0) {
    let sumX = 0;
    let sumY = 0;
    for (let j = start; j < end; j++) {
      sumX += data[j].x;
      sumY += data[j].y;
    }
    return { x: sumX / length, y: sumY / length };
  }
  const fallbackIdx = Math.max(0, Math.min(start, dataLength - 1));
  return { x: data[fallbackIdx].x, y: data[fallbackIdx].y };
}

/**
 * Largest Triangle Three Buckets (LTTB) downsampling algorithm.
 * Preserves the visual shape of the data by maximizing the triangle area
 * formed by adjacent bucket centroids and each candidate point.
 * Exported for unit testing
 */
export function lttbDownsample(data: ScatterPoint[], threshold: number): ScatterPoint[] {
  const dataLength = data.length;

  // --- Edge cases ---
  if (threshold <= 0 || dataLength === 0) return [];
  // No downsampling needed; return the original reference unchanged.
  if (threshold >= dataLength) return data;
  if (threshold === 1) return [data[0]];
  if (threshold === 2) return [data[0], data[dataLength - 1]];

  // At this point: 3 <= threshold < dataLength, so dataLength >= 4.
  // Spread (dataLength - 2) interior points across (threshold - 2) buckets,
  // keeping the first and last points fixed outside the buckets.
  // With threshold < dataLength, every > 1, so no bucket is ever empty.
  const every = (dataLength - 2) / (threshold - 2);

  const { floor, abs, min } = Math;
  const sampled: ScatterPoint[] = [data[0]];

  // Index of the previously selected point — left vertex A of the triangle.
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Centroid of the *next* bucket — right vertex C of the triangle.
    // Biases candidate selection toward points that preserve visual variance.
    const avgRangeStart = min(floor((i + 1) * every) + 1, dataLength - 1);
    const avgRangeEnd = min(floor((i + 2) * every) + 1, dataLength);
    const { x: avgX, y: avgY } = bucketCentroid(data, avgRangeStart, avgRangeEnd, dataLength);

    // Boundaries of the current bucket — middle vertex B candidates.
    // Clamped to valid index range to guard against floating-point drift.
    const rangeStart = min(floor(i * every) + 1, dataLength - 1);
    const rangeEnd = min(floor((i + 1) * every) + 1, dataLength - 1);

    const pointAX = data[a].x;
    const pointAY = data[a].y;

    // Safe fallback: first point in the bucket, used when the bucket is degenerate.
    let maxArea = -1;
    let maxAreaPoint: ScatterPoint = data[rangeStart];
    let nextA = rangeStart;

    for (let j = rangeStart; j < rangeEnd; j++) {
      // Area of the triangle formed by A (prev selected), B (candidate), C (next centroid).
      // The point maximising this area is the most visually significant in the bucket.
      const area = abs((pointAX - avgX) * (data[j].y - pointAY) - (pointAX - data[j].x) * (avgY - pointAY)) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }

    sampled.push(maxAreaPoint);
    a = nextA;
  }

  sampled.push(data[dataLength - 1]); // Always include the last point.

  return sampled;
}

/**
 * Determine selection mode from keyboard event
 */
export function getSelectionMode(event: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }): SelectionMode {
  const ctrlOrCmd = event.ctrlKey || event.metaKey;

  if (event.shiftKey && ctrlOrCmd) {
    return "toggle";
  }
  if (event.shiftKey) {
    return "add";
  }
  if (ctrlOrCmd) {
    return "remove";
  }
  return "replace";
}

/**
 * Apply selection to a set of point IDs
 */
export function applySelection(
  currentSelection: Set<string | number>,
  newIds: Set<string | number>,
  mode: SelectionMode,
): Set<string | number> {
  const result = new Set(currentSelection);

  switch (mode) {
    case "replace":
      return new Set(newIds);

    case "add":
      for (const id of newIds) {
        result.add(id);
      }
      return result;

    case "remove":
      for (const id of newIds) {
        result.delete(id);
      }
      return result;

    case "toggle":
      for (const id of newIds) {
        if (result.has(id)) {
          result.delete(id);
        } else {
          result.add(id);
        }
      }
      return result;

    default:
      return result;
  }
}
