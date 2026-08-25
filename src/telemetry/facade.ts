import {NOOP_SPAN} from "@tetrascience-npm/request/telemetry";
import type {Telemetry, TrackErrorContext} from "@tetrascience-npm/request/telemetry";
import type {TelemetryFacade} from "./types";

/** A client that accepts and drops everything (`enabled={false}`, no provider). */
export const NOOP_TELEMETRY: Telemetry = {
	trackEvent() {
		// disabled: nothing is recorded, nothing is buffered
	},
	trackError() {
		// disabled: nothing is recorded, nothing is buffered
	},
	counter() {
		// disabled: nothing is recorded, nothing is buffered
	},
	startSpan: () => NOOP_SPAN,
	// Still RUNS the callback: withSpan wraps application work, so skipping it
	// when telemetry is off would make disabling telemetry change what the app
	// does. Only the measurement is dropped.
	withSpan: (_name, fn) => fn(NOOP_SPAN),
	gauge() {
		// disabled: nothing is recorded
	},
	histogram() {
		// disabled: nothing is recorded
	},
	upDownCounter() {
		// disabled: nothing is recorded
	},
	async flush() {
		// nothing to flush
	},
	async shutdown() {
		// nothing to tear down
	},
};

/** Records emitted before the provider's effect attaches a client. */
const MAX_PENDING = 50;

type Pending =
	| {kind: "event"; name: string; attributes?: Record<string, unknown>; body?: unknown}
	| {kind: "error"; error: unknown; context?: TrackErrorContext}
	| {kind: "counter"; name: string; attributes?: Record<string, unknown>};

/**
 * Stable context value that forwards to the currently attached client.
 *
 * The real client is built in an effect (so React StrictMode's mount →
 * unmount → mount cycle disposes it cleanly instead of leaving a shut-down
 * provider behind), but child effects run *before* the provider's effect —
 * so records emitted in that window are held here (bounded) and replayed on
 * attach. The buffer is drained exactly once, so a StrictMode re-attach
 * cannot re-emit it.
 */
export function createTelemetryFacade(): TelemetryFacade {
	let target: Telemetry | undefined;
	let pending: Pending[] = [];

	const buffer = (record: Pending): void => {
		if (pending.length < MAX_PENDING) pending.push(record);
	};

	return {
		trackEvent(name, attributes, body) {
			if (target) target.trackEvent(name, attributes, body);
			else buffer({kind: "event", name, attributes, body});
		},
		trackError(error, context) {
			if (target) target.trackError(error, context);
			else buffer({kind: "error", error, context});
		},
		counter(name, attributes) {
			if (target) target.counter(name, attributes);
			else buffer({kind: "counter", name, attributes});
		},
		// Spans are NOT buffered, unlike the three above. A span carries a live
		// start and end, so replaying one after attach would invent a duration
		// that never happened — worse than not recording it. Work that runs
		// before the provider's effect attaches a client is simply untraced.
		startSpan(name, options) {
			return target ? target.startSpan(name, options) : NOOP_SPAN;
		},
		// Metric recordings before attach are DROPPED, not buffered. A gauge is a
		// point-in-time reading and a histogram observation is timestamped by the
		// SDK on record, so replaying either after attach would date it to the
		// wrong moment. Events and counters buffer because a product event is a
		// fact that happened, not a sample of a moving value.
		gauge(name, value, attributes) {
			target?.gauge(name, value, attributes);
		},
		histogram(name, value, attributes) {
			target?.histogram(name, value, attributes);
		},
		upDownCounter(name, delta, attributes) {
			target?.upDownCounter(name, delta, attributes);
		},
		withSpan(name, fn, options) {
			return target ? target.withSpan(name, fn, options) : fn(NOOP_SPAN);
		},
		async flush() {
			await target?.flush();
		},
		async shutdown() {
			await target?.shutdown();
		},
		attach(client) {
			target = client;
			const replay = pending;
			pending = [];
			for (const record of replay) {
				if (record.kind === "event") client.trackEvent(record.name, record.attributes, record.body);
				else if (record.kind === "counter") client.counter(record.name, record.attributes);
				else client.trackError(record.error, record.context);
			}
		},
		detach(client) {
			// Guard against an out-of-order cleanup detaching a newer client.
			if (target === client) target = undefined;
		},
	};
}
