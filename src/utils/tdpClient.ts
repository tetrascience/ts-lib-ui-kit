/**
 * TDP Search Client
 *
 * Provides utilities for interacting with the TetraScience Data Platform search API.
 * Uses the standardized TDP client from @tetrascience-npm/ts-connectors-sdk.
 */

import axios, { AxiosInstance } from "axios";

/** Configuration for TDP search client */
export interface TdpSearchClientConfig {
  baseUrl: string;
  authToken: string;
  orgSlug: string;
}

/** EQL search query structure */
export interface EqlQuery {
  query: string;
  filters?: Record<string, any>;
  fields?: string[];
  sort?: {
    field: string;
    order: "asc" | "desc";
  }[];
  size?: number;
  from?: number;
}

/** Search result item */
export interface SearchResult {
  id: string;
  [key: string]: any;
}

/** Paginated search response */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  from: number;
  size: number;
}

/** Error response from TDP API */
export interface TdpErrorResponse {
  message: string;
  status: number;
  details?: any;
}

/**
 * TDP Search Client
 * Handles authentication and API calls to TDP search endpoints
 */
export class TdpSearchClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private orgSlug: string;

  constructor(config: TdpSearchClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.orgSlug = config.orgSlug;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "ts-auth-token": config.authToken,
        "x-org-slug": config.orgSlug,
      },
    });
  }

  /**
   * Execute an EQL search query
   * @param query - The EQL query configuration
   * @returns Promise resolving to search results
   */
  async searchEql(query: EqlQuery): Promise<SearchResponse> {
    try {
      const response = await this.axiosInstance.post(
        `/${this.orgSlug}/v1/datalake/searchEql`,
        query
      );

      return {
        results: response.data.results || [],
        total: response.data.total || 0,
        from: query.from || 0,
        size: query.size || 10,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const tdpError: TdpErrorResponse = {
          message: error.response.data?.message || error.message,
          status: error.response.status,
          details: error.response.data,
        };
        throw tdpError;
      }
      throw {
        message: error.message || "Unknown error occurred",
        status: 500,
      } as TdpErrorResponse;
    }
  }

  /**
   * Update the authentication token
   * @param authToken - New authentication token
   */
  updateAuthToken(authToken: string): void {
    this.axiosInstance.defaults.headers["ts-auth-token"] = authToken;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the current org slug
   */
  getOrgSlug(): string {
    return this.orgSlug;
  }
}
