/**
 * Nearest-geom lookup for hover.
 *
 * A scatter at 15,000 records has no listener per geom. Geoms are indexed in pixel space and the
 * frame asks one question per pointer move.
 */

import {quadtree} from "d3-quadtree";

import type {PointShape} from "./geom-types.js";

export interface PlotPoint {
	/**
	 * Position on a value scale. Where `category` is set this is the band's index.
	 *
	 * Numeric for the fits, the hexbin lattice, the label rules and the quadtree.
	 */
	x: number;
	/** Category for this geom, where the axis runs bands. Absent reads `x`. */
	category?: string;
	y: number;
	/** Record this geom stands for. Absent where the points have no identity. */
	key?: string;
	/** Value behind a size or color channel. */
	weight?: number;
	/** Position on a third scale, where the geom draws in a cube. */
	z?: number;
	/**
	 * Radius in pixels, where the size channel is bound.
	 *
	 * Resolved in `buildLayers`. Both renderers draw one diameter from one scale. Absent draws at
	 * the layer's own radius.
	 */
	size?: number;
	/**
	 * Glyph this geom draws, where the shape channel is bound.
	 *
	 * Resolved in `buildLayers` beside the radius. A value keeps its level across a facet. Absent
	 * draws the layer's own glyph.
	 */
	shape?: PointShape;
	/**
	 * Opacity this geom draws at, where the opacity channel is bound.
	 *
	 * Resolved in `buildLayers`. Absent draws at the layer's own opacity.
	 */
	opacity?: number;
	/**
	 * Offset the geom is drawn at, in the axes' own units.
	 *
	 * ggplot's `geom_jitter`. The offset moves the geom and its hit target. A hover answers with
	 * the recorded value.
	 */
	dx?: number;
	dy?: number;
}

/** A point projected to pixels, with the datum it came from. */
export interface Placed {
	x: number;
	y: number;
	point: PlotPoint;
	/** Position in the input. A caller reaches parallel arrays with it. */
	index: number;
}

/** The one question a hover asks of the placed geoms: the closest within a radius of a pixel. */
export interface HitIndex {
	find(x: number, y: number, radius?: number): Placed | undefined;
}

/** Pointer distance that still counts as landing on a geom. */
export const SNAP_RADIUS = 16;

export function placePoints(
	points: PlotPoint[],
	x: (value: number | string) => number,
	y: (value: number | string) => number,
	{
		transposed = false,
		step = 0,
	}: {
		/** Whether the pair of scales is flipped, as the band geoms take it. */
		transposed?: boolean;
		/** Pixels per data unit along the band a category reads on. A jitter's offset there reads in it. */
		step?: number;
	} = {},
): Placed[] {
	const placed: Placed[] = [];
	for (let index = 0; index < points.length; index += 1) {
		const point = points[index]!;
		/* The nudge a jitter asked for, added at projection. The geom and its hit target move
		   together and `point` keeps the reading. */
		/* The reading bound to X goes up the side once the pair is turned. The band is read by name, and its offset in steps. */
		const along = point.category ?? point.x + (point.dx ?? 0);
		const shift = point.category == null ? 0 : (point.dx ?? 0) * step;
		const up = point.y + (point.dy ?? 0);
		const px = transposed ? x(up) : x(along) + shift;
		const py = transposed ? y(along) + shift : y(up);
		// A projected NaN poisons the tree's bounds and takes the whole index down with it.
		if (Number.isFinite(px) && Number.isFinite(py)) placed.push({x: px, y: py, point, index});
	}
	return placed;
}

export function buildIndex(placed: Placed[]): HitIndex {
	return quadtree<Placed>()
		.x((d) => d.x)
		.y((d) => d.y)
		.addAll(placed);
}

/** The closest geom within the snap radius, or nothing where the pointer is over empty ground. */
export function nearest(index: HitIndex, x: number, y: number, radius = SNAP_RADIUS): Placed | null {
	return index.find(x, y, radius) ?? null;
}
