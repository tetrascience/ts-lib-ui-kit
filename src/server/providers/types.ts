/**
 * Data App Provider Types
 *
 * TypeScript equivalents of the Python ProviderConfiguration Pydantic models
 * from ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider_typing.py
 */

/**
 * Configuration model for data providers.
 *
 * This interface represents the configuration needed to connect to various
 * database providers (Snowflake, Databricks, Athena, Benchling, etc.)
 * attached to a data app.
 */
export interface ProviderConfiguration {
  /** Human-readable name of the provider */
  name: string;
  /** Provider type (snowflake, databricks, benchling, custom, etc.) */
  type: string;
  /** Optional URL to the provider's icon */
  iconUrl?: string;
  /** Dictionary containing connection details and credentials */
  fields: Record<string, string | undefined>;
}

/**
 * Minimal provider information as returned by the /dataapps/apps/{appId} endpoint
 */
export interface MinimalProvider {
  id: string;
  orgSlug: string;
  name: string;
  type: string;
  iconUrl: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Provider secret information from the provider API response
 */
export interface ProviderSecret {
  name: string;
  value?: string;
  type: string;
  required: boolean;
  arn: string;
  envName: string;
}

/**
 * Full provider API response including secrets
 */
export interface ProviderApiResponse {
  id: string;
  orgSlug: string;
  name: string;
  type: string;
  iconUrl: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
  dataAppCount: string;
  secrets: ProviderSecret[];
}

/**
 * Container data app response from /dataapps/apps/container/{connectorId}
 */
export interface ContainerDataApp {
  id: string;
  orgSlug: string;
  connectorId: string;
  serviceNamespace: string;
  serviceDiscoveryName: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
  port: string;
  config: Record<string, unknown>;
  providers: MinimalProvider[];
}

/**
 * Organization API response
 */
export interface OrganizationApiResponse {
  id: string;
  orgSlug: string;
  name: string;
  emailDomain: string;
  authType: string;
  features: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  createdBy: string;
  modifiedAt?: string;
  modifiedBy?: string;
  subdomain: string;
  ssoEnabledOnTenant: boolean;
}

/**
 * Options for getProviderConfigurations function
 */
export interface GetProviderConfigurationsOptions {
  /** Override provider configurations JSON (for local development) */
  providerConfigOverride?: string;
  /** Connector ID (defaults to CONNECTOR_ID env var) */
  connectorId?: string;
}

/**
 * Display-friendly provider information for UI components.
 *
 * A simplified subset of ProviderConfiguration containing only the
 * fields needed for displaying provider information in the UI,
 * including the names of available connection fields without their
 * secret values.
 */
export interface ProviderInfo {
  /** Human-readable name of the provider */
  name: string;
  /** Provider type (snowflake, databricks, athena, etc.) */
  type: string;
  /** Optional URL to the provider's icon */
  iconUrl?: string | null;
  /** Names of available connection fields (without secret values) */
  availableFields: string[];
}

/**
 * Standardized query result from data providers.
 *
 * This interface provides a consistent shape for query results across
 * all provider types (Snowflake, Databricks, Athena), with optional
 * metadata for API responses.
 */
export interface QueryResult {
  /** Array of row objects returned by the query */
  data: Array<Record<string, unknown>>;
  /** Number of rows returned */
  rowCount: number;
  /** Name of the provider that executed the query */
  provider?: string;
  /** Whether this is mock/demo data */
  mock?: boolean;
  /** Optional message (e.g., for errors or warnings) */
  message?: string;
}
