import {TelemetryEvent} from "./events";

import type {Telemetry} from "@tetrascience-npm/request/telemetry";

/** Options for {@link installGlobalErrorHandlers}. */
export interface GlobalErrorHandlerOptions {
	/** Event name for `window.onerror`. Default: `App:Error:Window`. */
	windowErrorEventName?: string;
	/** Event name for unhandled promise rejections. Default: `App:Error:UnhandledRejection`. */
	unhandledRejectionEventName?: string;
	/** Extra attributes merged into both events. */
	attributes?: Record<string, unknown>;
}

// Keyed by client so two federated apps can each install their own handlers,
// while a repeated install for the same client (StrictMode, hot reload) is a
// no-op that returns the original uninstall.
const installed = new WeakMap<Telemetry, () => void>();

/**
 * Explicit opt-in: capture uncaught errors and unhandled promise rejections
 * for `client`. Never installed automatically by the provider — global
 * listeners are a host-level decision, and under Module Federation several
 * apps share `window`.
 *
 * Idempotent per client; returns an uninstall function (also idempotent).
 *
 * @example
 * ```tsx
 * const client = useTelemetryClient();
 * useEffect(() => installGlobalErrorHandlers(client), [client]);
 * ```
 */
export function installGlobalErrorHandlers(client: Telemetry, options: GlobalErrorHandlerOptions = {}): () => void {
	const existing = installed.get(client);
	if (existing) return existing;
	if (typeof window === "undefined") {
		return () => {
			// nothing was installed (SSR / non-browser runtime)
		};
	}

	const onError = (event: ErrorEvent): void => {
		client.trackError(event.error ?? event.message, {
			name: options.windowErrorEventName ?? TelemetryEvent.WindowError,
			attributes: {...options.attributes, "error.source": "window"},
		});
	};
	const onRejection = (event: PromiseRejectionEvent): void => {
		client.trackError(event.reason, {
			name: options.unhandledRejectionEventName ?? TelemetryEvent.UnhandledRejection,
			attributes: {...options.attributes, "error.source": "unhandledrejection"},
		});
	};

	window.addEventListener("error", onError);
	window.addEventListener("unhandledrejection", onRejection);

	const uninstall = (): void => {
		if (installed.get(client) !== uninstall) return;
		installed.delete(client);
		window.removeEventListener("error", onError);
		window.removeEventListener("unhandledrejection", onRejection);
	};
	installed.set(client, uninstall);
	return uninstall;
}
