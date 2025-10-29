/**
 * Centralized color system for TetraScience UI
 * This utility provides access to CSS variables defined in colors.css
 * while maintaining TypeScript support and IntelliSense
 */

/**
 * Get a CSS variable value with optional fallback
 * @param cssVar - The CSS variable name (without --)
 * @param fallback - Optional fallback value
 * @returns The CSS variable value or fallback
 */
const getCSSVar = (cssVar: string, fallback?: string): string => {
  if (typeof window !== "undefined") {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${cssVar}`)
      .trim();
    return value || fallback || "";
  }
  return `var(--${cssVar}${fallback ? `, ${fallback}` : ""})`;
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
 * Chart color palette for consistent graph styling
 * Uses the primary graph colors from the design system
 */
export const CHART_COLORS = [
  COLORS.ORANGE,
  COLORS.RED,
  COLORS.GREEN,
  COLORS.BLUE,
  COLORS.YELLOW,
  COLORS.PURPLE,
  COLORS.GRAPH_SECONDARY_BROWN,
  COLORS.GRAPH_SECONDARY_PINK,
  COLORS.GRAPH_SECONDARY_TEAL,
  COLORS.GRAPH_SECONDARY_DARK_BLUE,
  COLORS.GRAPH_SECONDARY_BLACK,
  COLORS.GRAPH_SECONDARY_GREY,
] as const;

export type ColorToken = keyof typeof COLORS;
