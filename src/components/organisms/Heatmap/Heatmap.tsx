import React from "react";
import { PlateMap, ColorScale } from "../PlateMap";

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
  // Determine rows and columns from data or labels
  const rows = data?.length ?? (yLabels?.length ?? 16);
  const columns = data?.[0]?.length ?? (xLabels?.length ?? 24);

  // Convert colorscale to PlateMap ColorScale format if provided
  const plateMapColorScale: ColorScale | undefined = colorscale
    ? (Array.isArray(colorscale) ? colorscale : undefined)
    : undefined;

  return (
    <PlateMap
      data={data as (number | null)[][] | undefined}
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
      valueUnit={valueUnit}
      precision={precision}
    />
  );
};

export { Heatmap };
export type { HeatmapProps };
