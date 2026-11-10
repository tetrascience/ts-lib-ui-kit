/**
 * The plot spec -- what an author states and a renderer reads.
 *
 * The package's public grammar, and its fields are semver surface. A chart is data.
 */

import type {Aggregate} from "./aggregate.js";
import type {BinClosed, BinDrop, PerAxis} from "./binning.js";
import type {LinkFields} from "./circular.js";
import type {RingPanel} from "./rings.js";
import type {ClusterDistance, DepthScale, Linkage} from "./cluster.js";
import type {WaivableCode} from "./finding-codes.js";
import type {PointShape} from "./geom-types.js";
import type {PaletteName} from "./palette.js";
import type {Aesthetic, Parts} from "./geom-table.js";
import type {Bandwidth, Kernel, QuantileType} from "./stats.js";
import type {AxisTransform} from "./transform.js";

/**
 * Column ids per aesthetic, ggplot's `aes()`. Which aesthetics apply depends on the kind.
 *
 * Keyed by `Aesthetic` alone. An unknown key fails to compile at `plot()` and throws at a layer.
 */
export type Aes = Partial<Record<Aesthetic, string | readonly string[]>>;

/**
 * What happens where two geoms share a band.
 *
 * Each adjustment reads its own arguments. `"dodge"` and `{kind: "dodge"}` are one request.
 */
export type Position =
	| PositionKind
	/** ggplot's `position_stack` and `position_fill`. */
	| {
			kind: "stack" | "fill";
			/** Hands the slots out in reverse. The first series lands on top. */
			reverse?: boolean;
			/**
			 * Where a stack's floor runs. Zero unless stated.
			 *
			 * `silhouette` centers each stack on zero. `wiggle` keeps the layers flat, a streamgraph.
			 * `fill` ignores both.
			 */
			offset?: "zero" | "silhouette" | "wiggle";
			/**
			 * Where a point or a line falls inside its own segment. Zero at the floor, one at the far end.
			 *
			 * Defaults to one, ggplot's top on a positive reading. A negative segment's far end is its bottom.
			 */
			vjust?: number;
	  }
	/** ggplot's `position_dodge` and `position_dodge2`. */
	| {
			kind: "dodge" | "dodge2";
			/**
			 * How much of the band the dodged set takes, as a fraction. One takes it whole.
			 *
			 * ggplot's `width`. It aligns a narrow geom with a wider one beside it.
			 */
			width?: number;
			/**
			 * Whether a slot's width follows its own band's groups.
			 *
			 * `total` is the default, as in ggplot: each band divides by its own count. `single` keeps one
			 * width across the bands.
			 */
			preserve?: "total" | "single";
			reverse?: boolean;
	  }
	/** ggplot's `position_jitter` and `position_jitterdodge`. */
	| {
			kind: "jitter" | "jitterdodge";
			/**
			 * How far a geom may move each way along x, in data units. The offset is uniform in plus or
			 * minus this.
			 *
			 * Absent takes 0.4 times the axis's resolution, its smallest gap. A band axis has resolution 1.
			 * A jitterdodge divides the width, stated or not, by its color levels plus two, as ggplot does.
			 */
			width?: number;
			/** The same along y. Absent on a jitterdodge moves nothing, ggplot's `jitter.height`. */
			height?: number;
			/**
			 * Which offsets come out.
			 *
			 * The offsets are hashed off the row and one spec exports twice to one picture. A seed
			 * shifts the hash.
			 */
			seed?: number;
			/**
			 * Width a jitterdodge's dodged set spans, in data units. A band is one unit wide.
			 *
			 * Each level of the layer's color takes an equal slot of it. Absent takes 0.75, ggplot's
			 * `dodge.width`.
			 */
			dodgeWidth?: number;
	  }
	/** ggplot's `position_nudge`: a fixed offset in the axes' own units. */
	| {kind: "identity" | "nudge"; x?: number; y?: number};

/** The adjustments by name. A bare string states one of these. */
export type PositionKind = "identity" | "stack" | "fill" | "dodge" | "dodge2" | "jitter" | "jitterdodge" | "nudge";

/** The adjustment a position asks for, whichever of the two shapes it was written in. */
export const positionKind = (position: Position | undefined): PositionKind =>
	position == null ? "identity" : typeof position === "string" ? position : position.kind;

/** What a position states beyond its name, as the wide set. A name alone states nothing. */
export const positionArgs = (
	position: Position | undefined,
): {
	reverse?: boolean;
	offset?: "zero" | "silhouette" | "wiggle";
	vjust?: number;
	width?: number;
	height?: number;
	preserve?: "total" | "single";
	seed?: number;
	dodgeWidth?: number;
	x?: number;
	y?: number;
} => (position == null || typeof position === "string" ? {} : position);

/**
 * Chart types the plot builder offers.
 *
 * `parcoords` draws one line per record across several measures. `sankey` renders the funnel.
 */
export type PlotKind =
	| "point"
	| "line"
	| "area"
	| "ribbon"
	| "errorbar"
	| "linerange"
	| "pointrange"
	| "crossbar"
	| "segment"
	| "smooth"
	| "bar"
	| "waterfall"
	| "histogram"
	| "freqpoly"
	| "hex"
	| "boxplot"
	| "violin"
	| "density"
	| "heatmap"
	| "contour"
	| "parcoords"
	| "sankey"
	| "chord"
	| "ideogram"
	| "treemap"
	| "icicle"
	| "sunburst"
	| "pie"
	| "gauge"
	| "radar"
	| "point3d"
	| "surface"
	| "mesh3d"
	| "isosurface"
	| "volume"
	| "hline"
	| "vline"
	| "abline"
	| "text"
	| "label";

/**
 * Where a plot's rows come from.
 *
 * Named by the plot. Binding the rows to the host would make one plot mean two things.
 */
export type PlotSource =
	| {kind: "entity"; id: string}
	| {kind: "dataset"; id: string}
	| {kind: "lookup"; id: string}
	/**
	 * A saved cohort, which is a predicate and no row list.
	 *
	 * Naming the cohort keeps the narrowing in the plot and re-evaluable as rows arrive.
	 */
	| {kind: "cohort"; id: string}
	/**
	 * A block in the document showing the plot, by that block's name.
	 *
	 * The document holds the rows. A dashboard tile pointed at one has nothing to draw.
	 */
	| {kind: "node"; id: string};

/**
 * Which geoms get their name written beside them.
 *
 * Chart-design rule 2 puts the label on the geom. Selective -- eight notable points named and
 * nine hundred bare.
 */
export type LabelWhen =
	| {kind: "all"}
	| {kind: "top"; count: number; on: "x" | "y"; end: "high" | "low"}
	| {kind: "threshold"; on: "x" | "y"; op: "above" | "below"; value: number};

export interface LabelRule {
	/** The field a label draws. */
	field: string;
	when: LabelWhen;
}

/** How a tick label writes its number. `auto` shortens by magnitude, 1.2k for 1200. */
export type TickFormat = "auto" | "fixed" | "scientific" | "percent";

/**
 * Where a band's order comes from, and where its breaks fall.
 *
 * The two sources exclude each other. `cluster` names the computation. `list` takes an order
 * from elsewhere.
 */
export type BandOrder =
	| {
			kind: "list";
			/** The categories, in the order they should appear. Anything absent from the data is skipped. */
			values: readonly string[];
			/** Break positions, each the index in `values` the break sits before. */
			gaps?: readonly number[];
	  }
	| {
			kind: "cluster";
			/**
			 * How far apart two rows are.
			 *
			 * Euclidean by default, matching pheatmap. Correlation reads a row's shape and ignores its
			 * level.
			 */
			distance?: ClusterDistance;
			/** How two clusters are joined. Complete by default, matching pheatmap. */
			method?: Linkage;
			/** Clusters the tree is cut into, which puts a break at each boundary. pheatmap's `cutree`. */
			cut?: number;
			/**
			 * Rows aggregated into this many centroids before the tree is built. pheatmap's `kmeans_k`.
			 *
			 * The escape past `CLUSTER_CAP`. The band then names the centroids.
			 */
			kmeans?: number;
	  };

/**
 * A panel beside the plot area, sharing one of its axes.
 *
 * Four wanted things are one primitive. Each shares one axis and takes a fixed extent on the
 * other.
 */
export interface SidePanel {
	position: "top" | "right" | "bottom" | "left";
	/**
	 * Extent perpendicular to the shared axis, in pixels.
	 *
	 * pheatmap's `treeheight_row` for a dendrogram, one cell for a track.
	 */
	size: number;
	/**
	 * Whether the panel draws inside the axis labels or outside them.
	 *
	 * A track belongs against the cells and a tree belongs outside. Absent takes the content's
	 * answer.
	 */
	inside?: boolean;
	content: SideContent;
}

export type SideContent =
	/**
	 * The tree behind a cluster order, from the merge order and heights that produced it.
	 *
	 * `depth` defaults to `height`, which is R's own plot. `sqrt` opens out tight clusters.
	 */
	| {kind: "dendrogram"; depth?: DepthScale}
	/**
	 * One value per category off another column, as a strip of cells. pheatmap's annotation.
	 *
	 * `palette` names the sequential map a numeric track draws on, separate from the cells'.
	 */
	| {
			kind: "track";
			field: string;
			palette?: PaletteName;
			/**
			 * Whether the legend names the values this figure drew alone. pheatmap's `drop_levels`.
			 *
			 * On by default. Off reads the figure set's assignments and names each pinned value.
			 */
			dropLevels?: boolean;
	  }
	/**
	 * The shared axis's own distribution, binned the way a histogram layer is.
	 *
	 * `binwidth` is in the data's units. Absent takes the Freedman-Diaconis width.
	 */
	| {kind: "histogram"; binwidth?: number}
	/**
	 * The shared axis's own distribution as a kernel density.
	 *
	 * `by: "color"` draws one curve per level of the figure's color channel. Absent pools the
	 * readings.
	 */
	| {kind: "density"; by?: "color"}
	/** One tick per record along the shared axis. */
	| {kind: "rug"};

/**
 * What an author states on one position scale, `x`, `y` or `y2`. ggplot's `scale_x_continuous` and siblings.
 *
 * Each field is absent by default and the figure falls back to the data. Fixed `limits` are the ones
 * worth stating.
 */
export interface PositionScale {
	title?: string;
	/**
	 * How positions map along a value axis. ggplot's `transform`, and `log10` is `scale_x_log10`.
	 *
	 * `log2` spaces powers of two evenly. `sqrt` spaces by the root and drops a reading below zero.
	 * `pseudo_log` runs linear inside one unit of zero and logarithmic past it, either sign.
	 */
	transform?: AxisTransform;
	/** Whether a value axis runs high to low. ggplot's `scale_x_reverse`. */
	reverse?: boolean;
	/**
	 * Whether the column holds epoch milliseconds and the axis reads them as dates.
	 *
	 * Absent takes the field's own `timeScale`. Ticks land on calendar boundaries, read in UTC.
	 */
	time?: boolean;
	/** The two ends the axis runs between, in data units. ggplot's `limits`. */
	limits?: readonly [number, number];
	/**
	 * What a reading past stated `limits` becomes. ggplot's `oob`.
	 *
	 * `censor`, the default, drops it and the footer counts it. `squish` holds it at the edge. `keep`
	 * draws it, clipped.
	 */
	oob?: "censor" | "squish" | "keep";
	/**
	 * Whether the axis positions by category or by value.
	 *
	 * Defaults to the field's own type. A plate number is a number and belongs in bands.
	 */
	kind?: "band" | "continuous";
	/**
	 * Pixels per category, on a band axis.
	 *
	 * Absent divides the plot area among the categories. Stated, the figure grows to hold them.
	 */
	bandSize?: number;
	/**
	 * Where the category order comes from, on a band axis.
	 *
	 * Absent leaves the build order, which is first-seen on a category axis and ranked by rows on
	 * a grid.
	 */
	order?: BandOrder;
	/**
	 * What each category or break is written as. pheatmap's `labels_row`, ggplot's `labels`.
	 *
	 * Drawn text, keyed as `String(value)` writes a break. A missing entry keeps the default.
	 */
	labels?: Record<string, string>;
	/** Labeled tick positions on a value axis, in data units. Over `breakWidth`. ggplot's `breaks`. */
	breaks?: readonly number[];
	/** Unlabeled tick positions on a value axis, in data units. ggplot's `minor_breaks`. */
	minorBreaks?: readonly number[];
	/**
	 * Room past the data at each end of a value axis. ggplot's `expand`.
	 *
	 * `mult` is a share of the span and `add` a fixed amount, both in transformed units. A pair states
	 * the low end first. Stated `limits` take none.
	 */
	expand?: {mult?: number | readonly [number, number]; add?: number | readonly [number, number]};
	/** Values the domain of a value axis reaches, drawn or not. ggplot's `expand_limits`. */
	include?: readonly number[];
	/**
	 * Interval between labeled ticks, in the data's own units. The scales package's `breaks_width`.
	 *
	 * A count leaves the placement to the scale, which labels 0.37 as readily as 0.2.
	 */
	breakWidth?: number;
	/**
	 * Whether the scale draws a line at each labeled tick. Off unless asked for.
	 *
	 * A grid is ink on a scale. No fill is drawn and chart-design rule 3 holds.
	 */
	grid?: boolean;
	/** Whether the subdivisions between the labeled ticks draw a line too. Off unless asked for. */
	minorGrid?: boolean;
	/** Unlabeled subdivisions between the labeled ones. On unless turned off. */
	minorTicks?: boolean;
	format?: TickFormat;
	/** Decimal places, for all formats but `auto`. */
	decimals?: number;
	/** Width of the rule and its ticks, in pixels. */
	linewidth?: number;
	/** Length of a tick, in pixels. */
	tickLength?: number;
	/**
	 * Which side of the rule the ticks fall on.
	 *
	 * Outward is the default. Inward puts the dashes inside the plot area.
	 */
	tickSide?: "out" | "in";
	/**
	 * Rotation of the tick labels, in degrees counterclockwise from horizontal. ggplot's `element_text(angle)`.
	 *
	 * Category names longer than their band collide at zero. The frame grows the margin to match.
	 */
	tickAngle?: number;
	/**
	 * Where the title draws along its own rule.
	 *
	 * `start` is the low end and `end` the high one. A centered vertical title turns.
	 */
	titleAlign?: "start" | "center" | "end";
	/** Type size of the ticks and the title, in pixels. */
	fontSize?: number;
	/**
	 * Weight of the tick and title ink, one of muted or strong. Muted is the default.
	 *
	 * Strong pulls the labels up to geom ink. A grid of categories is read off its axes, and muted
	 * names on one read as chrome.
	 */
	ink?: "muted" | "strong";
}

/**
 * Where a figure's legends draw, and how they read.
 *
 * The names follow `PositionScale` where the concept matches.
 */
export interface LegendOptions {
	/** Which edge the legends take. Outside the plot area on all four, per rule 2. */
	position?: "right" | "left" | "top" | "bottom" | "none";
	/** Where they sit along that edge. */
	align?: "start" | "center" | "end";
	/** Defaults from the edge: a side stacks, a top or a bottom runs across. */
	direction?: "horizontal" | "vertical";
	fontSize?: number;
	/**
	 * Which order the rows read in. `authoring`, the default, is the order the layers were written.
	 *
	 * `geoms` puts the lines in the order their last readings stand, top first, as rule 2 asks.
	 */
	order?: "geoms" | "authoring";
}

/**
 * The color scale, as far as an author states it.
 *
 * Every field is absent by default and the figure falls back to what the data says.
 */
export interface ColorScale {
	/** Name written over the color guide, a ramp or a set of swatches. Falls back to the field it reads. */
	title?: string;
	/** The two ends the map runs between, in the measure's own units. */
	limits?: readonly [number, number];
	/**
	 * The value the map treats as its middle, in the measure's own units.
	 *
	 * A z-score centers at zero and a fold-change at one. `PaletteChoice.center` is the host default.
	 */
	center?: number;
	/**
	 * How a value maps onto the ramp. ggplot's `transform`, the position scales' own names.
	 *
	 * `sqrt` spends less of the map on a heavy tail. A transformed map runs low to high and takes no `center`.
	 */
	transform?: AxisTransform;
	format?: TickFormat;
	/** Decimal places, for all formats but `auto`. */
	decimals?: number;
	/**
	 * Cuts that bin the ramp into steps, in the measure's own units.
	 *
	 * Edges. n cuts make n-1 bins, as pheatmap's `breaks` does. Absent runs the map continuously.
	 */
	bins?: readonly number[];
	/**
	 * Values the legend names, in the measure's own units. ggplot's `breaks`, pheatmap's `legend_breaks`.
	 *
	 * Absent, the legend names the two ends and the middle.
	 */
	breaks?: readonly number[];
	/**
	 * What each break is written as, keyed as `String(value)` writes it. ggplot's `labels`.
	 *
	 * A missing entry takes the scale's format.
	 */
	labels?: Record<string, string>;
	/**
	 * The direction the cells are z-scored along. pheatmap's `scale`.
	 *
	 * A color transform. It leaves position alone and changes what the fill means.
	 */
	standardize?: "row" | "column" | "none";
}

/**
 * A chart's scales, keyed by the aesthetic each one maps. ggplot's `scale_*` family.
 *
 * Each field is absent by default and the figure falls back to the data.
 */
export interface ChartScales {
	x?: PositionScale;
	y?: PositionScale;
	/** The second vertical scale, for layers that declare `axis: "y2"`. */
	y2?: PositionScale;
	/**
	 * The color map, for the kinds that carry the palette on a line or an edge.
	 *
	 * A layer's own `scales.color` wins over it field by field.
	 */
	color?: ColorScale;
	/**
	 * The fill map, for the kinds that carry the palette on an interior. ggplot's `scale_fill_*`.
	 *
	 * A layer's own `scales.fill` wins over it field by field.
	 */
	fill?: ColorScale;
	size?: GuideScale;
	shape?: GuideScale;
	alpha?: GuideScale;
	linetype?: GuideScale;
}

/** A scale the author names the guide of and states nothing else on. ggplot's `name` on `scale_size` and its siblings. */
export interface GuideScale {
	/** Name written over the guide. Falls back to the field it reads. */
	title?: string;
}

/**
 * A curve fitted through a series, and how many curves that means.
 *
 * One curve per value of the layer's `group` or categorical `color`, as in ggplot. Bound to a plate
 * or a lot, that turns a campaign into thousands of fits.
 */
export interface FitSpec {
	model: "4pl" | "5pl";
	/** Confidence level for the band, in the open interval (0, 1). */
	level: number;
	band: boolean;
}

/**
 * The conditional mean through a cloud of points, and the method that draws it.
 *
 * A smooth's curve is the deliverable. Draws on a series of kind `smooth`, with no geoms.
 */
export type SmoothMethod =
	| {
			/**
			 * Local regression. The default on a small cloud.
			 *
			 * Costs the square of the row count. Past a few thousand points, use `gam`.
			 */
			method: "loess";
			/** How much of the data each local fit reads, in (0, 1]. Wider is smoother. */
			span?: number;
	  }
	| {
			/** Least squares. `degree` above one bends it, which is `poly(x, n)` in R's spelling. */
			method: "lm";
			degree?: number;
	  }
	| {
			/** Generalized linear model, for a binary outcome or a count. */
			method: "glm";
			family: "gaussian" | "binomial" | "poisson" | "gamma";
	  }
	| {
			/** Robust least squares, for a cloud a handful of outliers would otherwise tilt. */
			method: "rlm";
	  }
	| {
			/** Additive model, for a curve through more points than a local regression can afford. */
			method: "gam";
	  };

/** A smooth and its band. One curve per value of the layer's `group` or categorical `color`. */
export type SmoothSpec = SmoothMethod & {
	/** Confidence level for the band, in the open interval (0, 1). */
	level: number;
	band: boolean;
};

/**
 * A dash pattern, ggplot's linetype, by the names ggplot gives its integers.
 *
 * The names. `"dashed"` says what will be drawn where `2` says nothing.
 */
export type Linetype = "solid" | "dashed" | "dotted" | "dotdash" | "longdash" | "twodash";

/**
 * The patterns in the order a bound linetype aesthetic hands them out.
 *
 * Solid leads and one group draws an unbroken run. The rest run from the most distinct down.
 */
export const LINETYPES: readonly Linetype[] = ["solid", "dashed", "dotted", "longdash", "dotdash", "twodash"];

/**
 * One pattern as an SVG dasharray, in CSS pixels.
 *
 * Solid answers undefined and the run draws whole. The numbers are R's own linetype patterns as
 * on and off lengths.
 */
export function dashArray(dash: Linetype | undefined): string | undefined {
	switch (dash) {
		case "dashed":
			return "4 4";
		case "dotted":
			return "1 3";
		case "dotdash":
			return "1 3 4 3";
		case "longdash":
			return "8 4";
		case "twodash":
			return "2 2 6 2";
		default:
			return undefined;
	}
}

/**
 * How a geom is drawn, held apart from what it encodes.
 *
 * The type parameter names the kind, which decides `parts`. A plain `LayerStyle` is the wide set.
 */
export interface LayerStyle<K extends PlotKind = PlotKind> {
	/** Point radius in pixels. Read where the size channel binds no field. */
	size?: number;
	/**
	 * Smallest and largest radius the size channel resolves to, in pixels.
	 *
	 * Absent derives both ends from the panel's own `pointRadius`.
	 */
	sizeRange?: readonly [number, number];
	alpha?: number;
	/**
	 * Space between one cell and the next, in pixels. pheatmap's `cellgap`.
	 *
	 * A grid drawn with no gap abuts, and a corner radius on an abutting cell cannot be seen. A
	 * couple of pixels reads each cell as its own chip.
	 */
	cellGap?: number;
	/**
	 * Interior paint, where no column maps it. ggplot's `fill` set as a constant.
	 *
	 * A bar or a cell paints its inside with this. A line has no interior.
	 */
	fill?: string;
	/**
	 * Which half of the band a violin's density occupies.
	 *
	 * Both is symmetric about the band. One half is the raincloud's, leaving room for a box.
	 */
	half?: "both" | "high" | "low";
	/**
	 * Glyph the points draw.
	 *
	 * The channel that survives print and a color-blind reader. Circles unless asked otherwise.
	 */
	shape?: PointShape;
	/**
	 * Where a line changes value between two readings. Absent runs a straight segment.
	 *
	 * `after` keeps a reading until the next arrives. `before` takes the new value at the step.
	 */
	step?: "after" | "before";
	/**
	 * Whether a segment draws a head at the end it finishes on. Drawn unless refused.
	 *
	 * `arrow: false` is for a range with no start, such as a dumbbell.
	 */
	arrow?: boolean;
	/**
	 * How a binned density tiles. Hexagons unless asked.
	 *
	 * A square cell cross-references against the axes. A hexagon reads better as shape.
	 */
	tiling?: "hex" | "rect";
	/**
	 * Width of a bar, a box or a violin, in pixels.
	 *
	 * A cap. The band still divides between the geoms sharing it.
	 */
	thickness?: number;
	/**
	 * Where a ring's slices start, as a fraction of the outer radius.
	 *
	 * Zero draws a pie. Above zero clears a hole, a donut, and the hole clears the crowded middle.
	 */
	innerRadius?: number;
	/**
	 * Gap between one sector of a ring and the next, in degrees.
	 *
	 * A chord's sectors read as separate names with it. Zero closes them into one band.
	 */
	gap?: number;
	/**
	 * Where the first sector starts, in degrees counterclockwise from twelve. Default 0.
	 *
	 * ggplot's direction for an angle. A figure turns to put one name where a reader looks first.
	 */
	rotate?: number;
	/**
	 * Radial gap between a sector band and the ribbons inside it, in pixels.
	 *
	 * Zero seats the ribbons against the band. Anything over it separates the axis from the flow.
	 */
	inset?: number;
	/**
	 * How much of the room a dial takes, as a fraction of the radius its panel allows.
	 *
	 * Default 1. Anything under it leaves a margin the figure can write a scale ring into.
	 */
	radius?: number;
	/**
	 * How far a dial turns, in degrees. Default 180.
	 *
	 * The arc is centered on twelve o'clock whatever the sweep. 270 opens at the bottom.
	 */
	sweep?: number;
	/**
	 * Sections the scale ring outside a dial is cut into. Absent draws no ring.
	 *
	 * Each section takes its color from the magnitude map at its own midpoint. A reader reads the
	 * section under the reading instead of the angle.
	 */
	sections?: number;
	/** Corner radius on a grid's cell, in pixels. Absent tiles them square. */
	cornerRadius?: number;
	/**
	 * Fades a grid's cell by how many rows stand behind it.
	 *
	 * A mean of one reading and a mean of four hundred draw the same color and carry different
	 * weight. The fade puts that difference on the cell.
	 */
	fadeBySupport?: boolean;
	/**
	 * Fills a pair with no rows at nought, the bottom of the ramp.
	 *
	 * A count and a sum over no rows are nought, and the critic refuses the rest.
	 */
	emptyAsZero?: boolean;
	/**
	 * Edge or line color, where no column maps it. ggplot's `color` set as a constant.
	 *
	 * A line, a point or a rule draws in it. A bar, a cell or a slice outlines itself in it.
	 */
	color?: string;
	/** Width of the edge or line, in pixels. ggplot's `linewidth`. Zero draws none. */
	linewidth?: number;
	/** Dash pattern of the edge or line, where no column maps it. ggplot's `linetype`. */
	linetype?: Linetype;
	/**
	 * Width of the paper-colored halo a point draws around itself, in pixels. Zero draws none.
	 *
	 * The halo reads as space between overlapping points. Absent draws one pixel on a point above
	 * four pixels.
	 */
	halo?: number;
	/**
	 * Where an isosurface draws its shell, as a fraction of the field's range. Half unless stated.
	 *
	 * Half the maximum encloses the core and a lower fraction reaches the shoulders.
	 */
	isoLevel?: number;
	/**
	 * Which back faces of a cube's box take a pane. matplotlib's `pane`. Absent draws none.
	 *
	 * `walls` fills the two upright back walls and `all` the floor as well.
	 */
	panes?: "walls" | "all";

	/**
	 * Where text sits across its anchor, ggplot's way. Zero starts at the reading, one ends there.
	 *
	 * Half centers it, the default.
	 */
	hjust?: number;
	/** Where text sits up its anchor. Zero puts its foot at the reading, one its top. Half centers it. */
	vjust?: number;
	/** Type size of a text geom, in pixels. Absent takes the panel's annotation size. */
	fontSize?: number;
	/**
	 * Draws the glyph as an outline with paper showing through it.
	 *
	 * A hollow geom is countable where a filled one is not. The paper halo goes unread here.
	 */
	hollow?: boolean;
	/**
	 * Paint for a named part of a composite geom.
	 *
	 * Keyed by the parts the geometry has. A part takes the geom's own fields and no parts.
	 */
	parts?: Parts<K>;
}

/**
 * The value written on each geom: a grid's cells, a slice, a sector or a dial. pheatmap's
 * `display_numbers`.
 *
 * A direct label, on top of the geom. `format` and `decimals` are the axis's own fields.
 */
export interface CellNumbers {
	/**
	 * Which geoms get a number. Absent writes them all, which is `display_numbers = TRUE`.
	 *
	 * The comparison runs against the value before its format: a cell's in the units the ramp reads,
	 * a slice's own value, a reading on a sector's axis, and a dial's reading.
	 */
	when?: {op: "above" | "below"; value: number};
	format?: TickFormat;
	/** Decimal places, for all formats but `auto`. */
	decimals?: number;
	/**
	 * Fixed ink for the numbers. pheatmap's `number_color`.
	 *
	 * Absent picks black or white per cell off the fill's own luminance.
	 */
	color?: string;
	/** Type size, in pixels. Absent takes the panel's own axis size. */
	fontSize?: number;
}

/**
 * Parameters of the statistics a series runs, keyed by statistic.
 *
 * `StatOptions` records which names each statistic reads. `stat_bin`'s three-way `drop` is
 * `dropEmpty` here.
 */
export interface StatParams {
	/**
	 * Width of one interval, in the data's own units.
	 *
	 * A pair states one per axis, across then down. A one-dimensional bin reads the first entry.
	 */
	binwidth?: PerAxis;
	/**
	 * Intervals across the range, or cells across each axis.
	 *
	 * A one-dimensional bin stating neither this nor `binwidth` takes the Freedman-Diaconis width. A
	 * lattice takes 30 per axis.
	 */
	bins?: PerAxis;
	/** Middle of one interval, which fixes where all the edges fall. */
	center?: PerAxis;
	/**
	 * An edge of one interval, which fixes where all of them fall.
	 *
	 * Stating this with `center` draws nothing. Default half a width below the lowest reading.
	 */
	boundary?: PerAxis;
	/** Which end of an interval holds a reading recorded on its edge. Default the right end. */
	closed?: BinClosed;
	/** Adds an empty interval at each end. A filled shape closes on the axis. Default false. */
	pad?: boolean;
	/** The edges themselves, which override the width, the count and the alignment. */
	breaks?: readonly number[];
	/**
	 * Which empty intervals a one-dimensional binning keeps. Default `none`, keeping them all.
	 *
	 * ggplot's `stat_bin` spells this `drop`. The violin's boolean has that name below.
	 */
	dropEmpty?: BinDrop;
	/** Kernel bandwidth, or the rule that reads one off the data. Default Silverman's. */
	bw?: Bandwidth;
	/** Multiplier on whatever the bandwidth resolved to. Default 1. */
	adjust?: number;
	/** Which kernel a density sums. Default gaussian. */
	kernel?: Kernel;
	/** Points a curve is evaluated at. Default 512 for a density, 100 per side for a contour. */
	n?: number;
	/** Stops a density at the smallest and largest reading. Default false, and true on a violin. */
	trim?: boolean;
	/** Range the measure can occupy, which a density folds its tails back inside. Default unbounded. */
	bounds?: readonly [number, number];
	/**
	 * What a set of violins holds constant. Default `area`.
	 *
	 * `count` scales the areas by each group's count. `width` fixes the maximum width.
	 */
	scale?: "area" | "count" | "width";
	/**
	 * Drops the unit with too little to draw. Default true.
	 *
	 * On a violin, a group with too few readings. On a lattice, a cell nothing landed in.
	 */
	drop?: boolean;
	/** Probabilities a violin draws a line at inside its outline. Default the three quartiles. */
	quantiles?: readonly number[];
	/** How far a box's whisker reaches past the quartiles, in interquartile ranges. Default 1.5. */
	coef?: number;
	/** Which of R's nine quantile definitions a summary's quartiles take. Default 7. */
	quantileType?: QuantileType;
	/**
	 * What a flow's value is measured against. Default `global`.
	 *
	 * `column` measures each column against its own population. A long cascade draws its last
	 * columns under a pixel on one global scale.
	 */
	normalize?: "global" | "column";
	/**
	 * Which column a flow's end node draws in. Default `left`, one right of the node reaching it.
	 *
	 * `justify` puts each node with no outgoing flow in the last column.
	 */
	align?: "left" | "justify";
}

export interface LayerSpec {
	id: string;
	name?: string;
	kind: PlotKind;
	/** Column ids per aesthetic. Which aesthetics apply depends on the kind. */
	aes: Aes;
	/** Aggregate applied when the channel binds a dimension and not a record. */
	aggregate?: Aggregate;
	/**
	 * Reads the series as a running total along its axis.
	 *
	 * With no aggregate the series sums. A bar, a line, an area and a frequency polygon draw one.
	 */
	cumulative?: boolean;
	/**
	 * Which vertical scale this layer reads, `scales.y` or `scales.y2`. Absent reads `y`.
	 *
	 * A titre in mg/mL against a KD in nM on one scale draws one layer as a flat line.
	 */
	axis?: "y" | "y2";
	style?: LayerStyle;
	/**
	 * The interval drawn around each reduction. Absent draws none.
	 *
	 * `sd` is the readings' spread and `sem` pins down their mean. One reading gets no interval.
	 */
	error?: "sd" | "sem";
	/**
	 * Draws the readings behind each group over the geom. Absent draws none.
	 *
	 * Read where the axis holds categories. A count has no readings to show.
	 */
	replicates?: boolean;
	/**
	 * What happens where this geom shares a band with another.
	 *
	 * Absent stacks the groups of a bar, a histogram or an area, as ggplot does, and overlaps the rest.
	 * `stack` sets each geom on the running total. `dodge` gives each geom its own slot.
	 */
	position?: Position;
	/** Direct labels on this series' geoms. Absent means none. */
	directLabels?: LabelRule;
	/**
	 * The value written on each geom, where the kind writes one: a grid's cells, a slice, a sector or a
	 * dial. Absent writes none.
	 *
	 * Content, beside `directLabels`, which names the geoms.
	 */
	numbers?: CellNumbers;
	/** A curve fitted through this series' geoms. Absent means none. */
	fit?: FitSpec;
	/**
	 * The smoother a series of kind `smooth` runs. Ignored by the rest.
	 *
	 * A fit hangs off the geom it was fitted through. A smooth is the layer.
	 */
	smooth?: SmoothSpec;
	/**
	 * Parameters of the statistics this series' kind runs. Absent takes each default.
	 *
	 * `StatOptions` keyed by the statistics in the kind's `GRAMMAR` row. Other names are dropped.
	 */
	statParams?: StatParams;
	/**
	 * Rings stacked outside a circular figure, innermost first.
	 *
	 * Each one reads a column of the same table against the sectors the figure drew.
	 */
	rings?: readonly RingPanel[];
	/**
	 * Columns holding the far end of a link, drawn inside the figure.
	 *
	 * The near end is the figure's own position channels. A row naming a far end draws no tile.
	 */
	links?: LinkFields;
	/**
	 * The magnitude map this series paints from. Absent takes the chart's own.
	 *
	 * A name out of the palette registry. Two series each binding a measure to color need this.
	 */
	palette?: PaletteName;
	/**
	 * What this layer states about its own scales, over the chart's.
	 *
	 * The chart's scale on the same aesthetic is the default and this wins field by field.
	 */
	scales?: {color?: ColorScale; fill?: ColorScale};
	visible?: boolean;
	/**
	 * Rows this layer reads in place of the chart's table. ggplot's `data`.
	 *
	 * Saved with the spec. A column the chart's table also has takes its label and unit.
	 */
	data?: readonly Record<string, string | number | boolean | null>[];
	/** Whether this layer reaches the legend. ggplot's `show.legend`. Absent reaches it. */
	showLegend?: boolean;
}

/** Data coordinates. An annotation survives a zoom, a rescale or a re-query. */
export interface Anchor {
	x: number | string;
	y: number | string;
}

export interface Leader {
	shape: "straight" | "curved";
	toward: Anchor;
}

/**
 * What a scientist wrote on the chart.
 *
 * Saved with the plot. The builder panel seeds `axis-end` from a measure's direction. A reference
 * line is an `hline` or `vline` layer.
 */
export type Annotation =
	| {
			kind: "note";
			text: string;
			at: Anchor;
			leader?: Leader;
			align?: "left" | "center" | "right";
	  }
	| {kind: "axis-end"; axis: "x" | "y"; end: "low" | "high"; text: string};

/** The spec format this version of the package writes, stated on `ChartSpec.version`. */
export const SPEC_VERSION = 1;

/**
 * What the pipeline reads -- the chart itself, apart from where it is kept.
 *
 * `buildFrame`, `buildLayers` and `critique` read these fields. `StoredSpec` adds where a host
 * keeps it.
 */
export interface ChartSpec {
	/** The spec format, `SPEC_VERSION`. The builder writes it, and absent reads as this format. */
	version?: typeof SPEC_VERSION;
	id: string;
	/** The claim the chart makes, written as a sentence. Rendered as the headline. */
	headline?: string;
	/** What is plotted, with units. Rendered under the headline. */
	subtitle?: string;
	/** Provenance, written on the footer line beside what the figure admits. ggplot's `labs(caption =)`. */
	caption?: string;
	layers: readonly LayerSpec[];
	/**
	 * A small-multiple grid, one panel per value of `by`. ggplot's `facet_wrap`.
	 *
	 * `columns` is panels per row, `ncol`. Absent divides the width by the narrowest panel worth a column.
	 */
	facet?: {by: string; columns?: number};
	/**
	 * Which way round the shared pair of scales draws. Absent draws `cartesian`.
	 *
	 * `flip` swaps the roles, ggplot's `coord_flip`. The names stay with the data and the frame swaps
	 * at the end. Polar is no value here: the circular kinds, such as `pie` and `radar`, carry it.
	 */
	coord?: "cartesian" | "flip";
	/** What an author states on each scale, keyed by the aesthetic it maps. The data answers the rest. */
	scales?: ChartScales;
	/**
	 * Fields the tooltip adds, in order.
	 *
	 * The useful line is often one nobody plotted. Empty means the bound channels alone.
	 */
	tooltip?: readonly string[];
	/** What the author wrote on the chart. Absent writes nothing. */
	annotations?: readonly Annotation[];
	/**
	 * Findings the author read and disagreed with, by code.
	 *
	 * A `wrong` finding stops a save. Naming its code here lets it through. The footer reports it.
	 * `headline-missing` is no code an override names.
	 */
	overrides?: readonly WaivableCode[];
	/**
	 * Where the legends draw and how they read.
	 *
	 * Chart-design rule 2 asks for a legend outside the plot area. Applies to all three legends.
	 */
	legend?: LegendOptions;
	/**
	 * Panels drawn beside the plot area, each sharing one of its axes.
	 *
	 * A layout field on the spec. The spec travels with the figure.
	 */
	sides?: readonly SidePanel[];
	/**
	 * The figure's drawing height in pixels: the panel, or a facet's whole grid.
	 *
	 * A facet's rows divide it, less their strips and the axis title under them. The headline, the
	 * legend and the caption sit outside it.
	 */
	height?: number;
	/**
	 * Whether the figure fills the room it is given or the room its content asks for.
	 *
	 * `container` is the default. `content` lets a stated `bandSize` decide the plot area.
	 */
	sizing?: "container" | "content";
	/**
	 * The figure's width in pixels, where it states its own. A facet's columns and a side legend divide it.
	 *
	 * Absent, the figure measures the element it draws in. A stated width also sizes that element.
	 */
	width?: number;
	/**
	 * Panel height over panel width, a fraction. ggplot's `aspect.ratio`: 2 draws a panel twice as tall as wide.
	 *
	 * The height follows the width each panel was given. An explicit `height` wins.
	 */
	aspect?: number;
	/**
	 * Units of y per unit of x on screen, in transformed space. ggplot's `coord_fixed(ratio)`.
	 *
	 * The height follows from the width and the two domains, over `height` and `aspect`. One draws
	 * a unit line at 45 degrees on matching axes. `aspect` shapes the panel and this shapes the data.
	 */
	ratio?: number;
}

/**
 * A chart as a host keeps it: the spec, the table it reads, and when it last changed.
 *
 * A host's own identity fields ride through the generic editors and `PlotPanel` on its own subtype.
 */
export interface StoredSpec extends ChartSpec {
	/** The table this plot reads. Named by the plot and the same on each surface. */
	source?: PlotSource;
	/** When the host last saved it, in epoch milliseconds. The host stamps it. */
	updatedAt?: number;
}
