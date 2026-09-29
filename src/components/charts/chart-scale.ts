/**
 * Shared sizing rules for the cartesian charts (AreaPlot, BarChart, BoxPlot).
 *
 * Their chrome is tuned for dashboard-sized canvases: 16px tick labels, 80px
 * side margins, a 32px title. Below a few hundred pixels that fixed chrome
 * eats most of the canvas — y-tick labels pile onto each other and the legend
 * grows a scrollbar (SW-2298). Charts switch to the compact scale here so the
 * plot area stays legible in small tiles.
 */

/** Heights below this switch to the compact scale */
export const COMPACT_HEIGHT_PX = 360;
/** Widths below this switch to the compact scale */
export const COMPACT_WIDTH_PX = 480;

export interface ChartScale {
  tickFontSize: number;
  ticklen: number;
  axisTitleFontSize: number;
  axisTitleStandoff: number;
  legendFontSize: number;
  legendLineHeight: number;
  titleFontSize: number;
  margin: {
    l: number;
    r: number;
    b: number;
    /** Top margin when a title is rendered */
    tTitle: number;
    /** Top margin without a title */
    tNoTitle: number;
  };
}

export const REGULAR_SCALE: ChartScale = {
  tickFontSize: 16,
  ticklen: 12,
  axisTitleFontSize: 16,
  axisTitleStandoff: 15,
  legendFontSize: 13,
  legendLineHeight: 18,
  titleFontSize: 32,
  // Bottom margin reserves room for tick labels, the x-axis title, and the
  // container-anchored bottom legend stacked beneath them (SW-2157).
  margin: { l: 80, r: 40, b: 96, tTitle: 80, tNoTitle: 40 },
};

export const COMPACT_SCALE: ChartScale = {
  tickFontSize: 11,
  ticklen: 6,
  axisTitleFontSize: 12,
  axisTitleStandoff: 8,
  legendFontSize: 11,
  legendLineHeight: 14,
  titleFontSize: 18,
  margin: { l: 48, r: 16, b: 76, tTitle: 36, tNoTitle: 12 },
};

export const isCompactHeight = (height: number): boolean => height < COMPACT_HEIGHT_PX;
export const isCompactWidth = (width: number): boolean => width < COMPACT_WIDTH_PX;

/** True when either dimension is below its compact threshold */
export function isCompactChart(width: number, height: number): boolean {
  return isCompactHeight(height) || isCompactWidth(width);
}

// Mixed scales are cached per `regular` so repeated calls return the same
// object: charts list the scale in effect dependencies, and a fresh object
// every render would re-plot every render.
const mixedScaleCache = new WeakMap<ChartScale, Map<"short" | "narrow", ChartScale>>();

/**
 * Pick the scale for a canvas size. `regular` lets a chart keep its own
 * full-size values (e.g. BarChart's larger legend) while sharing the compact
 * fallback.
 *
 * Short and narrow are judged separately: a 1200×300 dashboard strip is short
 * but not narrow, so it gets compact fonts and top/bottom margins while keeping
 * the full left/right margins — vertical chrome follows height, horizontal
 * chrome follows width.
 */
export function resolveChartScale(
  width: number,
  height: number,
  regular: ChartScale = REGULAR_SCALE,
): ChartScale {
  const short = isCompactHeight(height);
  const narrow = isCompactWidth(width);
  if (!short && !narrow) return regular;
  if (short && narrow) return COMPACT_SCALE;

  const key = short ? "short" : "narrow";
  let cache = mixedScaleCache.get(regular);
  if (!cache) {
    cache = new Map();
    mixedScaleCache.set(regular, cache);
  }
  let scale = cache.get(key);
  if (!scale) {
    const vertical = short ? COMPACT_SCALE : regular;
    const horizontal = narrow ? COMPACT_SCALE : regular;
    scale = {
      ...vertical,
      margin: { ...vertical.margin, l: horizontal.margin.l, r: horizontal.margin.r },
    };
    cache.set(key, scale);
  }
  return scale;
}

/**
 * Approximate vertical room one y-tick label needs (font size plus breathing
 * space) so labels never touch.
 */
export const Y_TICK_LABEL_SPACING = 2.2;

/** How many labels fit along `extentPx` at `labelPx` each (never fewer than 2) */
export function maxTickCount(extentPx: number, labelPx: number): number {
  if (labelPx <= 0) return 2;
  return Math.max(2, Math.floor(extentPx / labelPx));
}

/**
 * Evenly drop ticks so at most `maxCount` remain, keeping both the first and
 * the last so the axis extremes stay labelled. Used to stop "nice" tick arrays
 * from stacking on top of each other when the plot area is short.
 */
export function thinTicks<T>(ticks: T[], maxCount: number): T[] {
  // Both ends are always kept, so fewer than two makes no sense
  const limit = Math.max(2, maxCount);
  if (ticks.length <= limit) return ticks;
  const stride = Math.ceil(ticks.length / limit);
  const kept = ticks.filter((_, index) => index % stride === 0);
  const last = ticks[ticks.length - 1];
  // Swap the final kept tick for the true maximum (count stays ≤ maxCount)
  return kept[kept.length - 1] === last ? kept : [...kept.slice(0, -1), last];
}
