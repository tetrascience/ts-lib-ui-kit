/**
 * Build Provider Factory
 *
 * TypeScript equivalent of build_provider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 */

import type { ProviderConfiguration } from "./types";
import {
  SnowflakeProvider,
  buildSnowflakeProvider,
} from "./SnowflakeProvider";
import {
  DatabricksProvider,
  buildDatabricksProvider,
} from "./DatabricksProvider";
import { AthenaProvider, getTdpAthenaProvider } from "./AthenaProvider";
import { InvalidProviderConfigurationError } from "./getProviderConfigurations";

/**
 * Union type of all supported data providers
 */
export type DataProvider =
  | SnowflakeProvider
  | DatabricksProvider
  | AthenaProvider;

/**
 * Build a data provider from the configuration
 *
 * The return type is a union of specific provider types. More provider types
 * may be added in the future.
 *
 * @param config - Provider configuration
 * @returns Promise resolving to the appropriate data provider
 * @throws {InvalidProviderConfigurationError} If the provider type is not supported
 *
 * @example
 * ```typescript
 * import { buildProvider, getProviderConfigurations, DataAppProviderClient } from '@tetrascience-npm/tetrascience-react-ui/server';
 *
 * const client = new DataAppProviderClient();
 * const configs = await getProviderConfigurations(client);
 *
 * const snowflakeConfig = configs.find(c => c.type === 'snowflake');
 * if (snowflakeConfig) {
 *   const provider = await buildProvider(snowflakeConfig);
 *   const results = await provider.query('SELECT * FROM my_table');
 * }
 * ```
 */
export async function buildProvider(
  config: ProviderConfiguration,
): Promise<DataProvider> {
  switch (config.type) {
    case "snowflake":
      return buildSnowflakeProvider(config);
    case "databricks":
      return buildDatabricksProvider(config);
    case "athena":
      // For Athena, we typically use the TDP Athena provider
      return getTdpAthenaProvider();
    default:
      throw new InvalidProviderConfigurationError(
        `Unsupported provider type: ${config.type}`,
      );
  }
}

