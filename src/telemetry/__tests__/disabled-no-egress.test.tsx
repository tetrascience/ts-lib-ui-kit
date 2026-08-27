/**
 * `enabled={false}` must mean ZERO egress — not "records are dropped late".
 *
 * The provider tests elsewhere inject a processor and assert no record is
 * produced. That proves the emitter no-ops, but not that the export pipeline
 * was never built, because injecting `processors` bypasses endpoint resolution
 * entirely. Here `processors` is deliberately OMITTED so the real `logsUrl`
 * path runs.
 *
 * WHAT IS OBSERVED, AND WHY IT CHANGED. This used to mock
 * `@opentelemetry/exporter-logs-otlp-http` and spy on fetch/sendBeacon/XHR.
 * Neither works now that the core is a PUBLISHED package rather than sibling
 * source: `vi.mock` cannot reach a dependency that a CJS package `require`s
 * internally (verified — the mock is not applied even when createTelemetry is
 * called from this file), and the real exporter goes out through Node's http
 * stack, so the browser primitives never see it either. Both mechanisms were
 * silently blind, which made the disabled assertions vacuous.
 *
 * The observable that survives is the core's own logger. An enabled pipeline
 * ATTEMPTS an export and reports the failure; a disabled one never does. The
 * URL is a closed local port so the attempt fails immediately, with no DNS and
 * no real network.
 */
import {act, useEffect} from "react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {TelemetryProvider, useTetraEvents} from "..";

import {ARTIFACT, renderTree} from "./helpers";

declare global {
	 
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let warnSpy: ReturnType<typeof vi.fn>;
let fetchSpy: ReturnType<typeof vi.fn>;
let beaconSpy: ReturnType<typeof vi.fn>;
let xhrSendSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	warnSpy = vi.fn();
	fetchSpy = vi.fn(async () => new Response("{}", {status: 200}));
	beaconSpy = vi.fn(() => true);
	vi.stubGlobal("fetch", fetchSpy);
	navigator.sendBeacon = beaconSpy as unknown as typeof navigator.sendBeacon;
	xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});

const egressCount = () => fetchSpy.mock.calls.length + beaconSpy.mock.calls.length + xhrSendSpy.mock.calls.length;

/** A closed port on loopback: connection refused immediately, no DNS lookup. */
const DEAD_URL = "http://127.0.0.1:1/v1/otlp/logs";

/**
 * Every case drains for the SAME duration. A shorter drain on the disabled
 * side would let it pass by not waiting for the failure the enabled side
 * waits for — mutation-verified: with an uneven drain, a provider that built
 * telemetry regardless of `enabled` passed the whole suite.
 */
const DRAIN_MS = 300;

function EmitOnMount() {
	const {trackEvent, trackError} = useTetraEvents();
	useEffect(() => {
		trackEvent("App:Page:View", {rows: 42});
		trackError(new Error("boom"));
	}, [trackEvent, trackError]);
	return <span>ready</span>;
}

/** `processors` omitted on purpose: this exercises the real logsUrl pipeline. */
function LiveProvider({enabled}: {enabled: boolean}) {
	return (
		<TelemetryProvider
			artifact={ARTIFACT}
			orgSlug="acme"
			logsUrl={DEAD_URL}
			// The core defaults to 5000ms; a unit test cannot wait that long for
			// the failed export to be reported.
			flushTimeoutMillis={50}
			logger={{warn: warnSpy, error: warnSpy, info: () => {}, debug: () => {}} as never}
			enabled={enabled}
		>
			<EmitOnMount />
		</TelemetryProvider>
	);
}

async function mountAndDrain(enabled: boolean, drainMs = DRAIN_MS) {
	const tree = renderTree(<LiveProvider enabled={enabled} />);
	// Exercise every path that would push a batch out: the visibility flush
	// hook, then unmount (which shuts the provider down, flushing on the way).
	document.dispatchEvent(new Event("visibilitychange"));
	Object.defineProperty(document, "visibilityState", {value: "hidden", configurable: true});
	document.dispatchEvent(new Event("visibilitychange"));
	await act(async () => {
		tree.unmount();
		await new Promise((resolve) => setTimeout(resolve, drainMs));
	});
}

describe("enabled={false} builds no exporter and performs no network I/O", () => {
	test("disabled: no network primitive is ever touched", async () => {
		await mountAndDrain(false);
		expect(egressCount()).toBe(0);
	});

	// ── Non-vacuity controls: the identical harness, enabled. ──
	//
	// These assert the pipeline was LIVE. Without them the two tests above pass
	// for a provider that never worked at all.

	test("enabled: an export IS attempted (the pipeline is live)", async () => {
		await mountAndDrain(true);
		const messages = warnSpy.mock.calls.map(([m]) => String(m)).join(" | ");
		expect(messages).toMatch(/export|flush/i);
	});

	test("disabled: the core never reports an export attempt", async () => {
		await mountAndDrain(false);
		const messages = warnSpy.mock.calls.map(([m]) => String(m)).join(" | ");
		expect(messages).not.toMatch(/export|flush/i);
	});
});
