import React, { useMemo } from "react";
import styled, { ThemeProvider as StyledThemeProvider } from "styled-components";

import { defaultTheme } from "./types";

import type { Theme} from "./types";

/** Props for the ThemeProvider component */
export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

// Styled wrapper that applies CSS custom properties locally
const ThemeWrapper = styled.div<{ $themeStyles: Record<string, string> }>`
  ${(props) =>
    Object.entries(props.$themeStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n")}
`;

/**
 * ThemeProvider component that sets CSS custom properties for theming
 *
 * This provider merges the provided theme with the default theme and
 * sets CSS variables on a wrapper element, making them available to both
 * styled-components and SCSS styles within the provider's scope.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, Button } from '@tetrascience-npm/tetrascience-react-ui';
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

  // Build CSS custom properties object for the wrapper
  const themeStyles = useMemo(() => {
    const styles: Record<string, string> = {};

    // Set color variables
    if (mergedTheme.colors) {
      Object.entries(mergedTheme.colors).forEach(([key, value]) => {
        if (value) {
          styles[`--theme-${key}`] = value;
        }
      });
    }

    // Set radius variables
    if (mergedTheme.radius) {
      Object.entries(mergedTheme.radius).forEach(([key, value]) => {
        if (value) {
          styles[`--theme-radius-${key}`] = value;
        }
      });
    }

    // Set spacing variables
    if (mergedTheme.spacing) {
      Object.entries(mergedTheme.spacing).forEach(([key, value]) => {
        if (value) {
          styles[`--theme-spacing-${key}`] = value;
        }
      });
    }

    return styles;
  }, [mergedTheme]);

  // Also provide theme to styled-components (cast to any to avoid type conflicts)
  return (
    <StyledThemeProvider theme={mergedTheme as any}>
      <ThemeWrapper $themeStyles={themeStyles}>{children}</ThemeWrapper>
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
