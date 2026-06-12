/**
 * Centralized color system for TetraScience UI
 * This utility provides access to CSS variables defined in colors.css
 * while maintaining TypeScript support and IntelliSense
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
  colorProbe.fillStyle = "#000";
  colorProbe.fillStyle = value;
  // An unparseable value leaves the sentinel in place — prefer the fallback
  if (colorProbe.fillStyle === "#000000" && fallback) return fallback;
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
 * Centralized color tokens that map to CSS variables
 * This provides TypeScript support while leveraging CSS custom properties
 */
export const COLORS = {
  // Black scale
  BLACK_50: getCSSVar("black-50", "rgba(26, 26, 26, 0.05)"),
  BLACK_100: getCSSVar("black-100", "rgba(26, 26, 26, 0.1)"),
  BLACK_200: getCSSVar("black-200", "rgba(26, 26, 26, 0.2)"),
  BLACK_300: getCSSVar("black-300", "rgba(26, 26, 26, 0.3)"),
  BLACK_400: getCSSVar("black-400", "rgba(26, 26, 26, 0.4)"),
  BLACK_500: getCSSVar("black-500", "rgba(26, 26, 26, 0.5)"),
  BLACK_600: getCSSVar("black-600", "rgba(26, 26, 26, 0.6)"),
  BLACK_700: getCSSVar("black-700", "rgba(26, 26, 26, 0.7)"),
  BLACK_800: getCSSVar("black-800", "rgba(26, 26, 26, 0.8)"),
  BLACK_900: getCSSVar("black-900", "rgba(26, 26, 26, 1)"),

  // Legacy aliases for backwards compatibility
  BLACK: getCSSVar("black-900", "#1a1a1a"),
  BLACK_OPACITY_20: "rgba(26, 26, 26, 0.2)", // Custom opacity not in CSS vars

  // White scale
  WHITE_50: getCSSVar("white-50", "rgba(255, 255, 255, 0.05)"),
  WHITE_100: getCSSVar("white-100", "rgba(255, 255, 255, 0.1)"),
  WHITE_200: getCSSVar("white-200", "rgba(255, 255, 255, 0.2)"),
  WHITE_300: getCSSVar("white-300", "rgba(255, 255, 255, 0.3)"),
  WHITE_400: getCSSVar("white-400", "rgba(255, 255, 255, 0.4)"),
  WHITE_500: getCSSVar("white-500", "rgba(255, 255, 255, 0.5)"),
  WHITE_600: getCSSVar("white-600", "rgba(255, 255, 255, 0.6)"),
  WHITE_700: getCSSVar("white-700", "rgba(255, 255, 255, 0.7)"),
  WHITE_800: getCSSVar("white-800", "rgba(255, 255, 255, 0.8)"),
  WHITE_900: getCSSVar("white-900", "rgba(255, 255, 255, 1)"),

  // Legacy alias
  WHITE: getCSSVar("white-900", "#ffffff"),

  // Blue scale
  BLUE_50: getCSSVar("blue-50", "rgba(240, 249, 255, 1)"),
  BLUE_100: getCSSVar("blue-100", "rgba(225, 243, 254, 1)"),
  BLUE_200: getCSSVar("blue-200", "rgba(185, 229, 252, 1)"),
  BLUE_300: getCSSVar("blue-300", "rgba(125, 211, 251, 1)"),
  BLUE_400: getCSSVar("blue-400", "rgba(58, 190, 247, 1)"),
  BLUE_500: getCSSVar("blue-500", "rgba(27, 173, 240, 1)"),
  BLUE_600: getCSSVar("blue-600", "rgba(64, 114, 210, 1)"),
  BLUE_700: getCSSVar("blue-700", "rgba(3, 105, 159, 1)"),
  BLUE_800: getCSSVar("blue-800", "rgba(5, 69, 103, 1)"),
  BLUE_900: getCSSVar("blue-900", "rgba(4, 38, 63, 1)"),

  // Legacy alias
  BLUE: getCSSVar("graph-primary-blue", "#2D9CDB"),

  // Grey scale
  GREY_50: getCSSVar("grey-50", "rgba(248, 250, 252, 1)"),
  GREY_100: getCSSVar("grey-100", "rgba(241, 245, 249, 1)"),
  GREY_200: getCSSVar("grey-200", "rgba(225, 231, 239, 1)"),
  GREY_300: getCSSVar("grey-300", "rgba(200, 214, 229, 1)"),
  GREY_400: getCSSVar("grey-400", "rgba(158, 172, 192, 1)"),
  GREY_500: getCSSVar("grey-500", "rgba(100, 116, 139, 1)"),
  GREY_600: getCSSVar("grey-600", "rgba(72, 86, 106, 1)"),
  GREY_700: getCSSVar("grey-700", "rgba(51, 65, 86, 1)"),
  GREY_800: getCSSVar("grey-800", "rgba(29, 40, 57, 1)"),
  GREY_900: getCSSVar("grey-900", "rgba(20, 30, 53, 1)"),

  // Legacy alias
  GREY: getCSSVar("grey-400", "#CCCCCC"),

  // Graph primary colors
  ORANGE: getCSSVar("graph-primary-orange", "#FFA62E"),
  RED: getCSSVar("graph-primary-red", "#FF5C64"),
  GREEN: getCSSVar("graph-primary-green", "#A5C34E"),
  YELLOW: getCSSVar("graph-primary-yellow", "#FBED53"),
  PURPLE: getCSSVar("graph-primary-purple", "#7A51AB"),

  // Semantic colors
  GREEN_BG: getCSSVar("green-bg", "rgba(234, 254, 229, 1)"),
  GREEN_SUCCESS: getCSSVar("green-success", "rgba(8, 173, 55, 1)"),
  ORANGE_BG: getCSSVar("orange-bg", "rgba(254, 250, 229, 1)"),
  ORANGE_CAUTION: getCSSVar("orange-caution", "rgba(249, 173, 20, 1)"),
  RED_BG: getCSSVar("red-bg", "rgba(254, 234, 229, 1)"),
  RED_ERROR: getCSSVar("red-error", "rgba(216, 35, 44, 1)"),

  // Graph secondary colors
  GRAPH_SECONDARY_BROWN: getCSSVar("graph-secondary-brown", "#AD7942"),
  GRAPH_SECONDARY_PINK: getCSSVar("graph-secondary-pink", "#FB90B4"),
  GRAPH_SECONDARY_TEAL: getCSSVar("graph-secondary-teal", "#3CCABA"),
  GRAPH_SECONDARY_DARK_BLUE: getCSSVar("graph-secondary-dark-blue", "#4072D2"),
  GRAPH_SECONDARY_BLACK: getCSSVar("graph-secondary-black", "#424E62"),
  GRAPH_SECONDARY_GREY: getCSSVar("graph-secondary-grey", "#B4B4B4"),
} as const;

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
): Array<[number, string]> =>
  ramp.map((color, i) => [i / (ramp.length - 1), color]);

export type ColorToken = keyof typeof COLORS;
