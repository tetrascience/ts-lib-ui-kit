/**
 * A group of records becomes one number.
 *
 * Bar heights, heat cell values and voxel measures share one accumulator. `reduceBucket` returns
 * the aggregate asked for.
 */

export type Aggregate = "count" | "mean" | "median" | "min" | "max" | "sum" | "p95";

/**
 * Aggregates that read the values themselves.
 *
 * A reduction of 250k rows into 100 groups keeps nothing under `mean` and 100 arrays under
 * `median`.
 */
export const NEEDS_VALUES: Aggregate[] = ["median", "p95"];

export interface Bucket {
	n: number;
	sum: number;
	/** Sum of squares. A deviation comes off the running totals with no array kept. */
	sumSq: number;
	min: number;
	max: number;
}

/** Turns an accumulated bucket into the aggregate asked for. A group and a cell share it. */
export function reduceBucket(bucket: Bucket, aggregate: Aggregate, collected?: number[]): number {
	switch (aggregate) {
		case "count":
			return bucket.n;
		case "sum":
			return bucket.sum;
		case "min":
			return bucket.min;
		case "max":
			return bucket.max;
		case "median":
			return quantile(collected, 0.5);
		case "p95":
			return quantile(collected, 0.95);
		default:
			return bucket.sum / bucket.n;
	}
}

/**
 * Deviation and standard error off a bucket's running totals.
 *
 * One reading reports zero for both. A zero-width interval would read as a tight one.
 */
export function spreadOf(bucket: Bucket): {sd: number; sem: number} {
	if (bucket.n < 2) return {sd: 0, sem: 0};
	const mean = bucket.sum / bucket.n;
	// Clamped at zero. The one-pass form can land a hair below where the spread is tiny.
	const variance = Math.max(0, (bucket.sumSq - bucket.n * mean * mean) / (bucket.n - 1));
	const sd = Math.sqrt(variance);
	return {sd, sem: sd / Math.sqrt(bucket.n)};
}

/**
 * Lowest and highest of a list, walked.
 *
 * `Math.min(...values)` passes one argument per element and 250k of them overflow the stack.
 */
export function boundsOf(values: number[]): [number, number] {
	let lo = Infinity;
	let hi = -Infinity;
	for (const value of values) {
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	return [lo, hi];
}

/** Linear interpolation between order statistics. Matches the convention `boxStats` uses. */
export function quantile(collected: number[] | undefined, q: number): number {
	const values = [...(collected ?? [])].sort((a, b) => a - b);
	if (values.length === 0) return 0;
	const pos = q * (values.length - 1);
	const base = Math.floor(pos);
	const next = values[Math.min(values.length - 1, base + 1)]!;
	return values[base]! + (pos - base) * (next - values[base]!);
}

/** One category and the number standing for it. A bar chart plots these. */
export interface Group {
	key: string;
	n: number;
	value: number;
	/** The group's own spread, for a geom drawing an interval around the reduction. */
	sd: number;
	sem: number;
	/** The readings themselves, where the caller asked to keep them. */
	values?: number[];
}

/**
 * A series read as a running total, in the order given.
 *
 * Each datum adds the ones before it, `n` included. The error, the floor and the readings drop.
 */
export function accumulate<T extends {value: number; error?: number; floor?: number; values?: number[]; n?: number}>(
	data: readonly T[],
): T[] {
	let running = 0;
	let rows = 0;
	return data.map((datum) => {
		running += datum.value;
		rows += datum.n ?? 0;
		const {error: _error, floor: _floor, values: _values, ...rest} = datum;
		return {...rest, value: running, ...(datum.n == null ? {} : {n: rows})} as T;
	});
}

/**
 * Readings as a running total along the horizontal axis.
 *
 * The record form of `accumulate`. Points arrive in table order and a total means nothing in it, so
 * they are put in x order first: the curve then answers how much had arrived by a date.
 */
export function accumulateAlong<T extends {x: number; y: number}>(points: readonly T[]): T[] {
	let running = 0;
	return [...points]
		.sort((a, b) => a.x - b.x)
		.map((point) => {
			running += point.y;
			return {...point, y: running};
		});
}
