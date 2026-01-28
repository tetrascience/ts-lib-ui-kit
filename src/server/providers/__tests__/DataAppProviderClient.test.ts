import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataAppProviderClient } from "../DataAppProviderClient";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("DataAppProviderClient", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should use config values when provided", () => {
      const client = new DataAppProviderClient({
        baseUrl: "https://custom.api.com",
        authToken: "custom-token",
        orgSlug: "custom-org",
        timeout: 5000,
      });

      expect(client.getBaseUrl()).toBe("https://custom.api.com");
      expect(client.getOrgSlug()).toBe("custom-org");
      expect(client.isConfigured()).toBe(true);
    });

    it("should fall back to environment variables", () => {
      process.env.TDP_INTERNAL_ENDPOINT = "https://internal.api.com";
      process.env.TS_AUTH_TOKEN = "env-token";
      process.env.ORG_SLUG = "env-org";

      const client = new DataAppProviderClient();

      expect(client.getBaseUrl()).toBe("https://internal.api.com");
      expect(client.getOrgSlug()).toBe("env-org");
      expect(client.isConfigured()).toBe(true);
    });

    it("should prefer TDP_INTERNAL_ENDPOINT over TDP_ENDPOINT", () => {
      process.env.TDP_INTERNAL_ENDPOINT = "https://internal.api.com";
      process.env.TDP_ENDPOINT = "https://public.api.com";
      process.env.TS_AUTH_TOKEN = "token";
      process.env.ORG_SLUG = "org";

      const client = new DataAppProviderClient();

      expect(client.getBaseUrl()).toBe("https://internal.api.com");
    });

    it("should fall back to TDP_ENDPOINT when TDP_INTERNAL_ENDPOINT not set", () => {
      delete process.env.TDP_INTERNAL_ENDPOINT;
      process.env.TDP_ENDPOINT = "https://public.api.com";
      process.env.TS_AUTH_TOKEN = "token";
      process.env.ORG_SLUG = "org";

      const client = new DataAppProviderClient();

      expect(client.getBaseUrl()).toBe("https://public.api.com");
    });

    it("should return false for isConfigured when missing required config", () => {
      delete process.env.TDP_INTERNAL_ENDPOINT;
      delete process.env.TDP_ENDPOINT;
      delete process.env.TS_AUTH_TOKEN;
      delete process.env.ORG_SLUG;

      const client = new DataAppProviderClient();

      expect(client.isConfigured()).toBe(false);
    });
  });

  describe("getContainerDataApp", () => {
    it("should fetch container data app with correct headers", async () => {
      const mockResponse = {
        id: "app-123",
        connectorId: "connector-123",
        providers: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = new DataAppProviderClient({
        baseUrl: "https://api.test.com",
        authToken: "test-token",
        orgSlug: "test-org",
      });

      const result = await client.getContainerDataApp("connector-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/dataapps/apps/container/connector-123",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "ts-auth-token": "test-token",
            "x-org-slug": "test-org",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on HTTP failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("Container not found"),
      });

      const client = new DataAppProviderClient({
        baseUrl: "https://api.test.com",
        authToken: "test-token",
        orgSlug: "test-org",
      });

      await expect(client.getContainerDataApp("invalid-id")).rejects.toThrow(
        "HTTP 404: Not Found",
      );
    });
  });

  describe("getOrganization", () => {
    it("should fetch organization by slug", async () => {
      const mockOrg = {
        id: "org-123",
        orgSlug: "test-org",
        name: "Test Organization",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrg),
      });

      const client = new DataAppProviderClient({
        baseUrl: "https://api.test.com",
        authToken: "test-token",
        orgSlug: "test-org",
      });

      const result = await client.getOrganization();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/userorg/organizationsBySlug/test-org",
        expect.any(Object),
      );
      expect(result).toEqual(mockOrg);
    });
  });
});

