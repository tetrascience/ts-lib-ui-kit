# Developer Guide

This document contains development setup and contribution guidelines for the TetraScience UI library.

## Project Structure

```
ts-lib-ui-kit-react/
├── src/
│   ├── assets/          # Icons and other static assets
│   ├── components/      # UI components organised by atomic design
│   │   ├── atoms/       # Basic building blocks (Button, Input, etc.)
│   │   ├── molecules/   # Combinations of atoms (Forms, Menus, etc.)
│   │   └── organisms/   # Complex UI sections (Charts, Graphs, etc.)
│   ├── styles/          # Global styles and SCSS variables
│   ├── theme/           # ThemeProvider and theme utilities
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and colour tokens
├── .storybook/          # Storybook configuration
├── examples/            # Example applications
└── dist/                # Built library output (generated)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 4+ (Berry)

### Development Setup

1. **Install dependencies**

```bash
yarn
```

2. **Start Storybook development server**

```bash
yarn storybook
```

Visit http://localhost:6006 to view the component library in Storybook.

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn storybook` | Run Storybook development server on port 6006 |
| `yarn build` | Build the library for production (using Rollup) |
| `yarn build-storybook` | Build Storybook for deployment |
| `yarn prepare` | Set up Husky git hooks |
| `yarn prepublishOnly` | Build the package before publishing |

## Path Aliases

The project uses path aliases for cleaner imports (configured in `tsconfig.app.json` and `vite.config.ts`):

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@assets/*` | `src/assets/*` |
| `@atoms/*` | `src/components/atoms/*` |
| `@molecules/*` | `src/components/molecules/*` |
| `@organisms/*` | `src/components/organisms/*` |
| `@styles/*` | `src/styles/*` |
| `@utils/*` | `src/utils/*` |

## Build System

The library uses Rollup to produce:

- **CommonJS bundle**: `dist/cjs/index.js`
- **ES Module bundle**: `dist/esm/index.js`
- **Type declarations**: `dist/index.d.ts`
- **Compiled CSS**: `dist/index.css`

## Component Development

### Component Structure

Every component follows this pattern:

```
ComponentName/
├── ComponentName.tsx       # Main component with forwardRef
├── ComponentName.scss      # Optional SCSS styles
├── ComponentName.stories.tsx # Storybook documentation
└── index.ts               # Exports component + types
```

### Adding a New Component

1. Create a directory under the appropriate category (`atoms/`, `molecules/`, or `organisms/`)
2. Implement the component following existing patterns
3. Add a Storybook story for documentation
4. Export from `src/index.ts`

### Styling Guidelines

- Use **styled-components** for component-scoped dynamic styles
- Use **SCSS** for static utility styles
- Leverage **CSS variables** from `src/colors.css` for design tokens
- Support theming via the `ThemeProvider`

## Code Quality

### Pre-commit Hooks

The project uses Husky with lint-staged to run checks before commits.

### Linting

ESLint is configured with React and TypeScript plugins. Run manually with:

```bash
yarn eslint src/
```

## Publishing

The library is published to npm. Before publishing:

1. Ensure all changes are committed
2. Update the version in `package.json`
3. Run `yarn build` to verify the build succeeds
4. The `prepublishOnly` script will automatically build before publish
