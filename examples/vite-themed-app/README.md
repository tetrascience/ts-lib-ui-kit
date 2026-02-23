# Vite Themed App Example

Simple Vite + React example demonstrating TetraScience UI Kit theming and server-side Data App Providers.

## Features

- **Button** component with custom orange theme
- **Card** component with stats
- **Modal** component for interactions
- **Data App Providers** - Server-side database connections (Snowflake, Databricks, Athena)
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
| `/api/query` | POST | Execute SQL query against a provider |
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

## What This Shows

This example demonstrates:
1. How to wrap your app with `ThemeProvider`
2. How to define a custom theme
3. How Button, Card, and Modal respond to the theme
4. **Server-side provider integration** with Express
5. **API proxy configuration** in Vite
6. **Error handling** for database queries
7. Simple, working example without SSR complications

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
