/**
 * Snowflake Data Provider
 *
 * TypeScript equivalent of SnowflakeProvider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 */

import snowflake from "snowflake-sdk";
import type { ProviderConfiguration } from "./types";
import {
  QueryError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "./exceptions";

/**
 * Snowflake data provider
 */
export class SnowflakeProvider {
  private connection: snowflake.Connection;

  /**
   * Initialize the Snowflake data provider
   *
   * @param connection - Snowflake connection
   */
  constructor(connection: snowflake.Connection) {
    this.connection = connection;
  }

  /**
   * Query the Snowflake database
   *
   * @param sqlText - SQL query to execute
   * @param params - Parameters to pass to the query
   * @returns Promise resolving to array of row objects
   */
  async query(
    sqlText: string,
    params: Record<string, unknown> = {},
  ): Promise<Array<Record<string, unknown>>> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText,
        binds: Object.values(params) as snowflake.Binds,
        complete: (
          err: snowflake.SnowflakeError | undefined,
          _stmt: snowflake.RowStatement | snowflake.FileAndStageBindStatement,
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
      this.connection.destroy((err: snowflake.SnowflakeError | undefined) => {
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
 */
export async function buildSnowflakeProvider(
  config: ProviderConfiguration,
): Promise<SnowflakeProvider> {
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

  const connectionOptions: snowflake.ConnectionOptions = {
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
      (err: snowflake.SnowflakeError | undefined, conn: snowflake.Connection) => {
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
          complete: (
            tzErr: snowflake.SnowflakeError | undefined,
          ) => {
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

