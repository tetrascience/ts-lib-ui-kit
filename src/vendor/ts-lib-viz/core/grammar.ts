/**
 * What a plot kind is, decomposed.
 *
 * A kind names a row in the table below -- a statistic, a geometry, a coordinate system, and how
 * its extent reads.
 */

import type {AxisKind, Geom} from "./layers.js";
import type {PlotKind} from "./spec.js";

/**
 * A statistic the kind runs before its geometry draws.
 *
 * `summary` is the one the author steers through `LayerSpec.aggregate`. The rest are fixed by the
 * kind.
 */
export type Stat = "bin" | "bin2d" | "count" | "summary" | "boxplot" | "density" | "ydensity" | "density2d" | "flow";

/**
 * How the geometry is positioned.
 *
 * `cartesian` is the shared pair of scales and `flip` swaps their roles. The rest position
 * themselves.
 */
export type Coord = "cartesian" | "flip" | "parallel" | "flow" | "packed" | "cube" | "polar";

export interface Grammar {
	/** Statistics the kind runs, in the order they run. Empty draws the records as they are. */
	stat: readonly Stat[];
	geom: Geom;
	coord: Coord;
	/**
	 * Whether the geom's extent stands for the value.
	 *
	 * A bar reads as a length from zero and its positional scale has to include zero. An interval
	 * reads false.
	 */
	proportional: boolean;
	/**
	 * Whether `LayerSpec.aggregate` reaches this kind's statistic.
	 *
	 * `"axis"` is the line, and its horizontal scale decides. A kind reading `false` fixes its own
	 * statistic.
	 */
	aggregated: boolean | "axis";
}

/**
 * One row per member of `PlotKind`.
 *
 * `as const satisfies` keeps the literal geometry and statistic, which lets `GeomOf<K>` and
 * `StatOf<K>` narrow a layer's options on the kind.
 */
export const GRAMMAR = {
	point: {
		stat: [],
		geom: "point",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	line: {
		stat: [],
		geom: "line",
		coord: "cartesian",
		proportional: false,
		aggregated: "axis",
	},
	area: {
		stat: ["summary"],
		geom: "area",
		coord: "cartesian",
		proportional: true,
		aggregated: true,
	},
	/*
    Two bound columns and no statistic. The band an author already has, such as a mean with a
    confidence interval per row. `Fit.band` answers the fitted case.
  */
	ribbon: {
		stat: [],
		geom: "ribbon",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	/*
    The same two bounds as the band above, drawn as a mark per reading.

    ggplot's four interval geoms share this geometry and differ in the glyph the kind names.
  */
	errorbar: {
		stat: [],
		geom: "range",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	linerange: {
		stat: [],
		geom: "range",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	pointrange: {
		stat: [],
		geom: "range",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	crossbar: {
		stat: [],
		geom: "range",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	/*
    Four bound columns, and the geom is a pair of positions. A before-and-after pair and a drift
    vector are one shape. Unproportional -- a segment's length is a displacement.
  */
	segment: {
		stat: [],
		geom: "segment",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	/*
    A conditional mean through the points, drawn as a curve and no geoms.

    The statistic is empty. This row says what the kind draws and the service supplies the
    numbers.
	*/
	smooth: {
		stat: [],
		geom: "smooth",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	bar: {
		stat: ["summary"],
		geom: "bar",
		coord: "cartesian",
		proportional: true,
		aggregated: true,
	},
	/*
    Signed steps on a running total. The floor is arithmetic.

    A step starts where the one before it finished, and the geom paints a rise apart from a fall.
  */
	waterfall: {
		stat: ["summary"],
		geom: "waterfall",
		coord: "cartesian",
		proportional: true,
		aggregated: true,
	},
	histogram: {
		stat: ["bin", "count"],
		geom: "bar",
		coord: "cartesian",
		proportional: true,
		aggregated: false,
	},
	hex: {
		stat: ["bin2d", "count"],
		geom: "hex",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	boxplot: {
		stat: ["boxplot"],
		geom: "boxplot",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	violin: {
		stat: ["boxplot", "ydensity"],
		geom: "violin",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	/*
    A histogram's count under a bin, drawn as a run between the bin centers.

    Three overlapping distributions read as three curves and as one muddle of bars.
  */
	freqpoly: {
		stat: ["bin", "count"],
		geom: "freqpoly",
		coord: "cartesian",
		proportional: true,
		aggregated: false,
	},
	/*
    A one-dimensional kernel density in the main panel.

    Proportional -- the vertical scale reads a density from zero. Its own geometry.
  */
	density: {
		stat: ["density"],
		geom: "density",
		coord: "cartesian",
		proportional: true,
		aggregated: false,
	},
	heatmap: {
		stat: ["summary"],
		geom: "heatmap",
		coord: "cartesian",
		proportional: false,
		aggregated: true,
	},
	contour: {
		stat: ["density2d"],
		geom: "contour",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	parcoords: {
		stat: [],
		geom: "parcoords",
		coord: "parallel",
		proportional: false,
		aggregated: false,
	},
	/*
    A genome round a circle. One sector per chromosome and one tile per band.

    The sectors carry their own base-pair ranges, so a track plots a reading at its own position.
  */
	ideogram: {
		stat: [],
		geom: "ideogram",
		coord: "polar",
		proportional: false,
		aggregated: false,
	},
	/*
    A flow closed into a circle. One sector per name and one ribbon per pair.

    The sankey's channels, read round a center. A sector is sized by everything touching it.
  */
	chord: {
		stat: ["summary"],
		geom: "chord",
		coord: "polar",
		proportional: true,
		aggregated: false,
	},
	sankey: {
		stat: ["summary", "flow"],
		geom: "sankey",
		coord: "flow",
		proportional: true,
		aggregated: false,
	},
	treemap: {
		stat: ["summary"],
		geom: "treemap",
		coord: "packed",
		proportional: true,
		aggregated: true,
	},
	/*
    The same nesting with a row per level, trading a dimension for a shared baseline. Packed. A
    cell's width is a length from zero.
  */
	icicle: {
		stat: ["summary"],
		geom: "icicle",
		coord: "packed",
		proportional: true,
		aggregated: true,
	},
	/*
    The same nesting turned round a center, drawing one ring per level.

    Polar, and the condition it pays is a number on each slice. It reads the icicle's own layout.
  */
	sunburst: {
		stat: ["summary"],
		geom: "sunburst",
		coord: "polar",
		proportional: true,
		aggregated: true,
	},
	/*
    The polar three. Each draws a share of one total as an angle.

    A pie asks its horizontal channel for categories. `LayerStyle.innerRadius` above zero draws a donut.
  */
	pie: {
		stat: ["summary"],
		geom: "pie",
		coord: "polar",
		proportional: true,
		aggregated: true,
	},
	/* One reduction over the whole table, read against a stated range. */
	gauge: {
		stat: ["summary"],
		geom: "gauge",
		coord: "polar",
		proportional: true,
		aggregated: true,
	},
	/*
    The parallel plot turned round a center, with the rules running out as spokes.

    A radar owes its axis order to the author and `dimensions` is an ordered list.
  */
	radar: {
		stat: [],
		geom: "radar",
		coord: "polar",
		proportional: false,
		aggregated: false,
	},
	point3d: {
		stat: [],
		geom: "point3d",
		coord: "cube",
		proportional: false,
		aggregated: false,
	},
	/* A relief reduces a measure over a grid of two dimensions. A bin, then a statistic. */
	surface: {
		stat: ["bin2d", "summary"],
		geom: "surface",
		coord: "cube",
		proportional: false,
		aggregated: true,
	},
	/* A mesh arrives as vertices and faces. The rows are the geometry and nothing reduces them. */
	mesh3d: {
		stat: [],
		geom: "mesh3d",
		coord: "cube",
		proportional: false,
		aggregated: false,
	},
	isosurface: {
		stat: [],
		geom: "isosurface",
		coord: "cube",
		proportional: false,
		aggregated: false,
	},
	volume: {
		stat: [],
		geom: "volume",
		coord: "cube",
		proportional: false,
		aggregated: false,
	},
	/*
    ggplot's three reference geoms. A line across the plot area that leaves the scales alone.

    `abline` reads its slope and intercept in the scales' transformed space.
  */
	hline: {
		stat: [],
		geom: "hline",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	vline: {
		stat: [],
		geom: "vline",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	abline: {
		stat: [],
		geom: "abline",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	/* ggplot's `geom_text` and `geom_label`. A label per row at its reading. The second draws a box behind it. */
	text: {
		stat: [],
		geom: "text",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
	label: {
		stat: [],
		geom: "text",
		coord: "cartesian",
		proportional: false,
		aggregated: false,
	},
} as const satisfies Record<PlotKind, Grammar>;

/** Each layer kind, in the grammar table's order. A chart-type picker offers these. */
export const KINDS: readonly PlotKind[] = Object.freeze(Object.keys(GRAMMAR) as PlotKind[]);

export const resolve = (kind: PlotKind): Grammar => GRAMMAR[kind];

/** Coordinate systems that position against the frame's shared pair of scales. */
const AXIAL: Coord[] = ["cartesian", "flip"];

export const isAxial = (coord: Coord): boolean => AXIAL.includes(coord);

/**
 * What a geom keeps once the kind behind it is forgotten.
 *
 * A trace names a geom. Two kinds sharing `bar` agree on positioning and on how the extent
 * reads.
 */
export interface GeomGrammar {
	coord: Coord;
	proportional: boolean;
}

const BY_GEOM = new Map<Geom, GeomGrammar>(
	(Object.keys(GRAMMAR) as PlotKind[]).map((kind) => {
		const {geom, coord, proportional} = GRAMMAR[kind];
		return [geom, {coord, proportional}];
	}),
);

export const geomGrammar = (geom: Geom): GeomGrammar | undefined => BY_GEOM.get(geom);

/**
 * Whether the vertical scale these geoms share has to include zero.
 *
 * True where one reads its extent as a length from zero. A treemap and a sankey answer false.
 */
export const groundedGeoms = (geoms: readonly Geom[]): boolean =>
	geoms.some((geom) => {
		const grammar = geomGrammar(geom);
		return grammar ? grammar.proportional && isAxial(grammar.coord) : false;
	});

/** The same question asked of kinds, for a caller with a spec and no frame. */
export const groundedKinds = (kinds: readonly PlotKind[]): boolean =>
	groundedGeoms(kinds.map((kind) => GRAMMAR[kind]?.geom).filter((geom): geom is Geom => geom != null));

/**
 * Whether an aggregate the author set reaches this kind's statistic, given the scale its X runs.
 *
 * The `aggregated` column with `"axis"` resolved against the horizontal scale.
 */
export const readsAggregate = (kind: PlotKind, axisKind: AxisKind): boolean => {
	const {aggregated} = GRAMMAR[kind];
	return aggregated === "axis" ? axisKind === "band" : aggregated;
};
