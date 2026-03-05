/**
 * Example Express server demonstrating Data App Provider helpers
 *
 * This server shows how to use the provider helpers from @tetrascience-npm/tetrascience-react-ui/server
 * to connect to database providers (Snowflake, Databricks, Athena) and serve data to a React frontend.
 *
 * Environment Variables:
 * - DATA_APP_PROVIDER_CONFIG: JSON override for local development
 * - CONNECTOR_ID: Connector ID for fetching providers from TDP
 * - TDP_ENDPOINT: TDP API base URL
 * - ORG_SLUG: Organization slug
 *
 * In production, user authentication is handled via JWT tokens in request cookies.
 * The jwtManager extracts the user's token from ts-auth-token or ts-token-ref cookies.
 */

import express from "express";
import cookieParser from "cookie-parser";
import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";
import {
  getProviderConfigurations,
  getProviderInfoList,
  getProviderByName,
  buildProvider,
  jwtManager,
  QueryError,
  MissingTableError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
  type ProviderInfo,
  type QueryResult,
} from "@tetrascience-npm/tetrascience-react-ui/server";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser()); // Required for jwtManager to extract tokens from cookies

// Store active provider connections
let activeProvider: Awaited<ReturnType<typeof buildProvider>> | null = null;

/**
 * GET /api/providers
 * Returns list of configured data app providers
 *
 * Note: This example uses the user's JWT token from request cookies for authentication.
 * The jwtManager handles both ts-auth-token (direct JWT) and ts-token-ref (reference
 * that is resolved via the connector K/V store).
 */
app.get("/api/providers", async (req, res) => {
  try {
    // Extract user's JWT token from request cookies
    const userToken = await jwtManager.getTokenFromExpressRequest(req);

    if (!userToken) {
      // Return mock data when not authenticated (for demo purposes)
      const mockProviders: ProviderInfo[] = [
        { name: "Demo Snowflake", type: "snowflake", iconUrl: null, availableFields: ["user", "password", "account", "warehouse", "database"] },
        { name: "Demo Databricks", type: "databricks", iconUrl: null, availableFields: ["server_hostname", "http_path", "access_token"] },
      ];
      return res.json({
        providers: mockProviders,
        configured: false,
        message: "Not authenticated. Set environment variables or log in to use real providers.",
      });
    }

    // Create TDPClient with user's auth token
    // Other fields (tdpEndpoint, connectorId, orgSlug) are read from environment variables
    const client = new TDPClient({
      authToken: userToken,
      artifactType: "data-app",
    });
    await client.init();

    const configs = await getProviderConfigurations(client);
    // Use getProviderInfoList to extract display-friendly provider info
    // This strips secret values and includes only field names
    const providers = getProviderInfoList(configs);
    return res.json({
      providers,
      configured: true,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return res.status(500).json({ error: "Failed to fetch providers" });
  }
});

/**
 * GET /api/tables/:tableName
 * Fetch data from a specific table with optional limit
 *
 * This demonstrates a safer pattern than exposing raw SQL:
 * - Table name is validated against an allowlist
 * - Query is constructed server-side with parameterized values
 * - User input is limited to safe parameters (limit, offset)
 */

// Allowlist of tables that can be queried
const ALLOWED_TABLES = ["files", "samples", "experiments", "results"] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

function isAllowedTable(table: string): table is AllowedTable {
  return ALLOWED_TABLES.includes(table as AllowedTable);
}

app.get("/api/tables/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 100), 1000); // 1-1000, default 100

  // Validate table name against allowlist
  if (!isAllowedTable(tableName)) {
    return res.status(400).json({
      error: "Invalid table name",
      allowedTables: ALLOWED_TABLES,
    });
  }

  try {
    // Extract user's JWT token from request cookies
    const userToken = await jwtManager.getTokenFromExpressRequest(req);

    if (!userToken) {
      // Return mock data when not authenticated
      const mockResult: QueryResult = {
        data: [
          { id: 1, name: "Sample Record 1", value: 42.5, created_at: "2026-01-28" },
          { id: 2, name: "Sample Record 2", value: 73.2, created_at: "2026-01-27" },
          { id: 3, name: "Sample Record 3", value: 18.9, created_at: "2026-01-26" },
        ],
        rowCount: 3,
        mock: true,
        message: "Mock data returned. Not authenticated - configure providers for real queries.",
      };
      return res.json(mockResult);
    }

    // Create TDPClient with user's auth token
    // Other fields (tdpEndpoint, connectorId, orgSlug) are read from environment variables
    const client = new TDPClient({
      authToken: userToken,
      artifactType: "data-app",
    });
    await client.init();

    // Get provider configurations and find the selected provider
    const configs = await getProviderConfigurations(client);
    const providerName = req.query.provider as string | undefined;

    // Use getProviderByName if a provider is specified, otherwise fall back to first
    const config = providerName
      ? getProviderByName(configs, providerName)
      : configs[0];

    if (!config) {
      return res.status(404).json({
        error: providerName
          ? `Provider "${providerName}" not found`
          : "No providers configured",
      });
    }

    // Build and use the provider
    const provider = await buildProvider(config);
    activeProvider = provider;

    // Construct query server-side with validated table name
    // The table name is safe because it's validated against the allowlist
    const sql = `SELECT * FROM ${tableName} LIMIT ${limit}`;
    const results = await provider.query(sql);
    await provider.close();
    activeProvider = null;

    const queryResult: QueryResult = {
      data: results,
      rowCount: results.length,
      provider: config.name,
      table: tableName,
    };
    return res.json(queryResult);
  } catch (error) {
    // Clean up on error
    if (activeProvider) {
      await activeProvider.close().catch(() => {});
      activeProvider = null;
    }

    if (error instanceof InvalidProviderConfigurationError) {
      return res.status(401).json({ error: "Not authenticated", details: error.message });
    }
    if (error instanceof MissingTableError) {
      return res.status(404).json({ error: "Table not found", details: error.message });
    }
    if (error instanceof QueryError) {
      return res.status(400).json({ error: "Query failed", details: error.message });
    }
    if (error instanceof ProviderConnectionError) {
      return res.status(503).json({ error: "Connection failed", details: error.message });
    }

    console.error("Query error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Helper: create a TDPClient authenticated with the requesting user's JWT.
 * Returns null when the user is not authenticated (no token in cookies).
 */
async function getUserTdpClient(req: express.Request): Promise<TDPClient | null> {
  const userToken = await jwtManager.getTokenFromExpressRequest(req);
  if (!userToken) return null;

  const client = new TDPClient({
    authToken: userToken,
    artifactType: "data-app",
  });
  await client.init();
  return client;
}

/**
 * GET /api/kv/:key
 * Read a single value from the connector key/value store
 *
 * The value is returned as-is
 * Returns 404 when the key does not exist or the value is null (e.g. a
 * protected/secure key that the user token cannot read)
 */
app.get("/api/kv/:key", async (req, res) => {
  try {
    const client = await getUserTdpClient(req);
    if (!client) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { key } = req.params;
    const value = await client.getValue(key);

    if (value === undefined || value === null) {
      return res.status(404).json({ error: "Key not found", key });
    }

    return res.json({ key, value });
  } catch (error) {
    console.error("KV get error:", error);
    return res.status(500).json({ error: "Failed to read value" });
  }
});

/**
 * GET /api/kv
 * Read multiple values at once
 *
 * Pass keys as a comma-separated query parameter:
 *   GET /api/kv?keys=theme,locale,last-run
 *
 * Returns an object mapping each key to its value (null for missing/protected keys)
 */
app.get("/api/kv", async (req, res) => {
  try {
    const client = await getUserTdpClient(req);
    if (!client) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const keysParam = req.query.keys;
    if (!keysParam || typeof keysParam !== "string") {
      return res.status(400).json({ error: "Missing 'keys' query parameter (comma-separated)" });
    }

    const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No valid keys provided" });
    }

    const values = await client.getValues(keys);

    // Zip keys with returned values into a record
    const result: Record<string, unknown> = {};
    for (const [i, key] of keys.entries()) {
      result[key] = values[i] ?? null;
    }

    return res.json({ values: result });
  } catch (error) {
    console.error("KV getValues error:", error);
    return res.status(500).json({ error: "Failed to read values" });
  }
});

/**
 * PUT /api/kv/:key
 * Write a value to the connector key/value store
 *
 * Request body: { "value": <any JSON value> }
 *
 * The value can be any JSON-serialisable type (string, number, object, array)
 * By default values are stored as non-protected (readable by user tokens)
 */
app.put("/api/kv/:key", async (req, res) => {
  try {
    const client = await getUserTdpClient(req);
    if (!client) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { key } = req.params;
    const { value, secure } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Missing 'value' in request body" });
    }

    await client.saveValue(key, value, { secure: Boolean(secure) });

    return res.json({ key, saved: true, secure: Boolean(secure) });
  } catch (error) {
    console.error("KV save error:", error);
    return res.status(500).json({ error: "Failed to save value" });
  }
});

/**
 * DELETE /api/kv/:key
 * Delete a value from the connector key/value store.
 *
 * Uses the underlying connector data API to remove the key.
 */
app.delete("/api/kv/:key", async (req, res) => {
  try {
    const client = await getUserTdpClient(req);
    if (!client) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { key } = req.params;
    const connectorId = process.env.CONNECTOR_ID;
    if (!connectorId) {
      return res.status(500).json({ error: "CONNECTOR_ID not configured" });
    }

    const api = client.api;
    if (!api) {
      return res.status(500).json({ error: "TDPClient not initialised" });
    }

    await api.v1.deleteConnectorData(connectorId, { keys: [key] });

    return res.json({ key, deleted: true });
  } catch (error) {
    console.error("KV delete error:", error);
    return res.status(500).json({ error: "Failed to delete value" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("\nEnvironment:");
  console.log(`  TDP_ENDPOINT: ${process.env.TDP_ENDPOINT || "(not set)"}`);
  console.log(`  CONNECTOR_ID: ${process.env.CONNECTOR_ID || "(not set)"}`);
  console.log(`  ORG_SLUG: ${process.env.ORG_SLUG || "(not set)"}`);
});

