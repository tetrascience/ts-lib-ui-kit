/**
 * A hierarchy tiled into the panel. A cell's area stands for its value.
 *
 * `GRAMMAR` answers `packed` for the coordinate system, so the frame draws no axes and the geom takes
 * the plot area whole. The rectangles come off `treemapLayout` in `/core` as fractions of that area,
 * so this scales them and draws.
 *
 * A parent stands before its children in the payload and the children cover it, so drawing in order
 * leaves the leaves on top and a parent's own fill shows only where it has none. What separates two
 * neighbors is the paper-colored stroke of chart-design rule 9, the same one a stacked bar's segments
 * take.
 *
 * A cell gets its label and its value written inside it where both fit, per rule 9 and the guides
 * section's preference for a direct label over a legend. A packed layout has no axis to carry the
 * number, so the cell carries it.
 */

import type {HierarchyCell} from "../../core/internal.js";

import {MARK_RADIUS} from "./Bars.js";
import {EDGE, fits, hueFor, labelInk, placeCells} from "./hierarchy-cells.js";

export interface TreemapProps {
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
	/** The cell's value written under its name. Absent writes the name alone. */
	format?: (value: number) => string;
	/** Type size for the labels, in pixels. Absent writes none. */
	fontSize?: number;
}

export function Treemap({
	cells,
	width,
	height,
	identity,
	fill,
	levels,
	opacity = 1,
	stroke = "var(--viz-paper)",
	format,
	fontSize,
}: TreemapProps) {
	if (cells.length === 0 || width <= 0 || height <= 0) return null;

	const boxes = placeCells(cells, width, height, hueFor(cells, identity, fill, levels));

	/* Written on the cells nothing covers, since a parent's own name sits under its children. */
	const covered = new Set(cells.map((cell) => cell.parent).filter((label): label is string => label != null));
	const written =
		fontSize == null
			? []
			: boxes.filter(({cell, w, h}) => !covered.has(cell.label) && fits(cell.label, w, h, fontSize, format ? 2 : 1));

	return (
		<>
			<g data-geom="treemap">
				{boxes.map(({cell, x, y, w, h, hue}) => (
					<rect
						key={cell.label}
						x={x + EDGE / 2}
						y={y + EDGE / 2}
						width={Math.max(0, w - EDGE)}
						height={Math.max(0, h - EDGE)}
						rx={Math.min(MARK_RADIUS / 2, w / 2, h / 2)}
						fill={hue}
						fillOpacity={opacity}
						stroke={stroke}
						strokeWidth={EDGE}
					/>
				))}
			</g>
			{written.length > 0 && fontSize != null && (
				/* Past the cells, so no later fill covers a name already written. */
				<g data-geom="treemap-labels" fontSize={fontSize} pointerEvents="none" textAnchor="middle">
					{written.map(({cell, x, y, w, h, hue}) => (
						<text key={cell.label} x={x + w / 2} y={y + h / 2} dominantBaseline="central" fill={labelInk(hue)}>
							<tspan x={x + w / 2} dy={format ? "-0.1em" : 0}>
								{cell.label}
							</tspan>
							{format && (
								<tspan x={x + w / 2} dy="1.2em" fillOpacity={0.75}>
									{format(cell.value)}
								</tspan>
							)}
						</text>
					))}
				</g>
			)}
		</>
	);
}
