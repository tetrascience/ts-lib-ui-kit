/**
 * JWT Token Manager for TetraScience Data Apps
 *
 * Handles authentication token retrieval from Express request cookies,
 * supporting both direct JWT tokens (ts-auth-token) and token references
 * (ts-token-ref) that are resolved via the connector K/V store.
 *
 * Note: This manager does not perform cryptographic verification of JWT signatures.
 * Signature verification is the responsibility of the consuming application or
 * the upstream authentication layer. The JWT payload is decoded only to read
 * expiration times for cache invalidation.
 */

import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";

/** Configuration options for JwtTokenManager */
export interface JwtTokenManagerConfig {
  baseUrl?: string;
  tokenRefreshThresholdMs?: number;
}

/** Cookie dictionary type - matches Express req.cookies */
export interface CookieDict {
  [key: string]: string;
}

/** Express-like request interface (works with Express, Koa, etc.) */
export interface ExpressRequestLike {
  cookies?: CookieDict;
}

/** JWT payload structure */
interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/** Cached token entry storing both raw token and parsed payload */
interface CachedTokenEntry {
  token: string;
  payload: JwtPayload;
}

const DEFAULT_TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Manages JWT token retrieval from request cookies.
 * Supports both ts-auth-token (direct JWT) and ts-token-ref (resolved via connector store).
 */
export class JwtTokenManager {
  private baseUrlOverride: string | undefined;
  private connectorId: string | undefined;
  private orgSlug: string | undefined;
  private tokenCache: Map<string, CachedTokenEntry>;
  private tokenRefreshThresholdMs: number;
  private tdpClient: TDPClient | null;

  constructor(config: JwtTokenManagerConfig = {}) {
    this.baseUrlOverride = config.baseUrl;
    this.connectorId = process.env.CONNECTOR_ID;
    this.orgSlug = process.env.ORG_SLUG;
    this.tokenCache = new Map();
    this.tokenRefreshThresholdMs =
      config.tokenRefreshThresholdMs || DEFAULT_TOKEN_REFRESH_THRESHOLD_MS;
    this.tdpClient = null;
  }

  /**
   * Get the base URL for TDP API calls.
   * Throws an error if not configured (either via config.baseUrl or TDP_ENDPOINT env var).
   */
  private getBaseUrl(): string {
    const baseUrl = this.baseUrlOverride || process.env.TDP_ENDPOINT;
    if (!baseUrl) {
      throw new Error(
        "TDP base URL not configured. Set TDP_ENDPOINT environment variable or pass baseUrl in config.",
      );
    }
    return baseUrl;
  }

  /**
   * Decode JWT payload without verifying signature.
   * Used only for reading expiration times for cache invalidation.
   * Signature verification is NOT performed here.
   */
  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("Invalid JWT token format");
        return null;
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "=",
      );

      // Use Buffer.from for Node.js compatibility (atob not available in all runtimes)
      return JSON.parse(Buffer.from(paddedBase64, "base64").toString("utf-8"));
    } catch (error) {
      console.warn("Error decoding JWT token:", error);
      return null;
    }
  }

  /** Check if payload is expiring within the refresh threshold */
  private isPayloadExpiringSoon(payload: JwtPayload): boolean {
    if (!payload.exp) {
      console.warn("JWT token has no expiration claim");
      return true;
    }

    const expiryTimeMs = payload.exp * 1000;
    const refreshTimeMs = Date.now() + this.tokenRefreshThresholdMs;
    return expiryTimeMs <= refreshTimeMs;
  }

  /** Get valid cached token if not expiring */
  private getValidUserJwt(tokenRef: string): string | null {
    const cached = this.tokenCache.get(tokenRef);
    if (cached && !this.isPayloadExpiringSoon(cached.payload)) {
      return cached.token;
    }
    // Clean up expired entry to prevent unbounded cache growth
    if (cached) {
      // TODO: If data apps become high-traffic, consider enhancing with
      // an LRU cache (e.g., lru-cache package) to purge stale entries automatically
      this.tokenCache.delete(tokenRef);
    }
    return null;
  }

  /** Initialize or get TDP client */
  private async getTdpClient(): Promise<TDPClient | null> {
    if (this.tdpClient !== null) {
      return this.tdpClient;
    }

    if (!this.connectorId || !this.orgSlug) {
      console.error("Missing required configuration: CONNECTOR_ID or ORG_SLUG");
      return null;
    }

    try {
      const baseUrl = this.getBaseUrl();
      const client = new TDPClient({
        tdpEndpoint: baseUrl,
        connectorId: this.connectorId,
        orgSlug: this.orgSlug,
      });

      await client.init();
      // Only assign after successful initialization to allow retry on failure
      this.tdpClient = client;
      return this.tdpClient;
    } catch (error) {
      console.error("Failed to create TDP client instance:", error);
      return null;
    }
  }

  /** Retrieve JWT from connector K/V store using getValues (calls getConnectorData internally) */
  private async getJwtFromTokenRefInternal(
    tokenRef: string,
  ): Promise<string | null> {
    try {
      const tdpClient = await this.getTdpClient();
      if (!tdpClient) {
        console.error("Failed to get TDP client instance");
        return null;
      }

      // getValues returns array of values for the given keys
      // Each value is expected to have a jwt property: { jwt: "..." }
      const values = await tdpClient.getValues([tokenRef]);

      if (values && values.length > 0 && values[0]?.jwt) {
        const jwtToken = values[0].jwt;
        // Parse and cache both the raw token and its payload to avoid repeated decoding
        const payload = this.decodeJwtPayload(jwtToken);
        if (payload) {
          this.tokenCache.set(tokenRef, { token: jwtToken, payload });
        }
        return jwtToken;
      }

      console.error(`No JWT found for key '${tokenRef}' in connector store`);
    } catch (error) {
      console.error("Error retrieving JWT token:", error);
    }

    return null;
  }

  /** Resolve ts-token-ref to full JWT token (with caching) */
  async getJwtFromTokenRef(tokenRef: string): Promise<string | null> {
    if (!tokenRef || !this.orgSlug) {
      console.warn("Missing required parameters for JWT token retrieval");
      return null;
    }

    const cachedUserToken = this.getValidUserJwt(tokenRef);
    if (cachedUserToken) {
      return cachedUserToken;
    }

    return this.getJwtFromTokenRefInternal(tokenRef);
  }

  /** Get token from cookies (ts-auth-token or resolved ts-token-ref) */
  async getUserToken(cookies: CookieDict): Promise<string | null> {
    // Prefer ts-auth-token or TS_AUTH_TOKEN env var (latter is for local dev testing)
    const authToken = cookies["ts-auth-token"] || process.env.TS_AUTH_TOKEN;
    if (authToken) {
      return authToken;
    }

    // Try to resolve ts-token-ref
    const tokenRef = cookies["ts-token-ref"];
    if (tokenRef && this.connectorId) {
      const jwtToken = await this.getJwtFromTokenRef(tokenRef);
      if (jwtToken) {
        return jwtToken;
      }
      console.warn("Failed to resolve ts-token-ref to JWT token");
    } else if (tokenRef) {
      console.error("Connector ID not configured");
    }

    console.warn("No valid authentication token found");
    return null;
  }

  /**
   * Get user token from an Express request object.
   * This is the primary method for Express middleware integration.
   *
   * @example
   * ```typescript
   * import { jwtManager } from '@tetrascience-npm/tetrascience-react-ui/server';
   *
   * app.use(async (req, res, next) => {
   *   const token = await jwtManager.getTokenFromExpressRequest(req);
   *   req.tdpAuth = { token, orgSlug: process.env.ORG_SLUG };
   *   next();
   * });
   * ```
   */
  async getTokenFromExpressRequest(
    req: ExpressRequestLike,
  ): Promise<string | null> {
    // Handle missing cookies gracefully (e.g., if cookie-parser middleware not installed)
    return this.getUserToken(req.cookies || {});
  }

  /** Clear the token cache */
  clearCache(): void {
    this.tokenCache.clear();
  }
}

/**
 * Global singleton instance.
 *
 * Note: This instance is created when the module is imported. Configuration
 * that depends on environment variables (CONNECTOR_ID, ORG_SLUG, TDP_ENDPOINT)
 * is read at module load time. Ensure these environment
 * variables are set before importing this module.
 *
 * If you need different configuration at runtime, create a new JwtTokenManager
 * instance instead of using this singleton.
 */
export const jwtManager = new JwtTokenManager();
