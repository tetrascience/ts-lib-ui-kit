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
 * // Other fields (tdpEndpoint, connectorId, orgSlug) are read from environment variables
 * const client = new TDPClient({
 *   authToken: userJwt,
 *   artifactType: "data-app",
 * });
 * await client.init();
 * const providers = await getProviderConfigurations(client);
 * ```
 */

// Configuration utilities
export * from "./getProviderConfigurations";

// Provider discovery helpers
export * from "./providerDiscovery";

// Exception classes
export * from "./exceptions";

// Database providers
export * from "./SnowflakeProvider";
export * from "./DatabricksProvider";
export * from "./AthenaProvider";

// Provider factory
export * from "./buildProvider";

// Types
export * from "./types";
