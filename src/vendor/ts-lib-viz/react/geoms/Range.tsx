/**
 * Range: an interval per reading, drawn as one of ggplot's four glyphs.
 *
 * `Interval` closes one region over its readings, which is right for a fit and wrong for a handful
 * of doses somebody measured apart. This draws a mark per reading, so a single dose with an interval
 * is a figure and two readings are not joined into an envelope nobody measured.
 *
 * The four glyphs differ in what sits between the bounds and in nothing else. Each is a kind, as in
 * ggplot. `errorbar` caps both ends, `linerange` runs bare, `pointrange` marks the estimate on the
 * run, and `crossbar` draws a box with the estimate across it.
 *
 * The estimate is the reading the interval is around, so the two glyphs that mark it draw it last
 * and over the run. A reading with no estimate bound draws the run alone whichever glyph was asked
 * for, since there is nothing to mark.
 */

import type {IntervalPoint, Scale} from "../../core/internal.js";

/** How wide a cap or a box runs, in pixels. */
const REACH = 10;

/** Radius of the dot a pointrange marks its estimate with. */
const DOT = 3;

export interface RangeProps {
	points: IntervalPoint[];
	x: Scale;
	y: Scale;
	color: string;
	/** Interior of a crossbar's box. Absent takes `color` at a low opacity. */
	fill?: string;
	/** Which glyph draws between the bounds. The estimate is marked by two of the four. */
	glyph?: "errorbar" | "linerange" | "pointrange" | "crossbar";
	/** Width of a cap or a box, in pixels. */
	thickness?: number;
	opacity?: number;
	lineWidth?: number;
}

export function Range({
	points,
	x,
	y,
	color,
	fill,
	glyph = "pointrange",
	thickness = REACH,
	opacity = 1,
	lineWidth = 1.4,
}: RangeProps) {
	if (points.length === 0) return null;

	const half = Math.max(1, thickness / 2);
	const capped = glyph === "errorbar";
	const boxed = glyph === "crossbar";
	const marked = glyph === "pointrange";

	return (
		<g data-geom="range" stroke={color} strokeOpacity={opacity} strokeWidth={lineWidth} fill="none">
			{points.map((reading) => {
				const at = x(reading.x);
				const lo = y(reading.lo);
				const hi = y(reading.hi);
				const mid = reading.mid == null ? null : y(reading.mid);

				return (
					<g key={`${reading.x}`} data-geom="range-mark">
						{boxed ? (
							<rect
								x={at - half}
								y={Math.min(lo, hi)}
								width={half * 2}
								height={Math.abs(lo - hi)}
								fill={fill ?? color}
								fillOpacity={fill ? opacity : opacity * 0.18}
							/>
						) : (
							<line x1={at} x2={at} y1={lo} y2={hi} strokeLinecap="round" />
						)}

						{/* Both ends stated, which is what tells an error bar from a bare run. */}
						{capped && (
							<>
								<line x1={at - half} x2={at + half} y1={lo} y2={lo} strokeLinecap="round" />
								<line x1={at - half} x2={at + half} y1={hi} y2={hi} strokeLinecap="round" />
							</>
						)}

						{mid != null && marked && (
							<circle cx={at} cy={mid} r={DOT} fill={color} fillOpacity={opacity} stroke="none" />
						)}
						{mid != null && boxed && (
							<line x1={at - half} x2={at + half} y1={mid} y2={mid} strokeWidth={lineWidth * 1.6} />
						)}
					</g>
				);
			})}
		</g>
	);
}
