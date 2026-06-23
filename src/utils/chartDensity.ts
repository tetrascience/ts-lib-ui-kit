/**
 * Chart density presets.
 *
 * Charts ship defaults tuned for a single hero/stage chart. `"compact"` trims
 * the title, tick, and axis-title fonts so the same chart reads well inside a
 * dense dashboard tile (~600×260), where the comfortable defaults would spend
 * most of the canvas on chrome. `"comfortable"` is the default and preserves
 * the original visual identity for existing consumers.
 */
export type ChartDensity = "comfortable" | "compact";

export interface ChartDensityTokens {
  /** Plotly layout title font size */
  titleFontSize: number;
  /** Axis tick label font size */
  tickFontSize: number;
  /** Axis title font size */
  axisTitleFontSize: number;
}

const COMFORTABLE: ChartDensityTokens = {
  titleFontSize: 32,
  tickFontSize: 16,
  axisTitleFontSize: 16,
};

const COMPACT: ChartDensityTokens = {
  titleFontSize: 14,
  tickFontSize: 11,
  axisTitleFontSize: 12,
};

/**
 * Compact axis-title standoff (gap between the axis title and its ticks).
 * Comfortable standoffs vary per chart/axis, so callers keep their own
 * comfortable value and only swap to this in compact mode.
 */
export const COMPACT_AXIS_TITLE_STANDOFF = 8;

/**
 * Compact margin shared by the cartesian charts, replacing the ~80px hero
 * margins so the plot area fills the tile. Sized to leave just enough room for
 * the compact axis titles + ticks while keeping the plot area above ~65% of a
 * 600×260 tile (the dashboard-tile target from SW-1892).
 */
export const COMPACT_CHART_MARGIN = { l: 44, r: 16, b: 36, t: 30, pad: 0 };

/**
 * Resolve the font-size tokens for a density. Accepts `undefined` (treated as
 * comfortable) so it can be called directly with an optional `density?` prop.
 */
export const chartDensityTokens = (
  density?: ChartDensity,
): ChartDensityTokens => (density === "compact" ? COMPACT : COMFORTABLE);
