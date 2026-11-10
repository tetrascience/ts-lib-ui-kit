/**
 * A scalar field on a grid.
 *
 * `isosurface` draws the shell at one value and `volume` integrates along the ray. Bytes, and
 * `texImage3D` takes a byte without float sampling.
 */

import {NEEDS_VALUES, reduceBucket, type Aggregate} from "./aggregate.js";
import type {PlotData} from "./plot-data.js";

/** The field, ready to upload, with what its bytes stand for. */
export interface Field3d {
	/** One byte a cell, in x-fastest order. `texImage3D` reads this order. */
	values: Uint8Array;
	/** Cells along each axis, in the data's own axis order. */
	dims: [number, number, number];
	xDomain: [number, number];
	yDomain: [number, number];
	zDomain: [number, number];
	/** What byte 0 and byte 255 stand for. A level and a legend read in the data's units. */
	valueDomain: [number, number];
	/** Cells no row landed in. The transfer function draws these as empty. */
	empty: number;
}

/**
 * The most cells a field takes along each axis.
 *
 * Thirty-two cubed is 32,768 voxels and a 32 KB texture. Finer grids buy detail the marching
 * step throws away.
 */
export const FIELD_CELLS = 32;

/**
 * Cells this many rows supports along each axis.
 *
 * A grid finer than the rows fill is mostly holes. Two rows a cell, the cube root on a cube.
 */
export const fieldCellsFor = (rowCount: number): number =>
	Math.max(4, Math.min(FIELD_CELLS, Math.round(Math.cbrt(rowCount / 2))));

const extentOf = (data: PlotData, field: string): [number, number] | null => {
	let lo = Infinity;
	let hi = -Infinity;
	for (let row = 0; row < data.rowCount; row += 1) {
		const value = data.number(row, field);
		if (value == null) continue;
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	return Number.isFinite(lo) ? [lo, hi] : null;
};

/**
 * The rows reduced onto a grid of three dimensions.
 *
 * With no measure bound the reduction is a count. With one, the cells take that measure.
 */
export function field3d(
	data: PlotData,
	xId: string,
	yId: string,
	zId: string,
	valueId: string | null,
	aggregate: Aggregate = "mean",
	cells = fieldCellsFor(data.rowCount),
): Field3d | null {
	const xDomain = extentOf(data, xId);
	const yDomain = extentOf(data, yId);
	const zDomain = extentOf(data, zId);
	if (!xDomain || !yDomain || !zDomain) return null;

	const count = cells * cells * cells;
	const buckets = Array.from({length: count}, () => ({sum: 0, sumSq: 0, n: 0, min: Infinity, max: -Infinity}));

	/* The readings themselves, kept only under the aggregates that read them. */
	const collected: number[][] | null =
		valueId && NEEDS_VALUES.includes(aggregate) ? Array.from({length: count}, () => []) : null;

	const slot = (value: number, domain: [number, number]) => {
		const span = domain[1] - domain[0] || 1;
		return Math.min(cells - 1, Math.max(0, Math.floor(((value - domain[0]) / span) * cells)));
	};

	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		const y = data.number(row, yId);
		const z = data.number(row, zId);
		if (x == null || y == null || z == null) continue;

		const measure = valueId ? data.number(row, valueId) : 1;
		if (measure == null) continue;

		const at = slot(z, zDomain) * cells * cells + slot(y, yDomain) * cells + slot(x, xDomain);
		const bucket = buckets[at]!;
		bucket.sum += measure;
		bucket.sumSq += measure * measure;
		bucket.n += 1;
		if (measure < bucket.min) bucket.min = measure;
		if (measure > bucket.max) bucket.max = measure;
		collected?.[at]!.push(measure);
	}

	const reduced = new Float64Array(count);
	let lo = Infinity;
	let hi = -Infinity;
	let empty = 0;
	for (let at = 0; at < count; at += 1) {
		const bucket = buckets[at]!;
		if (bucket.n === 0) {
			reduced[at] = NaN;
			empty += 1;
			continue;
		}
		const value = valueId ? reduceBucket(bucket, aggregate, collected?.[at]) : bucket.n;
		reduced[at] = value;
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	if (!Number.isFinite(lo)) return null;

	/*
    Zero is the empty cell and the levels run from one. A lowest cell sharing a byte with the
    empties would draw its own floor as solid.
  */
	const span = hi - lo || 1;
	const values = new Uint8Array(count);
	for (let at = 0; at < count; at += 1) {
		const value = reduced[at]!;
		values[at] = Number.isNaN(value) ? 0 : 1 + Math.round(((value - lo) / span) * 254);
	}

	return {values, dims: [cells, cells, cells], xDomain, yDomain, zDomain, valueDomain: [lo, hi], empty};
}

/** Where a level in the data's units falls among the field's 255 steps. */
export const levelByte = (level: number, domain: [number, number]): number => {
	const span = domain[1] - domain[0] || 1;
	return Math.min(255, Math.max(1, 1 + Math.round(((level - domain[0]) / span) * 254)));
};

/**
 * The box itself, as triangles.
 *
 * A ray needs a surface to start on. The winding is counter-clockwise seen from outside and
 * culling the back faces leaves one fragment a pixel.
 */
export function boxMesh(
	xDomain: [number, number],
	yDomain: [number, number],
	zDomain: [number, number],
): {positions: Float32Array; indices: Uint32Array} {
	const positions = new Float32Array(8 * 3);
	for (let corner = 0; corner < 8; corner += 1) {
		positions[corner * 3] = xDomain[corner & 1]!;
		positions[corner * 3 + 1] = yDomain[(corner >> 1) & 1]!;
		positions[corner * 3 + 2] = zDomain[(corner >> 2) & 1]!;
	}

	// Six faces, two triangles each, wound outward.
	const indices = new Uint32Array([
		0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 0, 1, 4, 1, 5, 4, 2, 6, 3, 3, 6, 7, 0, 4, 2, 2, 4, 6, 1, 3, 5, 3, 7, 5,
	]);
	return {positions, indices};
}
