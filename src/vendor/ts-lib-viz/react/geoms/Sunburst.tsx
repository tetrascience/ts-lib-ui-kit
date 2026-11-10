/**
 * Sunburst: the icicle's layout turned round a center, one ring per level.
 *
 * The layout is the icicle's exactly, and what changes is where a cell lands. A span that was a
 * width becomes an angle and a level that was a row becomes a ring, so the nesting reads outward
 * from the middle and a child sits inside the arc its parent took.
 *
 * `arcPath` draws each cell, the same builder the pie uses. A ring layout is made per
 * cell out of that cell\'s own two radii, which is what lets one path builder serve a geometry whose
 * inner and outer edges move with the depth.
 *
 * Polar, so the condition the coordinate is permitted under reaches it: a slice carries its value as
 * text or the reader is left judging an angle. See the ADR "Polar is permitted where the figure
 * writes its numbers".
 */

import {
	arcPath,
	METRICS,
	polarPoint,
	ringLayout,
	textRun,
	type GeomHit,
	type HierarchyCell,
} from "../../core/internal.js";

import {EDGE, hueFor, labelInk} from "./hierarchy-cells.js";

/**
 * Whether a slice has room along its own ring for the text it would carry.
 *
 * Measured as an arc length and not as an angle. A ring's inner cells sit at a small radius, so a
 * wide angle there is a short arc and two roots' numbers run into each other in the middle, which is
 * what a fixed angle floor let through. `textRun` is the same estimate the margin and the band use.
 */
const roomFor = (text: string, from: number, to: number, radius: number, fontSize: number): boolean =>
	(to - from) * radius >= textRun(text.length, fontSize);

/** Paper between one ring and the next, as a fraction of the panel\'s radius. */
const GAP = 0.004;

export interface SunburstProps {
	cells: HierarchyCell[];
	width: number;
	height: number;
	/** Hue per group, taken off the categorical map. Read where no `fill` is stated. */
	identity: (index: number) => string;
	/** One hue for the whole figure, where the author picked one. */
	fill?: string;
	/** Groups the legend names, with the categorical index of each. */
	levels?: readonly {value: string; code: number}[];
	opacity?: number;
	/** Paint on each slice's edge. Absent is the paper, which reads as space between neighbors. */
	stroke?: string;
	/** The value written on each slice, which is what the coordinate is permitted on. `wanted` picks the slices. */
	numbers?: {format: (value: number) => string; wanted?: (value: number) => boolean; color?: string; fontSize: number};
	/** Writes the cell\'s name above the number. Chart-design rule 2, applied to a slice. */
	names?: boolean;
	/** The cell under the pointer, placed where its label sits. */
	onHover?: (hit: GeomHit<HierarchyCell> | null) => void;
	onSelect?: (hit: GeomHit<HierarchyCell>) => void;
}

export function Sunburst({
	cells,
	width,
	height,
	identity,
	fill,
	levels,
	opacity = 1,
	stroke = "var(--viz-paper)",
	numbers,
	names,
	onHover,
	onSelect,
}: SunburstProps) {
	const panel = ringLayout(width, height, 0);
	if (cells.length === 0 || panel.outer <= 0) return null;

	const hue = hueFor(cells, identity, fill, levels);
	/* A name alone is written at the regular column's size. A number states its own. */
	const type = numbers?.fontSize ?? METRICS.regular.axis;

	/* One ring layout per cell, off that cell\'s own depth, so `arcPath` draws an annular sector. */
	const placed = cells.map((cell) => {
		const inner = cell.y0 * panel.outer;
		const outer = Math.max(inner, cell.y1 * panel.outer - GAP * panel.outer);
		const from = cell.x0 * Math.PI * 2;
		const to = cell.x1 * Math.PI * 2;
		const ring = {cx: panel.cx, cy: panel.cy, inner, outer, labelRadius: inner + (outer - inner) / 2};
		return {cell, ring, from, to, hue: hue(cell), at: polarPoint(ring, ring.labelRadius, (from + to) / 2)};
	});

	return (
		<>
			<g data-geom="sunburst">
				{placed.map(({cell, ring, from, to, hue: ink, at}, index) => (
					<path
						key={cell.label}
						d={arcPath(ring, from, to)}
						fill={ink}
						fillOpacity={opacity}
						stroke={stroke}
						strokeWidth={EDGE}
						onMouseEnter={() => onHover?.({datum: cell, index, at})}
						onMouseLeave={() => onHover?.(null)}
						onClick={onSelect ? () => onSelect({datum: cell, index, at}) : undefined}
						style={onSelect ? {cursor: "pointer"} : undefined}
					/>
				))}
			</g>
			{(numbers || names) && (
				/*
          Past the slices, so no later fill covers a number already written.

          A slice narrower than `NARROW` gets no text, which is the same floor the pie holds. Text
          drawn over a sliver runs across its neighbors and the reader loses both.
        */
				<g data-geom="sunburst-labels" fontSize={type} pointerEvents="none" textAnchor="middle">
					{placed.map(({cell, ring, to, from, at, hue: ink}) => {
						const lines = [
							...(names ? [cell.label] : []),
							...(numbers && (numbers.wanted?.(cell.value) ?? true) ? [numbers.format(cell.value)] : []),
						];
						if (lines.length === 0) return null;
						const widest = lines.reduce((held, line) => (line.length > held.length ? line : held), "");
						if (!roomFor(widest, from, to, ring.labelRadius, type)) return null;
						return (
							<text
								key={cell.label}
								x={at.x}
								y={at.y}
								dominantBaseline="central"
								fill={numbers?.color ?? labelInk(ink)}
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
