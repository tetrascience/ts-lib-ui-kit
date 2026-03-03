/**
 * Plate format string constants for standard microplate configurations.
 */
export const PLATE_FORMAT_96 = "96" as const;
export const PLATE_FORMAT_384 = "384" as const;
export const PLATE_FORMAT_1536 = "1536" as const;
export const PLATE_FORMAT_CUSTOM = "custom" as const;

/**
 * Plate format presets for standard microplate configurations.
 * - `"96"`: 8 rows × 12 columns (wells A1-H12)
 * - `"384"`: 16 rows × 24 columns (wells A1-P24)
 * - `"1536"`: 32 rows × 48 columns (wells A1-AF48)
 * - `"custom"`: User-defined dimensions via `rows` and `columns` props
 */
export type PlateFormat =
  | typeof PLATE_FORMAT_96
  | typeof PLATE_FORMAT_384
  | typeof PLATE_FORMAT_1536
  | typeof PLATE_FORMAT_CUSTOM;

/**
 * Visualization mode for the plate map.
 * - `"heatmap"`: Displays quantitative values as a continuous color gradient.
 *   Use for OD readings, fluorescence intensity, or other numeric measurements.
 * - `"categorical"`: Displays well types with discrete colors.
 *   Use for showing sample types, control positions, or experimental conditions.
 */
export type VisualizationMode = "heatmap" | "categorical";

/**
 * Well type for categorical visualization.
 * Common types include:
 * - `"sample"`: Test samples (blue by default)
 * - `"control"`: Positive/negative controls (red by default)
 * - `"empty"`: Unused wells (light gray by default)
 *
 * Custom types can be added and colored via the `categoryColors` prop.
 */
export type WellType = "sample" | "control" | "empty" | string;

/**
 * Color scale definition for the heatmap visualization mode.
 *
 * Can be:
 * - A named Plotly colorscale (e.g., "Viridis", "Blues", "Hot")
 * - An array of [position, color] tuples where position is 0-1
 *
 * @example
 * // Named colorscale
 * colorScale="Viridis"
 *
 * @example
 * // Custom gradient
 * colorScale={[
 *   [0, "#313695"],   // Dark blue at min
 *   [0.5, "#ffffbf"], // Yellow at midpoint
 *   [1, "#a50026"],   // Dark red at max
 * ]}
 */
export type ColorScale = string | Array<[number, string]>;

/**
 * Position for the legend display.
 * - `"right"`: Legend appears to the right of the plate (default)
 * - `"bottom"`: Legend appears below the plate
 * - `"left"`: Legend appears to the left of the plate
 * - `"top"`: Legend appears above the plate
 */
export type LegendPosition = "right" | "bottom" | "left" | "top";

/**
 * Well data for individual wells.
 *
 * @example
 * // Well with a single numeric value
 * { wellId: "A1", values: { "Fluorescence": 1500 } }
 *
 * @example
 * // Well with multiple values (creates multiple layers)
 * { wellId: "A1", values: { "Raw": 1500, "Normalized": 0.85, "Status": "positive" } }
 *
 * @example
 * // Well with tooltip-only data
 * { wellId: "A1", values: { "Value": 500 }, tooltipData: { compound: "Drug A", concentration: "10µM" } }
 */
export interface WellData {
  /**
   * Well identifier in standard microplate notation.
   * - Single letter + number for 96/384-well: "A1", "H12", "P24"
   * - Double letter + number for 1536-well: "A1", "AA1", "AF48"
   * Case-insensitive ("a1" and "A1" are equivalent).
   */
  wellId: string;
  /**
   * Named values for the well. Each key can become a visualization layer.
   *
   * - Numeric values: Displayed using heatmap visualization
   * - String values: Displayed using categorical visualization
   * - null: Empty/no data for that property
   *
   * All values are shown in the tooltip regardless of which layer is active.
   *
   * @example
   * // Well with multiple measurement values (numeric)
   * { wellId: "A1", values: { "Raw": 1500, "Normalized": 0.85, "Z-Score": 1.2 } }
   *
   * @example
   * // Well with categorical values (string)
   * { wellId: "A1", values: { "Status": "positive", "QC": "pass" } }
   *
   * @example
   * // Mixed numeric and categorical
   * { wellId: "A1", values: { "Fluorescence": 1500, "Status": "positive" } }
   */
  values?: Record<string, string | number | null>;
  /**
   * Optional data for tooltip display only (not visualized as layers).
   * Keys become labels, values are displayed.
   *
   * @example
   * { tooltipData: { sampleId: "S001", compound: "Drug A", concentration: "10µM" } }
   */
  tooltipData?: Record<string, unknown>;
}

/**
 * Configuration for auto-generated layers when using WellData with `values`.
 *
 * When wells have multiple values (via the `values` property), layers are
 * auto-generated from the unique keys. Use LayerConfig to customize the
 * display name, visualization mode, and color scale for each layer.
 *
 * @example
 * // Configure layers for wells with { values: { "Raw": 100, "Normalized": 0.5 } }
 * const layerConfigs: LayerConfig[] = [
 *   { id: "Raw", name: "Raw Data", colorScale: "Blues" },
 *   { id: "Normalized", name: "Normalized Values", valueMin: 0, valueMax: 1 },
 * ];
 */
export interface LayerConfig {
  /** Layer ID (must match a key in WellData.values) */
  id: string;
  /** Display name for the layer (defaults to id if not provided) */
  name?: string;
  /** Visualization mode for this layer */
  visualizationMode?: VisualizationMode;
  /** Color scale for this layer (for heatmap mode) */
  colorScale?: ColorScale;
  /** Minimum value for color scaling */
  valueMin?: number;
  /** Maximum value for color scaling */
  valueMax?: number;
  /** Value unit suffix for tooltips and colorbar (e.g., "RFU", "%"). A space is automatically added before the unit. */
  valueUnit?: string;
  /**
   * Custom colors for categorical visualization mode.
   * Keys are category values (strings from `values`), values are hex colors.
   * Merged with DEFAULT_CATEGORY_COLORS.
   */
  categoryColors?: Record<string, string>;
}

/**
 * Configuration for legend styling and positioning.
 *
 * @example
 * // Legend on the bottom with custom styling
 * legendConfig={{
 *   position: "bottom",
 *   fontSize: 14,
 *   itemSpacing: 12,
 *   swatchSize: 20,
 * }}
 */
export interface LegendConfig {
  /**
   * Position of the legend relative to the plate.
   * @default "right"
   */
  position?: LegendPosition;
  /**
   * Font size for legend labels in pixels.
   * @default 12
   */
  fontSize?: number;
  /**
   * Spacing between legend items in pixels.
   * @default 4
   */
  itemSpacing?: number;
  /**
   * Size of the color swatch in pixels.
   * @default 16
   */
  swatchSize?: number;
  /**
   * Title to display above the legend.
   */
  title?: string;
}

/**
 * A region to highlight on the plate (e.g., controls, sample areas, empty wells)
 */
export interface PlateRegion {
  /** Unique identifier for the region */
  id: string;
  /** Display name for the region (shown in legend) */
  name: string;
  /**
   * Wells included in this region using range notation.
   * Format: "StartWell:EndWell" (e.g., "A1:B6" for a rectangular block from A1 to B6)
   */
  wells: string;
  /** Border color for the region highlight */
  borderColor?: string;
  /** Border width in pixels (default: 2) */
  borderWidth?: number;
  /** Optional fill color with transparency (e.g., "rgba(255, 0, 0, 0.1)") */
  fillColor?: string;
}

/**
 * Props for PlateMap component
 */
export interface PlateMapProps {
  /**
   * Well data array as WellData objects with wellId and values.
   *
   * If wells have multiple values (via `values` property), layers are
   * auto-generated for each unique key, enabling layer toggling.
   */
  data?: WellData[];

  /**
   * Configuration for auto-generated layers when using WellData with `values`.
   * Use this to customize display names, colors, and ranges for each layer.
   * Only used when `data` contains wells with `values` property.
   */
  layerConfigs?: LayerConfig[];

  /**
   * Initial layer ID to display when the component mounts.
   * If not provided, defaults to the first layer.
   */
  initialLayerId?: string;

  /**
   * Optional callback notified when the active layer changes.
   * This is purely informational - the component manages layer state internally.
   * Use this for logging, analytics, or syncing with external state.
   */
  onLayerChange?: (layerId: string) => void;

  /** Plate format preset (default: "96") */
  plateFormat?: PlateFormat;

  /** Number of rows for custom format (default: 8 for 96-well, 16 for 384-well) */
  rows?: number;

  /** Number of columns for custom format (default: 12 for 96-well, 24 for 384-well) */
  columns?: number;

  /**
   * Visualization mode (default: "heatmap")
   * - "heatmap": Display quantitative values with color gradient
   * - "categorical": Display well types with discrete colors
   */
  visualizationMode?: VisualizationMode;

  /**
   * Custom colors for categorical visualization mode.
   * Keys are well types, values are hex colors.
   * Merged with DEFAULT_CATEGORY_COLORS.
   */
  categoryColors?: Record<string, string>;

  /**
   * Regions to highlight on the plate (e.g., controls, sample areas, empty wells).
   * Each region can specify wells and styling for visual distinction.
   */
  regions?: PlateRegion[];

  /** Chart title */
  title?: string;

  /** X-axis title (e.g., "Columns") */
  xTitle?: string;

  /** Y-axis title (e.g., "Rows") */
  yTitle?: string;

  /** Custom x-axis labels (overrides auto-generated column numbers) */
  xLabels?: string[] | number[];

  /** Custom y-axis labels (overrides auto-generated row letters) */
  yLabels?: string[] | number[];

  /** Color scale for the heatmap (only used in heatmap mode) */
  colorScale?: ColorScale;

  /** Minimum value for color scale (auto-calculated if not provided) */
  valueMin?: number;

  /** Maximum value for color scale (auto-calculated if not provided) */
  valueMax?: number;

  /** Color for empty/null wells (default: "#f0f0f0") */
  emptyWellColor?: string;

  /** Show color bar legend for heatmap mode (default: true) */
  showColorBar?: boolean;

  /** Show categorical legend for categorical mode (default: true) */
  showLegend?: boolean;

  /**
   * Configuration for legend positioning and styling.
   * Applies to both heatmap colorbar and categorical legend.
   *
   * @example
   * // Position legend at bottom with larger text
   * legendConfig={{ position: "bottom", fontSize: 14 }}
   */
  legendConfig?: LegendConfig;

  /** Chart width in pixels (default: 800) */
  width?: number;

  /** Chart height in pixels (default: 500) */
  height?: number;

  /** Number of decimal places for values (default: 0) */
  precision?: number;

  /**
   * Marker shape for wells (default: "circle")
   * - "circle": Round markers, ideal for plate-based data
   * - "square": Square markers, ideal for generic heatmaps
   */
  markerShape?: "circle" | "square";

  /**
   * Callback when a well/cell is clicked.
   * @param wellData - The full well data object including wellId, values, and tooltipData
   */
  onWellClick?: (wellData: WellData) => void;
}

/**
 * Result of converting WellData array to grids
 */
export interface WellDataGridResult {
  /** 2D grid of numeric values for the active layer */
  grid: (number | null)[][];
  /** 2D grid of string values for categorical visualization */
  categories: (string | null)[][];
  /** Map of wellId -> all values (for tooltip display) */
  allValues: Map<string, Record<string, string | number | null>>;
  /** Map of wellId -> tooltipData */
  tooltipData: Map<string, Record<string, unknown>>;
}

