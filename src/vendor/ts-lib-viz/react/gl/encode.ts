/**
 * The packing and addressing arithmetic the GPU tier runs on.
 *
 * Kept apart from the context so it can be tested without one: a headless run has no WebGL, and
 * the parts that decide where a geom lands and which geom a pixel names are the parts worth
 * pinning.
 */

import type {CubeQuad, CubeSegment} from "../../core/internal.js";

/** A layer's positions, centered so single precision holds through a deep zoom. */
export interface Packed {
	/** Offsets from the center, interleaved x, y. */
	offsets: Float32Array;
	/** The center the offsets are measured from, in data units. */
	center: [number, number];
	count: number;
}

/**
 * Positions as offsets from their own center.
 *
 * A float32 carries about seven significant digits. Timestamps in milliseconds spend all of them
 * before the fractional part starts, so a zoom into one day of a five-year domain quantises the
 * geoms into visible columns. Subtracting the center on the CPU, where the arithmetic is float64,
 * leaves the GPU holding small numbers and the camera holding the large one. Plotly splits a value
 * into a whole and a fractional attribute for the same reason.
 */
export function packPositions(xs: ArrayLike<number>, ys: ArrayLike<number>): Packed {
	const count = Math.min(xs.length, ys.length);
	let xMin = Infinity;
	let xMax = -Infinity;
	let yMin = Infinity;
	let yMax = -Infinity;

	for (let i = 0; i < count; i += 1) {
		const x = xs[i]!;
		const y = ys[i]!;
		if (x < xMin) xMin = x;
		if (x > xMax) xMax = x;
		if (y < yMin) yMin = y;
		if (y > yMax) yMax = y;
	}

	const center: [number, number] = count === 0 ? [0, 0] : [(xMin + xMax) / 2, (yMin + yMax) / 2];

	const offsets = new Float32Array(count * 2);
	for (let i = 0; i < count; i += 1) {
		offsets[i * 2] = xs[i]! - center[0];
		offsets[i * 2 + 1] = ys[i]! - center[1];
	}

	return {offsets, center, count};
}

/** A third scale's positions, centered for the reason the pair are. */
export interface PackedDepth {
	offsets: Float32Array;
	/** The center the offsets are measured from, in data units. */
	center: number;
}

/**
 * The third coordinate, packed beside the pair instead of interleaved with them.
 *
 * A caller packing x and y keeps `packPositions` as it is, and a flat layer pays nothing for a
 * cube's attribute. The shader reads the pair and this one into a vec3.
 */
export function packDepth(zs: ArrayLike<number>): PackedDepth {
	let lo = Infinity;
	let hi = -Infinity;
	for (let i = 0; i < zs.length; i += 1) {
		const z = zs[i]!;
		if (z < lo) lo = z;
		if (z > hi) hi = z;
	}
	const center = zs.length === 0 ? 0 : (lo + hi) / 2;

	const offsets = new Float32Array(zs.length);
	for (let i = 0; i < zs.length; i += 1) offsets[i] = zs[i]! - center;
	return {offsets, center};
}

/** Colors as four bytes a shader reads normalized, which is a quarter of the float form. */
export function packColors(
	count: number,
	colorOf: (index: number) => readonly [number, number, number],
	alpha = 1,
): Uint8Array {
	const bytes = new Uint8Array(count * 4);
	const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
	for (let i = 0; i < count; i += 1) {
		const [r, g, b] = colorOf(i);
		bytes[i * 4] = Math.round(r * 255);
		bytes[i * 4 + 1] = Math.round(g * 255);
		bytes[i * 4 + 2] = Math.round(b * 255);
		bytes[i * 4 + 3] = a;
	}
	return bytes;
}

/**
 * Diameters as one float a geom, for a layer whose size channel binds a column.
 *
 * Four bytes a geom, which is 40 MB at ten million and the same order the picking ids cost. A layer
 * drawing at one diameter packs nothing and reads the uniform instead.
 */
export function packSizes(count: number, diameterOf: (index: number) => number): Float32Array {
	const sizes = new Float32Array(count);
	for (let i = 0; i < count; i += 1) sizes[i] = diameterOf(i);
	return sizes;
}

/**
 * A geom's address as a color, for reading the hit back out of a framebuffer.
 *
 * Zero is reserved for nothing-here, so the first geom is 1 and the readback subtracts it. Three
 * channels address about sixteen million geoms, which is past the client budget, and the fourth
 * carries full alpha so a cleared pixel and a geom at the edge cannot be confused.
 */
export function idToColor(index: number): [number, number, number, number] {
	const id = index + 1;
	return [(id >> 16) & 255, (id >> 8) & 255, id & 255, 255];
}

/** The geom a picking pixel names, or null where the pixel held no geom. */
export function colorToId(pixel: ArrayLike<number>): number | null {
	const id = ((pixel[0]! & 255) << 16) | ((pixel[1]! & 255) << 8) | (pixel[2]! & 255);
	return id === 0 ? null : id - 1;
}

/** Picking ids for a whole layer, in the same order as its positions. */
export function packIds(count: number): Uint8Array {
	const bytes = new Uint8Array(count * 4);
	for (let i = 0; i < count; i += 1) {
		const [r, g, b, a] = idToColor(i);
		bytes[i * 4] = r;
		bytes[i * 4 + 1] = g;
		bytes[i * 4 + 2] = b;
		bytes[i * 4 + 3] = a;
	}
	return bytes;
}

/** A rectangle in CSS pixels, as a chart's plot area reports itself. */
export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** Where a chart sits in the shared canvas, in the coordinates a scissor box takes. */
export interface Viewport {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * The whole plot area in device pixels, whether or not it fits on the canvas.
 *
 * This is what `gl.viewport` takes, and it has to be the full rectangle: the viewport is what maps
 * clip space onto pixels, so handing it a clipped box would squeeze the geoms into the visible part
 * and leave the axis pointing at the wrong ones. The vertical origin flips, since a DOM rectangle
 * counts down from the top and GL counts up from the bottom.
 */
export function viewportFor(chart: Rect, canvas: Rect, dpr = 1): Viewport {
	const bottom = chart.top - canvas.top + chart.height;
	return {
		x: Math.round((chart.left - canvas.left) * dpr),
		y: Math.round((canvas.height - bottom) * dpr),
		width: Math.round(chart.width * dpr),
		height: Math.round(chart.height * dpr),
	};
}

/**
 * The part of that area the frame is allowed to write, which is what `gl.scissor` takes.
 *
 * A chart hanging over an edge, or scrolled half out of view, draws the geoms that belong in the
 * visible part and nothing outside it. A chart scrolled clear of the canvas returns a zero-area
 * box, which the renderer reads as nothing to draw.
 */
export function scissorFor(chart: Rect, canvas: Rect, dpr = 1): Viewport {
	const left = Math.max(chart.left, canvas.left);
	const right = Math.min(chart.left + chart.width, canvas.left + canvas.width);
	const top = Math.max(chart.top, canvas.top);
	const bottom = Math.min(chart.top + chart.height, canvas.top + canvas.height);

	const width = Math.max(0, right - left);
	const height = Math.max(0, bottom - top);
	if (width === 0 || height === 0) return {x: 0, y: 0, width: 0, height: 0};

	return {
		x: Math.round((left - canvas.left) * dpr),
		y: Math.round((canvas.height - (bottom - canvas.top)) * dpr),
		width: Math.round(width * dpr),
		height: Math.round(height * dpr),
	};
}

/** What turns centered data offsets into clip space, as the shader's two uniforms. */
export interface Camera {
	/** Data units per pixel, x and y. */
	scale: [number, number];
	/** Where the layer's center sits inside the viewport, in pixels from its bottom left. */
	translate: [number, number];
}

/**
 * The camera that puts a data domain on a plot area of this size.
 *
 * The domain is the frame's, so the GPU and the axis read the same numbers. A zoom rewrites the
 * domain and the buffers stay where they are, which is what makes the GL path answer a zoom in one
 * frame instead of one upload.
 */
export function cameraFor(
	center: [number, number],
	xDomain: [number, number],
	yDomain: [number, number],
	width: number,
	height: number,
): Camera {
	const xSpan = xDomain[1] - xDomain[0] || 1;
	const ySpan = yDomain[1] - yDomain[0] || 1;
	return {
		scale: [width / xSpan, height / ySpan],
		translate: [((center[0] - xDomain[0]) / xSpan) * width, ((center[1] - yDomain[0]) / ySpan) * height],
	};
}

/** The end and side of each of a segment's six vertices. They form two triangles. */
const CORNERS: [end: 0 | 1, side: number][] = [
	[0, -1],
	[0, 1],
	[1, -1],
	[0, 1],
	[1, 1],
	[1, -1],
];

/** Packs segments into a layer's vertices. Each vertex has its far end and its corner. */
export function packSegments(segments: CubeSegment[]) {
	const count = segments.length * CORNERS.length;
	const [xs, ys, zs] = [new Float64Array(count), new Float64Array(count), new Float64Array(count)];
	segments.forEach((segment, index) => {
		CORNERS.forEach(([end], corner) => {
			const at = index * CORNERS.length + corner;
			[xs[at], ys[at], zs[at]] = segment[end];
		});
	});
	const positions = packPositions(xs, ys);
	const depth = packDepth(zs);

	const other = new Float32Array(count * 3);
	const corners = new Float32Array(count * 2);
	segments.forEach((segment, index) => {
		CORNERS.forEach(([end, side], corner) => {
			const at = index * CORNERS.length + corner;
			const [x, y, z] = segment[1 - end]!;
			other.set([x - positions.center[0], y - positions.center[1], z - depth.center], at * 3);
			corners.set([side, end], at * 2);
		});
	});
	return {positions, depth, other, corners};
}

/** Packs quads as two triangles each. A pane has no width. Its far ends and corners stay nought. */
export function packQuads(quads: CubeQuad[]) {
	const points = quads.flatMap(([a, b, c, d]) => [a, b, c, a, c, d]);
	return {
		positions: packPositions(
			points.map((point) => point[0]),
			points.map((point) => point[1]),
		),
		depth: packDepth(points.map((point) => point[2])),
		other: new Float32Array(points.length * 3),
		corners: new Float32Array(points.length * 2),
	};
}
