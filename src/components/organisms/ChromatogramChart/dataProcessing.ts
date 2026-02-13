/**
 * Data processing utilities for ChromatogramChart
 */

import { calculatePeakArea } from "./peakDetection";

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
 * Find the closest index in an array for a given target value.
 * Uses binary search for efficiency.
 */
export function findClosestIndex(arr: number[], target: number): number {
  if (arr.length === 0) return 0;
  if (arr.length === 1) return 0;

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  // Check if left-1 is closer
  if (left > 0 && Math.abs(arr[left - 1] - target) < Math.abs(arr[left] - target)) {
    return left - 1;
  }
  return left;
}

/**
 * Process user annotations to convert startX/endX to startIndex/endIndex
 * and compute area if boundaries are provided.
 */
export function processUserAnnotations(
  annotations: PeakAnnotation[],
  xArray: number[],
  yArray: number[]
): PeakAnnotation[] {
  return annotations.map((ann) => {
    // If startX/endX are provided, convert to indices
    if (ann.startX !== undefined && ann.endX !== undefined) {
      const startIndex = findClosestIndex(xArray, ann.startX);
      const endIndex = findClosestIndex(xArray, ann.endX);
      const index = findClosestIndex(xArray, ann.x);

      // Calculate area if not provided
      const area = ann._computed?.area ?? calculatePeakArea(xArray, yArray, startIndex, endIndex);

      return {
        ...ann,
        _computed: {
          ...ann._computed,
          index,
          startIndex,
          endIndex,
          area,
        },
      };
    }
    return ann;
  });
}

/**
 * Collect peaks with boundary information from both auto-detected peaks and user-provided annotations.
 * User-provided annotations with startIndex/endIndex or startX/endX are included for boundary marker rendering.
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

  // Add user-provided annotations that have boundary info (_computed.startIndex and _computed.endIndex)
  // Note: annotations with startX/endX should already be processed to have _computed fields
  const annotationsWithBoundaries = annotations.filter(
    (ann) => ann._computed?.startIndex !== undefined && ann._computed?.endIndex !== undefined
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

