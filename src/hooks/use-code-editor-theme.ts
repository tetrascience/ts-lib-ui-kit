import { useMemo } from "react";

import { useIsDark } from "@/hooks/use-is-dark";

/**
 * Code editor theme configuration returned by useCodeEditorTheme.
 * Use these values to configure Monaco Editor theming.
 */
export interface CodeEditorThemeColors {
  /** Monaco theme name to pass to the `theme` prop ("vs" | "vs-dark") */
  monacoTheme: "vs" | "vs-dark";
  /** Editor background color */
  editorBg: string;
  /** Editor foreground / text color */
  editorFg: string;
  /** Line number color */
  lineNumberColor: string;
  /** Active line number color */
  lineNumberActiveColor: string;
  /** Selection background color */
  selectionBg: string;
  /** Gutter / line-number area background */
  gutterBg: string;
  /** Editor border color */
  borderColor: string;
  /** Whether dark mode is active */
  isDark: boolean;
}

const LIGHT_THEME: CodeEditorThemeColors = {
  monacoTheme: "vs",
  editorBg: "#ffffff",
  editorFg: "rgba(26, 26, 26, 1)",
  lineNumberColor: "rgba(26, 26, 26, 0.4)",
  lineNumberActiveColor: "rgba(26, 26, 26, 0.8)",
  selectionBg: "rgba(47, 69, 181, 0.15)",
  gutterBg: "#f9fafb",
  borderColor: "rgba(229, 231, 235, 1)",
  isDark: false,
};

const DARK_THEME: CodeEditorThemeColors = {
  monacoTheme: "vs-dark",
  editorBg: "rgba(20, 30, 53, 1)",
  editorFg: "rgba(255, 255, 255, 0.9)",
  lineNumberColor: "rgba(255, 255, 255, 0.35)",
  lineNumberActiveColor: "rgba(255, 255, 255, 0.7)",
  selectionBg: "rgba(84, 157, 255, 0.2)",
  gutterBg: "rgba(29, 40, 57, 1)",
  borderColor: "rgba(51, 65, 86, 1)",
  isDark: true,
};

/**
 * Hook that returns Monaco Editor color tokens for the current light/dark theme.
 *
 * @example
 * ```tsx
 * const theme = useCodeEditorTheme();
 * <MonacoEditor theme={theme.monacoTheme} />
 * ```
 */
export function useCodeEditorTheme(): CodeEditorThemeColors {
  const isDark = useIsDark();
  return useMemo(() => (isDark ? DARK_THEME : LIGHT_THEME), [isDark]);
}
