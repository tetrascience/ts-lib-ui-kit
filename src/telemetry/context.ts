import {createContext} from "react";

import type {Telemetry} from "@tetrascience-npm/request/telemetry";

/**
 * `null` outside a {@link TelemetryProvider} — consumers no-op rather than
 * throw (telemetry never breaks the app; see `use-tetra-events.ts`).
 */
export const TelemetryContext = createContext<Telemetry | null>(null);
