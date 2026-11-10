/**
 * Rings stacked outside a circular figure.
 *
 * A ring holds one reading per sector. Angles come from the sectors and radii come from the stack.
 */

import {reduceBucket, type Aggregate, type Bucket} from "./aggregate.js";
import type {PlotData, PlotField} from "./plot-data.js";

export interface RingPanel {
	/** Radial extent, in pixels. */
	size: number;
	/** Gap between this ring and what it sits outside, in pixels. */
	gap?: number;
	content: RingContent;
}

/**
 * What one ring draws.
 *
 * `bar` reads a measure per sector, and `stack` splits the same measure by a second column.
 * `point` draws where the figure places a record: one point per ribbon on a chord, reduced by
 * `aggregate`, and one per row at its own position on an ideogram.
 */
export type RingContent =
	| {kind: "bar"; field: string; aggregate?: Aggregate}
	| {kind: "stack"; field: string; by: string; aggregate?: Aggregate}
	| {kind: "point"; field: string; aggregate?: Aggregate};

/** A ring's place in the stack, in pixels from the center. */
export interface RingBand {
	inner: number;
	outer: number;
}

/** One row's reading, drawn at its own position inside its sector. */
export interface RingDot {
	sector: string;
	/** The reading's position, in the sector's own units. */
	at: number;
	value: number;
}

/** One pair's reading, drawn where that pair's own ribbon sits. */
export interface RingPoint {
	source: string;
	target: string;
	value: number;
}

/** One reading of a ring. `floor` is where a stacked segment starts. */
export interface RingBar {
	sector: string;
	level?: string;
	value: number;
	floor: number;
}

export interface RingReading {
	kind: RingContent["kind"];
	/** The column's own name, for the legend and the footer. */
	label: string;
	/** Where the ring's scale runs, in the column's units. */
	domain: [number, number];
	/** Levels a stack drew, in stacking order. Empty on plain bars. */
	levels: string[];
	bars: RingBar[];
	/** One entry per pair, for a ring that draws a point where each ribbon sits. */
	points: RingPoint[];
	/** One entry per row, for a ring that draws a point at its own position. */
	dots: RingDot[];
}

/** Where a row's own position is read from, for a ring that plots one point per row. */
export interface RingPosition {
	sector: string;
	start: string;
	end?: string;
}

/** Gap between one ring and the next where the author states none, in pixels. */
export const RING_GAP = 4;

/** Levels one stack draws. Past this the segments are hairlines. */
export const RING_LEVEL_CAP = 8;

/**
 * Where each ring sits, working outward from a radius.
 *
 * The first ring clears the figure it stands outside by its own gap.
 */
export function ringBands(from: number, rings: readonly RingPanel[]): RingBand[] {
	let at = from;
	return rings.map((ring) => {
		const inner = at + (ring.gap ?? RING_GAP);
		const outer = inner + Math.max(0, ring.size);
		at = outer;
		return {inner, outer};
	});
}

const empty = (): Bucket => ({n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity});

const take = (bucket: Bucket, value: number) => {
	bucket.n += 1;
	bucket.sum += value;
	bucket.sumSq += value * value;
	bucket.min = Math.min(bucket.min, value);
	bucket.max = Math.max(bucket.max, value);
};

/**
 * One ring's readings, against the sectors a circular figure drew.
 *
 * A row is credited to the sector at each of its ends. A pair names two.
 */
export function ringReading(
	content: RingContent,
	sectors: readonly string[],
	ends: readonly string[],
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	position?: RingPosition,
): RingReading | null {
	const measure = fieldAt.get(content.field);
	if (!measure || sectors.length === 0) return null;

	const within = new Set(sectors);
	const named = measure.unit ? `${measure.label} (${measure.unit})` : measure.label;

	/* A row keeps its own position, which is what a genomic track plots against. */
	if (content.kind === "point" && position) {
		const dots: RingDot[] = [];
		let reach = 0;
		for (let row = 0; row < data.rowCount; row += 1) {
			const value = data.number(row, content.field);
			const name = data.text(row, position.sector);
			const start = data.number(row, position.start);
			if (value == null || !Number.isFinite(value)) continue;
			if (name == null || !within.has(name) || start == null) continue;
			const end = position.end ? data.number(row, position.end) : null;
			dots.push({sector: name, at: end == null ? start : (start + end) / 2, value});
			reach = Math.max(reach, value);
		}
		if (dots.length === 0) return null;
		return {kind: "point", label: named, domain: [0, reach > 0 ? reach : 1], levels: [], bars: [], points: [], dots};
	}

	/*
    A point ring over ribbons reads a pair instead of a sector.

    One reading per pair, drawn where that pair's ribbon already sits. A row keeps no point of its
    own: a ribbon stands for the whole pair and a single row's reading would misname it.
  */
	if (content.kind === "point") {
		const [sourceId, targetId] = ends;
		if (!sourceId || !targetId) return null;

		const pairs = new Map<string, {source: string; target: string; bucket: Bucket}>();
		for (let row = 0; row < data.rowCount; row += 1) {
			const value = data.number(row, content.field);
			const source = data.text(row, sourceId);
			const target = data.text(row, targetId);
			if (value == null || !Number.isFinite(value)) continue;
			if (source == null || target == null || !within.has(source) || !within.has(target)) continue;
			const key = `${source}\u0000${target}`;
			const held = pairs.get(key) ?? {source, target, bucket: empty()};
			take(held.bucket, value);
			pairs.set(key, held);
		}

		const points: RingPoint[] = [];
		let reach = 0;
		for (const {source, target, bucket} of pairs.values()) {
			const value = reduceBucket(bucket, content.aggregate ?? "mean");
			if (!Number.isFinite(value)) continue;
			points.push({source, target, value});
			reach = Math.max(reach, value);
		}
		if (points.length === 0) return null;
		return {
			kind: "point",
			label: named,
			domain: [0, reach > 0 ? reach : 1],
			levels: [],
			bars: [],
			points,
			dots: [],
		};
	}

	const aggregate: Aggregate = content.aggregate ?? "mean";
	const stacked = content.kind === "stack";

	const buckets = new Map<string, Map<string, Bucket>>();
	const weight = new Map<string, number>();

	for (let row = 0; row < data.rowCount; row += 1) {
		const value = data.number(row, content.field);
		if (value == null || !Number.isFinite(value)) continue;
		const level = stacked ? (data.text(row, content.by) ?? "") : "";
		if (stacked && level === "") continue;

		for (const id of ends) {
			const name = data.text(row, id);
			if (name == null || !within.has(name)) continue;
			const levels = buckets.get(name) ?? new Map<string, Bucket>();
			const bucket = levels.get(level) ?? empty();
			take(bucket, value);
			levels.set(level, bucket);
			buckets.set(name, levels);
			weight.set(level, (weight.get(level) ?? 0) + value);
		}
	}
	if (buckets.size === 0) return null;

	/* The largest levels lead. The tail past the cap is left out. */
	const levels = stacked
		? [...weight]
				.sort((a, b) => b[1] - a[1])
				.slice(0, RING_LEVEL_CAP)
				.map(([level]) => level)
		: [""];

	const bars: RingBar[] = [];
	let reach = 0;
	for (const sector of sectors) {
		const held = buckets.get(sector);
		if (!held) continue;

		let floor = 0;
		for (const level of levels) {
			const bucket = held.get(level);
			if (!bucket) continue;
			const value = reduceBucket(bucket, aggregate);
			if (!Number.isFinite(value)) continue;
			bars.push({sector, ...(stacked ? {level} : {}), value, floor});
			floor += value;
		}
		reach = Math.max(reach, floor);
	}
	if (bars.length === 0) return null;

	return {
		kind: content.kind,
		label: named,
		domain: [0, reach > 0 ? reach : 1],
		levels: stacked ? levels : [],
		bars,
		points: [],
		dots: [],
	};
}
