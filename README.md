# tetrascience-react-ui

React component library for building TetraScience applications.

[![npm version](https://img.shields.io/npm/v/@tetrascience-npm/tetrascience-react-ui)](https://www.npmjs.com/package/@tetrascience-npm/tetrascience-react-ui) [![CI](https://github.com/tetrascience/ts-lib-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/tetrascience/ts-lib-ui-kit/actions/workflows/ci.yml) **[Storybook](https://ts-lib-ui-kit-storybook.vercel.app/)** | **[Contributing Guide](./CONTRIBUTING.md)**

## Version

v0.5.0

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

## Compatibility

| Library version | React | Node.js | TDP (server utilities) |
| --------------- | ----- | ------- | ---------------------- |
| v0.5.x          | 19+   | 18+     | v4.x+                  |
| v0.4.x          | 19+   | 18+     | v4.x+                  |

> **Note:** The client-side components have no TDP version dependency.
> The `/server` utilities (JWT auth, provider helpers) require a running TDP instance of v4.x or later.
> Browser support follows React 19's matrix (modern evergreen browsers).

## Installation

```bash
yarn add @tetrascience-npm/tetrascience-react-ui
```

## Quick Start

```tsx
// 1. Import the CSS once at your app root (required)
import "@tetrascience-npm/tetrascience-react-ui/index.css";

// 2. Import components
import { Button, Card, CardHeader, CardContent } from "@tetrascience-npm/tetrascience-react-ui";

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

| Import path                                                  | Use case                                                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `@tetrascience-npm/tetrascience-react-ui/index.css`          | **Pre-built CSS** — use this for most apps. Import once at your app root.                            |
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

AppHeader, AppLayout, AssistantModal, CodeScriptEditorButton, LaunchContent, Main, Navbar, ProcessFlow, ProtocolConfiguration, ProtocolYamlCard, PythonEditorModal, Sidebar, TdpLink, TdpSearch, TdpUrl

#### ProcessFlow

Use `ProcessFlow` to render parent-owned multi-step workflow state such as uploads, validation pipelines, review flows, processing stages, and setup sequences. Import it from the package and keep all workflow transitions and side effects in the consuming app.

```tsx
import {
  PROCESS_FLOW_STEP_STATUSES,
  ProcessFlow,
  type ProcessFlowStep,
  type ProcessFlowStepStatus,
} from "@tetrascience-npm/tetrascience-react-ui";

const steps: ProcessFlowStep[] = [
  { id: "upload", label: "Upload", description: "Choose source files", status: "completed" },
  { id: "validate", label: "Validate", description: "Check schema and lineage", status: "active" },
  { id: "publish", label: "Publish", description: "Send downstream", status: "pending" },
];

function WorkflowProgress() {
  return (
    <ProcessFlow
      steps={steps}
      selectedStepId="validate"
      onStepSelect={(step, details) => {
        console.log(step.id, details.status);
      }}
    />
  );
}

const allStatuses: readonly ProcessFlowStepStatus[] = PROCESS_FLOW_STEP_STATUSES;
```

Expected contract:

- `status` is independently controlled per step: `pending`, `active`, `completed`, `error`, or `disabled`.
- `selectedStepId` means the step the user is viewing or has clicked; it is separate from the `active` workflow state.
- `onStepSelect` emits user selection only. It does not mean a workflow step completed.
- Parent workflow code owns completion, error handling, retries, analytics, and other side effects.
- `description` is shown by default. Pass `showDescriptions={false}` to hide all descriptions.
- Descriptions auto-hide at narrow container widths (≤40rem) for mobile layouts.
- The component fills 100% of its container width — size it by controlling the container.
- Selected completed steps render with a green label; selected active steps render with a blue label.
- Use `connections` and per-step `position` only for simple branching/configurable flows.

For AI-assisted consuming apps, add a short instruction like this to the app's `AGENTS.md` or `CLAUDE.md`:

```md
Use `ProcessFlow` from `@tetrascience-npm/tetrascience-react-ui` for multi-step workflow visualization. Do not build a custom stepper for upload, validation, review, approval, processing, or setup flows. Parent components own the workflow state and pass `steps: ProcessFlowStep[]`; each step status must be one of `PROCESS_FLOW_STEP_STATUSES`. Use `selectedStepId` only for the viewed/selected step. Keep completion/error side effects in the parent workflow code, not inside `ProcessFlow`.
```

### Charts (`charts/`)

Plotly.js-based data visualisations:

AreaGraph, BarGraph, Boxplot, Chromatogram, ChromatogramChart, DotPlot, Heatmap, Histogram, LineGraph, PieChart, PlateMap, ScatterGraph

## Server Utilities

Beyond UI components, this library includes server-side helper functions for building TetraScience applications. These are available via the `/server` subpath to avoid pulling Node.js dependencies into browser bundles.

### Authentication (`server/auth`)

**JWT Token Manager** - Manages JWT token retrieval for data apps:

```typescript
import { jwtManager } from "@tetrascience-npm/tetrascience-react-ui/server";

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
import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";
import { getProviderConfigurations, buildProvider, jwtManager } from "@tetrascience-npm/tetrascience-react-ui/server";

// Get user's auth token from request (e.g., in Express middleware)
const userToken = await jwtManager.getTokenFromExpressRequest(req);

// Create TDPClient with the user's auth token
// Other fields (tdpEndpoint, connectorId, orgSlug) are read from environment variables
const client = new TDPClient({
  authToken: userToken,
  artifactType: "data-app",
});
await client.init();

// Get all configured providers for this data app
const providers = await getProviderConfigurations(client);

for (const config of providers) {
  console.log(`Provider: ${config.name} (${config.type})`);

  // Build a database connection from the config
  const provider = await buildProvider(config);
  const results = await provider.query("SELECT * FROM my_table LIMIT 10");
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
} from "@tetrascience-npm/tetrascience-react-ui/server";

// Snowflake
const snowflakeProvider = await buildSnowflakeProvider(config);
const data = await snowflakeProvider.query("SELECT * FROM users");
await snowflakeProvider.close();

// Databricks
const databricksProvider = await buildDatabricksProvider(config);
const data = await databricksProvider.query("SELECT * FROM events");
await databricksProvider.close();

// TDP Athena (uses environment configuration)
const athenaProvider = await getTdpAthenaProvider();
const data = await athenaProvider.query("SELECT * FROM files");
await athenaProvider.close();
```

**Exception Handling:**

```typescript
import {
  QueryError,
  MissingTableError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "@tetrascience-npm/tetrascience-react-ui/server";

try {
  const results = await provider.query("SELECT * FROM missing_table");
} catch (error) {
  if (error instanceof MissingTableError) {
    console.error("Table not found:", error.message);
  } else if (error instanceof QueryError) {
    console.error("Query failed:", error.message);
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
import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";
import { jwtManager } from "@tetrascience-npm/tetrascience-react-ui/server";

// In an Express route handler:
app.get("/api/kv/:key", async (req, res) => {
  // 1. Get the user's JWT from request cookies
  const userToken = await jwtManager.getTokenFromExpressRequest(req);
  if (!userToken) return res.status(401).json({ error: "Not authenticated" });

  // 2. Create a TDPClient authenticated as the user
  //    (CONNECTOR_ID, TDP_ENDPOINT, ORG_SLUG are read from env vars)
  const client = new TDPClient({
    authToken: userToken,
    artifactType: "data-app",
  });
  await client.init();

  // 3. Read a value
  const value = await client.getValue(req.params.key);
  res.json({ key: req.params.key, value });
});

app.put("/api/kv/:key", async (req, res) => {
  const userToken = await jwtManager.getTokenFromExpressRequest(req);
  if (!userToken) return res.status(401).json({ error: "Not authenticated" });

  const client = new TDPClient({
    authToken: userToken,
    artifactType: "data-app",
  });
  await client.init();

  // Write a value (any JSON-serialisable type)
  await client.saveValue(req.params.key, req.body.value, { secure: false });
  res.json({ key: req.params.key, saved: true });
});
```

**Reading multiple values at once:**

```typescript
const values = await client.getValues(["theme", "locale", "last-run"]);
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
import { Button } from "@tetrascience-npm/tetrascience-react-ui";
import type { ButtonProps, BarGraphProps, BarDataSeries } from "@tetrascience-npm/tetrascience-react-ui";
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

- [Storybook – Live Component Demos](https://ts-lib-ui-kit-storybook.vercel.app/) - Browse all components with interactive examples
- [NPM Package](https://www.npmjs.com/package/@tetrascience-npm/tetrascience-react-ui) - Installation and version info
- [Migration Guide](./MIGRATION.md) - Migrating from the old atom/molecule/organism architecture
- [Theming Guide](./THEMING.md) - Customise the design system
- [Contributing](./CONTRIBUTING.md#development-setup) - Clone the repo and run `yarn storybook`

## MCP server (for AI coding agents)

This library exposes an [MCP](https://modelcontextprotocol.io/) server so AI
coding agents (Claude Code, Cursor, Claude Desktop) can query authoritative
component lists, prop/variant options, and usage examples instead of guessing —
reducing hallucinated component APIs when scaffolding a data app.

There are two endpoints. Pick whichever fits; you can add both.

| Endpoint | URL | Tools |
| --- | --- | --- |
| **Deployed** (no local checkout needed) | `https://ts-lib-ui-kit-storybook.vercel.app/api/mcp` | docs: `list_components`, `get_component`, `search_components` |
| **Local** (needs `yarn storybook` running) | `http://localhost:6006/mcp` | full set: docs **+** write/preview/test stories |

### Add the connection

**Claude Code** — register the deployed server (HTTP transport):

```bash
claude mcp add --transport http ts-ui-kit https://ts-lib-ui-kit-storybook.vercel.app/api/mcp
```

Use `--scope project` to share it with your team via a checked-in `.mcp.json`, or
`--scope user` to make it available across all your projects. For the local
server, run `yarn storybook` first, then:

```bash
claude mcp add --transport http ts-ui-kit-local http://localhost:6006/mcp
```

**Cursor / Claude Desktop / other clients** — add an HTTP MCP server to the
client's MCP config (e.g. Cursor's `.cursor/mcp.json`, or Claude Desktop's
`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ts-ui-kit": {
      "type": "http",
      "url": "https://ts-lib-ui-kit-storybook.vercel.app/api/mcp"
    }
  }
}
```

**Any client (generic helper):**

```bash
npx mcp-add --type http --url "https://ts-lib-ui-kit-storybook.vercel.app/api/mcp"
```

Then ask your agent something like *"using the ts-ui-kit MCP, list the available
components"* or *"build a form using ts-ui-kit primitives"* to confirm it's wired
up.

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
