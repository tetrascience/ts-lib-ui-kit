import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryExecutionState } from "@aws-sdk/client-athena";

// Create mock client
const mockSend = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@aws-sdk/client-athena", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-athena")>();
  return {
    ...actual,
    AthenaClient: vi.fn(() => ({
      send: mockSend,
      destroy: mockDestroy,
    })),
  };
});

// Import after mocking
import { AthenaProvider, getTdpAthenaProvider } from "../AthenaProvider";
import { QueryError, MissingTableError } from "../exceptions";

describe("AthenaProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe("AthenaProvider class", () => {
    it("should throw error for query exceeding max length", async () => {
      const mockClient = { send: mockSend, destroy: mockDestroy };
      const provider = new AthenaProvider(
        mockClient as unknown as import("@aws-sdk/client-athena").AthenaClient,
        "test-workgroup",
        "test-database",
      );

      const longQuery = "x".repeat(262145); // Exceeds 262144 limit

      await expect(provider.query(longQuery)).rejects.toThrow(
        "Query length exceeds the maximum allowed limit",
      );
    });

    it("should execute query successfully", async () => {
      // Mock StartQueryExecution
      mockSend.mockResolvedValueOnce({ QueryExecutionId: "query-123" });

      // Mock GetQueryExecution (query completed)
      mockSend.mockResolvedValueOnce({
        QueryExecution: {
          Status: { State: QueryExecutionState.SUCCEEDED },
        },
      });

      // Mock GetQueryResults
      mockSend.mockResolvedValueOnce({
        ResultSet: {
          ResultSetMetadata: {
            ColumnInfo: [{ Name: "id" }, { Name: "name" }],
          },
          Rows: [
            { Data: [{ VarCharValue: "id" }, { VarCharValue: "name" }] }, // Header
            { Data: [{ VarCharValue: "1" }, { VarCharValue: "test" }] },
          ],
        },
      });

      const mockClient = { send: mockSend, destroy: mockDestroy };
      const provider = new AthenaProvider(
        mockClient as unknown as import("@aws-sdk/client-athena").AthenaClient,
        "test-workgroup",
        "test-database",
      );

      const result = await provider.query("SELECT * FROM test");

      expect(result).toEqual([{ id: "1", name: "test" }]);
    });

    it("should throw QueryError when query fails", async () => {
      mockSend.mockResolvedValueOnce({ QueryExecutionId: "query-123" });
      mockSend.mockResolvedValueOnce({
        QueryExecution: {
          Status: {
            State: QueryExecutionState.FAILED,
            StateChangeReason: "Syntax error",
          },
        },
      });

      const mockClient = { send: mockSend, destroy: mockDestroy };
      const provider = new AthenaProvider(
        mockClient as unknown as import("@aws-sdk/client-athena").AthenaClient,
        "test-workgroup",
        "test-database",
      );

      await expect(provider.query("INVALID SQL")).rejects.toThrow(QueryError);
    });

    it("should throw MissingTableError when table not found", async () => {
      mockSend.mockResolvedValueOnce({ QueryExecutionId: "query-123" });
      mockSend.mockResolvedValueOnce({
        QueryExecution: {
          Status: {
            State: QueryExecutionState.FAILED,
            StateChangeReason: "TABLE_NOT_FOUND: table_name",
          },
        },
      });

      const mockClient = { send: mockSend, destroy: mockDestroy };
      const provider = new AthenaProvider(
        mockClient as unknown as import("@aws-sdk/client-athena").AthenaClient,
        "test-workgroup",
        "test-database",
      );

      await expect(provider.query("SELECT * FROM missing")).rejects.toThrow(
        MissingTableError,
      );
    });

    it("should close client", async () => {
      const mockClient = { send: mockSend, destroy: mockDestroy };
      const provider = new AthenaProvider(
        mockClient as unknown as import("@aws-sdk/client-athena").AthenaClient,
        "test-workgroup",
        "test-database",
      );

      await provider.close();

      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe("getTdpAthenaProvider", () => {
    it("should create provider with environment configuration", async () => {
      process.env.ORG_SLUG = "test-org";
      process.env.AWS_REGION = "us-east-1";
      process.env.ATHENA_S3_OUTPUT_LOCATION = "test-bucket";

      // Mock GetWorkGroup to fail (workgroup doesn't exist)
      mockSend.mockRejectedValueOnce(new Error("Workgroup not found"));

      const provider = await getTdpAthenaProvider();

      expect(provider).toBeInstanceOf(AthenaProvider);
    });
  });
});

