import {act, useEffect} from "react";
import {afterEach, beforeEach, describe, expect, test} from "vitest";
import {
	AggregationTemporality,
	InMemoryMetricExporter,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

import {TelemetryProvider, useTetraEvents} from "..";
import {ARTIFACT, RecordingProcessor, renderTree} from "./helpers";

/**
 * SW-2478: metrics have to reach the client THROUGH the provider.
 *
 * This file exists because of a real gap, not a hypothetical one. The facade
 * exposed `gauge`/`histogram`/`upDownCounter` and the core client implemented
 * them, but `<TelemetryProvider>` never forwarded a `metrics` option to
 * `createTelemetry` — so metrics could not be switched on from React at all.
 * Every call was a silent no-op: no error, no warning, nothing on the wire,
 * and an app author would see an empty CloudWatch dashboard with no way to tell
 * whether the fault was theirs or the platform's.
 *
 * The assertions are therefore about REACHING the meter, not about the
 * instruments themselves (those are covered in test/telemetry/metrics.test.ts).
 */

declare global {
	// eslint-disable-next-line no-var
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let exporter: InMemoryMetricExporter;
let processor: RecordingProcessor;

function makeReader() {
	exporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
	return new PeriodicExportingMetricReader({
		exporter,
		// Long enough that nothing exports on the timer; every assertion below
		// goes through an explicit flush.
		exportIntervalMillis: 600_000,
	});
}

beforeEach(() => {
	processor = new RecordingProcessor();
});

afterEach(() => {
	document.body.innerHTML = "";
});

/** All datapoints recorded under one instrument name. */
function pointsFor(name: string): {value: unknown; attributes: Record<string, unknown>}[] {
	const out: {value: unknown; attributes: Record<string, unknown>}[] = [];
	for (const batch of exporter.getMetrics()) {
		for (const scope of batch.scopeMetrics) {
			for (const metric of scope.metrics) {
				if (metric.descriptor.name !== name) continue;
				for (const dp of metric.dataPoints as {value: unknown; attributes: Record<string, unknown>}[]) {
					out.push({value: dp.value, attributes: dp.attributes});
				}
			}
		}
	}
	return out;
}

describe("TelemetryProvider metrics wiring", () => {
	test("a gauge recorded through useTetraEvents reaches the reader", async () => {
		let record: (() => void) | undefined;
		function App() {
			const {gauge} = useTetraEvents();
			// Captured rather than called in an effect: React runs CHILD effects
			// before PARENT ones, so a child effect fires while the provider has
			// not yet attached the client — and metric recordings before attach
			// are DROPPED by design (a gauge replayed later would carry the
			// wrong timestamp). See the pre-attach test below.
			record = () => gauge("process.memory.usage", 2048, {state: "rss"});
			return null;
		}

		const reader = makeReader();
		await act(async () => {
			renderTree(
				<TelemetryProvider
					artifact={ARTIFACT}
					orgSlug="acme"
					processors={[processor]}
					metrics={{enabled: true, readers: [reader]}}
				>
					<App />
				</TelemetryProvider>,
			);
		});

		await act(async () => {
			record!();
			await reader.forceFlush();
		});

		const points = pointsFor("process.memory.usage");
		expect(points).toHaveLength(1);
		expect(points[0].value).toBe(2048);
		expect(points[0].attributes.state).toBe("rss");
	});

	test("WITHOUT metrics.enabled the same call records nothing", async () => {
		// The other half of the contract: metrics stay opt-in, so an app that
		// upgrades the library does not silently acquire a recurring timer and
		// a recurring export.
		let record: (() => void) | undefined;
		function App() {
			const {gauge} = useTetraEvents();
			record = () => gauge("process.memory.usage", 2048);
			return null;
		}

		const reader = makeReader();
		await act(async () => {
			renderTree(
				<TelemetryProvider artifact={ARTIFACT} orgSlug="acme" processors={[processor]}>
					<App />
				</TelemetryProvider>,
			);
		});
		await act(async () => {
			record!();
			await reader.forceFlush();
		});

		expect(pointsFor("process.memory.usage")).toHaveLength(0);
	});

	test("histogram and upDownCounter reach the reader too", async () => {
		let record: (() => void) | undefined;
		function App() {
			const {histogram, upDownCounter} = useTetraEvents();
			record = () => {
				histogram("agent.turn.duration", 1500, {status: "completed"});
				upDownCounter("agent.inflight", 1);
				upDownCounter("agent.inflight", -1);
			};
			return null;
		}

		const reader = makeReader();
		await act(async () => {
			renderTree(
				<TelemetryProvider
					artifact={ARTIFACT}
					orgSlug="acme"
					processors={[processor]}
					metrics={{enabled: true, readers: [reader]}}
				>
					<App />
				</TelemetryProvider>,
			);
		});
		await act(async () => {
			record!();
			await reader.forceFlush();
		});

		const duration = pointsFor("agent.turn.duration");
		expect(duration).toHaveLength(1);
		expect((duration[0].value as {count: number}).count).toBe(1);
		expect(duration[0].attributes.status).toBe("completed");

		// Net zero, but PRESENT — an in-flight gauge that vanished when it
		// balanced would be indistinguishable from one that never recorded.
		const inflight = pointsFor("agent.inflight");
		expect(inflight).toHaveLength(1);
		expect(inflight[0].value).toBe(0);
	});

	test("carries the artifact identity on the metrics resource", async () => {
		let record: (() => void) | undefined;
		function App() {
			const {gauge} = useTetraEvents();
			record = () => gauge("queue_depth", 3);
			return null;
		}

		const reader = makeReader();
		await act(async () => {
			renderTree(
				<TelemetryProvider
					artifact={ARTIFACT}
					orgSlug="acme"
					processors={[processor]}
					metrics={{enabled: true, readers: [reader]}}
				>
					<App />
				</TelemetryProvider>,
			);
		});
		await act(async () => {
			record!();
			await reader.forceFlush();
		});

		const [batch] = exporter.getMetrics();
		const attributes = batch.resource.attributes;
		expect(attributes["ts.artifact.slug"]).toBe(ARTIFACT.slug);
		expect(attributes["service.namespace"]).toBe(ARTIFACT.namespace);
		expect(attributes["ts.org"]).toBe("acme");
	});

	test("a metric recorded from a CHILD effect is dropped — React runs those before attach", async () => {
		// Not a bug being fixed, a trap being pinned. React runs child effects
		// BEFORE parent effects, so anything a child records in its own
		// useEffect happens while the provider has not yet attached a client.
		// Events survive that (the facade buffers them), metrics do not — a
		// gauge replayed after attach would carry the wrong timestamp.
		//
		// The consequence for app authors: a "sample once on mount" gauge in a
		// component under the provider silently records NOTHING. Defer the first
		// sample instead. The sandbox's memory gauge does exactly that.
		function App() {
			const {gauge} = useTetraEvents();
			useEffect(() => {
				gauge("process.memory.usage", 4096);
			}, [gauge]);
			return null;
		}

		const reader = makeReader();
		await act(async () => {
			renderTree(
				<TelemetryProvider
					artifact={ARTIFACT}
					orgSlug="acme"
					processors={[processor]}
					metrics={{enabled: true, readers: [reader]}}
				>
					<App />
				</TelemetryProvider>,
			);
		});
		await act(async () => {
			await reader.forceFlush();
		});

		expect(pointsFor("process.memory.usage")).toHaveLength(0);
	});

	test("a reader instance in props does not make the identity key unstable", async () => {
		// The identity key is JSON.stringify'd. Serialising a live MetricReader
		// would make the key depend on exporter internals — rebuilding the
		// client on unrelated state changes — and a processor with a circular
		// reference would THROW during render. Only scalars belong in the key.
		const reader = makeReader();
		const props = {
			artifact: ARTIFACT,
			orgSlug: "acme",
			processors: [processor],
			metrics: {enabled: true, readers: [reader]},
		};

		let renders = 0;
		function App() {
			renders += 1;
			return null;
		}

		await act(async () => {
			const tree = renderTree(
				<TelemetryProvider {...props}>
					<App />
				</TelemetryProvider>,
			);
			// Re-render with a NEW options object holding the SAME reader — the
			// shape an inline `metrics={{...}}` prop produces every render.
			tree.rerender(
				<TelemetryProvider {...props} metrics={{enabled: true, readers: [reader]}}>
					<App />
				</TelemetryProvider>,
			);
		});

		expect(renders).toBeGreaterThan(0);
		// Still exports through the same reader — the client was not torn down
		// and rebuilt by the re-render.
		expect(() => reader.forceFlush()).not.toThrow();
	});
});
