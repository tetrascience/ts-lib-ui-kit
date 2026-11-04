/**
 * The seam a fitted curve arrives through.
 *
 * `FitSpec` says what to fit and `Fit` says what came back. The consumer supplies the function
 * between them.
 */

import type {LayerFits} from "./fit-types.js";
import {pointsOf} from "./frame.js";
import type {Trace} from "./layers.js";
import type {FitSpec, LayerSpec, SmoothSpec} from "./spec.js";

/** Points one curve is fitted through. */
export interface FitGroup {
	/**
	 * Value of the split field these points share. Empty where the series draws as one trace.
	 *
	 * The id the returned `Fit` takes. `fitsFor` reads it.
	 */
	id: string;
	/** Facet value the points came from. Absent where the plot draws one panel. */
	panel?: string;
	points: {x: number; y: number}[];
}

/** One series' fit as the author asked for it, with the points underneath. */
export interface FitRequest {
	layerId: string;
	/** What to compute. A `SmoothSpec` names a method, a `FitSpec` names a parametric model. */
	spec: FitSpec | SmoothSpec;
	groups: FitGroup[];
}

/**
 * What fills a `FitState`.
 *
 * Async, and the answer comes over a wire while the chart is already drawn. Keyed by series id
 * coming back.
 */
export type Fitter = (requests: FitRequest[]) => Promise<Map<string, LayerFits>>;

/**
 * What to fit, off the traces the frame built.
 *
 * The split cap decides how many curves reach the frame. A series with no `fit` or no records
 * asks for nothing.
 */
export function fitRequests(traces: Trace[], series: readonly LayerSpec[], panel?: string): FitRequest[] {
	const asked = new Map<string, FitSpec | SmoothSpec>();
	/*
    A smooth kind reads `smooth` and anything else reads `fit`. A field set on a kind that ignores
    it asks for nothing.
  */
	for (const entry of series) {
		const spec = entry.kind === "smooth" ? entry.smooth : entry.fit;
		if (spec) asked.set(entry.id, spec);
	}

	const groups = new Map<string, FitGroup[]>();
	for (const trace of traces) {
		if (!asked.has(trace.layerId)) continue;

		/* A non-finite coordinate is a row missing a measure. One rule covers each fitter. */
		const points = pointsOf(trace)
			.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
			.map((point) => ({x: point.x, y: point.y}));
		if (points.length === 0) continue;

		const found = groups.get(trace.layerId) ?? [];
		found.push({id: trace.splitValue ?? "", ...(panel === undefined ? {} : {panel}), points});
		groups.set(trace.layerId, found);
	}

	return [...groups].map(([layerId, found]) => ({layerId, spec: asked.get(layerId)!, groups: found}));
}

/**
 * What to fit across a faceted figure.
 *
 * A facet builds a frame per panel and the same series appears in each. The panel is part of the
 * key.
 */
export function fitRequestsOver(
	panels: {value: string; traces: Trace[]}[],
	series: readonly LayerSpec[],
): FitRequest[] {
	const merged = new Map<string, FitRequest>();
	for (const panel of panels) {
		for (const request of fitRequests(panel.traces, series, panel.value)) {
			const found = merged.get(request.layerId);
			if (found) found.groups.push(...request.groups);
			else merged.set(request.layerId, request);
		}
	}
	return [...merged.values()];
}

/**
 * Order-sensitive hash of a group's coordinates, as an unsigned 32-bit integer.
 *
 * FNV-1a over the bit patterns of the doubles, order included.
 */
function hash(points: {x: number; y: number}[]): number {
	const view = new DataView(new ArrayBuffer(8));
	let out = 0x811c9dc5;

	for (const point of points) {
		for (const value of [point.x, point.y]) {
			view.setFloat64(0, value);
			for (let byte = 0; byte < 8; byte += 1) {
				out ^= view.getUint8(byte);
				out = Math.imul(out, 0x01000193);
			}
		}
	}
	return out >>> 0;
}

/**
 * What would change the curves, in one string.
 *
 * Covers the model, the interval, the grouping and the coordinates. The coordinates go through a
 * rolling hash.
 */
export function fitSignature(requests: FitRequest[]): string {
	return requests
		.map((request) => {
			/*
        The spec's own fields, sorted by name. Taken whole -- a smoother's arguments move the curve
        the way its method does.
      */
			const spec = Object.entries(request.spec)
				.filter(([, value]) => value !== undefined)
				.sort(([left], [right]) => (left < right ? -1 : 1))
				.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
				.join(",");
			const head = [request.layerId, spec].join("|");
			const groups = request.groups.map(
				(group) => `${group.panel ?? ""}/${group.id}:${group.points.length}:${hash(group.points)}`,
			);
			return [head, ...groups].join("|");
		})
		.join(";");
}
