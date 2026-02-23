import { PLATEMAP_CONSTANTS } from "./constants";

import type { WellData, WellDataGridResult, LayerConfig, LegendPosition } from "./types";

/** ASCII code for uppercase 'A' */
const ASCII_UPPERCASE_A = 65;
/** Number of letters in the alphabet */
const ALPHABET_LENGTH = 26;

/**
 * Generate row labels (A, B, C, ... for 96-well; A-P for 384-well; A-AF for 1536-well)
 * For rows beyond Z (26), uses AA, AB, AC, etc.
 */
export function generateRowLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    i < ALPHABET_LENGTH
      ? String.fromCharCode(ASCII_UPPERCASE_A + i)
      : "A" + String.fromCharCode(ASCII_UPPERCASE_A + (i - ALPHABET_LENGTH))
  );
}

/**
 * Generate column labels (1, 2, 3, ...)
 */
export function generateColumnLabels(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Parse well ID to row and column indices
 * @param wellId - Well identifier (e.g., "A1", "H12", "P24", "AA1", "AF48")
 * @returns { row, col } zero-indexed
 */
export function parseWellId(wellId: string): { row: number; col: number } | null {
  // Match single letter (A-Z) or double letter (AA-AF) followed by 1-2 digits
  const match = wellId.match(/^([A-Z]{1,2})(\d{1,2})$/i);
  if (!match) return null;

  const rowStr = match[1].toUpperCase();
  const row =
    rowStr.length === 1
      ? rowStr.charCodeAt(0) - ASCII_UPPERCASE_A
      : ALPHABET_LENGTH + (rowStr.charCodeAt(1) - ASCII_UPPERCASE_A);

  const col = parseInt(match[2], 10) - 1;

  return { row, col };
}

/** Parsed well position */
interface ParsedWellPosition {
  row: number;
  col: number;
}

/**
 * Checks if a parsed well position is within grid bounds.
 */
function isValidWellPosition(
  parsed: ParsedWellPosition | null,
  rows: number,
  columns: number
): parsed is ParsedWellPosition {
  if (!parsed) return false;
  const { row, col } = parsed;
  // Check bounds including >= 0 to prevent negative indices (e.g., "A0" -> col=-1)
  return row >= 0 && col >= 0 && row < rows && col < columns;
}

/**
 * Extracts the layer value from well values for the specified layer.
 */
function extractLayerValue(
  values: Record<string, string | number | null> | undefined,
  layerId?: string
): string | number | null {
  if (!values) return null;
  const effectiveLayerId = layerId ?? Object.keys(values)[0];
  return effectiveLayerId ? values[effectiveLayerId] : null;
}

/**
 * Stores the layer value in the appropriate grid based on its type.
 */
function storeLayerValue(
  layerValue: string | number | null,
  row: number,
  col: number,
  grid: (number | null)[][],
  categories: (string | null)[][]
): void {
  if (typeof layerValue === "number") {
    grid[row][col] = layerValue;
  } else if (typeof layerValue === "string") {
    categories[row][col] = layerValue;
  }
}

/**
 * Convert WellData array to 2D grids for a specific layer
 */
export function wellDataToGrid(
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
    if (!isValidWellPosition(parsed, rows, columns)) continue;

    const wellIdUpper = well.wellId.toUpperCase();

    // Store all values for tooltip
    if (well.values) {
      allValues.set(wellIdUpper, well.values);
    }

    // Store tooltipData
    if (well.tooltipData) {
      tooltipData.set(wellIdUpper, well.tooltipData);
    }

    // Extract and store the layer value
    const layerValue = extractLayerValue(well.values, layerId);
    storeLayerValue(layerValue, parsed.row, parsed.col, grid, categories);
  }

  return { grid, categories, allValues, tooltipData };
}

/**
 * Calculate min/max values from grid, ignoring nulls
 */
export function calculateValueRange(grid: (number | null)[][]): { min: number; max: number } {
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
export function hasMultiValueWells(data: WellData[]): boolean {
  return data.some((well) => well.values && Object.keys(well.values).length > 0);
}

/**
 * Extract unique layer IDs from WellData array with `values`
 */
export function extractLayerIds(data: WellData[]): string[] {
  const layerIds = new Set<string>();
  for (const well of data) {
    if (well.values) {
      Object.keys(well.values).forEach((k) => layerIds.add(k));
    }
  }
  return [...layerIds];
}

/**
 * Check if a layer contains string values (categorical) or numeric values (heatmap)
 */
export function isStringValueLayer(data: WellData[], layerId: string): boolean {
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
export function extractLayers(
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
export function parseRegionWells(
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

/** Options for building hover text for a well */
export interface BuildHoverTextOptions {
  wellId: string;
  value: number | null;
  allValues: Record<string, number | string | null> | undefined;
  tooltipExtra: Record<string, unknown> | undefined;
  activeLayerId: string | undefined;
  layerConfigMap: Map<string, LayerConfig>;
  precision: number;
  valueUnit: string;
}

/**
 * Builds the hover text HTML for a single well.
 * Shows all layer values with the active layer marked.
 */
export function buildWellHoverText({
  wellId,
  value,
  allValues,
  tooltipExtra,
  activeLayerId,
  layerConfigMap,
  precision,
  valueUnit,
}: BuildHoverTextOptions): string {
  let text = `Well ${wellId}`;

  if (allValues) {
    text += formatAllLayerValues(allValues, activeLayerId, layerConfigMap, precision);
  } else if (value !== null) {
    text += `<br>Value: ${value.toFixed(precision)}${valueUnit}`;
  } else if (activeLayerId) {
    text += `<br>▶ ${activeLayerId}: -`;
  } else {
    text += `<br>No data`;
  }

  if (tooltipExtra) {
    text += formatTooltipExtra(tooltipExtra);
  }

  return text;
}

/** Formats all layer values for hover text display */
function formatAllLayerValues(
  allValues: Record<string, number | string | null>,
  activeLayerId: string | undefined,
  layerConfigMap: Map<string, LayerConfig>,
  precision: number
): string {
  let result = "";
  for (const [key, value] of Object.entries(allValues)) {
    const isActiveLayer = key === activeLayerId;
    const prefix = isActiveLayer ? "▶ " : "";
    const rawLayerUnit = layerConfigMap.get(key)?.valueUnit;
    const layerUnit = rawLayerUnit ? ` ${rawLayerUnit}` : "";

    if (value === null) {
      result += `<br>${prefix}${key}: -`;
    } else if (typeof value === "number") {
      result += `<br>${prefix}${key}: ${value.toFixed(precision)}${layerUnit}`;
    } else {
      result += `<br>${prefix}${key}: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
    }
  }
  return result;
}

/** Formats tooltip extra data for display */
function formatTooltipExtra(tooltipExtra: Record<string, unknown>): string {
  let result = "";
  for (const [key, value] of Object.entries(tooltipExtra)) {
    result += `<br>${key}: ${String(value)}`;
  }
  return result;
}

/** Colorbar configuration for a specific position */
export interface ColorbarConfig {
  orientation?: "h" | "v";
  thickness: number;
  len: number;
  outlinewidth: number;
  ticksuffix: string;
  x: number;
  xanchor: "left" | "center" | "right";
  y: number;
  yanchor: "top" | "middle" | "bottom";
  title?: { text: string; side: "top" | "bottom" | "right" };
}

/**
 * Builds the colorbar configuration based on legend position.
 */
export function buildColorbarConfig(
  position: LegendPosition,
  valueUnit: string,
  legendTitle?: string
): ColorbarConfig {
  const title = legendTitle ? { text: legendTitle } : undefined;

  switch (position) {
    case "bottom":
      return {
        orientation: "h",
        thickness: 20,
        len: 0.75,
        outlinewidth: 0,
        ticksuffix: valueUnit,
        y: -0.15,
        yanchor: "top",
        x: 0.5,
        xanchor: "center",
        title: title ? { ...title, side: "top" } : undefined,
      };
    case "top":
      return {
        orientation: "h",
        thickness: 20,
        len: 0.75,
        outlinewidth: 0,
        ticksuffix: valueUnit,
        y: 1.15,
        yanchor: "bottom",
        x: 0.5,
        xanchor: "center",
        title: title ? { ...title, side: "bottom" } : undefined,
      };
    case "left":
      return {
        thickness: 28,
        len: 1,
        outlinewidth: 0,
        ticksuffix: valueUnit,
        y: 0.5,
        yanchor: "middle",
        x: -0.15,
        xanchor: "right",
        title: title ? { ...title, side: "right" } : undefined,
      };
    default:
      // "right" (default)
      return {
        thickness: 20,
        len: 0.9,
        outlinewidth: 0,
        ticksuffix: valueUnit,
        x: 0.88,
        xanchor: "left",
        y: 0.5,
        yanchor: "middle",
        title: title ? { ...title, side: "right" } : undefined,
      };
  }
}

/** Margin configuration for the plot */
export interface PlotMargins {
  l: number;
  r: number;
  b: number;
  t: number;
  pad: number;
}

/**
 * Builds the margin configuration based on legend position and title presence.
 */
export function buildPlotMargins(
  position: LegendPosition,
  hasTitle: boolean,
  hasYTitle: boolean
): PlotMargins {
  const baseLeft = hasYTitle ? PLATEMAP_CONSTANTS.MARGIN_TOP : PLATEMAP_CONSTANTS.MARGIN_RIGHT;
  const baseRight = PLATEMAP_CONSTANTS.MARGIN_RIGHT;

  const leftMargin = position === "left" ? baseLeft + PLATEMAP_CONSTANTS.MARGIN_RIGHT : baseLeft;
  const rightMargin = position === "right" ? baseRight + PLATEMAP_CONSTANTS.MARGIN_RIGHT : baseRight;
  const bottomMargin = position === "bottom" ? PLATEMAP_CONSTANTS.MARGIN_LEFT : PLATEMAP_CONSTANTS.MARGIN_RIGHT;

  let topMargin: number;
  if (hasTitle) {
    topMargin = position === "top" ? PLATEMAP_CONSTANTS.COLORBAR_LENGTH : 100;
  } else {
    topMargin = position === "top" ? PLATEMAP_CONSTANTS.MARGIN_TOP : PLATEMAP_CONSTANTS.MARGIN_BOTTOM;
  }

  return { l: leftMargin, r: rightMargin, b: bottomMargin, t: topMargin, pad: 5 };
}

/**
 * Calculates the title X position based on legend position.
 */
export function calculateTitleX(position: LegendPosition): number {
  switch (position) {
    case "left":
      return PLATEMAP_CONSTANTS.MULTI_VALUE_PRIMARY_RATIO;
    case "right":
      return PLATEMAP_CONSTANTS.MULTI_VALUE_SECONDARY_RATIO;
    default:
      return 0.5;
  }
}

/**
 * Calculates the X-axis domain based on legend position.
 */
export function calculateAxisDomain(position: LegendPosition): [number, number] {
  switch (position) {
    case "left":
      return [PLATEMAP_CONSTANTS.DOMAIN_COLORBAR_OFFSET, 1];
    case "right":
      return [0, PLATEMAP_CONSTANTS.DOMAIN_COLORBAR_END];
    default:
      return [0, 1];
  }
}

/** Data arrays for scatter plot */
export interface ScatterPlotData {
  xData: number[];
  yData: string[];
  colorData: number[];
  textData: string[];
}

/**
 * Flattens 2D grid data into arrays for scatter plot rendering.
 */
export function flattenGridData(
  plotZ: (number | null)[][],
  rowLabels: (string | number)[],
  hoverText: string[][],
  rows: number,
  columns: number,
  plotZMin: number
): ScatterPlotData {
  const xData: number[] = [];
  const yData: string[] = [];
  const colorData: number[] = [];
  const textData: string[] = [];

  for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
    for (let colIdx = 0; colIdx < columns; colIdx++) {
      xData.push(colIdx + 1); // 1-indexed columns
      yData.push(rowLabels[rowIdx] as string);
      const zValue = plotZ[rowIdx][colIdx];
      colorData.push(zValue ?? plotZMin); // Use min value for null wells
      textData.push(hoverText[rowIdx][colIdx]);
    }
  }

  return { xData, yData, colorData, textData };
}

/** Marker size calculation result */
export interface MarkerSizeResult {
  markerSize: number;
}

/** Minimum marker size in pixels */
const MIN_MARKER_SIZE = 4;
/** Size multiplier for square markers (fill entire cell) */
const SQUARE_SIZE_MULTIPLIER = 1.0;
/** Size multiplier for circle markers (leave gaps) */
const CIRCLE_SIZE_MULTIPLIER = 0.8;
/** Default colorbar space reservation */
const COLORBAR_SPACE = 100;

/**
 * Calculates the marker size based on plot dimensions and marker shape.
 */
export function calculateMarkerSize(
  width: number,
  height: number,
  rows: number,
  columns: number,
  markerShape: "circle" | "square",
  hasTitle: boolean,
  hasYTitle: boolean
): number {
  const leftMargin = hasYTitle ? PLATEMAP_CONSTANTS.MARGIN_TOP : PLATEMAP_CONSTANTS.MARGIN_RIGHT;
  const rightMargin = COLORBAR_SPACE; // Always reserve space for colorbar
  const topMargin = hasTitle ? COLORBAR_SPACE : PLATEMAP_CONSTANTS.MARGIN_BOTTOM;
  const bottomMargin = PLATEMAP_CONSTANTS.MARGIN_RIGHT;
  const plotWidth = width - leftMargin - rightMargin;
  const plotHeight = height - topMargin - bottomMargin;

  const cellWidth = plotWidth / columns;
  const cellHeight = plotHeight / rows;

  // Circles: use smaller dimension; Squares: use larger dimension
  const cellSize = markerShape === "square"
    ? Math.max(cellWidth, cellHeight)
    : Math.min(cellWidth, cellHeight);

  const sizeMultiplier = markerShape === "square" ? SQUARE_SIZE_MULTIPLIER : CIRCLE_SIZE_MULTIPLIER;
  return Math.max(MIN_MARKER_SIZE, cellSize * sizeMultiplier);
}
