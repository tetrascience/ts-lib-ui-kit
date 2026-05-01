# tetrascience-react-ui

React component library for building TetraScience applications.

[![npm version](https://img.shields.io/npm/v/@tetrascience-npm/tetrascience-react-ui)](https://www.npmjs.com/package/@tetrascience-npm/tetrascience-react-ui) [![CI](https://github.com/tetrascience/ts-lib-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/tetrascience/ts-lib-ui-kit/actions/workflows/ci.yml) **[Storybook](https://tetrascience.github.io/ts-lib-ui-kit/)** | **[Contributing Guide](./CONTRIBUTING.md)**

This library provides:

- **UI Components**: shadcn/ui primitives (Radix UI) with Tailwind CSS
- **Composed Components**: TetraScience-specific compositions (AppHeader, Sidebar, etc.)
- **Data Visualisation**: Interactive charts powered by Plotly.js
- **Theming**: CSS custom properties (oklch) for light/dark mode
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
// 1. Import the CSS once at your app root (required)
import '@tetrascience-npm/tetrascience-react-ui/index.css';

// 2. Import components
import { Button, Card, CardHeader, CardContent } from '@tetrascience-npm/tetrascience-react-ui';

function App() {
  return (
    <Card>
      <CardHeader>Welcome</CardHeader>
      <CardContent>
        <p>My first TetraScience app!</p>
        <Button variant="default">Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

## Styling & CSS

This library uses **Tailwind CSS 4** with design tokens defined as CSS custom properties (oklch color space). All CSS files are declared as [`sideEffects`](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) in `package.json`, so bundlers will preserve them while still tree-shaking unused JavaScript.

### CSS Import Options

| Import path | Use case |
| --- | --- |
| `@tetrascience-npm/tetrascience-react-ui/index.css` | **Pre-built CSS** — use this for most apps. Import once at your app root. |
| `@tetrascience-npm/tetrascience-react-ui/index.tailwind.css` | **Tailwind source** — for apps that run their own Tailwind build and want to extend/override tokens. |

Most consumers only need `index.css`:

### Theming

The design system is controlled via CSS custom properties in `index.css`. Override them to customise colours, spacing, and radii:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --radius: 0.625rem;
}
```

Dark mode is supported via the `.dark` class on a parent element. See [THEMING.md](./THEMING.md) for details.

## Components

### UI Primitives (`ui/`)

shadcn/ui components built on Radix UI with Tailwind CSS and CVA variants:

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, ButtonGroup, Calendar, Card, Carousel, Checkbox, CodeEditor, Collapsible, ComboBox, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Field, HoverCard, Input, InputGroup, InputOTP, Item, KBD, Label, MenuBar, NavigationMenu, RadioGroup, ResizablePanel, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, TetraScience Icon, Toggle, ToggleGroup, Tooltip

### Composed Components (`composed/`)

TetraScience-specific compositions built from UI primitives:

AppHeader, AppLayout, AssistantModal, CodeScriptEditorButton, LaunchContent, Main, Navbar, ProtocolConfiguration, ProtocolYamlCard, PythonEditorModal, Sidebar, TdpLink, TdpSearch, TdpUrl

### Charts (`charts/`)

Plotly.js-based data visualisations:

AreaGraph, BarGraph, Boxplot, Chromatogram, ChromatogramChart, DotPlot, Heatmap, Histogram, LineGraph, PieChart, PlateMap, ScatterGraph

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
// Other fields (tdpEndpoint, connectorId, orgSlug) are read from environment variables
const client = new TDPClient({
  authToken: userToken,
  artifactType: 'data-app',
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

### Connector Key/Value Store

The TDP connector key/value store lets data apps persist small pieces of state (user preferences, cached results, last-run timestamps, etc.) without an external database. The `TDPClient` from `@tetrascience-npm/ts-connectors-sdk` provides `getValue`, `getValues`, `saveValue`, and `saveValues` methods.

**Reading and writing values with the user's JWT token:**

```typescript
import { TDPClient } from '@tetrascience-npm/ts-connectors-sdk';
import { jwtManager } from '@tetrascience-npm/tetrascience-react-ui/server';

// In an Express route handler:
app.get('/api/kv/:key', async (req, res) => {
  // 1. Get the user's JWT from request cookies
  const userToken = await jwtManager.getTokenFromExpressRequest(req);
  if (!userToken) return res.status(401).json({ error: 'Not authenticated' });

  // 2. Create a TDPClient authenticated as the user
  //    (CONNECTOR_ID, TDP_ENDPOINT, ORG_SLUG are read from env vars)
  const client = new TDPClient({
    authToken: userToken,
    artifactType: 'data-app',
  });
  await client.init();

  // 3. Read a value
  const value = await client.getValue(req.params.key);
  res.json({ key: req.params.key, value });
});

app.put('/api/kv/:key', async (req, res) => {
  const userToken = await jwtManager.getTokenFromExpressRequest(req);
  if (!userToken) return res.status(401).json({ error: 'Not authenticated' });

  const client = new TDPClient({
    authToken: userToken,
    artifactType: 'data-app',
  });
  await client.init();

  // Write a value (any JSON-serialisable type)
  await client.saveValue(req.params.key, req.body.value, { secure: false });
  res.json({ key: req.params.key, saved: true });
});
```

**Reading multiple values at once:**

```typescript
const values = await client.getValues(['theme', 'locale', 'last-run']);
// values[0] → theme, values[1] → locale, values[2] → last-run
```

> See the [example app](./examples/vite-themed-app/) for a complete working server with KV store endpoints.

### TDP Search (`server`)

**TdpSearchManager** - Server-side handler for the TdpSearch component. Resolves auth from request cookies (via `jwtManager`), calls TDP `searchEql`, and returns the response so the frontend hook works with minimal wiring.

```typescript
import { tdpSearchManager } from "@tetrascience-npm/tetrascience-react-ui/server";

// Express: mount a POST route (e.g. /api/search)
app.post("/api/search", express.json(), async (req, res) => {
  try {
    const body = req.body; // SearchEqlRequest (searchTerm, from, size, sort, order, ...)
    const response = await tdpSearchManager.handleSearchRequest(req, body);
    res.json(response);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : "Search failed" });
  }
});
```

Frontend: use `<TdpSearch columns={...} />` with default `apiEndpoint="/api/search"`, or pass `apiEndpoint` if you use a different path. Auth is taken from cookies (`ts-auth-token` or `ts-token-ref` via `jwtManager`).

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { Button } from '@tetrascience-npm/tetrascience-react-ui';
import type { ButtonProps, BarGraphProps, BarDataSeries } from '@tetrascience-npm/tetrascience-react-ui';
```

## Examples

This repository uses component driven development with Storybook. To see the examples run the following.

```bash
# Clone the repository
git clone https://github.com/tetrascience/ts-lib-ui-kit.git
cd ts-lib-ui-kit

# Install dependencies
yarn

# Run the storybook
yarn dev
```

Visit <http://localhost:6006>.

## Documentation

- [Storybook – Live Component Demos](https://tetrascience.github.io/ts-lib-ui-kit/) - Browse all components with interactive examples
- [NPM Package](https://www.npmjs.com/package/@tetrascience-npm/tetrascience-react-ui) - Installation and version info
- [Migration Guide](./MIGRATION.md) - Migrating from the old atom/molecule/organism architecture
- [Theming Guide](./THEMING.md) - Customise the design system
- [Contributing](./CONTRIBUTING.md#development-setup) - Clone the repo and run `yarn storybook`

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (Radix UI)
- Vite 7
- Plotly.js (charts)
- Monaco Editor (code editing)

## License

Licensed under the Apache License, Version 2.0 – see [LICENSE](LICENSE) for details.
