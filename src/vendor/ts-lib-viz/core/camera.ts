/**
 * The camera a cube is read through.
 *
 * The floor is the x-y plane and z draws upward. The model normalizes each domain onto -1 to 1.
 */

import {scaleLinear} from "d3-scale";

/** Where the reader is standing, in spherical coordinates about the cube's center. */
export interface Orbit {
	/** Turn about the vertical axis, in radians. */
	azimuth: number;
	/** Height above the floor plane, in radians. */
	elevation: number;
	/** Distance from the center, in cube half-widths. */
	distance: number;
}

/**
 * Where a cube opens.
 *
 * Turned off the axes and tilted above the floor, which shows three scales at once. Straight
 * down an axis draws two of the three edge-on.
 */
export const AT_REST_ORBIT: Orbit = {azimuth: 0.7, elevation: 0.42, distance: 4.7};

/**
 * How close to the poles a tilt may come.
 *
 * At the pole the up vector and the view direction are parallel and the view frame collapses.
 */
const ELEVATION_LIMIT = Math.PI / 2 - 0.05;

const DISTANCE_RANGE: [number, number] = [2, 16];

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

/** Radians of turn a pixel of drag is worth. A half turn is that many pixels. */
const DRAG_RADIANS = 0.008;

/** The orbit after a drag, in pixels, with the tilt held clear of the poles. */
export const orbited = (orbit: Orbit, dx: number, dy: number): Orbit => ({
	azimuth: orbit.azimuth - dx * DRAG_RADIANS,
	elevation: clamp(orbit.elevation + dy * DRAG_RADIANS, -ELEVATION_LIMIT, ELEVATION_LIMIT),
	distance: orbit.distance,
});

/**
 * The orbit after a wheel notch.
 *
 * Multiplicative, and a notch moves the same proportion of the way in at any distance.
 */
export const dollied = (orbit: Orbit, notches: number): Orbit => ({
	...orbit,
	distance: clamp(orbit.distance * Math.exp(notches * 0.12), DISTANCE_RANGE[0], DISTANCE_RANGE[1]),
});

/** Whether the reader has moved. A cube at rest draws what it always drew. */
export const isOrbited = (orbit: Orbit): boolean =>
	orbit.azimuth !== AT_REST_ORBIT.azimuth ||
	orbit.elevation !== AT_REST_ORBIT.elevation ||
	orbit.distance !== AT_REST_ORBIT.distance;

/** Column-major. `uniformMatrix4fv` reads this order without transposing. */
type Mat4 = Float32Array;

function multiply(a: Mat4, b: Mat4): Mat4 {
	const out = new Float32Array(16);
	for (let col = 0; col < 4; col += 1) {
		for (let row = 0; row < 4; row += 1) {
			let sum = 0;
			for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row]! * b[col * 4 + k]!;
			out[col * 4 + row] = sum;
		}
	}
	return out;
}

/**
 * A perspective projection.
 *
 * Geoms grow as they approach and the reader recovers the near-far ordering from a turn. An
 * orthographic cube turns without saying which face is nearer.
 */
function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
	const f = 1 / Math.tan(fovy / 2);
	const out = new Float32Array(16);
	out[0] = f / aspect;
	out[5] = f;
	out[10] = (far + near) / (near - far);
	out[11] = -1;
	out[14] = (2 * far * near) / (near - far);
	return out;
}

/** The view from an eye onto the origin, with the world's up vector as the frame's third axis. */
function lookAt(eye: [number, number, number]): Mat4 {
	const [ex, ey, ez] = eye;
	const length = Math.hypot(ex, ey, ez) || 1;
	const zx = ex / length;
	const zy = ey / length;
	const zz = ez / length;

	// Right is up crossed into the view direction, with up as +y in world space.
	let xx = zz;
	let xy = 0;
	let xz = -zx;
	const across = Math.hypot(xx, xy, xz) || 1;
	xx /= across;
	xy /= across;
	xz /= across;

	const yx = zy * xz - zz * xy;
	const yy = zz * xx - zx * xz;
	const yz = zx * xy - zy * xx;

	const out = new Float32Array(16);
	out[0] = xx;
	out[4] = xy;
	out[8] = xz;
	out[1] = yx;
	out[5] = yy;
	out[9] = yz;
	out[2] = zx;
	out[6] = zy;
	out[10] = zz;
	out[12] = -(xx * ex + xy * ey + xz * ez);
	out[13] = -(yx * ex + yy * ey + yz * ez);
	out[14] = -(zx * ex + zy * ey + zz * ez);
	out[15] = 1;
	return out;
}

/** Where the eye falls for an orbit, in world space. */
export function eyeOf(orbit: Orbit): [number, number, number] {
	const {azimuth, elevation, distance} = orbit;
	const flat = Math.cos(elevation) * distance;
	return [flat * Math.sin(azimuth), Math.sin(elevation) * distance, flat * Math.cos(azimuth)];
}

/** The three domains a cube spans, in the data's own units. */
export interface CubeDomains {
	x: [number, number];
	y: [number, number];
	z: [number, number];
}

/**
 * The model matrix -- data offsets onto the unit cube, with z drawing upward.
 *
 * A float32 spends its digits on a timestamp. The center is the number the CPU keeps.
 */
export function cubeModel(domains: CubeDomains, center: [number, number, number]): Mat4 {
	const span = (range: [number, number]) => range[1] - range[0] || 1;
	const scale = (range: [number, number]) => 2 / span(range);
	const bias = (range: [number, number], mid: number) => (2 * (mid - range[0])) / span(range) - 1;

	const out = new Float32Array(16);
	// Column 0 sends data x to world x, column 1 sends data y to world z, column 2 sends data z up.
	out[0] = scale(domains.x);
	out[6] = scale(domains.y);
	out[9] = scale(domains.z);
	out[12] = bias(domains.x, center[0]);
	out[13] = bias(domains.z, center[2]);
	out[14] = bias(domains.y, center[1]);
	out[15] = 1;
	return out;
}

/** How much of the view the cube fills. This sets the projection's field of view. */
const FIELD_OF_VIEW = Math.PI / 4;

const NEAR = 0.1;
const FAR = 100;

/**
 * The one matrix the cube program takes.
 *
 * Model, view and projection multiplied on the CPU. The product changes once a frame.
 */
export function cubeMatrix(
	orbit: Orbit,
	aspect: number,
	domains: CubeDomains,
	center: [number, number, number],
): Float32Array {
	return multiply(
		multiply(perspective(FIELD_OF_VIEW, aspect || 1, NEAR, FAR), lookAt(eyeOf(orbit))),
		cubeModel(domains, center),
	);
}

/** A data point after the matrix, in the pixels of a plot area of a stated size. */
export interface Projected {
	x: number;
	y: number;
	/** View depth. A caller tells a near edge from a far one. */
	depth: number;
}

/** Where a data point lands, for the chrome the CPU draws around what the GPU drew. */
export function projectData(
	matrix: Float32Array,
	point: [number, number, number],
	center: [number, number, number],
	width: number,
	height: number,
): Projected {
	const dx = point[0] - center[0];
	const dy = point[1] - center[1];
	const dz = point[2] - center[2];
	const out = [0, 0, 0, 0];
	for (let row = 0; row < 4; row += 1) {
		out[row] = matrix[row]! * dx + matrix[4 + row]! * dy + matrix[8 + row]! * dz + matrix[12 + row]!;
	}
	const w = out[3]! || 1e-6;
	return {
		x: (out[0]! / w / 2 + 0.5) * width,
		y: (0.5 - out[1]! / w / 2) * height,
		depth: w,
	};
}

/** One of the box's twelve edges, in pixels, with how far away it runs. */
export interface CubeEdge {
	from: Projected;
	to: Projected;
	/** Mean view depth. The edges behind the geoms draw apart from the ones in front. */
	depth: number;
	/** Whether the edge joins two back walls. The GPU draws a back edge, under the geoms. */
	back: boolean;
}

/** A segment between two data points, drawn under the camera. */
export type CubeSegment = [[number, number, number], [number, number, number]];

/** Four data points around a face of the box, in order. */
export type CubeQuad = [
	[number, number, number],
	[number, number, number],
	[number, number, number],
	[number, number, number],
];

/** An axis of the box: the edge it is written along, and the values it names. */
export interface CubeAxis {
	axis: "x" | "y" | "z";
	from: Projected;
	to: Projected;
	ticks: {at: Projected; value: number}[];
}

export interface CubeChrome {
	edges: CubeEdge[];
	axes: CubeAxis[];
	/** Grid lines on the three back walls -- the walls furthest from the camera. */
	grid: CubeEdge[];
	/**
	 * The grid, back edges and back faces in data units, for the GPU.
	 *
	 * A pane is keyed by the axis it crosses. The `z` pane is the floor.
	 */
	walls: {grid: CubeSegment[]; edges: CubeSegment[]; panes: Record<"x" | "y" | "z", CubeQuad>};
	/** Where the middle of the box lands. A label pushes away from it to clear the geoms. */
	middle: Projected;
}

const CORNERS: [number, number, number][] = [
	[0, 0, 0],
	[1, 0, 0],
	[0, 1, 0],
	[1, 1, 0],
	[0, 0, 1],
	[1, 0, 1],
	[0, 1, 1],
	[1, 1, 1],
];

/** Pairs of corners one step apart. A wider pair would be a diagonal. */
const EDGES: [number, number][] = [];
for (let a = 0; a < CORNERS.length; a += 1) {
	for (let b = a + 1; b < CORNERS.length; b += 1) {
		const steps = CORNERS[a]!.reduce((count, value, axis) => count + (value === CORNERS[b]![axis] ? 0 : 1), 0);
		if (steps === 1) EDGES.push([a, b]);
	}
}

/** Target break count per axis. d3 may return a few more or fewer to land on round values. */
const TICKS = 5;

/**
 * The box the geoms draw in, projected.
 *
 * Two of the three scales are foreshortened and a rule draws in projection. The axis edge is the
 * one furthest from the reader.
 */
export function cubeChrome(
	matrix: Float32Array,
	domains: CubeDomains,
	center: [number, number, number],
	width: number,
	height: number,
): CubeChrome {
	const axisRange = {x: domains.x, y: domains.y, z: domains.z};
	const cornerAt = (corner: [number, number, number]) =>
		projectData(
			matrix,
			[axisRange.x[corner[0]]!, axisRange.y[corner[1]]!, axisRange.z[corner[2]]!],
			center,
			width,
			height,
		);

	const middle = projectData(matrix, center, center, width, height);
	const project = (point: [number, number, number]) => projectData(matrix, point, center, width, height);

	const ranges = [axisRange.x, axisRange.y, axisRange.z];
	const values = ranges.map((range) => scaleLinear().domain(range).ticks(TICKS));

	/* The back wall's end of each axis, read off the view depth of the two opposite face centers. */
	const backEnd = ranges.map((range, wall) => {
		const ends = range.map((end) => {
			const point: [number, number, number] = [...center];
			point[wall] = end;
			return project(point).depth;
		});
		return ends[0]! > ends[1]! ? 0 : 1;
	});
	const backCorner = CORNERS.findIndex((corner) => corner.every((end, axis) => end === backEnd[axis]));
	const touchesBack = ([a, b]: [number, number]) => a === backCorner || b === backCorner;

	const placed = CORNERS.map(cornerAt);
	const edges: CubeEdge[] = EDGES.map(([a, b]) => ({
		from: placed[a]!,
		to: placed[b]!,
		depth: (placed[a]!.depth + placed[b]!.depth) / 2,
		back: touchesBack([a, b]),
	}));
	const dataCorner = (index: number): [number, number, number] =>
		CORNERS[index]!.map((end, axis) => ranges[axis]![end]!) as [number, number, number];
	const backEdges = EDGES.filter(touchesBack).map(([a, b]): CubeSegment => [dataCorner(a), dataCorner(b)]);

	/* Draws grid lines on each axis's back wall, at the breaks of the other two axes. */
	const grid: CubeEdge[] = [];
	const gridSegments: CubeSegment[] = [];
	for (let wall = 0; wall < 3; wall += 1) {
		const at = ranges[wall]![backEnd[wall]!]!;
		for (const across of [0, 1, 2].filter((axis) => axis !== wall)) {
			const along = 3 - wall - across;
			const [lo, hi] = ranges[across]!;
			for (const value of values[across]!.filter((tick) => tick > lo && tick < hi)) {
				const from: [number, number, number] = [0, 0, 0];
				from[wall] = at;
				from[across] = value;
				from[along] = ranges[along]![0];
				const to: [number, number, number] = [...from];
				to[along] = ranges[along]![1];
				const [start, end] = [project(from), project(to)];
				grid.push({from: start, to: end, depth: (start.depth + end.depth) / 2, back: true});
				gridSegments.push([from, to]);
			}
		}
	}

	const axes: CubeAxis[] = (["x", "y", "z"] as const).map((axis, index) => {
		const along = EDGES.filter(([a, b]) => CORNERS[a]![index] !== CORNERS[b]![index]);
		/*
      The edge to write along is furthest from the middle of the box on the page. A label on the
      vertical scale's far edge would land in the cloud.
    */
		const outermost = along
			.map(([a, b]) => {
				const mx = (placed[a]!.x + placed[b]!.x) / 2 - middle.x;
				const my = (placed[a]!.y + placed[b]!.y) / 2 - middle.y;
				return {a, b, reach: Math.hypot(mx, my)};
			})
			.sort((one, other) => other.reach - one.reach)[0]!;

		const low = CORNERS[outermost.a]![index] === 0 ? outermost.a : outermost.b;
		const high = low === outermost.a ? outermost.b : outermost.a;
		const corner = CORNERS[low]!;

		const ticks = values[index]!.map((value) => {
			const point: [number, number, number] = [
				axisRange.x[corner[0]]!,
				axisRange.y[corner[1]]!,
				axisRange.z[corner[2]]!,
			];
			point[index] = value;
			return {at: projectData(matrix, point, center, width, height), value};
		});

		return {axis, from: placed[low]!, to: placed[high]!, ticks};
	});

	/* Each back face, corner to corner across the two axes it spans. */
	const pane = (wall: number): CubeQuad => {
		const [a, b] = [0, 1, 2].filter((axis) => axis !== wall) as [number, number];
		const corner = (atA: 0 | 1, atB: 0 | 1): [number, number, number] => {
			const point: [number, number, number] = [0, 0, 0];
			point[wall] = ranges[wall]![backEnd[wall]!]!;
			point[a] = ranges[a]![atA]!;
			point[b] = ranges[b]![atB]!;
			return point;
		};
		return [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)];
	};
	const panes = {x: pane(0), y: pane(1), z: pane(2)};

	return {edges, axes, grid, walls: {grid: gridSegments, edges: backEdges, panes}, middle};
}

/**
 * What turns a normal in the data's axes into one in the light's world.
 *
 * The inverse transpose of a diagonal map is the reciprocal of its diagonal.
 */
export function normalMatrix(domains: CubeDomains): Float32Array {
	const span = (range: [number, number]) => (range[1] - range[0] || 1) / 2;
	const out = new Float32Array(9);
	// Column-major, with the same axis swap the model makes: data y draws into world z, data z up.
	out[0] = span(domains.x);
	out[5] = span(domains.y);
	out[7] = span(domains.z);
	return out;
}

/**
 * Where the light stands, in world space.
 *
 * Fixed to the world. Turning the figure moves the light across it.
 */
export const CUBE_LIGHT: readonly [number, number, number] = [0.4, 0.85, 0.35];

/** How much of a face's color survives with no light on it. A shadowed slope stays readable. */
export const AMBIENT = 0.45;

/**
 * The view depth at which a geom draws the diameter its caller asked for.
 *
 * The shader divides this by the vertex view depth. A geom mid-cube draws its given size.
 */
export const restingDepth = (orbit: Orbit): number => orbit.distance;
