import React, { useEffect, useMemo, useRef, useState } from "react";
import Plotly from "plotly.js-dist";
import "./PlateMap.scss";

/**
 * Plate format presets for standard microplate configurations.
 * - `"96"`: 8 rows × 12 columns (wells A1-H12)
 * - `"384"`: 16 rows × 24 columns (wells A1-P24)
 * - `"1536"`: 32 rows × 48 columns (wells A1-AF48)
 * - `"custom"`: User-defined dimensions via `rows` and `columns` props
 */
export type PlateFormat = "96" | "384" | "1536" | "custom";

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
 * Default category colors for well types in categorical visualization mode.
 * Override these by passing custom colors via the `categoryColors` prop.
 */
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  sample: "#4575b4", // Blue
  control: "#d73027", // Red
  empty: "#f0f0f0", // Light gray
};

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
 * Position for the legend display.
 * - `"right"`: Legend appears to the right of the plate (default)
 * - `"bottom"`: Legend appears below the plate
 * - `"left"`: Legend appears to the left of the plate
 * - `"top"`: Legend appears above the plate
 */
export type LegendPosition = "right" | "bottom" | "left" | "top";

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
 * Plate dimension configurations
 */
const PLATE_CONFIGS: Record<"96" | "384" | "1536", { rows: number; columns: number }> = {
  "96": { rows: 8, columns: 12 },
  "384": { rows: 16, columns: 24 },
  "1536": { rows: 32, columns: 48 },
};

/**
 * Default color scale (blue to red gradient suitable for plate data)
 */
const DEFAULT_COLOR_SCALE: Array<[number, string]> = [
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
 * Generate row labels (A, B, C, ... for 96-well; A-P for 384-well; A-AF for 1536-well)
 * For rows beyond Z (26), uses AA, AB, AC, etc.
 */
function generateRowLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    if (i < 26) {
      return String.fromCharCode(65 + i);
    }
    // For rows 26+, use AA, AB, AC, etc.
    return "A" + String.fromCharCode(65 + (i - 26));
  });
}

/**
 * Generate column labels (1, 2, 3, ...)
 */
function generateColumnLabels(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Parse well ID to row and column indices
 * @param wellId - Well identifier (e.g., "A1", "H12", "P24", "AA1", "AF48")
 * @returns { row, col } zero-indexed
 */
function parseWellId(wellId: string): { row: number; col: number } | null {
  // Match single letter (A-Z) or double letter (AA-AF) followed by 1-2 digits
  const match = wellId.match(/^([A-Z]{1,2})(\d{1,2})$/i);
  if (!match) return null;

  const rowStr = match[1].toUpperCase();
  let row: number;

  if (rowStr.length === 1) {
    row = rowStr.charCodeAt(0) - 65;
  } else {
    // Double letter: AA=26, AB=27, ..., AF=31
    row = 26 + (rowStr.charCodeAt(1) - 65);
  }

  const col = parseInt(match[2], 10) - 1;

  return { row, col };
}

/**
 * Result of converting WellData array to grids
 */
interface WellDataGridResult {
  /** 2D grid of numeric values for the active layer */
  grid: (number | null)[][];
  /** 2D grid of string values for categorical visualization */
  categories: (string | null)[][];
  /** Map of wellId -> all values (for tooltip display) */
  allValues: Map<string, Record<string, string | number | null>>;
  /** Map of wellId -> tooltipData */
  tooltipData: Map<string, Record<string, unknown>>;
}

/**
 * Convert WellData array to 2D grids for a specific layer
 */
function wellDataToGrid(
  wells: WellData[],
  rows: number,
  columns: number,
  layerId?: string
): WellDataGridResult {
  // Initialize grids with nulls
  const grid: (number | null)[][] = Array.from({ length: rows }, () =>
    Array(columns).fill(null)
  );
  const categories: (string | null)[][] = Array.from({ length: rows }, () =>
    Array(columns).fill(null)
  );
  const allValues = new Map<string, Record<string, string | number | null>>();
  const tooltipData = new Map<string, Record<string, unknown>>();

  for (const well of wells) {
    const parsed = parseWellId(well.wellId);
    // Check bounds including >= 0 to prevent negative indices (e.g., "A0" -> col=-1)
    if (parsed && parsed.row >= 0 && parsed.col >= 0 && parsed.row < rows && parsed.col < columns) {
      const wellIdUpper = well.wellId.toUpperCase();

      // Store all values for tooltip
      if (well.values) {
        allValues.set(wellIdUpper, well.values);
      }

      // Store tooltipData
      if (well.tooltipData) {
        tooltipData.set(wellIdUpper, well.tooltipData);
      }

      // Extract value for the specified layer (or first layer if not specified)
      if (well.values) {
        const effectiveLayerId = layerId ?? Object.keys(well.values)[0];
        const layerValue = effectiveLayerId ? well.values[effectiveLayerId] : null;

        if (typeof layerValue === "number") {
          grid[parsed.row][parsed.col] = layerValue;
        } else if (typeof layerValue === "string") {
          categories[parsed.row][parsed.col] = layerValue;
        }
      }
    }
  }

  return { grid, categories, allValues, tooltipData };
}

/**
 * Validate and sanitize grid data
 */
/**
 * Calculate min/max values from grid, ignoring nulls
 */
function calculateValueRange(grid: (number | null)[][]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  for (const row of grid) {
    for (const val of row) {
      if (val !== null && Number.isFinite(val)) {
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }
  }

  // Handle case where all values are null
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 1;

  // Ensure min < max
  if (min === max) {
    max = min + 1;
  }

  return { min, max };
}

/**
 * Check if WellData array contains multi-value wells (has `values` property)
 */
function hasMultiValueWells(data: WellData[]): boolean {
  return data.some((well) => well.values && Object.keys(well.values).length > 0);
}

/**
 * Extract unique layer IDs from WellData array with `values`
 */
function extractLayerIds(data: WellData[]): string[] {
  const layerIds = new Set<string>();
  for (const well of data) {
    if (well.values) {
      Object.keys(well.values).forEach((k) => layerIds.add(k));
    }
  }
  return Array.from(layerIds);
}

/**
 * Check if a layer contains string values (categorical) or numeric values (heatmap)
 */
function isStringValueLayer(data: WellData[], layerId: string): boolean {
  for (const well of data) {
    const val = well.values?.[layerId];
    if (typeof val === "string") {
      return true;
    }
  }
  return false;
}

/**
 * Extract layer configs from multi-value WellData array.
 * Creates a layer entry for each unique key found in the `values` objects.
 * Merges with user-provided layerConfigs to apply custom settings.
 */
function extractLayers(
  data: WellData[],
  layerConfigs?: LayerConfig[]
): LayerConfig[] {
  const layerIds = extractLayerIds(data);

  return layerIds.map((id) => {
    const config = layerConfigs?.find((c) => c.id === id);
    const isStringLayer = isStringValueLayer(data, id);

    return {
      id,
      name: config?.name ?? id,
      // Auto-set categorical mode for string layers if not explicitly configured
      visualizationMode: config?.visualizationMode ?? (isStringLayer ? "categorical" : undefined),
      colorScale: config?.colorScale,
      valueMin: config?.valueMin,
      valueMax: config?.valueMax,
      valueUnit: config?.valueUnit,
      categoryColors: config?.categoryColors,
    };
  });
}

/**
 * Parse region wells from range notation like "A1:B6"
 * Returns the bounding box coordinates for overlay rendering
 */
function parseRegionWells(
  wells: string,
  rowLabels: readonly (string | number)[],
  colLabels: readonly (string | number)[]
): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null {
  // Parse range notation like "A1:B6"
  const rangeMatch = wells.match(/^([A-Z]{1,2})(\d{1,2}):([A-Z]{1,2})(\d{1,2})$/i);
  if (!rangeMatch) {
    return null;
  }

  // The regex above guarantees valid well ID format, so parseWellId will always succeed
  const startWell = parseWellId(`${rangeMatch[1]}${rangeMatch[2]}`)!;
  const endWell = parseWellId(`${rangeMatch[3]}${rangeMatch[4]}`)!;

  const minRow = Math.min(startWell.row, endWell.row);
  const maxRow = Math.max(startWell.row, endWell.row);
  const minCol = Math.min(startWell.col, endWell.col);
  const maxCol = Math.max(startWell.col, endWell.col);

  // Validate bounds against actual labels
  const numRows = rowLabels.length;
  const numCols = colLabels.length;
  if (minRow >= numRows || maxRow >= numRows || minCol >= numCols || maxCol >= numCols) {
    return null;
  }

  return { minRow, maxRow, minCol, maxCol };
}

/**
 * PlateMap component for visualizing well plate data as a heatmap or categorical display.
 *
 * **Supported Plate Formats:**
 * - 96-well (8 rows × 12 columns, wells A1-H12)
 * - 384-well (16 rows × 24 columns, wells A1-P24)
 * - 1536-well (32 rows × 48 columns, wells A1-AF48)
 * - Custom dimensions with user-specified rows/columns
 *
 * **Visualization Modes:**
 * - `"heatmap"`: Continuous color gradient for quantitative values
 * - `"categorical"`: Discrete colors for well types (sample, control, empty)
 *
 * **Features:**
 * - Multiple data layers with independent visualization settings
 * - Control region highlighting with borders and fill colors
 * - Configurable color scales, tooltips, and click interactions
 * - Support for WellData arrays with multi-layer visualization
 *
 * **Data Format:**
 * - **WellData array**: `[{ wellId: "A1", values: { RFU: 100 }, tooltipData: {...} }, ...]`
 *
 */
const PlateMap: React.FC<PlateMapProps> = ({
  data,
  layerConfigs,
  initialLayerId,
  onLayerChange,
  plateFormat = "96",
  rows: customRows,
  columns: customColumns,
  visualizationMode: propVisualizationMode = "heatmap",
  categoryColors: customCategoryColors,
  regions,
  title,
  xTitle,
  yTitle,
  xLabels: customXLabels,
  yLabels: customYLabels,
  colorScale: propColorScale = DEFAULT_COLOR_SCALE,
  valueMin: propValueMin,
  valueMax: propValueMax,
  emptyWellColor = "#f0f0f0",
  showColorBar = true,
  showLegend = true,
  legendConfig,
  width = 800,
  height = 500,
  precision = 0,
  markerShape = "circle",
  onWellClick,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const onWellClickRef = useRef(onWellClick);
  onWellClickRef.current = onWellClick;

  // Internal state for layer toggling, initialized with initialLayerId
  const [activeLayerId, setActiveLayerId] = useState<string | undefined>(initialLayerId);

  // Determine plate dimensions
  let rows: number;
  let columns: number;

  if (plateFormat === "custom") {
    rows = customRows ?? 8;
    columns = customColumns ?? 12;
  } else {
    const config = PLATE_CONFIGS[plateFormat];
    rows = config.rows;
    columns = config.columns;
  }

  // Auto-generate layers from multi-value WellData
  const effectiveLayers = useMemo((): LayerConfig[] | null => {
    // Check if data contains multi-value wells
    if (Array.isArray(data) && data.length > 0 && "wellId" in (data[0] as WellData)) {
      const wellDataArray = data as WellData[];
      if (hasMultiValueWells(wellDataArray)) {
        return extractLayers(wellDataArray, layerConfigs);
      }
    }

    return null;
  }, [data, layerConfigs]);

  // Handle layer toggling - determine active layer
  const activeLayer = useMemo((): LayerConfig | null => {
    if (!effectiveLayers || effectiveLayers.length === 0) return null;
    if (activeLayerId) {
      return effectiveLayers.find((l) => l.id === activeLayerId) ?? effectiveLayers[0];
    }
    return effectiveLayers[0];
  }, [effectiveLayers, activeLayerId]);

  // Get effective props from active layer or default props
  // Data is always the same - we just change which layer is being visualized
  const visualizationMode = activeLayer?.visualizationMode ?? propVisualizationMode;
  const colorScale = activeLayer?.colorScale ?? propColorScale;
  const valueMin = activeLayer?.valueMin ?? propValueMin;
  const valueMax = activeLayer?.valueMax ?? propValueMax;
  // Derive valueUnit from layer config
  const valueUnit = activeLayer?.valueUnit ? ` ${activeLayer.valueUnit}` : "";

  // Merge custom category colors with defaults, including layer-specific colors
  const categoryColors = useMemo(
    () => ({ ...DEFAULT_CATEGORY_COLORS, ...customCategoryColors, ...activeLayer?.categoryColors }),
    [customCategoryColors, activeLayer?.categoryColors]
  );

  // Convert data to grid format - memoize to prevent re-render issues
  // Use activeLayer.id to extract the appropriate value from multi-value wells
  const activeLayerId_ = activeLayer?.id;
  const { grid, categoriesGrid, allValuesMap, tooltipDataMap } = useMemo(() => {
    let resultGrid: (number | null)[][];
    let resultCategories: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(columns).fill(null)
    );
    let resultAllValues = new Map<string, Record<string, string | number | null>>();
    let resultTooltipData = new Map<string, Record<string, unknown>>();

    if (Array.isArray(data) && data.length > 0) {
      // WellData array format - pass activeLayerId to extract the right layer
      const result = wellDataToGrid(data, rows, columns, activeLayerId_);
      resultGrid = result.grid;
      resultCategories = result.categories;
      resultAllValues = result.allValues;
      resultTooltipData = result.tooltipData;
    } else {
      // Generate random data for demonstration when no data provided
      resultGrid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => Math.random() * 50000)
      );
    }

    return { grid: resultGrid, categoriesGrid: resultCategories, allValuesMap: resultAllValues, tooltipDataMap: resultTooltipData };
  }, [data, rows, columns, activeLayerId_]);

  // Generate labels - use custom labels if provided, otherwise auto-generate
  const rowLabels = customYLabels ?? generateRowLabels(rows);
  const colLabels = customXLabels ?? generateColumnLabels(columns);

  // Calculate value range if not provided
  const range = calculateValueRange(grid);
  const zMin = valueMin ?? range.min;
  const zMax = valueMax ?? range.max;

  // Check if grid has any null values
  const hasNullValues = grid.some(row => row.some(val => val === null));

  // Create sentinel value for empty wells (below the data range)
  // This allows us to show emptyWellColor for null cells
  const sentinelValue = zMin - (zMax - zMin) * 0.01 - 1;

  // Replace null values with sentinel for Plotly rendering
  const displayGrid = hasNullValues
    ? grid.map(row => row.map(val => val === null ? sentinelValue : val))
    : grid;

  // Extend colorscale to include emptyWellColor at the bottom for null values
  const effectiveColorScale = useMemo(() => {
    if (!hasNullValues) return colorScale;

    // If colorScale is a string (named scale), we can't easily extend it
    // In this case, use the emptyWellColor as plot background
    if (typeof colorScale === "string") {
      return colorScale;
    }

    // For array colorscales, prepend emptyWellColor at position 0
    // and shift all other positions proportionally
    const totalRange = zMax - sentinelValue;
    const dataStartRatio = (zMin - sentinelValue) / totalRange;

    // Create new colorscale with emptyWellColor at the bottom
    const extendedScale: Array<[number, string]> = [
      [0, emptyWellColor],
      [dataStartRatio * 0.99, emptyWellColor], // Small band for empty wells
    ];

    // Remap original colorscale positions to the remaining range
    for (const [pos, color] of colorScale) {
      const newPos = dataStartRatio + pos * (1 - dataStartRatio);
      extendedScale.push([newPos, color]);
    }

    return extendedScale;
  }, [colorScale, hasNullValues, zMin, zMax, sentinelValue, emptyWellColor]);

  // Effective zMin includes sentinel value if we have nulls
  const effectiveZMin = hasNullValues ? sentinelValue : zMin;

  // Create a lookup map for layer configs to get valueUnit for each layer
  const layerConfigMap = useMemo(() => {
    const map = new Map<string, LayerConfig>();
    if (effectiveLayers) {
      for (const layer of effectiveLayers) {
        map.set(layer.id, layer);
      }
    }
    return map;
  }, [effectiveLayers]);

  // Build custom hover text matrix - shows ALL values regardless of active layer
  const hoverText: string[][] = grid.map((row, rowIdx) =>
    row.map((val, colIdx) => {
      const wellId = `${rowLabels[rowIdx]}${colLabels[colIdx]}`;
      const wellIdUpper = String(wellId).toUpperCase();
      const allValues = allValuesMap.get(wellIdUpper);
      const tooltipExtra = tooltipDataMap.get(wellIdUpper);

      let text = `Well ${wellId}`;

      // Show all values from the values object
      // Mark the active layer with ▶ indicator
      const activeLayerKey = activeLayer?.id;
      if (allValues) {
        for (const [key, value] of Object.entries(allValues)) {
          const isActiveLayer = key === activeLayerKey;
          const prefix = isActiveLayer ? "▶ " : "";
          const rawLayerUnit = layerConfigMap.get(key)?.valueUnit;
          const layerUnit = rawLayerUnit ? ` ${rawLayerUnit}` : "";
          if (value === null) {
            text += `<br>${prefix}${key}: -`;
          } else if (typeof value === "number") {
            text += `<br>${prefix}${key}: ${value.toFixed(precision)}${layerUnit}`;
          } else {
            // String value - capitalize first letter
            text += `<br>${prefix}${key}: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
          }
        }
      } else if (val !== null) {
        // Fallback for data without tooltipData
        text += `<br>Value: ${val.toFixed(precision)}${valueUnit}`;
      } else if (activeLayer) {
        // Note: The `category` branch was removed as unreachable - categoriesGrid is only
        // populated via wellDataToGrid which also populates allValuesMap, so if category
        // is truthy, allValues will also be truthy and we'll enter the branch above.
        // Well not in data but we have layers - show active layer with "-"
        text += `<br>▶ ${activeLayer.id}: -`;
      } else {
        text += `<br>No data`;
      }

      // Add tooltipData
      if (tooltipExtra) {
        for (const [key, value] of Object.entries(tooltipExtra)) {
          text += `<br>${key}: ${value}`;
        }
      }

      return text;
    })
  );

  // Build categorical data for categorical mode
  const { categoricalGrid, categoricalColorScale, uniqueTypes, catMax } = useMemo(() => {
    if (visualizationMode !== "categorical") {
      return { categoricalGrid: null, categoricalColorScale: null, uniqueTypes: [], catMax: 0 };
    }

    // Collect unique categories from the categoriesGrid
    const typesSet = new Set<string>();
    let hasNullCategory = false;
    for (const row of categoriesGrid) {
      for (const category of row) {
        if (category) {
          typesSet.add(category);
        } else {
          hasNullCategory = true;
        }
      }
    }
    // Only include "empty" if there are actual null wells
    if (hasNullCategory) {
      typesSet.add("empty");
    }
    const types = Array.from(typesSet).sort();

    // Create numeric grid where each category maps to an index
    const typeToIndex = new Map<string, number>();
    types.forEach((type, idx) => typeToIndex.set(type, idx));

    const catGrid: number[][] = categoriesGrid.map((row) =>
      row.map((category) => {
        if (category === null) {
          return typeToIndex.get("empty") ?? 0;
        }
        return typeToIndex.get(category) ?? typeToIndex.get("empty") ?? 0;
      })
    );

    // Build discrete colorscale for categories
    // The grid contains integer indices 0, 1, 2, ... (numTypes - 1)
    // With cmin=0 and cmax=numTypes-1, Plotly maps:
    //   index 0 -> normalized 0.0
    //   index (numTypes-1) -> normalized 1.0
    // We need each index to map to a distinct color band
    const numTypes = types.length;
    const catColorScale: Array<[number, string]> = [];

    if (numTypes === 1) {
      // Single type: entire range is one color
      const color = categoryColors[types[0]] || emptyWellColor;
      catColorScale.push([0, color]);
      catColorScale.push([1, color]);
    } else {
      // Multiple types: create bands for each index
      // Index i maps to normalized value i / (numTypes - 1)
      types.forEach((type, idx) => {
        const color = categoryColors[type] || emptyWellColor;
        const normalizedPos = idx / (numTypes - 1);
        // Create a small band around each position
        const bandHalf = 0.5 / (numTypes - 1);
        const start = Math.max(0, normalizedPos - bandHalf);
        const end = Math.min(1, normalizedPos + bandHalf - 0.001);
        catColorScale.push([start, color]);
        catColorScale.push([end, color]);
      });
    }

    // cmax should be numTypes - 1 to match the index range
    return { categoricalGrid: catGrid, categoricalColorScale: catColorScale, uniqueTypes: types, catMax: numTypes - 1 };
  }, [visualizationMode, categoriesGrid, categoryColors, emptyWellColor]);

  // Build Plotly shapes for highlighted regions
  const regionShapes = useMemo(() => {
    if (!regions || regions.length === 0) {
      return [];
    }

    const shapes: Array<Partial<Plotly.Shape>> = [];

    for (const region of regions) {
      const bounds = parseRegionWells(region.wells, rowLabels, colLabels);
      if (!bounds) continue;

      // Plotly heatmap uses the actual label values for positioning.
      // colLabels are 1-indexed (1, 2, 3, ...), so we need to convert from 0-indexed bounds.
      // Each cell is centered on its label, so we offset by inset to cover the cell.
      // For columns: bounds.minCol=0 means column label 1, so x0 = 1 - inset
      // For rows: bounds.minRow=0 means row index 0, which is correct for y-axis
      //
      // Dynamic inset based on marker shape:
      // - Squares fill 100% of cell, so inset = 0.5 (exact cell edge)
      // - Circles fill 80% of cell (radius = 0.4), so inset = 0.4 (at marker edge)
      const inset = markerShape === "square" ? 0.5 : 0.4;
      const x0 = (bounds.minCol + 1) - inset;
      const x1 = (bounds.maxCol + 1) + inset;
      const y0 = bounds.minRow - inset;
      const y1 = bounds.maxRow + inset;

      shapes.push({
        type: "rect",
        xref: "x",
        yref: "y",
        x0,
        x1,
        y0,
        y1,
        line: {
          color: region.borderColor || "#333",
          width: region.borderWidth ?? 2,
        },
        fillcolor: region.fillColor || "transparent",
        layer: "above",
      });
    }

    return shapes;
  }, [regions, rowLabels, colLabels, markerShape]);

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef) return;

    // Determine which grid and colorscale to use based on mode
    const isCategorical = visualizationMode === "categorical";
    const plotZ = isCategorical && categoricalGrid ? categoricalGrid : displayGrid;
    const plotColorScale = isCategorical && categoricalColorScale ? categoricalColorScale : effectiveColorScale;
    const plotZMin = isCategorical ? 0 : effectiveZMin;
    const plotZMax = isCategorical ? (catMax || 1) : zMax;
    const plotShowScale = isCategorical ? false : showColorBar;

    // Flatten 2D grid data into arrays for scatter plot (circles)
    const xData: number[] = [];
    const yData: string[] = [];
    const colorData: number[] = [];
    const textData: string[] = [];

    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      for (let colIdx = 0; colIdx < columns; colIdx++) {
        xData.push(colIdx + 1); // 1-indexed columns
        yData.push(rowLabels[rowIdx] as string);
        const zValue = plotZ[rowIdx][colIdx];
        colorData.push(zValue ?? plotZMin); // Use min value for null wells (will be styled separately)
        textData.push(hoverText[rowIdx][colIdx]);
      }
    }

    // Calculate marker size based on actual plot area (accounting for margins)
    // Use consistent margins regardless of colorbar visibility to prevent layout shift when switching layers
    const leftMargin = yTitle ? 70 : 50;
    const rightMargin = 100; // Always reserve space for colorbar to prevent layout shift
    const topMargin = title ? 100 : 40;
    const bottomMargin = 50;
    const plotWidth = width - leftMargin - rightMargin;
    const plotHeight = height - topMargin - bottomMargin;

    // Calculate pixels per cell
    const cellWidth = plotWidth / columns;
    const cellHeight = plotHeight / rows;

    // For circles: use smaller dimension to keep them uniform and avoid overlap
    // For squares: use larger dimension so they fill the entire cell with no gaps
    const cellSize =
      markerShape === "square"
        ? Math.max(cellWidth, cellHeight)
        : Math.min(cellWidth, cellHeight);

    // Squares fill entire cell (100%) for seamless heatmap, circles leave gaps (80%)
    const sizeMultiplier = markerShape === "square" ? 1.0 : 0.8;
    const markerSize = Math.max(4, cellSize * sizeMultiplier);

    // Create scatter plot with markers
    const plotData: Plotly.Data[] = [
      {
        x: xData,
        y: yData,
        mode: "markers" as const,
        type: "scatter" as const,
        marker: {
          symbol: markerShape,
          size: markerSize,
          color: colorData,
          colorscale: plotColorScale,
          cmin: plotZMin,
          cmax: plotZMax,
          showscale: plotShowScale,
          colorbar: (() => {
            // Position colorbar based on legendConfig
            const pos = legendConfig?.position ?? "right";
            if (pos === "bottom") {
              return {
                orientation: "h" as const,
                thickness: 20,
                len: 0.75,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: -0.15,
                yanchor: "top" as const,
                x: 0.5,
                xanchor: "center" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "top" as const } : undefined,
              };
            } else if (pos === "top") {
              return {
                orientation: "h" as const,
                thickness: 20,
                len: 0.75,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: 1.15,
                yanchor: "bottom" as const,
                x: 0.5,
                xanchor: "center" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "bottom" as const } : undefined,
              };
            } else if (pos === "left") {
              return {
                thickness: 28,
                len: 1,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: 0.5,
                yanchor: "middle" as const,
                x: -0.15,
                xanchor: "right" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "right" as const } : undefined,
              };
            } else {
              // "right" (default)
              return {
                thickness: 20,
                len: 0.9,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                x: 0.88, // Fixed position within the reserved space (domain ends at 0.85)
                xanchor: "left" as const,
                y: 0.5,
                yanchor: "middle" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "right" as const } : undefined,
              };
            }
          })(),
          line: {
            color: "var(--grey-400)",
            width: 1,
          },
        },
        hoverinfo: "text" as const,
        text: textData,
      },
    ];

    const layout = {
      autosize: false, // Prevent auto-sizing to maintain consistent layout
      title: title
        ? {
            text: title,
            font: {
              family: "Inter, sans-serif",
              size: 20,
              color: "var(--black-300)",
            },
            // Center title over graph area based on legend position
            x: (() => {
              const pos = legendConfig?.position ?? "right";
              if (pos === "left") return 0.575; // midpoint of [0.15, 1]
              if (pos === "right") return 0.425; // midpoint of [0, 0.85]
              return 0.5; // top/bottom use full width
            })(),
            xanchor: "center" as const,
            y: 0.98,
            yanchor: "top" as const,
          }
        : undefined,
      width,
      height,
      margin: (() => {
        const pos = legendConfig?.position ?? "right";
        const baseLeft = yTitle ? 70 : 50;
        const baseRight = 50;
        // Reserve extra space for colorbar on the appropriate side
        return {
          l: pos === "left" ? baseLeft + 50 : baseLeft,
          r: pos === "right" ? baseRight + 50 : baseRight,
          b: pos === "bottom" ? 80 : 50,
          t: title ? (pos === "top" ? 130 : 100) : (pos === "top" ? 70 : 40),
          pad: 5
        };
      })(),
      xaxis: {
        title: {
          text: xTitle || "",
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        side: "top" as const,
        fixedrange: true,
        dtick: 1,
        range: [0.5, columns + 0.5], // Explicit range to prevent auto-padding
        automargin: false, // Prevent auto margin adjustment
        tickmode: "array" as const,
        tickvals: Array.from({ length: columns }, (_, i) => i + 1),
        ticktext: colLabels.map(String),
        tickangle: 0, // Keep labels horizontal
        tickfont: { size: columns > 24 ? 8 : 11 }, // Smaller font for high-density plates
        // Adjust domain based on legend position to prevent colorbar overlap
        domain: (() => {
          const pos = legendConfig?.position ?? "right";
          if (pos === "left") return [0.15, 1];
          if (pos === "right") return [0, 0.85];
          return [0, 1]; // top/bottom don't need horizontal adjustment
        })(),
      },
      yaxis: {
        title: {
          text: yTitle || "",
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        fixedrange: true,
        dtick: 1,
        range: [rows - 0.5, -0.5], // Reversed range: high to low puts row A at top
        automargin: false, // Prevent auto margin adjustment
        tickmode: "array" as const,
        tickvals: Array.from({ length: rows }, (_, i) => i),
        ticktext: rowLabels.map(String),
        tickfont: { size: rows > 16 ? 8 : 11 }, // Smaller font for high-density plates
      },
      paper_bgcolor: "var(--white-900)",
      plot_bgcolor: "var(--white-900)",
      font: {
        family: "Inter, sans-serif",
        color: "var(--grey-600)",
      },
      shapes: regionShapes,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(currentRef, plotData, layout, config);

    // Always attach click handler - check onWellClickRef.current inside callback
    // This ensures handler is registered even if onWellClick is provided after initial render
    (currentRef as unknown as Plotly.PlotlyHTMLElement).on("plotly_click", (eventData: Plotly.PlotMouseEvent) => {
      if (!onWellClickRef.current) return;
      const point = eventData.points[0];
      if (point) {
        // Cast labels to handle union type
        const rowLabelsArr = rowLabels as (string | number)[];
        const colLabelsArr = colLabels as (string | number)[];
        const rowIdx = rowLabelsArr.indexOf(point.y as string | number);
        const colIdx = colLabelsArr.indexOf(point.x as string | number);
        if (rowIdx >= 0 && colIdx >= 0) {
          const wellId = `${rowLabelsArr[rowIdx]}${colLabelsArr[colIdx]}`;
          const wellIdUpper = String(wellId).toUpperCase();
          // Get all values and tooltipData for this well
          const allValues = allValuesMap.get(wellIdUpper);
          const tooltipData = tooltipDataMap.get(wellIdUpper);
          const wellData: WellData = {
            wellId,
            values: allValues,
            tooltipData,
          };
          onWellClickRef.current?.(wellData);
        }
      }
    });

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    displayGrid,
    colLabels,
    rowLabels,
    effectiveColorScale,
    showColorBar,
    effectiveZMin,
    zMax,
    valueUnit,
    title,
    xTitle,
    yTitle,
    width,
    height,
    hoverText,
    precision,
    tooltipDataMap,
    allValuesMap,
    grid,
    visualizationMode,
    categoricalGrid,
    categoricalColorScale,
    uniqueTypes.length,
    catMax,
    regionShapes,
    rows,
    columns,
    legendConfig,
    markerShape,
  ]);

  // Render layer selector tabs
  const renderLayerSelector = () => {
    if (!effectiveLayers || effectiveLayers.length <= 1) {
      return null;
    }

    return (
      <div
        className="platemap-layer-selector"
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "8px",
        }}
      >
        {effectiveLayers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => {
              setActiveLayerId(layer.id);
              onLayerChange?.(layer.id);
            }}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: activeLayer?.id === layer.id ? "#4575b4" : "#fff",
              color: activeLayer?.id === layer.id ? "#fff" : "#333",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {layer.name}
          </button>
        ))}
      </div>
    );
  };

  // Legend configuration with defaults
  const legendPosition = legendConfig?.position ?? "right";
  const legendFontSize = legendConfig?.fontSize ?? 12;
  const legendItemSpacing = legendConfig?.itemSpacing ?? 4;
  const legendSwatchSize = legendConfig?.swatchSize ?? 16;
  const legendTitle = legendConfig?.title;

  // Fixed width for categorical legend to prevent layout shift
  const legendWidth = 120;

  // Determine if legend is horizontal (top/bottom) or vertical (left/right)
  const isHorizontalLegend = legendPosition === "top" || legendPosition === "bottom";

  // Render legend (categorical types and/or regions)
  const renderLegend = () => {
    const hasCategoricalItems = visualizationMode === "categorical" && uniqueTypes.length > 0;
    const hasRegions = regions && regions.length > 0;

    if (!showLegend || (!hasCategoricalItems && !hasRegions)) {
      // Return empty placeholder to maintain consistent width (only for vertical legends)
      if (!isHorizontalLegend) {
        return <div style={{ width: legendWidth, flexShrink: 0 }} />;
      }
      return null;
    }

    const legendStyle: React.CSSProperties = isHorizontalLegend
      ? {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: `${legendItemSpacing}px`,
          padding: "8px",
          justifyContent: "center",
        }
      : {
          display: "flex",
          flexDirection: "column",
          gap: `${legendItemSpacing}px`,
          padding: "8px",
          marginLeft: legendPosition === "right" ? "8px" : undefined,
          marginRight: legendPosition === "left" ? "8px" : undefined,
          width: legendWidth,
          flexShrink: 0,
        };

    return (
      <div className="platemap-legend" style={legendStyle}>
        {legendTitle && (
          <div
            style={{
              fontSize: `${legendFontSize}px`,
              fontWeight: 600,
              marginBottom: "4px",
              width: isHorizontalLegend ? "100%" : undefined,
              textAlign: isHorizontalLegend ? "center" : undefined,
            }}
          >
            {legendTitle}
          </div>
        )}
        {/* Categorical type items */}
        {hasCategoricalItems &&
          uniqueTypes.map((type) => (
            <div
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: `${legendSwatchSize}px`,
                  height: `${legendSwatchSize}px`,
                  backgroundColor: categoryColors[type] || emptyWellColor,
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: `${legendFontSize}px`,
                  textTransform: "capitalize",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {type}
              </span>
            </div>
          ))}
        {/* Region items */}
        {hasRegions &&
          regions.map((region) => (
            <div
              key={region.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: `${legendSwatchSize}px`,
                  height: `${legendSwatchSize}px`,
                  backgroundColor: region.fillColor || "transparent",
                  border: `${region.borderWidth || 2}px solid ${region.borderColor || "#000"}`,
                  borderRadius: "2px",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  fontSize: `${legendFontSize}px`,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {region.name}
              </span>
            </div>
          ))}
      </div>
    );
  };

  // Build the plot content based on legend position
  const plotContent = <div ref={plotRef} style={{ width, height, flexShrink: 0 }} />;
  const legendContent = renderLegend();

  const renderPlotWithLegend = () => {
    switch (legendPosition) {
      case "left":
        return (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {legendContent}
            {plotContent}
          </div>
        );
      case "top":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {legendContent}
            {plotContent}
          </div>
        );
      case "bottom":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {plotContent}
            {legendContent}
          </div>
        );
      case "right":
      default:
        return (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {plotContent}
            {legendContent}
          </div>
        );
    }
  };

  return (
    <div className="platemap-container" style={{ display: "flex", flexDirection: "column", width: isHorizontalLegend ? undefined : width }}>
      {renderLayerSelector()}
      {renderPlotWithLegend()}
    </div>
  );
};

export { PlateMap };