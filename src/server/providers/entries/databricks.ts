/**
 * Databricks Provider Entry Point
 *
 * Standalone entry point for the Databricks provider.
 * Import from '@tetrascience-npm/tetrascience-react-ui/server/providers/databricks'
 * to only include Databricks-related code in your bundle.
 *
 * @example
 * ```typescript
 * import { DatabricksProvider, buildDatabricksProvider } from '@tetrascience-npm/tetrascience-react-ui/server/providers/databricks';
 *
 * const provider = await buildDatabricksProvider(config);
 * const result = await provider.query('SELECT * FROM my_table');
 * await provider.close();
 * ```
 *
 * @remarks
 * Requires `@databricks/sql` to be installed:
 * ```bash
 * npm install @databricks/sql
 * ```
 */

// Provider
export {
  DatabricksProvider,
  buildDatabricksProvider,
} from "../DatabricksProvider";

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

