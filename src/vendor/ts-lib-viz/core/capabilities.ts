/**
 * What a chart type needs, and whether a source can supply it.
 *
 * Each kind declares its channels as role requirements and the schema answers. Anything
 * unsatisfied appears grayed.
 */

import {GEOMS, type Aesthetic, type GeomFacts, type OptionalAesthetic, type RequiredAesthetic} from "./geom-table.js";
import type {PlotFieldRole} from "./plot-data.js";
import type {PlotKind} from "./spec.js";

export interface AestheticReq {
	aesthetic: Aesthetic;
	label: string;
	roles: PlotFieldRole[];
	required: boolean;
}

export interface Capability<K> {
	kind: K;
	label: string;
	describe: string;
	/** The kind's required aesthetics, then the ones it accepts, in the geom table's order. */
	aesthetics: AestheticReq[];
}

/** What a control calls an aesthetic, and the roles a column needs to bind it. */
type Offered = Pick<AestheticReq, "label" | "roles">;

/** Each aesthetic's name and roles on a kind that states none of its own. */
const DEFAULT: Record<Aesthetic, Offered> = {
	x: {label: "X", roles: ["measure", "timestamp", "dimension"]},
	y: {label: "Y", roles: ["measure"]},
	z: {label: "Z", roles: ["measure"]},
	ymin: {label: "Low", roles: ["measure"]},
	ymax: {label: "High", roles: ["measure"]},
	xend: {label: "X end", roles: ["measure", "timestamp"]},
	yend: {label: "Y end", roles: ["measure"]},
	color: {label: "Color", roles: ["dimension", "identity", "measure", "status"]},
	fill: {label: "Fill", roles: ["dimension", "identity", "measure", "status"]},
	size: {label: "Size", roles: ["measure"]},
	shape: {label: "Shape", roles: ["dimension", "identity", "status"]},
	alpha: {label: "Opacity", roles: ["measure", "dimension"]},
	linetype: {label: "Dash", roles: ["dimension", "identity", "status"]},
	source: {label: "From", roles: ["stage", "dimension", "status"]},
	target: {label: "To", roles: ["stage", "dimension", "status"]},
	value: {label: "Value", roles: ["measure"]},
	sector: {label: "Sector", roles: ["dimension", "identity"]},
	start: {label: "From", roles: ["measure"]},
	end: {label: "To", roles: ["measure"]},
	dimensions: {label: "Measures", roles: ["measure"]},
	faces: {label: "Faces", roles: ["measure"]},
	label: {label: "Label", roles: ["dimension", "identity"]},
	parent: {label: "Nesting", roles: ["parent", "dimension"]},
	group: {label: "Group", roles: ["dimension", "identity", "stage", "status"]},
	xintercept: {label: "X", roles: ["measure", "timestamp"]},
	yintercept: {label: "Y", roles: ["measure"]},
	slope: {label: "Slope", roles: ["measure"]},
	intercept: {label: "Intercept", roles: ["measure"]},
};

/**
 * How the builder offers one kind. The geom table decides which aesthetics it binds.
 *
 * `aesthetics` states a name and roles where the default reads wrong on this kind. It names only
 * aesthetics the kind's row binds.
 */
interface Offer<K extends PlotKind> {
	label: string;
	describe: string;
	aesthetics?: {[A in RequiredAesthetic<K> | OptionalAesthetic<K>]?: Partial<Offered>};
}

/** The channels the four interval kinds share. */
const RANGE = {
	x: {roles: ["timestamp", "measure", "stage", "dimension"]},
	y: {label: "Estimate"},
	color: {label: "Series", roles: ["dimension", "identity"]},
} satisfies Offer<"errorbar">["aesthetics"];

const SERIES: Partial<Offered> = {label: "Series", roles: ["dimension", "identity"]};

const OFFERS: {[K in PlotKind]: Offer<K>} = {
	point: {
		label: "Scatter",
		describe: "Two measures against each other, one geom per record.",
		aesthetics: {x: {roles: ["measure", "timestamp"]}},
	},
	line: {
		label: "Line",
		describe: "A measure over time or over an ordered axis.",
		aesthetics: {x: {roles: ["timestamp", "measure", "stage"]}, color: SERIES},
	},
	area: {
		label: "Area",
		describe: "A measure over an ordered axis, filled to zero.",
		aesthetics: {x: {roles: ["timestamp", "measure", "stage"]}, fill: SERIES},
	},
	ribbon: {
		label: "Interval",
		describe: "A band between two bound measures, for a confidence or tolerance interval.",
		aesthetics: {x: RANGE.x, y: RANGE.y, fill: SERIES},
	},
	/* The band's channels drawn a mark at a time, as ggplot's four interval geoms. */
	errorbar: {label: "Error bar", describe: "An interval per reading, capped at both ends.", aesthetics: RANGE},
	linerange: {label: "Line range", describe: "An interval per reading, as a bare run.", aesthetics: RANGE},
	pointrange: {
		label: "Point range",
		describe: "An interval per reading, with its estimate marked on the run.",
		aesthetics: RANGE,
	},
	crossbar: {
		label: "Crossbar",
		describe: "An interval per reading, as a box with its estimate across it.",
		aesthetics: RANGE,
	},
	segment: {
		label: "Segment",
		describe: "A run per record from one position to another, for a before-and-after pair or a drift.",
		aesthetics: {
			x: {label: "X start", roles: ["timestamp", "measure", "stage"]},
			y: {label: "Y start"},
			xend: {roles: ["timestamp", "measure", "stage"]},
			color: SERIES,
		},
	},
	smooth: {
		label: "Trend",
		describe: "The conditional mean through two measures, drawn as a curve with its interval.",
		aesthetics: {x: {roles: ["measure", "timestamp"]}, color: SERIES},
	},
	bar: {
		label: "Bar",
		describe: "An aggregate per category. Counts when no measure is bound.",
		aesthetics: {
			x: {label: "Category", roles: ["dimension", "stage", "status", "priority", "owner", "identity"]},
			y: {label: "Value"},
			fill: {label: "Stack", roles: ["dimension", "status"]},
		},
	},
	/* Signed steps on a running total, offered beside the bar. No fill channel: the hue is each step's direction. */
	waterfall: {
		label: "Waterfall",
		describe: "Signed steps on a running total. Where a population gained and lost.",
		aesthetics: {
			x: {label: "Steps", roles: ["stage", "dimension", "status", "priority", "owner", "identity"]},
			y: {label: "Change"},
		},
	},
	histogram: {
		label: "Histogram",
		describe: "The distribution of one measure.",
		aesthetics: {
			x: {label: "Measure", roles: ["measure"]},
			y: {label: "Value"},
			fill: {label: "Split", roles: ["dimension", "status"]},
		},
	},
	freqpoly: {
		label: "Frequency polygon",
		describe: "The same count under the same bin as a histogram, drawn as a line.",
		aesthetics: {
			x: {label: "Measure", roles: ["measure"]},
			y: {label: "Value"},
			color: {label: "Split", roles: ["dimension", "status"]},
		},
	},
	hex: {
		label: "Density",
		describe: "Two measures as binned density. What a scatter becomes at scale.",
		aesthetics: {x: {roles: ["measure"]}},
	},
	boxplot: {
		label: "Box",
		describe: "Quartiles of a measure, optionally per category.",
		aesthetics: {y: {label: "Measure"}, x: {label: "Group", roles: ["dimension", "stage", "owner", "status"]}},
	},
	violin: {
		label: "Violin",
		describe: "Full distribution shape per category, for multimodal data.",
		aesthetics: {y: {label: "Measure"}, x: {label: "Group", roles: ["dimension", "stage", "owner"]}},
	},
	density: {
		label: "Density curve",
		describe: "The distribution of one measure as a kernel density, at a stated bandwidth.",
		aesthetics: {
			x: {label: "Measure", roles: ["measure"]},
			color: {label: "Split", roles: ["dimension", "status"]},
		},
	},
	heatmap: {
		label: "Heatmap",
		describe: "Category by category, cells colored by an aggregate.",
		aesthetics: {
			x: {roles: ["dimension", "stage", "position"]},
			y: {roles: ["dimension", "identity", "position"]},
			/* Unbound, the cells count the rows that landed in them. */
			z: {label: "Color"},
			dimensions: {label: "Cuts"},
		},
	},
	contour: {
		label: "Contour",
		describe: "Smoothed density over two measures, or a third measure's levels over a lattice.",
		aesthetics: {x: {roles: ["measure"]}, z: {label: "Level"}},
	},
	parcoords: {
		label: "Parallel coordinates",
		describe: "One line per record across several measures. The trade-off view.",
		aesthetics: {color: {roles: ["measure", "identity", "status"]}},
	},
	sankey: {
		label: "Sankey",
		describe: "Flow between stages. Where the population went.",
		aesthetics: {value: {label: "Width"}},
	},
	ideogram: {
		label: "Ideogram",
		describe: "A genome round a circle. Where a reading falls along a chromosome.",
		aesthetics: {sector: {label: "Chromosome"}, fill: {label: "Stain", roles: ["dimension", "identity", "status"]}},
	},
	chord: {
		label: "Chord",
		describe: "Flow between names, closed into a circle. Which pairs carry the traffic.",
		aesthetics: {value: {label: "Width"}},
	},
	/* A hierarchy reads no shared pair of scales and its channels take role names. */
	treemap: {
		label: "Treemap",
		describe: "Nested share of a total.",
		aesthetics: {label: {label: "Cells", roles: ["dimension", "identity", "stage"]}, value: {label: "Size"}},
	},
	icicle: {
		label: "Icicle",
		describe: "The same nesting with a row per level, read as a width.",
		aesthetics: {label: {label: "Cells", roles: ["dimension", "identity", "stage"]}, value: {label: "Width"}},
	},
	sunburst: {
		label: "Sunburst",
		describe: "The same nesting round a center, one ring per level.",
		aesthetics: {label: {label: "Cells", roles: ["dimension", "identity", "stage"]}, value: {label: "Share"}},
	},
	pie: {
		label: "Pie",
		describe: "Shares of one whole, as slices. Counts when no measure is bound.",
		aesthetics: {
			x: {label: "Slices", roles: ["dimension", "stage", "status", "priority", "owner", "identity"]},
			y: {label: "Share"},
			fill: {label: "Slices", roles: ["dimension", "status"]},
		},
	},
	gauge: {
		label: "Gauge",
		describe: "One reduction against a stated range, written as a number under its arc.",
		aesthetics: {value: {label: "Reading"}},
	},
	radar: {
		label: "Radar",
		describe: "One polygon per record across several measures, on rules round a center.",
		aesthetics: {color: {roles: ["measure", "identity", "status"]}},
	},
	point3d: {
		label: "Scatter 3D",
		describe: "Three measures on three scales, one geom per record. Turn it to read depth.",
		aesthetics: {x: {roles: ["measure", "timestamp"]}},
	},
	surface: {
		label: "Surface",
		describe: "A measure as height over two dimensions. A relief, meshed.",
		aesthetics: {x: {roles: ["measure", "dimension"]}, y: {roles: ["measure", "dimension"]}, z: {label: "Height"}},
	},
	mesh3d: {
		label: "Mesh",
		describe: "Vertices and faces as the object they are. A structure, not a plot of one.",
		aesthetics: {x: {roles: ["measure"]}},
	},
	isosurface: {
		label: "Isosurface",
		describe: "The shell where a scalar field holds one value.",
		aesthetics: {x: {roles: ["measure"]}, value: {label: "Field"}},
	},
	volume: {
		label: "Volume",
		describe: "A scalar field read through its whole depth, with a transfer function.",
		aesthetics: {x: {roles: ["measure"]}, value: {label: "Field"}},
	},
	/* ggplot's three reference geoms, a layer over another kind. Each reads its own position. */
	hline: {
		label: "Horizontal line",
		describe: "A reference line at each value, across the plot area and labeled where it ends.",
		aesthetics: {color: SERIES},
	},
	vline: {
		label: "Vertical line",
		describe: "A reference line at each value, up the plot area and labeled where it ends.",
		aesthetics: {color: SERIES},
	},
	abline: {
		label: "Sloped line",
		describe: "A line from a slope and an intercept, read in the scales' transformed space.",
		aesthetics: {color: SERIES},
	},
	/* ggplot's two text geoms, a layer over another kind. The second boxes each label. */
	text: {
		label: "Text",
		describe: "A label per row at its reading, for naming bars, points or a region.",
		aesthetics: {
			x: {roles: ["measure", "timestamp", "dimension", "identity"]},
			label: {label: "Text", roles: ["dimension", "identity", "measure"]},
			color: SERIES,
		},
	},
	label: {
		label: "Label",
		describe: "The same label with a box behind it, for text over a busy region.",
		aesthetics: {
			x: {roles: ["measure", "timestamp", "dimension", "identity"]},
			label: {label: "Text", roles: ["dimension", "identity", "measure"]},
			color: SERIES,
		},
	},
};

/** A kind's offer, with each aesthetic its geom table row binds. */
function capabilityOf<K extends PlotKind>(kind: K, {label, describe, aesthetics = {}}: Offer<K>): Capability<K> {
	const row: GeomFacts = GEOMS[kind];
	const stated = aesthetics as Partial<Record<Aesthetic, Partial<Offered>>>;
	const offered = (aesthetic: Aesthetic, required: boolean): AestheticReq => ({
		aesthetic,
		...DEFAULT[aesthetic],
		...stated[aesthetic],
		required,
	});
	return {
		kind,
		label,
		describe,
		aesthetics: [
			...row.requires.map((aesthetic) => offered(aesthetic, true)),
			...row.accepts.map((aesthetic) => offered(aesthetic, false)),
		],
	};
}

/** Each kind as the builder offers it, in menu order. */
export const PLOTS: readonly Capability<PlotKind>[] = Object.freeze(
	(Object.entries(OFFERS) as [PlotKind, Offer<PlotKind>][]).map(([kind, offer]) => capabilityOf(kind, offer)),
);
