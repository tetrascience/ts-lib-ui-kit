import type { WellData, WellDataGridResult, LayerConfig } from "./types";

/**
 * Generate row labels (A, B, C, ... for 96-well; A-P for 384-well; A-AF for 1536-well)
 * For rows beyond Z (26), uses AA, AB, AC, etc.
 */
export function generateRowLabels(count: number): string[] {
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
  return Array.from(layerIds);
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

