/**
 * What a plot draws, resolved to a flat list of traces before anything renders.
 *
 * A series names a chart kind. This resolves it to a geom and a reduction.
 */

import {
	binBreaks,
	binIndex,
	binOptionsOf,
	intervalsOf,
	keptUnder,
	padded,
	type BinEdges,
	type BinOptions,
	type BinSpec,
} from "./binning.js";
import {groupRows, type PlotData, type PlotField} from "./plot-data.js";
import {toPlotData, type FieldOverride} from "./adapters.js";
import {pinnedOver, type Assignments} from "./figure-set.js";
import {GRAMMAR, isAxial, geomGrammar} from "./grammar.js";
import {scaledCells} from "./cluster.js";
import {gateCells, occupancyCells} from "./heat-reductions.js";
import {orderBand} from "./band-order.js";
import {kindFacts, layerScale, paintAesthetic, paintColumn, type Aesthetic, type LayerField} from "./geom-table.js";
import {
	LINETYPES,
	positionArgs,
	positionKind,
	type BandOrder,
	type ChartSpec,
	type ColorScale,
	type Linetype,
	type PlotKind,
	type Position,
	type PositionKind,
	type LayerSpec,
} from "./spec.js";
import {REGULAR, type Metrics} from "./sizing.js";
import {meshOfRelief, meshOfRows, relief, type MeshData, type Relief} from "./mesh.js";
import {field3d, type Field3d} from "./voxels.js";
import {boxStats, kde, quantileOf, type Density} from "./stats.js";
import {POINT_SHAPES, type PointShape} from "./geom-types.js";
import type {BarDatum, IntervalPoint} from "./geom-types.js";
import type {HeatCell} from "./geom-types.js";
import type {BoxDatum} from "./geom-types.js";
import type {SegmentPoint} from "./geom-types.js";
import type {ViolinDatum} from "./geom-types.js";
import type {ParallelAxis, ParallelLine} from "./geom-types.js";
import type {SankeyLinkInput, SankeyNodeInput} from "./geom-types.js";
import {chordLayout, type ChordLink} from "./chord.js";
import {ringReading, type RingReading} from "./rings.js";
import type {PositionLink, SectorSpec} from "./circular.js";
import {groupsOf, icicleLayout, treemapLayout, type HierarchyCell, type HierarchyRow} from "./hierarchy.js";
import type {PlotPoint} from "./hit.js";
import {
	accumulate,
	accumulateAlong,
	boundsOf,
	NEEDS_VALUES,
	reduceBucket,
	spreadOf,
	type Aggregate,
	type Bucket,
} from "./aggregate.js";
import {flag, omit, type Omission} from "./omission.js";
import type {RuleLine} from "./rules.js";
import {isLog, TRANSFORMS, type AxisTransform} from "./transform.js";

/** Geoms a layer can resolve to. */
export type Geom =
	| "point"
	| "line"
	| "area"
	| "ribbon"
	| "range"
	| "segment"
	| "smooth"
	| "bar"
	| "waterfall"
	| "freqpoly"
	| "boxplot"
	| "violin"
	| "density"
	| "hex"
	| "contour"
	| "treemap"
	| "icicle"
	| "sunburst"
	| "sankey"
	| "chord"
	| "ideogram"
	| "heatmap"
	| "parcoords"
	| "radar"
	| "pie"
	| "gauge"
	| "point3d"
	| "surface"
	| "mesh3d"
	| "isosurface"
	| "volume"
	| "hline"
	| "vline"
	| "abline"
	| "text";

/**
 * Whether a geom draws against the frame's axes.
 *
 * A treemap positions by nesting and a sankey by flow. Read off `GRAMMAR`'s coordinate column.
 */
export const drawsAxes = (geom: Geom): boolean => {
	const grammar = geomGrammar(geom);
	return grammar ? isAxial(grammar.coord) : true;
};

/** Whether the horizontal axis positions by category or by value. */
export type AxisKind = "band" | "continuous";

/**
 * The geometry a kind draws with. A kind this version does not know answers undefined.
 *
 * Reads the geometry column of `GRAMMAR`.
 */
export const geomFor = (kind: PlotKind): Geom | undefined => GRAMMAR[kind]?.geom;

/** A record projected into plot space, carrying enough to reach the row behind it. */
export interface LayerPoint extends PlotPoint {
	/** Row in the source. A click opens the record the grid already knows. */
	row: number;
	/** Row in the table the figure read, before a split or a facet narrowed it. The tooltip reads there. */
	plotRow?: number;
	/** Direct label, where the series asked for one. */
	text?: string;
	/** Breaks a line before this reading. A missing or dropped reading sits between it and the one before. */
	gap?: boolean;
	/**
	 * The size field's reading, in its own units, beside the radius resolved from it.
	 *
	 * `size` is pixels and no rescale reaches them. The value survives the build for
	 * `shareScales`.
	 */
	sizeValue?: number;
}

/** What both hierarchy arrangements carry. The geom beside it says which of the two drew. */
interface HierarchyData {
	at: "groups";
	cells: HierarchyCell[];
	aggregate: Aggregate;
	/** Cells the cap turned down, with their descendants. The footer states the count. */
	dropped: number;
}

/**
 * What a trace holds, and how it draws.
 *
 * Two questions. `at` says whether the payload is records or a reduction per group. `geom` says
 * what draws it.
 */
export type LayerData =
	/*
    A curve holds the records it was smoothed through and draws none of them.

    `fitRequests` reads `pointsOf`, and the payload is a scatter's own.
  */
	| {
			at: "records";
			geom: "point" | "hex" | "contour" | "line" | "smooth";
			points: LayerPoint[];
			/**
			 * Multiplier on the smoothing radius, where the geom estimates a density. Absent takes 1.
			 *
			 * A contour estimates in pixel space. The radius belongs to the geom.
			 */
			adjust?: number;
			/** A contour's own lattice, where a measure is bound to `z`. The bands cut its values. */
			grid?: Relief;
	  }
	/*
    The cube payloads hold all three domains. A flat geom reads its pair off the frame. A cube
    reads none of it and the box is the trace's own business.
  */
	| {
			at: "records";
			geom: "point3d";
			points: LayerPoint[];
			zField: PlotField;
			xDomain: [number, number];
			yDomain: [number, number];
			zDomain: [number, number];
	  }
	| {
			at: "groups";
			geom: "isosurface" | "volume";
			field: Field3d;
			/** The measure the cells carry, or absent where the reduction is a count of the rows. */
			valueField?: PlotField;
			xDomain: [number, number];
			yDomain: [number, number];
			zDomain: [number, number];
	  }
	| {
			at: "groups";
			geom: "surface" | "mesh3d";
			mesh: MeshData;
			zField: PlotField;
			xDomain: [number, number];
			yDomain: [number, number];
			/** Set on a relief, which reduces a measure over a grid. A structure reduces nothing. */
			aggregate?: Aggregate;
	  }
	| {at: "records"; geom: "ribbon"; readings: IntervalPoint[]}
	/* The same readings drawn a mark at a time, in the glyph the layer's kind names. */
	| {
			at: "records";
			geom: "range";
			glyph: "errorbar" | "linerange" | "pointrange" | "crossbar";
			readings: IntervalPoint[];
	  }
	| {at: "records"; geom: "segment"; segments: SegmentPoint[]}
	/* A reference line per row. It trains no scale and draws across the plot area. */
	| {at: "records"; geom: "hline" | "vline" | "abline"; rules: RuleLine[]}
	/* A label per row at its reading. `slot` is the dodged bar it names, `cap` that bar's thickness, `ofBand` its count per band. */
	| {
			at: "records";
			geom: "text";
			points: LayerPoint[];
			boxed?: boolean;
			slot?: {index: number; of: number; width?: number; cap?: number; ofBand?: Record<string, number>};
	  }
	| {at: "records"; geom: "parcoords"; axes: ParallelAxis[]; lines: ParallelLine[]}
	/*
    A radar takes the parallel payload. The geom lays the rules out as spokes and closes the path.
    The axes arrive in the order the author bound them.
  */
	| {at: "records"; geom: "radar"; axes: ParallelAxis[]; lines: ParallelLine[]}
	/*
    A hierarchy, laid out before it reaches a component.

    Both kinds hold the rectangles as fractions of the drawing area. One variant per geom,
    sharing a shape through `HierarchyData`.
  */
	| (HierarchyData & {geom: "treemap"})
	| (HierarchyData & {geom: "icicle"})
	| (HierarchyData & {geom: "sunburst"})
	/*
    A gauge holds one number and the range it is read against.

    The reduction runs over the whole table. The range travels on the payload.
  */
	| {
			at: "groups";
			geom: "gauge";
			value: number;
			/** Low and high end of the dial, from `scales.y.limits` or from the measure's own extent. */
			range: [number, number];
			aggregate: Aggregate;
	  }
	| {
			at: "groups";
			geom: "bar" | "waterfall" | "line" | "area" | "pie" | "freqpoly";
			bars: BarDatum[];
			aggregate: Aggregate;
			binWidth?: number;
			/** Which interval the whiskers stand for. The footer names it. */
			error?: "sd" | "sem";
			/** Groups with more readings than a band separates. The footer states the count. */
			replicatesDropped?: number;
			/** Rows the horizontal axis's transform had no place for. The footer states the count. */
			offScale?: number;
			/**
			 * Which slot of the band this geom takes. Absent takes it whole.
			 *
			 * The core says which of how many and the geom does the arithmetic.
			 */
			slot?: {index: number; of: number; width?: number};
			/**
			 * Set where a fill divided these geoms by their band's total. The values are shares.
			 *
			 * They are dimensionless and sum to one per band. Held on the payload beside `slot`.
			 */
			shares?: boolean;
			/** Set where each value adds the ones before it. A band keeps its read order under it. */
			cumulative?: boolean;
	  }
	| {at: "groups"; geom: "boxplot"; boxes: BoxDatum[]}
	| {at: "groups"; geom: "violin"; violins: ViolinDatum[]}
	/**
	 * A kernel density over one measure, as one curve.
	 *
	 * The bandwidth travels with the curve and the footer names it. A `group` gives one each.
	 */
	| {at: "groups"; geom: "density"; curve: Density}
	| {at: "groups"; geom: "heatmap"; cells: HeatCell[]; aggregate: Aggregate}
	| {
			at: "groups";
			geom: "ideogram";
			sectors: SectorSpec[];
			/** One span per row, in its sector's own units. */
			tiles: {sector: string; start: number; end: number; level?: string}[];
			/** The stains a tile paints by, in the order they were met. */
			levels: string[];
			/** One pair of positions per row that named a far end. */
			links: PositionLink[];
			/** Where the links' own measure runs, for the magnitude map. Absent where none was bound. */
			linkDomain?: [number, number];
			rings: (RingReading | null)[];
	  }
	| {
			at: "groups";
			geom: "chord";
			links: ChordLink[];
			/** One entry per ring the author stacked, innermost first. A ring with no reading is null. */
			rings: (RingReading | null)[];
	  }
	| {
			at: "groups";
			geom: "sankey";
			nodes: SankeyNodeInput[];
			links: SankeyLinkInput[];
			/** What a value is measured against. The geom holds the height a thickness needs. */
			normalize?: "global" | "column";
			/** Links a cap refused. A partial flow should not read as the whole one. */
			dropped: number;
	  };

/**
 * A style channel a column drives, with what its guide needs to draw.
 *
 * One shape for the three. A category hands out levels and a measure hands out a domain.
 */
export interface StyleChannel<T> {
	field: PlotField;
	/** One level per value, in the order the codes assigned them. Absent where the field is a measure. */
	levels?: readonly {value: string; at: T}[];
	/** The two ends the channel ran between, where the field is a measure. */
	domain?: [number, number];
}

/** A series resolved against the data it reads. */
export interface Trace {
	id: string;
	layerId: string;
	name: string;
	color: string;
	axis: "y" | "y2";
	/** Measure on Y, for the readout and the axis title. */
	field?: PlotField;
	/**
	 * Maps a point's weight to a color. Constant with nothing bound.
	 *
	 * The weight keeps the field's own units. A geom asks for a color and learns nothing else.
	 */
	ramp: ValueRamp;
	/** Field on the color channel, for the readout. */
	colorField?: PlotField;
	/**
	 * The magnitude map and scale options this trace was built with.
	 *
	 * `paint` and `shareScales` rebuild the ramp off the chart's map. Held on the trace.
	 */
	sequential?: UnitRamp;
	colorOptions?: ColorScale;
	/**
	 * The categories a bound identity channel paints, with each assigned index.
	 *
	 * A measure's legend is a bar off `colorDomain`. An identity's is a swatch per value.
	 */
	colorLevels?: readonly {value: string; code: number}[];
	/**
	 * The two ends the magnitude map runs between, in the value's own units.
	 *
	 * `shareScales` spans this across a facet. Absent on an identity color.
	 */
	colorDomain?: [number, number];
	/**
	 * The two ends the data itself had.
	 *
	 * `colorDomain` is where the ramp runs and this is what it ran over.
	 */
	colorExtent?: [number, number];
	/** Field on the third position scale, where the trace draws in a cube. */
	zField?: PlotField;
	/** Field on the size channel, for the readout and the legend. Absent where nothing is bound. */
	sizeField?: PlotField;
	/** That field's range over the whole table. The legend states what a diameter means. */
	sizeDomain?: [number, number];
	/** Smallest and largest radius the channel resolved to, in pixels. */
	sizeRadii?: readonly [number, number];
	/** Glyph per level, where the shape channel is bound. Absent where nothing is. */
	shapeChannel?: StyleChannel<PointShape>;
	/** Opacity per level or across a range, where the opacity channel is bound. */
	alphaChannel?: StyleChannel<number>;
	/**
	 * The pattern this run draws, where the dash channel is bound.
	 *
	 * One level. A dash belongs to a path and the build gave each level its own trace.
	 */
	linetypeChannel?: {field: PlotField; at: Linetype; value: string};
	/** Value of the split field this trace holds. Absent where the series draws as one trace. */
	splitValue?: string;
	/** Field the series split on. The legend groups traces that share it. */
	splitField?: PlotField;
	/** Value of the facet field this trace's panel holds. Absent outside a facet. */
	facetValue?: string;
	/** Field the figure faceted on, where the trace's table holds it. */
	facetField?: PlotField;
	/** Set where the split is ggplot's `group`. The legend names the series once and the color channel's levels. */
	grouped?: boolean;
	/** The layer's own rows, where the series brought them. A readout reads its row there. */
	table?: PlotData;
	/** Set where the series keeps out of the legend. ggplot's `show.legend = FALSE`. */
	showLegend?: false;
	data: LayerData;
}

/**
 * A ramp reading a position in the magnitude map, over 0..1.
 *
 * Two conventions, told apart by a phantom tag. `T` is the color a renderer wants.
 */
export type UnitRamp<T = string> = ((t: number) => T) & {readonly unit?: true; readonly value?: never};

/**
 * A ramp reading a value in the measure's own units.
 *
 * The counterpart to `UnitRamp`. The normalization is closed over. `valueRamp` produces one.
 */
export type ValueRamp<T = string> = ((value: number) => T) & {readonly unit?: never; readonly value?: true};

/** The two maps a chart may color from, held apart per chart-design rule 8. */
export interface Palettes {
	/** Magnitude, over 0..1. */
	sequential: UnitRamp;
	/**
	 * A named magnitude map, for a series or a side track painting off its own.
	 *
	 * Absent leaves `LayerSpec.palette` unread, and a track reads the registry. `palettesFor` fills it.
	 */
	sequentialFor?: (palette: string) => UnitRamp;
	/** A named categorical map, for a layer naming one. Undefined for a map of another kind. */
	categoricalFor?: (palette: string) => Pick<Palettes, "categorical" | "categoricalSize"> | undefined;
	/** Identity, by position in the categorical map. */
	categorical: (index: number) => string;
	/**
	 * Distinct colors the categorical map offers before it repeats.
	 *
	 * A figure with more identities than this gets two of them in one color.
	 */
	categoricalSize?: number;
	/**
	 * The color a cytogenetic band draws with, by its stain. An unknown level answers undefined.
	 *
	 * A karyotype is ordered and the categorical map states nothing about that order.
	 */
	stain?: (stain: string) => string | undefined;
	/**
	 * The value the magnitude map treats as its middle.
	 *
	 * Set where the map has two arms. A column running -2 to +18 would color +8 as no change.
	 */
	center?: number;
}

/**
 * The radii a bound size channel spans, in pixels.
 *
 * Derived from the panel's own point radius. Half that radius to two and a half times it.
 */
export const sizeRadiiFor = (metrics: Metrics): [number, number] => [
	metrics.pointRadius * 0.5,
	metrics.pointRadius * 2.5,
];

/**
 * Radius a value takes on the size channel, in pixels.
 *
 * Area stands for quantity per chart-design rule 11. The radius is the square root of it.
 */
export function sizeRadius(value: number, lo: number, hi: number, radii: readonly [number, number]): number {
	const [rMin, rMax] = radii;
	const span = hi - lo;
	const t = span > 0 ? Math.min(1, Math.max(0, (value - lo) / span)) : 0;
	return Math.sqrt(rMin * rMin + t * (rMax * rMax - rMin * rMin));
}

/**
 * A value's position in the magnitude map, over 0..1.
 *
 * Without a center the domain maps straight on. With one the scale is symmetric about it.
 */
export function rampPosition(value: number, lo: number, hi: number, center?: number): number {
	if (center == null) return (value - lo) / (hi - lo || 1);
	const reach = Math.max(Math.abs(hi - center), Math.abs(center - lo)) || 1;
	return 0.5 + (value - center) / (2 * reach);
}

/**
 * The ends the map runs between. The author's setting comes ahead of the data's.
 *
 * Cuts state their own ends. A value outside them has no bin to fall in.
 */
export function colorDomainOf(derived: [number, number], options?: ColorScale): [number, number] {
	if (options?.limits) return [options.limits[0], options.limits[1]];
	const cuts = options?.bins;
	if (cuts && cuts.length > 1) return [cuts[0]!, cuts[cuts.length - 1]!];
	return derived;
}

/** A scaled color channel carries the data's extent and the ends the author set. */
export const colorScaleOf = (derived: [number, number], options?: ColorScale) => ({
	colorExtent: derived,
	colorDomain: colorDomainOf(derived, options),
});

/**
 * The ramp settings a geom reads, with a z-scored grid's neutral filled in.
 *
 * Centering each row on its mean gives the cells a zero. `paint` closes ramps through this too.
 */
export function rampOptionsFor(geom: Geom, options?: ColorScale): ColorScale | undefined {
	if (geom !== "heatmap" || (options?.standardize ?? "none") === "none") return options;
	return {...options, center: options?.center ?? 0};
}

/**
 * A value's color, in the units the value carries.
 *
 * The contract `Trace.ramp` states. n cuts make n-1 bins. Without cuts the map is continuous.
 */
export function valueRamp(domain: [number, number], palettes: Palettes, options?: ColorScale): ValueRamp {
	const cuts = options?.bins;
	if (cuts && cuts.length > 1) {
		const bins = cuts.length - 1;
		return (value) => {
			let bin = 0;
			while (bin < bins - 1 && value >= cuts[bin + 1]!) bin += 1;
			return palettes.sequential(bins === 1 ? 0.5 : bin / (bins - 1));
		};
	}
	const [lo, hi] = colorDomainOf(domain, options);
	const center = options?.center ?? palettes.center;
	const transform = options?.transform ?? "identity";
	if (transform !== "identity") {
		const {forward, admits} = TRANSFORMS[transform];
		/* A low end with no place sits at zero, or three decades under the top on a log map. */
		const floor = admits(lo) ? lo : isLog(transform) ? (hi > 0 ? hi : 1) / 1000 : 0;
		const place = (value: number) => forward(admits(value) ? value : floor);
		return (value) => palettes.sequential(rampPosition(place(value), place(floor), place(hi)));
	}
	return (value) => palettes.sequential(rampPosition(value, lo, hi, center));
}

export interface BuiltLayers {
	traces: Trace[];
	axisKind: AxisKind;
	xField?: PlotField;
	/** Fields a layer's own rows hold and the chart's table does not. */
	fields: PlotField[];
	/** Kinds a layer names that this version does not know, as a newer document's. The figure reports them. */
	unbuilt: PlotKind[];
	/**
	 * What the build's own caps turned down, for the footer to state.
	 *
	 * Splits past a legend, rows a stride sampled over, and measures an axis cap refused.
	 */
	omitted: Omission[];
}

/**
 * Which scale the horizontal axis runs.
 *
 * The author's choice wins. Otherwise a numeric field gets a value scale and the rest get bands.
 */
export function axisKindFor(plot: ChartSpec, xField: PlotField | undefined): AxisKind {
	const declared = plot.scales?.x?.kind;
	if (declared) return declared;
	return xField?.numeric ? "continuous" : "band";
}

/** The horizontal axis's transform. A stated `transform` wins over the field's log default. */
export const horizontalTransform = (plot: ChartSpec, xField: PlotField | undefined): AxisTransform =>
	plot.scales?.x?.transform ?? (xField?.logScale ? "log10" : "identity");

/**
 * The vertical axis's transform. A stated `transform` wins over the field's log default.
 *
 * A bar is read as a length from zero and a log scale has no zero. A grounded geom drops the
 * measure's preference.
 */
export function verticalTransform(
	declared: AxisTransform | undefined,
	fieldLog: boolean | undefined,
	grounded: boolean,
): AxisTransform {
	if (declared != null) return declared;
	return !grounded && fieldLog ? "log10" : "identity";
}

/**
 * Bars an automatic width may draw.
 *
 * Freedman-Diaconis reads the middle half of the data and bounds no interval count.
 */
export const BIN_CAP = 60;

/**
 * Bin width by the Freedman-Diaconis rule.
 *
 * Scales with the interquartile range. Falls back to Sturges where the IQR is zero.
 */
export function autoBinWidth(values: number[]): number {
	const stats = boxStats(values);
	const n = values.length;
	if (!stats || n < 2) return 1;

	const iqr = stats.q3 - stats.q1;
	if (iqr > 0) return (2 * iqr) / Math.cbrt(n);

	const [lo, hi] = boundsOf(values);
	const span = hi - lo;
	return span > 0 ? span / Math.ceil(Math.log2(n) + 1) : 1;
}

/** Points a violin's outline is drawn with. A vertex count and no claim about the data. */
const VIOLIN_OUTLINE = 49;

/** Probabilities a violin marks where the author names none, which is the box's own three. */
const QUARTILES = [0.25, 0.5, 0.75];

/**
 * The violins with their widths divided the way `scale` asks.
 *
 * `width` passes through. `area` divides by the tallest density. `count` weights by group size.
 */
function heldAcross(violins: ViolinDatum[], scale: "area" | "count" | "width"): ViolinDatum[] {
	if (scale === "width") return violins;

	let peak = 0;
	let mostReadings = 0;
	for (const violin of violins) {
		for (const value of violin.weight) if (value > peak) peak = value;
		if (violin.n > mostReadings) mostReadings = violin.n;
	}
	if (!(peak > 0)) return violins;

	return violins.map((violin) => {
		const share = scale === "count" && mostReadings > 0 ? violin.n / mostReadings : 1;
		return {...violin, weight: violin.weight.map((value) => (value / peak) * share)};
	});
}

/** Values of one measure, grouped by a category. What a box needs and an aggregate does not. */
function valuesByCategory(data: PlotData, keyField: string, valueField: string): Map<string, number[]> {
	const out = new Map<string, number[]>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const key = data.text(row, keyField);
		const value = data.number(row, valueField);
		if (key == null || value == null) continue;
		const held = out.get(key);
		if (held) held.push(value);
		else out.set(key, [value]);
	}
	return out;
}

/**
 * The binning a series states in `statParams`.
 *
 * None stated answers `auto`, the Freedman-Diaconis width.
 */
export function binOf(series: LayerSpec): BinSpec {
	const {binwidth, bins, center, boundary, closed, pad, breaks, dropEmpty} = series.statParams ?? {};
	const stated: BinOptions = {binwidth, bins, center, boundary, closed, pad, breaks, dropEmpty};
	return Object.values(stated).every((value) => value == null) ? "auto" : stated;
}

/**
 * One bar per distinct reading of a measure on x, each reducing the rows at that reading.
 *
 * The width is the smallest gap between two readings, which is the room a bar has.
 */
function distinctBars(
	data: PlotData,
	xId: string,
	yId: string | undefined,
	aggregate: Aggregate,
	transform: AxisTransform,
	halfWidth?: (of: {sd: number; sem: number}) => number | undefined,
): {bars: BarDatum[]; width: number; offScale: number} {
	const {admits} = TRANSFORMS[transform];
	const buckets = new Map<number, Bucket>();
	const collected = NEEDS_VALUES.includes(aggregate) ? new Map<number, number[]>() : null;
	let offScale = 0;
	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		if (x == null) continue;
		if (!admits(x)) {
			offScale += 1;
			continue;
		}
		const value = yId ? data.number(row, yId) : 1;
		if (value == null) continue;
		let bucket = buckets.get(x);
		if (!bucket) {
			bucket = {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity};
			buckets.set(x, bucket);
		}
		bucket.n += 1;
		bucket.sum += value;
		bucket.sumSq += value * value;
		bucket.min = Math.min(bucket.min, value);
		bucket.max = Math.max(bucket.max, value);
		if (collected) collected.set(x, [...(collected.get(x) ?? []), value]);
	}
	const bars = [...buckets]
		.sort(([a], [b]) => a - b)
		.map(([at, bucket]) => ({
			category: String(at),
			at,
			value: reduceBucket(bucket, aggregate, collected?.get(at)),
			n: bucket.n,
			error: halfWidth?.(spreadOf(bucket)),
		}))
		.filter((bar) => Number.isFinite(bar.value));
	return {bars, width: resolutionOf(bars.map((bar) => bar.at)), offScale};
}

/**
 * A measure cut into intervals, reduced per interval.
 *
 * The bar draws at the bin's center. A transformed axis is cut in its own space.
 */
export function binnedBars(
	data: PlotData,
	xId: string,
	yId: string | undefined,
	aggregate: Aggregate,
	bin: BinSpec,
	transform: AxisTransform = "identity",
	/** Half-width of the interval a bin draws, given its spread. Absent draws none. */
	halfWidth?: (of: {sd: number; sem: number}) => number | undefined,
): {bars: BarDatum[]; width: number; offScale: number} {
	const {forward: cut, back, admits} = TRANSFORMS[transform];
	const plain = transform === "identity";
	// A log axis has no place for a reading at or below zero, and the scale would map it to NaN.
	const usable = (value: number | null): value is number => value != null && admits(value);

	const xs: number[] = [];
	let offScale = 0;
	for (let row = 0; row < data.rowCount; row += 1) {
		const value = data.number(row, xId);
		if (usable(value)) xs.push(cut(value));
		else if (value != null) offScale += 1;
	}
	if (xs.length === 0) return {bars: [], width: 1, offScale};

	const stated = binOptionsOf(bin, () => autoBinWidth(xs));
	/* A width the rule chose, which is the only one the cap below is allowed to widen. */
	const authored = typeof bin === "number" || (typeof bin === "object" && bin.binwidth != null);
	const chosen = !authored && typeof stated.binwidth === "number" ? stated.binwidth : undefined;
	const range = boundsOf(xs);
	const collects = NEEDS_VALUES.includes(aggregate);

	const cutInto = (edges: BinEdges) => {
		const running = new Map<number, Bucket>();
		const collected = collects ? new Map<number, number[]>() : null;

		for (let row = 0; row < data.rowCount; row += 1) {
			const x = data.number(row, xId);
			if (!usable(x)) continue;
			const value = yId ? data.number(row, yId) : 1;
			if (value == null) continue;

			const index = binIndex(cut(x), edges);
			if (index < 0) continue;
			let bucket = running.get(index);
			if (!bucket) {
				bucket = {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity};
				running.set(index, bucket);
			}
			bucket.n += 1;
			bucket.sum += value;
			bucket.sumSq += value * value;
			bucket.min = Math.min(bucket.min, value);
			bucket.max = Math.max(bucket.max, value);

			if (collected) {
				const held = collected.get(index);
				if (held) held.push(value);
				else collected.set(index, [value]);
			}
		}

		return {running, collected};
	};

	let edges = binBreaks(range, stated);
	if (!edges) return {bars: [], width: 1, offScale};
	let {running, collected} = cutInto(edges);

	/*
    An automatic width that draws hundreds of bars is widened until it draws dozens.

    Counted on the intervals holding rows. An author who names a width keeps it.
  */
	if (chosen != null && running.size > BIN_CAP) {
		const wider = binBreaks(range, {...stated, binwidth: (chosen * running.size) / BIN_CAP});
		if (wider) {
			edges = wider;
			({running, collected} = cutInto(edges));
		}
	}

	const intervals = stated.pad ? padded(intervalsOf(edges)) : intervalsOf(edges);
	const offset = stated.pad ? 1 : 0;
	const first = intervals[offset]?.width ?? 1;
	const digits = first < 1 ? Math.min(4, Math.ceil(-Math.log10(first)) + 1) : 0;
	const edge = (value: number) => (plain ? value.toFixed(digits) : back(value).toPrecision(3));

	const empty: Bucket = {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity};
	const last = intervals.length - 2 * offset - 1;
	const drawn = intervals.map((interval, at) => {
		const index = at - offset;
		const bucket = running.get(index) ?? empty;
		/* An edge reading lands on the side `closed` names. The outermost interval also holds its outer edge. */
		const fromHeld = edges.rightClosed ? index === 0 : index <= last;
		const toHeld = edges.rightClosed ? index >= 0 : index === last;
		const closed: NonNullable<BarDatum["bin"]>["closed"] =
			fromHeld && toHeld ? "both" : fromHeld ? "left" : toHeld ? "right" : "neither";
		return {
			interval,
			bar: {
				// The label names the interval. A reader taking a count wants its edges.
				category: `${edge(interval.from)} to ${edge(interval.to)}`,
				// The center of the interval, which on a log axis is the geometric middle of its ends.
				at: back(interval.at),
				bin: {
					from: back(interval.from),
					to: back(interval.to),
					closed,
				},
				value: reduceBucket(bucket, aggregate, collected?.get(at - offset)),
				n: bucket.n,
				error: halfWidth?.(spreadOf(bucket)),
			},
		};
	});

	/*
    An interval nothing landed in counts zero and has no mean.

    A reduction with no answer for an empty interval leaves it out whatever the drop says.
  */
	const answerable = drawn.filter((held) => Number.isFinite(held.bar.value));
	const bars = keptUnder(answerable, (held) => held.bar.n > 0, stated.dropEmpty ?? "none").map((held) => held.bar);

	// In the measure's own units. The caller draws a single bar from it.
	return {bars, width: plain ? first : back(range[0] + first) - back(range[0]), offScale};
}

/**
 * Every distinct value of a category, in first-seen order over the table.
 *
 * Built before any narrowing, which keeps a value's color stable.
 */
function codesOf(data: PlotData, field: string): Map<string, number> {
	const read = textReader(data, field);
	const codes = new Map<string, number>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const value = read(row);
		if (value != null && !codes.has(value)) codes.set(value, codes.size);
	}
	return codes;
}

/**
 * Rows of the table under each value of a field, in first-seen order.
 *
 * Row indices. Splitting 250k rows costs one pass and one array of numbers per group.
 */
export function rowsByValue(data: PlotData, field: string): Map<string, number[]> {
	const read = textReader(data, field);
	const out = new Map<string, number[]>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const value = read(row);
		if (value == null) continue;
		const held = out.get(value);
		if (held) held.push(row);
		else out.set(value, [row]);
	}
	return out;
}

/**
 * The table narrowed to some of its rows.
 *
 * A split trace reads one group. Narrowing here keeps a per-group count honest.
 */
export function viewOf(data: PlotData, rows: number[]): PlotData {
	const numbers = data.numbers?.bind(data);
	const texts = data.texts?.bind(data);
	const outer = viewRows.get(data);
	const view: PlotData = {
		fields: data.fields,
		rowCount: rows.length,
		number: (row, field) => data.number(rows[row]!, field),
		text: (row, field) => data.text(rows[row]!, field),
		rowIndex: (row) => data.rowIndex(rows[row]!),
		keyField: data.keyField,
		/* The parent's columns, gathered to this view's rows. */
		numbers:
			numbers &&
			((field) => {
				const column = numbers(field);
				return column && Float64Array.from(rows, (row) => column[row] ?? NaN);
			}),
		texts:
			texts &&
			((field) => {
				const column = texts(field);
				return column && rows.map((row) => column[row] ?? null);
			}),
	};
	viewRows.set(view, outer ? rows.map((row) => outer[row]!) : rows);
	return view;
}

/** Each view's rows in the table the figure read, composed through a view of a view. */
const viewRows = new WeakMap<PlotData, number[]>();

/** Reads a numeric field by row, from the whole column where the table offers one. */
function numberReader(data: PlotData, field: string): (row: number) => number | null {
	const column = data.numbers?.(field);
	if (!column) return (row) => data.number(row, field);
	return (row) => {
		const value = column[row];
		return value === undefined || Number.isNaN(value) ? null : value;
	};
}

/** Reads a field's display text by row, from the whole column where the table offers one. */
function textReader(data: PlotData, field: string): (row: number) => string | null {
	const column = data.texts?.(field);
	if (!column) return (row) => data.text(row, field);
	return (row) => column[row] ?? null;
}

/** Range of a numeric field over the whole table, for a color ramp that holds across traces. */
function rangeOf(data: PlotData, field: string): [number, number] | null {
	const read = numberReader(data, field);
	let lo = Infinity;
	let hi = -Infinity;
	for (let row = 0; row < data.rowCount; row += 1) {
		const value = read(row);
		if (value == null) continue;
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	return Number.isFinite(lo) ? [lo, hi] : null;
}

/**
 * Records a series contributes, dropping rows missing either channel.
 *
 * The drawing cost is met in `Points`, where a dense scatter merges into a path per color step.
 */
interface SizeChannel {
	field: PlotField;
	domain: [number, number];
	radii: readonly [number, number];
}

/** The two ends a bound opacity runs between. The low end clears the page. */
export const ALPHA_RANGE: [number, number] = [0.2, 1];

/**
 * What a bound shape or opacity resolves to, per row.
 *
 * Both take a category through its codes. A measure reaches the opacity arm alone.
 */
interface LevelChannel<T> {
	field: PlotField;
	codes: Map<string, number>;
	levels: readonly T[];
}

/** One level per value, in the order the codes handed them out, for the guide to draw. */
const levelsOf = <T>(channel: LevelChannel<T>): {value: string; at: T}[] =>
	[...channel.codes]
		.sort((a, b) => a[1] - b[1])
		.map(([value, code]) => ({value, at: channel.levels[code % channel.levels.length]!}));

/** Where one reading falls between the two ends of a bound opacity. */
const opacityAt = (value: number, [lo, hi]: [number, number]): number => {
	const [low, high] = ALPHA_RANGE;
	const span = hi - lo;
	return span === 0 ? high : low + Math.min(1, Math.max(0, (value - lo) / span)) * (high - low);
};

function pointsOf(
	data: PlotData,
	xId: string,
	yId: string,
	labelField: PlotField | undefined,
	colorField: PlotField | undefined,
	codes: Map<string, number> | null,
	size: SizeChannel | null,
	zField: PlotField | null,
	/** First-seen code per category, where the horizontal axis runs bands. Absent reads a value scale. */
	bands: Map<string, number> | null = null,
	/** What a jitter position stated, in data units. Absent moves nothing. */
	along?: Jitter,
	/** A fixed offset, where the series asked for a nudge. */
	shift?: {x?: number; y?: number},
	/** Glyph per level, where the shape channel is bound. */
	shapes: LevelChannel<PointShape> | null = null,
	/** Opacity per level or across a range, where the opacity channel is bound. */
	opacities: {field: PlotField; codes: Map<string, number> | null; domain: [number, number] | null} | null = null,
): LayerPoint[] {
	const points: LayerPoint[] = [];
	const readX = numberReader(data, xId);
	const readY = numberReader(data, yId);
	const readZ = zField ? numberReader(data, zField.id) : null;
	const readWeight = colorField?.numeric ? numberReader(data, colorField.id) : null;
	const readSize = size ? numberReader(data, size.field.id) : null;
	const readOpacity = opacities?.domain ? numberReader(data, opacities.field.id) : null;
	const readCategory = bands ? textReader(data, xId) : null;
	const readColor = colorField && !colorField.numeric && codes ? textReader(data, colorField.id) : null;
	const readShape = shapes ? textReader(data, shapes.field.id) : null;
	const readLevel = opacities?.codes ? textReader(data, opacities.field.id) : null;
	const readKey = data.keyField ? textReader(data, data.keyField) : null;
	const readLabel = labelField ? textReader(data, labelField.id) : null;
	const outer = viewRows.get(data);

	for (let row = 0; row < data.rowCount; row += 1) {
		/* On a band the reading is the name, and the index beside it is what the numeric readers take. */
		const category = readCategory ? readCategory(row) : null;
		const x = bands ? (category == null ? null : (bands.get(category) ?? null)) : readX(row);
		const y = readY(row);
		// A row missing either channel drops out. An unmeasured endpoint is no reading of zero.
		if (x == null || y == null) continue;

		/* A cube drops a row missing its third reading for the reason the pair are dropped: a geom on
		   the floor claims a measurement of zero somebody did not take. */
		let z: number | undefined;
		if (readZ) {
			const value = readZ(row);
			if (value == null) continue;
			z = value;
		}

		let weight: number | undefined;
		if (readWeight) {
			const value = readWeight(row);
			if (value != null) weight = value;
		} else if (readColor && codes) {
			const value = readColor(row);
			if (value != null) weight = codes.get(value);
		}

		/* A row with no reading on the size field draws at the layer's own radius, which is the geom
		   the chart shows for everything else it cannot size. */
		let radius: number | undefined;
		let sizeValue: number | undefined;
		if (size && readSize) {
			const value = readSize(row);
			if (value != null) {
				sizeValue = value;
				radius = sizeRadius(value, size.domain[0], size.domain[1], size.radii);
			}
		}

		/*
		  A row with no reading on either channel draws what the layer draws.

		  A glyph reads its level off the category's own code. An opacity takes the same route.
		*/
		let shape: PointShape | undefined;
		if (shapes && readShape) {
			const value = readShape(row);
			const code = value == null ? undefined : shapes.codes.get(value);
			if (code != null) shape = shapes.levels[code % shapes.levels.length];
		}

		let opacity: number | undefined;
		if (opacities?.domain && readOpacity) {
			const value = readOpacity(row);
			if (value != null) opacity = opacityAt(value, opacities.domain);
		} else if (opacities?.codes && readLevel) {
			const value = readLevel(row);
			const code = value == null ? undefined : opacities.codes.get(value);
			const steps = Math.max(1, opacities.codes.size - 1);
			if (code != null) opacity = opacityAt(code, [0, steps]);
		}

		/* A fixed key set, absent values included. The points share one hidden class. */
		points.push({
			x,
			category: category ?? undefined,
			y,
			z,
			weight,
			size: radius,
			sizeValue,
			shape,
			opacity,
			key: readKey ? (readKey(row) ?? undefined) : undefined,
			text: readLabel ? (readLabel(row) ?? undefined) : undefined,
			row: data.rowIndex(row),
			plotRow: outer ? outer[row]! : row,
		});
	}

	if (along) nudge(points, along, bands != null, readColor && codes ? codes.size : 1);
	if (shift) shove(points, shift);
	return points;
}

/**
 * A column's recording resolution. The smallest gap between two readings that differ.
 *
 * What a jitter is measured against, ggplot's `resolution()`. A column of one reading has
 * resolution 1.
 */
function resolutionOf(values: number[]): number {
	const sorted = [...new Set(values)].sort((a, b) => a - b);
	let gap = Infinity;
	for (let i = 1; i < sorted.length; i += 1) {
		const step = sorted[i]! - sorted[i - 1]!;
		if (step > 0 && step < gap) gap = step;
	}
	return Number.isFinite(gap) ? gap : 1;
}

/** The share of an axis's resolution a jitter spreads over where the position states no amount. ggplot's 0.4. */
const JITTER_SHARE = 0.4;

/** Width a jitterdodge's dodged set spans where the position states none, in data units. ggplot's 0.75. */
const DODGE_WIDTH = 0.75;

/** What a jitter position asks for, in data units. `dodge` is the dodged set's width, on a jitterdodge alone. */
interface Jitter {
	x?: number;
	y?: number;
	seed?: number;
	dodge?: number;
}

/**
 * Nudges each geom off its reading, deterministically. ggplot's `position_jitter` and
 * `position_jitterdodge`.
 *
 * The offset is uniform in plus or minus the stated amount, in data units. An unstated axis takes
 * 0.4 times its resolution, and a band axis has resolution 1. The row index seeds the offset.
 *
 * A dodge moves each color level into its own slot first. Its jitter is ggplot's: across, the width
 * over the level count plus two, and along y, none unless stated.
 */
function nudge(points: LayerPoint[], along: Jitter, band: boolean, levels: number): void {
	const resolutionX = band ? 1 : resolutionOf(points.map((point) => point.x));
	const spanX = (along.x ?? JITTER_SHARE * resolutionX) / (along.dodge == null ? 1 : levels + 2);
	const spanY = along.y ?? (along.dodge == null ? JITTER_SHARE * resolutionOf(points.map((point) => point.y)) : 0);

	/* ggplot's `pos_dodge`: the set spans the dodge width, and each level takes the slot its code names. */
	const {dodge} = along;
	if (dodge != null) for (const point of points) point.dx = (((point.weight ?? 0) + 0.5) / levels - 0.5) * dodge;
	if (spanX === 0 && spanY === 0) return;

	/*
	  A seed shifts the hash. The offsets come off the row and one spec draws one picture.
	*/
	const seed = along.seed ?? 0;

	for (let i = 0; i < points.length; i += 1) {
		const point = points[i]!;
		/* Two decorrelated streams off one index. No geom is nudged along the diagonal. */
		const a = Math.sin((point.row + seed) * 12.9898) * 43758.5453;
		const b = Math.sin((point.row + seed) * 78.233) * 12345.6789;
		if (spanX > 0) point.dx = (point.dx ?? 0) + (2 * (a - Math.floor(a)) - 1) * spanX;
		if (spanY > 0) point.dy = (2 * (b - Math.floor(b)) - 1) * spanY;
	}
}

/** Moves a geom a fixed distance in the axes' own units. ggplot's `position_nudge`. */
function shove(points: LayerPoint[], by: {x?: number; y?: number}): void {
	for (const point of points) {
		if (by.x) point.dx = (point.dx ?? 0) + by.x;
		if (by.y) point.dy = (point.dy ?? 0) + by.y;
	}
}

/**
 * Traces one split may produce.
 *
 * Past two dozen the palette repeats itself. The largest groups are kept and the footer counts
 * the rest.
 */
export const SPLIT_CAP = 24;

/**
 * Whether the color a series draws is the author's to pick.
 *
 * A bound color channel paints from a column. A `group` split keeps the one color.
 */
export const drawsOneColor = (series: LayerSpec): boolean => !paintColumn(series);

/**
 * Geometries that draw one mark over the whole trace.
 *
 * A dimension on the color channel cuts these into a trace per value. A point geometry paints
 * mark by mark.
 */
const MERGED_GEOMS: readonly Geom[] = [
	"line",
	"smooth",
	"area",
	"freqpoly",
	"density",
	"bar",
	"ribbon",
	"range",
	"segment",
	"hline",
	"vline",
	"abline",
	"text",
];

/** The kinds that stack their groups where the layer states no position, ggplot's `position = "stack"`. */
const STACKED_KINDS: readonly PlotKind[] = ["bar", "histogram", "area"];

/** The reference geoms, which place their own lines and read no shared X. */
const RULE_GEOMS: readonly Geom[] = ["hline", "vline", "abline"];

/** The shared X a reference line is handed where the chart binds none. It reads no field. */
const NO_FIELD: PlotField = {id: "", label: "", numeric: true};

/** What a build reads beside the spec and its rows. */
export interface BuildOptions {
	/** The two color maps the figure draws with. */
	palettes: Palettes;
	/** The sizing the build reads, `REGULAR` unless stated. A facet hands each panel its own. */
	metrics?: Metrics;
	/** Category codes a figure set pins. A value keeps its color across the set. */
	pinned?: Assignments;
	/** The facet field and the value of the panel this build draws. */
	facet?: {field: PlotField; value: string};
}

export function buildLayers(
	plot: ChartSpec,
	data: PlotData,
	{palettes, pinned, metrics = REGULAR, facet}: BuildOptions,
): BuiltLayers {
	const fieldAt = new Map(data.fields.map((field) => [field.id, field]));
	const visible = plot.layers.filter((series) => series.visible !== false);

	/* Each layer's own rows, read once. ggplot's `data` per layer. */
	const tables = new Map<string, PlotData>();
	for (const series of visible) if (series.data) tables.set(series.id, ownTable(series.data, fieldAt));
	const tableOf = (series: LayerSpec): PlotData => tables.get(series.id) ?? data;
	const fieldMaps = new Map<PlotData, Map<string, PlotField>>([[data, fieldAt]]);
	const fieldsOf = (table: PlotData): Map<string, PlotField> => {
		let held = fieldMaps.get(table);
		if (!held) {
			held = new Map(table.fields.map((field) => [field.id, field]));
			fieldMaps.set(table, held);
		}
		return held;
	};

	/* The axis reads the first layer binding an x over the chart's rows, then any layer. Each places its own. */
	const bindsX = (series: LayerSpec) => typeof series.aes.x === "string";
	const xSeries = visible.find((series) => bindsX(series) && !series.data) ?? visible.find(bindsX);
	const xId = xSeries?.aes.x as string | undefined;
	const xField = xSeries && xId ? fieldsOf(tableOf(xSeries)).get(xId) : undefined;
	const axisKind = axisKindFor(plot, xField);

	const traces: Trace[] = [];
	const unbuilt: PlotKind[] = [];
	const omitted: Omission[] = [];

	/*
    Both color maps are read off the whole table and cached. A trace sees one group.

    A figure set's assignments displace the ordering here.
  */
	const codeCache = new Map<string, Map<string, number>>();
	const codesFor = (fieldId: string) => {
		let codes = codeCache.get(fieldId);
		if (!codes) {
			/* The chart's table first, then each layer's. A value two tables share takes one code. */
			const seen = codesOf(data, fieldId);
			for (const table of tables.values()) {
				for (const value of codesOf(table, fieldId).keys()) if (!seen.has(value)) seen.set(value, seen.size);
			}
			codes = pinnedOver(seen, pinned?.[fieldId]);
			codeCache.set(fieldId, codes);
		}
		return codes;
	};

	const rangeCache = new Map<string, [number, number] | null>();
	const rangeFor = (fieldId: string) => {
		if (!rangeCache.has(fieldId)) {
			const ends = [data, ...tables.values()].flatMap((table) => rangeOf(table, fieldId) ?? []);
			rangeCache.set(fieldId, ends.length === 0 ? null : boundsOf(ends));
		}
		return rangeCache.get(fieldId)!;
	};

	visible.forEach((series, index) => {
		const geom = geomFor(series.kind);
		if (!geom) {
			unbuilt.push(series.kind);
			return;
		}

		/* The rows this layer reads, and a trace that says where they came from. */
		const table = tableOf(series);
		const fields = fieldsOf(table);
		/* A reference line mapping neither color nor dash names nothing a legend could key, as in ggplot. */
		const rule = RULE_GEOMS.includes(geom);
		const unkeyed =
			(rule && series.showLegend !== true && !paintColumn(series) && !series.aes.linetype) ||
			(geom === "text" && series.showLegend !== true);
		const push = (trace: Trace) =>
			traces.push({
				...trace,
				...(table === data ? {} : {table}),
				...(series.showLegend === false || unkeyed ? {showLegend: false as const} : {}),
				...(facet && fields.has(facet.field.id) ? {facetField: facet.field, facetValue: facet.value} : {}),
			});

		/* A categorical map the series named, which colors its categories by position. */
		const identity = series.palette ? palettes.categoricalFor?.(series.palette) : undefined;

		/*
      The palette's color. `paint` applies the author's after the build.
    */
		const color = (identity ?? palettes).categorical(index);

		/* The magnitude map, where the series named one of its own. Every ramped geom reads it. */
		const sequential = series.palette ? palettes.sequentialFor?.(series.palette) : undefined;
		const painted = {...palettes, ...(sequential ? {sequential} : {}), ...identity};

		if (geom === "sankey") {
			const built = flowTrace(series, table, fields, color);
			if (built) {
				push(built.trace);
				omit(omitted, "flows", built.dropped);
			}
			return;
		}
		/* A genome round a circle. The sectors come off the rows and carry their own ranges. */
		if (geom === "ideogram") {
			const built = ideogramTrace(series, table, fields, color);
			if (built) {
				push(sequential ? {...built.trace, sequential} : built.trace);
				omit(omitted, "categories", built.dropped);
				omit(omitted, "links", built.offSector);
				omit(omitted, "colors", flattened(built.hued, palettes.categoricalSize, series.style?.fill));
			}
			return;
		}
		/* The same pairs, closed into a circle. The sectors come off the links the flow builds. */
		if (geom === "chord") {
			const built = chordTrace(series, table, fields, color);
			if (built) {
				push(sequential ? {...built.trace, sequential} : built.trace);
				omit(omitted, "flows", built.dropped);
				omit(omitted, "colors", flattened(built.hued, palettes.categoricalSize, series.style?.fill));
			}
			return;
		}
		if (geom === "treemap" || geom === "icicle" || geom === "sunburst") {
			const built = hierarchyTrace(series, geom, table, fields, color, painted.categorical);
			if (built) {
				push(built.trace);
				omit(omitted, "categories", built.dropped);
				omit(omitted, "colors", flattened(built.hued, painted.categoricalSize, series.style?.fill));
			}
			return;
		}
		/* One rule per measure, laid out along a row or round a center. The payload is the same either way. */
		if (geom === "parcoords" || geom === "radar") {
			const built = parallelTrace(
				series,
				geom,
				table,
				fields,
				color,
				painted,
				codesFor,
				rangeFor,
				layerScale(plot, series),
			);
			if (built) {
				/* The series' own map, held on the trace. `paint` rebuilds the ramp off it. */
				push(sequential ? {...built.trace, sequential} : built.trace);
				omit(omitted, "rows-sampled", built.skipped);
				omit(omitted, "rows-incomplete", built.incomplete);
				omit(omitted, "measures", built.axesDropped);
			}
			return;
		}
		/* A dial binds one magnitude and reads its ends off the vertical axis. No shared X. */
		if (geom === "gauge") {
			const built = gaugeTrace(series, table, fields, color, rangeFor, plot.scales?.y?.limits);
			if (built) push(sequential ? {...built, sequential} : built);
			return;
		}
		/* A layer places its own x where it binds one, which is ggplot's mapping per layer. */
		const ownX = typeof series.aes.x === "string" ? series.aes.x : xId;
		const ownXField = ownX ? fields.get(ownX) : undefined;
		if (!rule && (!ownX || !ownXField)) return;

		/*
	      A series states its own color scale over the chart's, field by field, on its paint aesthetic.

	      Merged. A series naming a title alone keeps the chart's range under it.
	    */
		const colorOptions = layerScale(plot, series);

		const shared = {
			fieldAt: fields,
			xId: ownX ?? "",
			xField: ownXField ?? NO_FIELD,
			axisKind,
			xTransform: horizontalTransform(plot, xField),
			palettes: painted,
			codesFor,
			rangeFor,
			metrics,
			colorOptions,
			omitted,
		};

		/*
	      A dash belongs to a path. Binding it cuts the series.

	      A series naming both fields splits on the author's and reads the dash off each trace.
	    */
		const dashId =
			typeof series.aes.linetype === "string" &&
			(kindFacts(series.kind).accepts as readonly string[]).includes("linetype")
				? series.aes.linetype
				: undefined;
		const dashField = dashId ? fields.get(dashId) : undefined;
		const dashes = dashField && !dashField.numeric ? dashField : undefined;
		/*
	      A dimension on the color channel, where the geom draws one mark over its records.

	      A merged geom has no per-record mark to paint. A fit draws a curve per color, as ggplot's does.
	    */
		const colorId = paintColumn(series);
		const colorSplit = colorId && (MERGED_GEOMS.includes(geom) || series.fit) ? fields.get(colorId) : undefined;
		/* ggplot's `group` cuts the paths and leaves their color and dash to the channels that name them. */
		const groupId = typeof series.aes.group === "string" ? series.aes.group : undefined;
		const splitId = groupId ?? (colorSplit?.numeric === false ? colorSplit.id : undefined) ?? dashes?.id;
		const splitField = splitId ? fields.get(splitId) : undefined;

		/* The pattern a trace draws, read off the value its own rows hold on the dash column. */
		const dashCodes = dashes ? codesFor(dashes.id) : null;
		const dashFor = (value: string | null | undefined): Trace["linetypeChannel"] => {
			if (!dashes || !dashCodes || value == null) return undefined;
			const code = dashCodes.get(value) ?? 0;
			return {field: dashes, at: LINETYPES[code % LINETYPES.length]!, value};
		};

		/* What the series painted with. A later rebuild reads it back. */
		const own = {
			...(sequential ? {sequential} : {}),
			...(series.scales?.[paintAesthetic(series)] ? {colorOptions} : {}),
		};

		if (!splitField) {
			const built = traceOf(series, geom, {...shared, data: table, color});
			if (built) push({...built, ...own});
			return;
		}

		/*
      The split value owns the color and the series owns the geom. An explicit series color is
      dropped here.
    */
		const codes = codesFor(splitField.id);
		const groups = [...rowsByValue(table, splitField.id)].sort((a, b) => b[1].length - a[1].length);
		omit(omitted, "splits", Math.max(0, groups.length - SPLIT_CAP));
		/* A split naming a sequential map steps along it in code order, where no other color column paints it. */
		const steps =
			sequential && !identity && (colorId == null || colorId === splitField.id) ? Math.max(1, codes.size - 1) : 0;
		const splitColor = (value: string) =>
			steps > 0 ? sequential!((codes.get(value) ?? 0) / steps) : painted.categorical(codes.get(value) ?? 0);

		/* A color column apart from the split paints each group by its own value, which is ggplot's color beside group. */
		const colorField = colorId ? fields.get(colorId) : undefined;
		const tinted = colorField && !colorField.numeric && colorField.id !== splitField.id ? colorField : undefined;
		const tints = tinted ? codesFor(tinted.id) : null;
		const tintLevels = tints
			? [...tints].map(([level, code]) => ({value: level, code})).sort((a, b) => a.code - b.code)
			: undefined;
		const groupColor = (value: string, first: number | undefined): string => {
			if (tinted && tints) {
				const level = first == null ? null : table.text(first, tinted.id);
				return painted.categorical(level == null ? 0 : (tints.get(level) ?? 0));
			}
			return groupId ? color : splitColor(value);
		};

		/* A color split beside its own dash column cuts each group again at each dash value. ggplot's default group crosses both. */
		const crossed = groupId == null && dashes != null && dashes.id !== splitField.id;
		/* One group's rows, parted by the value each holds on a column. A missing value parts on its own. */
		const partedBy = (rows: number[], fieldId: string): [string | null, number[]][] => {
			const parts = new Map<string | null, number[]>();
			for (const row of rows) {
				const level = table.text(row, fieldId);
				const part = parts.get(level);
				if (part) part.push(row);
				else parts.set(level, [row]);
			}
			return [...parts];
		};
		const paths = groups
			.slice(0, SPLIT_CAP)
			.flatMap(([value, rows]): [string, number[], string | null | undefined][] =>
				crossed && dashes
					? partedBy(rows, dashes.id).map(([level, part]) => [value, part, level])
					: [[value, rows, undefined]],
			);

		/* Groups over several dash values. One path draws one pattern, its first row's. */
		let mixedDashes = 0;
		for (const [value, rows, level] of paths) {
			const drawn = groupColor(value, rows[0]);
			const built = traceOf(series, geom, {
				...shared,
				data: viewOf(table, rows),
				color: drawn,
			});
			if (!built) continue;
			const held = dashes ? rows.flatMap((row) => table.text(row, dashes.id) ?? []) : [];
			if (new Set(held).size > 1) mixedDashes += 1;
			const dash = dashFor(held[0]);
			push({
				...built,
				...own,
				id: level === undefined ? `${series.id}:${value}` : `${series.id}:${value}:${level ?? ""}`,
				name: groupId ? built.name : value,
				splitValue: value,
				splitField,
				...(groupId ? {grouped: true} : {}),
				...(tinted && tintLevels
					? {
							color: drawn,
							colorField: tinted,
							colorLevels: tintLevels,
							ramp: ((code: number) => painted.categorical(Math.round(code))) as Trace["ramp"],
						}
					: {}),
				...(dash ? {linetypeChannel: dash} : {}),
			});
		}
		omit(omitted, "dashes", mixedDashes);
	});

	const order = plot.scales?.x?.order;
	const accrued = stepped(accumulated(traces, axisKind === "band", order, visible), order);
	const along =
		axisKind === "band" ? orderBand(order, [...new Set(accrued.flatMap(categoriesOf))], () => null).values : undefined;
	const positioned = adjusted(accrued, visible, along);
	flag(omitted, "stack", positioned.negativeStack);

	const fields = [...tables.values()].flatMap((table) => table.fields).filter((field) => !fieldAt.has(field.id));
	return {traces: positioned.traces, axisKind, xField, fields, unbuilt, omitted};
}

/**
 * A layer's rows as a table.
 *
 * A column the chart's table also holds takes that field's label, unit, digits and scale flags.
 */
function ownTable(rows: NonNullable<LayerSpec["data"]>, fieldAt: Map<string, PlotField>): PlotData {
	const shared: Record<string, FieldOverride> = {};
	for (const row of rows) {
		for (const key of Object.keys(row)) {
			const field = fieldAt.get(key);
			if (!field || key in shared) continue;
			const {label, unit, digits, logScale, timeScale} = field;
			shared[key] = Object.fromEntries(
				Object.entries({label, unit, digits, logScale, timeScale}).filter(([, value]) => value !== undefined),
			);
		}
	}
	return toPlotData(rows, {fieldOverrides: shared});
}

/**
 * Position adjustment -- what happens where two geoms share a band.
 *
 * Runs over the built traces. A floor per geom, and geoms naming one adjustment adjust together.
 */
function adjusted(
	traces: Trace[],
	series: LayerSpec[],
	along?: readonly string[],
): {traces: Trace[]; negativeStack: boolean} {
	/*
	  A grouped bar, histogram or area stacks where the author states no position, as ggplot's do.

	  The default stacks a layer's own groups and none of another layer's. A layer drawing one trace
	  has nothing to stack.
	*/
	const tracesOf = new Map<string, number>();
	for (const trace of traces) tracesOf.set(trace.layerId, (tracesOf.get(trace.layerId) ?? 0) + 1);
	const defaulted = new Set(
		series
			.filter((one) => one.position == null && STACKED_KINDS.includes(one.kind) && (tracesOf.get(one.id) ?? 0) > 1)
			.map((one) => one.id),
	);
	const asked = new Map(
		series.map((one): [string, Position] => [one.id, one.position ?? (defaulted.has(one.id) ? "stack" : "identity")]),
	);

	/*
	  `"bars" in data` is the arm's discriminator, the way `"mesh" in data` picks out a cube's.

	  A waterfall shares that payload and comes out. `stepped` resolved its floors.
	*/
	const barsOf = (trace: Trace) =>
		trace.data.at === "groups" && "bars" in trace.data && trace.data.geom !== "waterfall" ? trace.data : null;

	/*
	  Grouped by the adjustment's name. Two layers naming one of them adjust together, and a default
	  stack keeps to its own layer.

	  The parameters travel beside it. The first statement wins and the group keeps it.
	*/
	const groups = new Map<string, {position: PositionKind; members: number[]; args: ReturnType<typeof positionArgs>}>();
	traces.forEach((trace, index) => {
		const position = asked.get(trace.layerId);
		const kind = positionKind(position);
		/* `jitter` and `nudge` offset the mark itself. `jitterOf` and `shoveOf` carry them. */
		if (kind === "identity" || kind === "jitter" || kind === "nudge" || !barsOf(trace)) return;
		const key = defaulted.has(trace.layerId) ? `${kind}:${trace.layerId}` : kind;
		const held = groups.get(key);
		if (held) held.members.push(index);
		else groups.set(key, {position: kind, members: [index], args: positionArgs(position)});
	});
	if (groups.size === 0) return {traces, negativeStack: false};

	const out = [...traces];
	let negativeStack = false;

	for (const {position, members: asWritten, args} of groups.values()) {
		/* ggplot's `reverse`, which hands the slots out the other way round. */
		const members = args.reverse ? [...asWritten].reverse() : asWritten;

		/*
	      A dodge, and `dodge2` with it. Both divide the band one way.

	      `preserve` decides the slot count. `total` is the default, as in ggplot: each band divides by
	      the bars it holds, and each bar takes its rank among them. `single` counts the traces.
	    */
		if (position === "dodge" || position === "dodge2" || position === "jitterdodge") {
			const total = args.preserve !== "single";
			const present = new Map<string, number>();
			const rank = new Map<number, Map<string, number>>();
			if (total) {
				for (const at of members) {
					const ranks = new Map<string, number>();
					for (const one of barsOf(out[at]!)?.bars ?? []) {
						ranks.set(one.category, present.get(one.category) ?? 0);
						present.set(one.category, (present.get(one.category) ?? 0) + 1);
					}
					rank.set(at, ranks);
				}
			}

			/* A jitterdodge's set spans its `dodgeWidth`. Its `width` is the jitter's. */
			const width = position === "jitterdodge" ? (args.dodgeWidth ?? DODGE_WIDTH) : args.width;
			members.forEach((at, index) => {
				const data = barsOf(out[at]!);
				if (!data) return;
				const bars = total
					? data.bars.map((one) => ({
							...one,
							slotOf: present.get(one.category) ?? members.length,
							slotAt: rank.get(at)?.get(one.category) ?? index,
						}))
					: data.bars;
				out[at] = {
					...out[at]!,
					data: {
						...data,
						bars,
						slot: {index, of: members.length, ...(width == null ? {} : {width})},
					},
				};
			});
			continue;
		}

		/*
      A streamgraph's offset floor has no side for a negative segment to hang below.

      Dropped for the whole group. The footer states it.
    */
		const offset = position === "stack" && args.offset && args.offset !== "zero" ? args.offset : undefined;
		if (offset && members.some((at) => (barsOf(out[at]!)?.bars ?? []).some((one) => one.value < 0))) {
			negativeStack = true;
			continue;
		}

		/*
	      ggplot's `vjust` -- where a geom falls inside its stack segment.

	      One is the far end and the default. Zero is the floor. It moves the reading.
	    */
		const {vjust} = args;

		/*
		  ggplot's `position_stack`. A positive reading stacks up from zero and a negative one down from
		  it, each sign on a running total of its own. A fill divides each sign by its own sum.
		*/
		const sideOf = (value: number) => (value < 0 ? "below" : "above");
		const totals = {above: new Map<string, number>(), below: new Map<string, number>()};
		for (const at of members) {
			for (const one of barsOf(out[at]!)?.bars ?? []) {
				const sums = totals[sideOf(one.value)];
				sums.set(one.category, (sums.get(one.category) ?? 0) + one.value);
			}
		}

		const running = {
			above: offset
				? baselineOf(
						members.map((at) => barsOf(out[at]!)?.bars ?? []),
						offset,
						along,
					)
				: new Map<string, number>(),
			below: new Map<string, number>(),
		};
		for (const at of members) {
			const data = barsOf(out[at]!);
			if (!data) continue;
			const bars = data.bars.map((one) => {
				const side = sideOf(one.value);
				const floor = running[side].get(one.category) ?? 0;
				running[side].set(one.category, floor + one.value);
				const stacked =
					position !== "fill"
						? {...one, floor}
						: /* A category summing to zero has no shares to take. It keeps its zeros. */
							((total) =>
								total > 0 ? {...one, floor: floor / total, value: one.value / total} : {...one, floor: 0, value: 0})(
								Math.abs(totals[side].get(one.category) ?? 0),
							);
				return vjust == null ? stacked : justified(stacked, vjust);
			});
			/* A fill leaves shares behind it, which the axis title and the readout both have to know. */
			out[at] = {...out[at]!, data: {...data, bars, ...(position === "fill" ? {shares: true} : {})}};
		}
	}

	/*
	  A text layer under a dodge takes the slot of the bar it names, matched by split value.

	  The bar's thickness comes along.
	*/
	const dodges = new Set<PositionKind>(["dodge", "dodge2", "jitterdodge"]);
	const thickness = new Map(series.map((one) => [one.id, one.style?.thickness]));
	for (let at = 0; at < out.length; at += 1) {
		const trace = out[at]!;
		if (trace.data.geom !== "text" || trace.data.at !== "records") continue;
		const kind = positionKind(asked.get(trace.layerId));
		if (!dodges.has(kind)) continue;
		const named = out.find((one) => {
			const bars = barsOf(one);
			return bars?.slot != null && one.splitValue === trace.splitValue && positionKind(asked.get(one.layerId)) === kind;
		});
		const bars = named ? barsOf(named) : null;
		if (!bars?.slot) continue;
		const cap = thickness.get(named!.layerId);
		/* ggplot's `preserve = "total"` divides each band by what it holds. The label divides the same way. */
		const counted = bars.bars.filter((bar) => bar.slotOf != null);
		const ofBand = counted.length > 0 ? Object.fromEntries(counted.map((bar) => [bar.category, bar.slotOf!])) : null;
		out[at] = {
			...trace,
			data: {...trace.data, slot: {...bars.slot, ...(cap == null ? {} : {cap}), ...(ofBand ? {ofBand} : {})}},
		};
	}

	/*
	  A text layer under a stack runs its own total per category, ggplot's `position_stack` on `geom_text`.

	  A fill divides by that total. A negative reading leaves the labels unstacked.
	*/
	for (const kind of ["stack", "fill"] as const) {
		const texts = out.flatMap((trace, at) =>
			trace.data.geom === "text" && positionKind(asked.get(trace.layerId)) === kind ? [at] : [],
		);
		if (texts.length === 0) continue;
		const args = positionArgs(asked.get(out[texts[0]!]!.layerId));
		const pointsAt = (at: number) => {
			const data = out[at]!.data;
			return data.geom === "text" && data.at === "records" ? data.points : [];
		};
		if (texts.some((at) => pointsAt(at).some((point) => point.y < 0))) continue;

		const keyOf = (point: {category?: string; x: number}) => point.category ?? String(point.x);
		const totals = new Map<string, number>();
		for (const at of texts) {
			for (const point of pointsAt(at)) totals.set(keyOf(point), (totals.get(keyOf(point)) ?? 0) + point.y);
		}
		const running = new Map<string, number>();
		for (const at of args.reverse ? [...texts].reverse() : texts) {
			const data = out[at]!.data;
			if (data.geom !== "text" || data.at !== "records") continue;
			const points = data.points.map((point) => {
				const floor = running.get(keyOf(point)) ?? 0;
				running.set(keyOf(point), floor + point.y);
				const top = floor + point.y * Math.min(1, Math.max(0, args.vjust ?? 1));
				const total = totals.get(keyOf(point)) ?? 0;
				return {...point, y: kind === "stack" ? top : total > 0 ? top / total : 0};
			});
			out[at] = {...out[at]!, data: {...data, points}};
		}
	}

	return {traces: out, negativeStack};
}

/** Whether a series asks for a running total its kind draws. `GEOMS` lists `cumulative` under those. */
const runs = (series: LayerSpec): boolean =>
	series.cumulative === true && (kindFacts(series.kind).layer as readonly LayerField[]).includes("cumulative");

/**
 * Turns each cumulative series into a running total.
 *
 * Traces on a band share its order. A value scale keeps each trace's own bins. An accumulated
 * series reports no interval.
 */
function accumulated(traces: Trace[], banded: boolean, order: BandOrder | undefined, series: LayerSpec[]): Trace[] {
	const byId = new Map(series.map((one) => [one.id, one]));
	let band: string[] | undefined;
	const along = () => (band ??= orderBand(order, [...new Set(traces.flatMap(categoriesOf))], () => null).values);
	return traces.map((trace) => {
		const data = trace.data;
		const own = byId.get(trace.layerId);
		if (!own || data.at !== "groups" || !("bars" in data) || !runs(own)) return trace;

		const held = new Map(data.bars.map((bar) => [bar.category, bar]));
		const ordered = banded ? along().flatMap((category) => held.get(category) ?? []) : data.bars;
		return {...trace, data: {...data, bars: accumulate(ordered), error: undefined, cumulative: true}};
	});
}

/** Categories a trace occupies, in the order it produced them. */
export function categoriesOf(trace: Trace): string[] {
	/*
    A record geom names its band the way a reduction names its groups.

    An interval and a segment write the category on the reading.
  */
	if (trace.data.at === "records") {
		if (trace.data.geom === "ribbon" || trace.data.geom === "range") {
			return trace.data.readings.map((reading) => reading.x).filter((at): at is string => typeof at === "string");
		}
		if (trace.data.geom === "segment") {
			return trace.data.segments.map((segment) => segment.x).filter((at): at is string => typeof at === "string");
		}
		if (trace.data.geom === "point" || trace.data.geom === "text") {
			return trace.data.points.map((point) => point.category).filter((at): at is string => at != null);
		}
		return [];
	}
	if (trace.data.at !== "groups") return [];
	if (trace.data.geom === "boxplot") return trace.data.boxes.map((box) => box.category);
	if (trace.data.geom === "violin") return trace.data.violins.map((violin) => violin.category);
	// A grid has a cell per pair. A column appears once per row.
	if (trace.data.geom === "heatmap") return [...new Set(trace.data.cells.map((cell) => cell.x))];
	// A flow names nodes. It takes no slot on a band.
	if (trace.data.geom === "sankey" || trace.data.geom === "chord" || trace.data.geom === "ideogram") return [];
	// A hierarchy positions its cells by nesting. No slot on a band.
	if (trace.data.geom === "treemap" || trace.data.geom === "icicle" || trace.data.geom === "sunburst") return [];
	// A density curve stands on a value scale. No slot on a band.
	if (trace.data.geom === "density") return [];
	// A cube positions itself and names nothing on the frame's band.
	if ("mesh" in trace.data || "field" in trace.data) return [];
	/* A dial takes one number and no category. No slot on the band. */
	if (trace.data.geom === "gauge") return [];
	return trace.data.bars.map((bar) => bar.category);
}

/**
 * Where a stack's floor runs under each category, for the two offsets that move it off zero.
 *
 * `silhouette` centers the total on zero. `wiggle` sets each step against the last to keep the
 * layers' slopes small, the streamgraph's baseline. Categories run in axis order.
 */
function baselineOf(
	layers: readonly BarDatum[][],
	offset: "silhouette" | "wiggle",
	along?: readonly string[],
): Map<string, number> {
	const positions = new Map<string, number>();
	for (const layer of layers)
		for (const one of layer) if (!positions.has(one.category)) positions.set(one.category, one.at ?? positions.size);
	const categories = along
		? along.filter((category) => positions.has(category))
		: [...positions].sort((a, b) => a[1] - b[1]).map(([category]) => category);
	const valueIn = layers.map((layer) => new Map(layer.map((one) => [one.category, one.value])));
	const at = (i: number, j: number) => valueIn[i]!.get(categories[j]!) ?? 0;

	const floor = new Map<string, number>();
	let base = 0;
	categories.forEach((category, j) => {
		if (offset === "silhouette") {
			base = -layers.reduce((sum, _, i) => sum + at(i, j), 0) / 2;
		} else if (j > 0) {
			let total = 0;
			let moment = 0;
			let below = 0;
			for (let i = 0; i < layers.length; i += 1) {
				const rise = at(i, j) - at(i, j - 1);
				moment += at(i, j) * (below + rise / 2);
				total += at(i, j);
				below += rise;
			}
			if (total > 0) base -= moment / total;
		}
		floor.set(category, base);
	});
	return floor;
}

/**
 * Stacks each waterfall step on the steps before it, and orders a ring's slices.
 *
 * A step's floor is the height the ones before it reached. Both read `scales.x.order`.
 */
function stepped(traces: Trace[], order: BandOrder | undefined): Trace[] {
	return traces.map((trace) => {
		const data = trace.data;
		if (data.at !== "groups" || !("bars" in data)) return trace;
		const ring = data.geom === "pie";
		if (data.geom !== "waterfall" && !(ring && order)) return trace;

		const held = new Map(data.bars.map((step) => [step.category, step]));
		const {values} = orderBand(order, [...held.keys()], () => null);
		if (ring) return {...trace, data: {...data, bars: values.map((category) => held.get(category)!)}};

		let running = 0;
		const bars = values.map((category) => {
			const step = held.get(category)!;
			const floor = running;
			running += step.value;
			return {...step, floor};
		});

		return {...trace, data: {...data, bars}};
	});
}

/**
 * Moves a stacked geom inside its own segment, for a caller that stated a `vjust`.
 *
 * The floor stays where the stack put it and the reading moves toward it.
 */
const justified = (bar: BarDatum, vjust: number): BarDatum => ({
	...bar,
	value: bar.value * Math.min(1, Math.max(0, vjust)),
});

/** What a jitter position asks for, where the series stated one. Each axis apart, in data units. */
const jitterOf = (series: LayerSpec): Jitter | undefined => {
	const kind = positionKind(series.position);
	if (kind !== "jitter" && kind !== "jitterdodge") return undefined;
	const {width, height, seed, dodgeWidth} = positionArgs(series.position);
	return {
		...(width == null ? {} : {x: width}),
		...(height == null ? {} : {y: height}),
		...(seed == null ? {} : {seed}),
		...(kind === "jitterdodge" ? {dodge: dodgeWidth ?? DODGE_WIDTH} : {}),
	};
};

/** The fixed offset a nudge asks for, in the axes' own units. */
const shoveOf = (series: LayerSpec): {x?: number; y?: number} | undefined => {
	if (positionKind(series.position) !== "nudge") return undefined;
	const {x, y} = positionArgs(series.position);
	return {...(x == null ? {} : {x}), ...(y == null ? {} : {y})};
};

/** Rows a stride passed over. The reader is owed this where lines were sampled. */
const skipped = (rowCount: number, step: number) => rowCount - Math.ceil(rowCount / step);

interface Context {
	data: PlotData;
	fieldAt: Map<string, PlotField>;
	xId: string;
	xField: PlotField;
	axisKind: AxisKind;
	/** The horizontal axis's transform, as the frame resolves it. A bin cuts in its space. */
	xTransform: AxisTransform;
	color: string;
	palettes: Palettes;
	/** Category codes over the whole table. A value's color holds across traces and panels. */
	codesFor: (fieldId: string) => Map<string, number>;
	/** Numeric range over the whole table, for the same reason. */
	rangeFor: (fieldId: string) => [number, number] | null;
	/** The panel's own sizing, which the size channel's radii derive from. */
	metrics: Metrics;
	/** What the author set on the color scale. Read ahead of what the data says. */
	colorOptions?: ColorScale;
	/** The build's ledger. A cap applied inside a geom records itself here. */
	omitted: Omission[];
}

/**
 * A reduction over two categories at once.
 *
 * The bar path groups by one field. A heatmap groups by a pair and `groupRows` has one key.
 */
function cellsOf(data: PlotData, xId: string, yId: string, measure: string | null, aggregate: Aggregate): HeatCell[] {
	const running = new Map<string, {x: string; y: string; bucket: Bucket; values: number[] | null}>();
	const collect = NEEDS_VALUES.includes(aggregate);

	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.text(row, xId);
		const y = data.text(row, yId);
		if (x == null || y == null) continue;
		const value = measure ? data.number(row, measure) : 1;
		if (value == null) continue;

		const key = `${x}\u0000${y}`;
		let cell = running.get(key);
		if (!cell) {
			cell = {
				x,
				y,
				bucket: {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity},
				values: collect ? [] : null,
			};
			running.set(key, cell);
		}
		cell.bucket.n += 1;
		cell.bucket.sum += value;
		cell.bucket.sumSq += value * value;
		cell.bucket.min = Math.min(cell.bucket.min, value);
		cell.bucket.max = Math.max(cell.bucket.max, value);
		cell.values?.push(value);
	}

	return [...running.values()].map((cell) => ({
		x: cell.x,
		y: cell.y,
		value: reduceBucket(cell.bucket, aggregate, cell.values ?? undefined),
		n: cell.bucket.n,
	}));
}

/** Links a flow draws before the ribbons stop being separable. */
export const LINK_CAP = 80;

/**
 * Nodes a flow draws in one column.
 *
 * Sixty links out of two thousand plates draw a comb of hairlines. Bounding the nodes keeps the
 * survivors readable.
 */
export const NODE_CAP = 20;

/**
 * Lines a parallel plot draws.
 *
 * A line crossing four axes covers far more panel than a dot. The footer says how many rows the
 * sample passed over.
 */
export const LINE_CAP = 2_000;

/**
 * Readings a group can show behind its geom.
 *
 * The dots spread across the bar's own width. Past the cap a group shows none and the footer
 * counts them.
 */
export const REPLICATE_CAP = 40;

/**
 * Measures a parallel plot spans.
 *
 * Each axis takes a column of the panel. Past the cap the measures are dropped and the footer
 * states it.
 */
export const AXIS_CAP = 8;

/**
 * A flow that runs between two named fields, holding one row per link.
 *
 * Columns come from the graph. A node draws one column right of the furthest node reaching it.
 */
function flowOf(
	data: PlotData,
	sourceId: string,
	targetId: string,
	valueId: string | undefined,
	align: "left" | "justify" = "left",
): {nodes: SankeyNodeInput[]; links: SankeyLinkInput[]; dropped: number} | null {
	/* Held per pair. A stage name may hold any separator. */
	const totals = new Map<string, Map<string, number>>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const from = data.text(row, sourceId);
		const to = data.text(row, targetId);
		// A row pointing at itself is a stage that did not move, and it draws as nothing.
		if (from == null || to == null || from === to) continue;
		const value = valueId ? data.number(row, valueId) : 1;
		if (value == null || !(value > 0)) continue;

		const outgoing = totals.get(from) ?? new Map<string, number>();
		outgoing.set(to, (outgoing.get(to) ?? 0) + value);
		totals.set(from, outgoing);
	}

	const ranked: SankeyLinkInput[] = [];
	for (const [source, outgoing] of totals) {
		for (const [target, value] of outgoing) ranked.push({source, target, value});
	}
	if (ranked.length === 0) return null;
	ranked.sort((a, b) => b.value - a.value);

	/*
    The biggest nodes of each column are kept and the links between them follow.

    Ranking nodes by what passes through them keeps the flow the population takes.
  */
	const through = new Map<string, number>();
	const carry = (name: string, value: number) => through.set(name, (through.get(name) ?? 0) + value);
	for (const link of ranked) {
		carry(link.source, link.value);
		carry(link.target, link.value);
	}
	const placed = align === "justify" ? justifiedColumns(columnsOf(ranked), ranked) : columnsOf(ranked);
	const kept = new Set<string>();
	for (const at of new Set(placed.values())) {
		const members = [...through].filter(([name]) => placed.get(name) === at).sort((a, b) => b[1] - a[1]);
		for (const [name] of members.slice(0, NODE_CAP)) kept.add(name);
	}

	const between = ranked.filter((link) => kept.has(link.source) && kept.has(link.target));
	const links = between.slice(0, LINK_CAP);

	const names = new Set<string>();
	for (const link of links) {
		names.add(link.source);
		names.add(link.target);
	}

	const column = columnsOf(links);
	/* The exits read the columns the flow reached, before a justify moves its end nodes. */
	const exits = exitsOf(links, column);
	if (align === "justify") justifiedColumns(column, links);
	const nodes: SankeyNodeInput[] = [...names].map((name) => ({
		id: name,
		label: name,
		column: column.get(name) ?? 0,
		kind: exits.has(name) ? "exit" : "survivor",
	}));
	const kinded = links.map((link) => ({
		...link,
		kind: exits.has(link.target) ? ("exit" as const) : ("survivor" as const),
	}));

	return {nodes, links: kinded, dropped: ranked.length - links.length};
}

/** Moves each node no link leaves into the last column. The cap reads the columns this returns. */
function justifiedColumns(column: Map<string, number>, links: readonly SankeyLinkInput[]): Map<string, number> {
	const last = Math.max(0, boundsOf([...column.values()])[1]);
	const onward = new Set(links.map((link) => link.source));
	for (const name of column.keys()) if (!onward.has(name)) column.set(name, last);
	return column;
}

/** Places each node one column right of the furthest node reaching it. */
function columnsOf(links: readonly SankeyLinkInput[]): Map<string, number> {
	const column = new Map<string, number>();
	for (const link of links) {
		column.set(link.source, 0);
		column.set(link.target, 0);
	}
	for (let pass = 0; pass < column.size; pass += 1) {
		let moved = false;
		for (const link of links) {
			const reach = (column.get(link.source) ?? 0) + 1;
			if (reach > (column.get(link.target) ?? 0)) {
				column.set(link.target, reach);
				moved = true;
			}
		}
		if (!moved) break;
	}
	return column;
}

/**
 * The nodes a flow exits at.
 *
 * A terminal node before the last stage exits. A last-stage gate keeps its smallest outcome and exits
 * the rest.
 */
function exitsOf(links: readonly SankeyLinkInput[], column: ReadonlyMap<string, number>): Set<string> {
	const onward = new Set(links.map((link) => link.source));
	const last = Math.max(0, boundsOf([...column.values()])[1]);
	const exits = new Set<string>();
	const sourcesOf = new Map<string, Set<string>>();
	for (const link of links) {
		if (onward.has(link.target)) continue;
		if ((column.get(link.target) ?? 0) < last) exits.add(link.target);
		sourcesOf.set(link.target, (sourcesOf.get(link.target) ?? new Set()).add(link.source));
	}

	// ponytail: a gate is one source over two or more last-stage nodes, and its smallest outcome reads as the pass.
	const gates = new Map<string, SankeyLinkInput[]>();
	for (const link of links) {
		if (onward.has(link.target) || (column.get(link.target) ?? 0) < last || sourcesOf.get(link.target)?.size !== 1)
			continue;
		gates.set(link.source, [...(gates.get(link.source) ?? []), link]);
	}
	for (const outcomes of gates.values()) {
		if (outcomes.length < 2) continue;
		const pass = outcomes.reduce((least, link) => (link.value < least.value ? link : least));
		for (const link of outcomes) if (link !== pass) exits.add(link.target);
	}
	return exits;
}

/**
 * A flow, built outside the shared-X contract the other geoms share.
 *
 * Every other geom reads the plot's one horizontal binding. A sankey binds both its ends.
 */
function flowTrace(
	series: LayerSpec,
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
): {trace: Trace; dropped: number} | null {
	const sourceId = typeof series.aes.source === "string" ? series.aes.source : undefined;
	const targetId = typeof series.aes.target === "string" ? series.aes.target : undefined;
	if (!sourceId || !targetId) return null;
	const valueId = typeof series.aes.value === "string" ? series.aes.value : undefined;

	const flow = flowOf(data, sourceId, targetId, valueId, series.statParams?.align);
	if (!flow) return null;

	const from = fieldAt.get(sourceId)?.label ?? sourceId;
	const to = fieldAt.get(targetId)?.label ?? targetId;

	return {
		trace: {
			id: series.id,
			layerId: series.id,
			name: series.name ?? `${from} to ${to}`,
			color,
			axis: series.axis ?? "y",
			ramp: () => color,
			data: {
				at: "groups",
				geom: "sankey",
				...flow,
				...(series.statParams?.normalize ? {normalize: series.statParams.normalize} : {}),
			},
		},
		dropped: flow.dropped,
	};
}

/** Sectors an ideogram draws. Past this the arcs are slivers and the names collide. */
export const SECTOR_CAP = 64;

/**
 * A genome read round a circle.
 *
 * A sector covers what its rows cover. The tiles keep their own spans inside it.
 */
function ideogramTrace(
	series: LayerSpec,
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
): {trace: Trace; dropped: number; offSector: number; hued: number} | null {
	const sectorId = typeof series.aes.sector === "string" ? series.aes.sector : undefined;
	const startId = typeof series.aes.start === "string" ? series.aes.start : undefined;
	const endId = typeof series.aes.end === "string" ? series.aes.end : undefined;
	if (!sectorId || !startId || !endId) return null;
	const colorId = paintColumn(series);
	const far = series.links;

	const spans = new Map<string, {lo: number; hi: number}>();
	const tiles: {sector: string; start: number; end: number; level?: string}[] = [];
	const levels: string[] = [];
	const links: PositionLink[] = [];

	/* A sector covers every position either end of a row put inside it. */
	const cover = (name: string, lo: number, hi: number) => {
		const held = spans.get(name) ?? {lo, hi};
		spans.set(name, {lo: Math.min(held.lo, lo), hi: Math.max(held.hi, hi)});
	};

	for (let row = 0; row < data.rowCount; row += 1) {
		const name = data.text(row, sectorId);
		const start = data.number(row, startId);
		const end = data.number(row, endId);
		if (name == null || start == null || end == null) continue;
		cover(name, start, end);

		/* A row naming a far end is a link. It draws no tile and takes no stain. */
		const other = far ? data.text(row, far.sector) : null;
		const otherStart = far ? data.number(row, far.start) : null;
		if (far && other != null && otherStart != null) {
			const otherEnd = far.end == null ? otherStart : (data.number(row, far.end) ?? otherStart);
			cover(other, otherStart, otherEnd);
			const measure = far.value == null ? null : data.number(row, far.value);
			links.push({sector: name, start, end, other, otherStart, otherEnd, ...(measure == null ? {} : {value: measure})});
			continue;
		}

		const level = colorId ? (data.text(row, colorId) ?? undefined) : undefined;
		if (level != null && !levels.includes(level)) levels.push(level);
		tiles.push({sector: name, start, end, ...(level == null ? {} : {level})});
	}
	if (spans.size === 0) return null;

	/* The order the rows arrive in, which is the order a genome file already holds. */
	const order = [...spans.keys()];
	/* A sector with a tile of its own takes a place under the cap ahead of a name only a link reaches. */
	const tiled = new Set(tiles.map((tile) => tile.sector));
	const capped = new Set(
		[...order.filter((id) => tiled.has(id)), ...order.filter((id) => !tiled.has(id))].slice(0, SECTOR_CAP),
	);
	const kept = order.filter((id) => capped.has(id));
	const within = new Set(kept);
	const sectors: SectorSpec[] = kept.map((id) => {
		const span = spans.get(id)!;
		return {id, xlim: [span.lo, span.hi]};
	});

	/* A link reaching a sector the cap turned down has nowhere to land, and the footer counts it. */
	const seated = links.filter((link) => within.has(link.sector) && within.has(link.other));

	/* The measure the drawn links cover. A ramp over anything wider would waste its range. */
	const measures = seated.map((link) => link.value).filter((one): one is number => one != null);
	const linkDomain: [number, number] | null = measures.length > 0 ? boundsOf(measures) : null;

	const rings = (series.rings ?? []).map((ring) =>
		ringReading(ring.content, kept, [sectorId], data, fieldAt, {sector: sectorId, start: startId, end: endId}),
	);

	return {
		trace: {
			id: series.id,
			layerId: series.id,
			name: series.name ?? fieldAt.get(sectorId)?.label ?? sectorId,
			color,
			axis: series.axis ?? "y",
			ramp: () => color,
			data: {
				at: "groups",
				geom: "ideogram",
				sectors,
				tiles: tiles.filter((tile) => within.has(tile.sector)),
				levels,
				links: seated,
				...(linkDomain == null ? {} : {linkDomain}),
				rings,
			},
		},
		dropped: spans.size - kept.length,
		offSector: links.length - seated.length,
		/* Rings, links and unstained tiles read the sector's own hue. A stain paints its own tile. */
		hued: seated.length > 0 || rings.length > 0 || tiles.some((tile) => tile.level == null) ? kept.length : 0,
	};
}

/**
 * Sectors a figure drew in one ink, once the map has run out.
 *
 * Zero where the colors still tell the sectors apart. An author's own fill answers zero.
 */
const flattened = (count: number, size: number | undefined, fill: string | undefined): number =>
	size != null && fill == null && count > size ? count : 0;

/**
 * A flow read round a center.
 *
 * The pairs come off the same builder the sankey reads. A chord holds no columns.
 */
function chordTrace(
	series: LayerSpec,
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
): {trace: Trace; dropped: number; hued: number} | null {
	const sourceId = typeof series.aes.source === "string" ? series.aes.source : undefined;
	const targetId = typeof series.aes.target === "string" ? series.aes.target : undefined;
	if (!sourceId || !targetId) return null;
	const valueId = typeof series.aes.value === "string" ? series.aes.value : undefined;

	const flow = flowOf(data, sourceId, targetId, valueId);
	if (!flow) return null;

	const from = fieldAt.get(sourceId)?.label ?? sourceId;
	const to = fieldAt.get(targetId)?.label ?? targetId;
	const links: ChordLink[] = flow.links.map((link) => ({source: link.source, target: link.target, value: link.value}));

	/* The sectors a ring reads against, settled by the same layout the geom draws. */
	const sectors = chordLayout(links).sectors.map((sector) => sector.id);
	const rings = (series.rings ?? []).map((ring) =>
		ringReading(ring.content, sectors, [sourceId, targetId], data, fieldAt),
	);

	return {
		trace: {
			id: series.id,
			layerId: series.id,
			name: series.name ?? `${from} and ${to}`,
			color,
			axis: series.axis ?? "y",
			ramp: () => color,
			data: {at: "groups", geom: "chord", links, rings},
		},
		dropped: flow.dropped,
		hued: sectors.length,
	};
}

/**
 * Lays out a hierarchy.
 *
 * A label, a value and a parent bind. `sum` is the default aggregate. The parent comes off the
 * first row naming one.
 */
function hierarchyTrace(
	series: LayerSpec,
	geom: "treemap" | "icicle" | "sunburst",
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
	identity: (index: number) => string,
): {trace: Trace; dropped: number; hued: number} | null {
	const labelId = typeof series.aes.label === "string" ? series.aes.label : undefined;
	if (!labelId) return null;
	const valueId = typeof series.aes.value === "string" ? series.aes.value : undefined;
	const parentId = typeof series.aes.parent === "string" ? series.aes.parent : undefined;

	const valueField = valueId ? fieldAt.get(valueId) : undefined;
	const aggregate = (series.aggregate ?? (valueField?.numeric ? "sum" : "count")) as Aggregate;

	const parents = new Map<string, string>();
	if (parentId) {
		for (let row = 0; row < data.rowCount; row += 1) {
			const label = data.text(row, labelId);
			const parent = data.text(row, parentId);
			if (label == null || parent == null || parent === "" || parents.has(label)) continue;
			parents.set(label, parent);
		}
	}

	const measure = aggregate === "count" ? null : (valueField?.id ?? null);
	if (!measure && aggregate !== "count") return null;

	const rows: HierarchyRow[] = groupRows(data, labelId, measure, aggregate).map((group) => {
		const parent = parents.get(group.key);
		return {label: group.key, value: group.value, ...(parent == null ? {} : {parent})};
	});

	/* A sunburst reads the icicle's layout, differing in where a cell lands and not in the tiling. */
	const layout = geom === "treemap" ? treemapLayout(rows) : icicleLayout(rows);
	if (layout.cells.length === 0) return null;

	/* Groups in row order. All three arrangements paint one group one hue. A stated fill paints one. */
	const groups = groupsOf(layout.cells);
	const levels = series.style?.fill
		? []
		: [...new Set(rows.map((row) => groups.get(row.label)).filter((group) => group != null))];
	const groupField = (parentId ? fieldAt.get(parentId) : undefined) ?? fieldAt.get(labelId);

	return {
		trace: {
			id: series.id,
			layerId: series.id,
			name: series.name ?? (valueField ? `${aggregate} of ${valueField.label}` : "Count"),
			color,
			axis: series.axis ?? "y",
			ramp: (code) => identity(Math.round(code)),
			...(valueField ? {field: valueField} : {}),
			...(levels.length > 0 && groupField
				? {colorField: groupField, colorLevels: levels.map((value, code) => ({value, code}))}
				: {}),
			data: {at: "groups", geom, cells: layout.cells, aggregate, dropped: layout.dropped},
		},
		dropped: layout.dropped,
		hued: levels.length,
	};
}

/** A color category's ramp. A layer naming a magnitude map steps along it in code order, as its split paths do. */
function codeRamp(series: LayerSpec, codes: Map<string, number>, palettes: Palettes): Trace["ramp"] {
	if (series.palette && palettes.sequentialFor && !palettes.categoricalFor?.(series.palette)) {
		const steps = Math.max(1, codes.size - 1);
		return (code) => palettes.sequential(Math.round(code) / steps);
	}
	return (code) => palettes.categorical(Math.round(code));
}

/** What a parallel trace cost to build. The reader is owed each count. */
interface ParallelBuild {
	trace: Trace;
	skipped: number;
	incomplete: number;
	axesDropped: number;
}

/**
 * A line per record across several measures, built outside the shared-X contract.
 *
 * The measures come from one channel. A row missing any one of them is dropped.
 */
function parallelTrace(
	series: LayerSpec,
	geom: "parcoords" | "radar",
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
	palettes: Palettes,
	codesFor: (fieldId: string) => Map<string, number>,
	rangeFor: (fieldId: string) => [number, number] | null,
	colorOptions: ColorScale | undefined,
): ParallelBuild | null {
	const bound = series.aes.dimensions;
	const ids = (Array.isArray(bound) ? bound : bound ? [bound] : []).filter((id) => fieldAt.has(id));
	/* Two rules and a closing edge draw a sliver. A radar wants a third. */
	if (ids.length < (geom === "radar" ? 3 : 2)) return null;

	const kept = ids.slice(0, AXIS_CAP);
	const axes: ParallelAxis[] = [];
	for (const id of kept) {
		const field = fieldAt.get(id)!;
		const range = rangeFor(id);
		if (!range) return null;
		// Each axis has its own units and the title states them. The end numbers are bare.
		axes.push({
			id,
			label: field.unit ? `${field.label} (${field.unit})` : field.label,
			lo: range[0],
			hi: range[1],
		});
	}

	const colorId = paintColumn(series);
	const colorField = colorId ? fieldAt.get(colorId) : undefined;
	const codes = colorField && !colorField.numeric ? codesFor(colorField.id) : null;

	/* Complete rows are collected before the stride runs. The sample is of what draws. */
	const whole: number[] = [];
	let incomplete = 0;
	for (let row = 0; row < data.rowCount; row += 1) {
		if (kept.every((id) => data.number(row, id) != null)) whole.push(row);
		else incomplete += 1;
	}
	if (whole.length === 0) return null;

	const step = Math.max(1, Math.ceil(whole.length / LINE_CAP));
	const lines: ParallelLine[] = [];
	const outer = viewRows.get(data);
	for (let at = 0; at < whole.length; at += step) {
		const row = whole[at]!;

		let weight: number | undefined;
		if (colorField?.numeric) {
			const value = data.number(row, colorField.id);
			if (value != null) weight = value;
		} else if (colorField && codes) {
			const value = data.text(row, colorField.id);
			if (value != null) weight = codes.get(value);
		}

		lines.push({
			values: kept.map((id) => data.number(row, id)!),
			weight,
			key: data.keyField ? (data.text(row, data.keyField) ?? undefined) : undefined,
			row: data.rowIndex(row),
			plotRow: outer ? outer[row]! : row,
		});
	}

	let ramp: Trace["ramp"] = () => color;
	const range = colorField?.numeric ? rangeFor(colorField.id) : null;
	if (range) {
		ramp = valueRamp(range, palettes, colorOptions);
	} else if (codes) {
		ramp = codeRamp(series, codes, palettes);
	}

	return {
		trace: {
			id: series.id,
			layerId: series.id,
			name: series.name ?? `${axes.length} measures`,
			color,
			axis: series.axis ?? "y",
			ramp,
			colorField,
			...(range ? colorScaleOf(range, colorOptions) : {}),
			data: {at: "records", geom, axes, lines},
		},
		skipped: skipped(whole.length, step),
		incomplete,
		axesDropped: ids.length - kept.length,
	};
}

/**
 * One reduction over the table, drawn as an arc.
 *
 * A gauge reduces `value` to one number. The range comes from `scales.y.limits`, or the measure's
 * extent stands in.
 */
function gaugeTrace(
	series: LayerSpec,
	data: PlotData,
	fieldAt: Map<string, PlotField>,
	color: string,
	rangeFor: (fieldId: string) => [number, number] | null,
	stated?: readonly [number, number],
): Trace | null {
	const bound = series.aes.value;
	const id = typeof bound === "string" ? bound : undefined;
	const field = id ? fieldAt.get(id) : undefined;
	if (!field?.numeric) return null;

	const aggregate = (series.aggregate ?? "mean") as Aggregate;
	const collect = NEEDS_VALUES.includes(aggregate);
	const bucket: Bucket = {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity};
	const values: number[] = [];
	for (let row = 0; row < data.rowCount; row += 1) {
		const reading = data.number(row, field.id);
		if (reading == null) continue;
		bucket.n += 1;
		bucket.sum += reading;
		bucket.sumSq += reading * reading;
		bucket.min = Math.min(bucket.min, reading);
		bucket.max = Math.max(bucket.max, reading);
		if (collect) values.push(reading);
	}
	if (bucket.n === 0) return null;

	const range: [number, number] | null = stated ? [stated[0], stated[1]] : rangeFor(field.id);
	if (!range) return null;

	return {
		id: series.id,
		layerId: series.id,
		name: series.name ?? `${aggregate} of ${field.label}`,
		color,
		axis: series.axis ?? "y",
		field,
		ramp: () => color,
		data: {at: "groups", geom: "gauge", value: reduceBucket(bucket, aggregate, values), range, aggregate},
	};
}

/**
 * The ends a summary's color runs between, over the medians it drew.
 *
 * An extent taken inside the geom puts each panel on its own scale.
 */
const medianSpread = (medians: number[]): [number, number] => {
	/* A counting pass. A spread argument list caps the categories a summary can hold. */
	let lo = Infinity;
	let hi = -Infinity;
	for (const median of medians) {
		if (median < lo) lo = median;
		if (median > hi) hi = median;
	}
	return [lo, hi];
};

/** ggplot's `geom_text` and `geom_label`: one label per row, painted by the color channel. */
function textTrace(series: LayerSpec, ctx: Context): Trace | null {
	const yId = typeof series.aes.y === "string" ? series.aes.y : undefined;
	const yField = yId ? ctx.fieldAt.get(yId) : undefined;
	const labelId = typeof series.aes.label === "string" ? series.aes.label : undefined;
	const labelField = labelId ? ctx.fieldAt.get(labelId) : undefined;
	if (!yId || !yField?.numeric || !labelField) return null;

	const colorId = paintColumn(series);
	const colorField = colorId ? ctx.fieldAt.get(colorId) : undefined;
	const codes = colorField && !colorField.numeric ? ctx.codesFor(colorField.id) : null;
	const bands = ctx.axisKind === "band" && !ctx.xField.numeric ? ctx.codesFor(ctx.xId) : null;
	const points = pointsOf(
		ctx.data,
		ctx.xId,
		yId,
		labelField,
		colorField,
		codes,
		null,
		null,
		bands,
		undefined,
		shoveOf(series),
	).filter((point) => point.text != null);
	if (points.length === 0) return null;

	const range = colorField?.numeric ? ctx.rangeFor(colorField.id) : null;
	const ramp: Trace["ramp"] = range
		? valueRamp(range, ctx.palettes, ctx.colorOptions)
		: codes
			? codeRamp(series, codes, ctx.palettes)
			: ((() => ctx.color) as Trace["ramp"]);

	return {
		id: series.id,
		layerId: series.id,
		name: series.name ?? labelField.label,
		color: ctx.color,
		axis: series.axis ?? "y",
		field: yField,
		ramp,
		...(colorField ? {colorField} : {}),
		data: {at: "records", geom: "text", points, ...(series.kind === "label" ? {boxed: true} : {})},
	};
}

/** Reference lines one layer draws. The footer counts the rest. */
export const RULE_CAP = 24;

/**
 * One reference line per row, off the layer's own position channels.
 *
 * An `abline` with neither channel bound is the identity line, ggplot's slope one and intercept zero.
 */
function ruleTrace(series: LayerSpec, geom: "hline" | "vline" | "abline", ctx: Context): Trace | null {
	const idOf = (channel: Aesthetic) => {
		const id = series.aes[channel];
		return typeof id === "string" && ctx.fieldAt.get(id)?.numeric ? id : undefined;
	};
	const read = (id: string | undefined, row: number, fallback: number | null) =>
		id ? ctx.data.number(row, id) : fallback;
	const labelId = typeof series.aes.label === "string" ? series.aes.label : undefined;
	const yi = idOf("yintercept");
	const xi = idOf("xintercept");
	const slopeId = idOf("slope");
	const interceptId = idOf("intercept");

	const rules: RuleLine[] = [];
	for (let row = 0; row < ctx.data.rowCount; row += 1) {
		const label = labelId ? (ctx.data.text(row, labelId) ?? undefined) : undefined;
		const named = label == null ? {} : {label};
		if (geom === "hline") {
			const y = read(yi, row, null);
			if (y != null) rules.push({kind: "h", y, ...named});
		} else if (geom === "vline") {
			const x = read(xi, row, null);
			if (x != null) rules.push({kind: "v", x, ...named});
		} else {
			const slope = read(slopeId, row, 1);
			const intercept = read(interceptId, row, 0);
			if (slope != null && intercept != null) rules.push({kind: "ab", slope, intercept, ...named});
		}
	}
	if (rules.length === 0) return null;
	/* Rows naming the same line draw it once. */
	const distinct = [...new Map(rules.map((rule) => [JSON.stringify(rule), rule])).values()];
	omit(ctx.omitted, "rules", distinct.length - RULE_CAP);

	return {
		id: series.id,
		layerId: series.id,
		name: series.name ?? geom,
		color: ctx.color,
		axis: series.axis ?? "y",
		ramp: (() => ctx.color) as Trace["ramp"],
		data: {at: "records", geom, rules: distinct.slice(0, RULE_CAP)},
	};
}

/** Positions along X where a row names a place and holds no reading. A line breaks there. */
function missingAlong(data: PlotData, xId: string, yId: string): number[] {
	const out: number[] = [];
	for (let row = 0; row < data.rowCount; row += 1) {
		const x = data.number(row, xId);
		if (x != null && data.number(row, yId) == null) out.push(x);
	}
	return out.sort((a, b) => a - b);
}

/**
 * Marks the first reading past each gap, on readings sorted along X.
 *
 * A gap before the first reading or after the last breaks nothing.
 */
function breakAtGaps(points: LayerPoint[], gaps: number[]): void {
	let at = 0;
	for (let index = 1; index < points.length && at < gaps.length; index += 1) {
		while (at < gaps.length && gaps[at]! <= points[index - 1]!.x) at += 1;
		if (at < gaps.length && gaps[at]! < points[index]!.x) {
			points[index]!.gap = true;
			while (at < gaps.length && gaps[at]! < points[index]!.x) at += 1;
		}
	}
}

function traceOf(series: LayerSpec, geom: Geom, ctx: Context): Trace | null {
	// These bind their own channels and wait for no shared X. Each is built above this.
	if (geom === "sankey" || geom === "parcoords" || geom === "radar") return null;
	if (geom === "hline" || geom === "vline" || geom === "abline") return ruleTrace(series, geom, ctx);

	const yId = typeof series.aes.y === "string" ? series.aes.y : undefined;
	const yField = yId ? ctx.fieldAt.get(yId) : undefined;

	const base = {
		id: series.id,
		layerId: series.id,
		color: ctx.color,
		axis: series.axis ?? ("y" as const),
		field: yField,
		// A reduction has no per-geom weight. The whole trace takes the series color.
		ramp: (() => ctx.color) as Trace["ramp"],
	};

	/*
    The cube. Three measures, three scales, and a payload the camera positions. The color and
    size channels resolve the way they do on a flat scatter.
  */
	if (geom === "point3d") {
		const zId = typeof series.aes.z === "string" ? series.aes.z : undefined;
		const zField = zId ? ctx.fieldAt.get(zId) : undefined;
		if (!yId || !yField?.numeric || !zField?.numeric || !ctx.xField.numeric) return null;

		const colorId = paintColumn(series);
		const colorField = colorId ? ctx.fieldAt.get(colorId) : undefined;
		const codes = colorField && !colorField.numeric ? ctx.codesFor(colorField.id) : null;
		const labelField = series.directLabels ? ctx.fieldAt.get(series.directLabels.field) : undefined;

		const sizeId = typeof series.aes.size === "string" ? series.aes.size : undefined;
		const sizeField = sizeId ? ctx.fieldAt.get(sizeId) : undefined;
		const sizeDomain = sizeField?.numeric ? ctx.rangeFor(sizeField.id) : null;
		const sizeRadii = series.style?.sizeRange ?? sizeRadiiFor(ctx.metrics);
		const size = sizeField && sizeDomain ? {field: sizeField, domain: sizeDomain, radii: sizeRadii} : null;

		/* The cube reads each field's own log flag. It draws no frame axis for an author to set. */
		const points = pointsOf(ctx.data, ctx.xId, yId, labelField, colorField, codes, size, zField).filter(
			(point) => !(ctx.xField.logScale && point.x <= 0) && !(yField.logScale && point.y <= 0),
		);
		if (points.length === 0) return null;

		const zDomain = ctx.rangeFor(zField.id);
		const xDomain = ctx.rangeFor(ctx.xId);
		const yDomain = ctx.rangeFor(yId);
		if (!zDomain || !xDomain || !yDomain) return null;

		let ramp = base.ramp;
		const range = colorField?.numeric ? ctx.rangeFor(colorField.id) : null;
		if (range) {
			ramp = valueRamp(range, ctx.palettes, ctx.colorOptions);
		} else if (codes) {
			ramp = codeRamp(series, codes, ctx.palettes);
		}

		return {
			...base,
			name: series.name ?? zField.label,
			ramp,
			colorField,
			...(range ? colorScaleOf(range, ctx.colorOptions) : {}),
			zField,
			...(size ? {sizeField: size.field, sizeDomain: size.domain, sizeRadii: size.radii} : {}),
			data: {at: "records", geom, points, zField, xDomain, yDomain, zDomain},
		};
	}

	/*
    The two cube kinds that read a field through its depth. Three position channels place the
    grid and a fourth says what the cells measure. Unbound, they count rows.
  */
	if (geom === "isosurface" || geom === "volume") {
		const zId = typeof series.aes.z === "string" ? series.aes.z : undefined;
		const zField = zId ? ctx.fieldAt.get(zId) : undefined;
		if (!yId || !yField?.numeric || !zField?.numeric || !ctx.xField.numeric) return null;

		const valueId = typeof series.aes.value === "string" ? series.aes.value : undefined;
		const valueField = valueId ? ctx.fieldAt.get(valueId) : undefined;
		if (valueId && !valueField?.numeric) return null;

		const aggregate = (series.aggregate ?? "mean") as Aggregate;
		const field = field3d(ctx.data, ctx.xId, yId, zField.id, valueField?.id ?? null, aggregate);
		if (!field) return null;

		return {
			...base,
			name: series.name ?? (valueField ? `${aggregate} of ${valueField.label}` : "Count"),
			zField,
			data: {
				at: "groups",
				geom,
				field,
				...(valueField ? {valueField} : {}),
				xDomain: field.xDomain,
				yDomain: field.yDomain,
				zDomain: field.zDomain,
			},
		};
	}

	/*
    The two cube kinds that draw a surface. A relief reduces a measure over a grid of two others
    and triangulates it. A structure arrives as vertices and faces.
  */
	if (geom === "surface" || geom === "mesh3d") {
		const zId = typeof series.aes.z === "string" ? series.aes.z : undefined;
		const zField = zId ? ctx.fieldAt.get(zId) : undefined;
		if (!yId || !yField?.numeric || !zField?.numeric || !ctx.xField.numeric) return null;

		if (geom === "surface") {
			const aggregate = (series.aggregate ?? "mean") as Aggregate;
			const grid = relief(ctx.data, ctx.xId, yId, zField.id, aggregate);
			const mesh = grid ? meshOfRelief(grid) : null;
			if (!grid || !mesh) return null;
			return {
				...base,
				name: series.name ?? `${aggregate} of ${zField.label}`,
				zField,
				data: {at: "groups", geom, mesh, zField, xDomain: grid.xDomain, yDomain: grid.yDomain, aggregate},
			};
		}

		/* Three columns of row numbers, one triangle a row, which is how a structure states its faces. */
		const bound = series.aes.faces;
		const faceIds = (Array.isArray(bound) ? bound : bound ? [bound] : []).filter((id) => ctx.fieldAt.has(id));
		if (faceIds.length !== 3) return null;

		const faces: [number, number, number][] = [];
		for (let row = 0; row < ctx.data.rowCount; row += 1) {
			const corners = faceIds.map((id) => ctx.data.number(row, id));
			if (corners.some((corner) => corner == null)) continue;
			faces.push(corners.map((corner) => Math.round(corner!)) as [number, number, number]);
		}

		const mesh = meshOfRows(ctx.data, ctx.xId, yId, zField.id, faces);
		const xSpan = ctx.rangeFor(ctx.xId);
		const ySpan = ctx.rangeFor(yId);
		if (!mesh || !xSpan || !ySpan) return null;
		return {
			...base,
			name: series.name ?? zField.label,
			zField,
			data: {at: "groups", geom, mesh, zField, xDomain: xSpan, yDomain: ySpan},
		};
	}

	if (geom === "heatmap") {
		if (ctx.axisKind !== "band") return null;

		/**
		 * The ends a ramp runs between.
		 *
		 * A fraction pins to zero and one, and a count to zero. Otherwise the extent of the cells
		 * stands.
		 */
		/*
      A z-scored grid is a measure whatever it reduced. Its neutral is zero. Centered and divided
      by its own spread, a fraction becomes an extent like any other measure.
    */
		const scale = ctx.colorOptions?.standardize ?? "none";
		const scaled = (cells: HeatCell[]) => scaledCells(cells, scale);
		const colorOptions = rampOptionsFor("heatmap", ctx.colorOptions);

		const heatExtent = (cells: HeatCell[], kind: "fraction" | "count" | "measure"): [number, number] => {
			if (kind === "fraction" && scale === "none") return [0, 1];
			/* A grid is the cross-product of its two bands and reaches the count `boundsOf` exists for. */
			const [lo, hi] = boundsOf(cells.map((cell) => cell.value));
			return kind === "count" && scale === "none" ? [0, hi] : [lo, hi];
		};

		/* The author's setting is the more specific instruction, and the ramp reads the same answer. */
		const heatDomain = (cells: HeatCell[], kind: "fraction" | "count" | "measure") =>
			colorScaleOf(heatExtent(cells, kind), colorOptions);

		/* The domain reaches the ramp here. The geom draws a value and runs no scale of its own. */
		const heatRamp = (domain: [number, number]) => valueRamp(domain, ctx.palettes, colorOptions);

		/*
      Three grids on one geom, told apart by the binding. A list of measures binds columns that
      are not a column, and a sequence binds positions inside a string.
    */
		const bound = series.aes.dimensions;
		const measureIds = (Array.isArray(bound) ? bound : bound ? [bound] : []).filter((id) => ctx.fieldAt.has(id));
		if (measureIds.length > 0) {
			const measures = measureIds.map((id) => ctx.fieldAt.get(id)!);
			const cells = scaled(gateCells(ctx.data, ctx.xId, measures));
			if (cells.length === 0) return null;
			const domain = heatDomain(cells, "fraction");
			return {
				...base,
				name: series.name ?? "fraction clearing the cut",
				...domain,
				ramp: heatRamp(domain.colorExtent),
				data: {at: "groups", geom, cells, aggregate: "mean"},
			};
		}

		if (!yId) {
			const xField = ctx.fieldAt.get(ctx.xId);
			if (xField?.role !== "sequence") return null;
			const cells = scaled(occupancyCells(ctx.data, ctx.xId));
			if (cells.length === 0) return null;
			const domain = heatDomain(cells, "fraction");
			return {
				...base,
				name: series.name ?? `${xField.label} occupancy`,
				...domain,
				ramp: heatRamp(domain.colorExtent),
				data: {at: "groups", geom, cells, aggregate: "mean"},
			};
		}

		// Both axes name categories, and the color channel carries the measure the cells reduce.
		const zId = typeof series.aes.z === "string" ? series.aes.z : undefined;
		const zField = zId ? ctx.fieldAt.get(zId) : undefined;

		const aggregate = (series.aggregate ?? (zField ? "mean" : "count")) as Aggregate;
		const measure = aggregate === "count" ? null : (zField?.id ?? null);
		if (!measure && aggregate !== "count") return null;

		const reduced = cellsOf(ctx.data, ctx.xId, yId, measure, aggregate);
		if (reduced.length === 0) return null;
		/*
      A pair with no rows, filled at nought where the style asks for it.

      Here and not in the geom, so the color domain covers the nought. Filled at draw time it sat
      below the domain the real cells set and clamped to a shade the ramp never shows.
    */
		const cells = scaled(series.style?.emptyAsZero ? withZeros(reduced) : reduced);
		const gridDomain = heatDomain(cells, aggregate === "count" ? "count" : "measure");

		return {
			...base,
			field: zField,
			name: series.name ?? (zField ? `${aggregate} of ${zField.label}` : "Count"),
			...gridDomain,
			ramp: heatRamp(gridDomain.colorExtent),
			data: {at: "groups", geom, cells, aggregate},
		};
	}

	if (geom === "boxplot" || geom === "violin") {
		// Both want the values themselves, and a category to hold them apart.
		if (!yId || !yField?.numeric || ctx.axisKind !== "band") return null;
		const params = series.statParams ?? {};
		const boxes: BoxDatum[] = [];
		const violins: ViolinDatum[] = [];
		const held = params.scale ?? "area";

		for (const [category, values] of valuesByCategory(ctx.data, ctx.xId, yId)) {
			const stats = boxStats(values, {coef: params.coef, quantileType: params.quantileType});
			if (!stats) continue;
			if (geom === "boxplot") {
				boxes.push({category, ...stats});
				continue;
			}
			/*
        The outline, on the author's kernel.

        `trim` defaults true here where the statistic's own default is false. A tail past the
        largest reading claims a measurement above it.
      */
			const density = kde(values, {
				bw: params.bw,
				adjust: params.adjust,
				kernel: params.kernel,
				bounds: params.bounds,
				trim: params.trim ?? true,
				n: VIOLIN_OUTLINE,
				// `width` reads a group's own peak. The other two divide over the whole list below.
				normalize: held === "width" ? "peak" : "density",
			});
			// A density needs a spread to estimate over. A category on one value draws none.
			if (!density) {
				if (params.drop === false) violins.push({category, ...stats, grid: [], weight: [], bandwidth: 0});
				continue;
			}
			violins.push({
				category,
				...stats,
				...density,
				quantiles: (params.quantiles ?? QUARTILES).flatMap((p) => {
					const at = quantileOf(values, p, params.quantileType ?? 7);
					return at == null ? [] : [at];
				}),
			});
		}

		const name = series.name ?? yField.label;
		if (geom === "violin") {
			if (violins.length === 0) return null;
			const spread = medianSpread(violins.map((violin) => violin.median));
			return {
				...base,
				name,
				...colorScaleOf(spread, ctx.colorOptions),
				ramp: valueRamp(spread, ctx.palettes, ctx.colorOptions),
				data: {at: "groups", geom, violins: heldAcross(violins, held)},
			};
		}
		if (boxes.length === 0) return null;
		const spread = medianSpread(boxes.map((box) => box.median));
		return {
			...base,
			name,
			...colorScaleOf(spread, ctx.colorOptions),
			ramp: valueRamp(spread, ctx.palettes, ctx.colorOptions),
			data: {at: "groups", geom, boxes},
		};
	}

	/*
    The band. Two bound columns and no reduction. Sorted along X here, where the fill walks
    forward along the high bound and back along the low one.
  */
	/*
	  Both read the same pair of bounds. A band closes one region, and two readings are the floor of
	  what draws. A range is a mark per reading.
	*/
	if (geom === "ribbon" || geom === "range") {
		const loId = typeof series.aes.ymin === "string" ? series.aes.ymin : undefined;
		const hiId = typeof series.aes.ymax === "string" ? series.aes.ymax : undefined;
		const midId = typeof series.aes.y === "string" ? series.aes.y : undefined;
		if (!loId || !hiId) return null;
		if (!ctx.fieldAt.get(loId)?.numeric || !ctx.fieldAt.get(hiId)?.numeric) return null;

		const numericX = ctx.xField.numeric;
		const readings: IntervalPoint[] = [];
		for (let row = 0; row < ctx.data.rowCount; row += 1) {
			const at = numericX ? ctx.data.number(row, ctx.xId) : ctx.data.text(row, ctx.xId);
			const lo = ctx.data.number(row, loId);
			const hi = ctx.data.number(row, hiId);
			if (at == null || lo == null || hi == null) continue;
			const mid = midId ? ctx.data.number(row, midId) : null;
			// The author may have written the bounds either way round, and a band has no direction.
			readings.push({x: at, lo: Math.min(lo, hi), hi: Math.max(lo, hi), ...(mid == null ? {} : {mid})});
		}
		if (readings.length < (geom === "ribbon" ? 2 : 1)) return null;
		if (numericX) readings.sort((a, b) => (a.x as number) - (b.x as number));

		/*
		  The estimate names the axis where one was bound.

		  `field` is what the axis title and the readout read. A band with no `y` names a bound.
		*/
		const named = ctx.fieldAt.get(midId ?? hiId) ?? ctx.fieldAt.get(hiId);

		return {
			...base,
			name: series.name ?? named?.label ?? (geom === "ribbon" ? "Interval" : "Range"),
			field: named,
			data:
				geom === "range"
					? {at: "records", geom, glyph: series.kind as "errorbar" | "linerange" | "pointrange" | "crossbar", readings}
					: {at: "records", geom, readings},
		};
	}

	/*
    The segment. Four bound columns, read in the order they stand.

    A row missing any of the four is dropped, and both ends are numeric.
  */
	if (geom === "segment") {
		const xEndId = typeof series.aes.xend === "string" ? series.aes.xend : undefined;
		const yEndId = typeof series.aes.yend === "string" ? series.aes.yend : undefined;
		if (!yId || !xEndId || !yEndId) return null;
		if (!yField?.numeric || !ctx.fieldAt.get(yEndId)?.numeric) return null;

		/*
      The dumbbell runs the pair inside one category.

      Both ends name the same category, and the two measures do the moving. A mixed pair is refused.
    */
		const bands = ctx.axisKind === "band" && !ctx.xField.numeric;
		if (!bands && (!ctx.xField.numeric || !ctx.fieldAt.get(xEndId)?.numeric)) return null;
		if (bands && ctx.fieldAt.get(xEndId)?.numeric) return null;

		const segments: SegmentPoint[] = [];
		for (let row = 0; row < ctx.data.rowCount; row += 1) {
			const x = bands ? ctx.data.text(row, ctx.xId) : ctx.data.number(row, ctx.xId);
			const y = ctx.data.number(row, yId);
			const xEnd = bands ? x : ctx.data.number(row, xEndId);
			const yEnd = ctx.data.number(row, yEndId);
			if (x == null || y == null || xEnd == null || yEnd == null) continue;
			segments.push({x, y, xEnd, yEnd});
		}
		if (segments.length === 0) return null;

		return {
			...base,
			name: series.name ?? yField.label,
			data: {at: "records", geom, segments},
		};
	}

	/*
    Bars and areas always reduce. A line reduces too where the axis has categories. An area takes
    the route bars take, and a continuous axis bins it first.
  */
	/*
    A kernel density over the measure on X, drawn as one curve.

    The vertical scale has the density itself. No measure binds to it and the trace names none.
  */
	if (geom === "density") {
		if (ctx.axisKind !== "continuous") return null;
		const params = series.statParams ?? {};
		const values: number[] = [];
		for (let row = 0; row < ctx.data.rowCount; row += 1) {
			const value = ctx.data.number(row, ctx.xId);
			if (value != null) values.push(value);
		}
		const curve = kde(values, {
			bw: params.bw,
			adjust: params.adjust,
			kernel: params.kernel,
			n: params.n,
			trim: params.trim,
			bounds: params.bounds,
		});
		if (!curve) return null;
		return {...base, name: series.name ?? `density of ${ctx.xField.label}`, data: {at: "groups", geom, curve}};
	}

	const ring = geom === "pie";
	if (
		geom === "bar" ||
		geom === "waterfall" ||
		geom === "area" ||
		geom === "freqpoly" ||
		ring ||
		(geom === "line" && ctx.axisKind === "band")
	) {
		/*
      Steps are an ordered sequence and bins are a measure cut up.

      A waterfall asks its horizontal channel for categories, and a continuous one draws none.
    */
		if (geom === "waterfall" && ctx.axisKind !== "band") return null;
		/*
      A ring divides one whole, and bins divide no whole anybody measured.

      A pie asks its horizontal channel for categories. The aggregate keeps the bar's default mean.
    */
		if (ring && ctx.axisKind !== "band") return null;
		// An unbound measure defaults the aggregate to "count". The series answers how many rows.
		// A bound measure defaults to "mean", and to "sum" under a running total.
		const aggregate = (series.aggregate ?? (yField ? (runs(series) ? "sum" : "mean") : "count")) as Aggregate;
		const measure = aggregate === "count" ? null : (yField?.id ?? null);
		if (!measure && aggregate !== "count") return null;
		const name = series.name ?? (yField ? `${aggregate} of ${yField.label}` : "Count");

		/*
      A count has no spread, and the author's request is dropped under it.

      `halfWidth` returns undefined where the group has one reading.
    */
		const wants = aggregate === "count" ? undefined : series.error;
		const halfWidth = (of: {sd: number; sem: number}) => {
			if (!wants) return undefined;
			const half = wants === "sem" ? of.sem : of.sd;
			return half > 0 ? half : undefined;
		};

		if (ctx.axisKind === "band") {
			const shows = aggregate !== "count" && series.replicates === true;
			let replicatesDropped = 0;
			const bars = groupRows(ctx.data, ctx.xId, measure, aggregate, shows).map((group) => {
				const crowded = (group.values?.length ?? 0) > REPLICATE_CAP;
				if (shows && crowded) replicatesDropped += 1;
				return {
					category: group.key,
					value: group.value,
					n: group.n,
					error: halfWidth(group),
					...(shows && !crowded ? {values: group.values} : {}),
				};
			});
			/* The cap the geom applied, on the ledger the footer reads. */
			omit(ctx.omitted, "replicates", replicatesDropped);
			return bars.length === 0
				? null
				: {
						...base,
						name,
						data: {
							at: "groups",
							geom,
							bars,
							aggregate,
							error: wants,
							...(replicatesDropped ? {replicatesDropped} : {}),
						},
					};
		}

		/*
		  A value scale has no groups of its own. A bar draws one per distinct reading, ggplot's
		  `geom_bar` and `geom_col`, and binning is the histogram's.
		*/
		const {bars, width, offScale} =
			series.kind === "bar"
				? distinctBars(ctx.data, ctx.xId, measure ?? undefined, aggregate, ctx.xTransform, halfWidth)
				: binnedBars(ctx.data, ctx.xId, measure ?? undefined, aggregate, binOf(series), ctx.xTransform, halfWidth);
		return bars.length === 0
			? null
			: {
					...base,
					name,
					data: {
						at: "groups",
						geom,
						bars,
						aggregate,
						binWidth: width,
						error: wants,
						...(offScale > 0 ? {offScale} : {}),
					},
				};
	}

	/* A label per row at its reading. A row with no text writes nothing. */
	if (geom === "text") return textTrace(series, ctx);

	/* What is left is the record payload, which five geometries share. */
	if (geom !== "point" && geom !== "hex" && geom !== "contour" && geom !== "line" && geom !== "smooth") return null;
	if (!yId || !yField?.numeric) return null;

	/* A contour over a bound measure cuts the rows' lattice into bands. The corners give the frame its domain. */
	const levelId = geom === "contour" && typeof series.aes.z === "string" ? series.aes.z : undefined;
	const levelField = levelId ? ctx.fieldAt.get(levelId) : undefined;
	if (geom === "contour" && levelField?.numeric && ctx.xField.numeric) {
		const grid = relief(ctx.data, ctx.xId, yId, levelField.id, (series.aggregate ?? "mean") as Aggregate);
		if (!grid) return null;
		const corners = [
			{x: grid.xDomain[0], y: grid.yDomain[0], row: -1},
			{x: grid.xDomain[1], y: grid.yDomain[1], row: -1},
		];
		return {
			...base,
			name: series.name ?? levelField.label,
			colorField: levelField,
			ramp: valueRamp(grid.zDomain, ctx.palettes, ctx.colorOptions),
			...colorScaleOf(grid.zDomain, ctx.colorOptions),
			data: {at: "records", geom, points: corners, grid},
		};
	}
	const labelField = series.directLabels ? ctx.fieldAt.get(series.directLabels.field) : undefined;
	const colorId = paintColumn(series);
	const colorField = colorId ? ctx.fieldAt.get(colorId) : undefined;
	const codes = colorField && !colorField.numeric ? ctx.codesFor(colorField.id) : null;

	/*
    Only points have geoms to size. A cell and a band read as their own count, and a line has no
    per-record diameter. The channel is refused there.
  */
	const sizeId = typeof series.aes.size === "string" ? series.aes.size : undefined;
	const sizeField = geom === "point" && sizeId ? ctx.fieldAt.get(sizeId) : undefined;
	const sizeDomain = sizeField?.numeric ? ctx.rangeFor(sizeField.id) : null;
	const sizeRadii = series.style?.sizeRange ?? sizeRadiiFor(ctx.metrics);
	const size = sizeField && sizeDomain ? {field: sizeField, domain: sizeDomain, radii: sizeRadii} : null;

	/*
	  The two channels that resolve per mark. A cell, a band and a path have no mark to take a glyph
	  or an opacity.
	*/
	const shapeId = geom === "point" && typeof series.aes.shape === "string" ? series.aes.shape : undefined;
	const shapeField = shapeId ? ctx.fieldAt.get(shapeId) : undefined;
	/* A measure has no levels to hand out, and four glyphs cannot carry a continuous reading. */
	const shapes =
		shapeField && !shapeField.numeric
			? {field: shapeField, codes: ctx.codesFor(shapeField.id), levels: POINT_SHAPES}
			: null;

	const alphaId = geom === "point" && typeof series.aes.alpha === "string" ? series.aes.alpha : undefined;
	const alphaField = alphaId ? ctx.fieldAt.get(alphaId) : undefined;
	const alphaDomain = alphaField?.numeric ? ctx.rangeFor(alphaField.id) : null;
	const opacities = alphaField
		? {
				field: alphaField,
				codes: alphaField.numeric ? null : ctx.codesFor(alphaField.id),
				domain: alphaDomain,
			}
		: null;

	const bandCodes = ctx.axisKind === "band" && !ctx.xField.numeric ? ctx.codesFor(ctx.xId) : null;
	const points = pointsOf(
		ctx.data,
		ctx.xId,
		yId,
		labelField,
		colorField,
		codes,
		size,
		null,
		bandCodes,
		/* A jitter position states the two axes apart and a nudge states a fixed offset. */
		jitterOf(series),
		shoveOf(series),
		shapes,
		opacities,
	);
	if (points.length === 0) return null;

	// A line reads left to right, and breaks where a reading is missing, which is ggplot's `geom_path`.
	if (geom === "line") {
		points.sort((a, b) => a.x - b.x);
		breakAtGaps(points, missingAlong(ctx.data, ctx.xId, yId));
	}

	/*
    A running total over the readings themselves.

    The grouped path accumulates its groups. A line over records has no groups to accumulate, and
    the same request there means the arrival curve: each reading carries what came before it.
  */
	const readings = runs(series) ? accumulateAlong(points) : points;

	/*
    Magnitude takes the sequential map and identity takes the categorical one, per chart-design
    rule 8. Sampling a sequential map for identity leaves neighboring groups indistinguishable.
  */
	let ramp = base.ramp;
	const range = colorField?.numeric ? ctx.rangeFor(colorField.id) : null;
	if (range) {
		ramp = valueRamp(range, ctx.palettes, ctx.colorOptions);
	} else if (codes) {
		ramp = codeRamp(series, codes, ctx.palettes);
	}

	/* The assignment, sorted by the index it hands out. The legend reads in palette order. */
	const colorLevels = codes
		? [...codes].map(([value, code]) => ({value, code})).sort((a, b) => a.code - b.code)
		: undefined;

	return {
		...base,
		name: series.name ?? yField.label,
		ramp,
		colorField,
		...(colorLevels ? {colorLevels} : {}),
		...(range ? colorScaleOf(range, ctx.colorOptions) : {}),
		...(size ? {sizeField: size.field, sizeDomain: size.domain, sizeRadii: size.radii} : {}),
		...(shapes ? {shapeChannel: {field: shapes.field, levels: levelsOf(shapes)}} : {}),
		...(opacities
			? {
					alphaChannel: {
						field: opacities.field,
						...(opacities.domain ? {domain: opacities.domain} : {}),
						...(opacities.codes
							? {
									levels: [...opacities.codes]
										.sort((a, b) => a[1] - b[1])
										.map(([value, code]) => ({
											value,
											at: opacityAt(code, [0, Math.max(1, opacities.codes!.size - 1)]),
										})),
								}
							: {}),
					},
				}
			: {}),
		data: {
			at: "records",
			geom,
			points: readings,
			...(geom === "contour" && series.statParams?.adjust != null ? {adjust: series.statParams.adjust} : {}),
		},
	};
}

/**
 * The cells given, plus a nought for every pair of their categories that carries none.
 *
 * Built from the categories the cells name. A row absent from every cell has no band on the axis,
 * so nothing is invented the grid cannot place.
 */
function withZeros(cells: HeatCell[]): HeatCell[] {
	const xs = [...new Set(cells.map((cell) => cell.x))];
	const ys = [...new Set(cells.map((cell) => cell.y))];
	const seen = new Set(cells.map((cell) => `${cell.x}\u0000${cell.y}`));
	const filled = [...cells];
	for (const x of xs) {
		for (const y of ys) {
			if (!seen.has(`${x}\u0000${y}`)) filled.push({x, y, value: 0, n: 0});
		}
	}
	return filled;
}
