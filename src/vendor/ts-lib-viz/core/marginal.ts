/**
 * The distribution along one of a plot's own axes.
 *
 * A marginal reads the points the geoms drew. `autoBinWidth` is Freedman-Diaconis and `BIN_CAP`
 * widens it.
 */

import {boundsOf} from "./aggregate.js";
import {autoBinWidth, BIN_CAP, type Trace} from "./layers.js";
import {kde} from "./stats.js";
import {TRANSFORMS, type AxisTransform} from "./transform.js";

/** One interval, in the measure's own units. */
export interface MarginalBin {
	from: number;
	to: number;
	/** The interval's middle. A bar draws there against the shared scale. */
	at: number;
	count: number;
}

/** One density curve a marginal draws, named and colored like the geoms that made it. */
export interface MarginalCurve {
	/** The level this curve came from, or empty where the readings were pooled. */
	label: string;
	color: string;
	/** Evaluation points in the measure's units, and the density at each, peak scaled to one. */
	grid: number[];
	weight: number[];
}

/** What a side panel reads off the geoms along the axis it shares with them. */
export interface Marginal {
	axis: "x" | "y";
	kind: "histogram" | "rug" | "density";
	/**
	 * The readings, in the measure's own units.
	 *
	 * A rug draws one tick per reading and a histogram counts them. Shared by reference between
	 * two panels on one axis.
	 */
	values: number[];
	/** Intervals a histogram cut. Absent on a rug. */
	bins?: MarginalBin[];
	/** The tallest count. The panel scales its own extent against it. */
	most?: number;
	/** Curves a density drew, one per level where it stratified. Absent on the other two. */
	curves?: MarginalCurve[];
}

/**
 * The readings along one axis, split by the color channel's level.
 *
 * A point takes its category's index as its weight and `colorLevels` names each group. Traces
 * with no identity pool.
 */
export function valuesByLevel(traces: Trace[], axis: "x" | "y"): MarginalCurve[] {
	const pooled: {label: string; color: string; values: number[]}[] = [];
	const byLevel = new Map<string, {label: string; color: string; values: number[]}>();

	for (const trace of traces) {
		if (trace.data.at !== "records" || trace.data.geom !== "point") continue;
		const levels = trace.colorLevels;

		for (const point of trace.data.points) {
			const value = point[axis];
			if (!Number.isFinite(value)) continue;

			const code = levels && point.weight != null ? Math.round(point.weight) : null;
			const level = code == null ? null : levels?.find((held) => held.code === code);
			if (!level) {
				const held = (pooled[0] ??= {label: "", color: trace.color, values: []});
				held.values.push(value);
				continue;
			}
			const held = byLevel.get(level.value) ?? {label: level.value, color: trace.ramp(level.code), values: []};
			held.values.push(value);
			byLevel.set(level.value, held);
		}
	}

	/* The unmatched readings stay. The panel's rug and its curves describe one set of rows. */
	const groups = byLevel.size > 0 ? [...byLevel.values(), ...pooled] : pooled;
	const out: MarginalCurve[] = [];

	/*
	  The kernel's own defaults, which a violin overrides. The grid reaches three bandwidths past
	  the data and the curve comes down to nothing at each end.
	*/
	for (const group of groups) {
		const density = kde(group.values);
		if (density) out.push({label: group.label, color: group.color, grid: density.grid, weight: density.weight});
	}

	/* One divisor over all of them. The tallest fills the panel and the rest keep proportion. */
	let peak = 0;
	for (const curve of out) for (const value of curve.weight) if (value > peak) peak = value;
	if (peak <= 0) return [];

	return out.map((curve) => ({...curve, weight: curve.weight.map((value) => value / peak)}));
}

/**
 * The records' readings along one axis, as the geoms drew them.
 *
 * Point traces alone. A trace reduced to cells or bins has no records left to read.
 */
export function valuesAlong(traces: Trace[], axis: "x" | "y"): number[] {
	const out: number[] = [];
	for (const trace of traces) {
		if (trace.data.at !== "records" || trace.data.geom !== "point") continue;
		for (const point of trace.data.points) {
			const value = point[axis];
			if (Number.isFinite(value)) out.push(value);
		}
	}
	return out;
}

/**
 * The readings cut into intervals, at the width a histogram series would use.
 *
 * A transformed axis is cut in its own space. Even intervals over four decades fill one bin.
 */
export function marginalBins(
	values: number[],
	bin: "auto" | number = "auto",
	transform: AxisTransform = "identity",
): {bins: MarginalBin[]; most: number} {
	const {forward: cut, back, admits} = TRANSFORMS[transform];
	const usable = values.filter(admits).map(cut);
	if (usable.length === 0) return {bins: [], most: 0};

	const asked = bin === "auto" ? autoBinWidth(usable) : bin;
	if (!(asked > 0) || !Number.isFinite(asked)) return {bins: [], most: 0};

	const [lo] = boundsOf(usable);
	const counted = (step: number) => {
		const running = new Map<number, number>();
		for (const value of usable) {
			const index = Math.floor((value - lo) / step);
			running.set(index, (running.get(index) ?? 0) + 1);
		}
		return running;
	};

	let width = asked;
	let running = counted(width);
	/* An automatic width that would draw hundreds of bars is widened until it draws dozens. */
	if (bin === "auto" && running.size > BIN_CAP) {
		width = (asked * running.size) / BIN_CAP;
		running = counted(width);
	}

	const bins = [...running]
		.sort((a, b) => a[0] - b[0])
		.map(([index, count]) => {
			const from = lo + index * width;
			return {from: back(from), to: back(from + width), at: back(from + width / 2), count};
		});

	return {bins, most: bins.reduce((high, held) => Math.max(high, held.count), 0)};
}
