/**
 * The area geom: a line with the ground under it filled in.
 *
 * Same payload the line kind draws and the same two shapes of it: records along a value scale, or a
 * reduction per group along a band. What the fill adds is quantity, which is why `GRAMMAR` marks the
 * kind proportional and the frame grounds the vertical scale at zero for it. See rule 11 of
 * `CHART-DESIGN.md`: ink standing for a length has to start where the length does.
 *
 * The edge is stroked over the fill. A wash with no boundary reads as a region and not as a series,
 * and two of them overlaid are unreadable without one.
 */

import {useMemo} from "react";

import type {LinePoint, Scale} from "../../core/internal.js";

/** A reading of an area, with the height the fill closes on where one is stacked below it. */
export interface AreaPoint extends LinePoint {
	/**
	 * Where the fill closes. Absent closes on `baseline`.
	 *
	 * Set by a position adjustment: a stacked area stands on the running total of the ones before it,
	 * the way a stacked bar stands on a floor. Held on the reading instead of as a second array, so a
	 * point and the ground under it cannot come apart in the walk.
	 */
	floor?: number;
}

export interface AreaProps {
	/** In axis units, already ordered the way the series reads. */
	points: AreaPoint[];
	x: Scale;
	y: Scale;
	color: string;
	/** Value the fill closes on. Zero is what the proportional rule grounds the scale at. */
	baseline?: number;
	/** Paint on the edge. Absent takes `color`. */
	stroke?: string;
	lineWidth?: number;
	fillOpacity?: number;
	opacity?: number;
}

/** Fill weight of a lone area, and of a stacked one. Stacked bands abut and none covers another. */
const WASH = 0.22;
const STACKED_WASH = 0.85;

export function Area({
	points,
	x,
	y,
	color,
	baseline = 0,
	stroke = color,
	lineWidth = 1.5,
	fillOpacity,
	opacity = 1,
}: AreaProps) {
	const stacked = points.some((point) => point.floor != null);
	const wash = fillOpacity ?? (stacked ? STACKED_WASH : WASH);
	const {edge, ground} = useMemo(() => {
		let edge = "";
		/* Walked back to front, so the closing run reverses the outward one. */
		let under = "";
		for (const point of points) {
			const at = x(point.x).toFixed(2);
			edge += `${edge ? "L" : "M"}${at},${y(point.y).toFixed(2)}`;
			if (point.floor != null) under = `L${at},${y(point.floor).toFixed(2)}${under}`;
		}
		const first = points[0];
		const last = points[points.length - 1];
		if (!first || !last) return {edge, ground: ""};
		/*
      A stacked area closes on its own floors and a grounded one on a flat baseline.

      Two vertices are enough for the flat case, and a stack needs one per reading: the band below it
      has a shape, and closing on a straight line would fill over it.
    */
		if (under) return {edge, ground: `${edge}${under}Z`};
		const floor = y(baseline).toFixed(2);
		return {edge, ground: `${edge}L${x(last.x).toFixed(2)},${floor}L${x(first.x).toFixed(2)},${floor}Z`};
	}, [points, x, y, baseline]);

	if (points.length < 2) return null;

	return (
		<g>
			<path d={ground} fill={color} fillOpacity={wash * opacity} stroke="none" />
			<path
				d={edge}
				fill="none"
				stroke={stroke}
				strokeWidth={lineWidth}
				strokeOpacity={opacity}
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
		</g>
	);
}
