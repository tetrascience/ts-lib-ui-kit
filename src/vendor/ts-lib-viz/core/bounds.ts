/**
 * What a position scale can place.
 *
 * A transform refuses a reading outside its reach: at or below zero on a log axis. A stated range
 * censors a reading past it.
 */

import type {Trace} from "./layers.js";
import {isLog, TRANSFORMS, type AxisTransform} from "./transform.js";

/** What a reading past a stated range becomes. ggplot's `oob`. */
export type OutOfBounds = "censor" | "squish" | "keep";

/** One axis's rules for the positions read against it. */
export interface Bounds {
	transform: AxisTransform;
	/** The range the author stated. Absent places each reading the transform allows. */
	range?: readonly [number, number];
	oob: OutOfBounds;
}

/** The traces as placed, with a count per reason a reading dropped. */
export interface Placed {
	traces: Trace[];
	/** Readings a log axis had no place for. */
	offLog: number;
	/** Readings below zero on a square-root axis. */
	offRoot: number;
	/** Readings a censoring range dropped. */
	offRange: number;
}

type Verdict = "in" | "log" | "root" | "range";

/** Which verdict a reading the transform refuses takes. */
const refusal = (bounds: Bounds): Verdict => (isLog(bounds.transform) ? "log" : "root");

/** Where one position falls against one axis. A null axis or a category places everything. */
function verdict(value: number | string | undefined, bounds: Bounds | null): Verdict {
	if (bounds == null || typeof value !== "number") return "in";
	if (!TRANSFORMS[bounds.transform].admits(value)) return refusal(bounds);
	const range = bounds.range;
	if (
		range &&
		bounds.oob === "censor" &&
		(value < Math.min(range[0], range[1]) || value > Math.max(range[0], range[1]))
	)
		return "range";
	return "in";
}

/** The first reason a reading drops, over each position it names. The transform's answer leads. */
function worst(...verdicts: Verdict[]): Verdict {
	if (verdicts.includes("log")) return "log";
	if (verdicts.includes("root")) return "root";
	if (verdicts.includes("range")) return "range";
	return "in";
}

/**
 * The traces with each reading the axes cannot place taken out.
 *
 * Positions are checked. An interval's bounds and a bar's length are extents, and the plot area
 * clips those.
 */
export function placeTraces(traces: Trace[], x: Bounds | null, y: Bounds | null, y2: Bounds | null): Placed {
	let offLog = 0;
	let offRoot = 0;
	let offRange = 0;
	const kept = (at: Verdict): boolean => {
		if (at === "log") offLog += 1;
		if (at === "root") offRoot += 1;
		if (at === "range") offRange += 1;
		return at === "in";
	};

	const placed = traces.map((trace): Trace => {
		const data = trace.data;
		if (data.at !== "records") return trace;
		const vertical = trace.axis === "y2" ? y2 : y;

		if (data.geom === "segment") {
			const segments = data.segments.filter((one) =>
				kept(worst(verdict(one.x, x), verdict(one.xEnd, x), verdict(one.y, vertical), verdict(one.yEnd, vertical))),
			);
			return segments.length === data.segments.length ? trace : {...trace, data: {...data, segments}};
		}

		/* An interval wholly outside the transform's reach has nothing to draw. One reaching out of it runs to the floor. */
		if (data.geom === "ribbon" || data.geom === "range") {
			const readings = data.readings.filter((one) =>
				kept(
					worst(
						verdict(one.x, x),
						one.mid == null ? "in" : verdict(one.mid, vertical),
						vertical && !TRANSFORMS[vertical.transform].admits(one.hi) ? refusal(vertical) : "in",
					),
				),
			);
			return readings.length === data.readings.length ? trace : {...trace, data: {...data, readings}};
		}

		if (data.geom === "point3d" || !("points" in data)) return trace;
		/* A line breaks where a reading dropped. ggplot breaks a path at a censored value too. */
		let dropped = false;
		const points = data.points.flatMap((one) => {
			if (!kept(worst(verdict(one.x, x), verdict(one.y, vertical)))) {
				dropped = true;
				return [];
			}
			const breaks = dropped && data.geom === "line";
			dropped = false;
			return [breaks ? {...one, gap: true} : one];
		});
		return points.length === data.points.length ? trace : {...trace, data: {...data, points}};
	});

	return {traces: placed, offLog, offRoot, offRange};
}

/**
 * Intervals and whiskers reaching past where the transform places, at or below zero on a log axis.
 *
 * Each draws to the axis floor. The footer counts them.
 */
export function flooredCount(traces: Trace[], transform: AxisTransform): number {
	const {admits} = TRANSFORMS[transform];
	let count = 0;
	for (const trace of traces) {
		if (trace.axis === "y2") continue;
		const data = trace.data;
		if (data.at === "records" && (data.geom === "ribbon" || data.geom === "range")) {
			for (const one of data.readings) if (!admits(one.lo)) count += 1;
		} else if (data.at === "groups" && "bars" in data) {
			for (const bar of data.bars) if (bar.error != null && !admits(bar.value - bar.error)) count += 1;
		}
	}
	return count;
}
