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

    // Get provider configurations
    const configs = await getProviderConfigurations(client);
    const config = configs[0];

    if (!config) {
      return res.status(404).json({ error: "No providers configured" });
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

