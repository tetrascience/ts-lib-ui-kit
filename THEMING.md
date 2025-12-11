# Theming Guide

The TetraScience UI Kit supports custom theming through the `ThemeProvider` component. This allows you to customize colors, border radius, and spacing across all themed components.

## Quick Start

Wrap your application with the `ThemeProvider` and pass a custom theme object:

```tsx
import { ThemeProvider, Button, Card, Modal } from '@tetrascience-npm/tetrascience-react-ui';

const customTheme = {
  colors: {
    primary: '#DC2626',           // Red primary color
    primaryHover: '#B91C1C',      // Darker red for hover
    primaryActive: '#991B1B',     // Even darker for active state
  },
  radius: {
    medium: '12px',               // Rounded corners for buttons
    large: '24px',                // Extra rounded for cards/modals
  },
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <Button>Click me</Button>
      <Card title="My Card">Card content</Card>
    </ThemeProvider>
  );
}
```

## Theme Configuration

### Colors

```tsx
colors: {
  primary: string;           // Primary button background
  primaryHover: string;      // Primary button hover state
  primaryActive: string;     // Primary button active state
  background: string;        // Modal and general backgrounds
  text: string;             // Text color
  border: string;           // General border color
  cardBackground: string;   // Card background
  cardBorder: string;       // Card border
}
```

### Border Radius

```tsx
radius: {
  small: string;    // Small elements (4px default)
  medium: string;   // Buttons (8px default)
  large: string;    // Cards, Modals (16px default)
}
```

### Spacing

```tsx
spacing: {
  small: string;    // 8px default
  medium: string;   // 16px default
  large: string;    // 24px default
}
```

## Currently Themed Components

The following components support theming:

- **Button**: Colors (primary, primaryHover, primaryActive), radius (medium)
- **Card**: Colors (cardBackground, cardBorder), radius (large)
- **Modal**: Colors (background), radius (large, medium for buttons inside)

## Examples

### Example 1: Red Brand Theme

```tsx
const redTheme = {
  colors: {
    primary: '#DC2626',
    primaryHover: '#B91C1C',
    primaryActive: '#991B1B',
  },
};

<ThemeProvider theme={redTheme}>
  <Button variant="primary">Red Button</Button>
</ThemeProvider>
```

### Example 2: Purple Theme with Rounded Corners

```tsx
const purpleTheme = {
  colors: {
    primary: '#9333EA',
    primaryHover: '#7E22CE',
    primaryActive: '#6B21A8',
    cardBackground: '#F3E8FF',
    cardBorder: '#9333EA',
  },
  radius: {
    medium: '12px',
    large: '24px',
  },
};

<ThemeProvider theme={purpleTheme}>
  <Button>Purple Button</Button>
  <Card title="Purple Card">Themed card</Card>
</ThemeProvider>
```

### Example 3: Sharp Corners Theme

```tsx
const sharpTheme = {
  radius: {
    small: '2px',
    medium: '4px',
    large: '4px',
  },
};

<ThemeProvider theme={sharpTheme}>
  <Button>Sharp Button</Button>
  <Card>Sharp Card</Card>
</ThemeProvider>
```

### Example 4: Full Custom Theme

```tsx
const customTheme = {
  colors: {
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryActive: '#B45309',
    cardBackground: '#FEF3C7',
    cardBorder: '#F59E0B',
    background: '#FFFBEB',
  },
  radius: {
    medium: '20px',
    large: '32px',
  },
};

<ThemeProvider theme={customTheme}>
  <Button>Fully Themed Button</Button>
  <Card title="Themed Card">Custom everything!</Card>
</ThemeProvider>
```

## Default Theme

If you don't provide a theme or only provide partial values, the library uses these defaults:

```tsx
{
  colors: {
    primary: 'var(--blue-900)',
    primaryHover: 'var(--blue-800)',
    primaryActive: 'var(--blue-800)',
    background: 'var(--white-900)',
    text: 'var(--black-900)',
    border: 'var(--grey-200)',
    cardBackground: 'var(--white-900)',
    cardBorder: 'var(--grey-200)',
  },
  radius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
}
```

## How It Works

The `ThemeProvider` sets CSS custom properties (CSS variables) on the root element:

- Color values become `--theme-primary`, `--theme-primaryHover`, etc.
- Radius values become `--theme-radius-small`, `--theme-radius-medium`, etc.
- Spacing values become `--theme-spacing-small`, `--theme-spacing-medium`, etc.

Components use these CSS variables with fallbacks to the default design system tokens, so theming is completely optional.

## Storybook Examples

Check out the Storybook stories for live examples:

- **Button** stories: `WithRedTheme`, `WithPurpleTheme`, `WithCustomRadius`, `WithFullCustomTheme`
- **Card** stories: `WithCustomBorder`, `WithCustomBackground`, `WithSharpCorners`, `WithFullTheme`
- **Modal** stories: `WithSharpCorners`, `WithCustomBackground`, `WithFullTheme`, `InteractiveWithTheme`

Run Storybook to see these examples:

```bash
yarn storybook
```
