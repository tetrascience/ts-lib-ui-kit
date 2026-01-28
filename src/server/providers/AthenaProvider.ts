/**
 * Athena Data Provider
 *
 * TypeScript equivalent of AthenaProvider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 */

import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  GetWorkGroupCommand,
  QueryExecutionState,
} from "@aws-sdk/client-athena";
import { QueryError, MissingTableError } from "./exceptions";

/** Maximum query length allowed by Athena */
const MAX_QUERY_LENGTH = 262144;

/**
 * Athena data provider
 */
export class AthenaProvider {
  private client: AthenaClient;
  private workgroup: string;
  private database: string;
  private outputLocation?: string;

  /**
   * Initialize the Athena data provider
   *
   * @param client - AWS Athena client
   * @param workgroup - Athena workgroup to use
   * @param database - Default database/schema
   * @param outputLocation - Optional S3 output location
   */
  constructor(
    client: AthenaClient,
    workgroup: string,
    database: string,
    outputLocation?: string,
  ) {
    this.client = client;
    this.workgroup = workgroup;
    this.database = database;
    this.outputLocation = outputLocation;
  }

  /**
   * Query the Athena database
   *
   * @param sqlQuery - SQL query to execute
   * @param _params - Parameters to pass to the query (currently not used - Athena doesn't support parameterized queries)
   * @returns Promise resolving to array of row objects
   */
  async query(
    sqlQuery: string,
    _params: Record<string, unknown> = {},
  ): Promise<Array<Record<string, unknown>>> {
    if (sqlQuery.length > MAX_QUERY_LENGTH) {
      throw new Error("Query length exceeds the maximum allowed limit.");
    }

    // Start query execution
    const startCommand = new StartQueryExecutionCommand({
      QueryString: sqlQuery,
      WorkGroup: this.workgroup,
      QueryExecutionContext: {
        Database: this.database,
      },
      ResultConfiguration: this.outputLocation
        ? { OutputLocation: this.outputLocation }
        : undefined,
    });

    const startResponse = await this.client.send(startCommand);
    const queryExecutionId = startResponse.QueryExecutionId;

    if (!queryExecutionId) {
      throw new QueryError("Failed to start query execution");
    }

    // Wait for query to complete
    await this.waitForQueryCompletion(queryExecutionId, sqlQuery);

    // Fetch results
    return this.fetchAllResults(queryExecutionId);
  }

  /**
   * Wait for query to complete
   */
  private async waitForQueryCompletion(
    queryExecutionId: string,
    originalQuery: string,
  ): Promise<void> {
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 1000; // 1 second
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const command = new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      });
      const response = await this.client.send(command);
      const state = response.QueryExecution?.Status?.State;

      if (state === QueryExecutionState.SUCCEEDED) {
        return;
      }

      if (
        state === QueryExecutionState.FAILED ||
        state === QueryExecutionState.CANCELLED
      ) {
        const reason =
          response.QueryExecution?.Status?.StateChangeReason ?? "Unknown error";

        if (reason.includes("TABLE_NOT_FOUND")) {
          const errorTail = reason.split(":").pop()?.trim() ?? "";
          throw new MissingTableError(
            "Athena is unable to find the table. If the table is created by a " +
              "tetraflow, make sure that the tetraflow has run successfully. " +
              errorTail +
              ".",
          );
        }

        throw new QueryError(
          `Query failed: ${originalQuery}. Reason: ${reason}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new QueryError(`Query timed out after ${maxWaitTime / 1000} seconds`);
  }

  /**
   * Fetch all results from a completed query
   */
  private async fetchAllResults(
    queryExecutionId: string,
  ): Promise<Array<Record<string, unknown>>> {
    const results: Array<Record<string, unknown>> = [];
    let nextToken: string | undefined;
    let columnNames: string[] = [];
    let isFirstPage = true;

    do {
      const command = new GetQueryResultsCommand({
        QueryExecutionId: queryExecutionId,
        NextToken: nextToken,
      });

      const response = await this.client.send(command);

      if (isFirstPage && response.ResultSet?.ResultSetMetadata?.ColumnInfo) {
        columnNames = response.ResultSet.ResultSetMetadata.ColumnInfo.map(
          (col) => col.Name ?? "",
        );
      }

      const rows = response.ResultSet?.Rows ?? [];
      // Skip header row on first page
      const dataRows = isFirstPage ? rows.slice(1) : rows;

      for (const row of dataRows) {
        const rowData: Record<string, unknown> = {};
        row.Data?.forEach((cell, index) => {
          const columnName = columnNames[index] ?? `column_${index}`;
          rowData[columnName] = cell.VarCharValue ?? null;
        });
        results.push(rowData);
      }

      nextToken = response.NextToken;
      isFirstPage = false;
    } while (nextToken);

    return results;
  }

  /**
   * Close the Athena client (no-op for AWS SDK clients)
   */
  async close(): Promise<void> {
    this.client.destroy();
  }
}

/**
 * Get the TDP Athena provider
 *
 * Creates an Athena provider using TDP environment configuration
 *
 * @returns Promise resolving to Athena data provider
 */
export async function getTdpAthenaProvider(): Promise<AthenaProvider> {
  const orgSlug = process.env.ORG_SLUG ?? "";
  const orgSlugDbFriendly = orgSlug.replace(/-/g, "_");
  const athenaQueryBucket = process.env.ATHENA_S3_OUTPUT_LOCATION;
  const athenaOutputLocation = `s3://${athenaQueryBucket}/${orgSlugDbFriendly}/`;
  const athenaRegion = process.env.AWS_REGION;
  const athenaSchema = `${orgSlugDbFriendly}__tss__default`;
  const athenaWorkgroup = orgSlug;

  const client = new AthenaClient({
    region: athenaRegion,
  });

  // Check if the org-specific workgroup exists
  try {
    await client.send(
      new GetWorkGroupCommand({
        WorkGroup: athenaWorkgroup,
      }),
    );

    // Workgroup exists, use it
    return new AthenaProvider(client, athenaWorkgroup, athenaSchema);
  } catch {
    // Workgroup doesn't exist or access denied, use 'primary' workgroup
    return new AthenaProvider(
      client,
      "primary",
      athenaSchema,
      athenaOutputLocation,
    );
  }
}

