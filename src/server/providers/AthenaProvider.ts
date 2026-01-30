/**
 * Athena Data Provider
 *
 * TypeScript equivalent of AthenaProvider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 *
 * @remarks
 * This provider requires the `@aws-sdk/client-athena` package to be installed.
 * It is an optional peer dependency - install it only if you need Athena support:
 * ```bash
 * npm install @aws-sdk/client-athena
 * # or
 * yarn add @aws-sdk/client-athena
 * ```
 */

import {
  QueryError,
  MissingTableError,
  InvalidProviderConfigurationError,
} from "./exceptions";

// Type imports for @aws-sdk/client-athena (these don't require the package at runtime)
type AthenaClient = import("@aws-sdk/client-athena").AthenaClient;
type AthenaSDK = typeof import("@aws-sdk/client-athena");

/**
 * Dynamically import @aws-sdk/client-athena
 * @throws {InvalidProviderConfigurationError} If @aws-sdk/client-athena is not installed
 */
async function getAthenaSDK(): Promise<AthenaSDK> {
  try {
    const athena = await import("@aws-sdk/client-athena");
    return athena;
  } catch {
    throw new InvalidProviderConfigurationError(
      "The '@aws-sdk/client-athena' package is required to use the Athena provider. " +
        "Please install it: npm install @aws-sdk/client-athena",
    );
  }
}

/** Maximum query length allowed by Athena */
const MAX_QUERY_LENGTH = 262144;

/**
 * Athena data provider
 */
export class AthenaProvider {
  private client: AthenaClient;
  private sdk: AthenaSDK;
  private workgroup: string;
  private database: string;
  private outputLocation?: string;

  /**
   * Initialize the Athena data provider
   *
   * @param client - AWS Athena client
   * @param sdk - AWS Athena SDK module (for accessing command classes)
   * @param workgroup - Athena workgroup to use
   * @param database - Default database/schema
   * @param outputLocation - Optional S3 output location
   */
  constructor(
    client: AthenaClient,
    sdk: AthenaSDK,
    workgroup: string,
    database: string,
    outputLocation?: string,
  ) {
    this.client = client;
    this.sdk = sdk;
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
   *
   * @remarks
   * **Security Note:** AWS Athena does not support parameterized queries.
   * Unlike traditional databases, there is no native way to use bind parameters
   * with Athena. Callers are responsible for properly sanitizing any user input
   * before constructing the SQL query string. This is a known limitation of the
   * Athena service, not a design flaw in this implementation.
   */
  async query(
    sqlQuery: string,
    _params: Record<string, unknown> = {},
  ): Promise<Array<Record<string, unknown>>> {
    if (sqlQuery.length > MAX_QUERY_LENGTH) {
      throw new Error("Query length exceeds the maximum allowed limit.");
    }

    // Start query execution
    // Note: Athena does not support parameterized queries. The sqlQuery is passed
    // directly to Athena. Callers must sanitize user input before constructing queries.
    const startCommand = new this.sdk.StartQueryExecutionCommand({
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
      const command = new this.sdk.GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      });
      const response = await this.client.send(command);
      const state = response.QueryExecution?.Status?.State;

      if (state === this.sdk.QueryExecutionState.SUCCEEDED) {
        return;
      }

      if (
        state === this.sdk.QueryExecutionState.FAILED ||
        state === this.sdk.QueryExecutionState.CANCELLED
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
      const command = new this.sdk.GetQueryResultsCommand({
        QueryExecutionId: queryExecutionId,
        NextToken: nextToken,
      });

      const response = await this.client.send(command);

      if (isFirstPage && response.ResultSet?.ResultSetMetadata?.ColumnInfo) {
        columnNames = response.ResultSet.ResultSetMetadata.ColumnInfo.map(
          (col, idx) => {
            // Handle empty or missing column names by using a fallback
            const name = col.Name;
            return name && name.trim() !== "" ? name : `column_${idx}`;
          },
        );
      }

      const rows = response.ResultSet?.Rows ?? [];
      // Skip header row on first page
      const dataRows = isFirstPage ? rows.slice(1) : rows;

      for (const row of dataRows) {
        const rowData: Record<string, unknown> = {};
        row.Data?.forEach((cell, index) => {
          // columnNames already has fallback values, so we can use them directly
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
 * @throws {InvalidProviderConfigurationError} If @aws-sdk/client-athena is not installed
 * @throws {Error} If ATHENA_S3_OUTPUT_LOCATION is not set when using the 'primary' workgroup
 */
export async function getTdpAthenaProvider(): Promise<AthenaProvider> {
  // Dynamically import @aws-sdk/client-athena
  const athenaSDK = await getAthenaSDK();

  const orgSlug = process.env.ORG_SLUG ?? "";
  const orgSlugDbFriendly = orgSlug.replace(/-/g, "_");
  const athenaQueryBucket = process.env.ATHENA_S3_OUTPUT_LOCATION;
  const athenaRegion = process.env.AWS_REGION;
  const athenaSchema = `${orgSlugDbFriendly}__tss__default`;
  const athenaWorkgroup = orgSlug;

  const client = new athenaSDK.AthenaClient({
    region: athenaRegion,
  });

  // Check if the org-specific workgroup exists
  try {
    await client.send(
      new athenaSDK.GetWorkGroupCommand({
        WorkGroup: athenaWorkgroup,
      }),
    );

    // Workgroup exists, use it
    return new AthenaProvider(client, athenaSDK, athenaWorkgroup, athenaSchema);
  } catch {
    // Workgroup doesn't exist or access denied, use 'primary' workgroup
    // The 'primary' workgroup requires an explicit output location
    if (!athenaQueryBucket) {
      throw new Error(
        "ATHENA_S3_OUTPUT_LOCATION environment variable is required when using the 'primary' workgroup. " +
          "Either set this variable or ensure the org-specific workgroup exists.",
      );
    }

    const athenaOutputLocation = `s3://${athenaQueryBucket}/${orgSlugDbFriendly}/`;
    return new AthenaProvider(
      client,
      athenaSDK,
      "primary",
      athenaSchema,
      athenaOutputLocation,
    );
  }
}

