import { useMemo } from "react";

import type { ChartAnnotationProps } from "@/components/composed/Chart/annotations";
import type { ChartSpec, Palettes, VizData } from "@/vendor/ts-lib-viz/core";
import type { VizProps } from "@/vendor/ts-lib-viz/react";

import { withAnnotations } from "@/components/composed/Chart/annotations";
import { palettesFor } from "@/vendor/ts-lib-viz/core";
import { Viz } from "@/vendor/ts-lib-viz/react";

import "@/vendor/ts-lib-viz/theme/default.css";

/**
 * Shared bridge from the chart props to ts-lib-viz.
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

export interface VizChartProps extends ChartAnnotationProps {
  spec: ChartSpec;
  data: VizData;
  palettes?: Palettes;
  width?: number;
  height?: number;
  /** Column naming each record, for the tooltip title and a click. */
  keyField?: string;
  /** Called with the geom a reader clicked, or null when a click clears it. */
  onSelect?: VizProps["onSelect"];
}

/**
 * The Plotly charts ran a titled y-axis along its rule. ts-lib-viz defaults to a
 * horizontal caption above the ticks, so a y title that does not state its own
 * alignment is moved onto the rule to match.
 */
function alongTheRule(spec: ChartSpec): ChartSpec {
  const y = spec.scales?.y;
  if (!y?.title || y.titleAlign !== undefined) return spec;
  return { ...spec, scales: { ...spec.scales, y: { ...y, titleAlign: "center" } } };
}

/**
 * Matches the Plotly defaults the charts shipped with. Gridlines are on unless
 * the caller turns them off. An axis with no title gets an empty one, because
 * ts-lib-viz otherwise captions the axis with its field name ("x", "y", "series").
 */
function plotlyDefaults(spec: ChartSpec): ChartSpec {
  if (spec.scales === undefined) return spec;
  const axis = (scale: NonNullable<ChartSpec["scales"]>["x"]) => ({
    ...scale,
    title: scale?.title ?? "",
    grid: scale?.grid ?? true,
  });
  return { ...spec, scales: { ...spec.scales, x: axis(spec.scales.x), y: axis(spec.scales.y) } };
}

export function VizChart({
  spec,
  data,
  palettes,
  width,
  height,
  keyField,
  onSelect,
  referenceLines,
  annotations,
}: VizChartProps) {
  const sized = useMemo<ChartSpec>(
    () => ({
      ...withAnnotations(alongTheRule(plotlyDefaults(spec)), referenceLines, annotations),
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
    }),
    [spec, width, height, referenceLines, annotations],
  );

  return (
    <div style={{ width: width ?? "100%", height: height ?? "100%" }} className="relative min-h-0 min-w-0">
      <Viz spec={sized} data={data} palettes={palettes} keyField={keyField} onSelect={onSelect} />
    </div>
  );
}
