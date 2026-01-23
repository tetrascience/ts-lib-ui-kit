import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JwtTokenManager } from "../JwtTokenManager";

const { mockGetValues, mockInit, MockTDPClient } = vi.hoisted(() => {
  const mockInit = vi.fn();
  const mockGetValues = vi.fn();
  const MockTDPClient = vi.fn(() => ({
    init: mockInit,
    getValues: mockGetValues,
  }));
  return { mockGetValues, mockInit, MockTDPClient };
});

vi.mock("@tetrascience-npm/ts-connectors-sdk", () => ({
  TDPClient: MockTDPClient,
}));

function createMockJwt(payload: Record<string, unknown>): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodePart = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encodePart(header)}.${encodePart(payload)}.mock-signature`;
}

function createExpiringToken(expiresInMs: number): string {
  const exp = Math.floor((Date.now() + expiresInMs) / 1000);
  return createMockJwt({
    exp,
    sub: "test-user",
    iat: Math.floor(Date.now() / 1000),
  });
}

describe("JwtTokenManager", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    MockTDPClient.mockClear();
    mockInit.mockReset();
    mockGetValues.mockReset();
    mockInit.mockResolvedValue(undefined);
    mockGetValues.mockResolvedValue([]);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getUserToken", () => {
    it("should return ts-auth-token cookie when present", async () => {
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({
        "ts-auth-token": "jwt-token",
      });
      expect(result).toBe("jwt-token");
    });

    it("should fall back to TS_AUTH_TOKEN env var when no cookie (for local development)", async () => {
      process.env.TS_AUTH_TOKEN = "env-auth-token";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({});
      expect(result).toBe("env-auth-token");
    });

    it("should prefer ts-auth-token cookie over TS_AUTH_TOKEN env var", async () => {
      process.env.TS_AUTH_TOKEN = "env-auth-token";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({
        "ts-auth-token": "cookie-token",
      });
      expect(result).toBe("cookie-token");
    });

    it("should resolve ts-token-ref via TDP client when no ts-auth-token", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const expectedJwt = createExpiringToken(3600000);
      mockGetValues.mockResolvedValue([{ jwt: expectedJwt }]);

      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({ "ts-token-ref": "ref-123" });

      expect(result).toBe(expectedJwt);
      expect(mockGetValues).toHaveBeenCalledWith(["ref-123"]);
    });

    it("should return null when no auth token available", async () => {
      delete process.env.TS_AUTH_TOKEN;
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({});
      expect(result).toBeNull();
    });

    it("should return null when ts-token-ref present but CONNECTOR_ID missing", async () => {
      delete process.env.TS_AUTH_TOKEN;
      delete process.env.CONNECTOR_ID;
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getUserToken({ "ts-token-ref": "ref-123" });
      expect(result).toBeNull();
    });
  });

  describe("getJwtFromTokenRef", () => {
    it("should return null when required parameters are missing", async () => {
      process.env.CONNECTOR_ID = "test-connector";

      // Missing tokenRef
      process.env.ORG_SLUG = "test-org";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      expect(await manager.getJwtFromTokenRef("")).toBeNull();

      // Missing ORG_SLUG
      delete process.env.ORG_SLUG;
      const manager2 = new JwtTokenManager({ baseUrl: "https://api.com" });
      expect(await manager2.getJwtFromTokenRef("token-ref")).toBeNull();

      // Missing baseUrl
      process.env.ORG_SLUG = "test-org";
      const managerNoUrl = new JwtTokenManager({ baseUrl: "" });
      expect(await managerNoUrl.getJwtFromTokenRef("token-ref")).toBeNull();
    });
  });

  describe("TDP client integration", () => {
    it("should create TDPClient with correct config and retrieve JWT", async () => {
      process.env.CONNECTOR_ID = "my-connector-id";
      process.env.ORG_SLUG = "my-org-slug";
      const expectedJwt = createExpiringToken(3600000);
      mockGetValues.mockResolvedValue([{ jwt: expectedJwt }]);

      const manager = new JwtTokenManager({
        baseUrl: "https://api.tetrascience.com",
      });
      const result = await manager.getJwtFromTokenRef("token-ref-123");

      expect(MockTDPClient).toHaveBeenCalledWith({
        tdpEndpoint: "https://api.tetrascience.com",
        connectorId: "my-connector-id",
        orgSlug: "my-org-slug",
      });
      expect(mockInit).toHaveBeenCalled();
      expect(mockGetValues).toHaveBeenCalledWith(["token-ref-123"]);
      expect(result).toBe(expectedJwt);
    });

    it("should return null when Connector KV store has no jwt", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      mockGetValues.mockResolvedValue([]);
      expect(await manager.getJwtFromTokenRef("ref-1")).toBeNull();

      mockGetValues.mockResolvedValue([{ someOtherField: "value" }]);
      expect(await manager.getJwtFromTokenRef("ref-2")).toBeNull();

      mockGetValues.mockResolvedValue([{}]);
      expect(await manager.getJwtFromTokenRef("ref-3")).toBeNull();
    });

    it("should cache tokens and reuse TDP client instance", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const token1 = createExpiringToken(3600000);
      const token2 = createExpiringToken(3600000);
      mockGetValues
        .mockResolvedValueOnce([{ jwt: token1 }])
        .mockResolvedValueOnce([{ jwt: token2 }]);

      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      // Same token ref
      const result1 = await manager.getJwtFromTokenRef("same-ref");
      const result2 = await manager.getJwtFromTokenRef("same-ref");
      expect(result1).toBe(token1);
      expect(result2).toBe(token1);
      expect(mockGetValues).toHaveBeenCalledTimes(1);

      // Different token refs
      await manager.getJwtFromTokenRef("different-ref");
      expect(mockGetValues).toHaveBeenCalledTimes(2);
      expect(mockInit).toHaveBeenCalledTimes(1); // Client reused
    });

    it("should handle TDP client errors gracefully", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      mockInit.mockRejectedValueOnce(new Error("Connection failed"));
      expect(await manager.getJwtFromTokenRef("ref-1")).toBeNull();

      // Reset for next call
      mockInit.mockResolvedValue(undefined);
      mockGetValues.mockRejectedValueOnce(new Error("Network error"));
      expect(await manager.getJwtFromTokenRef("ref-2")).toBeNull();
    });
  });

  describe("token expiration handling", () => {
    it("should refresh token when expiring within threshold", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const expiringToken = createExpiringToken(60000); // 1 minute (within 5 min threshold)
      const freshToken = createExpiringToken(3600000);

      mockGetValues
        .mockResolvedValueOnce([{ jwt: expiringToken }])
        .mockResolvedValueOnce([{ jwt: freshToken }]);

      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      const result1 = await manager.getJwtFromTokenRef("token-ref");
      const result2 = await manager.getJwtFromTokenRef("token-ref");

      expect(result1).toBe(expiringToken);
      expect(result2).toBe(freshToken);
      expect(mockGetValues).toHaveBeenCalledTimes(2); // Both calls hit API
    });

    it("should respect custom tokenRefreshThresholdMs", async () => {
      process.env.CONNECTOR_ID = "test-connector";
      process.env.ORG_SLUG = "test-org";
      const token = createExpiringToken(120000); // 2 minutes
      mockGetValues.mockResolvedValue([{ jwt: token }]);

      // 1 minute threshold - token has 2 min left, so should NOT refresh
      const manager = new JwtTokenManager({
        baseUrl: "https://api.com",
        tokenRefreshThresholdMs: 60000,
      });

      await manager.getJwtFromTokenRef("token-ref");
      await manager.getJwtFromTokenRef("token-ref");

      expect(mockGetValues).toHaveBeenCalledTimes(1); // Cached, no refresh needed
    });
  });

  describe("getTokenFromExpressRequest", () => {
    it("should extract token from Express request cookies", async () => {
      process.env.ORG_SLUG = "test-org";
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      const result = await manager.getTokenFromExpressRequest({
        cookies: { "ts-auth-token": "jwt-from-cookie" },
      });

      expect(result).toBe("jwt-from-cookie");
    });

    it("should return null when ORG_SLUG is not set", async () => {
      delete process.env.ORG_SLUG;
      delete process.env.TS_AUTH_TOKEN;
      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });

      const result = await manager.getTokenFromExpressRequest({
        cookies: { "ts-token-ref": "ref-123" },
      });

      expect(result).toBeNull();
    });

    it("should prefer ts-auth-token cookie over ts-token-ref and env var", async () => {
      process.env.TS_AUTH_TOKEN = "env-token";
      process.env.ORG_SLUG = "test-org";
      process.env.CONNECTOR_ID = "test-connector";
      mockGetValues.mockResolvedValue([{ jwt: createExpiringToken(3600000) }]);

      const manager = new JwtTokenManager({ baseUrl: "https://api.com" });
      const result = await manager.getTokenFromExpressRequest({
        cookies: {
          "ts-auth-token": "cookie-token",
          "ts-token-ref": "ref-123",
        },
      });

      expect(result).toBe("cookie-token");
      expect(mockGetValues).not.toHaveBeenCalled();
    });
  });
});
