import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TdpSearchManager } from "../TdpSearchManager";

import type { ExpressRequestLike, JwtTokenManager } from "../../auth/JwtTokenManager";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

const { MockTDPClient, mockInit, mockSearchEql } = vi.hoisted(() => {
  const mockInit = vi.fn();
  const mockSearchEql = vi.fn();
  const MockTDPClient = vi.fn(() => ({
    init: mockInit,
    searchEql: mockSearchEql,
  }));

  return { MockTDPClient, mockInit, mockSearchEql };
});

vi.mock("@tetrascience-npm/ts-connectors-sdk", () => ({
  TDPClient: MockTDPClient,
}));

type MockTokenManager = JwtTokenManager & {
  getTokenFromExpressRequest: ReturnType<typeof vi.fn>;
};

function createTokenManager(token: string | null): MockTokenManager {
  return {
    getTokenFromExpressRequest: vi.fn().mockResolvedValue(token),
  } as unknown as MockTokenManager;
}

describe("TdpSearchManager", () => {
  const originalEnv = { ...process.env };
  const request: ExpressRequestLike = {
    cookies: { "ts-auth-token": "cookie-token" },
  };

  beforeEach(() => {
    MockTDPClient.mockClear();
    mockInit.mockReset();
    mockSearchEql.mockReset();
    mockInit.mockResolvedValue();
    mockSearchEql.mockResolvedValue({ hits: { hits: [] } });
    process.env = { ...originalEnv };
    delete process.env.TDP_ENDPOINT;
    delete process.env.ORG_SLUG;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("converts searchTerm and ordered sorting before calling TDP search", async () => {
    const tokenManager = createTokenManager("jwt-token");
    const manager = new TdpSearchManager({
      baseUrl: "https://tdp.example.com",
      orgSlug: "acme",
      jwtManager: tokenManager,
    });

    const body = {
      searchTerm: "sample status",
      from: 10,
      size: 25,
      sort: "createdAt",
      order: "desc",
      types: ["sample"],
      omitted: undefined,
    } as SearchEqlRequest & { omitted?: undefined };

    const result = await manager.handleSearchRequest(request, body);

    expect(tokenManager.getTokenFromExpressRequest).toHaveBeenCalledWith(request);
    expect(MockTDPClient).toHaveBeenCalledWith({
      tdpEndpoint: "https://tdp.example.com",
      orgSlug: "acme",
      authToken: "jwt-token",
      artifactType: "data-app",
    });
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockSearchEql).toHaveBeenCalledWith({
      from: 10,
      size: 25,
      types: ["sample"],
      query: {
        simple_query_string: {
          query: "sample status",
          default_operator: "and",
        },
      },
      sort: [{ createdAt: "desc" }],
    });
    expect(result).toEqual({ hits: { hits: [] } });
  });

  it("uses environment configuration and string sorting when order is omitted", async () => {
    process.env.TDP_ENDPOINT = "https://env.tdp.example.com";
    process.env.ORG_SLUG = "env-org";
    const tokenManager = createTokenManager("env-token");
    const manager = new TdpSearchManager({ jwtManager: tokenManager });

    await manager.handleSearchRequest(request, {
      searchTerm: "",
      sort: "name",
    } as SearchEqlRequest);

    expect(MockTDPClient).toHaveBeenCalledWith({
      tdpEndpoint: "https://env.tdp.example.com",
      orgSlug: "env-org",
      authToken: "env-token",
      artifactType: "data-app",
    });
    expect(mockSearchEql).toHaveBeenCalledWith({
      sort: ["name"],
    });
  });

  it("throws before creating a client when no request token is available", async () => {
    const manager = new TdpSearchManager({
      baseUrl: "https://tdp.example.com",
      orgSlug: "acme",
      jwtManager: createTokenManager(null),
    });

    await expect(manager.handleSearchRequest(request, {} as SearchEqlRequest)).rejects.toThrow(
      "No valid authentication token found in request",
    );
    expect(MockTDPClient).not.toHaveBeenCalled();
  });

  it("throws when the TDP base URL is not configured", async () => {
    process.env.ORG_SLUG = "env-org";
    const manager = new TdpSearchManager({
      jwtManager: createTokenManager("jwt-token"),
    });

    await expect(manager.handleSearchRequest(request, {} as SearchEqlRequest)).rejects.toThrow(
      "TDP base URL not configured",
    );
  });

  it("throws when the organization slug is not configured", async () => {
    process.env.TDP_ENDPOINT = "https://tdp.example.com";
    const manager = new TdpSearchManager({
      jwtManager: createTokenManager("jwt-token"),
    });

    await expect(manager.handleSearchRequest(request, {} as SearchEqlRequest)).rejects.toThrow(
      "Organization slug not configured",
    );
  });
});
