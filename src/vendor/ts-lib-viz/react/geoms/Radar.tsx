/**
 * Radar: the parallel plot's rules turned out from a center, with each record closed into a polygon.
 *
 * The payload is the parallel geom's, since the two differ in where the rules go and in nothing else.
 * Each rule holds one measure in that measure's own range, so the reader compares along a spoke and
 * not across the figure. `GRAMMAR` answers false for the kind's axial coordinate, which is what stops
 * the frame drawing a pair of flat rules around it.
 *
 * The order of the spokes is the author's, taken off the order the measures were bound. It has to be:
 * the polygon closes over the spokes, so swapping two of them redraws the shape without changing a
 * reading. The area that shape encloses stands for nothing, and that is why the fill stays low. A
 * heavy wash asserts a quantity nobody measured, and two records overlaid would then hide each other.
 * See the ADR "Polar is permitted where the figure writes its numbers".
 *
 * The rings are the grid, and they run perpendicular to what is being read the way rule 5 asks. A
 * reader taking a value off a spoke crosses them, so four of them at even fractions give the counting
 * marks a flat axis gets from its ticks.
 */

import {
	spokeLayout,
	spokePoint,
	type GeomHit,
	type ParallelAxis,
	type ParallelLine,
	type ValueRamp,
} from "../../core/internal.js";

/** Rings the grid draws between the center and the outermost one, so a reader can count in quarters. */
const RINGS = [0.25, 0.5, 0.75, 1];

/** How much of the polygon's own ink washes its interior. Low, the enclosed area standing for nothing. */
const FILL_OPACITY = 0.1;

/** How far off vertical a spoke has to lean before its name stops sitting over the tip. */
const LEAN = 0.2;

export interface RadarProps {
	/** One rule per measure, in the order the author bound them. */
	axes: ParallelAxis[];
	/** One polygon per record. Each holds a reading per rule. */
	lines: ParallelLine[];
	width: number;
	height: number;
	/** Maps a line's weight to a color. Lines with no weight take `color`. */
	ramp: ValueRamp;
	color: string;
	/** Interior paint of each polygon, where the author picked one. Absent takes the line's own. */
	fill?: string;
	opacity?: number;
	/** Type size for the measure names at the spoke ends. Absent writes none. */
	fontSize?: number;
	/** The record under the pointer, placed at its first corner. */
	onHover?: (hit: GeomHit<ParallelLine> | null) => void;
	onSelect?: (hit: GeomHit<ParallelLine>) => void;
}

/** Where a reading falls along its own rule, as a fraction of that rule's range. */
const along = (value: number, axis: ParallelAxis): number => {
	const span = axis.hi - axis.lo;
	return span === 0 ? 0.5 : Math.min(1, Math.max(0, (value - axis.lo) / span));
};

/** A closed path through one point per spoke. */
const closed = (corners: {x: number; y: number}[]): string =>
	`${corners.map(({x, y}, at) => `${at === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")} Z`;

export function Radar({
	axes,
	lines,
	width,
	height,
	ramp,
	color,
	fill,
	opacity,
	fontSize,
	onHover,
	onSelect,
}: RadarProps) {
	const layout = spokeLayout(axes.length, width, height);
	if (axes.length < 3 || layout.radius <= 0) return null;

	return (
		<g data-geom="radar">
			<g data-geom="radar-grid" fill="none" stroke="var(--viz-rule)" strokeWidth={1}>
				{RINGS.map((at) => (
					<path key={at} d={closed(axes.map((_, index) => spokePoint(layout, index, at)))} />
				))}
				{axes.map((axis, index) => {
					const tip = spokePoint(layout, index, 1);
					return <line key={axis.id} x1={layout.cx} y1={layout.cy} x2={tip.x} y2={tip.y} />;
				})}
			</g>

			<g data-geom="radar-shapes">
				{lines.map((line, index) => {
					const corners = axes.map((axis, at) => spokePoint(layout, at, along(line.values[at] ?? axis.lo, axis)));
					const ink = line.weight == null ? color : ramp(line.weight);
					return (
						<path
							key={line.key ?? index}
							d={closed(corners)}
							fill={fill ?? ink}
							fillOpacity={(opacity ?? 1) * FILL_OPACITY}
							stroke={ink}
							strokeWidth={1.5}
							strokeOpacity={opacity ?? 0.85}
							onMouseEnter={() => onHover?.({datum: line, index, at: corners[0]!})}
							onMouseLeave={() => onHover?.(null)}
							onClick={onSelect ? () => onSelect({datum: line, index, at: corners[0]!}) : undefined}
							style={onSelect ? {cursor: "pointer"} : undefined}
						/>
					);
				})}
			</g>

			{fontSize != null && (
				/*
          The measure's name sits past the outermost ring, on the side the spoke leans.

          A name centered over a spoke pointing sideways runs back over the polygon, so the anchor
          follows the lean and `spokeLayout` gave the room up before it picked the radius.
        */
				<g data-geom="radar-labels" fontSize={fontSize} pointerEvents="none" fill="var(--viz-ink)">
					{axes.map((axis, index) => {
						const at = spokePoint(layout, index, 1);
						const lean = (at.x - layout.cx) / (layout.radius || 1);
						const anchor = lean > LEAN ? "start" : lean < -LEAN ? "end" : "middle";
						const dx = lean > LEAN ? 6 : lean < -LEAN ? -6 : 0;
						return (
							<text
								key={axis.id}
								x={at.x + dx}
								y={at.y + (at.y < layout.cy ? -6 : 12)}
								textAnchor={anchor}
								dominantBaseline={Math.abs(lean) > LEAN ? "central" : undefined}
							>
								{axis.label}
							</text>
						);
					})}
				</g>
			)}
		</g>
	);
}
