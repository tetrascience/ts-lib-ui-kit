/**
 * TDP Search Manager for TetraScience Data Apps
 *
 * Server-side handler for TDP search that uses JwtTokenManager for auth and
 * TDPClient for searchEql. Mount this as a single API route so the frontend
 * TdpSearch component (with useServerSideSearch) works with minimal wiring.
 *
 * Use from Express, Next.js API routes, or any Node server that can provide
 * an Express-like request (cookies) and a JSON body (SearchEqlRequest).
 */

import { TDPClient } from "@tetrascience-npm/ts-connectors-sdk";

import { jwtManager } from "../auth/JwtTokenManager";

import type { ExpressRequestLike, JwtTokenManager } from "../auth/JwtTokenManager";
import type { SearchEqlRequest, SearchEqlResponse } from "@tetrascience-npm/ts-connectors-sdk";

/** Configuration options for TdpSearchManager */
export interface TdpSearchManagerConfig {
  /** TDP API base URL. Defaults to TDP_ENDPOINT env var */
  baseUrl?: string;
  /** Organization slug. Defaults to ORG_SLUG env var */
  orgSlug?: string;
  /** Optional custom JwtTokenManager instance. Defaults to the shared jwtManager */
  jwtManager?: JwtTokenManager;
}

/**
 * Manages TDP search requests on the server: resolves auth from request cookies,
 * creates a TDPClient with that token, and runs searchEql.
 */
export class TdpSearchManager {
  private baseUrlOverride: string | undefined;
  private orgSlugOverride: string | undefined;
  private tokenManager: JwtTokenManager;

  constructor(config: TdpSearchManagerConfig = {}) {
    this.baseUrlOverride = config.baseUrl;
    this.orgSlugOverride = config.orgSlug;
    this.tokenManager = config.jwtManager ?? jwtManager;
  }

  private getBaseUrl(): string {
    const baseUrl = this.baseUrlOverride || process.env.TDP_ENDPOINT;
    if (!baseUrl) {
      throw new Error("TDP base URL not configured. Set TDP_ENDPOINT or pass baseUrl in config.");
    }
    return baseUrl;
  }

  private getOrgSlug(): string {
    const orgSlug = this.orgSlugOverride || process.env.ORG_SLUG;
    if (!orgSlug) {
      throw new Error("Organization slug not configured. Set ORG_SLUG or pass orgSlug in config.");
    }
    return orgSlug;
  }

  /**
   * Request body may include optional auth for standalone mode (auth from request instead of cookies).
   */
  private getAuthFromBody(
    body: SearchEqlRequest & { authToken?: string; baseUrl?: string; orgSlug?: string },
  ): { token: string; baseUrl: string; orgSlug: string } | null {
    if (!body.authToken) return null;
    return {
      token: body.authToken,
      baseUrl: body.baseUrl ?? this.getBaseUrl(),
      orgSlug: body.orgSlug ?? this.getOrgSlug(),
    };
  }

  /** Strip auth fields and undefined values; convert searchTerm to ES query so TDP API accepts the body. */
  private toSearchEqlRequest(
    body: SearchEqlRequest,
  ): Record<string, unknown> {
    const { searchTerm, sort, order, ...rest } = body;
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) cleaned[key] = value;
    }
    if (body.from !== undefined) cleaned.from = body.from;
    if (body.size !== undefined) cleaned.size = body.size;

    // TDP API expects Elasticsearch body; it does not accept "searchTerm". Convert to query.
    if (searchTerm !== undefined && searchTerm !== "") {
      cleaned.query = {
        simple_query_string: {
          query: searchTerm,
          default_operator: "and",
        },
      };
    }

    // ES sort: string "field" or [ { "field": "asc" | "desc" } ]
    if (sort !== undefined && sort !== "") {
      cleaned.sort = order ? [{ [sort]: order }] : [sort];
    }

    return cleaned;
  }

  /**
   * Handle a search request: get JWT from request body (standalone) or cookies (server-side), call TDP searchEql, return response.
   * Response shape matches what useServerSideSearch / useStandaloneSearch expect (hits.hits, hits.total).
   *
   * Standalone: body may include authToken, baseUrl?, orgSlug? (frontend sends these).
   * Server-side: auth from cookies via jwtManager.
   *
   * @param req - Express-like request (cookies used when body does not contain authToken)
   * @param body - Search request body (searchTerm, from, size, sort, order, etc.; optional authToken, baseUrl, orgSlug for standalone)
   * @returns Search response from TDP
   * @throws Error if auth or config is missing, or TDP request fails
   */
  async handleSearchRequest<TSource = Record<string, unknown>>(
    req: ExpressRequestLike,
    body: SearchEqlRequest & { authToken?: string; baseUrl?: string; orgSlug?: string },
  ): Promise<SearchEqlResponse<TSource>> {
    const searchBody = this.toSearchEqlRequest(body);
    const authFromBody = this.getAuthFromBody(body);

    let token: string;
    let baseUrl: string;
    let orgSlug: string;

    if (authFromBody) {
      token = authFromBody.token;
      baseUrl = authFromBody.baseUrl;
      orgSlug = authFromBody.orgSlug;
    } else {
      const cookieToken = await this.tokenManager.getTokenFromExpressRequest(req);
      if (!cookieToken) {
        throw new Error("No valid authentication token found in request");
      }
      token = cookieToken;
      baseUrl = this.getBaseUrl();
      orgSlug = this.getOrgSlug();
    }

    const client = new TDPClient({
      tdpEndpoint: baseUrl,
      orgSlug,
      authToken: token,
    });

    await client.init();
    return client.searchEql<TSource>(searchBody);
  }
}

/**
 * Default singleton instance (uses TDP_ENDPOINT and ORG_SLUG from env,
 * and the shared jwtManager for token resolution).
 */
export const tdpSearchManager = new TdpSearchManager();
