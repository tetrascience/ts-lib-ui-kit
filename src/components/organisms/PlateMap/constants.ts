import {
  PLATE_FORMAT_96,
  PLATE_FORMAT_384,
  PLATE_FORMAT_1536,
} from "./types";

/**
 * Default category colors for well types in categorical visualization mode.
 * Override these by passing custom colors via the `categoryColors` prop.
 */
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  sample: "#4575b4", // Blue
  control: "#d73027", // Red
  empty: "#f0f0f0", // Light gray
};

/**
 * Plate dimension configurations
 */
export const PLATE_CONFIGS: Record<
  typeof PLATE_FORMAT_96 | typeof PLATE_FORMAT_384 | typeof PLATE_FORMAT_1536,
  { rows: number; columns: number }
> = {
  [PLATE_FORMAT_96]: { rows: 8, columns: 12 },
  [PLATE_FORMAT_384]: { rows: 16, columns: 24 },
  [PLATE_FORMAT_1536]: { rows: 32, columns: 48 },
};

/**
 * Default color scale (blue to red gradient suitable for plate data)
 */
export const DEFAULT_COLOR_SCALE: Array<[number, string]> = [
  [0, "#313695"],
  [0.1, "#4575b4"],
  [0.2, "#74add1"],
  [0.3, "#abd9e9"],
  [0.4, "#e0f3f8"],
  [0.5, "#ffffbf"],
  [0.6, "#fee090"],
  [0.7, "#fdae61"],
  [0.8, "#f46d43"],
  [0.9, "#d73027"],
  [1, "#a50026"],
];

/**
 * UI color constants for PlateMap component styling
 */
export const COLORS = {
  /** Primary blue color for active states */
  primary: "#4575b4",
  /** White background */
  white: "#fff",
  /** Light gray for borders */
  borderLight: "#ccc",
  /** Dark gray for text */
  textDark: "#333",
  /** Default region border color */
  regionBorder: "#000",
  /** Default empty well color (light gray) */
  emptyWell: "#f0f0f0",
} as const;

/**
 * Numeric constants for PlateMap calculations and layout
 */
export const PLATEMAP_CONSTANTS = {
  /** Maximum random data value for demonstration */
  MAX_RANDOM_VALUE: 50000,
  /** Sentinel value ratio for empty wells below data range */
  SENTINEL_RATIO: 0.01,
  /** Color scale data start ratio for extended scales */
  COLOR_SCALE_THRESHOLD: 0.99,
  /** Small epsilon for color scale band calculations */
  COLOR_SCALE_EPSILON: 0.001,
  /** Proportions for multi-value well display */
  MULTI_VALUE_PRIMARY_RATIO: 0.575,
  MULTI_VALUE_SECONDARY_RATIO: 0.425,
  /** Font sizes */
  FONT_SIZE_LARGE: 11,
  /** Offset for centering labels */
  LABEL_CENTER_OFFSET: -0.5,
  /** Opacity values */
  HOVER_OPACITY_FAINT: 0.15,
  HOVER_OPACITY_VISIBLE: 0.85,
  /** Layout margins */
  MARGIN_TOP: 70,
  MARGIN_RIGHT: 50,
  MARGIN_BOTTOM: 40,
  MARGIN_LEFT: 80,
  /** Colorbar dimensions */
  COLORBAR_LENGTH: 130,
  COLORBAR_X_OFFSET: 70,
  /** Domain position constants for legend placement */
  DOMAIN_COLORBAR_OFFSET: 0.15,
  DOMAIN_COLORBAR_END: 0.85,
} as const;
