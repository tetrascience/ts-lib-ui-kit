/**
 * Server-side utilities for TetraScience applications.
 *
 * This entry point contains only server-compatible code (no React/browser dependencies).
 * Use this import path for Express servers and other Node.js environments:
 *
 * @example
 * ```typescript
 * import { jwtManager } from '@tetrascience-npm/tetrascience-react-ui/server';
 * ```
 */

// Authentication
export { JwtTokenManager, jwtManager } from "./server/auth";

export type {
  JwtTokenManagerConfig,
  CookieDict,
  ExpressRequestLike,
} from "./server/auth";

// Data App Providers - Configuration utilities
export {
  DataAppProviderClient,
  getProviderConfigurations,
  InvalidProviderConfigurationError,
} from "./server/providers";

// Data App Providers - Exception classes
export {
  ProviderError,
  MissingTableError,
  QueryError,
  ProviderConnectionError,
} from "./server/providers";

// Data App Providers - Database providers
export {
  SnowflakeProvider,
  buildSnowflakeProvider,
  DatabricksProvider,
  buildDatabricksProvider,
  AthenaProvider,
  getTdpAthenaProvider,
  buildProvider,
} from "./server/providers";

export type {
  ProviderConfiguration,
  MinimalProvider,
  ProviderSecret,
  ProviderApiResponse,
  ContainerDataApp,
  OrganizationApiResponse,
  DataAppProviderClientConfig,
  GetProviderConfigurationsOptions,
  DataProvider,
} from "./server/providers";
