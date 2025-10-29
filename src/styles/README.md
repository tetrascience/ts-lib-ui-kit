# SCSS System Guide

This document explains how to use the centralized SCSS system in TetraScience UI components.

## Architecture Overview

Our SCSS system provides:
- **Centralized colors** via CSS custom properties + SCSS variables
- **Reusable mixins** for common patterns
- **Design tokens** for consistent spacing, typography, etc.
- **Single source of truth** for all styling values

## File Structure

```
src/
├── colors.scss           # Color definitions (CSS vars + SCSS vars)
├── index.scss            # Main entry point 
├── styles/
│   ├── variables.scss    # Shared SCSS utilities
│   └── README.md         # This file
└── components/
    └── atoms/
        └── Button/
            ├── Button.tsx
            └── Button.scss  # Component-specific styles
```

## Available Design Tokens

### Spacing
```scss
$spacing-0: 0;
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-3: 0.75rem;   // 12px
$spacing-4: 1rem;      // 16px
```

### Typography
```scss
$text-xs: 0.75rem;     // 12px
$text-sm: 0.875rem;    // 14px
$text-base: 1rem;      // 16px
$text-lg: 1.125rem;    // 18px
```

### Colors
All CSS custom properties are available as SCSS variables:
```scss
$color-black-900, $color-white-900, $color-blue-500, etc.
```

For the complete color palette and usage examples, see the **Color System** section in the [main README](../../README.md#color-system).

See `src/components/atoms/Button/Button.scss` for implementation examples. 