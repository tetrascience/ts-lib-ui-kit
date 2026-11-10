/**
 * Shares of one whole, as slices of a ring.
 *
 * The design language ruled the pie out because a reader judges angle and area worse than length.
 * It is permitted on a condition, and the condition is that the figure writes its numbers on the
 * slices: the reader takes the value off text and the arc carries the share. So `numbers` is the
 * payment for the coordinate, and the critic reports a ring drawn without one at `bad`. See the ADR
 * "Polar is permitted where the figure writes its numbers".
 *
 * The geom takes the panel whole. `GRAMMAR` answers false for the kind's axial coordinate, which is
 * what stops the frame drawing a pair of rules around a circle.
 *
 * A slice's color comes off the categorical map by position in the ring. Chart-design rule 8 asks
 * that color encode something or stay neutral, and here it separates neighbors a reader has to tell
 * apart. The identity itself travels on the label, which is why no legend goes with this geom. A
 * series naming a sequential `palette` steps along that map instead, for categories with an order.
 *
 * `hole` above zero makes it a donut. One field, and the layout resolves it against the outer radius,
 * so a ring keeps its proportions across a facet and a hero chart.
 */

import {arcPath, inkOn, polarPoint, ringLayout, sliceAngles, type BarDatum, type GeomHit} from "../../core/internal.js";

export interface PieProps {
	/** One slice per reduction, in the order the band holds them. */
	data: BarDatum[];
	width: number;
	height: number;
	/** A color per slice, by position in the ring. */
	identity: (index: number) => string;
	/** One paint for each slice, where the author picked one over the ring's own. */
	fill?: string;
	/** The hole, as a fraction of the outer radius. Zero draws a pie. */
	hole?: number;
	opacity?: number;
	/**
	 * Ink between one slice and the next. Page-colored, so it reads as space and the slices stay
	 * countable where two neighbors take a similar hue.
	 */
	stroke?: string;
	lineWidth?: number;
	/**
	 * The value written on each slice, which is what the coordinate is permitted on.
	 *
	 * `format` takes the value in the units the slice carries, so the number agrees with the tooltip.
	 * `share` writes the slice's fraction of the total instead, which is what a reader of a pie is
	 * usually after. `wanted` picks the slices that get one, off the slice's value.
	 */
	numbers?: {
		format: (value: number) => string;
		wanted?: (value: number) => boolean;
		share?: boolean;
		color?: string;
		fontSize: number;
	};
	/** Writes the category name above the number. Chart-design rule 2, applied to a wedge. */
	names?: boolean;
	/** Category drawn at full strength. The rest mute to context. */
	active?: string | null;
	/** The slice under the hand, placed where its label sits, so a readout has somewhere to go. */
	onHover?: (hit: GeomHit<BarDatum> | null) => void;
	onSelect?: (hit: GeomHit<BarDatum>) => void;
}

/** A slice too narrow to hold text, in radians. Below this the label would draw over its neighbors. */
const NARROW = 0.16;

export function Pie({
	data,
	width,
	height,
	identity,
	fill,
	hole = 0,
	opacity,
	stroke,
	lineWidth = 1,
	numbers,
	names,
	active,
	onHover,
	onSelect,
}: PieProps) {
	const layout = ringLayout(width, height, hole);
	const slices = sliceAngles(data.map((slice) => slice.value));
	if (slices.length === 0 || layout.outer <= 0) return null;

	const total = data.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
	const percent = (value: number) => `${((Math.max(0, value) / total) * 100).toFixed(1)}%`;

	return (
		<>
			<g data-polar="slices">
				{slices.map((slice, index) => {
					const datum = data[index]!;
					const at = polarPoint(layout, layout.labelRadius, slice.mid);
					return (
						<path
							key={datum.category}
							d={arcPath(layout, slice.from, slice.to)}
							fill={fill ?? datum.color ?? identity(index)}
							fillOpacity={active != null && active !== datum.category ? 0.45 : opacity}
							stroke={stroke}
							strokeWidth={stroke ? lineWidth : 0}
							onMouseEnter={() => onHover?.({datum, index, at})}
							onMouseLeave={() => onHover?.(null)}
							onClick={onSelect ? () => onSelect({datum, index, at}) : undefined}
							style={onSelect ? {cursor: "pointer"} : undefined}
						/>
					);
				})}
			</g>
			{(numbers || names) && (
				/*
          Past the slices, so no later fill covers a number already written.

          A slice narrower than `NARROW` gets no text. The alternative is a label drawn over its
          neighbors, which is the failure `slices-past-legible` reports on the count. Leaving the
          text off a sliver keeps the figure readable while the finding says why it is short.
        */
				<g data-polar="numbers" fontSize={numbers?.fontSize} pointerEvents="none" textAnchor="middle">
					{slices.map((slice, index) => {
						const datum = data[index]!;
						if (slice.to - slice.from < NARROW) return null;
						const at = polarPoint(layout, layout.labelRadius, slice.mid);
						const lines = [
							...(names ? [datum.category] : []),
							...(numbers && (numbers.wanted?.(datum.value) ?? true)
								? [numbers.share ? percent(datum.value) : numbers.format(datum.value)]
								: []),
						];
						if (lines.length === 0) return null;
						return (
							<text
								key={datum.category}
								x={at.x}
								y={at.y}
								fill={numbers?.color ?? inkOn(datum.color ?? identity(index))}
								dominantBaseline="central"
							>
								{lines.map((line, row) => (
									<tspan key={line} x={at.x} dy={row === 0 ? `${-((lines.length - 1) * 0.55)}em` : "1.1em"}>
										{line}
									</tspan>
								))}
							</text>
						);
					})}
				</g>
			)}
		</>
	);
}
