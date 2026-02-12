import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock objects
const mockOperation = {
  fetchAll: vi.fn(() => Promise.resolve([{ id: 1, name: "test" }])),
  close: vi.fn(() => Promise.resolve()),
};

const mockSession = {
  executeStatement: vi.fn(() => Promise.resolve(mockOperation)),
  close: vi.fn(() => Promise.resolve()),
};

const mockClient = {
  connect: vi.fn(() => Promise.resolve()),
  openSession: vi.fn(() => Promise.resolve(mockSession)),
  close: vi.fn(() => Promise.resolve()),
};

// Mock @databricks/sql
vi.mock("@databricks/sql", () => ({
  DBSQLClient: vi.fn(() => mockClient),
}));

// Import after mocking
import { DatabricksProvider, buildDatabricksProvider } from "../DatabricksProvider";
import { InvalidProviderConfigurationError } from "../getProviderConfigurations";

import type { ProviderConfiguration } from "../types";

describe("DatabricksProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe("DatabricksProvider class", () => {
    it("should execute query and return results", async () => {
      const expectedRows = [{ id: 1, name: "test" }];
      mockOperation.fetchAll.mockResolvedValueOnce(expectedRows);

      const provider = new DatabricksProvider(mockClient as unknown as import("@databricks/sql").DBSQLClient, mockSession as unknown as import("@databricks/sql/dist/contracts/IDBSQLSession").default);
      const result = await provider.query("SELECT * FROM test");

      expect(mockSession.executeStatement).toHaveBeenCalledWith("SELECT * FROM test");
      expect(mockOperation.fetchAll).toHaveBeenCalled();
      expect(mockOperation.close).toHaveBeenCalled();
      expect(result).toEqual(expectedRows);
    });

    it("should close session and client", async () => {
      const provider = new DatabricksProvider(mockClient as unknown as import("@databricks/sql").DBSQLClient, mockSession as unknown as import("@databricks/sql/dist/contracts/IDBSQLSession").default);
      await provider.close();

      expect(mockSession.close).toHaveBeenCalled();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });

  describe("buildDatabricksProvider", () => {
    const validConfig: ProviderConfiguration = {
      name: "test-databricks",
      type: "databricks",
      fields: {
        server_hostname: "test.databricks.com",
        http_path: "/sql/warehouses/abc123",
        client_id: "client-id",
        client_secret: "client-secret",
        catalog: "test-catalog",
        schema: "test-schema",
      },
    };

    it("should create provider with valid config", async () => {
      process.env.ORG_SLUG = "test-org";

      const provider = await buildDatabricksProvider(validConfig);

      expect(mockClient.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "test.databricks.com",
          path: "/sql/warehouses/abc123",
        }),
      );
      expect(mockClient.openSession).toHaveBeenCalledWith(
        expect.objectContaining({
          initialCatalog: "test-catalog",
          initialSchema: "test-schema",
        }),
      );
      expect(provider).toBeInstanceOf(DatabricksProvider);
    });

    it("should use default schema when not provided", async () => {
      process.env.ORG_SLUG = "test-org";
      const configWithoutSchema = {
        ...validConfig,
        fields: { ...validConfig.fields },
      };
      delete configWithoutSchema.fields.schema;

      await buildDatabricksProvider(configWithoutSchema);

      expect(mockClient.openSession).toHaveBeenCalledWith(
        expect.objectContaining({
          initialSchema: "test_org__tss__default",
        }),
      );
    });

    it("should throw error for missing required fields", async () => {
      const incompleteConfig: ProviderConfiguration = {
        name: "test-databricks",
        type: "databricks",
        fields: {
          server_hostname: "test.databricks.com",
          // Missing other required fields
        },
      };

      await expect(buildDatabricksProvider(incompleteConfig)).rejects.toThrow(
        InvalidProviderConfigurationError,
      );
    });

    it("should throw error when catalog is missing", async () => {
      const configMissingCatalog: ProviderConfiguration = {
        name: "test-databricks",
        type: "databricks",
        fields: {
          server_hostname: "test.databricks.com",
          http_path: "/sql/warehouses/abc123",
          client_id: "client-id",
          client_secret: "client-secret",
          // Missing 'catalog'
        },
      };

      await expect(buildDatabricksProvider(configMissingCatalog)).rejects.toThrow(
        "Missing field 'catalog'",
      );
    });
  });
});

