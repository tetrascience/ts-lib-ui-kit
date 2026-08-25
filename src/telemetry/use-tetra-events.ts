import {useCallback, useContext, useMemo} from "react";

import type {StartSpanOptions, Telemetry, TetraSpan, TrackErrorContext} from "@tetrascience-npm/request/telemetry";
import {TelemetryContext} from "./context";
import {NOOP_TELEMETRY} from "./facade";
import type {TetraEvents} from "./types";

let warned = false;

/**
 * Outside a provider the hook no-ops with one development warning rather than
 * throwing. Rationale: the core's contract is that telemetry never throws into
 * application code — a missing provider is an instrumentation defect, and
 * crashing a customer's app over it inverts the risk. The warning (dev only,
 * once per module instance) keeps the mistake visible during development and
 * is asserted in tests.
 */
function warnOnce(): void {
	if (warned) return;
	warned = true;
	if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;
	// eslint-disable-next-line no-console
	console.warn("[telemetry] useTetraEvents() called outside <TelemetryProvider> — events are dropped.");
}

/** @internal test seam: reset the once-per-module warning latch. */
export function __resetTelemetryWarningForTests(): void {
	warned = false;
}

/** Access the raw context client — e.g. to wire {@link installGlobalErrorHandlers}. */
export function useTelemetryClient(): Telemetry {
	const client = useContext(TelemetryContext);
	if (!client) warnOnce();
	return client ?? NOOP_TELEMETRY;
}

/**
 * The app-facing emitters, bound to the provider's client.
 *
 * Identities are stable for the provider's lifetime (the context value is a
 * stable façade), so these are safe as effect dependencies.
 *
 * @example
 * ```tsx
 * const {trackEvent} = useTetraEvents();
 * trackEvent('Sandbox:Chat:Submit', {model});
 * ```
 */
export function useTetraEvents(): TetraEvents {
	const client = useTelemetryClient();

	const trackEvent = useCallback(
		(name: string, attributes?: Record<string, unknown>, body?: unknown) => {
			client.trackEvent(name, attributes, body);
		},
		[client],
	);

	const trackError = useCallback(
		(error: unknown, context?: TrackErrorContext) => {
			client.trackError(error, context);
		},
		[client],
	);

	// SW-2478. Every method here delegates to the core rather than
	// re-implementing anything, so React and non-React consumers cannot drift.
	const startSpan = useCallback(
		(name: string, options?: StartSpanOptions) => client.startSpan(name, options),
		[client],
	);

	// SW-2478 metrics. Same delegation rule as startSpan: the
	// instrument caching, the value guards and the publishable-name warning all
	// live in the core client, so re-implementing any of it here would give
	// React apps different behaviour from Node ones for the same call.
	const gauge = useCallback(
		(name: string, value: number, attributes?: Record<string, unknown>) => client.gauge(name, value, attributes),
		[client],
	);

	const histogram = useCallback(
		(name: string, value: number, attributes?: Record<string, unknown>) => client.histogram(name, value, attributes),
		[client],
	);

	const upDownCounter = useCallback(
		(name: string, delta: number, attributes?: Record<string, unknown>) =>
			client.upDownCounter(name, delta, attributes),
		[client],
	);

	const withSpan = useCallback(
		<T>(name: string, fn: (span: TetraSpan) => T, options?: StartSpanOptions) => client.withSpan(name, fn, options),
		[client],
	);

	return useMemo(
		() => ({trackEvent, trackError, startSpan, withSpan, gauge, histogram, upDownCounter}),
		[trackEvent, trackError, startSpan, withSpan, gauge, histogram, upDownCounter],
	);
}
