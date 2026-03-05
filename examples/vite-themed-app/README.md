# Vite Themed App Example

Simple Vite + React example demonstrating TetraScience UI Kit theming, server-side Data App Providers, and the Connector Key/Value Store.

## Features

- **Button** component with custom orange theme
- **Card** component with stats
- **Modal** component for interactions
- **Data App Providers** - Server-side database connections (Snowflake, Databricks, Athena)
- **Connector Key/Value Store** - Read, write, and delete values using the user's JWT token
- Custom theme with orange primary color and rounded corners

## Installation

```bash
yarn install
```

## Running

```bash
yarn dev
```

This starts both the Vite dev server (http://localhost:5173) and the Express API server (http://localhost:3001).

To run them separately:

```bash
yarn dev:client  # Vite only
yarn dev:server  # Express only
```

## Data App Providers

This example demonstrates how to use the server-side Data App Provider helpers to connect to database providers and serve data to a React frontend.

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/providers` | GET | List configured database providers |
| `/api/tables/:tableName` | GET | Fetch data from an allowed table |
| `/api/kv/:key` | GET | Read a single value from the KV store |
| `/api/kv?keys=a,b,c` | GET | Read multiple values from the KV store |
| `/api/kv/:key` | PUT | Write a value to the KV store |
| `/api/kv/:key` | DELETE | Delete a value from the KV store |
| `/api/health` | GET | Health check |

### Environment Variables

To connect to real database providers, set these environment variables:

```bash
# TDP Configuration
TDP_ENDPOINT=https://api.tetrascience.com
TDP_INTERNAL_ENDPOINT=https://api.internal.tetrascience.com
TS_AUTH_TOKEN=your-auth-token
ORG_SLUG=your-org-slug
CONNECTOR_ID=your-connector-id

# Or use a local config override
DATA_APP_PROVIDER_CONFIG='[{"name":"My Snowflake","type":"snowflake",...}]'
```

### Mock Mode

When environment variables are not configured, the server returns mock data for demonstration purposes. This allows you to run and test the example without actual database connections.

## Connector Key/Value Store

The key/value store lets data apps persist small pieces of state without an external database. The example endpoints in `server.ts` show how to use the `TDPClient` from `@tetrascience-npm/ts-connectors-sdk` to read, write, and delete values.

### Frontend Usage

The KV store endpoints are standard REST, so you can call them with `fetch` from any React component:

```tsx
// Write a value
await fetch("/api/kv/user-preference", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ value: { theme: "dark", locale: "en-US" } }),
});

// Read a single value
const res = await fetch("/api/kv/user-preference");
const data = await res.json(); // { key, value, ... }

// Read multiple values
const multi = await fetch("/api/kv?keys=user-preference,last-run");
const values = await multi.json(); // [{ key, value }, ...]

// Delete a value
await fetch("/api/kv/user-preference", { method: "DELETE" });
```

See `src/App.tsx` and `src/useKvStore.ts` for a complete working example with loading state and error handling.

### Server Side

```typescript
import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";
import { jwtManager } from "@tetrascience-npm/tetrascience-react-ui/server";

// Get user's JWT from request cookies
const userToken = await jwtManager.getTokenFromExpressRequest(req);

// Create a TDPClient with the user's token
const client = new TDPClient({
  authToken: userToken,
  artifactType: "data-app",
});
await client.init();

// Read / write / delete values
const value = await client.getValue("my-key");
await client.saveValue("my-key", { foo: "bar" }, { secure: false });
```

## What This Shows

This example demonstrates:
1. How to wrap your app with `ThemeProvider`
2. How to define a custom theme
3. How Button, Card, and Modal respond to the theme
4. **Server-side provider integration** with Express
5. **Connector Key/Value Store** — read, write, and delete values with user auth
6. **API proxy configuration** in Vite
7. **Error handling** for database queries

## Theme

```tsx
const orangeTheme = {
  colors: {
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryActive: '#B45309',
  },
  radius: {
    medium: '10px',
    large: '16px',
  },
};
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Express API    │────▶│  TDP / Database │
│  (Vite :5173)   │     │   (:3001)       │     │   Providers     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        └───── /api proxy ──────┘
```

Much simpler than Next.js - just works! 🎉
