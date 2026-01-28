/**
 * Data App Provider Client
 *
 * TypeScript equivalent of TetraScienceClient from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/tdp_client.py
 *
 * Provides methods to fetch provider configurations from the TDP API.
 */

import type {
  ContainerDataApp,
  DataAppProviderClientConfig,
  OrganizationApiResponse,
  ProviderApiResponse,
} from "./types";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Client for interacting with TetraScience Data Platform API
 * to retrieve data app provider configurations.
 */
export class DataAppProviderClient {
  private baseUrl: string;
  private authToken: string;
  private orgSlug: string;
  private timeout: number;

  constructor(config: DataAppProviderClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ||
      process.env.TDP_INTERNAL_ENDPOINT ||
      process.env.TDP_ENDPOINT ||
      "";
    this.authToken = config.authToken || process.env.TS_AUTH_TOKEN || "";
    this.orgSlug = config.orgSlug || process.env.ORG_SLUG || "";
    this.timeout = config.timeout || DEFAULT_TIMEOUT;

    if (!this.baseUrl) {
      console.warn("DataAppProviderClient: No TDP API base URL provided.");
    }
    if (!this.authToken) {
      console.warn("DataAppProviderClient: No TDP API token provided.");
    }
    if (!this.orgSlug) {
      console.warn("DataAppProviderClient: No TDP API org-slug provided.");
    }
  }

  /**
   * Internal fetch wrapper with authentication headers
   */
  private async fetchWithAuth<T>(
    url: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const fullUrl = `${url}${queryString}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "ts-auth-token": this.authToken,
          "x-org-slug": this.orgSlug,
          "User-Agent": "tetrascience-data-app",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}. ${errorText}`,
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get Container Data App by connector ID
   */
  async getContainerDataApp(connectorId: string): Promise<ContainerDataApp> {
    const url = `${this.baseUrl}/v1/dataapps/apps/container/${connectorId}`;
    return this.fetchWithAuth<ContainerDataApp>(url);
  }

  /**
   * Get organization information by slug
   */
  async getOrganization(): Promise<OrganizationApiResponse> {
    const url = `${this.baseUrl}/v1/userorg/organizationsBySlug/${this.orgSlug}`;
    return this.fetchWithAuth<OrganizationApiResponse>(url);
  }

  /**
   * Get provider by ID with secrets
   */
  async getProvider(providerId: string): Promise<ProviderApiResponse> {
    const orgInfo = await this.getOrganization();
    const url = `${this.baseUrl}/v1/dataapps/providers/${providerId}`;
    return this.fetchWithAuth<ProviderApiResponse>(url, {
      orgId: orgInfo.id,
      includeArn: "true",
    });
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.authToken && this.orgSlug);
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the org slug
   */
  getOrgSlug(): string {
    return this.orgSlug;
  }
}

