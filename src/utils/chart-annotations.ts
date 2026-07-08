/**
 * Shared annotation layer for charts — threshold/reference lines and shaded
 * bands, rendered as themed Plotly layout `shapes` and `annotations`.
 *
 * This is an opt-in enabler consumed by chart components (Histogram,
 * InteractiveScatter, …). Consumers pass `referenceLines` / `bands` props;
 * the chart calls {@link buildChartAnnotations} with its resolved theme and
 * merges the result into the Plotly layout.
 *
 * @example
 * ```ts
 * const { shapes, annotations } = buildChartAnnotations(theme, {
 *   referenceLines: [{ axis: "x", value: 0.7, label: "cutoff" }],
 *   bands: [{ axis: "y", from: -3, to: 3, label: "±3σ" }],
 * });
 * const layout = { ...base, shapes, annotations };
 * ```
 */
import type { PlotlyThemeColors } from "@/hooks/use-plotly-theme";

/** Axis a reference line / band is measured against. */
export type AnnotationAxis = "x" | "y";

/** Dash style for a reference line (maps to Plotly's `line.dash`). */
export type ReferenceLineDash =
  | "solid"
  | "dot"
  | "dash"
  | "longdash"
  | "dashdot"
  | "longdashdot";

/**
 * A threshold / reference line drawn across the full plot area.
 *
 * `axis: "x"` draws a **vertical** line at the given x `value`; `axis: "y"`
 * draws a **horizontal** line at the given y `value`. The line always spans the
 * opposite axis in full (via a `paper` reference), so it stays visible as the
 * data range changes.
 */
export interface ReferenceLine {
  /** Axis the `value` is measured on. `"x"` → vertical line, `"y"` → horizontal line. */
  axis: AnnotationAxis;
  /** Position of the line, in data coordinates on `axis`. */
  value: number;
  /** Optional text tag rendered on the line (themed for light/dark). */
  label?: string;
  /** Line color. Defaults to a theme-aware neutral that reads in both modes. */
  color?: string;
  /** Line width in pixels. @default 2 */
  width?: number;
  /** Dash style. @default "dash" */
  dash?: ReferenceLineDash;
}

/**
 * A shaded band (pass/fail region, ±σ envelope, …) spanning a from–to range on
 * one axis and the full extent of the other.
 *
 * `axis: "x"` shades a **vertical** slab between two x values; `axis: "y"`
 * shades a **horizontal** slab between two y values. `from`/`to` may be given in
 * either order.
 */
export interface Band {
  /** Axis the `from`/`to` bounds are measured on. */
  axis: AnnotationAxis;
  /** One edge of the band, in data coordinates on `axis`. */
  from: number;
  /** The other edge of the band, in data coordinates on `axis`. */
  to: number;
  /** Optional text tag rendered on the band (themed for light/dark). */
  label?: string;
  /** Fill color. Defaults to a theme-aware neutral. */
  color?: string;
  /** Fill opacity (0–1). @default 0.12 */
  opacity?: number;
}

/** Opt-in annotation-layer configuration accepted by chart components. */
export interface ChartAnnotationsConfig {
  /** Threshold / reference lines to overlay. */
  referenceLines?: ReferenceLine[];
  /** Shaded from–to bands to overlay. */
  bands?: Band[];
}

/** Plotly layout fragments produced by {@link buildChartAnnotations}. */
export interface ChartAnnotationLayer {
  shapes: Partial<Plotly.Shape>[];
  annotations: Partial<Plotly.Annotations>[];
}

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_LINE_DASH: ReferenceLineDash = "dash";
const DEFAULT_BAND_OPACITY = 0.12;

/**
 * Solid backing color for label tags, chosen for legibility in each theme.
 * The chart's paper background is transparent, so annotation labels need their
 * own opaque-ish fill to stay readable over bars, points, and grid lines.
 */
const labelBackground = (theme: PlotlyThemeColors): string =>
  theme.isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)";

/** Theme-aware default color for reference lines and bands. */
const neutralColor = (theme: PlotlyThemeColors): string => theme.textColor;

/**
 * Shared label styling so every tag reads consistently and legibly in both
 * light and dark mode. The tag's border echoes the line/band color, tying the
 * label to what it annotates.
 */
const labelStyle = (
  theme: PlotlyThemeColors,
  borderColor: string,
): Partial<Plotly.Annotations> => ({
  showarrow: false,
  font: {
    family: "Inter, sans-serif",
    size: 12,
    color: theme.textColor,
  },
  bgcolor: labelBackground(theme),
  bordercolor: borderColor,
  borderwidth: 1,
  borderpad: 3,
});

const referenceLineShape = (
  line: ReferenceLine,
  color: string,
): Partial<Plotly.Shape> => {
  const lineStyle = {
    color,
    width: line.width ?? DEFAULT_LINE_WIDTH,
    dash: line.dash ?? DEFAULT_LINE_DASH,
  };

  // Vertical line (x): fixed x, spans full height via a paper y-reference.
  // Horizontal line (y): fixed y, spans full width via a paper x-reference.
  // `layer: "above"` keeps the threshold visible over bars/markers.
  if (line.axis === "x") {
    return {
      type: "line",
      xref: "x",
      yref: "paper",
      x0: line.value,
      x1: line.value,
      y0: 0,
      y1: 1,
      line: lineStyle,
      layer: "above",
    };
  }
  return {
    type: "line",
    xref: "paper",
    yref: "y",
    x0: 0,
    x1: 1,
    y0: line.value,
    y1: line.value,
    line: lineStyle,
    layer: "above",
  };
};

const referenceLineLabel = (
  line: ReferenceLine,
  color: string,
  theme: PlotlyThemeColors,
): Partial<Plotly.Annotations> => {
  if (line.axis === "x") {
    // Sit just above the top edge of the plot area, centered on the line.
    return {
      ...labelStyle(theme, color),
      text: line.label,
      xref: "x",
      yref: "paper",
      x: line.value,
      y: 1,
      xanchor: "center",
      yanchor: "bottom",
    };
  }
  // Pin to the right edge of the plot area, centered on the line.
  return {
    ...labelStyle(theme, color),
    text: line.label,
    xref: "paper",
    yref: "y",
    x: 1,
    y: line.value,
    xanchor: "right",
    yanchor: "middle",
  };
};

const bandShape = (band: Band, color: string): Partial<Plotly.Shape> => {
  const low = Math.min(band.from, band.to);
  const high = Math.max(band.from, band.to);
  const fill = {
    type: "rect" as const,
    fillcolor: color,
    opacity: band.opacity ?? DEFAULT_BAND_OPACITY,
    line: { width: 0 },
    // Sit behind the data so bars/markers stay readable on top of the band.
    layer: "below" as const,
  };

  // Vertical slab (x): bounded in x, full height via paper y-reference.
  // Horizontal slab (y): bounded in y, full width via paper x-reference.
  if (band.axis === "x") {
    return { ...fill, xref: "x", yref: "paper", x0: low, x1: high, y0: 0, y1: 1 };
  }
  return { ...fill, xref: "paper", yref: "y", x0: 0, x1: 1, y0: low, y1: high };
};

const bandLabel = (
  band: Band,
  color: string,
  theme: PlotlyThemeColors,
): Partial<Plotly.Annotations> => {
  const mid = (band.from + band.to) / 2;
  if (band.axis === "x") {
    return {
      ...labelStyle(theme, color),
      text: band.label,
      xref: "x",
      yref: "paper",
      x: mid,
      y: 1,
      xanchor: "center",
      yanchor: "bottom",
    };
  }
  return {
    ...labelStyle(theme, color),
    text: band.label,
    xref: "paper",
    yref: "y",
    x: 1,
    y: mid,
    xanchor: "right",
    yanchor: "middle",
  };
};

/**
 * Build Plotly `shapes` and `annotations` for an opt-in annotation layer.
 *
 * Bands are emitted before reference lines so lines render on top of any
 * overlapping band. Labels are only produced when a `label` is provided.
 *
 * @param theme  Resolved Plotly theme (from `usePlotlyTheme`) for legible defaults.
 * @param config Reference lines and bands to render.
 * @returns `{ shapes, annotations }` to spread into a Plotly layout.
 */
export function buildChartAnnotations(
  theme: PlotlyThemeColors,
  config: ChartAnnotationsConfig = {},
): ChartAnnotationLayer {
  const { referenceLines = [], bands = [] } = config;
  const fallback = neutralColor(theme);

  const shapes: Partial<Plotly.Shape>[] = [];
  const annotations: Partial<Plotly.Annotations>[] = [];

  for (const band of bands) {
    const color = band.color ?? fallback;
    shapes.push(bandShape(band, color));
    if (band.label) {
      annotations.push(bandLabel(band, color, theme));
    }
  }

  for (const line of referenceLines) {
    const color = line.color ?? fallback;
    shapes.push(referenceLineShape(line, color));
    if (line.label) {
      annotations.push(referenceLineLabel(line, color, theme));
    }
  }

  return { shapes, annotations };
}
