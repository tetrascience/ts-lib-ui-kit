import type { ChartSpec, Palettes } from "@/vendor/ts-lib-viz/core";

import { plot } from "@/vendor/ts-lib-viz/core";

type ColorRamp = Palettes["sequential"];

/** One well as the chart draws it: a point at its column (x) and row (y). */
export type PlateCell = {
  /** Well id, such as `A1`. The chart's key, so a click names its well. */
  wellId: string;
  /** Column, 1-based, so the first column sits at 1. */
  x: number;
  /** Row, 0-based, so the first row sits at 0. The y axis runs downwards. */
  y: number;
  /** The value the heatmap colours the well by. Null where the well has none. */
  value: number | null;
  /** The category a categorical plate colours the well by. */
  category: string;
  /** Hover text for the well: every layer's value and any extra tooltip fields. */
  details: string;
};

/** Row and column bounds of a region, zero-based. */
export interface PlateBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export interface PlateRegion {
  bounds: PlateBounds;
  color: string;
  width: number;
}

export interface PlateSpecInput {
  mode: "heatmap" | "categorical";
  cells: PlateCell[];
  rows: number;
  columns: number;
  rowLabels: readonly (string | number)[];
  colLabels: readonly (string | number)[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
  markerShape: "circle" | "square";
  /** Radius of each well marker, in pixels. */
  markerRadius: number;
  emptyWellColor: string;
  /** Colour of each category, by name. Used in categorical mode. */
  categoryColors: Record<string, string>;
  /** Categories to draw, in legend order. Used in categorical mode. */
  categories: readonly string[];
  /** Colour ramp the heatmap reads over `[zMin, zMax]`. Used in heatmap mode. */
  colorRamp: ColorRamp;
  zMin: number;
  zMax: number;
  /** Title over the colour bar. */
  legendTitle: string;
  /** The value unit with its leading space, as the colour bar labels print it: " AU". */
  valueUnit: string;
  regions: readonly PlateRegion[];
  /** Where the colour bar sits, or "none" to hide it. */
  legendPosition: "right" | "left" | "top" | "bottom" | "none";
}

type Builder = ReturnType<typeof plot<PlateCell[], { x: "x"; y: "y" }>>;

/** Half a well, so a region outline runs along the edge of its outer wells. */
const REGION_INSET = 0.49;
/** Half a well, the distance from a well's centre to its edge. */
const HALF_CELL = 0.5;
const BYTE_MAX = 255;
const BITS_PER_BYTE = 8;
const HEX_RADIX = 16;
const HEX_DIGITS = 6;

const toChannels = (hex: string): number[] | null => {
  const match = new RegExp(`^#?([0-9a-f]{${HEX_DIGITS}})$`, "i").exec(hex);
  if (!match) return null;
  const packed = parseInt(match[1], HEX_RADIX);
  return [(packed >> (2 * BITS_PER_BYTE)) & BYTE_MAX, (packed >> BITS_PER_BYTE) & BYTE_MAX, packed & BYTE_MAX];
};

const toHex = (channels: number[]): string =>
  `#${channels.map((value) => Math.round(value).toString(HEX_RADIX).padStart(2, "0")).join("")}`;

/**
 * A colour ramp that interpolates between the stops of a Plotly-style colorscale.
 * Stops that are not hex colours are returned as they are, without blending.
 */
export function colorRampFrom(stops: ReadonlyArray<readonly [number, string]>): ColorRamp {
  const sorted = [...stops].sort((a, b) => a[0] - b[0]);
  const ramp = (t: number): string => {
    if (sorted.length === 0) return "transparent";
    const at = Math.min(1, Math.max(0, t));
    let k = 0;
    while (k < sorted.length - 2 && at > sorted[k + 1][0]) k++;
    const [start, startColor] = sorted[k];
    const [end, endColor] = sorted[Math.min(k + 1, sorted.length - 1)];
    const from = toChannels(startColor);
    const to = toChannels(endColor);
    if (!from || !to || end === start) return startColor;
    const fraction = (at - start) / (end - start);
    return toHex(from.map((value, index) => value + (to[index] - value) * fraction));
  };
  return ramp as ColorRamp;
}

/** The four edges of a region's outline, as segments from one corner to the next. */
export function regionSegments(bounds: PlateBounds): Array<Record<"x" | "y" | "xend" | "yend", number>> {
  const x0 = bounds.minCol + 1 - REGION_INSET;
  const x1 = bounds.maxCol + 1 + REGION_INSET;
  const y0 = bounds.minRow - REGION_INSET;
  const y1 = bounds.maxRow + REGION_INSET;
  return [
    { x: x0, y: y0, xend: x1, yend: y0 },
    { x: x1, y: y0, xend: x1, yend: y1 },
    { x: x1, y: y1, xend: x0, yend: y1 },
    { x: x0, y: y1, xend: x0, yend: y0 },
  ];
}

const pointLayer = (
  builder: Builder,
  data: PlateCell[],
  input: PlateSpecInput,
  options: { color?: string; byValue?: boolean },
): Builder => {
  if (data.length === 0) return builder;
  const aes = options.byValue
    ? { x: "x" as const, y: "y" as const, color: "value" }
    : { x: "x" as const, y: "y" as const };
  return builder.point({
    data,
    aes,
    ...(options.color === undefined ? {} : { color: options.color }),
    size: input.markerRadius,
    shape: input.markerShape,
  });
};

const addHeatLayers = (builder: Builder, input: PlateSpecInput): Builder => {
  const filled = input.cells.filter((cell) => cell.value !== null);
  const empty = input.cells.filter((cell) => cell.value === null);
  const withValues = pointLayer(builder, filled, input, { byValue: true });
  return pointLayer(withValues, empty, input, { color: input.emptyWellColor });
};

const addCategoryLayers = (builder: Builder, input: PlateSpecInput): Builder =>
  input.categories.reduce(
    (acc, category) =>
      pointLayer(
        acc,
        input.cells.filter((cell) => cell.category === category),
        input,
        { color: input.categoryColors[category] || input.emptyWellColor },
      ),
    builder,
  );

const addRegionLayers = (builder: Builder, regions: readonly PlateRegion[]): Builder =>
  regions.reduce(
    (acc, region) =>
      acc.segment({
        data: regionSegments(region.bounds),
        aes: { x: "x", y: "y", xend: "xend", yend: "yend" },
        color: region.color,
        linewidth: region.width,
        arrow: false,
        showLegend: false,
      }),
    builder,
  );

/** Tick labels for an axis, keyed by each position's number. The first position is `offset`. */
const axisLabels = (labels: readonly (string | number)[], offset: number): Record<string, string> =>
  Object.fromEntries(labels.map((label, index) => [String(index + offset), String(label)]));

/** Round colour-bar breaks inside the range, on a step of 1, 2 or 5 times a power of ten. */
export function colorBreaks(min: number, max: number, targetCount = 6): number[] {
  if (!(max > min)) return [min];
  const rough = (max - min) / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? magnitude * 10;
  const first = Math.ceil(min / step) * step;
  const breaks: number[] = [];
  for (let value = first; value <= max; value += step) breaks.push(Number(value.toPrecision(12)));
  return breaks;
}

/** A colour-bar label as the Plotly charts wrote it: thousands as `25k`, then the unit. */
const THOUSAND = 1000;

export function colorLabel(value: number, valueUnit: string): string {
  const shown =
    Math.abs(value) >= THOUSAND ? `${Number((value / THOUSAND).toFixed(1))}k` : String(Number(value.toFixed(1)));
  return `${shown}${valueUnit}`;
}

const positions = (count: number, offset: number): number[] => Array.from({ length: count }, (_, i) => i + offset);

/** Builds the ts-lib-viz spec for a plate: one point per well, then the region outlines. */
export function buildPlateSpec(input: PlateSpecInput): ChartSpec {
  const base: Builder = plot(input.cells, { x: "x", y: "y" });
  const coloured = input.mode === "categorical" ? addCategoryLayers(base, input) : addHeatLayers(base, input);
  const outlined = addRegionLayers(coloured, input.regions);
  const heatScale =
    input.mode === "heatmap"
      ? (() => {
          const breaks = colorBreaks(input.zMin, input.zMax);
          return {
            color: {
              title: input.legendTitle,
              limits: [input.zMin, input.zMax] as const,
              breaks,
              labels: Object.fromEntries(breaks.map((value) => [String(value), colorLabel(value, input.valueUnit)])),
            },
          };
        })()
      : {};
  const spec = outlined
    .labs({ headline: input.title })
    .scales({
      x: {
        title: input.xTitle ?? "",
        limits: [HALF_CELL, input.columns + HALF_CELL],
        breaks: positions(input.columns, 1),
        labels: axisLabels(input.colLabels, 1),
        grid: false,
      },
      y: {
        title: input.yTitle ?? "",
        limits: [-HALF_CELL, input.rows - HALF_CELL],
        breaks: positions(input.rows, 0),
        labels: axisLabels(input.rowLabels, 0),
        reverse: true,
        grid: false,
      },
      ...heatScale,
    })
    .legend({
      position: input.mode === "heatmap" ? input.legendPosition : "none",
      // A side legend runs the colour bar tall, as the Plotly colour bar did.
      direction: input.legendPosition === "left" || input.legendPosition === "right" ? "vertical" : "horizontal",
    })
    .spec();
  // The tooltip names the well through the chart key and adds its hover text.
  return { ...spec, tooltip: ["details"] };
}
