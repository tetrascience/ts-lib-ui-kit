/**
 * The distribution summaries the geoms draw.
 *
 * Each rule and kernel matches R's own. A reader takes a bandwidth off the figure and quotes it.
 */

/**
 * Which of R's nine quantile definitions a summary takes.
 *
 * Types 1 to 3 step between order statistics and types 4 to 9 interpolate. Type 7 is R's default.
 */
export type QuantileType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** R's own tolerance for calling an interpolation weight zero or one. */
const FUZZ = 4 * Number.EPSILON;

/**
 * The pair each continuous type is defined by, low then high.
 *
 * Type 4's two halves differ, and a single number per type would misplace it.
 */
const CONTINUOUS: Record<number, [number, number]> = {
	4: [0, 1],
	5: [0.5, 0.5],
	6: [0, 0],
	7: [1, 1],
	8: [1 / 3, 1 / 3],
	9: [3 / 8, 3 / 8],
};

/** R's modulo, which answers a positive remainder where the numerator is negative. */
const odd = (value: number) => ((value % 2) + 2) % 2 === 1;

/**
 * One quantile off a sorted list, at one of R's nine definitions.
 *
 * The order statistic is clamped at both ends, the way R pads.
 */
function quantileSorted(sorted: number[], p: number, type: QuantileType): number {
	const n = sorted.length;
	/* 1-based and clamped. An index either side of the sample answers the extreme reading. */
	const at = (index: number) => sorted[Math.min(n - 1, Math.max(0, index - 1))]!;

	let position: number;
	let weight: number;
	if (type <= 3) {
		const exact = type === 3 ? n * p - 0.5 : n * p;
		const below = Math.floor(exact + FUZZ);
		const above = exact > below;
		weight = type === 1 ? Number(above) : type === 2 ? (Number(above) + 1) / 2 : Number(exact !== below || odd(below));
		position = below;
	} else {
		const [a, b] = CONTINUOUS[type]!;
		const nppm = a + p * (n + 1 - a - b);
		position = Math.floor(nppm + FUZZ);
		weight = nppm - position;
		if (Math.abs(weight) < FUZZ) weight = 0;
	}

	const lower = at(position);
	const upper = at(position + 1);
	if (weight === 0) return lower;
	if (weight === 1) return upper;
	return lower === upper ? lower : (1 - weight) * lower + weight * upper;
}

/**
 * One quantile of a list of readings, at one of R's nine definitions.
 *
 * Sorts a copy and the caller's array keeps its order. Answers null where nothing finite arrived.
 */
export function quantileOf(values: number[], p: number, type: QuantileType = 7): number | null {
	const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
	return sorted.length === 0 ? null : quantileSorted(sorted, p, type);
}

/** Sample standard deviation, on the denominator R's `sd` uses. */
function deviation(values: number[]): number {
	const n = values.length;
	if (n < 2) return 0;
	let sum = 0;
	for (const value of values) sum += value;
	const mean = sum / n;
	let squares = 0;
	for (const value of values) squares += (value - mean) ** 2;
	return Math.sqrt(squares / (n - 1));
}

/** The readings a bandwidth rule runs over. Non-finite entries drop, as `quantileOf` drops them. */
const finiteOf = (values: number[]): number[] => values.filter(Number.isFinite);

/**
 * How the bandwidth is chosen -- a width in the data's units, or a rule.
 *
 * A number states the smoothing outright. The two named rules are R's closed formulas.
 */
export type BandwidthRule = "nrd0" | "nrd";

export type Bandwidth = number | BandwidthRule;

/**
 * Silverman's rule, R's `bw.nrd0`. The default bandwidth.
 *
 * Nine tenths of the narrower of the deviation and the interquartile range over 1.34, times the
 * fifth root of the count.
 */
export function bwNrd0(values: number[]): number {
	const finite = finiteOf(values);
	const sd = deviation(finite);
	const iqr = (quantileOf(finite, 0.75) ?? 0) - (quantileOf(finite, 0.25) ?? 0);
	let spread = Math.min(sd, iqr / 1.34);
	if (spread === 0) spread = sd || Math.abs(finite[0] ?? 0) || 1;
	return 0.9 * spread * finite.length ** -0.2;
}

/**
 * Scott's rule, R's `bw.nrd`.
 *
 * The same narrower-of-two spread as Silverman's at a coefficient of 1.06, and it smooths about
 * eighteen percent wider.
 */
export function bwNrd(values: number[]): number {
	const finite = finiteOf(values);
	const iqr = (quantileOf(finite, 0.75) ?? 0) - (quantileOf(finite, 0.25) ?? 0);
	return 1.06 * Math.min(deviation(finite), iqr / 1.34) * finite.length ** -0.2;
}

/**
 * The bandwidth a rule or a stated width resolves to, before `adjust` multiplies it.
 *
 * A number passes through as it stands, in the data's own units.
 */
export function bandwidthOf(values: number[], bw: Bandwidth = "nrd0"): number {
	if (typeof bw === "number") return bw;
	return bw === "nrd" ? bwNrd(values) : bwNrd0(values);
}

/**
 * Bandwidth for one axis of a two-dimensional kernel density.
 *
 * Scott's rule at an interquartile divisor of 1.34 and four times the width, which is R's own
 * two-dimensional estimate.
 */
export function bandwidth2d(values: number[]): number {
	const finite = finiteOf(values);
	const iqr = (quantileOf(finite, 0.75) ?? 0) - (quantileOf(finite, 0.25) ?? 0);
	return 4 * 1.06 * Math.min(deviation(finite), iqr / 1.34) * finite.length ** -0.2;
}

/**
 * Which kernel the density sums.
 *
 * R's seven. Each is scaled to a standard deviation of one bandwidth. The six with bounded
 * support stop at a fixed multiple of it.
 */
export type Kernel = "gaussian" | "epanechnikov" | "rectangular" | "triangular" | "biweight" | "cosine" | "optcosine";

/** Support half-width per bandwidth, at a standard deviation of one bandwidth each. */
const SUPPORT: Record<Kernel, number> = {
	gaussian: 1,
	rectangular: Math.sqrt(3),
	triangular: Math.sqrt(6),
	epanechnikov: Math.sqrt(5),
	biweight: Math.sqrt(7),
	cosine: 1 / Math.sqrt(1 / 3 - 2 / Math.PI ** 2),
	optcosine: 1 / Math.sqrt(1 - 8 / Math.PI ** 2),
};

/**
 * One kernel's weight at a distance, given the scaled support.
 *
 * `reach` is the bandwidth times the kernel's own factor. The caller scales once per curve.
 */
function weigh(kernel: Kernel, distance: number, bandwidth: number, reach: number): number {
	if (kernel === "gaussian") {
		const z = distance / bandwidth;
		return Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
	}
	const away = Math.abs(distance);
	if (away >= reach) return 0;
	const unit = away / reach;
	switch (kernel) {
		case "rectangular":
			return 0.5 / reach;
		case "triangular":
			return (1 - unit) / reach;
		case "epanechnikov":
			return (0.75 * (1 - unit * unit)) / reach;
		case "biweight":
			return ((15 / 16) * (1 - unit * unit) ** 2) / reach;
		case "cosine":
			return (1 + Math.cos((Math.PI * distance) / reach)) / (2 * reach);
		default:
			return ((Math.PI / 4) * Math.cos((Math.PI * distance) / (2 * reach))) / reach;
	}
}

/** Five-number summary plus outliers. */
export interface BoxStats {
	q1: number;
	median: number;
	/** Arithmetic mean over every reading, outliers included. */
	mean: number;
	q3: number;
	/** Whisker ends: the extreme values inside the fence `coef` set. */
	lo: number;
	hi: number;
	outliers: number[];
	n: number;
}

/**
 * What a box's summary reads, which is R's `stat_boxplot`.
 *
 * A `coef` of zero collapses the whiskers onto the quartiles and calls each reading outside the
 * middle half an outlier.
 */
export interface BoxOptions {
	/**
	 * How far a whisker reaches past the quartiles, in interquartile ranges. Default 1.5.
	 *
	 * Anything past the fence draws as an outlier. The figure states a value other than 1.5.
	 */
	coef?: number;
	/** Which of R's nine quantile definitions the quartiles take. Default 7, which is R's own. */
	quantileType?: QuantileType;
}

/**
 * The five numbers and the outliers, at the fence and quantile definition asked for.
 *
 * Answers null under three readings. A whisker reaches the last reading inside the fence.
 */
export function boxStats(values: number[], options: BoxOptions = {}): BoxStats | null {
	const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
	if (sorted.length < 3) return null;

	const type = options.quantileType ?? 7;
	const q1 = quantileSorted(sorted, 0.25, type);
	const q3 = quantileSorted(sorted, 0.75, type);
	const iqr = q3 - q1;
	const coef = options.coef ?? 1.5;
	const fenceLo = q1 - coef * iqr;
	const fenceHi = q3 + coef * iqr;

	const inside = sorted.filter((value) => value >= fenceLo && value <= fenceHi);

	return {
		q1,
		median: quantileSorted(sorted, 0.5, type),
		mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
		q3,
		lo: Math.min(q1, inside[0] ?? q1),
		hi: Math.max(q3, inside[inside.length - 1] ?? q3),
		outliers: sorted.filter((value) => value < fenceLo || value > fenceHi),
		n: sorted.length,
	};
}

/** Points the density is evaluated at where the caller states none. R's own default. */
const KDE_POINTS = 512;

/**
 * Bandwidths of grid past each end of the data, where the estimate is not trimmed.
 *
 * R's `density` reaches three and the curve tapers to nothing at both ends.
 */
const TAIL_BANDWIDTHS = 3;

/**
 * Bins the readings are collapsed into before the kernel runs.
 *
 * Below the bin count the pass costs more than it saves. The error is a part in ten thousand.
 */
const KDE_BINS = 512;

export interface Density {
	/** Values the density was evaluated at, low to high. */
	grid: number[];
	/** Density at each grid point, on whichever normalization was asked for. */
	weight: number[];
	/** The bandwidth the curve was smoothed at, after `adjust`, in the data's own units. */
	bandwidth: number;
}

/**
 * What a kernel density estimate reads, which is R's `stat_density`.
 *
 * Each field changes the curve and none is visible in it. A figure should state the bandwidth.
 */
export interface KdeOptions {
	/** Bandwidth, or the rule that reads one off the data. Default Silverman's. */
	bw?: Bandwidth;
	/**
	 * Multiplier on whatever `bw` resolved to. Default 1.
	 *
	 * `0.5` halves the rule's answer and `2` doubles it. The reach past the data follows it.
	 */
	adjust?: number;
	/** Which kernel is summed. Default gaussian. */
	kernel?: Kernel;
	/** Points the curve is evaluated at, evenly spaced. Default 512, which is R's. */
	n?: number;
	/**
	 * Stops the curve at the smallest and largest reading. Default false.
	 *
	 * Untrimmed, the grid reaches three bandwidths past each end. A violin wants it trimmed.
	 */
	trim?: boolean;
	/**
	 * Range the measure can occupy. Default unbounded.
	 *
	 * A finite bound clips the grid there and folds the mass that fell outside back in. The area
	 * under the curve stays one.
	 */
	bounds?: readonly [number, number];
	/**
	 * What the weights are scaled against. Default `density`.
	 *
	 * `density` integrates to one and two groups stay comparable. `peak` divides each estimate by
	 * its own maximum.
	 */
	normalize?: "peak" | "density";
}

/**
 * Kernel density estimate, the shape a violin and a density curve both draw.
 *
 * Above `KDE_BINS` readings the values are binned before the kernel. Answers null under three
 * readings.
 */
export function kde(values: number[], options: KdeOptions = {}): Density | null {
	const finite = values.filter(Number.isFinite);
	if (finite.length < 3) return null;

	let lo = Infinity;
	let hi = -Infinity;
	for (const value of finite) {
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	const span = hi - lo;
	if (!(span > 0)) return null;

	const bandwidth = bandwidthOf(finite, options.bw ?? "nrd0") * (options.adjust ?? 1);
	if (!(bandwidth > 0) || !Number.isFinite(bandwidth)) return null;

	const kernel = options.kernel ?? "gaussian";
	const reach = bandwidth * SUPPORT[kernel];
	const points = Math.max(2, Math.floor(options.n ?? KDE_POINTS));

	/*
    The readings the sum runs over, as a value and a count each.

    One entry per reading below the bin count and one per bin above it.
  */
	let at: number[];
	let held: number[];
	if (finite.length <= KDE_BINS) {
		at = finite;
		held = [];
	} else {
		const binWidth = span / KDE_BINS;
		const counts = new Float64Array(KDE_BINS + 1);
		for (const value of finite) counts[Math.round((value - lo) / binWidth)]! += 1;
		at = [];
		held = [];
		for (let bin = 0; bin <= KDE_BINS; bin += 1) {
			if (counts[bin] === 0) continue;
			at.push(lo + bin * binWidth);
			held.push(counts[bin]!);
		}
	}

	/** The estimate at one position. The kernel summed over the readings and normalized. */
	const estimate = (position: number): number => {
		let total = 0;
		for (let index = 0; index < at.length; index += 1) {
			const weight = weigh(kernel, position - at[index]!, bandwidth, reach);
			if (weight !== 0) total += weight * (held[index] ?? 1);
		}
		return total / finite.length;
	};

	/*
    The grid -- the data's range, reached past on an untrimmed curve, then clipped to bounds.

    A finite bound moves the end of the grid onto it.
  */
	const tail = options.trim ? 0 : TAIL_BANDWIDTHS * bandwidth;
	const [boundLo, boundHi] = options.bounds ?? [-Infinity, Infinity];
	const from = Math.max(lo - tail, boundLo);
	const to = Math.min(hi + tail, boundHi);
	if (!(to > from)) return null;

	const grid: number[] = [];
	const weight: number[] = [];
	let peak = 0;
	for (let step = 0; step < points; step += 1) {
		const position = from + ((to - from) * step) / (points - 1);
		/* Reflected at each finite bound. Mass the kernel put outside the limit lands inside.
		   The mirror sits on the bound itself, which an untrimmed grid can stop short of. */
		let value = estimate(position);
		if (Number.isFinite(boundLo)) value += estimate(2 * boundLo - position);
		if (Number.isFinite(boundHi)) value += estimate(2 * boundHi - position);
		grid.push(position);
		weight.push(value);
		if (value > peak) peak = value;
	}

	if ((options.normalize ?? "density") === "peak") {
		return {grid, weight: weight.map((value) => (peak > 0 ? value / peak : 0)), bandwidth};
	}
	return {grid, weight, bandwidth};
}

/** Summary statistics for a set of repeated readings at one condition. */
export interface Spread {
	mean: number;
	sd: number;
	/** Standard error of the mean. */
	sem: number;
	n: number;
}

/**
 * A mean and its error, with no interval claimed off a single reading.
 *
 * One reading reports zero for `sd` and `sem`. A zero-width interval would read as a tight one.
 */
export function spread(values: number[]): Spread | null {
	const clean = values.filter(Number.isFinite);
	if (clean.length === 0) return null;
	const mean = clean.reduce((s, v) => s + v, 0) / clean.length;
	const variance = clean.length > 1 ? clean.reduce((s, v) => s + (v - mean) ** 2, 0) / (clean.length - 1) : 0;
	const sd = Math.sqrt(variance);
	return {mean, sd, sem: clean.length > 1 ? sd / Math.sqrt(clean.length) : 0, n: clean.length};
}
