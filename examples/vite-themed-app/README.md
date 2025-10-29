# Vite Themed App Example

Simple Vite + React example demonstrating TetraScience UI Kit theming.

## Features

- **Button** component with custom orange theme
- **Card** component with stats
- **Modal** component for interactions
- Custom theme with orange primary color and rounded corners

## Installation

```bash
yarn install
```

## Running

```bash
yarn dev
```

Then open http://localhost:5173

## What This Shows

This example demonstrates:
1. How to wrap your app with `ThemeProvider`
2. How to define a custom theme
3. How Button, Card, and Modal respond to the theme
4. Simple, working example without SSR complications

## Theme

```tsx
const orangeTheme = {
  colors: {
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryActive: '#B45309',
  },
  radius: {
    medium: '10px',
    large: '16px',
  },
};
```

Much simpler than Next.js - just works! 🎉
