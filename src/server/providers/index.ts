/**
 * Data App Provider utilities for TetraScience data apps
 *
 * TypeScript equivalents of the Python helpers from ts-lib-ui-kit-streamlit
 * for retrieving data app provider configurations and database providers.
 *
 * Note: This module uses TDPClient from @tetrascience-npm/ts-connectors-sdk
 * for TDP API calls. Initialize TDPClient with the user's JWT token:
 *
 * @example
 * ```typescript
 * import { TDPClient } from '@tetrascience-npm/ts-connectors-sdk';
 * import { getProviderConfigurations } from '@tetrascience-npm/tetrascience-react-ui/server';
 *
 * const client = new TDPClient({ authToken: userJwt });
 * await client.init();
 * const providers = await getProviderConfigurations(client);
 * ```
 */

// Configuration utilities
export { getProviderConfigurations } from "./getProviderConfigurations";

// Exception classes
export {
  ProviderError,
  MissingTableError,
  QueryError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "./exceptions";

// Database providers
export { SnowflakeProvider, buildSnowflakeProvider } from "./SnowflakeProvider";
export {
  DatabricksProvider,
  buildDatabricksProvider,
} from "./DatabricksProvider";
export { AthenaProvider, getTdpAthenaProvider } from "./AthenaProvider";

// Provider factory
export { buildProvider, type DataProvider } from "./buildProvider";

// Types
export type {
  ProviderConfiguration,
  MinimalProvider,
  ProviderSecret,
  ProviderApiResponse,
  ContainerDataApp,
  OrganizationApiResponse,
  GetProviderConfigurationsOptions,
  ProviderInfo,
  QueryResult,
} from "./types";
