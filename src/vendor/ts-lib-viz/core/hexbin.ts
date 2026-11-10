/**
 * Binning a cloud into cells, on either tiling.
 *
 * The geom above 50,000 records. A hexagon has six neighbors at one distance. A square
 * cross-references against the two axes.
 */

import {latticeEdges, type Bin2dOptions} from "./binning.js";

export interface Bin {
	key: string;
	/** Center in pixel space. */
	cx: number;
	cy: number;
	count: number;
	/** Mean of the weight channel, when one is supplied. */
	mean?: number;
}

/**
 * A cell lattice in pixel space, resolved from stated bin parameters.
 *
 * With no lattice handed over, both binners anchor at the pixel origin and size off the geom's
 * radius.
 */
export interface Lattice {
	/** Cell width in pixels. */
	width: number;
	/** Cell height in pixels. Square unless stated. */
	height?: number;
	/** Pixel the first edge sits at, across and down. */
	origin?: readonly [number, number];
	/** Which end of a cell takes a reading on its edge. The high end unless stated. */
	closed?: "right" | "left";
	/**
	 * Cells across and down, where the caller resolved the lattice's extent.
	 *
	 * A reading on the outer edge joins the cell beside it. R's `cut` calls this `include.lowest`.
	 */
	cells?: readonly [number, number];
	/**
	 * Draws each cell of that extent and a count of zero sits at the bottom of the ramp.
	 *
	 * ggplot's `drop = FALSE`. Absent returns the occupied cells alone.
	 */
	whole?: boolean;
}

export interface BinPoint {
	x: number;
	y: number;
	weight?: number;
}

const THIRD_PI = Math.PI / 3;
const ANGLES = [0, THIRD_PI, 2 * THIRD_PI, 3 * THIRD_PI, 4 * THIRD_PI, 5 * THIRD_PI];

/** Pixels across one hexagon. `rectbin` takes this width for a cell of about one area. */
const HEX_WIDTH = 2 * Math.sin(THIRD_PI);

/**
 * A pixel lattice off stated bin parameters.
 *
 * Projecting the first two edges gives the size and anchor in pixels. A vertical scale anchors at
 * the smaller pixel.
 */
export function latticeFor(
	xRange: readonly [number, number],
	yRange: readonly [number, number],
	scales: {x: (value: number) => number; y: (value: number) => number},
	options: Bin2dOptions,
): Lattice | null {
	const across = latticeEdges(xRange, options, 0);
	const down = latticeEdges(yRange, options, 1);
	if (!across || !down) return null;

	const width = Math.abs(scales.x(across.breaks[1]!) - scales.x(across.breaks[0]!));
	const height = Math.abs(scales.y(down.breaks[1]!) - scales.y(down.breaks[0]!));
	if (!(width > 0) || !(height > 0)) return null;

	const top = Math.min(scales.y(down.breaks[0]!), scales.y(down.breaks.at(-1)!));
	return {
		width,
		height,
		origin: [scales.x(across.breaks[0]!), top],
		/* The high end of a cell. `stat_bin_2d` closes the same end by default. */
		closed: options.closed ?? "right",
		cells: [across.breaks.length - 1, down.breaks.length - 1],
		...(options.drop === false ? {whole: true} : {}),
	};
}

/** The radius a hexagon takes to sit on a lattice of this width. */
export const hexRadiusFor = (lattice: Lattice): number => lattice.width / HEX_WIDTH;

/** The hexagon outline, centered on the origin. */
export function hexPath(radius: number): string {
	return (
		ANGLES.map((a) => {
			const x = Math.sin(a) * radius;
			const y = -Math.cos(a) * radius;
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		}).join("L") + "Z"
	).replace(/^/, "M");
}

/**
 * Bins points already projected into pixel space.
 *
 * Binning after projection keeps the hexagons regular on screen. Binning in data space would
 * skew them on a log axis.
 */
export function hexbin(points: BinPoint[], radius: number, origin: readonly [number, number] = [0, 0]): Bin[] {
	const dx = radius * 2 * Math.sin(THIRD_PI);
	const dy = radius * 1.5;
	const bins = new Map<string, Bin & {sum: number; weighted: number}>();

	for (const stated of points) {
		/* The lattice anchors on the origin. A stated boundary lands where the author put it. */
		const point = {x: stated.x - origin[0], y: stated.y - origin[1], weight: stated.weight};
		const py = point.y / dy;
		let pj = Math.round(py);
		const px = point.x / dx - (pj & 1 ? 0.5 : 0);
		let pi = Math.round(px);
		const py1 = py - pj;

		if (Math.abs(py1) * 3 > 1) {
			const px1 = px - pi;
			const pi2 = pi + (px < pi ? -1 : 1) / 2;
			const pj2 = pj + (py < pj ? -1 : 1);
			const px2 = px - pi2;
			const py2 = py - pj2;
			if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
				pi = pi2 + (pj & 1 ? 1 : -1) / 2;
				pj = pj2;
			}
		}

		const key = `${pi},${pj}`;
		const existing = bins.get(key);
		if (existing) {
			existing.count += 1;
			if (point.weight != null) {
				existing.sum += point.weight;
				existing.weighted += 1;
			}
		} else {
			bins.set(key, {
				key,
				cx: (pi + (pj & 1 ? 0.5 : 0)) * dx + origin[0],
				cy: pj * dy + origin[1],
				count: 1,
				sum: point.weight ?? 0,
				weighted: point.weight != null ? 1 : 0,
			});
		}
	}

	return [...bins.values()].map(({sum, weighted, ...bin}) => ({
		...bin,
		mean: weighted > 0 ? sum / weighted : undefined,
	}));
}

/**
 * The cell outline, centered on the origin.
 *
 * Square where the height goes unstated. A stated width per axis makes a cell one interval of x
 * by one of y.
 */
export function rectPath(size: number, height = size): string {
	const halfWide = (size / 2).toFixed(2);
	const halfTall = (height / 2).toFixed(2);
	const across = size.toFixed(2);
	const down = height.toFixed(2);
	return `M-${halfWide},-${halfTall}h${across}v${down}h-${across}Z`;
}

/**
 * Bins points already projected into pixel space, onto a square lattice.
 *
 * `Math.floor` over `Math.round`. A cell covers one half-open interval on each axis and the
 * center falls in its middle.
 */
export function rectbin(points: BinPoint[], size: number | Lattice): Bin[] {
	const lattice: Lattice = typeof size === "number" ? {width: size} : size;
	const across = lattice.width || 1;
	const down = lattice.height || across;
	const [ox, oy] = lattice.origin ?? [0, 0];

	/* The closed end decides which cell a reading on an edge joins. */
	const cellOf = (value: number, edge: number, count: number | undefined) => {
		const cell = lattice.closed === "right" ? Math.ceil(value / edge) - 1 : Math.floor(value / edge);
		// Clamped to the lattice. A reading on the outer edge joins the cell beside it.
		return count == null ? cell : Math.min(Math.max(cell, 0), count - 1);
	};

	const bins = new Map<string, Bin & {sum: number; weighted: number}>();
	const cell = (column: number, row: number) => ({
		key: `${column},${row}`,
		cx: (column + 0.5) * across + ox,
		cy: (row + 0.5) * down + oy,
		count: 0,
		sum: 0,
		weighted: 0,
	});

	if (lattice.whole && lattice.cells) {
		for (let column = 0; column < lattice.cells[0]; column += 1) {
			for (let row = 0; row < lattice.cells[1]; row += 1) {
				const held = cell(column, row);
				bins.set(held.key, held);
			}
		}
	}

	for (const point of points) {
		const column = cellOf(point.x - ox, across, lattice.cells?.[0]);
		const row = cellOf(point.y - oy, down, lattice.cells?.[1]);
		const key = `${column},${row}`;
		let held = bins.get(key);
		if (!held) {
			held = cell(column, row);
			bins.set(key, held);
		}
		held.count += 1;
		if (point.weight != null) {
			held.sum += point.weight;
			held.weighted += 1;
		}
	}

	return [...bins.values()].map(({sum, weighted, ...bin}) => ({
		...bin,
		mean: weighted > 0 ? sum / weighted : undefined,
	}));
}
