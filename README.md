# tetrascience-react-ui

React component library for building TetraScience applications.

This library provides:

- **UI Components**: Reusable React components following atomic design principles
- **Data Visualisation**: Interactive charts powered by Plotly.js
- **Theming**: Customisable design system with ThemeProvider
- **TypeScript**: Full type support with exported prop types

## Installation

```bash
yarn add @tetrascience-npm/tetrascience-react-ui
```

## Quick Start

```tsx
// 1. Import the CSS (required)
import '@tetrascience-npm/tetrascience-react-ui/index.css';

// 2. Import components
import { Button, Card, BarGraph } from '@tetrascience-npm/tetrascience-react-ui';

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
import { ThemeProvider } from '@tetrascience-npm/tetrascience-react-ui';

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

## Server Utilities

Beyond UI components, this library includes server-side helper functions for building TetraScience applications. These are available via the `/server` subpath to avoid pulling Node.js dependencies into browser bundles.

### Authentication (`server/auth`)

**JWT Token Manager** - Manages JWT token retrieval for data apps:

```typescript
import { jwtManager } from '@tetrascience-npm/tetrascience-react-ui/server';

// In Express middleware
app.use(async (req, res, next) => {
  const token = await jwtManager.getTokenFromExpressRequest(req);
  req.tdpAuth = { token, orgSlug: process.env.ORG_SLUG };
  next();
});

// Or with raw cookies
const token = await jwtManager.getUserToken(req.cookies);
```

**Environment Variables:**

- `ORG_SLUG` - Organization slug (required)
- `CONNECTOR_ID` - Connector ID for ts-token-ref flow
- `TDP_ENDPOINT` - API base URL
- `TS_AUTH_TOKEN` - Service account token (fallback for local dev)

> **Note:** The singleton `jwtManager` reads environment variables when the module is imported. Ensure these are set before importing the module.

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { Button } from '@tetrascience-npm/tetrascience-react-ui';
import type { ButtonProps, BarGraphProps, BarDataSeries } from '@tetrascience-npm/tetrascience-react-ui';
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

Visit <http://localhost:5173> to see the example app with custom theming.

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
