import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the provider builders
const mockSnowflakeProvider = { query: vi.fn(), close: vi.fn() };
const mockDatabricksProvider = { query: vi.fn(), close: vi.fn() };
const mockAthenaProvider = { query: vi.fn(), close: vi.fn() };

vi.mock("../SnowflakeProvider", () => ({
  buildSnowflakeProvider: vi.fn(() => Promise.resolve(mockSnowflakeProvider)),
  SnowflakeProvider: vi.fn(),
}));

vi.mock("../DatabricksProvider", () => ({
  buildDatabricksProvider: vi.fn(() => Promise.resolve(mockDatabricksProvider)),
  DatabricksProvider: vi.fn(),
}));

vi.mock("../AthenaProvider", () => ({
  getTdpAthenaProvider: vi.fn(() => Promise.resolve(mockAthenaProvider)),
  AthenaProvider: vi.fn(),
}));

// Import after mocking
import { buildProvider } from "../buildProvider";
import { InvalidProviderConfigurationError } from "../getProviderConfigurations";

import type { ProviderConfiguration } from "../types";

describe("buildProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createConfig = (type: string): ProviderConfiguration => ({
    name: `test-${type}-provider`,
    type,
    fields: {
      account: "test-account",
      user: "test-user",
      password: "test-password",
      warehouse: "test-warehouse",
      database: "test-database",
      schema: "test-schema",
      role: "test-role",
    },
  });

  describe("snowflake provider", () => {
    it("should build a Snowflake provider", async () => {
      const config = createConfig("snowflake");

      const result = await buildProvider(config);

      expect(result).toBe(mockSnowflakeProvider);
    });
  });

  describe("databricks provider", () => {
    it("should build a Databricks provider", async () => {
      const config: ProviderConfiguration = {
        name: "test-databricks-provider",
        type: "databricks",
        fields: {
          server_hostname: "test.databricks.com",
          http_path: "/sql/warehouses/abc123",
          client_id: "client-id",
          client_secret: "client-secret",
          catalog: "test-catalog",
        },
      };

      const result = await buildProvider(config);

      expect(result).toBe(mockDatabricksProvider);
    });
  });

  describe("athena provider", () => {
    it("should build an Athena provider", async () => {
      const config = createConfig("athena");

      const result = await buildProvider(config);

      expect(result).toBe(mockAthenaProvider);
    });
  });

  describe("unsupported provider", () => {
    it("should throw InvalidProviderConfigurationError for unsupported type", async () => {
      const config = createConfig("unknown-type");

      await expect(buildProvider(config)).rejects.toThrow(
        InvalidProviderConfigurationError,
      );
      await expect(buildProvider(config)).rejects.toThrow(
        "Unsupported provider type: unknown-type",
      );
    });
  });
});

