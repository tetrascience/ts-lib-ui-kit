import {
  CHART_COLORS,
  CHART_DIVERGING,
  toPlotlyColorscale,
} from "@/utils/colors";

/**
 * Default colors for the scatter plot
 */
export const COLORS = {
  primary: CHART_COLORS[0],
  selected: CHART_COLORS[3],
  unselected: "#cccccc",
  hover: CHART_COLORS[1],
  gridLine: "#e0e0e0",
  axisLine: "#333333",
  background: "#ffffff",
};

/**
 * Default color scale for continuous color mapping (CVD-friendly diverging ramp)
 */
export const DEFAULT_COLOR_SCALE: Array<[number, string]> =
  toPlotlyColorscale(CHART_DIVERGING.blueOrange);

/**
 * Default category colors (cycle through these)
 */
export const DEFAULT_CATEGORY_COLORS = CHART_COLORS;

/**
 * Default sizes
 */
export const DEFAULT_MARKER_SIZE = 8;
export const DEFAULT_SIZE_RANGE: [number, number] = [4, 20];

/**
 * Default downsampling configuration
 */
export const DEFAULT_MAX_POINTS = 5000;

/**
 * Constants for plot layout
 */
export const PLOT_CONSTANTS = {
  MARGIN_LEFT: 80,
  MARGIN_RIGHT: 30,
  MARGIN_TOP: 80,
  MARGIN_BOTTOM: 80,
  TITLE_FONT_SIZE: 20,
  AXIS_TITLE_FONT_SIZE: 16,
  AXIS_TICK_FONT_SIZE: 12,
  LEGEND_FONT_SIZE: 12,
  FONT_FAMILY: "Inter, sans-serif",
  GRID_WIDTH: 1,
  AXIS_LINE_WIDTH: 1,
  AUTO_RANGE_PADDING: 0.1, // 10% padding
};

/**
 * Selection mode keyboard modifiers
 */
export const SELECTION_MODIFIERS = {
  ADD: "shiftKey", // Shift
  REMOVE: "ctrlKey", // Ctrl/Cmd
  TOGGLE: "both", // Shift + Ctrl/Cmd
} as const;
