import { describe, it, expect, vi } from "vitest";

import {
  createRequestTrackingMiddleware,
  createConsoleLogger,
  generateRequestId,
  REQUEST_ID_HEADER,
  ORG_SLUG_HEADER,
  AUTH_TOKEN_HEADER,
} from "./request-tracking";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const makeRequest = (
  url = "https://example.com/api/test",
  method = "GET",
) => new Request(url, { method });

const baseCallOptions = {
  schemaPath: "/test",
  params: {},
  id: "op-1",
  options: {},
};

// ---------------------------------------------------------------------------
// generateRequestId
// ---------------------------------------------------------------------------

describe("generateRequestId", () => {
  it("returns a valid UUID v4", () => {
    expect(generateRequestId()).toMatch(UUID_REGEX);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });

  it("falls back when crypto.randomUUID is unavailable", () => {
    const original = crypto.randomUUID;
    // @ts-expect-error -- intentionally removing to test fallback
    crypto.randomUUID = undefined;

    try {
      expect(generateRequestId()).toMatch(UUID_REGEX);
    } finally {
      crypto.randomUUID = original;
    }
  });
});

// ---------------------------------------------------------------------------
// createConsoleLogger
// ---------------------------------------------------------------------------

describe("createConsoleLogger", () => {
  it("logs at info level by default", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = createConsoleLogger();

    logger.debug("hidden");
    logger.info("visible");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith("visible");
  });

  it("prepends prefix", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = createConsoleLogger({ prefix: "app" });

    logger.info("msg");

    expect(infoSpy).toHaveBeenCalledWith("[app] msg");
  });

  it("respects custom log level", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createConsoleLogger({ level: "warn" });

    logger.info("hidden");
    logger.warn("visible");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith("visible");
  });

  it("passes metadata as second argument", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const meta = { requestId: "abc" };
    createConsoleLogger().info("msg", meta);

    expect(infoSpy).toHaveBeenCalledWith("msg", meta);
  });
});

// ---------------------------------------------------------------------------
// createRequestTrackingMiddleware
// ---------------------------------------------------------------------------

describe("createRequestTrackingMiddleware", () => {
  describe("onRequest", () => {
    it("injects ts-request-id header", () => {
      const mw = createRequestTrackingMiddleware();
      const request = makeRequest();

      mw.onRequest!({ request, ...baseCallOptions });

      expect(request.headers.get(REQUEST_ID_HEADER)).toMatch(UUID_REGEX);
    });

    it("uses custom generateRequestId", () => {
      const mw = createRequestTrackingMiddleware({
        generateRequestId: () => "custom-id",
      });
      const request = makeRequest();

      mw.onRequest!({ request, ...baseCallOptions });

      expect(request.headers.get(REQUEST_ID_HEADER)).toBe("custom-id");
    });

    it("uses custom requestIdHeader", () => {
      const mw = createRequestTrackingMiddleware({
        requestIdHeader: "x-custom",
      });
      const request = makeRequest();

      mw.onRequest!({ request, ...baseCallOptions });

      expect(request.headers.get("x-custom")).toBeTruthy();
      expect(request.headers.get(REQUEST_ID_HEADER)).toBeNull();
    });

    it("injects static extra headers", () => {
      const mw = createRequestTrackingMiddleware({
        extraHeaders: {
          [ORG_SLUG_HEADER]: "my-org",
          [AUTH_TOKEN_HEADER]: "tok_123",
        },
      });
      const request = makeRequest();

      mw.onRequest!({ request, ...baseCallOptions });

      expect(request.headers.get(ORG_SLUG_HEADER)).toBe("my-org");
      expect(request.headers.get(AUTH_TOKEN_HEADER)).toBe("tok_123");
    });

    it("injects dynamic extra headers", () => {
      let n = 0;
      const mw = createRequestTrackingMiddleware({
        extraHeaders: { "x-dyn": () => `val-${++n}` },
      });

      const r1 = makeRequest();
      const r2 = makeRequest();
      mw.onRequest!({ request: r1, ...baseCallOptions });
      mw.onRequest!({ request: r2, ...baseCallOptions });

      expect(r1.headers.get("x-dyn")).toBe("val-1");
      expect(r2.headers.get("x-dyn")).toBe("val-2");
    });

    it("returns the request", () => {
      const request = makeRequest();
      const result = createRequestTrackingMiddleware().onRequest!({
        request,
        ...baseCallOptions,
      });
      expect(result).toBe(request);
    });

    it("logs with sanitized URL (no query string)", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const mw = createRequestTrackingMiddleware({
        logger,
        generateRequestId: () => "log-id",
      });

      mw.onRequest!({
        request: makeRequest("https://example.com/api/test?token=secret"),
        ...baseCallOptions,
      });

      expect(logger.debug).toHaveBeenCalledWith(
        "Outgoing request",
        expect.objectContaining({
          requestId: "log-id",
          path: "/api/test",
        }),
      );
      // Ensure query string is not logged
      expect(logger.debug.mock.calls[0][1]).not.toHaveProperty("url");
    });
  });

  describe("onResponse", () => {
    it("logs response with correlated request ID", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const mw = createRequestTrackingMiddleware({
        logger,
        generateRequestId: () => "resp-id",
      });
      const request = makeRequest();
      mw.onRequest!({ request, ...baseCallOptions });

      mw.onResponse!({
        request,
        response: new Response("ok", { status: 200 }),
        ...baseCallOptions,
      });

      expect(logger.debug).toHaveBeenCalledWith(
        "Response received",
        expect.objectContaining({ requestId: "resp-id", status: 200 }),
      );
    });
  });

  describe("onError", () => {
    it("logs error with correlated request ID", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const mw = createRequestTrackingMiddleware({
        logger,
        generateRequestId: () => "err-id",
      });
      const request = makeRequest();
      mw.onRequest!({ request, ...baseCallOptions });

      mw.onError!({
        request,
        error: new Error("fail"),
        ...baseCallOptions,
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Request failed",
        expect.objectContaining({ requestId: "err-id", error: "fail" }),
      );
    });

    it("handles non-Error objects", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const mw = createRequestTrackingMiddleware({ logger });
      const request = makeRequest();
      mw.onRequest!({ request, ...baseCallOptions });

      mw.onError!({ request, error: "string error", ...baseCallOptions });

      expect(logger.error).toHaveBeenCalledWith(
        "Request failed",
        expect.objectContaining({ error: "string error" }),
      );
    });
  });
});
