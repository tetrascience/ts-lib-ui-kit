/**
 * Minimal structural view of a Plotly hover point — covers cartesian, pie,
 * and heatmap traces without depending on Plotly's loose event typings.
 */
export interface ChartTooltipHoverPoint {
  x?: number | string;
  y?: number | string;
  z?: number;
  /** Pie slice label */
  label?: string;
  /** Pie slice value */
  value?: number;
  /** Pie slice raw value (Plotly's `v` alias) */
  v?: number;
  /** Pie slice percentage (0–100) */
  percent?: number;
  /** Per-point hover text (e.g. PlateMap wells), lines separated by `<br>` */
  text?: string;
  pointIndex?: number;
  data?: { name?: string };
  /** Hovered point bounds in plot-div pixels (provided by Plotly) */
  bbox?: { x0: number; x1: number; y0: number; y1: number };
}

const formatValue = (value: number | string): string => {
  if (typeof value !== "number") return String(value);
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const pieLines = (point: ChartTooltipHoverPoint): string[] => {
  const lines = [
    String(point.label),
    `Value: ${formatValue((point.value ?? point.v)!)}`,
  ];
  if (typeof point.percent === "number") {
    lines.push(`${point.percent.toFixed(1)}%`);
  } else if (typeof point.text === "string" && point.text.endsWith("%")) {
    lines.push(point.text);
  }
  return lines;
};

/** Unified hover across multiple traces: shared x, one line per trace */
const unifiedLines = (
  points: ChartTooltipHoverPoint[],
  xLabel: string,
): string[] => {
  const [first] = points;
  const lines =
    first.x === undefined ? [] : [`${xLabel}: ${formatValue(first.x)}`];
  for (const point of points) {
    if (point.y === undefined) continue;
    lines.push(`${point.data?.name ?? "Series"}: ${formatValue(point.y)}`);
  }
  return lines;
};

const cartesianLines = (
  point: ChartTooltipHoverPoint,
  xLabel: string,
  yLabel: string,
): string[] => {
  const lines: string[] = [];
  if (point.data?.name) lines.push(point.data.name);
  if (point.x !== undefined) lines.push(`${xLabel}: ${formatValue(point.x)}`);
  if (point.y !== undefined) lines.push(`${yLabel}: ${formatValue(point.y)}`);
  if (point.z !== undefined) lines.push(`Value: ${formatValue(point.z)}`);
  return lines;
};

/**
 * Build default tooltip lines from Plotly hover points. Handles pie slices,
 * text-carrying traces (e.g. PlateMap wells), single cartesian points, and
 * unified multi-trace hovers.
 */
export function chartTooltipLines(
  points: ChartTooltipHoverPoint[],
  labels?: { xLabel?: string; yLabel?: string },
): string[] {
  if (points.length === 0) return [];
  const [first] = points;

  // Pie hover points carry label/value without axis coordinates; bar points
  // also alias label/value but always have x/y
  if (
    first.label !== undefined &&
    (first.value ?? first.v) !== undefined &&
    first.x === undefined &&
    first.y === undefined
  ) {
    return pieLines(first);
  }

  // Traces that carry their own hover text (e.g. PlateMap wells)
  if (typeof first.text === "string" && first.text.length > 0) {
    return first.text.split("<br>").filter(Boolean);
  }

  const xLabel = labels?.xLabel || "X";
  const yLabel = labels?.yLabel || "Y";
  return points.length > 1
    ? unifiedLines(points, xLabel)
    : cartesianLines(first, xLabel, yLabel);
}
