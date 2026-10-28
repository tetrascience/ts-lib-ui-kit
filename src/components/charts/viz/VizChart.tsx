import { palettesFor } from "@tetrascience-npm/ts-lib-viz/core";
import { Viz } from "@tetrascience-npm/ts-lib-viz/react";
import { useMemo } from "react";

import type { ChartSpec, Palettes, VizData } from "@tetrascience-npm/ts-lib-viz/core";

import "@tetrascience-npm/ts-lib-viz/theme.css";

/**
 * Shared bridge from the Plotly-era chart props to ts-lib-viz (SW-deprecation).
 *
 * Each deprecated chart builds a `ChartSpec` and rows, then draws them here. The
 * wrapper owns the size: a stated width or height is fixed, and an omitted one
 * fills the parent, the same contract the Plotly charts had.
 */

/** A categorical map that paints series in the order given, cycling past the end. */
export function categoricalPalettes(colors: readonly string[]): Palettes {
  const base = palettesFor();
  return {
    ...base,
    categorical: (index) => colors[index % colors.length],
    categoricalSize: colors.length,
  };
}

export interface VizChartProps {
  spec: ChartSpec;
  data: VizData;
  palettes?: Palettes;
  width?: number;
  height?: number;
}

export function VizChart({ spec, data, palettes, width, height }: VizChartProps) {
  const sized = useMemo<ChartSpec>(
    () => ({
      ...spec,
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
    }),
    [spec, width, height],
  );

  return (
    <div
      style={{ width: width ?? "100%", height: height ?? "100%" }}
      className="relative min-h-0 min-w-0"
    >
      <Viz spec={sized} data={data} palettes={palettes} />
    </div>
  );
}
