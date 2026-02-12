/**
 * Snowflake Provider Entry Point
 *
 * Standalone entry point for the Snowflake provider.
 * Import from '@tetrascience-npm/tetrascience-react-ui/server/providers/snowflake'
 * to only include Snowflake-related code in your bundle.
 *
 * @example
 * ```typescript
 * import { SnowflakeProvider, buildSnowflakeProvider } from '@tetrascience-npm/tetrascience-react-ui/server/providers/snowflake';
 *
 * const provider = await buildSnowflakeProvider(config);
 * const result = await provider.query('SELECT * FROM my_table');
 * await provider.close();
 * ```
 *
 * @remarks
 * Requires `snowflake-sdk` to be installed:
 * ```bash
 * npm install snowflake-sdk
 * ```
 */

// Provider
export { SnowflakeProvider, buildSnowflakeProvider } from "../SnowflakeProvider";

// Exceptions
export {
  ProviderError,
  MissingTableError,
  QueryError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "../exceptions";

// Types
export type { ProviderConfiguration, QueryResult } from "../types";

