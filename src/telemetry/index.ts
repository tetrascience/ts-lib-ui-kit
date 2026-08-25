/**
 * React bindings for the product-event telemetry distro (SW-2322).
 *
 * One provider mount and one import is the whole integration:
 *
 * ```tsx
 * import {TelemetryProvider, TSErrorBoundary, useTetraEvents} from '@tetrascience-npm/request/telemetry-react';
 * ```
 *
 * React is an optional peer dependency — importing the package root or
 * `/telemetry` never pulls React in.
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
export * from "../shared/artifact";
