/**
 * The band geom: two bound columns filled between, with the estimate drawn over it where there is one.
 *
 * The other half of the confidence band. `FitCurve` already fills between `Fit.band`'s two arrays,
 * which answers the fitted case; this answers the case where the analysis ran somewhere else and
 * the author is holding the bounds as columns.
 *
 * `GRAMMAR` marks the kind unproportional, so the vertical scale is not grounded at zero. A band
 * around a ratio of 1.0 is an interval and not a length, and grounding it would spend the axis on
 * space the data does not occupy. See rule 11 of `CHART-DESIGN.md` for the reading that makes bars
 * and areas the other answer.
 *
 * The fill runs at `FitCurve`'s own opacity, since a reader meeting a fitted band and a bound one in
 * one figure should not have to work out whether the difference in wash means something.
 */

import {useMemo} from "react";

import type {IntervalPoint, Scale} from "../../core/internal.js";

/** Matches `FitCurve`, so the two kinds of band read as one thing. */
const BAND_OPACITY = 0.13;

export interface IntervalProps {
	/** In axis units, ordered along x the way the band is read. */
	points: IntervalPoint[];
	x: Scale;
	y: Scale;
	color: string;
	/** Paint on the band's two bounds. Absent draws the band unbounded. */
	stroke?: string;
	lineWidth?: number;
	opacity?: number;
}

export function Interval({points, x, y, color, stroke, lineWidth = 1.5, opacity = 1}: IntervalProps) {
	const {band, estimate} = useMemo(() => {
		/* Forward along the high bound and back along the low one, which closes the region in one path. */
		let top = "";
		let bottom = "";
		let estimate = "";
		for (const reading of points) {
			const at = x(reading.x).toFixed(2);
			top += `${top ? "L" : "M"}${at},${y(reading.hi).toFixed(2)}`;
			bottom = `L${at},${y(reading.lo).toFixed(2)}${bottom}`;
			if (reading.mid != null) {
				estimate += `${estimate ? "L" : "M"}${at},${y(reading.mid).toFixed(2)}`;
			}
		}
		return {band: top ? `${top}${bottom}Z` : "", estimate};
	}, [points, x, y]);

	if (points.length < 2) return null;

	return (
		<g>
			<path
				d={band}
				fill={color}
				fillOpacity={BAND_OPACITY * opacity}
				stroke={stroke ?? "none"}
				{...(stroke ? {strokeWidth: lineWidth, strokeOpacity: opacity} : {})}
			/>
			{estimate && (
				<path
					d={estimate}
					fill="none"
					stroke={color}
					strokeWidth={lineWidth}
					strokeOpacity={opacity}
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
			)}
		</g>
	);
}
