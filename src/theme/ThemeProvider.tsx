import React, { useEffect, useMemo } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { Theme, defaultTheme } from "./types";

export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

/**
 * ThemeProvider component that sets CSS custom properties for theming
 *
 * This provider merges the provided theme with the default theme and
 * sets CSS variables on the root element, making them available to both
 * styled-components and SCSS styles.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, Button } from '@tetrascience/tetrascience-react-ui';
 *
 * const customTheme = {
 *   colors: {
 *     primary: '#FF0000',
 *   },
 *   radius: {
 *     medium: '12px',
 *   }
 * };
 *
 * <ThemeProvider theme={customTheme}>
 *   <Button>Click me</Button>
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = {},
  children,
}) => {
  // Merge provided theme with default theme
  const mergedTheme = useMemo(() => {
    return {
      colors: { ...defaultTheme.colors, ...theme.colors },
      radius: { ...defaultTheme.radius, ...theme.radius },
      spacing: { ...defaultTheme.spacing, ...theme.spacing },
    };
  }, [theme]);

  // Set CSS custom properties on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Set color variables
    if (mergedTheme.colors) {
      Object.entries(mergedTheme.colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    }

    // Set radius variables
    if (mergedTheme.radius) {
      Object.entries(mergedTheme.radius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--theme-radius-${key}`, value);
        }
      });
    }

    // Set spacing variables
    if (mergedTheme.spacing) {
      Object.entries(mergedTheme.spacing).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--theme-spacing-${key}`, value);
        }
      });
    }

    // Cleanup function to remove custom properties when theme changes
    return () => {
      if (mergedTheme.colors) {
        Object.keys(mergedTheme.colors).forEach((key) => {
          root.style.removeProperty(`--theme-${key}`);
        });
      }
      if (mergedTheme.radius) {
        Object.keys(mergedTheme.radius).forEach((key) => {
          root.style.removeProperty(`--theme-radius-${key}`);
        });
      }
      if (mergedTheme.spacing) {
        Object.keys(mergedTheme.spacing).forEach((key) => {
          root.style.removeProperty(`--theme-spacing-${key}`);
        });
      }
    };
  }, [mergedTheme]);

  // Also provide theme to styled-components (cast to any to avoid type conflicts)
  return (
    <StyledThemeProvider theme={mergedTheme as any}>
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
