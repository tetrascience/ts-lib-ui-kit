/**
 * A range held on one axis.
 *
 * Records outside the range stop drawing on all axes together. Ranges compose and a second axis
 * narrows what the first left.
 */

/** Low and high of a dragged range, in the axis's own units. */
export type Extent = [number, number];

/** A range per axis id. An axis with no entry keeps all records. */
export type AxisRanges = Record<string, Extent>;

/** What an axis spans, and where it runs in the panel. */
export interface AxisSpan {
	lo: number;
	hi: number;
	top: number;
	bottom: number;
}

/** Vertical position of a value on one axis. */
export function placeOn(value: number, span: AxisSpan): number {
	const reach = span.hi - span.lo || 1;
	return span.bottom - ((value - span.lo) / reach) * (span.bottom - span.top);
}

/**
 * The value at a vertical position, clamped to the axis's own range.
 *
 * A drag past the end of the rule reads as the end of it.
 */
export function valueOn(y: number, span: AxisSpan): number {
	const height = span.bottom - span.top || 1;
	const at = span.lo + ((span.bottom - y) / height) * (span.hi - span.lo);
	return Math.min(span.hi, Math.max(span.lo, at));
}

/** A drag read as a range, whichever direction the hand moved. */
export const extentOf = (from: number, to: number): Extent => (from <= to ? [from, to] : [to, from]);

/** Whether any range is in force. An untouched figure says nothing about a filter. */
export const anyRange = (ranges: AxisRanges): boolean => Object.keys(ranges).length > 0;

/** A range added or lifted, as a new set. */
export function setRange(ranges: AxisRanges, axisId: string, extent: Extent | null): AxisRanges {
	if (extent) return {...ranges, [axisId]: extent};
	if (!(axisId in ranges)) return ranges;
	const next = {...ranges};
	delete next[axisId];
	return next;
}

/** Whether one record's readings fall inside all the ranges in force. */
export function withinRanges(values: number[], axisIds: string[], ranges: AxisRanges): boolean {
	for (let at = 0; at < axisIds.length; at += 1) {
		const range = ranges[axisIds[at]!];
		if (!range) continue;
		const value = values[at];
		/* A missing reading drops the record. NaN fails both comparisons and would otherwise pass. */
		if (value == null || !Number.isFinite(value) || value < range[0] || value > range[1]) return false;
	}
	return true;
}

/** The records the ranges keep, in the order they were built. */
export function keptLines<L extends {values: number[]}>(lines: L[], axisIds: string[], ranges: AxisRanges): L[] {
	if (!anyRange(ranges)) return lines;
	return lines.filter((line) => withinRanges(line.values, axisIds, ranges));
}

/** Where the rules stand across a panel, and the range each one spans. */
export interface AxisLayout {
	spans: AxisSpan[];
	/** Horizontal position of each rule, left to right. */
	at: number[];
}

/**
 * Rules spread evenly across a panel.
 *
 * Inset on both sides. The outermost rules take a value label at each end. One rule takes the
 * middle.
 */
export function axisLayout(
	axes: readonly {lo: number; hi: number}[],
	width: number,
	height: number,
	inset: {x: number; top: number; bottom: number},
): AxisLayout {
	const usable = Math.max(0, width - inset.x * 2);
	const gap = axes.length > 1 ? usable / (axes.length - 1) : 0;
	return {
		at: axes.map((_, index) => (axes.length > 1 ? inset.x + gap * index : width / 2)),
		spans: axes.map((axis) => ({lo: axis.lo, hi: axis.hi, top: inset.top, bottom: height - inset.bottom})),
	};
}

/**
 * The line running closest to a point.
 *
 * The search runs over the lines. The pointer's segment is arithmetic and each line's height
 * inside it is one interpolation.
 */
export function nearestLine<L extends {values: number[]}>(
	lines: readonly L[],
	layout: AxisLayout,
	x: number,
	y: number,
	reach = 6,
): {line: L; index: number; at: {x: number; y: number}} | null {
	const {at, spans} = layout;
	if (at.length < 2 || lines.length === 0) return null;

	/* The pair of rules the pointer falls between, clamped to the run on either overshoot. */
	let seg = 0;
	while (seg < at.length - 2 && x > at[seg + 1]!) seg += 1;
	const left = at[seg]!;
	const span = at[seg + 1]! - left || 1;
	const t = Math.min(1, Math.max(0, (x - left) / span));

	let best: {line: L; index: number; at: {x: number; y: number}} | null = null;
	let closest = reach;
	for (let index = 0; index < lines.length; index += 1) {
		const values = lines[index]!.values;
		const from = values[seg];
		const to = values[seg + 1];
		if (from == null || to == null) continue;
		const height = placeOn(from, spans[seg]!) + (placeOn(to, spans[seg + 1]!) - placeOn(from, spans[seg]!)) * t;
		const off = Math.abs(height - y);
		if (off <= closest) {
			closest = off;
			best = {line: lines[index]!, index, at: {x, y: height}};
		}
	}
	return best;
}
