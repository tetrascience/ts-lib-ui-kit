/**
 * Data App Provider utilities for TetraScience data apps
 *
 * TypeScript equivalents of the Python helpers from ts-lib-ui-kit-streamlit
 * for retrieving data app provider configurations and database providers.
 */

// Client and configuration utilities
export { DataAppProviderClient } from "./DataAppProviderClient";
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
  DataAppProviderClientConfig,
  GetProviderConfigurationsOptions,
} from "./types";
