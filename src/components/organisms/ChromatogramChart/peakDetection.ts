/**
 * Peak detection algorithms for ChromatogramChart
 */

import type { DetectedPeak, PeakDetectionOptions } from "./types";

/**
 * Calculate prominence of a peak (how much it stands out from neighbors)
 */
export function calculateProminence(
  y: number[],
  peakIndex: number,
  searchWindow: number
): number {
  let leftMin = y[peakIndex];
  let rightMin = y[peakIndex];

  for (let j = peakIndex - 1; j >= Math.max(0, peakIndex - searchWindow); j--) {
    leftMin = Math.min(leftMin, y[j]);
  }
  for (
    let j = peakIndex + 1;
    j < Math.min(y.length, peakIndex + searchWindow);
    j++
  ) {
    rightMin = Math.min(rightMin, y[j]);
  }

  return y[peakIndex] - Math.max(leftMin, rightMin);
}

/**
 * Find peak boundary indices by walking outward from peak
 */
export function findPeakBoundaries(
  y: number[],
  peakIndex: number
): { startIndex: number; endIndex: number } {
  let startIndex = peakIndex;
  let endIndex = peakIndex;

  // Walk left to find start
  for (let j = peakIndex - 1; j >= 0; j--) {
    if (y[j] <= y[j + 1]) {
      startIndex = j;
    } else {
      break;
    }
  }

  // Walk right to find end
  for (let j = peakIndex + 1; j < y.length; j++) {
    if (y[j] <= y[j - 1]) {
      endIndex = j;
    } else {
      break;
    }
  }

  return { startIndex, endIndex };
}

/**
 * Calculate peak area using trapezoidal integration
 */
export function calculatePeakArea(
  x: number[],
  y: number[],
  startIndex: number,
  endIndex: number
): number {
  const baselineY = Math.min(y[startIndex], y[endIndex]);
  let area = 0;

  for (let j = startIndex; j < endIndex; j++) {
    const h = x[j + 1] - x[j];
    const y1 = y[j] - baselineY;
    const y2 = y[j + 1] - baselineY;
    area += ((y1 + y2) * h) / 2;
  }

  return area;
}

/**
 * Calculate width at half maximum of a peak
 */
export function calculateWidthAtHalfMax(
  x: number[],
  y: number[],
  peakIndex: number,
  startIndex: number,
  endIndex: number
): number {
  const baselineY = Math.min(y[startIndex], y[endIndex]);
  const halfMax = (y[peakIndex] + baselineY) / 2;
  let leftHalf = peakIndex;
  let rightHalf = peakIndex;

  for (let j = peakIndex; j >= startIndex; j--) {
    if (y[j] < halfMax) {
      leftHalf = j;
      break;
    }
  }
  for (let j = peakIndex; j <= endIndex; j++) {
    if (y[j] < halfMax) {
      rightHalf = j;
      break;
    }
  }

  return x[rightHalf] - x[leftHalf];
}

/**
 * Filter peaks by minimum distance, keeping more intense peaks
 */
export function filterPeaksByDistance(
  peaks: DetectedPeak[],
  minDistance: number
): DetectedPeak[] {
  const filtered: DetectedPeak[] = [];

  for (const peak of peaks) {
    const tooClose = filtered.some(
      (p) => Math.abs(p.index - peak.index) < minDistance
    );
    if (!tooClose) {
      filtered.push(peak);
    } else if (
      filtered.length > 0 &&
      peak.intensity > filtered[filtered.length - 1].intensity
    ) {
      filtered.pop();
      filtered.push(peak);
    }
  }

  return filtered.sort((a, b) => a.retentionTime - b.retentionTime);
}

/**
 * Detect peaks in signal data using derivative analysis.
 *
 * Default parameters are tuned for typical HPLC chromatograms:
 * - minHeight (0.05 = 5%): Filters noise while detecting small peaks
 * - minDistance (5 points): Prevents detecting noise as multiple peaks
 * - prominence (0.02 = 2%): Ensures peaks stand out from baseline/shoulders
 */
export function detectPeaks(
  x: number[],
  y: number[],
  options: PeakDetectionOptions = {}
): DetectedPeak[] {
  const {
    minHeight = 0.05,
    minDistance = 5,
    prominence = 0.02,
    relativeThreshold = true,
  } = options;

  if (y.length < 3) return [];

  const maxY = Math.max(...y);
  const threshold = relativeThreshold ? minHeight * maxY : minHeight;
  const prominenceThreshold = relativeThreshold ? prominence * maxY : prominence;
  const searchWindow = minDistance * 3;

  const peaks: DetectedPeak[] = [];

  // Find local maxima
  for (let i = 1; i < y.length - 1; i++) {
    const isLocalMax =
      y[i] > y[i - 1] && y[i] > y[i + 1] && y[i] >= threshold;
    if (!isLocalMax) continue;

    const peakProminence = calculateProminence(y, i, searchWindow);
    if (peakProminence < prominenceThreshold) continue;

    const { startIndex, endIndex } = findPeakBoundaries(y, i);
    const area = calculatePeakArea(x, y, startIndex, endIndex);
    const widthAtHalfMax = calculateWidthAtHalfMax(
      x,
      y,
      i,
      startIndex,
      endIndex
    );

    peaks.push({
      index: i,
      retentionTime: x[i],
      intensity: y[i],
      area,
      startIndex,
      endIndex,
      widthAtHalfMax,
    });
  }

  return filterPeaksByDistance(peaks, minDistance);
}

