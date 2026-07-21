/**
 * Shared annotation layer for charts — threshold/reference lines and shaded
 * bands, rendered as themed Plotly layout `shapes`. Labeled lines/bands surface
 * in the chart's legend rather than as on-plot tags.
 *
 * This is an opt-in enabler consumed by chart components (Histogram,
 * InteractiveScatter, …). Consumers pass `referenceLines` / `bands` props;
 * the chart calls {@link buildChartAnnotations} with its resolved theme, merges
 * the `shapes` into the Plotly layout, and renders the `legendItems` in its
 * legend (via {@link annotationLegendTraces} for charts that use Plotly's
 * legend, or directly for charts with a custom legend).
 *
 * @example
 * ```ts
 * const { shapes, legendItems } = buildChartAnnotations(theme, {
 *   referenceLines: [{ axis: "x", value: 0.7, label: "cutoff" }],
 *   bands: [{ axis: "y", from: -3, to: 3, label: "±3σ" }],
 * });
 * const layout = { ...base, shapes, showlegend: legendItems.length > 0 };
 * const data = [...traces, ...annotationLegendTraces(legendItems)];
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
  /** Optional label; shown as a legend item when provided. */
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
  /** Optional label; shown as a legend item when provided. */
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

/** Kind of annotation a legend entry represents. */
export type AnnotationLegendKind = "line" | "band";

/**
 * A chart-agnostic legend entry for a labeled reference line or band. Charts
 * render these in whatever legend they own — via {@link annotationLegendTraces}
 * for Plotly's legend, or directly for a custom (HTML) legend.
 */
export interface AnnotationLegendItem {
  /** Label text shown in the legend. */
  label: string;
  /** Swatch color (the line/band color). */
  color: string;
  /** Whether the swatch reads as a line or a filled band. */
  kind: AnnotationLegendKind;
  /** Dash style for `"line"` swatches. */
  dash?: ReferenceLineDash;
  /** Line width for `"line"` swatches. */
  width?: number;
  /** Fill opacity for `"band"` swatches. */
  opacity?: number;
}

/** Output of {@link buildChartAnnotations}. */
export interface ChartAnnotationLayer {
  /** Plotly layout shapes for the lines/bands. Spread into `layout.shapes`. */
  shapes: Partial<Plotly.Shape>[];
  /** Legend entries for labeled lines/bands, in draw order (bands then lines). */
  legendItems: AnnotationLegendItem[];
}

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_LINE_DASH: ReferenceLineDash = "dash";
const DEFAULT_BAND_OPACITY = 0.12;
/** Legend swatch opacity floor so faint bands stay visible in the legend. */
const LEGEND_BAND_OPACITY_MIN = 0.35;

/** Theme-aware default color for reference lines and bands. */
const neutralColor = (theme: PlotlyThemeColors): string => theme.textColor;

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

/**
 * Build Plotly `shapes` and legend entries for an opt-in annotation layer.
 *
 * Bands are emitted before reference lines so lines render on top of any
 * overlapping band. Legend items are only produced when a `label` is provided.
 *
 * @param theme  Resolved Plotly theme (from `usePlotlyTheme`) for legible defaults.
 * @param config Reference lines and bands to render.
 * @returns `{ shapes, legendItems }`.
 */
export function buildChartAnnotations(
  theme: PlotlyThemeColors,
  config: ChartAnnotationsConfig = {},
): ChartAnnotationLayer {
  const { referenceLines = [], bands = [] } = config;
  const fallback = neutralColor(theme);

  const shapes: Partial<Plotly.Shape>[] = [];
  const legendItems: AnnotationLegendItem[] = [];

  for (const band of bands) {
    const color = band.color ?? fallback;
    shapes.push(bandShape(band, color));
    if (band.label) {
      legendItems.push({
        label: band.label,
        color,
        kind: "band",
        opacity: band.opacity ?? DEFAULT_BAND_OPACITY,
      });
    }
  }

  for (const line of referenceLines) {
    const color = line.color ?? fallback;
    shapes.push(referenceLineShape(line, color));
    if (line.label) {
      legendItems.push({
        label: line.label,
        color,
        kind: "line",
        dash: line.dash ?? DEFAULT_LINE_DASH,
        width: line.width ?? DEFAULT_LINE_WIDTH,
      });
    }
  }

  return { shapes, legendItems };
}

/**
 * Convert {@link AnnotationLegendItem}s into legend-only Plotly traces (no data
 * points, so nothing is drawn on the plot — they exist purely to add a swatch +
 * label to Plotly's legend). Use with charts that render Plotly's own legend.
 *
 * Reference lines become a line swatch (matching color/width/dash); bands
 * become a filled square swatch. The band swatch opacity is floored so faint
 * fills remain visible at legend size.
 */
export function annotationLegendTraces(
  legendItems: AnnotationLegendItem[],
): Partial<Plotly.Data>[] {
  return legendItems.map((item) =>
    item.kind === "line"
      ? {
          x: [null],
          y: [null],
          type: "scatter",
          mode: "lines",
          name: item.label,
          line: { color: item.color, width: item.width ?? DEFAULT_LINE_WIDTH, dash: item.dash },
          showlegend: true,
          hoverinfo: "skip",
        }
      : {
          x: [null],
          y: [null],
          type: "scatter",
          mode: "markers",
          name: item.label,
          marker: {
            color: item.color,
            symbol: "square",
            size: 12,
            opacity: Math.max(item.opacity ?? DEFAULT_BAND_OPACITY, LEGEND_BAND_OPACITY_MIN),
          },
          showlegend: true,
          hoverinfo: "skip",
        },
  );
}
