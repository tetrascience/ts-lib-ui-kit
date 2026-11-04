/**
 * A reduction over two categories, drawn as a grid of colored cells.
 *
 * Color is the only channel carrying the value here, so it takes the sequential map instead of the
 * categorical one, per chart-design rule 8. The two axes carry identity and the cell carries
 * magnitude, which is the division that keeps the reading unambiguous.
 *
 * A pair with no rows behind it leaves a gap instead of a cell at the bottom of the ramp. Absent
 * and lowest are different facts, and a chart that draws them alike says a plate was tested and came
 * back worst when it was never tested.
 *
 * The ramp takes a value in its own units and the geom runs no scale of its own. It used to take the
 * extent of the cells it happened to be handed, which put each panel of a facet on its own scale and
 * left the domain inside a closure where no legend could read it. `Trace.colorDomain` carries it now.
 */

import {boundsOf, inkOn, LIGHT_THEME, type Scale} from "../../core/internal.js";
import type {GeomHit, HeatCell, ValueRamp} from "../../core/internal.js";

export type {HeatCell};

/** Color the thinnest cell keeps where a grid fades by support. A lone reading stays visible. */
const SUPPORT_FLOOR = 0.35;

export interface HeatmapProps {
	data: HeatCell[];
	x: Scale;
	y: Scale;
	xBand: number;
	yBand: number;
	/** Maps a cell's value, in the units it carries, to a color. */
	ramp: ValueRamp;
	/**
	 * Ink on the cell edge. Absent draws none, which is what pheatmap's `border_color = NA` gives.
	 *
	 * A grid's cells are the surface, so they tile: absent an edge the fills meet and the reader sees
	 * one field of color instead of a lattice. An author who wants pheatmap's gray border names it
	 * here, and the cells give up the width it takes.
	 */
	stroke?: string;
	/** Width of that edge, in pixels. Read only where `stroke` names a color. */
	lineWidth?: number;
	/** Opacity of each cell, over the fade a thin support gives it. */
	opacity?: number;
	/**
	 * The value written inside each cell. Absent writes none, which is pheatmap's own default.
	 *
	 * `format` takes a value in the cell's units, so the numbers read the same way the legend and the
	 * hover readout do. `color` absent picks black or white per cell off the fill, since a fixed ink
	 * disappears at one end of every ramp. `wanted` absent writes every cell.
	 */
	numbers?: {format: (value: number) => string; wanted?: (value: number) => boolean; color?: string; fontSize: number};
	/**
	 * Corner radius on a cell, in pixels. Absent tiles them square.
	 *
	 * A radius reads the grid as a set of chips instead of a continuous field. Right where a reader
	 * compares cells one at a time and wrong where the grid stands for a surface.
	 */
	cornerRadius?: number;
	/** Space held back between one cell and the next, in pixels. */
	cellGap?: number;
	/**
	 * Fades a cell by how many rows stand behind it.
	 *
	 * A mean of one reading and a mean of four hundred draw the same color and carry different
	 * weight. The thinnest cell keeps `SUPPORT_FLOOR` of its color, so a lone reading stays visible.
	 */
	fadeBySupport?: boolean;
	/** Color behind the grid. A faded cell's number takes its ink off the blend. Absent reads the light paper. */
	paper?: string;
	/** Cell drawn at full strength, named by its pair of groups. The rest mute to context. */
	active?: Pick<HeatCell, "x" | "y"> | null;
	/** The cell under the pointer, placed at its center. */
	onHover?: (hit: GeomHit<HeatCell> | null) => void;
	/** A cell clicked. The pair of groups it reduces is what a linked view filters on. */
	onSelect?: (hit: GeomHit<HeatCell>) => void;
}

export function Heatmap({
	data,
	x,
	y,
	xBand,
	yBand,
	ramp,
	stroke,
	lineWidth = 1,
	opacity = 1,
	numbers,
	cornerRadius,
	cellGap = 0,
	fadeBySupport,
	paper = LIGHT_THEME["--viz-paper"],
	active,
	onHover,
	onSelect,
}: HeatmapProps) {
	if (data.length === 0) return null;

	/*
    An edge, where one is asked for, is drawn inside the band instead of on its boundary.

    The cells stay the size the band gave them and two neighbors keep their strokes apart. With no
    edge and no gap the rect is the whole band and the fills meet, which is the default a grid
    wants: the lattice a hairline draws is structure the data did not ask for. A gap holds ground
    back on all four sides, which is what lets a corner radius be seen.
  */
	const strokeWidth = stroke ? lineWidth : 0;
	const edge = strokeWidth + cellGap;
	const inset = edge / 2;
	const w = Math.max(1, xBand - edge);
	const h = Math.max(1, yBand - edge);

	const heaviest = fadeBySupport ? Math.max(boundsOf(data.map((cell) => cell.n))[1], 1) : 1;
	const weight = (cell: HeatCell) =>
		fadeBySupport ? SUPPORT_FLOOR + (1 - SUPPORT_FLOOR) * Math.sqrt(Math.min(cell.n, heaviest) / heaviest) : 1;

	const hitOf = (cell: HeatCell, index: number) => ({datum: cell, index, at: {x: x(cell.x), y: y(cell.y)}});

	/* A threshold leaves the rest of the grid bare, which is what marking the cells past a cut means. */
	const written = numbers?.wanted ? data.filter((cell) => numbers.wanted!(cell.value)) : data;

	return (
		<>
			<g data-grid="cells">
				{data.map((cell, index) => (
					<rect
						key={`${cell.x}-${cell.y}`}
						x={x(cell.x) - xBand / 2 + inset}
						y={y(cell.y) - yBand / 2 + inset}
						width={w}
						height={h}
						rx={cornerRadius}
						ry={cornerRadius}
						fill={ramp(cell.value)}
						stroke={stroke}
						strokeWidth={strokeWidth}
						shapeRendering={stroke || cornerRadius ? undefined : "crispEdges"}
						fillOpacity={(active && (active.x !== cell.x || active.y !== cell.y) ? 0.45 : 1) * weight(cell) * opacity}
						onMouseEnter={() => onHover?.(hitOf(cell, index))}
						onMouseLeave={() => onHover?.(null)}
						onClick={onSelect ? () => onSelect(hitOf(cell, index)) : undefined}
						style={onSelect ? {cursor: "pointer"} : undefined}
					/>
				))}
			</g>
			{numbers && (
				/* Past the cells and not among them, so no later fill covers a number already written. */
				<g data-grid="numbers" fontSize={numbers.fontSize} pointerEvents="none">
					{written.map((cell) => (
						<text
							key={`${cell.x}-${cell.y}`}
							x={x(cell.x)}
							y={y(cell.y)}
							textAnchor="middle"
							dominantBaseline="central"
							fill={
								numbers.color ?? inkOn(ramp(cell.value), fadeBySupport ? {paper, opacity: weight(cell)} : undefined)
							}
						>
							{numbers.format(cell.value)}
						</text>
					))}
				</g>
			)}
		</>
	);
}
