import { createTelemetry } from "@tetrascience-npm/request/telemetry";
import { useEffect, useRef, useState } from "react";

import { TelemetryContext } from "./context";
import { NOOP_TELEMETRY, createTelemetryFacade } from "./facade";

import type { TelemetryProviderProps } from "./types";
import type { ArtifactType, TelemetryArtifact, TelemetryOptions } from "@tetrascience-npm/request/telemetry";

/**
 * Read a boolean flag from the host-provided browser config (`window.env`) —
 * the same seam the core uses for `API_URI`. Accepts real booleans and the
 * string forms hosts inject through templated config.
 */
export function readHostFlag(key: string): boolean | undefined {
  if (typeof window === "undefined") return undefined;
  const value = (window as { env?: Record<string, unknown> }).env?.[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (/^(true|1|yes)$/i.test(value)) return true;
    if (/^(false|0|no)$/i.test(value)) return false;
  }
  return undefined;
}

/**
 * Merge host mount props with the manifest fallback, field by field. Returns
 * undefined when identity is still incomplete — the core then emits without
 * artifact identity rather than with placeholder values.
 */
export function resolveArtifact(
  artifact: Partial<TelemetryArtifact> | undefined,
  manifest: Partial<TelemetryArtifact> | undefined,
  artifactType: ArtifactType = "data-app",
): TelemetryArtifact | undefined {
  const namespace = artifact?.namespace ?? manifest?.namespace;
  const slug = artifact?.slug ?? manifest?.slug;
  const version = artifact?.version ?? manifest?.version;
  const type = artifact?.type ?? manifest?.type ?? artifactType;
  return namespace && slug && version ? { namespace, slug, version, type } : undefined;
}

/**
 * Mount once, near the app root: builds a PER-INSTANCE telemetry client from
 * the app's identity and exposes it to `useTetraEvents` / `TSErrorBoundary`.
 *
 * The client is never module-global — federated apps share `globalThis` with
 * the host and siblings, so a global client would cross-attribute events.
 * It is built inside an effect and shut down (which flushes) on unmount, so
 * StrictMode's mount → unmount → mount cycle disposes the first client
 * cleanly instead of leaving a dead provider attached. The context value is a
 * stable façade, so hook callback identities never change.
 *
 * No user identity is ever attached client-side: `user.id` is stamped
 * server-side at the gateway from the authenticated principal.
 *
 * @example
 * ```tsx
 * <TelemetryProvider artifact={hostProps.artifact} manifest={manifest} orgSlug={org?.slug}>
 *   <App />
 * </TelemetryProvider>
 * ```
 */
export function TelemetryProvider({ children, ...props }: TelemetryProviderProps) {
  const enabled = props.enabled ?? readHostFlag("TELEMETRY_ENABLED") ?? true;
  const debug = props.debug ?? readHostFlag("TELEMETRY_DEBUG") ?? false;
  const artifact = resolveArtifact(props.artifact, props.manifest, props.artifactType);

  const [facade] = useState(createTelemetryFacade);

  // Options are read at construction time; only identity-shaped changes
  // rebuild the client (a new `processors`/`logger` object per render must not).
  // The client is built ONCE per identity change, but the token resolver has to
  // track re-renders: an app writing `getAuthToken={() => token}` produces a new
  // closure each render, and the client would otherwise keep calling the first
  // one — capturing whatever token existed at mount. That fails silently and
  // late, as 401s appearing only after the first token rotation. Holding the
  // prop in a ref and calling through it means the client always invokes the
  // CURRENT closure without being rebuilt.
  const getAuthTokenRef = useRef(props.getAuthToken);
  getAuthTokenRef.current = props.getAuthToken;

  const options: TelemetryOptions = {
    artifact,
    orgSlug: props.orgSlug,
    logsUrl: props.logsUrl,
    debug,
    flushTimeoutMillis: props.flushTimeoutMillis,
    processors: props.processors,
    logger: props.logger,
    tracing: props.tracing,
    metrics: props.metrics,
    getAuthToken: () => getAuthTokenRef.current?.(),
  };
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // `tracing` is part of the identity: without it, flipping tracing on (or
  // changing the sample ratio) would not rebuild the client, so the change
  // would silently take effect only when some UNRELATED identity field
  // happened to change. Read field-by-field rather than by reference so an
  // inline `tracing={{enabled: true}}` object literal does not rebuild every
  // render.
  // Only SCALARS go in the key. `tracing.spanProcessors` and `metrics.readers`
  // hold live SDK instances — serialising those would make the key depend on
  // an exporter's internal state (spurious rebuilds), and a processor with a
  // circular reference would throw here and take the whole provider down on
  // render. Their PRESENCE is part of the identity; their contents are not.
  const identityKey = JSON.stringify([
    enabled,
    debug,
    props.logsUrl ?? null,
    props.orgSlug ?? null,
    artifact ?? null,
    props.tracing?.enabled ?? null,
    props.tracing?.tracesUrl ?? null,
    props.tracing?.sampleRatio ?? null,
    (props.tracing?.spanProcessors?.length ?? 0) > 0,
    // Same argument as `tracing`: without metrics in the identity, flipping
    // it on would not rebuild the client, so the change would take effect
    // only when some UNRELATED identity field happened to change.
    props.metrics?.enabled ?? null,
    props.metrics?.metricsUrl ?? null,
    props.metrics?.exportIntervalMillis ?? null,
    (props.metrics?.readers?.length ?? 0) > 0,
  ]);

  useEffect(() => {
    const client = enabled ? createTelemetry(optionsRef.current) : NOOP_TELEMETRY;
    facade.attach(client);
    return () => {
      facade.detach(client);
      // shutdown() flushes what is buffered, then tears the pipeline down.
      void client.shutdown();
    };
    // `enabled` is encoded in identityKey; optionsRef is intentionally not a dep.
  }, [facade, identityKey, enabled]);

  return <TelemetryContext.Provider value={facade}>{children}</TelemetryContext.Provider>;
}
