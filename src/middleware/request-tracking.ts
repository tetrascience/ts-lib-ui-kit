import {
  AUTH_TOKEN_HEADER,
  ORG_SLUG_HEADER,
} from "../components/composed/TdpSearch/constants";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const REQUEST_ID_HEADER = "ts-request-id";
export { AUTH_TOKEN_HEADER, ORG_SLUG_HEADER };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Logger interface for request tracking middleware. */
export interface RequestTrackingLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/** Options for createRequestTrackingMiddleware. */
export interface RequestTrackingMiddlewareOptions {
  /** Function to generate request IDs. Defaults to crypto.randomUUID(). */
  generateRequestId?: () => string;
  /** If provided, logs each outgoing request/response with the request ID. */
  logger?: RequestTrackingLogger;
  /** Additional headers to inject on every request. Values can be static strings or dynamic functions. */
  extraHeaders?: Record<string, string | (() => string)>;
  /** Header name for the request ID. Defaults to 'ts-request-id'. */
  requestIdHeader?: string;
}

/**
 * Middleware compatible with openapi-fetch's client.use().
 * Locally defined to avoid a runtime dependency on openapi-fetch.
 * Fields are readonly to stay compatible with openapi-fetch's Middleware type.
 */
export interface OpenApiFetchMiddleware {
  onRequest?: (options: {
    readonly request: Request;
    readonly schemaPath: string;
    readonly params: Record<string, unknown>;
    readonly id: string;
    readonly options: Record<string, unknown>;
  }) =>
    | void
    | Request
    | Response
    | undefined
    | Promise<Request | Response | undefined | void>;

  onResponse?: (options: {
    readonly request: Request;
    readonly response: Response;
    readonly schemaPath: string;
    readonly params: Record<string, unknown>;
    readonly id: string;
    readonly options: Record<string, unknown>;
  }) => void | Response | undefined | Promise<Response | undefined | void>;

  onError?: (options: {
    readonly request: Request;
    readonly error: unknown;
    readonly schemaPath: string;
    readonly params: Record<string, unknown>;
    readonly id: string;
    readonly options: Record<string, unknown>;
  }) => void | Response | Error | Promise<void | Response | Error>;
}

// ---------------------------------------------------------------------------
// Request ID generation
// ---------------------------------------------------------------------------

/**
 * Generate a UUID v4 request ID.
 *
 * Uses crypto.randomUUID() which is available in all modern browsers
 * (Chrome 92+, Firefox 95+, Safari 15.4+) and in Node 19+.
 * Falls back to a Math.random()-based implementation for insecure contexts (HTTP in dev).
 */
export function generateRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Console logger
// ---------------------------------------------------------------------------

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

export interface ConsoleLoggerOptions {
  /** Prefix prepended to all log messages. */
  prefix?: string;
  /** Minimum log level. Defaults to 'info'. */
  level?: LogLevel;
}

/**
 * Create a structured console logger for request tracking.
 *
 * Outputs structured log entries to the browser console using separate
 * console arguments, including the requestId from metadata for correlation
 * with backend logs.
 */
export function createConsoleLogger(
  options?: ConsoleLoggerOptions,
): RequestTrackingLogger {
  const minLevel = LOG_LEVELS[options?.level ?? "info"];
  const prefix = options?.prefix;

  const formatMessage = (message: string): string =>
    prefix ? `[${prefix}] ${message}` : message;

  const shouldLog = (level: LogLevel): boolean => LOG_LEVELS[level] >= minLevel;

  const log = (
    method: "debug" | "info" | "warn" | "error",
    message: string,
    meta?: Record<string, unknown>,
  ) => {
    if (meta !== undefined) {
      console[method](formatMessage(message), meta);
    } else {
      console[method](formatMessage(message));
    }
  };

  return {
    debug(message, meta) {
      if (shouldLog("debug")) log("debug", message, meta);
    },
    info(message, meta) {
      if (shouldLog("info")) log("info", message, meta);
    },
    warn(message, meta) {
      if (shouldLog("warn")) log("warn", message, meta);
    },
    error(message, meta) {
      if (shouldLog("error")) log("error", message, meta);
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract pathname from a URL, stripping query string and hash. */
function sanitizeUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Create request tracking middleware for openapi-fetch clients.
 *
 * Injects a `ts-request-id` header on every outgoing request for end-to-end
 * tracing from the browser through backend services. Optionally logs
 * requests/responses with the correlated request ID.
 *
 * @example
 * ```ts
 * import createClient from 'openapi-fetch';
 * import { createRequestTrackingMiddleware } from '@tetrascience-npm/tetrascience-react-ui';
 *
 * const client = createClient<paths>({ baseUrl: '/api' });
 * client.use(createRequestTrackingMiddleware());
 * ```
 */
export function createRequestTrackingMiddleware(
  options?: RequestTrackingMiddlewareOptions,
): OpenApiFetchMiddleware {
  const {
    generateRequestId: genId = generateRequestId,
    logger,
    extraHeaders,
    requestIdHeader = REQUEST_ID_HEADER,
  } = options ?? {};

  return {
    onRequest({ request, schemaPath }) {
      const requestId = genId();

      request.headers.set(requestIdHeader, requestId);

      if (extraHeaders) {
        for (const [key, value] of Object.entries(extraHeaders)) {
          const resolved = typeof value === "function" ? value() : value;
          if (resolved) {
            request.headers.set(key, resolved);
          }
        }
      }

      logger?.debug("Outgoing request", {
        requestId,
        method: request.method,
        path: sanitizeUrl(request.url),
        schemaPath,
      });

      return request;
    },

    onResponse({ request, response, schemaPath }) {
      const requestId = request.headers.get(requestIdHeader);

      logger?.debug("Response received", {
        requestId,
        method: request.method,
        path: sanitizeUrl(request.url),
        schemaPath,
        status: response.status,
      });
    },

    onError({ request, error, schemaPath }) {
      const requestId = request.headers.get(requestIdHeader);

      logger?.error("Request failed", {
        requestId,
        method: request.method,
        path: sanitizeUrl(request.url),
        schemaPath,
        error: error instanceof Error ? error.message : String(error),
      });
    },
  };
}
