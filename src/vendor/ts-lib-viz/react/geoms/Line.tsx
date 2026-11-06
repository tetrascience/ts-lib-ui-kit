/**
 * The line geom: one path through readings ordered along the axis.
 *
 * The last of the drawn geometries to get a component, which is what kept the `line` kind out of
 * the facade: `buildLayers` resolved it, and nothing in `/react` could draw the result. It draws
 * both payloads the layer engine produces for the kind. On a value scale the trace carries records
 * and the path runs through them; on a band scale the trace carries a reduction and the path runs
 * through the group centers, which is what a trend over categories means.
 *
 * No dots on the vertices by default. A line is the geom for a sequence read as a whole; a reader
 * who needs the individual readings wants the scatter, not a beaded string.
 *
 * A step is a style and not a kind, since it runs the same statistic through the same geometry in
 * the same coordinate system and differs in what it claims between two readings. A sloped segment
 * says the value moved gradually, which is a claim nobody measured for a count, a stock level or a
 * setting somebody changed.
 */

import {useMemo} from "react";

import {dashArray, type Linetype, type LinePoint, type Scale} from "../../core/internal.js";

export type {LinePoint};

export interface LineProps {
	/** In axis units, already ordered the way the line reads. */
	points: LinePoint[];
	x: Scale;
	y: Scale;
	color: string;
	/**
	 * Where the value changes between two readings. Absent runs a straight segment.
	 *
	 * `after` holds a reading until the next one arrives, which is a run chart, a stock level or a
	 * setting left alone. `before` takes the new value at the step, which is a count that had already
	 * changed by the time somebody read it.
	 */
	step?: "after" | "before";
	lineWidth?: number;
	opacity?: number;
	/** Pattern the run draws. Absent draws it whole, which is what a solid linetype means. */
	dash?: Linetype;
}

export function Line({points, x, y, color, step, lineWidth = 1.5, opacity = 1, dash}: LineProps) {
	const d = useMemo(() => {
		const at = (point: LinePoint) => [x(point.x).toFixed(2), y(point.y).toFixed(2)] as const;
		let path = "";
		let last: LinePoint | undefined;
		for (const point of points) {
			const [px, py] = at(point);
			if (!last) {
				path = `M${px},${py}`;
			} else if (point.gap) {
				/* A missing reading between the two. The path lifts and starts again. */
				path += `M${px},${py}`;
			} else if (step === "after") {
				/* Along at the old height, then up at the new reading's own position. */
				path += `L${px},${at(last)[1]}L${px},${py}`;
			} else if (step === "before") {
				path += `L${at(last)[0]},${py}L${px},${py}`;
			} else {
				path += `L${px},${py}`;
			}
			last = point;
		}
		return path;
	}, [points, x, y, step]);

	if (points.length < 2) return null;

	return (
		<path
			d={d}
			fill="none"
			stroke={color}
			strokeWidth={lineWidth}
			strokeOpacity={opacity}
			strokeDasharray={dashArray(dash)}
			strokeLinejoin="round"
			strokeLinecap="round"
		/>
	);
}
