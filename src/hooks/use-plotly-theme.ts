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

const LIGHT_FALLBACK: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "#0D1B3E",
  textSecondary: "#526175",
  gridColor: "#E2E8F0",
  lineColor: "#0D1B3E",
  tickColor: "#E2E8F0",
  legendColor: "#0D1B3E",
  spikeColor: "#64748B",
  isDark: false,
};

const DARK_FALLBACK: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "#E5E1E9",
  textSecondary: "#90909B",
  gridColor: "#454650",
  lineColor: "#E5E1E9",
  tickColor: "#454650",
  legendColor: "#E5E1E9",
  spikeColor: "#90909B",
  isDark: true,
};

/**
 * Resolve a CSS custom property to a Plotly-parseable color string.
 * Uses a canvas to normalize modern color functions (oklch, lch, color-mix)
 * into the rgba() form that Plotly's color parser understands.
 */
function resolveToken(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return fallback;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  try {
    ctx.fillStyle = "#000";
    ctx.fillStyle = raw;
    const normalized = ctx.fillStyle;
    return typeof normalized === "string" ? normalized : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Hook that returns Plotly color tokens derived from the design system's
 * semantic CSS variables (`--foreground`, `--muted-foreground`, `--border`).
 * Recomputes when the `.dark` class on `<html>` toggles.
 */
export function usePlotlyTheme(): PlotlyThemeColors {
  const isDark = useIsDark();
  return useMemo(() => {
    const fallback = isDark ? DARK_FALLBACK : LIGHT_FALLBACK;
    return {
      paperBg: "transparent",
      plotBg: "transparent",
      textColor: resolveToken("--foreground", fallback.textColor),
      textSecondary: resolveToken("--muted-foreground", fallback.textSecondary),
      gridColor: resolveToken("--border", fallback.gridColor),
      lineColor: resolveToken("--foreground", fallback.lineColor),
      tickColor: resolveToken("--border", fallback.tickColor),
      legendColor: resolveToken("--foreground", fallback.legendColor),
      spikeColor: resolveToken("--muted-foreground", fallback.spikeColor),
      isDark,
    };
  }, [isDark]);
}
