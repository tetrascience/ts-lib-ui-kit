import React, { useEffect, useMemo, useRef } from "react";
import Plotly from "plotly.js-dist";
import "./PlateMap.scss";

/**
 * Plate format presets
 */
export type PlateFormat = "96" | "384" | "custom";

/**
 * Well data for individual wells
 */
export interface WellData {
  /** Well identifier (e.g., "A1", "H12") */
  wellId: string;
  /** Numeric value for the well (null = empty/no data) */
  value: number | null;
  /** Optional metadata for custom tooltip content */
  metadata?: Record<string, unknown>;
}

/**
 * Color scale definition for the heatmap
 */
export type ColorScale = string | Array<[number, string]>;

/**
 * Props for PlateMap component
 */
export interface PlateMapProps {
  /**
   * Well data array. Can be provided as:
   * - Array of WellData objects with wellId and value
   * - 2D array of numbers (row-major order, null for empty wells)
   * If not provided, generates random data for demonstration
   */
  data?: WellData[] | (number | null)[][];

  /** Plate format preset (default: "96") */
  plateFormat?: PlateFormat;

  /** Number of rows for custom format (default: 8 for 96-well, 16 for 384-well) */
  rows?: number;

  /** Number of columns for custom format (default: 12 for 96-well, 24 for 384-well) */
  columns?: number;

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

  /** Color scale for the heatmap */
  colorScale?: ColorScale;

  /** Minimum value for color scale (auto-calculated if not provided) */
  valueMin?: number;

  /** Maximum value for color scale (auto-calculated if not provided) */
  valueMax?: number;

  /** Color for empty/null wells (default: "#f0f0f0") */
  emptyWellColor?: string;

  /** Show color bar legend (default: true) */
  showColorBar?: boolean;

  /** Chart width in pixels (default: 800) */
  width?: number;

  /** Chart height in pixels (default: 500) */
  height?: number;

  /** Value unit suffix for tooltips (e.g., " RFU", " %") */
  valueUnit?: string;

  /** Number of decimal places for values (default: 0) */
  precision?: number;

  /** Callback when a well/cell is clicked */
  onWellClick?: (wellId: string, value: number | null, metadata?: Record<string, unknown>) => void;

  /** Custom tooltip formatter */
  tooltipFormatter?: (wellId: string, value: number | null, metadata?: Record<string, unknown>) => string;
}

/**
 * Plate dimension configurations
 */
const PLATE_CONFIGS: Record<"96" | "384", { rows: number; columns: number }> = {
  "96": { rows: 8, columns: 12 },
  "384": { rows: 16, columns: 24 },
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
 * Generate row labels (A, B, C, ... for 96-well; A-P for 384-well)
 */
function generateRowLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}

/**
 * Generate column labels (1, 2, 3, ...)
 */
function generateColumnLabels(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Parse well ID to row and column indices
 * @param wellId - Well identifier (e.g., "A1", "H12", "P24")
 * @returns { row, col } zero-indexed
 */
function parseWellId(wellId: string): { row: number; col: number } | null {
  const match = wellId.match(/^([A-P])(\d{1,2})$/i);
  if (!match) return null;
  
  const row = match[1].toUpperCase().charCodeAt(0) - 65;
  const col = parseInt(match[2], 10) - 1;
  
  return { row, col };
}

/**
 * Convert WellData array to 2D grid
 */
function wellDataToGrid(
  wells: WellData[],
  rows: number,
  columns: number
): { grid: (number | null)[][]; metadata: Map<string, Record<string, unknown>> } {
  // Initialize grid with nulls
  const grid: (number | null)[][] = Array.from({ length: rows }, () =>
    Array(columns).fill(null)
  );
  const metadata = new Map<string, Record<string, unknown>>();
  
  for (const well of wells) {
    const parsed = parseWellId(well.wellId);
    if (parsed && parsed.row < rows && parsed.col < columns) {
      grid[parsed.row][parsed.col] = well.value;
      if (well.metadata) {
        metadata.set(well.wellId.toUpperCase(), well.metadata);
      }
    }
  }
  
  return { grid, metadata };
}

/**
 * Validate and sanitize grid data
 */
function validateGridData(
  data: (number | null)[][],
  rows: number,
  columns: number
): (number | null)[][] {
  // Handle empty data
  if (!data || data.length === 0) {
    return Array.from({ length: rows }, () => Array(columns).fill(null));
  }

  // Normalize to expected dimensions
  const normalized: (number | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < columns; c++) {
      const value = data[r]?.[c];
      // Sanitize: keep null/valid numbers, convert NaN/Infinity to null
      if (value === null || value === undefined) {
        row.push(null);
      } else if (Number.isFinite(value)) {
        row.push(value);
      } else {
        row.push(null);
      }
    }
    normalized.push(row);
  }
  return normalized;
}

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
 * PlateMap component for visualizing well plate data as a heatmap
 *
 * Supports 96-well (8×12) and 384-well (16×24) plate formats with configurable
 * color scales, tooltips, and click interactions.
 *
 * @example
 * // With WellData array
 * <PlateMap
 *   data={[
 *     { wellId: "A1", value: 1000 },
 *     { wellId: "A2", value: 1500 },
 *     { wellId: "B1", value: null }, // empty well
 *   ]}
 *   plateFormat="96"
 *   title="Plate Readings"
 * />
 *
 * @example
 * // With 2D array
 * <PlateMap
 *   data={[[100, 200, null], [300, 400, 500]]}
 *   plateFormat="custom"
 *   rows={2}
 *   columns={3}
 * />
 */
const PlateMap: React.FC<PlateMapProps> = ({
  data,
  plateFormat = "96",
  rows: customRows,
  columns: customColumns,
  title,
  xTitle,
  yTitle,
  xLabels: customXLabels,
  yLabels: customYLabels,
  colorScale = DEFAULT_COLOR_SCALE,
  valueMin,
  valueMax,
  emptyWellColor: _emptyWellColor = "#f0f0f0",
  showColorBar = true,
  width = 800,
  height = 500,
  valueUnit = "",
  precision = 0,
  onWellClick,
  tooltipFormatter,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const onWellClickRef = useRef(onWellClick);
  onWellClickRef.current = onWellClick;

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

  // Convert data to grid format - memoize to prevent re-render issues
  const { grid, metadataMap } = useMemo(() => {
    let resultGrid: (number | null)[][];
    let resultMetadataMap = new Map<string, Record<string, unknown>>();

    if (Array.isArray(data) && data.length > 0) {
      if ("wellId" in (data[0] as WellData)) {
        // WellData array format
        const result = wellDataToGrid(data as WellData[], rows, columns);
        resultGrid = result.grid;
        resultMetadataMap = result.metadata;
      } else {
        // 2D array format
        resultGrid = validateGridData(data as (number | null)[][], rows, columns);
      }
    } else {
      // Generate random data for demonstration when no data provided
      resultGrid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => Math.random() * 50000)
      );
    }

    return { grid: resultGrid, metadataMap: resultMetadataMap };
  }, [data, rows, columns]);

  // Generate labels - use custom labels if provided, otherwise auto-generate
  const rowLabels = customYLabels ?? generateRowLabels(rows);
  const colLabels = customXLabels ?? generateColumnLabels(columns);

  // Calculate value range if not provided
  const range = calculateValueRange(grid);
  const zMin = valueMin ?? range.min;
  const zMax = valueMax ?? range.max;

  // Build custom hover text matrix
  const hoverText: string[][] = grid.map((row, rowIdx) =>
    row.map((val, colIdx) => {
      const wellId = `${rowLabels[rowIdx]}${colLabels[colIdx]}`;
      const metadata = metadataMap.get(wellId);

      if (tooltipFormatter) {
        return tooltipFormatter(wellId, val, metadata);
      }

      if (val === null) {
        return `Well ${wellId}<br>No data`;
      }

      let text = `Well ${wellId}<br>Value: ${val.toFixed(precision)}${valueUnit}`;
      if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
          text += `<br>${key}: ${value}`;
        }
      }
      return text;
    })
  );

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef) return;

    // Cast to Plotly.Data to handle text as 2D array (Plotly supports this for heatmaps)
    const plotData: Plotly.Data[] = [
      {
        z: grid,
        x: colLabels,
        y: rowLabels,
        type: "heatmap" as const,
        colorscale: colorScale,
        showscale: showColorBar,
        zsmooth: false as const,
        hoverinfo: "text" as const,
        text: hoverText as unknown as string,
        zmin: zMin,
        zmax: zMax,
        colorbar: {
          thickness: 28,
          len: 1,
          outlinewidth: 0,
          ticksuffix: valueUnit,
          y: 0.5,
          yanchor: "middle" as const,
        },
      },
    ];

    const layout = {
      title: title
        ? {
            text: title,
            font: {
              family: "Inter, sans-serif",
              size: 20,
              color: "var(--black-300)",
            },
            y: 0.98,
            yanchor: "top" as const,
          }
        : undefined,
      width,
      height,
      margin: {
        l: yTitle ? 70 : 50,
        r: showColorBar ? 100 : 50,
        b: 50,
        t: title ? 100 : 40,
        pad: 5
      },
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
        autorange: "reversed" as const,
        fixedrange: true,
        dtick: 1,
      },
      paper_bgcolor: "var(--white-900)",
      plot_bgcolor: "var(--white-900)",
      font: {
        family: "Inter, sans-serif",
        color: "var(--grey-600)",
      },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(currentRef, plotData, layout, config);

    // Add click handler
    if (onWellClickRef.current) {
      (currentRef as unknown as Plotly.PlotlyHTMLElement).on("plotly_click", (eventData: Plotly.PlotMouseEvent) => {
        const point = eventData.points[0];
        if (point) {
          // Cast labels to handle union type
          const rowLabelsArr = rowLabels as (string | number)[];
          const colLabelsArr = colLabels as (string | number)[];
          const rowIdx = rowLabelsArr.indexOf(point.y as string | number);
          const colIdx = colLabelsArr.indexOf(point.x as string | number);
          if (rowIdx >= 0 && colIdx >= 0) {
            const wellId = `${rowLabelsArr[rowIdx]}${colLabelsArr[colIdx]}`;
            const value = grid[rowIdx][colIdx];
            const metadata = metadataMap.get(wellId);
            onWellClickRef.current?.(wellId, value, metadata);
          }
        }
      });
    }

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    grid,
    colLabels,
    rowLabels,
    colorScale,
    showColorBar,
    zMin,
    zMax,
    valueUnit,
    title,
    xTitle,
    yTitle,
    width,
    height,
    hoverText,
    precision,
    metadataMap,
  ]);

  return (
    <div className="platemap-container">
      <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export { PlateMap };