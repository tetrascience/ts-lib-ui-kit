/**
 * What each kind draws with, one row per member of `PlotKind`.
 *
 * A row names the aesthetics, paints, style fields and layer fields its kind reads. Two kinds sharing
 * a geometry each take a row.
 */

import {GRAMMAR, type Stat} from "./grammar.js";
import type {Geom} from "./layers.js";
import type {ChartSpec, ColorScale, LayerSpec, LayerStyle, PlotKind, StatParams} from "./spec.js";

/**
 * An aesthetic a geom maps a column to. ggplot's names.
 *
 * Positional names where a kind reads the frame's shared pair, role names where it does not.
 */
export type Aesthetic =
	| "x"
	| "y"
	| "z"
	| "ymin"
	| "ymax"
	| "xend"
	| "yend"
	/* The edge or line, and the interior. A geom maps the one its own paint is. */
	| "color"
	| "fill"
	| "size"
	/*
	  The three channels a figure keeps when its color is gone.

	  Chart-design rule 8 asks for a second channel. A dash splits the series.
	*/
	| "shape"
	| "alpha"
	| "linetype"
	| "source"
	| "target"
	| "value"
	/* A genome's own three: the chromosome, and the span a row covers along it. */
	| "sector"
	| "start"
	| "end"
	| "dimensions"
	| "faces"
	| "label"
	| "parent"
	/* ggplot's `group`: splits a path without owning its color or its dash. */
	| "group"
	/* The reference geoms' own positions. `abline` reads the last two in transformed space. */
	| "xintercept"
	| "yintercept"
	| "slope"
	| "intercept";

/** Channels binding several columns at once. A channel binds one column unless named here. */
export type ListAesthetic = "dimensions" | "faces";

/**
 * What a channel resolves to -- a column id, or several.
 *
 * `dimensions` takes as many measures as the figure draws axes for. `faces` takes three.
 */
export type BoundTo<C extends Aesthetic> = C extends "faces"
	? readonly [string, string, string]
	: C extends ListAesthetic
		? readonly string[]
		: string;

/**
 * The two paints, ggplot's color and fill.
 *
 * `fill` is the interior and `color` is the edge or the line.
 */
export type Paint = "fill" | "color";

/**
 * A part of a composite geom, paintable on its own.
 *
 * A boxplot is a box, a median, two whiskers, two staples and its outliers. `LayerStyle.parts` is
 * keyed by these.
 */
export type GeomPart =
	| "band"
	| "whisker"
	| "staple"
	| "median"
	| "box"
	| "outlier"
	| "quantile"
	| "replicate"
	| "outline"
	| "label"
	/* A step that moved the total up, one that moved it down, and the rule joining one step to the next. */
	| "rise"
	| "fall"
	| "connector";

/** Style fields other than the two paints, which each row names for itself. */
export type StyleField =
	| "cornerRadius"
	| "cellGap"
	| "fadeBySupport"
	| "emptyAsZero"
	| "size"
	| "sizeRange"
	| "shape"
	| "alpha"
	| "linewidth"
	| "linetype"
	| "halo"
	| "hollow"
	| "thickness"
	| "half"
	| "step"
	| "tiling"
	| "arrow"
	| "innerRadius"
	| "gap"
	| "rotate"
	| "inset"
	| "radius"
	| "sweep"
	| "sections"
	| "isoLevel"
	| "panes"
	| "hjust"
	| "vjust"
	| "fontSize";

/**
 * A field a layer states, beyond the four any layer carries.
 *
 * `name`, `axis` and `visible` apply whatever is drawn. These are the ones a statistic
 * decides. `bin` names no field: a kind listing it bins a continuous x and takes `stat_bin`'s parameters.
 */
export type LayerField =
	| "aggregate"
	| "bin"
	| "error"
	| "replicates"
	| "position"
	| "directLabels"
	| "numbers"
	| "rings"
	| "links"
	| "fit"
	| "cumulative";

export interface GeomFacts {
	/** Channels the geom draws nothing without. */
	requires: readonly Aesthetic[];
	/** Channels it reads where they are bound. */
	accepts: readonly Aesthetic[];
	/**
	 * Paints it draws with. The first is the geometry's own ink.
	 *
	 * The palette's color lands on that first paint. It is `fill` on an interior and `color` on a
	 * line.
	 */
	paints: readonly Paint[];
	style: readonly StyleField[];
	parts: readonly GeomPart[];
	layer: readonly LayerField[];
}

export const GEOMS = {
	/*
    `position` reaches the point geometry for the adjustments that move a mark.

    Jitter, jitterdodge and nudge each offset a geom off its own reading.
  */
	point: {
		requires: ["x", "y"],
		accepts: ["color", "size", "shape", "alpha", "group"],
		paints: ["color"],
		style: ["size", "sizeRange", "shape", "alpha", "halo", "hollow"],
		parts: ["outline", "label"],
		layer: ["directLabels", "fit", "position"],
	},
	line: {
		requires: ["x", "y"],
		accepts: ["color", "linetype", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth", "linetype", "step"],
		parts: ["label"],
		layer: ["aggregate", "position", "directLabels", "cumulative"],
	},
	area: {
		requires: ["x", "y"],
		accepts: ["fill", "group"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth"],
		parts: ["label"],
		layer: ["aggregate", "bin", "error", "position", "directLabels", "cumulative"],
	},
	ribbon: {
		requires: ["x", "ymin", "ymax"],
		accepts: ["y", "fill", "group"],
		paints: ["fill", "color"],
		style: ["alpha"],
		parts: ["band"],
		layer: [],
	},
	/*
    The band's channels, drawn a mark at a time. ggplot's four interval geoms.

    `thickness` is the cap's reach and the crossbar's width. `median` is the estimate, which the
    pointrange and the crossbar mark.
  */
	errorbar: {
		requires: ["x", "ymin", "ymax"],
		accepts: ["y", "color", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["whisker"],
		layer: [],
	},
	linerange: {
		requires: ["x", "ymin", "ymax"],
		accepts: ["y", "color", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth"],
		parts: ["whisker"],
		layer: [],
	},
	pointrange: {
		requires: ["x", "ymin", "ymax"],
		accepts: ["y", "color", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth"],
		parts: ["median", "whisker"],
		layer: [],
	},
	crossbar: {
		requires: ["x", "ymin", "ymax"],
		accepts: ["y", "color", "group"],
		paints: ["color", "fill"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["median", "whisker"],
		layer: [],
	},
	segment: {
		requires: ["x", "y", "xend", "yend"],
		accepts: ["color", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth", "arrow"],
		parts: [],
		layer: [],
	},
	smooth: {
		requires: ["x", "y"],
		accepts: ["color", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth"],
		parts: ["band"],
		layer: [],
	},
	bar: {
		requires: ["x"],
		accepts: ["y", "fill"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["whisker", "staple", "replicate", "label"],
		layer: ["aggregate", "error", "replicates", "position", "directLabels", "cumulative"],
	},
	/* The bar's geometry under a count. The statistic is fixed, and `aggregate` is off the row. */
	histogram: {
		requires: ["x"],
		accepts: ["y", "fill"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["whisker", "staple", "replicate", "label"],
		layer: ["error", "replicates", "position", "directLabels", "cumulative"],
	},
	/*
    The bar's channels less the fill one, and the hue is the step's direction.

    A rise and a fall take separate paints through `parts`. `position` is off the row.
  */
	waterfall: {
		requires: ["x"],
		accepts: ["y"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["rise", "fall", "connector", "label"],
		layer: ["aggregate", "directLabels"],
	},
	boxplot: {
		requires: ["y"],
		accepts: ["x", "fill"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "thickness"],
		parts: ["box", "whisker", "staple", "median", "outlier", "replicate"],
		layer: ["replicates"],
	},
	/*
    A run between bin centers, painting like a line and binning like a bar.

    A color, a dash or a group puts one run per value.
  */
	freqpoly: {
		requires: ["x"],
		accepts: ["y", "color", "linetype", "group"],
		paints: ["color"],
		style: ["alpha", "linewidth", "linetype", "step"],
		parts: ["label"],
		layer: ["position", "directLabels", "cumulative"],
	},
	/*
    A curve with an interior. `area` names the same pair.

    The fill shows where two densities overlap and the stroke keeps them separable. A color, a fill
    or a group draws one curve per value.
  */
	density: {
		requires: ["x"],
		accepts: ["color", "fill", "group"],
		paints: ["color", "fill"],
		style: ["alpha", "linewidth"],
		parts: ["label"],
		layer: ["directLabels"],
	},
	violin: {
		requires: ["y"],
		accepts: ["x", "fill"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "thickness", "half"],
		parts: ["box", "median", "outlier", "quantile", "replicate"],
		layer: ["replicates"],
	},
	hex: {
		requires: ["x", "y"],
		accepts: [],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "tiling"],
		parts: ["outline"],
		layer: [],
	},
	/* `z` bound draws the rows' own lattice in bands. Unbound, the stat estimates a density. */
	contour: {
		requires: ["x", "y"],
		accepts: ["z"],
		paints: ["fill", "color"],
		style: ["alpha"],
		parts: ["band"],
		layer: [],
	},
	/* `dimensions` binds the measures a gate grid compares against their cuts. */
	heatmap: {
		requires: ["x", "y"],
		accepts: ["z", "dimensions"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "cornerRadius", "cellGap", "fadeBySupport", "emptyAsZero"],
		parts: ["label", "outline"],
		layer: ["aggregate", "numbers"],
	},
	/* A hierarchy names its cells and nests them, which is `label`, `value` and `parent`. */
	treemap: {
		requires: ["label"],
		accepts: ["value", "parent"],
		paints: ["fill", "color"],
		style: ["alpha"],
		parts: ["label", "outline"],
		layer: ["aggregate"],
	},
	/* The same three channels. The two arrangements read one layout. */
	icicle: {
		requires: ["label"],
		accepts: ["value", "parent"],
		paints: ["fill", "color"],
		style: ["alpha"],
		parts: ["label", "outline"],
		layer: ["aggregate"],
	},
	/*
    The hierarchy's three channels, drawn round a center.

    `numbers` joins them. A cell in a ring is read off an angle unless the figure writes the value
    on it.
  */
	sunburst: {
		requires: ["label"],
		accepts: ["value", "parent"],
		paints: ["fill", "color"],
		style: ["alpha"],
		parts: ["label", "outline"],
		layer: ["aggregate", "directLabels", "numbers"],
	},
	sankey: {
		requires: ["source", "target"],
		accepts: ["value"],
		paints: ["fill"],
		style: ["alpha"],
		parts: ["label"],
		layer: [],
	},
	/*
    A sector per chromosome, a tile per band, and the reading each tile covers.

    `fill` paints a tile by its stain. The rings outside read the same rows.
  */
	ideogram: {
		requires: ["sector", "start", "end"],
		accepts: ["fill"],
		paints: ["fill"],
		style: ["alpha", "gap", "rotate"],
		parts: ["label"],
		layer: ["numbers", "rings", "links"],
	},
	/*
    The flow's channels, read round a center.

    `numbers` writes the axis each sector carries in its own units.
  */
	chord: {
		requires: ["source", "target"],
		accepts: ["value"],
		paints: ["fill"],
		style: ["alpha", "gap", "rotate", "inset"],
		parts: ["label"],
		layer: ["numbers", "rings"],
	},
	parcoords: {
		requires: ["dimensions"],
		accepts: ["color"],
		paints: ["color"],
		style: ["alpha"],
		parts: [],
		layer: [],
	},
	/*
    The parallel plot's channels, read round a center.

    The list is ordered and the order is the author's statement. `fill` stays low -- a closed
    polygon's area stands for nothing.
  */
	radar: {
		requires: ["dimensions"],
		accepts: ["color"],
		paints: ["color", "fill"],
		style: ["alpha"],
		parts: [],
		layer: [],
	},
	/*
    The polar rows. A pie reads the shared pair, and a gauge reads one magnitude.

    `numbers` on all three states the condition polar is permitted under.
  */
	/* `innerRadius` above zero clears the hole, a donut. */
	pie: {
		requires: ["x"],
		accepts: ["y", "fill"],
		paints: ["fill", "color"],
		style: ["alpha", "linewidth", "innerRadius"],
		parts: ["label", "outline"],
		layer: ["aggregate", "directLabels", "numbers"],
	},
	/*
    One bound magnitude and no position of its own. The channel takes a role name.

    `thickness` is the arc's weight in pixels.
  */
	gauge: {
		requires: ["value"],
		accepts: [],
		paints: ["fill"],
		style: ["alpha", "thickness", "radius", "sweep", "sections"],
		parts: ["label"],
		layer: ["aggregate", "numbers"],
	},
	point3d: {
		requires: ["x", "y", "z"],
		accepts: ["color", "size"],
		paints: ["color"],
		style: ["size", "sizeRange", "panes"],
		parts: [],
		layer: [],
	},
	surface: {
		requires: ["x", "y", "z"],
		accepts: [],
		paints: ["fill"],
		style: ["panes"],
		parts: [],
		layer: ["aggregate"],
	},
	mesh3d: {
		requires: ["x", "y", "z", "faces"],
		accepts: [],
		paints: ["fill"],
		style: ["panes"],
		parts: [],
		layer: [],
	},
	isosurface: {
		requires: ["x", "y", "z"],
		accepts: ["value"],
		paints: ["fill"],
		style: ["isoLevel", "panes"],
		parts: [],
		layer: [],
	},
	volume: {
		requires: ["x", "y", "z"],
		accepts: ["value"],
		paints: ["fill"],
		style: ["panes"],
		parts: [],
		layer: [],
	},
	/* A reference line reads its own position and nothing of the shared pair. `label` is rule 4's text. */
	hline: {
		requires: ["yintercept"],
		accepts: ["color", "linetype", "label"],
		paints: ["color"],
		style: ["alpha", "linewidth", "linetype"],
		parts: [],
		layer: [],
	},
	vline: {
		requires: ["xintercept"],
		accepts: ["color", "linetype", "label"],
		paints: ["color"],
		style: ["alpha", "linewidth", "linetype"],
		parts: [],
		layer: [],
	},
	abline: {
		requires: ["slope", "intercept"],
		accepts: ["color", "linetype", "label"],
		paints: ["color"],
		style: ["alpha", "linewidth", "linetype"],
		parts: [],
		layer: [],
	},
	/* A label per row at its reading. A dodge moves it into the slot of the bar it names. */
	text: {
		requires: ["x", "y", "label"],
		accepts: ["color", "group"],
		paints: ["color"],
		style: ["hjust", "vjust", "fontSize"],
		parts: [],
		layer: ["position"],
	},
	/* The text row, with a box behind each label. */
	label: {
		requires: ["x", "y", "label"],
		accepts: ["color", "group"],
		paints: ["color"],
		style: ["hjust", "vjust", "fontSize"],
		parts: [],
		layer: ["position"],
	},
} as const satisfies Record<PlotKind, GeomFacts>;

/** The geometry a kind resolves to, read at the type level. */
export type GeomOf<K extends PlotKind> = (typeof GRAMMAR)[K]["geom"];

/** The row a kind reads. */
type FactsOf<K extends PlotKind> = (typeof GEOMS)[K];

/** Channels a kind draws nothing without. */
export type RequiredAesthetic<K extends PlotKind> = FactsOf<K>["requires"][number];

/** Channels a kind reads where they are bound. */
export type OptionalAesthetic<K extends PlotKind> = FactsOf<K>["accepts"][number];

/** Paints a kind draws with. The first is its own ink. */
export type PaintOf<K extends PlotKind> = FactsOf<K>["paints"][number];

/** Style fields a kind reads, apart from its paints. */
export type StyleOf<K extends PlotKind> = FactsOf<K>["style"][number];

/** Parts of a kind's geometry, each paintable on its own. */
export type PartOf<K extends PlotKind> = FactsOf<K>["parts"][number];

/** Layer fields a kind's statistic reaches. */
export type LayerFieldOf<K extends PlotKind> = FactsOf<K>["layer"][number];

/**
 * Paint per part, for a kind with parts on its geometry.
 *
 * `never` where the row names none, which refuses the field.
 */
export type Parts<K extends PlotKind> = [PartOf<K>] extends [never]
	? never
	: Partial<Record<PartOf<K>, Omit<LayerStyle, "parts">>>;

/**
 * Statistics a kind runs.
 *
 * `never` where the kind draws its records as they are. An empty `stat` list.
 */
export type StatOf<K extends PlotKind> = (typeof GRAMMAR)[K]["stat"][number];

/**
 * Which parameters each statistic reads.
 *
 * `GEOMS` says what a geometry draws with and this says what the statistic reads. A kind running
 * two statistics reads both rows.
 */
export interface StatOptions {
	/** R's `stat_bin`: the width of an interval, where its edges fall, and which empty ones survive. */
	bin: Pick<StatParams, "binwidth" | "bins" | "center" | "boundary" | "closed" | "pad" | "breaks" | "dropEmpty">;
	/**
	 * R's `stat_bin_2d` and `stat_bin_hex` -- the same, per axis, over a lattice of cells.
	 *
	 * `pad` and `breaks` are off this row. `drop` reads as the boolean it is on `stat_bin_2d`.
	 */
	bin2d: Pick<StatParams, "binwidth" | "bins" | "center" | "boundary" | "closed" | "drop">;
	count: Record<never, never>;
	summary: Record<never, never>;
	/** What a flow's value is measured against, which decides the thickness a count draws at. */
	flow: Pick<StatParams, "normalize" | "align">;
	/** R's `stat_boxplot`: the whisker's reach and the quantile definition behind the quartiles. */
	boxplot: Pick<StatParams, "coef" | "quantileType">;
	/** R's `stat_density`: the one-dimensional kernel a curve draws. */
	density: Pick<StatParams, "bw" | "adjust" | "kernel" | "n" | "trim" | "bounds">;
	/**
	 * R's `stat_ydensity` -- the violin's kernel.
	 *
	 * The same six as `density` less `n`, plus the three a set of violins needs.
	 */
	ydensity: Pick<StatParams, "bw" | "adjust" | "kernel" | "trim" | "bounds" | "scale" | "drop" | "quantiles">;
	/**
	 * R's `stat_density_2d` -- the estimate a contour cuts into rings.
	 *
	 * `adjust` alone. The contour estimates in pixel space and a multiplier on the smoothing
	 * radius applies.
	 */
	density2d: Pick<StatParams, "adjust">;
}

/**
 * A union of statistics as one object.
 *
 * A violin runs `boxplot` and `ydensity`, and the layer takes the parameters of both at once.
 */
type Intersected<U> = (U extends unknown ? (held: U) => void : never) extends (held: infer I) => void ? I : never;

/** Parameters of each statistic a kind runs. The empty object where it runs none. */
export type StatArgs<S extends Stat> = [S] extends [never] ? Record<never, never> : Intersected<StatOptions[S]>;

/**
 * The parameters each statistic reads, for the sort the builder runs over a layer's flat options.
 *
 * `StatOptions` at run time, held to it by `EveryStatKeyListed` below.
 */
const STAT_PARAMS = {
	bin: ["binwidth", "bins", "center", "boundary", "closed", "pad", "breaks", "dropEmpty"],
	bin2d: ["binwidth", "bins", "center", "boundary", "closed", "drop"],
	count: [],
	summary: [],
	flow: ["normalize", "align"],
	boxplot: ["coef", "quantileType"],
	density: ["bw", "adjust", "kernel", "n", "trim", "bounds"],
	ydensity: ["bw", "adjust", "kernel", "trim", "bounds", "scale", "drop", "quantiles"],
	density2d: ["adjust"],
} as const satisfies {[S in Stat]: readonly (keyof StatOptions[S])[]};

/**
 * Nothing, where each statistic's list above holds each parameter `StatOptions` gives it, and each
 * name in `StatParams` sits on a list.
 *
 * A name missing here would fail at the builder as no option of the layer.
 */
type EveryStatKeyListed =
	| {[S in Stat]: Exclude<keyof StatOptions[S], (typeof STAT_PARAMS)[S][number]>}[Stat]
	| Exclude<keyof StatParams, (typeof STAT_PARAMS)[Stat][number]>;
const statKeysComplete: [EveryStatKeyListed] extends [never] ? true : false = true;
void statKeysComplete;

const isStat = (name: string): name is Stat => name in STAT_PARAMS;

/**
 * The statistic parameters a kind reads: those of each statistic its `GRAMMAR` row runs, and the
 * bin statistic's where its `GEOMS` row lists `bin`.
 */
export const statKeysOf = (kind: PlotKind): ReadonlySet<string> =>
	new Set(
		[...GRAMMAR[kind].stat, ...(GEOMS[kind].layer as readonly string[]).filter(isStat)].flatMap(
			(stat): readonly string[] => STAT_PARAMS[stat],
		),
	);

/**
 * Keys of `LayerStyle` a layer states flat, gathered off the table.
 *
 * What `add` splits a layer's options on. Gathered off the rows.
 */
export const STYLE_KEYS: ReadonlySet<string> = new Set(
	Object.values(GEOMS).flatMap((row) => [...row.paints, ...row.style]),
);

/** The geometry a kind resolves to, read off `GRAMMAR`. */
export const geomOf = (kind: PlotKind): Geom => GRAMMAR[kind].geom;

/** What one kind draws with. */
export const kindFacts = (kind: PlotKind): GeomFacts => GEOMS[kind];

/** The aesthetics by name, gathered off the rows. Each member of `Aesthetic` is on some row. */
const AESTHETICS: ReadonlySet<string> = new Set(
	Object.values(GEOMS).flatMap((row): readonly string[] => [...row.requires, ...row.accepts]),
);

/** Whether a key names an aesthetic, for a caller holding a key no compiler checked. */
export const isAesthetic = (key: string): key is Aesthetic => AESTHETICS.has(key);

/** A kind's own ink, which is the paint the palette and the author's pick land on. */
export const ownPaint = (kind: PlotKind): Paint => kindFacts(kind).paints[0] ?? "color";

/**
 * The paint aesthetic a layer's palette and color scale route through.
 *
 * A bar maps `fill` and a line maps `color`. A kind mapping both takes the first one its aes binds,
 * and a kind mapping neither takes its own paint.
 */
export function paintAesthetic(layer: Pick<LayerSpec, "kind" | "aes">): Paint {
	const mapped = mappedPaints(layer.kind);
	return mapped.find((paint) => typeof layer.aes[paint] === "string") ?? mapped[0] ?? ownPaint(layer.kind);
}

/** The paints a kind maps a column to, in its paint order. A grid's ramp reads `z` and maps none. */
const mappedPaints = (kind: PlotKind): Paint[] => {
	const facts = kindFacts(kind);
	return facts.paints.filter((paint) => (facts.accepts as readonly Aesthetic[]).includes(paint));
};

/** The column a layer's paint aesthetic binds, where its kind maps one and the aes binds it. */
export const paintColumn = (layer: Pick<LayerSpec, "kind" | "aes">): string | undefined => {
	const aesthetic = paintAesthetic(layer);
	const column = mappedPaints(layer.kind).includes(aesthetic) ? layer.aes[aesthetic] : undefined;
	return typeof column === "string" ? column : undefined;
};

/**
 * The color scale a layer reads: the chart's and the layer's own on its paint aesthetic, merged.
 *
 * The layer's wins field by field. Absent where neither states one.
 */
export function layerScale(plot: Pick<ChartSpec, "scales">, layer: LayerSpec): ColorScale | undefined {
	const aesthetic = paintAesthetic(layer);
	const chart = plot.scales?.[aesthetic];
	const own = layer.scales?.[aesthetic];
	return chart || own ? {...chart, ...own} : undefined;
}

/**
 * The color a layer states for its geoms, read off the kind's own paint.
 *
 * A bar's is its `fill` and a line's its `color`. Absent where the author picked none.
 */
export const geomColor = (style: LayerStyle | undefined, kind: PlotKind): string | undefined => style?.[ownPaint(kind)];

/**
 * The style with a kind's own paint set to a color.
 *
 * What a control offering one color per series writes. `geomColor` reads it back.
 */
export const paintedWith = (style: LayerStyle, kind: PlotKind, color: string): LayerStyle => ({
	...style,
	[ownPaint(kind)]: color,
});
