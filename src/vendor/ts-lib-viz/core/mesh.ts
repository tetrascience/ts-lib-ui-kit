/**
 * Triangles for the two cube kinds drawing a surface.
 *
 * `surface` reduces a measure over a grid of two and triangulates it. `mesh3d` arrives as
 * vertices and faces.
 */

import {NEEDS_VALUES, reduceBucket, type Aggregate, type Bucket} from "./aggregate.js";
import type {PlotData} from "./plot-data.js";

/** What the GPU draws: positions, one normal each, and the triangles over them. */
export interface MeshData {
	/** Interleaved x, y, z in the data's own units. */
	positions: Float32Array;
	/** Interleaved unit normals, one a vertex. */
	normals: Float32Array;
	/** Three indices a triangle. */
	indices: Uint32Array;
	/** Range of the third scale over the vertices, for the color ramp and the axis. */
	zDomain: [number, number];
}

/**
 * The most cells a relief takes across each dimension.
 *
 * Forty squares a side is 1,600 cells and 3,200 triangles, which draws in one call.
 */
export const SURFACE_CELLS = 40;

/**
 * Cells a table of this many rows supports.
 *
 * A cell with no reading is a hole and the quads either side go too. Two rows a cell.
 */
export const cellsFor = (rowCount: number): number =>
	Math.max(4, Math.min(SURFACE_CELLS, Math.round(Math.sqrt(rowCount / 2))));

/** The most cells a lattice takes across each dimension. */
export const LATTICE_CAP = 256;

/** Cells across a set of values at its smallest step. Each value takes a cell of its own. */
function stepsOf(values: ReadonlySet<number>): number {
	const sorted = [...values].sort((a, b) => a - b);
	let step = Infinity;
	for (let at = 1; at < sorted.length; at += 1) step = Math.min(step, sorted[at]! - sorted[at - 1]!);
	return Math.round((sorted[sorted.length - 1]! - sorted[0]!) / step) + 1;
}

/**
 * The lattice under two columns, as cells across and down. Null for a scatter.
 *
 * One row per crossing. Cells run at the smallest step between two values.
 */
export function latticeOf(data: PlotData, xId: string, yId: string): [number, number] | null {
	const xs = new Set<number>();
	const ys = new Set<number>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		const y = data.number(row, yId);
		if (x == null || y == null) continue;
		xs.add(x);
		ys.add(y);
		if (xs.size > LATTICE_CAP || ys.size > LATTICE_CAP) return null;
	}
	if (xs.size < 2 || ys.size < 2 || xs.size * ys.size > data.rowCount * 1.05) return null;
	const across = stepsOf(xs);
	const down = stepsOf(ys);
	return across > LATTICE_CAP || down > LATTICE_CAP ? null : [across, down];
}

/** A reduction of one measure over a grid of two, with the empty cells still holes. */
export interface Relief {
	/** Cell values in row-major order, `NaN` where no row landed in the cell. */
	values: Float64Array;
	columns: number;
	rows: number;
	xDomain: [number, number];
	yDomain: [number, number];
	zDomain: [number, number];
}

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
 * A measure reduced over a grid of two others.
 *
 * The grid is regular in both dimensions. Rows on a lattice take its own cells. Cells nothing
 * landed in stay holes -- interpolating them would draw terrain nobody measured.
 */
export function relief(
	data: PlotData,
	xId: string,
	yId: string,
	zId: string,
	aggregate: Aggregate = "mean",
	cells: number | [number, number] = latticeOf(data, xId, yId) ?? cellsFor(data.rowCount),
): Relief | null {
	const xDomain = extentOf(data, xId);
	const yDomain = extentOf(data, yId);
	if (!xDomain || !yDomain) return null;

	const [columns, rows] = typeof cells === "number" ? [cells, cells] : cells;
	const xSpan = xDomain[1] - xDomain[0] || 1;
	const ySpan = yDomain[1] - yDomain[0] || 1;

	const buckets: Bucket[] = Array.from({length: columns * rows}, () => ({
		sum: 0,
		sumSq: 0,
		n: 0,
		min: Infinity,
		max: -Infinity,
	}));

	/* The readings themselves, kept only under the aggregates that read them. */
	const keeps = NEEDS_VALUES.includes(aggregate);
	const collected: number[][] | null = keeps ? Array.from({length: columns * rows}, () => []) : null;

	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		const y = data.number(row, yId);
		const z = data.number(row, zId);
		if (x == null || y == null || z == null) continue;

		const column = Math.min(columns - 1, Math.floor(((x - xDomain[0]) / xSpan) * columns));
		const line = Math.min(rows - 1, Math.floor(((y - yDomain[0]) / ySpan) * rows));
		const cell = line * columns + column;
		const bucket = buckets[cell]!;
		bucket.sum += z;
		bucket.sumSq += z * z;
		bucket.n += 1;
		if (z < bucket.min) bucket.min = z;
		if (z > bucket.max) bucket.max = z;
		collected?.[cell]!.push(z);
	}

	const values = new Float64Array(columns * rows);
	let lo = Infinity;
	let hi = -Infinity;
	for (let cell = 0; cell < values.length; cell += 1) {
		const bucket = buckets[cell]!;
		if (bucket.n === 0) {
			values[cell] = NaN;
			continue;
		}
		const value = reduceBucket(bucket, aggregate, collected?.[cell]);
		values[cell] = value;
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}

	if (!Number.isFinite(lo)) return null;
	return {values, columns, rows, xDomain, yDomain, zDomain: [lo, hi]};
}

/** Unit normals averaged over the faces each vertex belongs to. */
function normalsOf(positions: Float32Array, indices: Uint32Array): Float32Array {
	const normals = new Float32Array(positions.length);

	for (let face = 0; face < indices.length; face += 3) {
		const a = indices[face]! * 3;
		const b = indices[face + 1]! * 3;
		const c = indices[face + 2]! * 3;

		const ux = positions[b]! - positions[a]!;
		const uy = positions[b + 1]! - positions[a + 1]!;
		const uz = positions[b + 2]! - positions[a + 2]!;
		const vx = positions[c]! - positions[a]!;
		const vy = positions[c + 1]! - positions[a + 1]!;
		const vz = positions[c + 2]! - positions[a + 2]!;

		const nx = uy * vz - uz * vy;
		const ny = uz * vx - ux * vz;
		const nz = ux * vy - uy * vx;

		for (const at of [a, b, c]) {
			normals[at] += nx;
			normals[at + 1] += ny;
			normals[at + 2] += nz;
		}
	}

	for (let at = 0; at < normals.length; at += 3) {
		const length = Math.hypot(normals[at]!, normals[at + 1]!, normals[at + 2]!) || 1;
		normals[at] /= length;
		normals[at + 1] /= length;
		normals[at + 2] /= length;
	}
	return normals;
}

/**
 * A relief as triangles.
 *
 * Two a cell, and a cell missing any of its four corners is left out. The positions take the
 * third scale in its own units.
 */
export function meshOfRelief(grid: Relief): MeshData | null {
	const {values, columns, rows, xDomain, yDomain} = grid;
	/* A vertex sits at the center of the cell it summarizes. `relief` bins the domain into
	   `columns` cells, and spacing over `columns - 1` intervals would stretch the surface. */
	const xStep = (xDomain[1] - xDomain[0]) / columns;
	const yStep = (yDomain[1] - yDomain[0]) / rows;

	const positions = new Float32Array(columns * rows * 3);
	for (let line = 0; line < rows; line += 1) {
		for (let column = 0; column < columns; column += 1) {
			const at = (line * columns + column) * 3;
			positions[at] = xDomain[0] + (column + 0.5) * xStep;
			positions[at + 1] = yDomain[0] + (line + 0.5) * yStep;
			positions[at + 2] = values[line * columns + column]!;
		}
	}

	const faces: number[] = [];
	for (let line = 0; line < rows - 1; line += 1) {
		for (let column = 0; column < columns - 1; column += 1) {
			const a = line * columns + column;
			const b = a + 1;
			const c = a + columns;
			const d = c + 1;
			if ([a, b, c, d].some((corner) => Number.isNaN(values[corner]!))) continue;
			/* Counterclockwise seen from above, which puts the face normal on +z. */
			faces.push(a, b, c, c, b, d);
		}
	}
	if (faces.length === 0) return null;

	// A hole leaves its corner unreferenced, and a vertex with no reading would draw at NaN.
	for (let at = 2; at < positions.length; at += 3) {
		if (Number.isNaN(positions[at]!)) positions[at] = grid.zDomain[0];
	}

	const indices = new Uint32Array(faces);
	return {positions, normals: normalsOf(positions, indices), indices, zDomain: grid.zDomain};
}

/**
 * Vertices and faces as they arrive.
 *
 * The faces are triples of row numbers. A triple naming a row the table does not have is dropped.
 */
export function meshOfRows(
	data: PlotData,
	xId: string,
	yId: string,
	zId: string,
	faces: [number, number, number][],
): MeshData | null {
	const positions = new Float32Array(data.rowCount * 3);
	let lo = Infinity;
	let hi = -Infinity;
	const usable = new Uint8Array(data.rowCount);

	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		const y = data.number(row, yId);
		const z = data.number(row, zId);
		if (x == null || y == null || z == null) continue;
		positions[row * 3] = x;
		positions[row * 3 + 1] = y;
		positions[row * 3 + 2] = z;
		usable[row] = 1;
		if (z < lo) lo = z;
		if (z > hi) hi = z;
	}
	if (!Number.isFinite(lo)) return null;

	const kept = faces.filter((face) => face.every((row) => row >= 0 && row < data.rowCount && usable[row] === 1));
	if (kept.length === 0) return null;

	const indices = new Uint32Array(kept.flat());
	return {positions, normals: normalsOf(positions, indices), indices, zDomain: [lo, hi]};
}
