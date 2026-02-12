/**
 * Athena Provider Entry Point
 *
 * Standalone entry point for the Athena provider.
 * Import from '@tetrascience-npm/tetrascience-react-ui/server/providers/athena'
 * to only include Athena-related code in your bundle.
 *
 * @example
 * ```typescript
 * import { AthenaProvider, getTdpAthenaProvider } from '@tetrascience-npm/tetrascience-react-ui/server/providers/athena';
 *
 * const provider = await getTdpAthenaProvider(config);
 * const result = await provider.query('SELECT * FROM my_table');
 * ```
 *
 * @remarks
 * Requires `@aws-sdk/client-athena` to be installed:
 * ```bash
 * npm install @aws-sdk/client-athena
 * ```
 */

// Provider
export { AthenaProvider, getTdpAthenaProvider } from "../AthenaProvider";

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

