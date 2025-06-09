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
- **Design System**: Consistent design language across all components with centralized colors, spacing, and typography

## Color System

Our design system includes a comprehensive color palette organized by functional categories:

### Core Colors

**Black Scale** (alpha-based)
- `--black-50` to `--black-900` - From 5% to 100% opacity of `#1a1a1a`

**White Scale** (alpha-based)
- `--white-50` to `--white-900` - From 5% to 100% opacity of `#ffffff`

**Blue Scale** (design-specific values)
- `--blue-50: #f0f9ff` to `--blue-900: #04263f`

**Grey Scale** (design-specific values)
- `--grey-50: #f8fafc` to `--grey-900: #141e35`

### Semantic Colors

**Success/Error/Warning**
- `--green-bg: #eafee5` | `--green-success: #08ad37`
- `--red-bg: #feeae5` | `--red-error: #d8232c`
- `--orange-bg: #fefae5` | `--orange-caution: #f9ad14`

### Graph Colors

**Primary Palette**
- `--graph-primary-orange: #ffa62e`
- `--graph-primary-red: #ff5c64`
- `--graph-primary-green: #a5c34e`
- `--graph-primary-blue: #2d9cdb`
- `--graph-primary-yellow: #fbed53`
- `--graph-primary-purple: #7a51ab`

**Secondary Palette**
- `--graph-secondary-brown: #ad7942`
- `--graph-secondary-pink: #fb90b4`
- `--graph-secondary-teal: #3ccaba`
- `--graph-secondary-dark-blue: #4072d2`
- `--graph-secondary-black: #424e62`
- `--graph-secondary-grey: #b4b4b4`

### Usage in Components

Colors are available as both CSS custom properties and SCSS variables:

```scss
// CSS custom properties (recommended)
.my-component {
  background-color: var(--blue-500);
  color: var(--grey-900);
}

// SCSS variables (for calculations/functions)
.my-component {
  background-color: $color-blue-500;
  border: 1px solid $color-grey-300;
}
```

All colors are defined in `src/colors.scss` and available globally.

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
pnpm install
```

2. **Start development server**

```bash
pnpm dev
```

3. **Run Storybook**

```bash
pnpm storybook
```

Visit http://localhost:6006 to view the component library in Storybook.

## Streamlit Integration

### Quickstart

• Ensure you have Python 3.9+, Node.js, and pnpm installed.
• Clone this repo.
• Create a new Python virtual environment for the template:

```bash
$ cd template
$ python3 -m venv venv  # create venv
$ source venv/bin/activate   # activate venv
$ pip install streamlit # install streamlit
```

• Initialize and run the component template frontend:

```bash
$ cd template/my_component/frontend
$ pnpm install    # Install pnpm dependencies
$ pnpm start  # Start the Vite dev server
```

• From a separate terminal, run the template's Streamlit app:

```bash
$ cd template
$ source venv/bin/activate  # activate the venv you created earlier
$ pip install -e .   # install template as editable package
$ streamlit run my_component/example.py  # run the example
```

### How TetraScience UI Components Work with Streamlit

**The Core Concept**: Just like React libraries are distributed via pnpm/yarn and imported in JavaScript, this React UI library can be packaged into Python libraries distributed via pip and imported in Python.

#### React Library → Python Package Flow

**Step 1: React Development & Distribution**
```bash
# This repository: tetrascience-ui React library
pnpm add tetrascience-ui  # Available via pnpm like any React library
```

**Step 2: Streamlit Component Creation**
A separate Python project creates Streamlit components using our React library:

```tsx
// React component in a Streamlit project
import { LineGraph, Button } from 'tetrascience-ui'
import { Navbar } from 'tetrascience-ui' 
import { Streamlit, withStreamlitConnection } from 'streamlit-component-lib'
import { COLORS } from 'tetrascience-ui'

function TetraScienceChart({ args }) {
  const handleAnalyze = () => {
    Streamlit.setComponentValue({
      action: 'analyze',
      selectedData: args.dataSeries[0].name
    })
  }

  return (
    <div>
      {/* All TetraScience UI components used normally - NO wrapping needed */}
      
      {/* Molecules component */}
      <Navbar 
        organization={{
          name: "TetraScience Lab",
          subtext: "Data Analysis Platform"
        }}
      />
      
      {/* Organisms component */}
      <LineGraph 
        dataSeries={args.dataSeries}
        width={800}
        height={400}
        variant="lines+markers"
        title="Experimental Data"
        xTitle="Time (minutes)"
        yTitle="Temperature (°C)"
      />
      
      {/* Atoms component */}
      <Button 
        variant="primary" 
        size="medium"
        onClick={handleAnalyze}
      >
        Analyze Results
      </Button>
    </div>
  )
}

// ONLY the top-level component gets wrapped
export default withStreamlitConnection(TetraScienceChart)
```

**Important**: Individual TetraScience UI components (atoms like `Button`; molecules like `Navbar`, `FormField`; organisms like `LineGraph`, `BarGraph`) are all used normally within your Streamlit component. Only wrap the **top-level container component** with `withStreamlitConnection`.

**Step 3: Python Package Wrapper**
The React component gets wrapped in a Python API:

```python
# Python wrapper for the React component
import streamlit.components.v1 as components

def tetrascience_chart(data_series, title="Line Graph", key=None):
    """Create a chart using TetraScience UI LineGraph component
    
    Parameters:
    - data_series: List of dicts with 'x', 'y', 'name', 'color' keys
    - title: Chart title
    - key: Unique component key
    """
    return components.declare_component(
        "tetrascience_chart",
        path="./frontend/build"  # Built React assets
    )(dataSeries=data_series, title=title, key=key)
```

**Step 4: Distribution via PyPI**
```python
# setup.py - makes it pip installable
setuptools.setup(
    name="tetrascience-streamlit-components",
    install_requires=["streamlit"],
    # React build assets included in package
)
```

#### End Result: Python Import

**Installation (like pnpm add):**
```bash
pip install tetrascience-streamlit-components
```

**Usage (like ES6 import):**
```python
import streamlit as st
from tetrascience_streamlit_components import tetrascience_chart

# Use React components through Python with real data structure
experimental_data = [
    {
        "x": [0, 10, 20, 30, 40, 50],
        "y": [25.1, 26.8, 29.2, 31.5, 28.9, 27.3],
        "name": "Sample A",
        "color": "#ffa62e"  # COLORS.ORANGE
    },
    {
        "x": [0, 10, 20, 30, 40, 50], 
        "y": [24.8, 27.1, 30.5, 32.1, 29.8, 28.1],
        "name": "Sample B", 
        "color": "#ff5c64"  # COLORS.RED
    }
]

result = tetrascience_chart(
    data_series=experimental_data,
    title="Temperature vs Time Analysis",
    key="temp_chart"
)

if result:
    st.write(f"User action: {result['action']}")
    st.write(f"Selected: {result['selectedData']}")
```

#### Why This Works

1. **React Build Process**: React components are compiled to static JavaScript/CSS files
2. **Streamlit Integration**: `streamlit-component-lib` bridges React and Python
3. **Python Packaging**: Standard Python packaging includes the built React assets
4. **Component Declaration**: Streamlit serves the React files and handles communication

#### The Magic: Bidirectional Communication

- **Python → React**: Data flows from Python as props to React components
- **React → Python**: User interactions in React are sent back to Python via Streamlit's API
- **State Management**: Streamlit manages the component lifecycle and re-rendering

This architecture allows **React developers** to build rich UI components using modern web technologies, while **Python developers** get a simple, familiar import-based API without needing to know React or JavaScript.

**Bottom line**: Your React components become as easy to use in Python as any other pip package, maintaining the same development experience users expect from both ecosystems.

## Available Scripts

- `pnpm build` - Build for production (using Rollup)
- `pnpm storybook` - Run Storybook development server on port 6006
- `pnpm build-storybook` - Build Storybook for deployment
- `pnpm prepare` - Set up Husky git hooks
- `pnpm prepublishOnly` - Build the package before publishing

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
