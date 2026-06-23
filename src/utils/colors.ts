/**
 * Centralized chart color system for TetraScience UI
 * Resolves the CVD-friendly chart palette CSS variables defined in
 * `index.tailwind.css` into Plotly-parseable colors, with TypeScript
 * support and IntelliSense
 */

let colorProbe: CanvasRenderingContext2D | null | undefined;

const OPAQUE_ALPHA = 255;

/**
 * Normalize a CSS color to a hex/rgba string that Plotly (tinycolor) can
 * parse. Tokens are declared in oklch, which tinycolor does not understand,
 * so resolved values are painted onto a 1×1 canvas and read back as sRGB
 * pixel values (the fillStyle getter alone won't do — browsers serialize
 * oklch back as oklch).
 */
const toPlotlySafeColor = (value: string, fallback?: string): string => {
  if (/^(#|rgb)/.test(value)) return value;
  if (colorProbe === undefined) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    colorProbe = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!colorProbe) return fallback || value;
  // An unparseable value leaves the previous fillStyle in place. Assigning it
  // after two different sentinels distinguishes "parsed" (same result twice)
  // from "ignored" (the sentinels leak through) without colliding with any
  // legitimately black/white token.
  colorProbe.fillStyle = "#000";
  colorProbe.fillStyle = value;
  const first = colorProbe.fillStyle;
  colorProbe.fillStyle = "#fff";
  colorProbe.fillStyle = value;
  if (first !== colorProbe.fillStyle) return fallback || value;
  colorProbe.clearRect(0, 0, 1, 1);
  colorProbe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = colorProbe.getImageData(0, 0, 1, 1).data;
  if (a === OPAQUE_ALPHA) {
    return (
      "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
    );
  }
  return `rgba(${r}, ${g}, ${b}, ${(a / OPAQUE_ALPHA).toFixed(3)})`;
};

/**
 * Get a CSS variable value with optional fallback
 * @param cssVar - The CSS variable name (without --)
 * @param fallback - Optional fallback value
 * @returns The CSS variable value or fallback
 */
const getCSSVar = (cssVar: string, fallback?: string): string => {
  if (typeof window !== "undefined") {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--" + cssVar)
      .trim();
    if (!value) return fallback || "";
    return toPlotlySafeColor(value, fallback);
  }
  const fallbackSuffix = fallback ? ", " + fallback : "";
  return "var(--" + cssVar + fallbackSuffix + ")";
};

/**
 * Chart color palette for consistent graph styling.
 *
 * CVD-friendly (deuteranopia / protanopia / tritanopia) categorical palette.
 * Single source of truth is the `--chart-1` … `--chart-12` CSS variables in
 * `index.tailwind.css`; the hex fallbacks below are used during SSR / before
 * the stylesheet resolves. Slots 1–8 are recommended; 9–12 are for sparing use
 * when more than 8 series are needed.
 */
export const CHART_COLORS = [
  getCSSVar("chart-1", "#2F45B5"), // TS Blue 500
  getCSSVar("chart-2", "#FD972F"), // Yellow Flax
  getCSSVar("chart-3", "#038599"), // Forest Green 300
  getCSSVar("chart-4", "#E15759"), // Imperial Red
  getCSSVar("chart-5", "#8243BA"), // Purple 500
  getCSSVar("chart-6", "#94C2FF"), // Light Blue 100
  getCSSVar("chart-7", "#465364"), // Stone Gray 300
  getCSSVar("chart-8", "#F4D03F"), // Soft Yellow
  getCSSVar("chart-9", "#CC79A7"), // Rose Pink
  getCSSVar("chart-10", "#117733"), // Dark Green
  getCSSVar("chart-11", "#88CCEE"), // Sky Blue
  getCSSVar("chart-12", "#882255"), // Wine
] as const;

/**
 * Resolve the color for a data series: use the explicit color when one is
 * provided, otherwise cycle through the {@link CHART_COLORS} palette by series
 * index (wrapping around when there are more series than palette slots).
 *
 * @param index - Zero-based series index
 * @param explicit - Caller-provided color override, if any
 */
export const seriesColor = (index: number, explicit?: string | null): string =>
  explicit ?? CHART_COLORS[index % CHART_COLORS.length];

/**
 * Build a continuous color ramp from the `--chart-{name}-01` … `-12` CSS
 * variables, falling back to the provided hex steps during SSR.
 */
const ramp = (name: string, fallbacks: readonly string[]): string[] =>
  fallbacks.map((hex, i) => getCSSVar(`${name}-${String(i + 1).padStart(2, "0")}`, hex));

/**
 * CVD-friendly sequential ramps (light → dark, anchored on brand).
 * 12 steps each — pass to a chart's colorscale / sequential interpolator.
 * Source of truth: `--chart-seq-*` CSS variables in `index.tailwind.css`.
 */
export const CHART_SEQUENTIAL = {
  blue: ramp("chart-seq-blue", ["#F0F3FC", "#DCE3F8", "#C5D1F2", "#A9BCEC", "#8AA5E4", "#6C8DDB", "#5276D0", "#3D62C5", "#2F45B5", "#27399A", "#1F2D7E", "#172261"]),
  teal: ramp("chart-seq-teal", ["#E8F8FA", "#CFF1F5", "#AFE7EF", "#88DAE6", "#5ECADA", "#34B9CC", "#1AA5BD", "#0BB6D0", "#099DB3", "#08899C", "#067282", "#055A66"]),
  purple: ramp("chart-seq-purple", ["#F8EEFB", "#EFD8F4", "#E3BCEB", "#D49DE0", "#C27CD2", "#AD5DC3", "#9544B0", "#8243BA", "#6E2FA0", "#5A2487", "#481B6E", "#371454"]),
} as const;

/**
 * CVD-friendly diverging ramps (midpoint at step 06/07). Red/green pairings
 * are intentionally avoided (worst for deutan/protan).
 * Source of truth: `--chart-div-*` CSS variables in `index.tailwind.css`.
 */
export const CHART_DIVERGING = {
  blueOrange: ramp("chart-div-blue-orange", ["#1F3D9E", "#2F45B5", "#5276D0", "#7A95DD", "#A9BCEC", "#DCE3F8", "#FCE6CC", "#FACB99", "#F7AE63", "#FD972F", "#D87410", "#A6580A"]),
  tealMagenta: ramp("chart-div-teal-magenta", ["#055A66", "#099DB3", "#34B9CC", "#88DAE6", "#CFF1F5", "#F0FAFB", "#FBEBF3", "#F0C8DE", "#E29EC2", "#CC79A7", "#A85585", "#7E3B62"]),
  purpleYellowGreen: ramp("chart-div-purple-yellowgreen", ["#481B6E", "#8243BA", "#A767D0", "#C593E0", "#E3C5EE", "#F4E6F8", "#F2F7D9", "#DCEB9F", "#B8D266", "#8FB939", "#6E9A1F", "#527516"]),
} as const;

/**
 * Convert a color ramp (e.g. `CHART_SEQUENTIAL.blue`, `CHART_DIVERGING.blueOrange`)
 * into Plotly's colorscale format: evenly spaced [position, color] stops.
 */
export const toPlotlyColorscale = (
  ramp: readonly string[],
): Array<[number, string]> => {
  if (ramp.length === 0) return [];
  if (ramp.length === 1) {
    return [
      [0, ramp[0]],
      [1, ramp[0]],
    ];
  }
  return ramp.map((color, i) => [i / (ramp.length - 1), color]);
};
