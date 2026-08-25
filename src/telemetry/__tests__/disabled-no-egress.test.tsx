/**
 * `enabled={false}` must mean ZERO egress — not "records are dropped late".
 *
 * The provider tests elsewhere inject a processor and assert no record is
 * produced. That proves the emitter no-ops, but it cannot prove the OTLP
 * exporter was never constructed, because injecting `processors` bypasses
 * endpoint resolution entirely. Here `processors` is deliberately OMITTED so
 * the real `logsUrl` path runs, the exporter module is mocked to make
 * construction observable, and the network primitives are spied on.
 *
 * Both halves are asserted against an enabled control so neither is vacuous.
 */
import {act, useEffect} from "react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {TelemetryProvider, useTetraEvents} from "..";
import {ARTIFACT, renderTree} from "./helpers";

const {exporterConstructed} = vi.hoisted(() => ({exporterConstructed: vi.fn()}));

// Hoisted above the imports above, so the provider sees the mock.
vi.mock("@opentelemetry/exporter-logs-otlp-http", () => ({
	OTLPLogExporter: class {
		constructor(config: {url?: string}) {
			exporterConstructed(config);
		}
		async export(_records: unknown, resultCallback: (result: {code: number}) => void) {
			// Stand in for the real transport so a flush is observable as egress.
			await fetch("https://gateway.example/v1/otlp/logs", {method: "POST"});
			resultCallback({code: 0});
		}
		async shutdown() {
			// no transport to tear down in the stub
		}
		async forceFlush() {
			// export() above is what makes egress observable
		}
	},
}));

declare global {
	// eslint-disable-next-line no-var
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let fetchSpy: ReturnType<typeof vi.fn>;
let beaconSpy: ReturnType<typeof vi.fn>;
let xhrSendSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	exporterConstructed.mockClear();
	fetchSpy = vi.fn(async () => new Response("{}", {status: 200}));
	beaconSpy = vi.fn(() => true);
	vi.stubGlobal("fetch", fetchSpy);
	navigator.sendBeacon = beaconSpy as unknown as typeof navigator.sendBeacon;
	xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(() => undefined);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	document.body.innerHTML = "";
});

const egressCount = () => fetchSpy.mock.calls.length + beaconSpy.mock.calls.length + xhrSendSpy.mock.calls.length;

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
			logsUrl="https://gateway.example/v1/otlp/logs"
			enabled={enabled}
		>
			<EmitOnMount />
		</TelemetryProvider>
	);
}

async function mountAndDrain(enabled: boolean) {
	const tree = renderTree(<LiveProvider enabled={enabled} />);
	// Exercise every path that would push a batch out: the visibility flush
	// hook, then unmount (which shuts the provider down, flushing on the way).
	document.dispatchEvent(new Event("visibilitychange"));
	Object.defineProperty(document, "visibilityState", {value: "hidden", configurable: true});
	document.dispatchEvent(new Event("visibilitychange"));
	await act(async () => {
		tree.unmount();
		await new Promise((resolve) => setTimeout(resolve, 10));
	});
}

describe("enabled={false} builds no exporter and performs no network I/O", () => {
	test("disabled: the OTLP exporter is never constructed", async () => {
		await mountAndDrain(false);
		expect(exporterConstructed).not.toHaveBeenCalled();
	});

	test("disabled: no network primitive is ever touched", async () => {
		await mountAndDrain(false);
		expect(egressCount()).toBe(0);
	});

	// ── Non-vacuity controls: the identical harness, enabled. ──

	test("enabled: the OTLP exporter IS constructed, against the configured URL", async () => {
		await mountAndDrain(true);
		expect(exporterConstructed).toHaveBeenCalledWith(
			expect.objectContaining({url: "https://gateway.example/v1/otlp/logs"}),
		);
	});

	test("enabled: the pipeline DOES reach the network", async () => {
		await mountAndDrain(true);
		expect(egressCount()).toBeGreaterThan(0);
	});
});
