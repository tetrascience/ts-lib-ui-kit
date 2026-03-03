import { useMemo } from "react";

import { useIsDark } from "@/hooks/use-is-dark";

/**
 * Plotly theme configuration returned by usePlotlyTheme.
 * Spread into a Plotly layout to apply dark/light mode colors.
 */
export interface PlotlyThemeColors {
  /** Background color for the paper area */
  paperBg: string;
  /** Background color for the plot area */
  plotBg: string;
  /** Primary text color (titles, ticks) */
  textColor: string;
  /** Secondary text color (axis titles, subtitles) */
  textSecondary: string;
  /** Grid line color */
  gridColor: string;
  /** Axis line color */
  lineColor: string;
  /** Tick mark color */
  tickColor: string;
  /** Legend text color */
  legendColor: string;
  /** Spike/crosshair line color */
  spikeColor: string;
  /** Whether dark mode is active */
  isDark: boolean;
}

const LIGHT_THEME: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "rgba(26, 26, 26, 1)",
  textSecondary: "rgba(26, 26, 26, 0.6)",
  gridColor: "rgba(225, 231, 239, 1)",
  lineColor: "rgba(26, 26, 26, 1)",
  tickColor: "rgba(225, 231, 239, 1)",
  legendColor: "rgba(4, 38, 63, 1)",
  spikeColor: "rgba(100, 116, 139, 1)",
  isDark: false,
};

const DARK_THEME: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "rgba(255, 255, 255, 0.9)",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  gridColor: "rgba(51, 65, 86, 1)",
  lineColor: "rgba(158, 172, 192, 1)",
  tickColor: "rgba(51, 65, 86, 1)",
  legendColor: "rgba(200, 214, 229, 1)",
  spikeColor: "rgba(158, 172, 192, 1)",
  isDark: true,
};

/**
 * Hook that returns Plotly color tokens for the current light/dark theme.
 *
 * @example
 * ```tsx
 * const theme = usePlotlyTheme();
 * const layout = {
 *   paper_bgcolor: theme.paperBg,
 *   plot_bgcolor: theme.plotBg,
 *   font: { color: theme.textColor },
 * };
 * ```
 */
export function usePlotlyTheme(): PlotlyThemeColors {
  const isDark = useIsDark();
  return useMemo(() => (isDark ? DARK_THEME : LIGHT_THEME), [isDark]);
}
