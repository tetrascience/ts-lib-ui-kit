import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock connection and functions
const mockStatement = {
  streamRows: vi.fn(),
};

const mockConnection = {
  execute: vi.fn(),
  destroy: vi.fn(),
};

const mockCreateConnection = vi.fn();
mockCreateConnection.mockImplementation(() => ({
  connect: vi.fn((callback: (err: Error | undefined, conn: unknown) => void) => {
    // Simulate successful connection
    callback(undefined, mockConnection);
  }),
  ...mockConnection,
}));

// Mock snowflake-sdk
vi.mock("snowflake-sdk", () => ({
  default: {
    createConnection: () => mockCreateConnection(),
  },
  createConnection: () => mockCreateConnection(),
}));

// Import after mocking
import { InvalidProviderConfigurationError } from "../getProviderConfigurations";
import { SnowflakeProvider, buildSnowflakeProvider } from "../SnowflakeProvider";

import type { ProviderConfiguration } from "../types";

describe("SnowflakeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("SnowflakeProvider class", () => {
    it("should query with parameters", async () => {
      const rows = [{ id: 1, name: "test" }];
      mockConnection.execute.mockImplementation((options) => {
        options.complete(undefined, mockStatement, rows);
      });

      const provider = new SnowflakeProvider(mockConnection as unknown as import("snowflake-sdk").Connection);
      const result = await provider.query("SELECT * FROM test", {});

      expect(result).toEqual(rows);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sqlText: "SELECT * FROM test",
        }),
      );
    });

    it("should handle query errors", async () => {
      mockConnection.execute.mockImplementation((options) => {
        options.complete(new Error("Query failed"));
      });

      const provider = new SnowflakeProvider(mockConnection as unknown as import("snowflake-sdk").Connection);

      await expect(provider.query("SELECT * FROM test")).rejects.toThrow("Query failed");
    });

    it("should close connection", async () => {
      mockConnection.destroy.mockImplementation((callback) => {
        callback();
      });

      const provider = new SnowflakeProvider(mockConnection as unknown as import("snowflake-sdk").Connection);
      await provider.close();

      expect(mockConnection.destroy).toHaveBeenCalled();
    });
  });

  describe("buildSnowflakeProvider", () => {
    it("should throw error for missing required fields", async () => {
      const incompleteConfig: ProviderConfiguration = {
        name: "test-snowflake",
        type: "snowflake",
        fields: {
          account: "test-account",
          // Missing other required fields
        },
      };

      await expect(buildSnowflakeProvider(incompleteConfig)).rejects.toThrow(
        InvalidProviderConfigurationError,
      );
    });

    it("should validate all required fields are present", async () => {
      const configMissingUser: ProviderConfiguration = {
        name: "test-snowflake",
        type: "snowflake",
        fields: {
          account: "test-account",
          password: "test-password",
          warehouse: "test-warehouse",
          database: "test-database",
          schema: "test-schema",
          role: "test-role",
          // Missing 'user'
        },
      };

      await expect(buildSnowflakeProvider(configMissingUser)).rejects.toThrow(
        "Missing field 'user'",
      );
    });
  });
});

