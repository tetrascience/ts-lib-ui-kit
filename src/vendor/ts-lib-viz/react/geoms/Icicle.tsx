/**
 * The same hierarchy with a row per level. A cell's width stands for its value.
 *
 * One layout serves both arrangements. This arrangement trades the second dimension for a shared
 * baseline: within a row the cells sit on one line and the reading is a length, which a reader takes
 * off the page more accurately than an area. Down the rows the nesting reads, since a cell sits
 * inside its parent's span.
 *
 * `packed` like the treemap, so the frame draws no axes and the geom takes the plot area whole. Hue
 * carries the root a cell descends from, the same grouping the treemap paints, so a figure holding
 * both reads as one thing.
 *
 * Labels go inside a cell where the name fits along its own row. A row is the same height whatever
 * the level, so width alone decides the fit, which is what lets the top row carry names where the
 * bottom one has slivers. No corner radius, since a level's cells sit on one baseline and a rounded
 * end would read as a gap in it.
 */

import type {HierarchyCell} from "../../core/internal.js";

import {EDGE, fits, hueFor, labelInk, placeCells} from "./hierarchy-cells.js";

export interface IcicleProps {
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
	/** Paint on each cell's edge. Absent is the paper, which reads as space between neighbors. */
	stroke?: string;
	/** Type size for the labels, in pixels. Absent writes none. */
	fontSize?: number;
}

export function Icicle({
	cells,
	width,
	height,
	identity,
	fill,
	levels,
	opacity = 1,
	stroke = "var(--viz-paper)",
	fontSize,
}: IcicleProps) {
	if (cells.length === 0 || width <= 0 || height <= 0) return null;

	const boxes = placeCells(cells, width, height, hueFor(cells, identity, fill, levels));
	const written = fontSize == null ? [] : boxes.filter(({cell, w, h}) => fits(cell.label, w, h, fontSize, 1));

	return (
		<>
			<g data-geom="icicle">
				{boxes.map(({cell, x, y, w, h, hue}) => (
					<rect
						key={cell.label}
						x={x + EDGE / 2}
						y={y + EDGE / 2}
						width={Math.max(0, w - EDGE)}
						height={Math.max(0, h - EDGE)}
						fill={hue}
						fillOpacity={opacity}
						stroke={stroke}
						strokeWidth={EDGE}
					/>
				))}
			</g>
			{written.length > 0 && fontSize != null && (
				<g data-geom="icicle-labels" fontSize={fontSize} pointerEvents="none" textAnchor="middle">
					{written.map(({cell, x, y, w, h, hue}) => (
						<text key={cell.label} x={x + w / 2} y={y + h / 2} dominantBaseline="central" fill={labelInk(hue)}>
							{cell.label}
						</text>
					))}
				</g>
			)}
		</>
	);
}
