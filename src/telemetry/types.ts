import type { LogRecordProcessor } from "@opentelemetry/sdk-logs";
import type { RequestTrackingLogger } from "@tetrascience-npm/request";
import type {
  ArtifactIdentity,
  MetricsOptions,
  StartSpanOptions,
  Telemetry,
  TelemetryTracingOptions,
  TetraSpan,
  TrackErrorContext,
} from "@tetrascience-npm/request/telemetry";
import type { ReactNode } from "react";

/** Props for {@link TelemetryProvider}. */
export interface TelemetryProviderProps {
  /**
   * Artifact identity from the host mount props (`hostProps.artifact`).
   * Fields missing here fall back to {@link TelemetryProviderProps.manifest}.
   */
  artifact?: Partial<ArtifactIdentity>;
  /**
   * Manifest fallback for standalone dev, e.g. `import manifest from './manifest.json'`.
   * Used field-by-field wherever `artifact` is incomplete.
   */
  manifest?: Partial<ArtifactIdentity>;
  /**
   * Org slug hint. Producer-asserted only — the gateway stamps the
   * authenticated org server-side and that value wins (SW-2319).
   */
  orgSlug?: string;
  /**
   * Resolve the current user's auth token for the `ts-auth-token` header.
   *
   * REQUIRED for a browser data app to deliver anything. The gateway reads
   * credentials from headers only, and its CORS config (`origin: ['*']`, no
   * `credentials`) means a browser cannot send a session cookie — so without
   * this every batch 401s and the app emits into the void.
   *
   * Called on every export, so pass a function that reads the host's CURRENT
   * token rather than a captured string: a data app outlives any single
   * short-lived token.
   */
  getAuthToken?: () => string | undefined | Promise<string | undefined>;
  /** OTLP/HTTP logs URL override. Default: the core's endpoint resolution. */
  logsUrl?: string;
  /**
   * Master switch. Default: `window.env.TELEMETRY_ENABLED` when the host
   * provides it, otherwise `true`. When disabled the context client is a
   * no-op — no OTel provider, no exporter, no network, no buffers.
   */
  enabled?: boolean;
  /**
   * Route records to the stock console exporter in addition to OTLP, so
   * authors see the exact pre-gateway payload. Default:
   * `window.env.TELEMETRY_DEBUG` when the host provides it, otherwise `false`.
   */
  debug?: boolean;
  /** Log record processors override (tests, custom pipelines). */
  processors?: LogRecordProcessor[];
  /**
   * Distributed tracing (SW-2478). Off unless `tracing.enabled` is true —
   * tracing adds a second exporter and a per-span network cost, so an app
   * opts in rather than acquiring it by upgrading the library.
   */
  tracing?: TelemetryTracingOptions;
  /**
   * OTel metrics (SW-2478). Off unless `metrics.enabled` is true, for the same
   * reason tracing is: a metrics reader is a recurring timer and a recurring
   * export.
   *
   * Forwarded here rather than left to the core's defaults because apps build
   * their client through THIS provider — an option the provider does not pass
   * through is one no React data app can ever set, which is how
   * `gauge()`/`histogram()` came to be callable but permanently inert.
   */
  metrics?: MetricsOptions;
  /**
   * Cap on how long `flush()` and `shutdown()` wait for the exporter, in ms.
   * Forwarded to the core, which defaults to 5000. Worth setting when the
   * host unmounts on a route change and cannot afford a 5s teardown.
   */
  flushTimeoutMillis?: number;
  /** Logger for setup failures and stripped attributes. */
  logger?: RequestTrackingLogger;
  children?: ReactNode;
}

/** Bound emitters returned by {@link useTetraEvents}. */
export interface TetraEvents {
  /** Record a product event (`App[:Page][:Object]:Action`). */
  trackEvent(name: string, attributes?: Record<string, unknown>, body?: unknown): void;
  /** Record an error event with `exception.*` attributes. */
  trackError(error: unknown, context?: TrackErrorContext): void;
  /**
   * Start a span (SW-2478). No-op unless the provider was given
   * `tracing.enabled`. The caller must `end()` it — prefer `withSpan`.
   */
  startSpan(name: string, options?: StartSpanOptions): TetraSpan;
  /**
   * Run `fn` inside a span, ending it when the work settles (promises
   * included) and on the error path. Errors are recorded and re-thrown.
   */
  withSpan<T>(name: string, fn: (span: TetraSpan) => T, options?: StartSpanOptions): T;
  /**
   * Add to a running total that only ever goes up (SW-2478). No-op unless the
   * provider was given `metrics.enabled`.
   *
   * The core client and the Python distro have both exposed this from the
   * start; the React bindings did not, so a data app could reach `gauge`,
   * `histogram` and `upDownCounter` but not the most basic instrument of the
   * four. Found by the bindings' own e2e — `events.counter is not a function`.
   */
  counter(name: string, delta?: number, attributes?: Record<string, unknown>): void;
  /**
   * Record the current value of something (SW-2478). No-op unless the
   * provider was given `metrics.enabled`.
   *
   * Unlike {@link TetraEvents.trackEvent}, this carries a VALUE — counting is
   * one-record-one-increment and cannot express "the reading right now".
   */
  gauge(name: string, value: number, attributes?: Record<string, unknown>): void;
  /** Record a distribution sample — a duration, a size. Same opt-in as `gauge`. */
  histogram(name: string, value: number, attributes?: Record<string, unknown>): void;
  /** Add to a running total that can go both ways. Same opt-in as `gauge`. */
  upDownCounter(name: string, delta: number, attributes?: Record<string, unknown>): void;
}

/**
 * The context client: a stable façade whose underlying per-instance client is
 * attached by {@link TelemetryProvider} in an effect. Identity is stable for
 * the provider's lifetime, so hook callbacks never change identity.
 */
export type TelemetryFacade = Telemetry & {
  /** @internal */
  attach(client: Telemetry): void;
  /** @internal */
  detach(client: Telemetry): void;
};
