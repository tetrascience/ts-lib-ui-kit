/**
 * A region dragged over a scatter, and the records inside it.
 *
 * Shiny's `brushedPoints` and plotly's box and lasso select. The answer is rows, keys and a filter.
 */

import {placePoints} from "./hit.js";
import type {Trace} from "./layers.js";
import type {Predicate} from "./predicate.js";
import type {Aesthetic} from "./geom-table.js";
import type {ChartSpec, Aes} from "./spec.js";

/** What a drag draws: a box between two corners, or a lasso through its vertices. */
export type BrushShape = "box" | "lasso";

/** A pixel in the plot area. */
export interface Pixel {
	x: number;
	y: number;
}

/** Whether a pixel falls inside a region. A lasso closes on its first vertex. */
export function insideRegion(shape: BrushShape, region: readonly Pixel[], at: Pixel): boolean {
	if (shape === "box") {
		const [a, b] = region;
		if (!a || !b) return false;
		return (
			at.x >= Math.min(a.x, b.x) &&
			at.x <= Math.max(a.x, b.x) &&
			at.y >= Math.min(a.y, b.y) &&
			at.y <= Math.max(a.y, b.y)
		);
	}
	/* Even-odd crossings of a ray running right from the pixel. */
	let inside = false;
	for (let i = 0, j = region.length - 1; i < region.length; j = i, i += 1) {
		const p = region[i]!;
		const q = region[j]!;
		if (p.y > at.y !== q.y > at.y && at.x < ((q.x - p.x) * (at.y - p.y)) / (q.y - p.y) + p.x) inside = !inside;
	}
	return inside;
}

/** The records a dragged region holds, and a filter naming them. */
export interface Brushed {
	shape: BrushShape;
	/** The region in data units: a box's two corners, or the lasso's vertices in order. */
	region: {x: number | string; y: number | string}[];
	/** Table rows inside the region, ascending, each once. */
	rows: number[];
	/** Keys of the same records, where a key column names each record once. Empty otherwise. */
	keys: string[];
	/**
	 * A filter for the same records. A box over two value axes and unmoved geoms states its ranges. The rest name keys.
	 *
	 * Null where no key column names the records.
	 */
	predicate: Predicate | null;
}

/** The pixel mapping of one axis and its inverse, as a brush reads them. */
export interface BrushAxis {
	scale: (value: number | string) => number;
	invert: (px: number) => number | string;
	/** Distance between two neighboring band centers, where the axis runs bands. A jitter's offset there reads in it. */
	step?: number;
}

export interface BrushContext {
	spec: ChartSpec;
	/** Column with record identity, where the table names one. */
	keyField?: string;
	/** Whether the pair of scales is flipped, as the band geoms take it. */
	transposed?: boolean;
}

const oneField = (channel: Aes[Aesthetic]): string | undefined =>
	typeof channel === "string" ? channel : channel?.[0];

/** The scatter traces reading the figure's own table. A layer with rows of its own is left out. */
const brushable = (trace: Trace) => trace.data.at === "records" && trace.data.geom === "point" && trace.table == null;

/**
 * The records inside a region, off the scatter traces of one panel.
 *
 * Tested at the pixel each geom draws at, jitter and all. The filter states the region.
 */
export function brushedOf(
	traces: readonly Trace[],
	shape: BrushShape,
	region: readonly Pixel[],
	x: BrushAxis,
	y: BrushAxis,
	context: BrushContext,
): Brushed {
	const transposed = context.transposed === true;
	const rows = new Set<number>();
	const keys = new Set<string>();
	const pairs = new Map<string, [string, string]>();
	/* The row each key names. A key naming two rows names a group and no record. */
	const owner = new Map<string, number>();
	let unique = true;
	/* A geom a jitter or a nudge moved off its reading. A range would name records drawn outside the region. */
	let moved = false;

	for (const trace of traces) {
		if (!brushable(trace) || !("points" in trace.data)) continue;
		const series = context.spec.layers.find((one) => one.id === trace.layerId);
		const xField = oneField(series?.aes.x);
		const yField = oneField(series?.aes.y);
		if (xField && yField) pairs.set(`${xField}\u0000${yField}`, [xField, yField]);
		const points = trace.data.points;
		for (const point of points) {
			if (point.dx || point.dy) moved = true;
			if (point.key == null) continue;
			if ((owner.get(point.key) ?? point.row) !== point.row) unique = false;
			owner.set(point.key, point.row);
		}
		for (const placed of placePoints(points, x.scale, y.scale, {transposed, step: transposed ? y.step : x.step})) {
			if (!insideRegion(shape, region, placed)) continue;
			const point = points[placed.index]!;
			rows.add(point.plotRow ?? point.row);
			if (point.key != null) keys.add(point.key);
		}
	}

	const inData = region.map((at) =>
		transposed ? {x: y.invert(at.y), y: x.invert(at.x)} : {x: x.invert(at.x), y: y.invert(at.y)},
	);
	const named = unique ? [...keys] : [];
	return {
		shape,
		region: inData,
		rows: [...rows].sort((a, b) => a - b),
		keys: named,
		predicate: filterOf(shape, inData, moved ? [] : [...pairs.values()], named, unique ? context.keyField : undefined),
	};
}

/** Ranges for a box over two value axes, the keys otherwise. */
function filterOf(
	shape: BrushShape,
	corners: {x: number | string; y: number | string}[],
	pairs: [string, string][],
	keys: string[],
	keyField: string | undefined,
): Predicate | null {
	const [a, b] = corners;
	if (shape === "box" && a && b && pairs.length > 0) {
		const {x: ax, y: ay} = a;
		const {x: bx, y: by} = b;
		if (typeof ax === "number" && typeof ay === "number" && typeof bx === "number" && typeof by === "number") {
			const boxes: Predicate[] = pairs.map(([xField, yField]) => ({
				kind: "and",
				of: [
					{kind: "range", field: xField, lo: Math.min(ax, bx), hi: Math.max(ax, bx)},
					{kind: "range", field: yField, lo: Math.min(ay, by), hi: Math.max(ay, by)},
				],
			}));
			return boxes.length === 1 ? boxes[0]! : {kind: "or", of: boxes};
		}
	}
	return keyField ? {kind: "in", field: keyField, values: keys} : null;
}
