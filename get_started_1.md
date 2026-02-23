# Getting Started with tetrascience-react-ui

Welcome to the tetrascience-react-ui React component library! This comprehensive guide will walk you through everything you need to know to start building TetraScience applications with our pre-built components.

## What is tetrascience-react-ui?

tetrascience-react-ui is a React component library that provides pre-built, customisable UI components designed specifically for TetraScience applications. The library follows atomic design principles, organising components into:

- **Atoms**: Basic building blocks (Button, Input, Card, Modal, etc.)
- **Molecules**: Composed components (FormField, Menu, TabGroup, Table, etc.)
- **Organisms**: Complex interactive components (BarGraph, LineGraph, Heatmap, AppLayout, etc.)

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher
- [Yarn](https://yarnpkg.com/) package manager
- A React 19+ project (or willingness to create one)
- Basic familiarity with React and TypeScript

## Step 1: Installation

```bash
yarn add @tetrascience-npm/tetrascience-react-ui
```

### Important: Import the CSS

After installing, you **must** import the CSS file in your application entry point:

```tsx
// In your App.tsx or index.tsx
import '@tetrascience-npm/tetrascience-react-ui/index.css';
```

Without this import, components will not be styled correctly.

## Step 2: Understanding the Component Architecture

### Atoms (Basic Building Blocks)

Simple, single-purpose components:

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, and tertiary button variants |
| `Input` | Text input with validation support |
| `Card` | Container with optional header and actions |
| `Modal` | Dialog overlay with customisable content |
| `Badge` | Status indicators and labels |
| `Checkbox` | Checkbox with label support |
| `Toggle` | On/off switch control |
| `Dropdown` | Select menu with options |
| `Toast` | Notification messages |
| `Tooltip` | Hover information popups |
| `CodeEditor` | Monaco-based code editing |
| `MarkdownDisplay` | Rendered markdown content |

### Molecules (Composed Components)

Components that combine atoms with specific behaviour:

| Component | Description |
|-----------|-------------|
| `FormField` | Label + Input + validation message |
| `SelectField` | Label + Dropdown + validation |
| `Menu` | Navigation menu with items |
| `TabGroup` | Tabbed content switcher |
| `Table` | Data table with sorting and filtering |
| `Navbar` | Application navigation bar |
| `ToastManager` | Global toast notification system |

### Organisms (Complex Components)

Page-level components with data visualisation:

| Component | Description |
|-----------|-------------|
| `BarGraph` | Interactive bar charts (grouped/stacked) |
| `LineGraph` | Line charts with multiple series |
| `ScatterGraph` | Scatter plot visualisations |
| `AreaGraph` | Filled area charts |
| `Heatmap` | 2D colour-coded data grids |
| `Histogram` | Distribution visualisations |
| `PieChart` | Pie and donut charts |
| `Boxplot` | Statistical box plots |
| `AppLayout` | Full application layout template |

## Step 3: Your First TetraScience App

Let's create your first application step by step.

### Create a New React Project (if needed)

```bash
# Using Vite (recommended)
yarn create vite my-tetrascience-app --template react-ts
cd my-tetrascience-app

# Install @tetrascience-npm/tetrascience-react-ui
yarn add @tetrascience-npm/tetrascience-react-ui
```

### Set Up the Entry Point

Edit your `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Important: Import the CSS
import '@tetrascience-npm/tetrascience-react-ui/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Create Your First Component

Edit your `src/App.tsx`:

```tsx
import { Button, Card } from '@tetrascience-npm/tetrascience-react-ui';

function App() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>My TetraScience Application</h1>

      <Card title="Welcome">
        <p>This is your first TetraScience-powered React app!</p>
        <Button variant="primary" onClick={() => alert('Hello!')}>
          Click Me
        </Button>
      </Card>
    </div>
  );
}

export default App;
```

### Run Your App

```bash
yarn dev
```

Your browser should open showing your new TetraScience app!

## Step 4: Adding Data Visualisation

Let's add a bar graph to visualise some data:

```tsx
import { Button, Card, BarGraph } from '@tetrascience-npm/tetrascience-react-ui';
import type { BarDataSeries } from '@tetrascience-npm/tetrascience-react-ui';

function App() {
  const experimentData: BarDataSeries[] = [
    {
      name: 'Experiment A',
      color: '#FF9500',
      x: ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4'],
      y: [140, 195, 230, 300],
    },
    {
      name: 'Experiment B',
      color: '#FF5C64',
      x: ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4'],
      y: [150, 210, 130, 140],
    },
    {
      name: 'Control',
      color: '#A1C63C',
      x: ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4'],
      y: [55, 75, 105, 215],
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Experimental Results</h1>

      <Card title="Sample Comparison">
        <BarGraph
          dataSeries={experimentData}
          title="Response Intensity by Sample"
          xTitle="Sample"
          yTitle="Response (units)"
          variant="group"
          width={800}
          height={400}
        />
      </Card>
    </div>
  );
}

export default App;
```

## Step 5: Using the ThemeProvider

Customise the look and feel with the ThemeProvider:

```tsx
import { ThemeProvider, Button, Card } from '@tetrascience-npm/tetrascience-react-ui';
import type { Theme } from '@tetrascience-npm/tetrascience-react-ui';

// Define your custom theme
const customTheme: Partial<Theme> = {
  colors: {
    primary: '#DC2626',      // Custom red primary colour
    primaryHover: '#B91C1C',
  },
  radius: {
    medium: '12px',          // More rounded corners
    large: '24px',
  },
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <div style={{ padding: '24px' }}>
        <Card title="Themed Components">
          <p>These components use your custom theme!</p>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

See [THEMING.md](./THEMING.md) for the complete theming guide.

## Step 6: Building Forms

Create interactive forms with validation:

```tsx
import { useState } from 'react';
import { Card, FormField, SelectField, Button, Toggle } from '@tetrascience-npm/tetrascience-react-ui';

function SampleForm() {
  const [sampleName, setSampleName] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [isActive, setIsActive] = useState(true);

  const typeOptions = [
    { label: 'Biological', value: 'biological' },
    { label: 'Chemical', value: 'chemical' },
    { label: 'Physical', value: 'physical' },
  ];

  const handleSubmit = () => {
    console.log({ sampleName, sampleType, isActive });
  };

  return (
    <Card title="New Sample">
      <FormField
        label="Sample Name"
        value={sampleName}
        onChange={(e) => setSampleName(e.target.value)}
        placeholder="Enter sample name"
        required
      />

      <SelectField
        label="Sample Type"
        value={sampleType}
        onChange={(value) => setSampleType(value)}
        options={typeOptions}
        placeholder="Select type"
      />

      <div style={{ margin: '16px 0' }}>
        <Toggle
          checked={isActive}
          onChange={setIsActive}
          label="Active Sample"
        />
      </div>

      <Button variant="primary" onClick={handleSubmit}>
        Create Sample
      </Button>
    </Card>
  );
}
```

## Step 7: Best Practices

### TypeScript Support

The library is fully typed. Import types alongside components:

```tsx
import { Button, BarGraph } from '@tetrascience-npm/tetrascience-react-ui';
import type { ButtonProps, BarGraphProps, BarDataSeries } from '@tetrascience-npm/tetrascience-react-ui';

// Use types for props validation
const MyButton = (props: ButtonProps) => <Button {...props} />;

// Use types for data structures
const chartData: BarDataSeries[] = [/* ... */];
```

### Component Composition

Build complex UIs by composing simpler components:

```tsx
import { Card, FormField, Button, Modal } from '@tetrascience-npm/tetrascience-react-ui';

function DataEntryCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        title="Data Entry"
        actions={
          <Button variant="tertiary" onClick={() => setIsModalOpen(true)}>
            Help
          </Button>
        }
      >
        <FormField label="Value" placeholder="Enter value" />
        <Button variant="primary">Submit</Button>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Help"
      >
        <p>Enter the measured value from your experiment.</p>
      </Modal>
    </>
  );
}
```

### Error Handling

Wrap component usage in error boundaries for production apps:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { BarGraph } from '@tetrascience-npm/tetrascience-react-ui';

function ChartWithErrorHandling({ data }) {
  return (
    <ErrorBoundary fallback={<div>Failed to render chart</div>}>
      <BarGraph dataSeries={data} />
    </ErrorBoundary>
  );
}
```

### Data Validation

Validate data before passing to visualisation components:

```tsx
function validateChartData(data: BarDataSeries[]): boolean {
  if (!data || data.length === 0) {
    console.warn('No data provided for chart');
    return false;
  }

  return data.every(series =>
    series.x?.length > 0 &&
    series.y?.length > 0 &&
    series.x.length === series.y.length
  );
}

// Use validation
if (validateChartData(myData)) {
  return <BarGraph dataSeries={myData} />;
} else {
  return <p>No valid data to display</p>;
}
```

## Step 8: Exploring More Components

### Discover Available Components

```tsx
// Import everything to explore
import * as TetraScienceUI from '@tetrascience-npm/tetrascience-react-ui';

// Log available exports
console.log(Object.keys(TetraScienceUI));
```

### Run Storybook Locally

For interactive component documentation, clone the repository and run Storybook:

```bash
git clone https://github.com/tetrascience/ts-lib-ui-kit.git
cd ts-lib-ui-kit
yarn
yarn storybook
```

Visit http://localhost:6006 to explore all components with live examples.

## Troubleshooting Common Issues

### Components Not Styled

**Problem**: Components render but have no styling.

**Solution**: Ensure you've imported the CSS:
```tsx
import '@tetrascience-npm/tetrascience-react-ui/index.css';
```

### TypeScript Errors

**Problem**: Type errors when using components.

**Solution**: Import types explicitly:
```tsx
import type { ButtonProps } from '@tetrascience-npm/tetrascience-react-ui';
```

### Charts Not Rendering

**Problem**: Graph components show blank area.

**Solution**:
1. Check that `dataSeries` has valid data
2. Ensure `width` and `height` are specified
3. Verify the parent container has dimensions

### Theme Not Applying

**Problem**: Custom theme colours not showing.

**Solution**: Wrap your app with `ThemeProvider`:
```tsx
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

## Next Steps

You've now learned how to:

- Install and set up `tetrascience-react-ui`
- Understand the component architecture
- Create your first TetraScience React app
- Add data visualisation with charts
- Customise theming
- Build forms with validation
- Follow best practices

### Additional Resources

- [THEMING.md](./THEMING.md) - Complete theming guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing and development setup
- Run Storybook locally for interactive documentation

Start building amazing TetraScience applications!
