# tetrascience-react-ui

React component library for building TetraScience applications.

This library provides:

- **UI Components**: Reusable React components following atomic design principles
- **Data Visualisation**: Interactive charts powered by Plotly.js
- **Theming**: Customisable design system with ThemeProvider
- **TypeScript**: Full type support with exported prop types

## Requirements

- **React 19+**
- **Node.js 18+**
- **TypeScript 5.5+** (optional, but recommended)

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

### Data App Providers (`server/providers`)

TypeScript equivalents of the Python helpers from `ts-lib-ui-kit-streamlit` for connecting to database providers (Snowflake, Databricks, Athena).

**Getting Provider Configurations:**

```typescript
import { TDPClient } from '@tetrascience-npm/ts-connectors-sdk';
import {
  getProviderConfigurations,
  buildProvider,
  jwtManager,
} from '@tetrascience-npm/tetrascience-react-ui/server';

// Get user's auth token from request (e.g., in Express middleware)
const userToken = await jwtManager.getTokenFromExpressRequest(req);

// Create TDPClient with the user's auth token
const client = new TDPClient({
  authToken: userToken,
  artifactType: 'data-app',
  orgSlug: process.env.ORG_SLUG,
});
await client.init();

// Get all configured providers for this data app
const providers = await getProviderConfigurations(client);

for (const config of providers) {
  console.log(`Provider: ${config.name} (${config.type})`);

  // Build a database connection from the config
  const provider = await buildProvider(config);
  const results = await provider.query('SELECT * FROM my_table LIMIT 10');
  await provider.close();
}
```

**Using Specific Providers:**

```typescript
import {
  buildSnowflakeProvider,
  buildDatabricksProvider,
  getTdpAthenaProvider,
  type ProviderConfiguration,
} from '@tetrascience-npm/tetrascience-react-ui/server';

// Snowflake
const snowflakeProvider = await buildSnowflakeProvider(config);
const data = await snowflakeProvider.query('SELECT * FROM users');
await snowflakeProvider.close();

// Databricks
const databricksProvider = await buildDatabricksProvider(config);
const data = await databricksProvider.query('SELECT * FROM events');
await databricksProvider.close();

// TDP Athena (uses environment configuration)
const athenaProvider = await getTdpAthenaProvider();
const data = await athenaProvider.query('SELECT * FROM files');
await athenaProvider.close();
```

**Exception Handling:**

```typescript
import {
  QueryError,
  MissingTableError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from '@tetrascience-npm/tetrascience-react-ui/server';

try {
  const results = await provider.query('SELECT * FROM missing_table');
} catch (error) {
  if (error instanceof MissingTableError) {
    console.error('Table not found:', error.message);
  } else if (error instanceof QueryError) {
    console.error('Query failed:', error.message);
  }
}
```

**Environment Variables:**

- `DATA_APP_PROVIDER_CONFIG` - JSON override for local development only
- `CONNECTOR_ID` - Connector ID for fetching providers from TDP
- `TDP_ENDPOINT` - TDP API base URL
- `ORG_SLUG` - Organization slug
- `ATHENA_S3_OUTPUT_LOCATION` - S3 bucket for Athena query results
- `AWS_REGION` - AWS region for Athena

> **Note:** Authentication tokens are obtained from the user's JWT via `jwtManager`. The `TS_AUTH_TOKEN` environment variable is only for local development fallback.

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
git clone https://github.com/tetrascience/ts-lib-ui-kit.git
cd ts-lib-ui-kit

# Install dependencies
yarn

# Run the themed example app
yarn workspace vite-themed-app dev
```

Visit <http://localhost:5173> to see the example app with custom theming.

## Documentation

- [Getting Started Guide](./get_started_1.md) - Step-by-step tutorial
- [Theming Guide](./THEMING.md) - Customise the design system
- [Contributing](./CONTRIBUTING.md#development-setup) - Clone the repo and run `yarn storybook`

## Tech Stack

- React 18
- TypeScript
- styled-components
- Plotly.js (charts)
- Monaco Editor (code editing)
- React Flow (workflow diagrams)

## License

Licensed under the Apache License, Version 2.0 – see [LICENSE](LICENSE) for details.
