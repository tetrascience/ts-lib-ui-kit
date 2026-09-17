/**
 * React bindings for the product-event telemetry distro (SW-2322).
 *
 * One provider mount and one import is the whole integration:
 *
 * ```tsx
 * import {TelemetryProvider, TSErrorBoundary, useTetraEvents} from '@tetrascience-npm/tetrascience-react-ui/telemetry';
 * ```
 *
 * This entry IS the React layer — it exports a provider, a hook and an error
 * boundary — so importing it pulls React in, and `react` is a required peer of
 * this package (it carries no `peerDependenciesMeta.optional`).
 *
 * If you want telemetry without React, import the framework-agnostic core
 * directly: `@tetrascience-npm/request/telemetry`. That is what these bindings
 * wrap, and it is re-exported below so a consumer never needs both imports.
 */
export * from "./types";
export * from "./events";
export * from "./context";
export * from "./facade";
export * from "./telemetry-provider";
export * from "./use-tetra-events";
export * from "./error-boundary";
export * from "./global-handlers";
export * from "@tetrascience-npm/request/telemetry";
export type {ArtifactIdentity} from "@tetrascience-npm/request/telemetry";
