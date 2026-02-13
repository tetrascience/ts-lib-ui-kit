/**
 * Data processing utilities for ChromatogramChart
 */

import type { BaselineCorrectionMethod, PeakAnnotation } from "./types";

/**
 * Data structure for peaks with their associated series data
 */
export type PeakDataWithSeries = {
  peaks: PeakAnnotation[];
  seriesIndex: number;
  x: number[];
  y: number[];
};

/**
 * Collect peaks with boundary information from both auto-detected peaks and user-provided annotations.
 * User-provided annotations with startIndex and endIndex are included for boundary marker rendering.
 */
export function collectPeaksWithBoundaryData(
  allDetectedPeaks: { peaks: PeakAnnotation[]; seriesIndex: number }[],
  annotations: PeakAnnotation[],
  processedSeries: { x: number[]; y: number[] }[]
): PeakDataWithSeries[] {
  const peaksWithData: PeakDataWithSeries[] = [];

  // Add auto-detected peaks
  allDetectedPeaks.forEach(({ peaks, seriesIndex }) => {
    peaksWithData.push({
      peaks,
      seriesIndex,
      x: processedSeries[seriesIndex].x,
      y: processedSeries[seriesIndex].y,
    });
  });

  // Add user-provided annotations that have boundary info (startIndex and endIndex)
  const annotationsWithBoundaries = annotations.filter(
    (ann) => ann.startIndex !== undefined && ann.endIndex !== undefined
  );
  if (annotationsWithBoundaries.length > 0 && processedSeries.length > 0) {
    peaksWithData.push({
      peaks: annotationsWithBoundaries,
      seriesIndex: 0, // User annotations apply to first series by default
      x: processedSeries[0].x,
      y: processedSeries[0].y,
    });
  }

  return peaksWithData;
}

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

