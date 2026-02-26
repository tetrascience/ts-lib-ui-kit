import {
  DEFAULT_CATEGORY_COLORS,
  // DEFAULT_COLOR_SCALE,
  DEFAULT_MARKER_SIZE,
  DEFAULT_SIZE_RANGE,
  PLOT_CONSTANTS,
} from "./constants";

import type {
  AxisConfig,
  ColorMapping,
  DownsamplingConfig,
  ScatterPoint,
  SelectionMode,
  ShapeMapping,
  SizeMapping,
} from "./types";

const DEFAULT_MAX_POINTS_THRESHOLD = 5000;

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
    .filter((value): value is string => value !== undefined && value !== null);

  return [...new Set(uniqueCategories)].sort();
}

/**
 * Map colors based on color mapping configuration
 */
export function mapColors(data: ScatterPoint[], colorMapping: ColorMapping | undefined): string[] {
  if (!colorMapping || colorMapping.type === "static") {
    const color = colorMapping?.value || "#4575b4";
    return new Array(data.length).fill(color);
  }

  if (colorMapping.type === "categorical" && colorMapping.field) {
    const categories = getUniqueCategories(data, colorMapping.field);
    const colorMap = colorMapping.categoryColors || {};

    // Assign default colors to categories without explicit colors
    const categoryColorMap: Record<string, string> = {};
    categories.forEach((category, index) => {
      categoryColorMap[category] =
        colorMap[category] || DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length];
    });

    return data.map((point) => {
      const value = point.metadata?.[colorMapping.field!];
      return categoryColorMap[String(value)] || DEFAULT_CATEGORY_COLORS[0];
    });
  }

  if (colorMapping.type === "continuous" && colorMapping.field) {
    const range =
      colorMapping.min !== undefined && colorMapping.max !== undefined
        ? { min: colorMapping.min, max: colorMapping.max }
        : calculateRange(data, colorMapping.field);

    return data.map((point) => {
      const value = point.metadata?.[colorMapping.field!];
      if (typeof value === "number" && Number.isFinite(value)) {
        // Normalize to 0-1 range
        const normalized = (value - range.min) / (range.max - range.min);
        return String(normalized);
      }
      return "0";
    });
  }

  return new Array(data.length).fill("#4575b4");
}

/**
 * Map shapes based on shape mapping configuration
 */
export function mapShapes(data: ScatterPoint[], shapeMapping: ShapeMapping | undefined): string[] {
  if (!shapeMapping || shapeMapping.type === "static") {
    const shape = shapeMapping?.value || "circle";
    return new Array(data.length).fill(shape);
  }

  if (shapeMapping.type === "categorical" && shapeMapping.field) {
    const categories = getUniqueCategories(data, shapeMapping.field);
    const shapeMap = shapeMapping.categoryShapes || {};
    const defaultShapes = ["circle", "square", "diamond", "cross", "x", "triangle-up", "triangle-down", "star"];

    // Assign default shapes to categories without explicit shapes
    const categoryShapeMap: Record<string, string> = {};
    categories.forEach((category, index) => {
      categoryShapeMap[category] = shapeMap[category] || defaultShapes[index % defaultShapes.length];
    });

    return data.map((point) => {
      const value = point.metadata?.[shapeMapping.field!];
      return categoryShapeMap[String(value)] || "circle";
    });
  }

  return new Array(data.length).fill("circle");
}

/**
 * Map sizes based on size mapping configuration
 */
export function mapSizes(data: ScatterPoint[], sizeMapping: SizeMapping | undefined): number[] {
  if (!sizeMapping || sizeMapping.type === "static") {
    const size = sizeMapping?.value || DEFAULT_MARKER_SIZE;
    return new Array(data.length).fill(size);
  }

  if (sizeMapping.type === "categorical" && sizeMapping.field) {
    const categories = getUniqueCategories(data, sizeMapping.field);
    const sizeMap = sizeMapping.categorySizes || {};

    // Assign default sizes to categories without explicit sizes
    const categorySizeMap: Record<string, number> = {};
    categories.forEach((category, index) => {
      categorySizeMap[category] = sizeMap[category] || DEFAULT_MARKER_SIZE + index * 2;
    });

    return data.map((point) => {
      const value = point.metadata?.[sizeMapping.field!];
      return categorySizeMap[String(value)] || DEFAULT_MARKER_SIZE;
    });
  }

  if (sizeMapping.type === "continuous" && sizeMapping.field) {
    const range =
      sizeMapping.min !== undefined && sizeMapping.max !== undefined
        ? { min: sizeMapping.min, max: sizeMapping.max }
        : calculateRange(data, sizeMapping.field);

    const sizeRange = sizeMapping.sizeRange || DEFAULT_SIZE_RANGE;
    const [minSize, maxSize] = sizeRange;

    return data.map((point) => {
      const value = point.metadata?.[sizeMapping.field!];
      if (typeof value === "number" && Number.isFinite(value)) {
        // Normalize and map to size range
        const normalized = (value - range.min) / (range.max - range.min);
        return minSize + normalized * (maxSize - minSize);
      }
      return DEFAULT_MARKER_SIZE;
    });
  }

  return new Array(data.length).fill(DEFAULT_MARKER_SIZE);
}

/**
 * Downsample data using specified strategy
 */
export function downsampleData(data: ScatterPoint[], config: DownsamplingConfig): ScatterPoint[] {
  if (!config.enabled || data.length <= (config.maxPoints || DEFAULT_MAX_POINTS_THRESHOLD)) {
    return data;
  }

  const maxPoints = config.maxPoints || DEFAULT_MAX_POINTS_THRESHOLD;
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
  const fallbackIdx = Math.min(start, dataLength - 1);
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
 * Generate default tooltip content
 */
export function generateTooltipContent(point: ScatterPoint, fields?: string[]): string {
  const lines: string[] = [];

  // Always include x, y
  lines.push(`X: ${point.x.toFixed(2)}`);
  lines.push(`Y: ${point.y.toFixed(2)}`);

  // Add label if present
  if (point.label) {
    lines.push(`Label: ${point.label}`);
  }

  // Add requested fields from metadata
  if (fields && point.metadata) {
    for (const field of fields) {
      if (field in point.metadata) {
        const value = point.metadata[field];
        lines.push(`${field}: ${value}`);
      }
    }
  } else if (point.metadata && !fields) {
    // If no fields specified, show all metadata
    for (const [key, value] of Object.entries(point.metadata)) {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join("<br>");
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
 * Calculate axis range with padding
 */
export function calculateAxisRange(data: ScatterPoint[], axis: "x" | "y", padding = 0.1): [number, number] {
  const values = data.map((p) => p[axis]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [min - 1, max + 1];
  }

  const range = max - min;
  return [min - range * padding, max + range * padding];
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

export const getPlotlyLayoutConfig = ({
  title,
  xAxis,
  yAxis,
  width,
  height,
  xRange,
  yRange,
  enableLassoSelection,
  enableBoxSelection,
}: {
  title: string | undefined;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  width: number;
  height: number;
  xRange: [number, number] | undefined;
  yRange: [number, number] | undefined;
  enableLassoSelection: boolean;
  enableBoxSelection: boolean;
}): Partial<Plotly.Layout> => ({
  autosize: false,
  width,
  height,
  title: title
    ? {
        text: title,
        font: {
          family: PLOT_CONSTANTS.FONT_FAMILY,
          size: PLOT_CONSTANTS.TITLE_FONT_SIZE,
          color: "#333333",
        },
        x: 0.5,
        xanchor: "center",
      }
    : undefined,
  margin: {
    l: PLOT_CONSTANTS.MARGIN_LEFT,
    r: PLOT_CONSTANTS.MARGIN_RIGHT,
    t: title ? PLOT_CONSTANTS.MARGIN_TOP : PLOT_CONSTANTS.MARGIN_TOP - PLOT_CONSTANTS.TITLE_FONT_SIZE,
    b: PLOT_CONSTANTS.MARGIN_BOTTOM,
  },
  xaxis: {
    title: {
      text: xAxis.title || "",
      font: {
        family: PLOT_CONSTANTS.FONT_FAMILY,
        size: PLOT_CONSTANTS.AXIS_TITLE_FONT_SIZE,
        color: "#333333",
      },
    },
    type: xAxis.scale === "log" ? "log" : "linear",
    range: xRange,
    autorange: !xRange,
    gridcolor: "#e0e0e0",
    linecolor: "#333333",
    linewidth: PLOT_CONSTANTS.AXIS_LINE_WIDTH,
    tickfont: {
      family: PLOT_CONSTANTS.FONT_FAMILY,
      size: PLOT_CONSTANTS.AXIS_TICK_FONT_SIZE,
    },
    zeroline: false,
  },
  yaxis: {
    title: {
      text: yAxis.title || "",
      font: {
        family: PLOT_CONSTANTS.FONT_FAMILY,
        size: PLOT_CONSTANTS.AXIS_TITLE_FONT_SIZE,
        color: "#333333",
      },
    },
    type: yAxis.scale === "log" ? "log" : "linear",
    range: yRange,
    autorange: !yRange,
    gridcolor: "#e0e0e0",
    linecolor: "#333333",
    linewidth: PLOT_CONSTANTS.AXIS_LINE_WIDTH,
    tickfont: {
      family: PLOT_CONSTANTS.FONT_FAMILY,
      size: PLOT_CONSTANTS.AXIS_TICK_FONT_SIZE,
    },
    zeroline: false,
  },
  paper_bgcolor: "#ffffff",
  plot_bgcolor: "#ffffff",
  font: {
    family: PLOT_CONSTANTS.FONT_FAMILY,
    color: "#333333",
  },
  hovermode: "closest",
  dragmode: enableLassoSelection ? "lasso" : enableBoxSelection ? "select" : false,
});
