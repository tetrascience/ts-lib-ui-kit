import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  getProviderConfigurations,
  InvalidProviderConfigurationError,
} from "../getProviderConfigurations";

import type { ContainerDataApp, ProviderApiResponse } from "../types";
import type { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";

/**
 * Creates a mock TDPClient that mimics the structure of an initialized TDPClient.
 * TDPClient exposes api.dataApps.* methods after init() is called.
 */
function createMockClient() {
  const mockDataApps = {
    getContainerDataApp: vi.fn(),
    getOrganizationBySlug: vi.fn().mockResolvedValue({ id: "org-123" }),
    getProviderById: vi.fn(),
  };

  return {
    isInitialized: true,
    config: {
      orgSlug: "test-org",
    },
    api: {
      dataApps: mockDataApps,
    },
  } as unknown as TDPClient & {
    api: {
      dataApps: {
        getContainerDataApp: ReturnType<typeof vi.fn>;
        getOrganizationBySlug: ReturnType<typeof vi.fn>;
        getProviderById: ReturnType<typeof vi.fn>;
      };
    };
  };
}

describe("getProviderConfigurations", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("with DATA_APP_PROVIDER_CONFIG override", () => {
    it("should parse valid JSON from environment variable", async () => {
      const config = [
        {
          name: "test-provider",
          type: "snowflake",
          iconUrl: "https://example.com/icon.png",
          fields: { user: "testuser", password: "testpass" },
        },
      ];
      process.env.DATA_APP_PROVIDER_CONFIG = JSON.stringify(config);

      const client = createMockClient();
      const result = await getProviderConfigurations(client);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(config[0]);
      expect(client.api!.dataApps.getContainerDataApp).not.toHaveBeenCalled();
    });

    it("should parse valid JSON from options override", async () => {
      const config = [
        {
          name: "local-provider",
          type: "databricks",
          fields: { host: "localhost" },
        },
      ];

      const client = createMockClient();
      const result = await getProviderConfigurations(client, {
        providerConfigOverride: JSON.stringify(config),
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("local-provider");
      expect(result[0].type).toBe("databricks");
      expect(result[0].iconUrl).toBeUndefined();
    });

    it("should throw InvalidProviderConfigurationError for invalid JSON", async () => {
      process.env.DATA_APP_PROVIDER_CONFIG = "not valid json";

      const client = createMockClient();
      await expect(getProviderConfigurations(client)).rejects.toThrow(
        InvalidProviderConfigurationError,
      );
    });

    it("should throw InvalidProviderConfigurationError when config is not an array", async () => {
      process.env.DATA_APP_PROVIDER_CONFIG = JSON.stringify({
        name: "single-object",
      });

      const client = createMockClient();
      await expect(getProviderConfigurations(client)).rejects.toThrow("expected an array");
    });

    it("should throw InvalidProviderConfigurationError when entry is missing name", async () => {
      process.env.DATA_APP_PROVIDER_CONFIG = JSON.stringify([
        { type: "snowflake", fields: {} },
      ]);

      const client = createMockClient();
      await expect(getProviderConfigurations(client)).rejects.toThrow("'name' must be a string");
    });

    it("should throw InvalidProviderConfigurationError when entry is missing type", async () => {
      process.env.DATA_APP_PROVIDER_CONFIG = JSON.stringify([
        { name: "test", fields: {} },
      ]);

      const client = createMockClient();
      await expect(getProviderConfigurations(client)).rejects.toThrow("'type' must be a string");
    });

    it("should throw InvalidProviderConfigurationError when entry is missing fields", async () => {
      process.env.DATA_APP_PROVIDER_CONFIG = JSON.stringify([
        { name: "test", type: "snowflake" },
      ]);

      const client = createMockClient();
      await expect(getProviderConfigurations(client)).rejects.toThrow("'fields' must be an object");
    });
  });

  describe("without override - fetching from TDP", () => {
    it("should return empty array when CONNECTOR_ID is not set", async () => {
      delete process.env.DATA_APP_PROVIDER_CONFIG;
      delete process.env.CONNECTOR_ID;

      const client = createMockClient();
      const result = await getProviderConfigurations(client);

      expect(result).toEqual([]);
      expect(client.api!.dataApps.getContainerDataApp).not.toHaveBeenCalled();
    });

    it("should fetch providers from TDP when CONNECTOR_ID is set", async () => {
      delete process.env.DATA_APP_PROVIDER_CONFIG;
      process.env.CONNECTOR_ID = "test-connector-id";
      process.env.SNOWFLAKE_PROVIDER_USER = "myuser";
      process.env.SNOWFLAKE_PROVIDER_PASSWORD = "mypassword";

      const mockContainerApp: ContainerDataApp = {
        id: "app-123",
        orgSlug: "test-org",
        connectorId: "test-connector-id",
        serviceNamespace: "namespace",
        serviceDiscoveryName: "discovery",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user-1",
        port: "8080",
        config: {},
        providers: [
          {
            id: "provider-1",
            orgSlug: "test-org",
            name: "snowflake-provider",
            type: "snowflake",
            iconUrl: "https://example.com/snowflake.png",
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: "user-1",
          },
        ],
      };

      const mockProvider: ProviderApiResponse = {
        id: "provider-1",
        orgSlug: "test-org",
        name: "snowflake-provider",
        type: "snowflake",
        iconUrl: "https://example.com/snowflake.png",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user-1",
        dataAppCount: "1",
        secrets: [
          {
            name: "user",
            type: "string",
            required: true,
            arn: "arn:aws:secretsmanager:...",
            envName: "SNOWFLAKE_PROVIDER_USER",
          },
          {
            name: "password",
            type: "string",
            required: true,
            arn: "arn:aws:secretsmanager:...",
            envName: "SNOWFLAKE_PROVIDER_PASSWORD",
          },
        ],
      };

      const client = createMockClient();
      client.api!.dataApps.getContainerDataApp.mockResolvedValue(mockContainerApp);
      client.api!.dataApps.getProviderById.mockResolvedValue(mockProvider);

      const result = await getProviderConfigurations(client);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "snowflake-provider",
        type: "snowflake",
        iconUrl: "https://example.com/snowflake.png",
        fields: {
          // Uses secret.name (canonical field name) as key, not secret.envName
          user: "myuser",
          password: "mypassword",
        },
      });
      expect(client.api!.dataApps.getContainerDataApp).toHaveBeenCalledWith("test-connector-id");
      expect(client.api!.dataApps.getProviderById).toHaveBeenCalledWith("provider-1", "org-123");
    });

    it("should use connectorId from options over environment variable", async () => {
      delete process.env.DATA_APP_PROVIDER_CONFIG;
      process.env.CONNECTOR_ID = "env-connector";

      const mockContainerApp: ContainerDataApp = {
        id: "app-123",
        orgSlug: "test-org",
        connectorId: "options-connector",
        serviceNamespace: "namespace",
        serviceDiscoveryName: "discovery",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user-1",
        port: "8080",
        config: {},
        providers: [],
      };

      const client = createMockClient();
      client.api!.dataApps.getContainerDataApp.mockResolvedValue(mockContainerApp);

      await getProviderConfigurations(client, {
        connectorId: "options-connector",
      });

      expect(client.api!.dataApps.getContainerDataApp).toHaveBeenCalledWith("options-connector");
    });

    it("should handle missing environment variables for secrets", async () => {
      delete process.env.DATA_APP_PROVIDER_CONFIG;
      process.env.CONNECTOR_ID = "test-connector-id";
      delete process.env.MISSING_SECRET;

      const mockContainerApp: ContainerDataApp = {
        id: "app-123",
        orgSlug: "test-org",
        connectorId: "test-connector-id",
        serviceNamespace: "namespace",
        serviceDiscoveryName: "discovery",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user-1",
        port: "8080",
        config: {},
        providers: [
          {
            id: "provider-1",
            orgSlug: "test-org",
            name: "test-provider",
            type: "custom",
            iconUrl: "",
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: "user-1",
          },
        ],
      };

      const mockProvider: ProviderApiResponse = {
        id: "provider-1",
        orgSlug: "test-org",
        name: "test-provider",
        type: "custom",
        iconUrl: "",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "user-1",
        dataAppCount: "1",
        secrets: [
          {
            name: "secret",
            type: "string",
            required: true,
            arn: "arn:aws:secretsmanager:...",
            envName: "MISSING_SECRET",
          },
        ],
      };

      const client = createMockClient();
      client.api!.dataApps.getContainerDataApp.mockResolvedValue(mockContainerApp);
      client.api!.dataApps.getProviderById.mockResolvedValue(mockProvider);

      const result = await getProviderConfigurations(client);

      // Uses secret.name as the field key, not envName
      expect(result[0].fields.secret).toBeUndefined();
    });

    it("should throw error when TDPClient is not initialized", async () => {
      delete process.env.DATA_APP_PROVIDER_CONFIG;
      process.env.CONNECTOR_ID = "test-connector-id";

      const client = createMockClient();
      // Override isInitialized to return false
      Object.defineProperty(client, "isInitialized", { value: false });

      await expect(getProviderConfigurations(client)).rejects.toThrow(
        "TDPClient is not initialized",
      );
    });
  });
});

