import React, { useMemo } from "react";
import { PlateMap, ColorScale, WellData } from "../PlateMap";

/**
 * Props for the Heatmap component
 * @deprecated Use PlateMap component instead. Heatmap is now a wrapper around PlateMap for backward compatibility.
 */
interface HeatmapProps {
  /** 2D array of numeric values */
  data?: number[][];
  /** Custom x-axis labels (column labels) */
  xLabels?: string[] | number[];
  /** Custom y-axis labels (row labels) */
  yLabels?: string[] | number[];
  /** Chart title */
  title?: string;
  /** X-axis title */
  xTitle?: string;
  /** Y-axis title */
  yTitle?: string;
  /** Color scale - string name or array of [position, color] pairs */
  colorscale?: string | Array<[number, string]>;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show color scale legend */
  showScale?: boolean;
  /** Number of decimal places for values */
  precision?: number;
  /** Minimum value for color scale */
  zmin?: number;
  /** Maximum value for color scale */
  zmax?: number;
  /** Value unit suffix */
  valueUnit?: string;
}

/**
 * Heatmap component for 2D data visualization
 * @deprecated Use PlateMap component instead. This component is now a wrapper around PlateMap for backward compatibility.
 *
 * @example
 * ```tsx
 * <Heatmap
 *   data={[[1, 2, 3], [4, 5, 6]]}
 *   xLabels={['A', 'B', 'C']}
 *   yLabels={['Row 1', 'Row 2']}
 *   title="My Heatmap"
 * />
 * ```
 */
/**
 * Normalize jagged 2D array to consistent width (backward compatibility)
 */
function normalizeData(data: number[][]): number[][] {
  if (!data || data.length === 0) return [];

  const maxLength = Math.max(...data.map((row) => row.length));

  return data.map((row) => {
    if (row.length === maxLength) return row;

    const newRow = [...row];
    while (newRow.length < maxLength) {
      newRow.push(0);
    }
    return newRow;
  });
}

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  xLabels,
  yLabels,
  title,
  xTitle,
  yTitle,
  colorscale,
  width = 800,
  height = 600,
  showScale = true,
  precision = 0,
  zmin,
  zmax,
  valueUnit = "",
}) => {
  // Normalize jagged arrays to consistent width (backward compatibility)
  const normalizedData = data ? normalizeData(data) : undefined;

  // Determine rows and columns from normalized data or labels
  const rows = normalizedData?.length ?? (yLabels?.length ?? 16);
  const columns = normalizedData?.[0]?.length ?? (xLabels?.length ?? 24);

  // Convert 2D array to WellData format for PlateMap
  const wellData: WellData[] | undefined = useMemo(() => {
    if (!normalizedData) return undefined;

    const defaultRows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wells: WellData[] = [];

    for (let r = 0; r < normalizedData.length; r++) {
      for (let c = 0; c < normalizedData[r].length; c++) {
        const rowLabel = yLabels?.[r]?.toString() ?? defaultRows[r] ?? `R${r + 1}`;
        const colLabel = xLabels?.[c]?.toString() ?? String(c + 1);
        const wellId = `${rowLabel}${colLabel}`;
        wells.push({ wellId, values: { Value: normalizedData[r][c] } });
      }
    }
    return wells;
  }, [normalizedData, xLabels, yLabels]);

  // Pass colorscale directly - PlateMap's ColorScale type supports both string and array formats
  const plateMapColorScale: ColorScale | undefined = colorscale;

  return (
    <PlateMap
      data={wellData}
      plateFormat="custom"
      rows={rows}
      columns={columns}
      title={title}
      xTitle={xTitle}
      yTitle={yTitle}
      xLabels={xLabels}
      yLabels={yLabels}
      colorScale={plateMapColorScale}
      valueMin={zmin}
      valueMax={zmax}
      showColorBar={showScale}
      width={width}
      height={height}
      layerConfigs={[{ id: "Value", valueUnit }]}
      precision={precision}
    />
  );
};

export { Heatmap };
export type { HeatmapProps };
