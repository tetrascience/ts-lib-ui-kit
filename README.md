# TetraScience UI

<p align="center">
  <img alt="TetraScience" src="public/logo.png" width="60" />
</p>

## Overview

TetraScience UI is a React-based user interface library for TetraScience applications. Built with a robust component architecture following atomic design principles, it provides a comprehensive set of UI components and visualization tools.

## Project Structure

```
└── tetrascience-ui/
    ├── src/
    │   ├── assets/          # Icons and other static assets
    │   ├── components/      # UI components organized by atomic design
    │   │   ├── atoms/       # Basic building blocks (Button, Input, etc.)
    │   │   ├── molecules/   # Combinations of atoms (Forms, Menus, etc.)
    │   │   └── organisms/   # Complex UI sections (Charts, Graphs, etc.)
    │   └── types/           # TypeScript type definitions
    └── .storybook/          # Storybook configuration
```

## Features

- **Component Library**: Comprehensive set of UI components built with React and TypeScript
- **Data Visualization**: Various chart types including Line, Bar, Scatter, and Heatmap graphs
- **Protocol Configuration**: Components for protocol configuration and YAML editing
- **Code Editor**: Monaco-based code editor integration for Python and other languages
- **Design System**: Consistent design language across all components

## Tech Stack

- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe development experience
- **Vite**: Fast and lean development server and build tool
- **Storybook**: Component development and documentation
- **Plotly.js**: Advanced data visualization
- **Monaco Editor**: Code editing capabilities
- **React Flow**: Workflow and diagram visualization

## Getting Started

1. **Install dependencies**

```bash
yarn
```

2. **Start development server**

```bash
yarn dev
```

3. **Run Storybook**

```bash
yarn storybook
```

Visit http://localhost:6006 to view the component library in Storybook.

## Available Scripts

- `yarn build` - Build for production (using Rollup)
- `yarn storybook` - Run Storybook development server on port 6006
- `yarn build-storybook` - Build Storybook for deployment
- `yarn init-msw` - Initialize Mock Service Worker
- `yarn prepare` - Set up Husky git hooks
- `yarn prepublishOnly` - Build the package before publishing

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` → `src/*`
- `@assets/*` → `src/assets/*`
- `@atoms/*` → `src/components/atoms/*`
- `@molecules/*` → `src/components/molecules/*`
- `@organisms/*` → `src/components/organisms/*`
- `@styles/*` → `src/styles/*`
- `@utils/*` → `src/utils/*`

## License

Properietary © TetraScience
