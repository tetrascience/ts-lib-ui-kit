import type {LogRecordProcessor, SdkLogRecord} from "@opentelemetry/sdk-logs";
import type {ReactNode} from "react";
import {act} from "react";
import {createRoot} from "react-dom/client";

/**
 * Test seam: the bindings are asserted at the processor boundary — the records
 * the stock SDK would hand to an exporter. Lifecycle counters make provider
 * construction and teardown observable (StrictMode, `enabled={false}`).
 */
export class RecordingProcessor implements LogRecordProcessor {
	readonly records: SdkLogRecord[] = [];
	flushes = 0;
	shutdowns = 0;

	onEmit(record: SdkLogRecord): void {
		this.records.push(record);
	}

	async forceFlush(): Promise<void> {
		this.flushes += 1;
	}

	async shutdown(): Promise<void> {
		this.shutdowns += 1;
	}

	/** `event.name` of every captured record, in order. */
	names(): unknown[] {
		return this.records.map((record) => record.eventName);
	}

	/** Every attribute key seen across all captured records. */
	attributeKeys(): string[] {
		return this.records.flatMap((record) => Object.keys(record.attributes));
	}
}

export const ARTIFACT = {namespace: "common", slug: "sandbox", version: "1.2.3"};

/**
 * Minimal render harness over `react-dom/client` — the repo has no React
 * testing story and these tests need only mount/rerender/unmount plus text
 * assertions, so no extra testing-library dependency is introduced.
 */
export function renderTree(ui: ReactNode) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	act(() => {
		root.render(ui);
	});
	return {
		container,
		text: () => container.textContent,
		rerender: (next: ReactNode) =>
			act(() => {
				root.render(next);
			}),
		unmount: () =>
			act(() => {
				root.unmount();
			}),
	};
}
