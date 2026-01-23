/**
 * JWT Token Manager for TetraScience Data Apps
 *
 * Handles authentication token retrieval from Express request cookies,
 * supporting both direct JWT tokens (ts-auth-token) and token references
 * (ts-token-ref) that are resolved via the connector K/V store.
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
  cookies: CookieDict;
}

/** JWT payload structure */
interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

const DEFAULT_TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Manages JWT token retrieval from request cookies.
 * Supports both ts-auth-token (direct JWT) and ts-token-ref (resolved via connector store).
 */
export class JwtTokenManager {
  private baseUrl: string;
  private connectorId: string | undefined;
  private orgSlug: string | undefined;
  private tokenCache: Map<string, string>;
  private tokenRefreshThresholdMs: number;
  private tdpClient: TDPClient | null;

  constructor(config: JwtTokenManagerConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.TDP_ENDPOINT || "";
    this.connectorId = process.env.CONNECTOR_ID;
    this.orgSlug = process.env.ORG_SLUG;
    this.tokenCache = new Map();
    this.tokenRefreshThresholdMs =
      config.tokenRefreshThresholdMs || DEFAULT_TOKEN_REFRESH_THRESHOLD_MS;
    this.tdpClient = null;
  }

  /** Decode JWT payload */
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

      return JSON.parse(atob(paddedBase64));
    } catch (error) {
      console.warn("Error decoding JWT token:", error);
      return null;
    }
  }

  /** Check if token is expiring within the refresh threshold */
  private isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) {
      if (!payload) {
        return true;
      }
      console.warn("JWT token has no expiration claim");
      return true;
    }

    const expiryTimeMs = payload.exp * 1000;
    const refreshTimeMs = Date.now() + this.tokenRefreshThresholdMs;
    const isExpiring = expiryTimeMs <= refreshTimeMs;

    return isExpiring;
  }

  /** Get valid cached token if not expiring */
  private getValidUserJwt(tokenRef: string): string | null {
    const cached = this.tokenCache.get(tokenRef);
    if (cached && !this.isTokenExpiringSoon(cached)) {
      return cached;
    }
    return null;
  }

  /** Initialize or get TDP client */
  private async getTdpClient(): Promise<TDPClient | null> {
    if (this.tdpClient !== null) {
      return this.tdpClient;
    }

    if (!this.connectorId || !this.baseUrl || !this.orgSlug) {
      console.error(
        "Missing required configuration: CONNECTOR_ID, baseUrl, or ORG_SLUG",
      );
      return null;
    }

    try {
      this.tdpClient = new TDPClient({
        tdpEndpoint: this.baseUrl,
        connectorId: this.connectorId,
        orgSlug: this.orgSlug,
      });

      await this.tdpClient.init();
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
        this.tokenCache.set(tokenRef, jwtToken);
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
    if (!tokenRef || !this.orgSlug || !this.baseUrl) {
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
    return this.getUserToken(req.cookies);
  }

  /** Clear the token cache */
  clearCache(): void {
    this.tokenCache.clear();
  }
}

/** Global singleton instance */
export const jwtManager = new JwtTokenManager();
