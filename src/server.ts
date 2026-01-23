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
