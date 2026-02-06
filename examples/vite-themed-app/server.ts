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
        { name: "Demo Snowflake", type: "snowflake", iconUrl: null },
        { name: "Demo Databricks", type: "databricks", iconUrl: null },
      ];
      return res.json({
        providers: mockProviders,
        configured: false,
        message: "Not authenticated. Set environment variables or log in to use real providers.",
      });
    }

    // Create TDPClient with user's auth token
    const client = new TDPClient({
      authToken: userToken,
    });
    await client.init();

    const configs = await getProviderConfigurations(client);
    const providers: ProviderInfo[] = configs.map((p) => ({
      name: p.name,
      type: p.type,
      iconUrl: p.iconUrl,
    }));
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
 * POST /api/query
 * Execute a SQL query against a provider
 *
 * SECURITY NOTE: This example includes basic input validation. In production,
 * you should use parameterized queries to prevent SQL injection.
 */
app.post("/api/query", async (req, res) => {
  const { providerName, sql } = req.body;

  // ===== INPUT VALIDATION =====
  // Basic validation - in production, consider more robust validation
  if (typeof sql !== "string" || sql.trim() === "") {
    return res.status(400).json({ error: "SQL query must be a non-empty string" });
  }

  // Basic safeguard against excessively large queries
  const MAX_SQL_LENGTH = 262144;
  if (sql.length > MAX_SQL_LENGTH) {
    return res.status(400).json({ error: "SQL query length exceeds allowed limit" });
  }

  // Validate provider name if specified (prevent injection via provider name)
  if (providerName !== undefined && (typeof providerName !== "string" || providerName.length > 256)) {
    return res.status(400).json({ error: "Invalid provider name" });
  }

  // Example: Block dangerous SQL patterns (this is NOT a substitute for parameterized queries)
  // In production, prefer using the provider's built-in parameterized query support:
  //   await provider.query("SELECT * FROM users WHERE id = ?", [userId]);
  const dangerousPatterns = [
    /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)\s+/i,
    /--/,  // SQL comments
    /\/\*/, // Block comments
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return res.status(400).json({
        error: "Query contains potentially dangerous patterns. Use parameterized queries instead.",
      });
    }
  }
  // ===== END INPUT VALIDATION =====

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
    const client = new TDPClient({
      authToken: userToken,
    });
    await client.init();

    // Get provider configurations
    const configs = await getProviderConfigurations(client);
    const config = configs.find((c) => c.name === providerName) || configs[0];

    if (!config) {
      return res.status(404).json({ error: "No providers configured" });
    }

    // Build and use the provider
    const provider = await buildProvider(config);
    activeProvider = provider;

    const results = await provider.query(sql);
    await provider.close();
    activeProvider = null;

    const queryResult: QueryResult = {
      data: results,
      rowCount: results.length,
      provider: config.name,
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

