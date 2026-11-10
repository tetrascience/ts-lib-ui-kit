/**
 * The datum shapes a layer build produces and a geom consumes.
 *
 * The contract stays with the build. Any renderer reads the same shapes.
 */

import type {BoxStats, Density} from "./stats.js";
import type {PlotPoint} from "./hit.js";

export interface BarDatum {
	category: string;
	/**
	 * Position on a value scale, where the bar stands for a bin.
	 *
	 * A binned bar and a banded one are one geom. The position arrives beside the label.
	 */
	at?: number;
	/**
	 * The interval a binned bar stands for, in the measure's own units.
	 *
	 * `closed` names the ends that hold a reading on them, as the binner placed it.
	 */
	bin?: {from: number; to: number; closed: "left" | "right" | "both" | "neither"};
	value: number;
	/**
	 * Where the geom starts. Absent starts at the baseline.
	 *
	 * `floor + value` is the top of the segment and the reach the vertical scale needs.
	 */
	floor?: number;
	/** Half-width of the interval. Standard error or standard deviation, named in the footer. */
	error?: number;
	/**
	 * The readings behind the group, for a geom drawing them over the bar.
	 *
	 * Absent where the author asked for none or the group has too many to separate.
	 */
	values?: number[];
	n?: number;
	color?: string;
	/**
	 * How many geoms share this bar's band, where a dodge divides by the band's count, ggplot's
	 * `preserve = "total"`.
	 *
	 * Absent takes the slot count the whole set was given, ggplot's `preserve = "single"`.
	 */
	slotOf?: number;
	/** Which of those slots this bar takes, its rank among the geoms its band holds. Absent takes the set's. */
	slotAt?: number;
}

/**
 * One reading of a line -- a position and the value at it.
 *
 * Ordered by the caller. The path walks the readings in the order it is handed them.
 */
export interface LinePoint {
	x: number | string;
	y: number;
	/** Breaks the path before this reading. A missing reading sits between it and the one before. */
	gap?: boolean;
}

/**
 * One reading of a band -- a position and the two bounds around it.
 *
 * Both bounds are bound columns and `mid` is optional. Ordered by the caller.
 */
export interface IntervalPoint {
	x: number | string;
	lo: number;
	hi: number;
	mid?: number;
}

/**
 * One drift -- where a reading started and where it finished.
 *
 * Four bound columns and no statistic. Either end may name a band. Unordered.
 */
export interface SegmentPoint {
	/** A reading on a value scale, or the band it falls in. */
	x: number | string;
	y: number;
	/** The far end. Equal to `x` on a band, where the pair runs inside one category. */
	xEnd: number | string;
	yEnd: number;
}

export interface HeatCell {
	x: string;
	y: string;
	value: number;
	n: number;
}

export interface BoxDatum extends BoxStats {
	category: string;
}

export interface ViolinDatum extends BoxDatum, Density {
	/**
	 * Readings the outline draws a line across, in the measure's own units. Absent draws none.
	 *
	 * The probabilities are `quantiles` on the statistic, defaulting to the box's three.
	 */
	quantiles?: number[];
}

export interface ParallelAxis {
	id: string;
	label: string;
	lo: number;
	hi: number;
}

export interface ParallelLine {
	values: number[];
	/** Feeds the color ramp. Absent where nothing is bound to the color channel. */
	weight?: number;
	/** Row in the source. A click opens the record the grid already knows. */
	row: number;
	/** Row in the table the figure read, before a facet narrowed it. */
	plotRow?: number;
	key?: string;
}

/**
 * Glyph a point draws.
 *
 * Shape survives a printout, a color-blind reader and a screenshot. All four fill -- a stroked
 * glyph at three pixels reads as a smudge.
 */
export type PointShape = "circle" | "square" | "triangle" | "diamond";

/**
 * The glyphs in the order a bound shape channel hands them out.
 *
 * Four is the channel's ceiling and the critic reports a fifth level. The circle leads.
 */
export const POINT_SHAPES: readonly PointShape[] = ["circle", "square", "triangle", "diamond"];

/**
 * Outline width of a hollow glyph, in CSS pixels.
 *
 * One number for both renderers. Each renderer caps it against the geom's own radius.
 */
export const POINT_OUTLINE = 1.4;

/**
 * A geom under the pointer or a click, as each geom reports it to `onHover` and `onSelect`.
 *
 * The datum it drew, its position in the geom's input, and the pixel a tooltip sits beside.
 */
export interface GeomHit<D> {
	datum: D;
	/** Position in the geom's input array. A caller reaches parallel data with it. */
	index: number;
	/** Where the geom draws, in the plot area's pixels. */
	at: {x: number; y: number};
}

/** A point under the pointer or a click. */
export type PointHit = GeomHit<PlotPoint>;

export interface SankeyNodeInput {
	id: string;
	label: string;
	column: number;
	/** Exits sort below survivors within a column. */
	kind?: "survivor" | "exit";
	/** Set by the caller from the palette. Absent falls back to the chart's own tones. */
	color?: string;
}

export interface SankeyLinkInput {
	source: string;
	target: string;
	value: number;
	kind?: "survivor" | "exit" | "missing";
	color?: string;
}

/** One line of the tooltip. */
export interface TooltipRow {
	label: string;
	value: string;
	color?: string;
}
