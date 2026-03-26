export {
  createRequestTrackingMiddleware,
  createConsoleLogger,
  generateRequestId,
  REQUEST_ID_HEADER,
  ORG_SLUG_HEADER,
  AUTH_TOKEN_HEADER,
} from "./request-tracking";

export type { RequestTrackingMiddlewareOptions, RequestTrackingLogger, ConsoleLoggerOptions } from "./request-tracking";

export type { Middleware } from "openapi-fetch";
