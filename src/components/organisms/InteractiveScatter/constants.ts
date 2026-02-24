/**
 * Default colors for the scatter plot
 */
export const COLORS = {
  primary: "#4575b4",
  selected: "#d73027",
  unselected: "#cccccc",
  hover: "#fdae61",
  gridLine: "#e0e0e0",
  axisLine: "#333333",
  background: "#ffffff",
};

/**
 * Default color scale for continuous color mapping
 */
export const DEFAULT_COLOR_SCALE: Array<[number, string]> = [
  [0, "#313695"],
  [0.25, "#4575b4"],
  [0.5, "#ffffbf"],
  [0.75, "#fdae61"],
  [1, "#a50026"],
];

/**
 * Default category colors (cycle through these)
 */
export const DEFAULT_CATEGORY_COLORS = [
  "#4575b4", // Blue
  "#d73027", // Red
  "#1a9850", // Green
  "#fdae61", // Orange
  "#9467bd", // Purple
  "#e377c2", // Pink
  "#8c564b", // Brown
  "#bcbd22", // Olive
  "#17becf", // Cyan
  "#ff7f0e", // Dark orange
];

/**
 * Default sizes
 */
export const DEFAULT_MARKER_SIZE = 8;
export const DEFAULT_SIZE_RANGE: [number, number] = [4, 20];

/**
 * Default tooltip delay in milliseconds
 */
export const DEFAULT_TOOLTIP_DELAY = 300;

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
