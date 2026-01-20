# tetrascience-react-ui

React component library for building TetraScience applications.

This library provides:

- **UI Components**: Reusable React components following atomic design principles
- **Data Visualisation**: Interactive charts powered by Plotly.js
- **Theming**: Customisable design system with ThemeProvider
- **TypeScript**: Full type support with exported prop types

## Installation

```bash
yarn add @tetrascience/tetrascience-react-ui
```

## Quick Start

```tsx
// 1. Import the CSS (required)
import '@tetrascience/tetrascience-react-ui/index.css';

// 2. Import components
import { Button, Card, BarGraph } from '@tetrascience/tetrascience-react-ui';

function App() {
  return (
    <Card title="Welcome">
      <p>My first TetraScience app!</p>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

## Components

### Atoms (Basic Building Blocks)

Badge, Button, ButtonControl, Card, Checkbox, CodeEditor, Dropdown, ErrorAlert, Icon, Input, Label, MarkdownDisplay, MenuItem, Modal, PopConfirm, SupportiveText, Tab, TableCell, TableHeaderCell, Textarea, Toast, Toggle, Tooltip

### Molecules (Composed Components)

AppHeader, AssistantModal, ButtonControlGroup, CardSidebar, CodeScriptEditorButton, FormField, LaunchContent, Menu, Navbar, ProtocolConfiguration, ProtocolYamlCard, PythonEditorModal, SelectField, Sidebar, TabGroup, Table, ToastManager

### Organisms (Data Visualisation)

AppLayout, AreaGraph, BarGraph, Boxplot, Chromatogram, DotPlot, Heatmap, Histogram, LineGraph, Main, PieChart, ScatterGraph, TaskScripts

## Theming

Customise colours, border radius, and spacing:

```tsx
import { ThemeProvider } from '@tetrascience/tetrascience-react-ui';

const customTheme = {
  colors: {
    primary: '#DC2626',
    primaryHover: '#B91C1C',
  },
  radius: {
    medium: '12px',
  },
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

See [THEMING.md](./THEMING.md) for the complete theming guide.

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { Button } from '@tetrascience/tetrascience-react-ui';
import type { ButtonProps, BarGraphProps, BarDataSeries } from '@tetrascience/tetrascience-react-ui';
```

## Examples

The repository includes example applications in the `examples/` directory:

```bash
# Clone the repository
git clone https://github.com/tetrascience/ts-lib-ui-kit-react.git
cd ts-lib-ui-kit-react

# Install dependencies
yarn

# Run the themed example app
yarn workspace vite-themed-app dev
```

Visit http://localhost:5173 to see the example app with custom theming.

## Documentation

- [Getting Started Guide](https://github.com/tetrascience/ts-lib-ui-kit-react/blob/main/get_started_1.md) - Step-by-step tutorial
- [Theming Guide](https://github.com/tetrascience/ts-lib-ui-kit-react/blob/main/THEMING.md) - Customise the design system
- [Storybook](https://github.com/tetrascience/ts-lib-ui-kit-react/blob/main/DEVELOPERS.md#development-setup) - Clone the repo and run `yarn storybook`

## Tech Stack

- React 18
- TypeScript
- styled-components
- Plotly.js (charts)
- Monaco Editor (code editing)
- React Flow (workflow diagrams)

## License

Licensed under the Apache License, Version 2.0 – see [LICENSE](LICENSE) for details.
