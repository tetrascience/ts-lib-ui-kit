/**
 * Data processing utilities for ChromatogramChart
 */

import type { BaselineCorrectionMethod } from "./types";

/**
 * Build the extra content for Plotly hovertemplate from series metadata.
 * Displays all metadata fields as key: value pairs.
 */
export function buildHoverExtraContent(
  seriesName: string,
  metadata?: Record<string, unknown>
): string {
  if (!metadata) return seriesName;

  const metaLines: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null && value !== "") {
      // Format the key as Title Case (e.g., "sampleName" -> "Sample Name")
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      metaLines.push(`${formattedKey}: ${String(value)}`);
    }
  }

  if (metaLines.length > 0) {
    return `${seriesName}<br>${metaLines.join("<br>")}`;
  }
  return seriesName;
}

/**
 * Validate and sanitize series data.
 * - Ensures x and y arrays have the same length (truncates to shorter)
 * - Replaces NaN and Infinity values with 0
 */
export function validateSeriesData(
  x: number[],
  y: number[]
): { x: number[]; y: number[] } {
  // Ensure arrays have same length
  const length = Math.min(x.length, y.length);
  const validX = x.slice(0, length);
  const validY = y.slice(0, length);

  // Sanitize NaN and Infinity values
  const sanitizedY = validY.map((val) => (Number.isFinite(val) ? val : 0));
  const sanitizedX = validX.map((val) => (Number.isFinite(val) ? val : 0));

  return { x: sanitizedX, y: sanitizedY };
}

/**
 * Apply baseline correction to signal data
 */
export function applyBaselineCorrection(
  y: number[],
  method: BaselineCorrectionMethod,
  windowSize: number = 50
): number[] {
  if (method === "none" || y.length === 0) return y;

  if (method === "linear") {
    // Linear baseline from first to last point
    // Handle single-point case to avoid division by zero
    if (y.length === 1) {
      return [0]; // Single point baseline-corrected to zero
    }
    const slope = (y[y.length - 1] - y[0]) / (y.length - 1);
    return y.map((val, i) => val - (y[0] + slope * i));
  }

  if (method === "rolling") {
    // Rolling minimum baseline
    const baseline: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < y.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(y.length, i + halfWindow + 1);
      const windowSlice = y.slice(start, end);
      baseline.push(Math.min(...windowSlice));
    }

    return y.map((val, i) => val - baseline[i]);
  }

  return y;
}

