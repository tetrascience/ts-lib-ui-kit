/**
 * Where a binning puts its edges.
 *
 * A width or a count sets the resolution. An edge or a center aligns them. Ported from ggplot's
 * `stat_bin`.
 */

/** Which end of an interval takes a reading that lands on its edge. */
export type BinClosed = "right" | "left";

/**
 * Empty intervals a binning keeps.
 *
 * `none` keeps them all. `all` keeps the intervals with readings. `extremes` keeps the interior
 * and cuts the empty runs off both ends.
 */
export type BinDrop = "none" | "all" | "extremes";

/** A number per axis, or one number for both. ggplot's `dual_param`. */
export type PerAxis = number | readonly [number, number];

/**
 * What a one-dimensional binning was told. ggplot's `stat_bin` arguments.
 *
 * The four numeric parameters take a pair as well as a number, and a bin reads the first entry.
 */
export interface BinOptions {
	/** Width of one interval, in the data's own units. */
	binwidth?: PerAxis;
	/** Intervals across the range. Read where no width is stated. */
	bins?: PerAxis;
	/** Center of one interval, which fixes where all of them fall. */
	center?: PerAxis;
	/** Edge of one interval, which fixes where all of them fall. */
	boundary?: PerAxis;
	/** Which end of an interval is inclusive. The right end unless stated. */
	closed?: BinClosed;
	/** Adds an empty interval at each end. A filled shape closes on the axis. */
	pad?: boolean;
	/** The edges themselves, which override the width, the count and the alignment. */
	breaks?: readonly number[];
	/** Which empty intervals survive. All of them unless stated. ggplot's `drop`. */
	dropEmpty?: BinDrop;
}

/**
 * What a two-dimensional binning was told. ggplot's `stat_bin_2d` and `stat_bin_hex`.
 *
 * The lattice parameters take a number per axis. The hexagonal tiling reads width and count
 * alone. `breaks` is refused here.
 */
export interface Bin2dOptions {
	/** Width of one cell, in the data's own units. */
	binwidth?: PerAxis;
	/** Cells across each axis. Thirty unless stated. */
	bins?: PerAxis;
	center?: PerAxis;
	boundary?: PerAxis;
	closed?: BinClosed;
	/** Keeps a cell nothing landed in and draws the lattice whole. Occupied cells alone unless stated. */
	drop?: boolean;
}

/**
 * A one-dimensional binning as a caller states it.
 *
 * A bare number states the width. `auto` reads a width off the data. The object form is the whole
 * parameter set.
 */
export type BinSpec = "auto" | number | BinOptions;

/** Edges of a binning, with the copy the cut runs against. */
export interface BinEdges {
	/** The edges themselves, which the reported center and width come off. */
	breaks: number[];
	/**
	 * The same edges nudged outward at the closed end.
	 *
	 * A reading recorded as 45 lands a few ulps off an edge at 45. The nudge matches R's `hist`.
	 */
	fuzzy: number[];
	/** Whether the right end of an interval is the inclusive one. */
	rightClosed: boolean;
}

/** Intervals ggplot's default takes where nothing is stated. */
const DEFAULT_BINS = 30;

/** R's modulo. The result takes the sign of the divisor. */
const mod = (value: number, by: number): number => value - Math.floor(value / by) * by;

/** One entry of a per-axis parameter, which ggplot spells `dual_param`. */
const perAxis = (stated: PerAxis | undefined, axis: 0 | 1): number | undefined =>
	stated == null ? undefined : typeof stated === "number" ? stated : stated[axis];

/** Whether a range is one point, or near enough to it that a width off it means nothing. */
const zeroRange = ([lo, hi]: readonly [number, number]): boolean => {
	if (lo === hi) return true;
	const smallest = Math.min(Math.abs(lo), Math.abs(hi));
	if (smallest === 0) return false;
	return Math.abs((lo - hi) / smallest) < 1000 * Number.EPSILON;
};

const median = (values: number[]): number => {
	const sorted = [...values].sort((a, b) => a - b);
	if (sorted.length === 0) return NaN;
	const middle = sorted.length / 2;
	return sorted.length % 2 === 1 ? sorted[Math.floor(middle)]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

/** Sorted edges with the fuzz applied. A cut reads this shape. */
function edgesOf(stated: readonly number[], closed: BinClosed = "right"): BinEdges {
	const breaks = [...stated].sort((a, b) => a - b);
	const widths = breaks.slice(1).map((edge, at) => edge - breaks[at]!);
	const middle = median(widths.filter((width) => Number.isFinite(width)));
	const fuzz = Number.isFinite(middle) && middle !== 0 ? 1e-8 * middle : Number.EPSILON * 1000;
	const last = breaks.length - 1;

	/* The closed end moves outward and a reading on it stays inside. The other end stays put. */
	const fuzzy = breaks.map((edge, at) =>
		closed === "right" ? edge + (at === 0 ? -fuzz : fuzz) : edge + (at === last ? fuzz : -fuzz),
	);
	return {breaks, fuzzy, rightClosed: closed === "right"};
}

/** Edges a stated width puts across a range, aligned on an edge or on a center. */
function widthBreaks(
	range: readonly [number, number],
	width: number,
	center: number | undefined,
	boundary: number | undefined,
	closed: BinClosed | undefined,
): BinEdges | null {
	if (!(width > 0) || !Number.isFinite(width)) return null;

	/* Half a width. The ends of the data land in the outer half of their own intervals. */
	const edge = boundary ?? (center == null ? width / 2 : center - width / 2);
	const origin = edge + Math.floor((range[0] - edge) / width) * width;

	// A hair under a full width. A reading on the last edge adds no interval past it.
	const reach = range[1] + (1 - 1e-8) * width;
	const steps = Math.floor((reach - origin) / width + 1e-10);
	if (!Number.isFinite(steps) || steps > 1e6) return null;

	const breaks = Array.from({length: Math.max(1, steps) + 1}, (_, at) => origin + at * width);
	return edgesOf(breaks, closed);
}

/** Edges a stated count of intervals puts across a range. */
function countBreaks(
	range: readonly [number, number],
	bins: number,
	center: number | undefined,
	boundary: number | undefined,
	closed: BinClosed | undefined,
): BinEdges | null {
	if (!Number.isInteger(bins) || bins < 1) return null;

	if (zeroRange(range)) return widthBreaks(range, 0.1, center, boundary, closed);
	if (bins === 1) return widthBreaks(range, range[1] - range[0], undefined, range[0], closed);

	let width = (range[1] - range[0]) / (bins - 1);
	let edge = boundary;
	if (center == null) edge ??= range[0] - width / 2;

	/*
    An end of the data on an edge would leave the last interval empty. The width closes up to
    divide the range evenly. ggplot's own correction.
  */
	if (edge != null && range.some((end) => mod(end, width) === mod(edge, width))) {
		width = (range[1] - range[0]) / bins;
	}
	return widthBreaks(range, width, center, edge, closed);
}

/**
 * Edges for a range, given what the author stated.
 *
 * `null` where the options contradict. Stated edges win, then a width, then a count, and thirty
 * where nothing was said.
 */
export function binBreaks(range: readonly [number, number], options: BinOptions = {}): BinEdges | null {
	const {breaks, closed} = options;
	const binwidth = perAxis(options.binwidth, 0);
	const bins = perAxis(options.bins, 0);
	const center = perAxis(options.center, 0);
	const boundary = perAxis(options.boundary, 0);
	if (breaks) return breaks.length > 1 ? edgesOf(breaks, closed) : null;
	if (center != null && boundary != null) return null;
	if (binwidth != null) return widthBreaks(range, binwidth, center, boundary, closed);
	return countBreaks(range, bins ?? DEFAULT_BINS, center, boundary, closed);
}

/**
 * Which interval a reading lands in, or `-1` where it lands outside them all.
 *
 * Read against the fuzzed edges. A reading on an edge lands on the side `closed` names.
 */
export function binIndex(value: number, edges: BinEdges): number {
	const {fuzzy, rightClosed} = edges;
	const last = fuzzy.length - 1;
	if (last < 1 || value < fuzzy[0]! || value > fuzzy[last]!) return -1;

	/* Binary search. A quarter of a million readings walk this once each. */
	let low = 0;
	let high = last;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (value < fuzzy[middle]!) high = middle;
		else low = middle;
	}

	/* A reading on an interior edge goes to the interval the closed end points at. */
	if (rightClosed && value === fuzzy[low]! && low > 0) return low - 1;
	if (!rightClosed && value === fuzzy[high]! && high < last) return high;
	return Math.min(low, last - 1);
}

/** One interval of a binning, with what landed in it. */
export interface BinInterval {
	from: number;
	to: number;
	/** Middle of the interval, off the stated edges. */
	at: number;
	width: number;
	count: number;
}

/** The intervals a set of edges describes, in order, before any reading is counted into them. */
export function intervalsOf(edges: BinEdges): BinInterval[] {
	return edges.breaks.slice(1).map((to, at) => {
		const from = edges.breaks[at]!;
		return {from, to, at: (from + to) / 2, width: to - from, count: 0};
	});
}

/**
 * The same intervals with an empty one at each end. ggplot's `pad`.
 *
 * The added interval takes the width of the one beside it.
 */
export function padded(intervals: readonly BinInterval[]): BinInterval[] {
	const first = intervals[0];
	const last = intervals.at(-1);
	if (!first || !last) return [...intervals];
	return [
		{from: first.from - first.width, to: first.from, at: first.at - first.width, width: first.width, count: 0},
		...intervals,
		{from: last.to, to: last.to + last.width, at: last.at + last.width, width: last.width, count: 0},
	];
}

/** The entries one of the three drops keeps, read off what each contains. */
export function keptUnder<T>(entries: readonly T[], holds: (of: T) => boolean, drop: BinDrop): T[] {
	if (drop === "all") return entries.filter(holds);
	if (drop !== "extremes") return [...entries];

	const first = entries.findIndex(holds);
	if (first < 0) return [];
	let last = entries.length - 1;
	while (last > first && !holds(entries[last]!)) last -= 1;
	return entries.slice(first, last + 1);
}

/**
 * The options a stated binning amounts to.
 *
 * A bare number states the width. `auto` reads a width off the data, and an options object naming
 * no resolution keeps that reading.
 */
export function binOptionsOf(bin: BinSpec | undefined, autoWidth: () => number): BinOptions {
	if (bin == null || bin === "auto") return {binwidth: autoWidth()};
	if (typeof bin === "number") return {binwidth: bin};
	if (bin.binwidth != null || bin.bins != null || bin.breaks != null) return bin;
	return {...bin, binwidth: autoWidth()};
}

/**
 * Edges for one axis of a lattice.
 *
 * Zero is the edge a lattice aligns on, where a one-dimensional bin takes half a width.
 * `stat_bin_2d` does the same.
 */
export function latticeEdges(range: readonly [number, number], options: Bin2dOptions, axis: 0 | 1): BinEdges | null {
	const binwidth = perAxis(options.binwidth, axis);
	const bins = perAxis(options.bins, axis);
	const center = perAxis(options.center, axis);
	const boundary = perAxis(options.boundary, axis);
	const aligned = center == null && boundary == null ? {boundary: 0} : {center, boundary};

	return binBreaks(range, {
		...aligned,
		...(binwidth != null ? {binwidth} : {}),
		...(binwidth == null ? {bins: bins ?? DEFAULT_BINS} : {}),
		closed: options.closed,
	});
}
