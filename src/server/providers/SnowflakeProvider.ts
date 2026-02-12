/**
 * Snowflake Data Provider
 *
 * TypeScript equivalent of SnowflakeProvider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 *
 * @remarks
 * This provider requires the `snowflake-sdk` package to be installed.
 * It is an optional peer dependency - install it only if you need Snowflake support:
 * ```bash
 * npm install snowflake-sdk
 * # or
 * yarn add snowflake-sdk
 * ```
 */

import {
  QueryError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "./exceptions";

import type { ProviderConfiguration } from "./types";

// Type imports for snowflake-sdk (these don't require the package at runtime)
type SnowflakeSDK = typeof import("snowflake-sdk");
type SnowflakeConnection = import("snowflake-sdk").Connection;
type SnowflakeBinds = import("snowflake-sdk").Binds;
type SnowflakeError = import("snowflake-sdk").SnowflakeError;
type SnowflakeConnectionOptions = import("snowflake-sdk").ConnectionOptions;
type SnowflakeRowStatement = import("snowflake-sdk").RowStatement;
type SnowflakeFileAndStageBindStatement =
  import("snowflake-sdk").FileAndStageBindStatement;

/**
 * Dynamically import snowflake-sdk
 * @throws {InvalidProviderConfigurationError} If snowflake-sdk is not installed
 */
async function getSnowflakeSDK(): Promise<SnowflakeSDK> {
  try {
    const snowflake = await import("snowflake-sdk");
    return snowflake.default || snowflake;
  } catch {
    throw new InvalidProviderConfigurationError(
      "The 'snowflake-sdk' package is required to use the Snowflake provider. " +
        "Please install it: npm install snowflake-sdk",
    );
  }
}

/**
 * Snowflake data provider
 */
export class SnowflakeProvider {
  private connection: SnowflakeConnection;

  /**
   * Initialize the Snowflake data provider
   *
   * @param connection - Snowflake connection
   */
  constructor(connection: SnowflakeConnection) {
    this.connection = connection;
  }

  /**
   * Query the Snowflake database
   *
   * @param sqlText - SQL query to execute
   * @param params - Parameters to pass to the query. For positional binds, use an array.
   *                 For named binds, use an object with keys matching the bind variable names.
   * @returns Promise resolving to array of row objects
   */
  async query(
    sqlText: string,
    params: Record<string, unknown> | unknown[] = {},
  ): Promise<Array<Record<string, unknown>>> {
    // Snowflake SDK supports both positional binds (array) and named binds (object)
    // Pass params directly to preserve named bind semantics
    const binds = Array.isArray(params)
      ? (params as unknown as SnowflakeBinds)
      : (params as unknown as SnowflakeBinds);

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds,
        complete: (
          err: SnowflakeError | undefined,
          _stmt: SnowflakeRowStatement | SnowflakeFileAndStageBindStatement,
          rows?: Array<Record<string, unknown>>,
        ) => {
          if (err) {
            reject(
              new QueryError(
                `Snowflake provider failed to query the database. Reason: ${err.message}`,
              ),
            );
            return;
          }
          resolve(rows ?? []);
        },
      });
    });
  }

  /**
   * Close the Snowflake connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.destroy((err: SnowflakeError | undefined) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

/**
 * Build a Snowflake data provider from the configuration
 *
 * @param config - Provider configuration
 * @returns Promise resolving to Snowflake data provider
 * @throws {InvalidProviderConfigurationError} If snowflake-sdk is not installed or config is invalid
 */
export async function buildSnowflakeProvider(
  config: ProviderConfiguration,
): Promise<SnowflakeProvider> {
  // Dynamically import snowflake-sdk
  const snowflake = await getSnowflakeSDK();

  const requiredFields = [
    "user",
    "password",
    "account",
    "warehouse",
    "database",
    "schema",
    "role",
  ] as const;

  for (const field of requiredFields) {
    if (!config.fields[field]) {
      throw new InvalidProviderConfigurationError(
        `Missing field '${field}' in the provider '${config.name}' to connect to Snowflake ` +
          "using password based authentication.",
      );
    }
  }

  const connectionOptions: SnowflakeConnectionOptions = {
    account: config.fields["account"]!,
    username: config.fields["user"]!,
    password: config.fields["password"]!,
    warehouse: config.fields["warehouse"]!,
    database: config.fields["database"]!,
    schema: config.fields["schema"]!,
    role: config.fields["role"]!,
  };

  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection(connectionOptions);

    connection.connect(
      (err: SnowflakeError | undefined, conn: SnowflakeConnection) => {
        if (err) {
          reject(
            new ProviderConnectionError(
              `Unable to connect to Snowflake. Reason: ${err.message}`,
            ),
          );
          return;
        }

        // Set timezone to UTC after connection.
        // The default timezone is America/Los_Angeles. Timestamps from delta tables will be
        // returned with the timezone `timezone`. NOTE, this is not a timezone conversion.
        // The timezone is replaced without translating the clock time. `timezone` is set UTC
        // to match the timezone of delta table timestamps.
        conn.execute({
          sqlText: "ALTER SESSION SET TIMEZONE = 'UTC'",
          complete: (tzErr: SnowflakeError | undefined) => {
            if (tzErr) {
              // Log warning but don't fail - timezone setting is not critical
              console.warn(
                `Warning: Failed to set timezone to UTC: ${tzErr.message}`,
              );
            }
            resolve(new SnowflakeProvider(conn));
          },
        });
      },
    );
  });
}

