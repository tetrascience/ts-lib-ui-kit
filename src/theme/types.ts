/**
 * Theme type definitions for TetraScience UI Kit
 */

export interface ThemeColors {
  primary?: string;
  primaryHover?: string;
  primaryActive?: string;
  background?: string;
  text?: string;
  border?: string;
  cardBackground?: string;
  cardBorder?: string;
}

export interface ThemeRadius {
  small?: string;
  medium?: string;
  large?: string;
}

export interface ThemeSpacing {
  small?: string;
  medium?: string;
  large?: string;
}

export interface Theme {
  colors?: ThemeColors;
  radius?: ThemeRadius;
  spacing?: ThemeSpacing;
}

export const defaultTheme: Theme = {
  colors: {
    primary: "var(--blue-900)",
    primaryHover: "var(--blue-800)",
    primaryActive: "var(--blue-800)",
    background: "var(--white-900)",
    text: "var(--black-900)",
    border: "var(--grey-200)",
    cardBackground: "var(--white-900)",
    cardBorder: "var(--grey-200)",
  },
  radius: {
    small: "4px",
    medium: "8px",
    large: "16px",
  },
  spacing: {
    small: "8px",
    medium: "16px",
    large: "24px",
  },
};