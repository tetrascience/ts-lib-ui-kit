/**
 * A kernel density over one measure, drawn as a curve in the main panel.
 *
 * The histogram's question with the count swapped for an estimate. A histogram states where the mass
 * is at the resolution of its bins and a density states the shape, and the shape is what a reader
 * compares between groups: three overlapping distributions read as three curves and as one muddle of
 * bars.
 *
 * Filled under the curve and stroked along it, for `DensityPanel`'s reason and `Area`'s. The fill is
 * what lets a reader see where two distributions overlap; the stroke is what keeps them separable
 * inside it, since a wash with no boundary stops being two things.
 *
 * The estimate is `kde` in `/core`, and the bandwidth it was smoothed at travels with it. Nothing
 * here can show that number and nothing here should: the curve is a shape and the footer is where
 * the figure says what it hides.
 */

import {useMemo} from "react";

import type {Density, Scale} from "../../core/internal.js";

export interface DensityCurveProps {
	/** The estimate, on the grid it was evaluated over. */
	curve: Density;
	x: Scale;
	y: Scale;
	color: string;
	/** Paint of the wash under the curve. Absent takes `color`. */
	fill?: string;
	/** Opacity of the wash under the curve. The stroke stays solid so the outline survives an overlap. */
	fillOpacity?: number;
	lineWidth?: number;
}

export function DensityCurve({
	curve,
	x,
	y,
	color,
	fill = color,
	fillOpacity = 0.22,
	lineWidth = 1.6,
}: DensityCurveProps) {
	const {outline, under} = useMemo(() => {
		let path = "";
		for (let at = 0; at < curve.grid.length; at += 1) {
			const px = x(curve.grid[at]!).toFixed(2);
			const py = y(curve.weight[at]!).toFixed(2);
			path += `${path ? "L" : "M"}${px},${py}`;
		}
		if (!path) return {outline: "", under: ""};

		/* Closed along the baseline, so the fill is the area under the curve instead of a smear. */
		const base = y(0).toFixed(2);
		const first = x(curve.grid[0]!).toFixed(2);
		const last = x(curve.grid[curve.grid.length - 1]!).toFixed(2);
		return {outline: path, under: `${path}L${last},${base}L${first},${base}Z`};
	}, [curve, x, y]);

	if (!outline) return null;

	return (
		<g data-geom="density">
			<path d={under} fill={fill} fillOpacity={fillOpacity} stroke="none" />
			<path
				d={outline}
				fill="none"
				stroke={color}
				strokeWidth={lineWidth}
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
		</g>
	);
}
