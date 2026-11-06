/**
 * The segment geom: one straight run per reading, from where it started to where it finished.
 *
 * The pair the author already holds. A before-and-after reading and a drift vector are the same
 * geometry: two coordinates per row, with the travel between them drawn once. Nothing runs between
 * one reading and the next, which is what tells this apart from the line beside it, and it is why
 * the build hands the segments over unordered.
 *
 * A `line` element per segment instead of one path with a move before each run. Each segment is a
 * geom a reader points at, so it gets an element of its own, and a hover or a click has something
 * to land on when either arrives.
 *
 * `GRAMMAR` marks the kind unproportional, so the vertical scale is not grounded at zero. The
 * length of a segment is a displacement between two readings and not a magnitude measured up from
 * nothing. See rule 11 of `CHART-DESIGN.md` for the reading that makes bars and areas the other
 * answer.
 */

import type {Scale, SegmentPoint} from "../../core/internal.js";

export interface SegmentProps {
	/** In axis units. Unordered, since each segment draws on its own. */
	points: SegmentPoint[];
	x: Scale;
	y: Scale;
	color: string;
	lineWidth?: number;
	opacity?: number;
	/** Whether each run carries a head at the end it finishes on. Drawn unless refused. */
	arrow?: boolean;
	/** Whether the pair of scales is drawn the other way round, the way the band geoms take it. */
	transposed?: boolean;
}

/** Head length in pixels, off the stroke, with a floor so a hairline still points somewhere. */
const headLength = (lineWidth: number) => Math.max(5, lineWidth * 3.5);

/**
 * The three corners of a head sitting on the end of a run.
 *
 * Along the run and not at a fixed angle, so the head says the direction the reading took. Null
 * where the two ends resolve to the same pixel: a segment that finishes where it started states no
 * direction, and a head drawn on it would point whichever way the arithmetic fell.
 */
function head(x1: number, y1: number, x2: number, y2: number, lineWidth: number): string | null {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const run = Math.hypot(dx, dy);
	if (run < 0.5) return null;

	const long = Math.min(headLength(lineWidth), run);
	const alongX = (dx / run) * long;
	const alongY = (dy / run) * long;
	/* Half the head's width, across the run. */
	const acrossX = (-dy / run) * long * 0.42;
	const acrossY = (dx / run) * long * 0.42;
	const baseX = x2 - alongX;
	const baseY = y2 - alongY;

	return `M${x2.toFixed(2)},${y2.toFixed(2)}L${(baseX + acrossX).toFixed(2)},${(baseY + acrossY).toFixed(2)}L${(baseX - acrossX).toFixed(2)},${(baseY - acrossY).toFixed(2)}Z`;
}

export function Segment({
	points,
	x,
	y,
	color,
	lineWidth = 1.5,
	opacity = 1,
	arrow = true,
	transposed = false,
}: SegmentProps) {
	return (
		<g>
			{points.map((segment, index) => {
				/* The names stay with the data and the swap happens here, which is where the band geoms
				   take it too: the reading bound to X goes up the side once the pair is turned. */
				const x1 = transposed ? x(segment.y) : x(segment.x);
				const y1 = transposed ? y(segment.x) : y(segment.y);
				const x2 = transposed ? x(segment.yEnd) : x(segment.xEnd);
				const y2 = transposed ? y(segment.xEnd) : y(segment.yEnd);
				const tip = arrow ? head(x1, y1, x2, y2, lineWidth) : null;

				return (
					<g key={index}>
						<line
							x1={x1.toFixed(2)}
							y1={y1.toFixed(2)}
							x2={x2.toFixed(2)}
							y2={y2.toFixed(2)}
							stroke={color}
							strokeWidth={lineWidth}
							strokeOpacity={opacity}
							strokeLinecap="round"
						/>
						{/* Filled in the run's own color, so the head reads as the end of the geom and not as a
						    second one sitting on it. */}
						{tip && <path d={tip} fill={color} fillOpacity={opacity} />}
					</g>
				);
			})}
		</g>
	);
}
