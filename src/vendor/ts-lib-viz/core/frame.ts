/**
 * Turns built layers into the axes, scales and footer.
 *
 * Faceting partitions one plot into panels and each panel derives its own axes. The fit footer
 * stays apart from the build.
 */

import {boundsOf} from "./aggregate.js";
import {
	buildLayers,
	categoriesOf,
	colorDomainOf,
	colorScaleOf,
	drawsAxes,
	drawsOneColor,
	rampOptionsFor,
	sizeRadius,
	valueRamp,
	horizontalTransform,
	verticalTransform,
	rowsByValue,
	viewOf,
	type AxisKind,
	type BuildOptions,
	type LayerPoint,
	type Palettes,
	type Trace,
} from "./layers.js";
import {OMITTED_KINDS, omit, omissionLine, omittedCount, type Omission} from "./omission.js";
import {flooredCount, placeTraces, type Bounds} from "./bounds.js";
import {ruleSegment, type RuleAxis} from "./rules.js";
import {matrixFor, orderBand, reducedCells, type ClusterTree, type OrderedBand} from "./band-order.js";
import {transposed} from "./cluster.js";
import {trackFor, trackOverFields, type SideTrack} from "./side-track.js";
import {marginalBins, valuesAlong, valuesByLevel, type Marginal} from "./marginal.js";
import {geomColor, paintAesthetic, paintColumn} from "./geom-table.js";
import {groundedGeoms} from "./grammar.js";
import {isLog, TRANSFORMS, transformOf, type AxisTransform} from "./transform.js";
import {REGULAR, type Metrics} from "./sizing.js";
import type {Assignments} from "./figure-set.js";
import type {FitState} from "./fit-types.js";
import type {Fit} from "./fit-types.js";
import {anyRange, keptLines, type AxisRanges} from "./brush.js";
import {chooseLabels} from "./labels.js";
import {readOnce, type PlotData, type PlotField} from "./plot-data.js";
import {tickFormatter} from "./tick-format.js";
import {
	positionArgs,
	type Annotation,
	type PositionScale,
	type BandOrder,
	type ChartScales,
	type ChartSpec,
	type ColorScale,
	type LayerStyle,
	type LegendOptions,
	type PlotKind,
	type LayerSpec,
} from "./spec.js";
import {
	axisRoom,
	buildAxis,
	isBand,
	TITLE_PAD,
	type AxisChrome,
	type AxisEnd,
	type AxisSpec,
	type BandAxisSpec,
	type FrameNote,
	type LinearAxisSpec,
	type Scale,
} from "./frame-geometry.js";

/** Series counts above this draw translucent, per chart-design rule 7. */
export const FADE_ABOVE = 1_500;

/**
 * Where a scatter moves from SVG to the GPU.
 *
 * The path strings break first. A quarter of a million geoms is megabytes of string per recolor.
 */
export const GL_ABOVE = 15_000;

/** What rule 7's third row draws in place of one geom per record. */
export type PointTreatment = "points" | "faded" | "binned";

/**
 * Which of the three treatments a count asks for.
 *
 * One function. The renderer picking a treatment and the footer stating it read one threshold.
 */
export const treatmentOf = (count: number): PointTreatment =>
	count > GL_ABOVE ? "binned" : count > FADE_ABOVE ? "faded" : "points";

/**
 * Records the frame is holding as individual geoms.
 *
 * Counted over point traces alone. A trace drawing a hexbin came from a density kind.
 */
export const pointCount = (frame: ReadyFrame): number =>
	frame.traces.reduce(
		(total, trace) =>
			total + (trace.data.at === "records" && trace.data.geom === "point" ? trace.data.points.length : 0),
		0,
	);

/**
 * What drew, where a count forced something other than one geom per record.
 *
 * The renderer decides this and the frame cannot see it. It reaches the footer as an argument.
 */
export interface Substitution {
	/** The geom that stood in. */
	drew: "hexbin" | "contour" | "density grid";
	cells: number;
	rows: number;
}

/**
 * Whether two reports say the same thing.
 *
 * A geom reports from an effect and the answer is a fresh object each firing. The comparison
 * reads what was said.
 */
export const sameSubstitution = (a: Substitution | null, b: Substitution | null): boolean =>
	a === b || (a != null && b != null && a.drew === b.drew && a.cells === b.cells && a.rows === b.rows);

/** Categories drawn before the labels stop fitting under the axis. */
export const CATEGORY_CAP = 60;

/**
 * Categories a content-sized figure draws.
 *
 * A stated band size decides the plot area and the figure grows to hold it. What runs out is the
 * document.
 */
export const GROWN_CAP = 1000;

/**
 * Categories this band draws.
 *
 * `CLUSTER_CAP` is what the clustering affords and runs lower. A band between the two draws its
 * rows unordered.
 */
const bandCap = (plot: ChartSpec) => (plot.sizing === "content" ? GROWN_CAP : CATEGORY_CAP);

/** What both bands' orders came to, and what the cap turned down on the way. */
interface OrderedBands {
	x: OrderedBand;
	y: OrderedBand;
	/** Pixels a break takes, off the panel's metrics. The band arithmetic and the sums read it. */
	gapSize: number;
	/** Set where a `kmeans` order replaced one band's categories with centroids. */
	reduced?: {of: {of: string; to: string}[]; along: "x" | "y"};
	/** Bands where a cluster order was asked for and the cap turned it down. */
	refused: {axis: "x" | "y"; rows: number; cap: number}[];
}

/**
 * Both bands' orders, read off the traces' grid cells.
 *
 * One matrix serves both axes. Its rows are the vertical band and the horizontal order clusters
 * the transpose.
 */
function orderBands(
	plot: ChartSpec,
	categories: string[],
	stacked: string[],
	traces: Trace[],
	metrics: Metrics,
): OrderedBands {
	const cells = traces.flatMap((trace) =>
		trace.data.at === "groups" && trace.data.geom === "heatmap" ? trace.data.cells : [],
	);
	const grid = () => matrixFor(cells, stacked, categories);

	const down = orderBand(plot.scales?.y?.order, stacked, grid);
	const across = orderBand(
		plot.scales?.x?.order,
		categories,
		down.reduced
			? () => null
			: () => {
					const built = grid();
					return built ? transposed(built) : null;
				},
	);

	const refused: {axis: "x" | "y"; rows: number; cap: number}[] = [];
	if (down.refused) refused.push({axis: "y", ...down.refused});
	if (across.refused) refused.push({axis: "x", ...across.refused});

	const reduced = down.reduced
		? ({of: down.reduced, along: "y"} as const)
		: across.reduced
			? ({of: across.reduced, along: "x"} as const)
			: undefined;

	return {x: across, y: down, gapSize: metrics.gap, refused, reduced};
}

/** The grid traces rewritten onto the centroids a kmeans order produced. */
function reduceGrids(traces: Trace[], reduced: {of: {of: string; to: string}[]; along: "x" | "y"}): Trace[] {
	return traces.map((trace) =>
		trace.data.at === "groups" && trace.data.geom === "heatmap"
			? {...trace, data: {...trace.data, cells: reducedCells(trace.data.cells, reduced.of, reduced.along)}}
			: trace,
	);
}

/**
 * Confidence bands drawn before they stop being readable.
 *
 * Translucent areas compound. Forty of them stack into a solid wash. Past this the curves draw
 * alone and the footer reports it.
 */
export const BAND_LIMIT = 12;

const ANCHOR: Record<"left" | "center" | "right", FrameNote["align"]> = {
	left: "start",
	center: "middle",
	right: "end",
};

export const axisLabel = (field: PlotField | undefined): string | undefined =>
	field ? (field.unit ? `${field.label} (${field.unit})` : field.label) : undefined;

/**
 * What the vertical scale measures once a fill has divided it.
 *
 * The geoms are shares of each band's total, stopping at one. A percentage is `scales.y.format`.
 */
const shareLabel = (field: PlotField | undefined): string | undefined =>
	field ? `Share of ${field.label}` : undefined;

/** Characters a number takes at the tick, for the margin a value scale needs before its ticks exist. */
const NUMBER_CHARS = 6;

/**
 * How this axis draws itself -- what the author set, then the panel's size.
 *
 * The tick length and type size resolve here. `axisRoom` and `buildAxis` both read them.
 */
const chromeOf = (axis: PositionScale | undefined, metrics: Metrics): AxisChrome => ({
	lineWidth: axis?.linewidth,
	tickLength: axis?.tickLength ?? metrics.tickLength,
	tickSide: axis?.tickSide,
	tickAngle: axis?.tickAngle,
	titleAlign: axis?.titleAlign,
	fontSize: axis?.fontSize ?? metrics.axis,
	ink: axis?.ink,
	grid: axis?.grid,
	minorGrid: axis?.minorGrid,
});

/* The drawn text. A renamed category is what the margin has to fit. */
const longestOf = (spec: BandAxisSpec) =>
	spec.values.reduce((most, value) => Math.max(most, (spec.names?.[value] ?? value).length), 0);

/**
 * Room one axis takes outside the plot area.
 *
 * The chrome decides it. A label turned ninety degrees reaches its own length. A value scale
 * takes a nominal width.
 */
const roomFor = (spec: AxisSpec, axis: "x" | "y", hasTitle: boolean) =>
	axisRoom(spec, axis, isBand(spec) ? longestOf(spec) : NUMBER_CHARS, hasTitle);

/**
 * Points a trace holds, for records on the frame's own pair of scales.
 *
 * A reduction holds groups. A parallel trace draws across its own rules. A band has two bounds.
 */
export const pointsOf = (trace: Trace): LayerPoint[] =>
	trace.data.at === "records" && "points" in trace.data ? trace.data.points : [];

/** Splits an expansion into its two ends, the low end first. */
const ends = (value: number | readonly [number, number]): readonly [number, number] =>
	typeof value === "number" ? [value, value] : value;

/**
 * Pads the data's reach at each end in transformed space. ggplot's `expand`.
 *
 * The default is a fifth each end on a log axis and a twentieth of the span elsewhere.
 */
function pad(
	lo: number,
	hi: number,
	transform: AxisTransform = "identity",
	expand?: PositionScale["expand"],
): [number, number] {
	const log = isLog(transform);
	if (log && !expand) {
		const top = hi > 0 ? hi * 1.25 : 1;
		/* A non-positive low has no place on a log axis. Three decades under the top is the floor,
		   which keeps the readings that do fit spread across it. */
		return [lo > 0 ? lo * 0.8 : top / 1000, top];
	}
	const {forward, back} = TRANSFORMS[transform];
	const a = forward(log && !(lo > 0) ? (hi > 0 ? hi : 1) / 1000 : lo);
	const b = forward(log && !(hi > 0) ? 1 : hi);
	const span = b - a;
	// One distinct value would otherwise give a zero-width domain, mapping each geom to one pixel.
	if (span === 0) return [back(a - 1), back(b + 1)];
	const [multLo, multHi] = ends(expand?.mult ?? 0.05);
	const [addLo, addHi] = ends(expand?.add ?? 0);
	return [back(a - span * multLo - addLo), back(b + span * multHi + addHi)];
}

/** A stated pair of ends as the axis holds it, a copy of the spec's own. */
const copied = (limits?: readonly [number, number]): [number, number] | undefined => limits && [limits[0], limits[1]];

/** An extent widened to the values an axis must reach. ggplot's `expand_limits`. */
function reaching(
	extent: [number, number],
	include: readonly number[] | undefined,
	transform: AxisTransform,
): [number, number] {
	const admitted = (include ?? []).filter(TRANSFORMS[transform].admits);
	if (admitted.length === 0) return extent;
	const [lo, hi] = boundsOf(admitted);
	return [Math.min(extent[0], lo), Math.max(extent[1], hi)];
}

/** Copies the stated scale arguments of an axis onto its spec. */
const scaleOf = (options: PositionScale | undefined): Partial<LinearAxisSpec> =>
	Object.fromEntries(
		Object.entries({
			transform: options?.transform,
			reverse: options?.reverse,
			breaks: options?.breaks,
			minorBreaks: options?.minorBreaks,
			names: options?.labels,
		}).filter(([, value]) => value !== undefined),
	);

/** What a stated `oob` asks of the scale. `keep` frees the clamp, and `squish` pins readings to the range. */
const oobOf = (options: PositionScale | undefined): Partial<LinearAxisSpec> =>
	options?.oob === "keep"
		? {clamp: false}
		: options?.oob === "squish" && options.limits
			? {squish: [options.limits[0], options.limits[1]]}
			: {};

/** Vertical reach of one trace, whichever geom it draws. A transform reads the part it places. */
function verticalExtent(trace: Trace, transform: AxisTransform = "identity"): [number, number] | null {
	const {admits} = TRANSFORMS[transform];
	let lo = Infinity;
	let hi = -Infinity;
	const see = (value: number) => {
		if (!admits(value)) return;
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	};

	if (trace.data.at === "records") {
		// Each rule takes its own range. The frame has none to build.
		if (trace.data.geom === "parcoords" || trace.data.geom === "radar") return null;
		// A band reaches both bounds, and the scale has to hold the whole region or it draws clipped.
		if (trace.data.geom === "ribbon" || trace.data.geom === "range") {
			for (const reading of trace.data.readings) {
				see(reading.lo);
				see(reading.hi);
			}
		} else if (trace.data.geom === "segment") {
			// A segment travels. The scale takes both ends.
			for (const segment of trace.data.segments) {
				see(segment.y);
				see(segment.yEnd);
			}
		} else if ("points" in trace.data) {
			for (const point of trace.data.points) see(point.y);
		} else {
			/* A reference line leaves the scales alone, as ggplot's reference geoms do. */
			return null;
		}
	} else if (trace.data.geom === "boxplot") {
		for (const box of trace.data.boxes) {
			see(box.lo);
			see(box.hi);
			for (const outlier of box.outliers) see(outlier);
		}
	} else if (trace.data.geom === "violin") {
		// The outline reaches the ends of the grid, which run past the whiskers a box would stop at.
		for (const violin of trace.data.violins) {
			see(violin.grid[0]!);
			see(violin.grid[violin.grid.length - 1]!);
		}
	} else if (trace.data.geom === "density") {
		/* The curve reads a density from zero. The scale takes the baseline and the peak. */
		see(0);
		for (const value of trace.data.curve.weight) see(value);
	} else if (
		trace.data.geom === "sankey" ||
		trace.data.geom === "chord" ||
		trace.data.geom === "ideogram" ||
		trace.data.geom === "heatmap" ||
		trace.data.geom === "treemap" ||
		trace.data.geom === "icicle" ||
		trace.data.geom === "sunburst" ||
		trace.data.geom === "gauge" ||
		"mesh" in trace.data ||
		"field" in trace.data
	) {
		// None reads the frame's vertical scale and none contributes a domain.
		return null;
	} else {
		// All four are read against the baseline. A domain starting higher overstates them.
		if (
			trace.data.geom === "bar" ||
			trace.data.geom === "waterfall" ||
			trace.data.geom === "area" ||
			trace.data.geom === "freqpoly"
		) {
			see(0);
		}
		for (const bar of trace.data.bars) {
			// A stacked segment's reach is its own top, and its floor is where the one below it ended.
			see(bar.value + (bar.floor ?? 0));
			if (bar.floor != null) see(bar.floor);
			// A whisker reaches past its bar, and a scale stopping at the bar draws the top of it flat.
			if (bar.error != null) {
				see(bar.value + bar.error);
				see(bar.value - bar.error);
			}
		}
	}

	return Number.isFinite(lo) ? [lo, hi] : null;
}

/**
 * The plot's annotations, in the shapes `Frame` draws.
 *
 * An author names the data and a transpose swaps here.
 */
function annotationLayers(
	annotations: readonly Annotation[],
	swapped = false,
): {
	axisEnds: AxisEnd[];
	notes: FrameNote[];
} {
	const axisEnds: AxisEnd[] = [];
	const notes: FrameNote[] = [];

	annotations.forEach((annotation, source) => {
		const drawnOn = (axis: "x" | "y") => (swapped ? (axis === "x" ? "y" : "x") : axis);
		if (annotation.kind === "axis-end") {
			axisEnds.push({axis: drawnOn(annotation.axis), end: annotation.end, text: annotation.text});
		} else if (annotation.kind === "note") {
			notes.push({
				text: annotation.text,
				at: swapped ? {x: annotation.at.y, y: annotation.at.x} : annotation.at,
				toward: annotation.leader?.toward,
				// The spec speaks in reading directions and SVG speaks in text anchors.
				align: ANCHOR[annotation.align ?? "left"],
				/* The kinds share one list. A note keeps its position there, and a drag writes to it. */
				source,
			});
		}
	});

	return {axisEnds, notes};
}

/** Geoms a label rule chose on one trace, and how many more qualified. */
export interface LabeledTrace {
	trace: Trace;
	indices: number[];
	dropped: number;
}

export interface LegendRow {
	key: string;
	label: string;
	color: string;
	/** Set where the row's geoms read the right-hand scale. */
	right?: boolean;
}

/** A line trace's last reading, where a direct label would draw. Absent on any other trace. */
const lastReading = (trace: Trace): number | undefined =>
	trace.data.at === "records" && trace.data.geom === "line"
		? trace.data.points[trace.data.points.length - 1]?.y
		: undefined;

/** The traces with the lines in the order their last readings stand, top first. The rest keep their places. */
function byLastReading(traces: Trace[]): Trace[] {
	const lines = traces.filter((trace) => lastReading(trace) != null);
	const sorted = [...lines].sort((a, b) => lastReading(b)! - lastReading(a)!);
	let next = 0;
	return traces.map((trace) => (lastReading(trace) != null ? sorted[next++]! : trace));
}

/**
 * What the legend names -- a split value, or a series.
 *
 * Two series over one split field draw the same color for one value. They share a row. `geoms`
 * order reads the lines the way they end.
 */
export function legendRows(traces: Trace[], order: LegendOptions["order"] = "authoring"): LegendRow[] {
	const rows = new Map<string, LegendRow>();
	for (const trace of order === "geoms" ? byLastReading(traces) : traces) {
		if (trace.showLegend === false) continue;
		/*
		  A bound identity channel names its categories.

		  Keyed on the field and the value, the key a split already uses. A figure that splits and
		  colors lists one value once.
		*/
		if (trace.colorLevels && trace.colorField) {
			for (const {value, code} of trace.colorLevels) {
				const levelKey = `${trace.colorField.id}:${value}`;
				if (rows.has(levelKey)) continue;
				rows.set(levelKey, {key: levelKey, label: value, color: trace.ramp(code)});
			}
			continue;
		}

		/* A group names nothing a reader looks up. Its series takes one row. */
		const whole = trace.splitValue == null || trace.grouped === true;
		const key = trace.grouped ? trace.layerId : whole ? trace.id : `${trace.splitField?.id}:${trace.splitValue}`;
		if (rows.has(key)) continue;
		rows.set(key, {
			key,
			label: whole ? trace.name : (trace.splitValue ?? trace.name),
			color: trace.color,
			right: whole && trace.axis === "y2" ? true : undefined,
		});
	}
	return [...rows.values()];
}

/**
 * Curves belonging to one trace.
 *
 * A split fits per value and `curvesByGroup` names each curve after its value. An unsplit series
 * takes them all.
 */
export function fitsFor(trace: Trace, fitted: FitState, panel?: string): Fit[] {
	const found = fitted.byLayer.get(trace.layerId);
	if (!found) return [];
	/*
    Two filters, each skipped where it has nothing to say. An unsplit trace takes whatever came
    back for its series. A panel is matched where the caller named one.
  */
	return found.fits.filter(
		(fit) =>
			(panel === undefined || (fit.panel ?? "") === panel) && (trace.splitValue == null || fit.id === trace.splitValue),
	);
}

/**
 * Curves the frame will draw.
 *
 * The service fits per split value and the trace cap keeps two dozen. A count off the response
 * says 41 where the reader sees 24.
 */
export const drawnFits = (traces: Trace[], fitted: FitState): Fit[] =>
	traces.flatMap((trace) => fitsFor(trace, fitted));

/** Everything derived from a spec and its rows, before a pixel is known. */
export interface ReadyFrame {
	status: "ready";
	traces: Trace[];
	axisKind: AxisKind;
	/** Absent where nothing reads a horizontal axis. */
	xField?: PlotField;
	unbuilt: PlotKind[];
	/**
	 * Set where no trace draws against an axis. The panel hands the geoms its whole area.
	 *
	 * A treemap positions by nesting.
	 */
	axisFree: boolean;
	/** Traces that occupy a slot in the band, in the order they divide it. */
	slotted: Trace[];
	x: AxisSpec;
	/**
	 * A value scale, or a band where the geoms name categories on both axes.
	 *
	 * A heatmap is the one geom that does. The rest read a measure vertically.
	 */
	y: AxisSpec;
	margin: {top: number; right: number; bottom: number; left: number};
	/**
	 * Domain of the right-hand axis, or null where no series reads it.
	 *
	 * A domain, and faceting shares it. Two panels agreeing about a measure is a fact about
	 * numbers.
	 */
	rightDomain: [number, number] | null;
	/** The right-hand scale past its domain: transform, breaks and clamp. Null where no series reads it. */
	rightAxis: Omit<LinearAxisSpec, "domain"> | null;
	annotations: ReturnType<typeof annotationLayers>;
	labeled: LabeledTrace[];
	/** The label rule in words. A reader learns which points were eligible for a name. */
	labelRule: string | null;
	/**
	 * Bands where a cluster order was asked for and the cap refused.
	 *
	 * A refused grid draws in the build order. The critic turns this into a finding.
	 */
	clusterRefused: {axis: "x" | "y"; rows: number; cap: number}[];
	/**
	 * The trees the bands' cluster orders came out of, per axis.
	 *
	 * A dendrogram side panel draws this. Null on a stated list and on a refused cap.
	 */
	clusterTrees: {x: ClusterTree | null; y: ClusterTree | null};
	/**
	 * The spec's annotation tracks, resolved onto the categories the bands drew.
	 *
	 * The reduction reads the table and the band. A track resolving to nothing is absent.
	 */
	tracks: SideTrack[];
	/**
	 * What the marginal panels read off the geoms, per side that asked.
	 *
	 * The answer is a walk of the cloud. Two panels on one axis share the readings by reference.
	 */
	marginals: Marginal[];
	/**
	 * One ledger of what the figure left out. The footer states it.
	 *
	 * The build's caps arrive on it and the frame's push here. A facet's dropped panels join at
	 * `footerOf`.
	 */
	omitted: Omission[];
	/** Whether the plot area clips its geoms, which a stated range asks for. Absent leaves it open. */
	clip?: boolean;
	/**
	 * Whether the shared pair drew with its roles swapped.
	 *
	 * Read off here. The frame refuses a transpose where the geoms read no shared pair.
	 */
	transposed: boolean;
	/** One row per split value, or per series where nothing splits. */
	legend: LegendRow[];
	fieldAt: Map<string, PlotField>;
	/**
	 * The sizing this frame was built at.
	 *
	 * The axis type size and tick length are already in `x` and `y`. This is for the annotation
	 * type and the geom radii.
	 */
	metrics: Metrics;
}

export type PlotFrame = ReadyFrame | {status: "empty"; title: string; reason: string};

const empty = (title: string, reason: string) => ({status: "empty" as const, title, reason});

export function buildFrame(
	plot: ChartSpec,
	data: PlotData,
	{palettes: palette, metrics = REGULAR, pinned, facet}: BuildOptions,
): PlotFrame {
	const fieldAt = new Map(data.fields.map((field) => [field.id, field]));
	const {
		traces: built,
		axisKind,
		xField,
		fields,
		unbuilt,
		omitted,
	} = buildLayers(plot, data, {palettes: palette, pinned, metrics, facet});
	/* A layer's own columns join the lookup. A readout and the critic find their names there. */
	for (const field of fields) fieldAt.set(field.id, field);

	/* A flow binds its own ends. An unbound X refuses the geoms that read one. */
	const axisFree = built.length > 0 && built.every((trace) => !drawsAxes(trace.data.geom));
	if (!xField && !axisFree) {
		return empty("X not bound", "Pick a field for the horizontal axis.");
	}
	if (built.length === 0) {
		if (unbuilt.length > 0) {
			return empty(`${unbuilt[0]} is no kind this version draws`, "Pick one of the kinds in KINDS.");
		}
		return empty("Nothing to plot", "No series carries both a bound measure and rows to draw.");
	}

	// A shared axis takes the log setting of the first measure on it. The author picked the pair.
	const leftField = (built.find((trace) => trace.axis !== "y2") ?? built[0])!.field;
	const rightField = built.find((trace) => trace.axis === "y2")?.field;

	/*
    A bar and an area read as a length from zero and the axis starts there. Neither takes a log
    scale. The `proportional` column of `GRAMMAR` answers this.
  */
	const grounded = groundedGeoms(built.map((trace) => trace.data.geom));
	const xTransform = horizontalTransform(plot, xField);
	const yTransform = verticalTransform(plot.scales?.y?.transform, leftField?.logScale, grounded);
	const rightTransform = verticalTransform(plot.scales?.y2?.transform, rightField?.logScale, grounded);

	/* Each reading placed against the axes before any extent is read. The footer counts what dropped. */
	const boundsOf = (options: PositionScale | undefined, transform: AxisTransform): Bounds => ({
		transform,
		range: options?.limits,
		oob: options?.oob ?? "censor",
	});
	const placed = placeTraces(
		built,
		axisKind === "continuous" ? boundsOf(plot.scales?.x, xTransform) : null,
		boundsOf(plot.scales?.y, yTransform),
		boundsOf(plot.scales?.y2, rightTransform),
	);
	const traces = placed.traces;

	const left = traces.filter((trace) => trace.axis !== "y2");
	const right = traces.filter((trace) => trace.axis === "y2");

	const spanOf = (group: Trace[], transform: AxisTransform): [number, number] | null => {
		let lo = Infinity;
		let hi = -Infinity;
		for (const trace of group) {
			const extent = verticalExtent(trace, transform);
			if (!extent) continue;
			lo = Math.min(lo, extent[0]);
			hi = Math.max(hi, extent[1]);
		}
		return Number.isFinite(lo) ? [lo, hi] : null;
	};

	/*
    A frame with no vertical reach still needs a domain to hand `Frame`.

    A flow reports no extent and the span comes back null. The unit interval stays undrawn.
  */
	const leftExtent = reaching(
		spanOf(left.length > 0 ? left : traces, yTransform) ?? [0, 1],
		plot.scales?.y?.include,
		yTransform,
	);
	const rightExtent = right.length > 0 ? spanOf(right, rightTransform) : null;

	/*
    Whether the geoms on the left scale are shares of their band.

    Read over the traces on that axis. A fill adjusts the group that named it.
  */
	const leftShares =
		(left.length > 0 ? left : traces).length > 0 &&
		(left.length > 0 ? left : traces).every(
			(trace) => trace.data.at === "groups" && "bars" in trace.data && trace.data.shares === true,
		);

	const grouped = traces.filter((trace) => trace.data.at === "groups");
	const categories: string[] = [];
	let hiddenCategories = 0;

	/*
    Categories come from the banded traces, ordered by the first one's values.

    Largest first. An unordered dimension has no order of its own.
  */
	/*
    Nothing grouped means nothing to band. An empty category set is a different thing.

    A parallel plot binds no X and the axis kind falls back to bands over records.
  */
	if (axisKind === "band" && traces.length > 0) {
		/*
      How far each band reaches, over each trace reaching into it.

      `floor + value` is the top of a segment. A stack takes the total.
    */
		const tops = new Map<string, number>();
		for (const trace of grouped) {
			if (trace.data.at !== "groups") continue;
			if (trace.data.geom !== "bar") continue;
			for (const bar of trace.data.bars) {
				const top = (bar.floor ?? 0) + bar.value;
				tops.set(bar.category, Math.max(tops.get(bar.category) ?? -Infinity, top));
			}
		}

		/* Each trace. A record geom names its band the way a reduction names its groups. */
		const ranked: string[] = [];
		const seen = new Set<string>();
		for (const trace of traces) {
			for (const category of categoriesOf(trace)) {
				if (seen.has(category)) continue;
				seen.add(category);
				ranked.push(category);
			}
		}

		/*
      A distribution has no single value to rank by and keeps its read order. A line and a running
      total read as a sequence. The sort is stable.
    */
		const running = grouped.some((trace) => "bars" in trace.data && trace.data.cumulative === true);
		/* A wiggle baseline walks the read order. The band keeps that order. */
		const wiggled = plot.layers.some((layer) => positionArgs(layer.position).offset === "wiggle");
		if (tops.size > 0 && !running && !wiggled)
			ranked.sort((a, b) => (tops.get(b) ?? -Infinity) - (tops.get(a) ?? -Infinity));

		categories.push(...ranked.slice(0, bandCap(plot)));
		hiddenCategories = ranked.length - categories.length;
	}

	if (axisKind === "band" && categories.length === 0 && xField) {
		return empty("No categories", `Nothing in these rows carries a value for ${xField.label}.`);
	}

	/* A binned bar reaches half a bin past its center. The domain covers the geom. */
	const horizontalExtent = (): [number, number] => {
		let lo = Infinity;
		let hi = -Infinity;
		const see = (value: number) => {
			if (!TRANSFORMS[xTransform].admits(value)) return;
			if (value < lo) lo = value;
			if (value > hi) hi = value;
		};
		for (const trace of traces) {
			for (const point of pointsOf(trace)) see(point.x);
			if (trace.data.geom === "bar" || trace.data.geom === "area" || trace.data.geom === "freqpoly") {
				const half = (trace.data.binWidth ?? 0) / 2;
				for (const bar of trace.data.bars) {
					if (bar.at == null) continue;
					see(bar.at - half);
					see(bar.at + half);
				}
			}
			/* A curve reaching past the data needs the whole grid, or the tails draw clipped. */
			if (trace.data.geom === "density") {
				for (const at of trace.data.curve.grid) see(at);
			}
			/* A band has no `LayerPoint`. Its readings hold the horizontal reach. */
			if (trace.data.geom === "ribbon") {
				for (const reading of trace.data.readings) {
					if (typeof reading.x === "number") see(reading.x);
				}
			}
			/* And a segment carries none either, with a reach that runs to its far end. */
			if (trace.data.geom === "segment") {
				for (const segment of trace.data.segments) {
					/* A pair inside a band names its category and takes no room on a value scale. */
					if (typeof segment.x !== "number" || typeof segment.xEnd !== "number") continue;
					see(segment.x);
					see(segment.xEnd);
				}
			}
		}
		return Number.isFinite(lo) ? [lo, hi] : [0, 1];
	};

	const xExtent = reaching(horizontalExtent(), plot.scales?.x?.include, xTransform);

	const xChrome = chromeOf(plot.scales?.x, metrics);
	const yChrome = chromeOf(plot.scales?.y, metrics);

	/*
    A grid's bands tile, where a bar's are set apart.

    Band padding puts air between two bars. A grid has none. The geometry decides this.
  */
	const tiles = traces.some((trace) => trace.data.at === "groups" && trace.data.geom === "heatmap");
	const bandPadding = tiles ? 0 : undefined;

	const x: AxisSpec =
		axisKind === "band" || !xField
			? {
					...xChrome,
					values: categories,
					names: plot.scales?.x?.labels,
					label: plot.scales?.x?.title ?? xField?.label,
					padding: bandPadding,
				}
			: {
					...xChrome,
					domain: copied(plot.scales?.x?.limits) ?? pad(xExtent[0], xExtent[1], xTransform, plot.scales?.x?.expand),
					transform: xTransform,
					...scaleOf(plot.scales?.x),
					...oobOf(plot.scales?.x),
					time: plot.scales?.x?.time ?? xField.timeScale,
					label: plot.scales?.x?.title ?? axisLabel(xField),
					tickStep: plot.scales?.x?.breakWidth,
					minorTicks: plot.scales?.x?.minorTicks,
					format: plot.scales?.x?.format ? tickFormatter(plot.scales.x.format, plot.scales.x.decimals) : undefined,
				};

	/*
    The measures a grid spreads across its horizontal band.

    A gate grid draws its measures across the top and the column's values down the side.
  */
	const spread = plot.layers.flatMap((series) => {
		if (series.kind !== "heatmap") return [];
		const bound = series.aes.dimensions;
		const ids = Array.isArray(bound) ? bound : bound ? [bound] : [];
		return ids.map((id) => fieldAt.get(id)).filter((field): field is PlotField => field != null);
	});

	/*
    Both axes name categories where a heatmap draws.

    The vertical axis takes the field bound to it. A spread grid takes the field bound to x.
  */
	const rowFieldOf = (series: LayerSpec) => {
		if (typeof series.aes.y === "string") return fieldAt.get(series.aes.y);
		const bound = series.aes.dimensions;
		const spreads = Array.isArray(bound) ? bound.length > 0 : bound != null;
		return spreads && typeof series.aes.x === "string" ? fieldAt.get(series.aes.x) : undefined;
	};

	const stackedField = traces.some((trace) => trace.data.at === "groups" && trace.data.geom === "heatmap")
		? plot.layers.map(rowFieldOf).find((field) => field != null)
		: undefined;

	/*
    Rows are capped like columns and ranked by what passes through them.

    Ranking by the rows behind each one keeps the populated end of the grid.
  */
	const weight = new Map<string, number>();
	for (const trace of traces) {
		if (trace.data.at !== "groups" || trace.data.geom !== "heatmap") continue;
		for (const cell of trace.data.cells) {
			weight.set(cell.y, (weight.get(cell.y) ?? 0) + cell.n);
		}
	}
	const stacked = [...weight]
		.sort((a, b) => b[1] - a[1])
		.slice(0, bandCap(plot))
		.map(([row]) => row);
	hiddenCategories += weight.size - stacked.length;

	/*
    Cells outside either cap are dropped.

    A band scale answers with nothing for a category it lacks, and the geom reads that as zero.
  */
	const drawn =
		stacked.length > 0
			? traces.map((trace) => {
					if (trace.data.at !== "groups" || trace.data.geom !== "heatmap") return trace;
					const rows = new Set(stacked);
					const columns = new Set(categories);
					const cells = trace.data.cells.filter((cell) => rows.has(cell.y) && columns.has(cell.x));
					return cells.length === trace.data.cells.length ? trace : {...trace, data: {...trace.data, cells}};
				})
			: traces;

	/*
    The author's order, resolved after the caps and before either band is written.

    Clustering rows a cap will drop wastes the quadratic term.
  */
	const ordered = orderBands(plot, categories, stacked, drawn, metrics);
	const reordered = ordered.reduced ? reduceGrids(drawn, ordered.reduced) : drawn;

	/* Only geoms that occupy a slot divide the band. A line or an area over the groups draws across them. */
	const slotted = reordered.filter(
		(trace) => trace.data.at === "groups" && trace.data.geom !== "line" && trace.data.geom !== "area",
	);

	const hasBars = traces.some((trace) => trace.data.geom === "bar");
	const y: AxisSpec =
		ordered.y.values.length > 0
			? {
					...yChrome,
					values: ordered.y.values,
					gaps: ordered.y.gaps,
					gapSize: metrics.gap,
					padding: bandPadding,
					names: plot.scales?.y?.labels,
					label: plot.scales?.y?.title ?? stackedField?.label,
				}
			: {
					...yChrome,
					domain:
						copied(plot.scales?.y?.limits) ??
						(grounded && !isLog(yTransform)
							? plot.scales?.y?.expand
								? pad(Math.min(0, leftExtent[0]), leftExtent[1], yTransform, plot.scales.y.expand)
								: [Math.min(0, leftExtent[0]), leftExtent[1] * 1.08 || 1]
							: pad(leftExtent[0], leftExtent[1], yTransform, plot.scales?.y?.expand)),
					transform: yTransform,
					...scaleOf(plot.scales?.y),
					...oobOf(plot.scales?.y),
					time: plot.scales?.y?.time ?? leftField?.timeScale,
					label:
						plot.scales?.y?.title ??
						(leftShares ? shareLabel(leftField) : axisLabel(leftField)) ??
						(hasBars ? "records" : undefined),
					tickStep: plot.scales?.y?.breakWidth,
					minorTicks: plot.scales?.y?.minorTicks,
					format: plot.scales?.y?.format ? tickFormatter(plot.scales.y.format, plot.scales.y.decimals) : undefined,
				};

	/* A permutation keeps the same labels and the margin is unmoved. A kmeans order renames them. */
	const xBand: AxisSpec = isBand(x)
		? {...x, values: ordered.x.values, gaps: ordered.x.gaps, gapSize: ordered.gapSize}
		: x;

	/*
    Whether the pair draws with its roles swapped, decided once here.

    Refused where no geom reads the shared pair. A parallel plot has an axis per measure.
  */
	const swapped = plot.coord === "flip" && !axisFree && drawn.some((trace) => drawsAxes(trace.data.geom));

	/*
    The two specs as the screen takes them.

    Above this line everything reads in the data's own terms. Below it everything draws.
  */
	const horizontal = swapped ? y : xBand;
	const upright = swapped ? xBand : y;
	/* A top side panel takes the room a vertical title captions from. The title turns along its rule. */
	const topSide = (plot.sides ?? []).some((panel) => panel.position === "top");
	const vertical: AxisSpec = topSide && upright.titleAlign == null ? {...upright, titleAlign: "center"} : upright;

	const rightDomain = rightExtent
		? (copied(plot.scales?.y2?.limits) ?? pad(rightExtent[0], rightExtent[1], rightTransform))
		: null;
	const rightAxis = rightDomain
		? {transform: rightTransform, ...scaleOf(plot.scales?.y2), ...oobOf(plot.scales?.y2)}
		: null;

	/* Direct labels apply to points. A reduction has no record to name. */
	const labeled = traces.map((trace) => {
		const rule = plot.layers.find((series) => series.id === trace.layerId)?.directLabels;
		const points = pointsOf(trace);
		if (!rule || points.length === 0) return {trace, indices: [] as number[], dropped: 0};
		const chosen = chooseLabels(points, rule.when);
		return {trace, indices: chosen.indices, dropped: chosen.dropped};
	});

	const labelRule = (() => {
		const withRule = plot.layers.find(
			(series) => series.directLabels && traces.some((trace) => trace.layerId === series.id),
		);
		const rule = withRule?.directLabels?.when;
		if (!rule || !xField) return null;
		const measure = traces.find((trace) => trace.layerId === withRule!.id)?.field?.label;
		if (rule.kind === "all") return "labeling all points";
		if (rule.kind === "top") {
			const on = rule.on === "x" ? xField.label : (measure ?? rule.on);
			return `labeling the ${rule.end === "high" ? "top" : "bottom"} ${rule.count} by ${on}`;
		}
		const on = rule.on === "x" ? xField.label : (measure ?? rule.on);
		return `labeling ${on} ${rule.op} ${rule.value}`;
	})();

	/*
    The declared tracks, resolved against the bands as drawn.

    After the caps and the order. `stackedField` is the vertical band's column and `xField` the
    horizontal one's.
  */
	/* Each row's own label to the centroid it draws under, where a kmeans order reduced a band. */
	const reducedTo = ordered.reduced ? new Map(ordered.reduced.of.map((one) => [one.of, one.to])) : undefined;

	const tracks = (plot.sides ?? []).flatMap((panel) => {
		if (panel.content.kind !== "track") return [];
		/* The edge is the screen and the grouping is the role. A transpose parts them. */
		const across = (panel.position === "top" || panel.position === "bottom") !== swapped;

		/* A band of measures has no rows behind it. The track reads their declarations. */
		if (across && spread.length > 0) {
			const overFields = trackOverFields({
				field: panel.content.field,
				axis: "x",
				categories,
				measures: spread,
				palette: panel.content.palette,
				pinned: pinned?.[panel.content.field],
				dropLevels: panel.content.dropLevels,
			});
			return overFields ? [overFields] : [];
		}

		const keyField = across ? xField : stackedField;
		if (!keyField) return [];
		const resolved = trackFor({
			field: panel.content.field,
			axis: across ? "x" : "y",
			/* The band as drawn. The axis beside the strip reads the same list. */
			categories: across ? ordered.x.values : ordered.y.values,
			alias: reducedTo && ordered.reduced?.along === (across ? "x" : "y") ? reducedTo : undefined,
			keyField: keyField.id,
			data,
			fieldAt,
			palette: panel.content.palette,
			pinned: pinned?.[panel.content.field],
			dropLevels: panel.content.dropLevels,
		});
		return resolved ? [resolved] : [];
	});

	/*
    The marginals, read off the points the geoms drew.

    A marginal states the distribution of the cloud in the figure. One walk per axis.
  */
	const readings = new Map<"x" | "y", number[]>();
	const marginals = (plot.sides ?? []).flatMap((panel): Marginal[] => {
		const wanted = panel.content.kind;
		if (wanted !== "histogram" && wanted !== "rug" && wanted !== "density") return [];
		/*
      The edge says where the panel draws and the role says what it reads.

      `axis` stays the screen one and the walk of the geoms reads the role behind it.
    */
		const axis = panel.position === "top" || panel.position === "bottom" ? "x" : "y";
		const role = swapped ? (axis === "x" ? "y" : "x") : axis;
		let values = readings.get(role);
		if (!values) {
			values = valuesAlong(reordered, role);
			readings.set(role, values);
		}
		if (values.length === 0) return [];
		if (wanted === "rug") return [{axis, kind: "rug", values}];
		if (wanted === "density") {
			/* Split where the panel asked and the color channel can answer, pooled otherwise. */
			const curves =
				panel.content.by === "color" ? valuesByLevel(reordered, role) : valuesByLevel(stripLevels(reordered), role);
			return curves.length === 0 ? [] : [{axis, kind: "density", values, curves}];
		}
		/* The scale the panel reads, after the transpose has decided which role runs across. */
		const along = axis === "x" ? horizontal : vertical;
		/* Cut in the axis's transformed space. The intervals are even where the reader looks. */
		const transform = isBand(along) ? "identity" : transformOf(along);
		return [{axis, kind: "histogram", values, ...marginalBins(values, panel.content.binwidth ?? "auto", transform)}];
	});

	/* The build's caps, joined by the ones the frame itself applies. */
	const ledger = [...omitted];
	omit(ledger, "categories", hiddenCategories);
	/* A bin along a transformed axis leaves out the readings the transform refuses. */
	const offBins = traces.reduce(
		(sum, trace) => sum + (trace.data.at === "groups" && "offScale" in trace.data ? (trace.data.offScale ?? 0) : 0),
		0,
	);
	omit(ledger, "off-log", placed.offLog + (isLog(xTransform) ? offBins : 0));
	omit(ledger, "off-root", placed.offRoot + (xTransform === "sqrt" ? offBins : 0));
	omit(ledger, "off-range", placed.offRange);
	omit(ledger, "floored", flooredCount(traces, yTransform));
	/* A reference past its axis draws nothing. The author wrote it, so the footer says where it went. */
	const ruleAxis = (spec: AxisSpec): RuleAxis | null => (isBand(spec) ? null : spec);
	omit(
		ledger,
		"references",
		reordered.reduce(
			(sum, trace) =>
				sum +
				("rules" in trace.data
					? trace.data.rules.filter((rule) => ruleSegment(rule, ruleAxis(xBand), ruleAxis(y)) == null).length
					: 0),
			0,
		),
	);
	omit(
		ledger,
		"labels",
		labeled.reduce((sum, entry) => sum + entry.dropped, 0),
	);

	return {
		status: "ready",
		traces: reordered,
		axisKind,
		xField,
		unbuilt,
		slotted,
		axisFree,
		x: horizontal,
		y: vertical,
		transposed: swapped,
		/* A stated range can leave a geom past the frame. The plot area holds it in. */
		clip: (axisKind === "continuous" && plot.scales?.x?.limits != null) || plot.scales?.y?.limits != null,
		margin: {
			top: 14,
			right: rightExtent ? 52 : 14,
			/* A vertical title moved along its rule takes a column; left above the axis it takes none. */
			bottom: roomFor(horizontal, "x", horizontal.label != null) + (horizontal.label != null ? 0 : TITLE_PAD / 2),
			/* The chrome of whichever options configure the vertical axis, which a transpose moves across. */
			left: roomFor(vertical, "y", vertical.label != null && (vertical.titleAlign ?? "end") !== "end"),
		},
		rightDomain,
		rightAxis,
		annotations: annotationLayers(plot.annotations ?? [], swapped),
		labeled,
		labelRule,
		clusterRefused: ordered.refused,
		clusterTrees: {x: ordered.x.clustered ?? null, y: ordered.y.clustered ?? null},
		tracks,
		marginals,
		omitted: ledger,
		legend: legendRows(reordered, plot.legend?.order),
		fieldAt,
		metrics,
	};
}

/**
 * Panels a facet draws.
 *
 * Twelve is where a small multiple stops reading at a tile's width. Chart-design rule 6 names it.
 */
export const FACET_CAP = 12;

/** The right-hand scale, built per render. It reads the plot area's height and the frame's `rightAxis`. */
export const rightScaleFor = (
	domain: [number, number] | null,
	innerHeight: number,
	axis?: Omit<LinearAxisSpec, "domain"> | null,
): Scale | null => (domain ? buildAxis({...axis, domain}, [innerHeight, 0], 5, "end").scale : null);

export interface FacetPanel {
	/** Value of the facet field, or the empty string where the plot draws one panel. */
	value: string;
	/** Rows behind the panel, which chart-design rule 6 asks be written under its title. */
	count: number;
	frame: ReadyFrame;
}

export type PlotPanels =
	| {
			status: "ready";
			panels: FacetPanel[];
			facetField?: PlotField;
			/** Panels the cap refused. */
			facetDropped: number;
	  }
	| {status: "empty"; title: string; reason: string};

const spanOver = (values: [number, number][]): [number, number] => [
	boundsOf(values.map((v) => v[0]))[0],
	boundsOf(values.map((v) => v[1]))[1],
];

/**
 * One domain across the panels.
 *
 * Two panels drawn at the same height would say the same thing about different numbers. There is
 * no option for free scales.
 */
function shareScales(
	panels: FacetPanel[],
	palette: Palettes,
	plot: ChartSpec,
	/* The author's orders. The union is a wider set than one panel resolved against. */
	orders?: {x?: BandOrder; y?: BandOrder},
): FacetPanel[] {
	if (panels.length < 2) return panels;
	const frames = panels.map((panel) => panel.frame);

	/*
    Color and size span the way position does.

    Each panel builds against its own rows. Spanned per trace id.
  */
	/* The extent. A stated range should not stand in for what the panels measured. */
	const colorSpans = spanById(frames, (trace) => trace.colorExtent);
	const sizeSpans = spanById(frames, (trace) => trace.sizeDomain);

	const yDomains = frames.map((frame) => ("domain" in frame.y ? frame.y.domain : null));
	const y = yDomains.every((domain) => domain != null) ? spanOver(yDomains as [number, number][]) : null;
	const rights = frames.map((frame) => frame.rightDomain).filter((d) => d != null);
	const rightDomain = rights.length > 0 ? spanOver(rights) : null;
	/* Every edge, not the right one alone. A panel reserving panel zero's room overruns its own. */
	const margin = {
		top: boundsOf(frames.map((f) => f.margin.top))[1],
		right: boundsOf(frames.map((f) => f.margin.right))[1],
		bottom: boundsOf(frames.map((f) => f.margin.bottom))[1],
		left: boundsOf(frames.map((f) => f.margin.left))[1],
	};

	/*
    Bands take the union in the panels' own order. A category holds one slot.

    Both axes. A grid bands both. Panel zero's order leads.
  */
	const unionOf = (read: (frame: ReadyFrame) => AxisSpec) => {
		const values: string[] = [];
		const seen = new Set<string>();
		for (const frame of frames) {
			const axis = read(frame);
			if (!isBand(axis)) continue;
			for (const value of axis.values) {
				if (seen.has(value)) continue;
				seen.add(value);
				values.push(value);
			}
		}
		return values;
	};

	/*
    A stated list is re-resolved against the union. No panel saw the whole set.

    Re-running the list over the union costs a filter. A cluster order cannot re-run here.
  */
	const aligned = (axis: AxisSpec, order: BandOrder | undefined, values: string[]) => {
		if (order?.kind !== "list") return {values, gaps: isBand(axis) ? axis.gaps : undefined};
		const out = orderBand(order, values, () => null);
		return {values: out.values, gaps: out.gaps};
	};

	const xDomains = frames.map((frame) => ("domain" in frame.x ? frame.x.domain : null));
	const x = xDomains.every((domain) => domain != null)
		? {...frames[0]!.x, domain: spanOver(xDomains as [number, number][])}
		: {
				...frames[0]!.x,
				...aligned(
					frames[0]!.x,
					orders?.x,
					unionOf((frame) => frame.x),
				),
			};

	const yBand = frames.every((frame) => isBand(frame.y))
		? {
				...frames[0]!.y,
				...aligned(
					frames[0]!.y,
					orders?.y,
					unionOf((frame) => frame.y),
				),
			}
		: null;

	const rescale = (trace: Trace): Trace => {
		let out = trace;
		const colorExtent = colorSpans.get(trace.id);
		const sizeDomain = sizeSpans.get(trace.id);
		if (colorExtent && trace.colorExtent) {
			/* Through the same helpers the build used. An author's center and cuts survive the span. */
			/* The trace's own map and options where the series named them. A span keeps its palette. */
			const options = rampOptionsFor(trace.data.geom, traceScale(plot.scales, plot.layers, trace));
			const maps = trace.sequential ? {...palette, sequential: trace.sequential} : palette;
			out = {
				...out,
				...colorScaleOf(colorExtent, options),
				ramp: valueRamp(colorExtent, maps, options),
			};
		}
		const data = out.data;
		if (
			sizeDomain &&
			trace.sizeDomain &&
			trace.sizeRadii &&
			data.at === "records" &&
			data.geom !== "parcoords" &&
			data.geom !== "radar" &&
			data.geom !== "ribbon" &&
			data.geom !== "range" &&
			data.geom !== "segment" &&
			"points" in data
		) {
			const [lo, hi] = sizeDomain;
			const radii = trace.sizeRadii;
			out = {
				...out,
				sizeDomain,
				data: {
					...data,
					points: data.points.map((point) =>
						point.sizeValue == null ? point : {...point, size: sizeRadius(point.sizeValue, lo, hi, radii)},
					),
				},
			};
		}
		return out;
	};

	return panels.map((panel) => ({
		...panel,
		frame: {
			...rewriteTraces(panel.frame, rescale),
			x: x as ReadyFrame["x"],
			y: y ? ({...panel.frame.y, domain: y} as ReadyFrame["y"]) : ((yBand as ReadyFrame["y"]) ?? panel.frame.y),
			rightDomain,
			margin,
		},
	}));
}

/** One span per trace id, across the panels that hold it. */
function spanById(
	frames: ReadyFrame[],
	read: (trace: Trace) => [number, number] | undefined,
): Map<string, [number, number]> {
	const seen = new Map<string, [number, number][]>();
	for (const frame of frames) {
		for (const trace of frame.traces) {
			const domain = read(trace);
			if (!domain) continue;
			const held = seen.get(trace.id);
			if (held) held.push(domain);
			else seen.set(trace.id, [domain]);
		}
	}
	return new Map([...seen].map(([id, domains]) => [id, spanOver(domains)]));
}

/** Rows under each value of the facet field, ranked by size. Empty where the plot draws one panel. */
export interface Partition {
	field?: PlotField;
	groups: [string, number[]][];
}

/**
 * Which rows belong to which panel.
 *
 * The expensive half, apart from the build. Re-cutting the rows into panels needs the facet
 * field or the table to change.
 */
export function partitionOf(plot: ChartSpec, data: PlotData): Partition {
	const by = plot.facet?.by;
	const field = by ? data.fields.find((candidate) => candidate.id === by) : undefined;
	if (!field) return {groups: []};
	return {
		field,
		groups: [...rowsByValue(data, field.id)].sort((a, b) => b[1].length - a[1].length),
	};
}

/**
 * The spec as far as the build reads it.
 *
 * Written as everything-but. `style.fill`, `style.color`, `updatedAt` and most of `scales.color`
 * come out. `scale` stays.
 */
export const shapeOf = (plot: ChartSpec): string =>
	JSON.stringify(
		{
			...plot,
			layers: plot.layers.map((series) => ({...series, style: buildStyle(series.style)})),
			scales: {...plot.scales, color: buildColorScale(plot.scales?.color), fill: buildColorScale(plot.scales?.fill)},
		},
		(key, value) => (key === "updatedAt" ? undefined : (value as unknown)),
	);

/** A series' style as the build reads it: everything but the paints laid over afterwards. */
function buildStyle(style?: LayerStyle): Omit<LayerStyle, "fill" | "color"> | undefined {
	if (!style) return undefined;
	const {fill: _interior, color: _edge, ...read} = style;
	return read;
}

/**
 * The color scale as the build reads it -- the z-score direction alone.
 *
 * Absent where that is all the author set. Written as everything-but.
 */
function buildColorScale(options?: ColorScale): Pick<ColorScale, "standardize"> | undefined {
	if (!options?.standardize) return undefined;
	return {standardize: options.standardize};
}

/**
 * What `paint` reads -- the colors the author picked and the ramp settings they dragged.
 *
 * The ramp goes in whole. A setting added to `ColorScale` reaches `paint` through the spread.
 */
export const colorsOf = (plot: ChartSpec): string =>
	[
		plot.layers.map((series) => `${series.id}:${geomColor(series.style, series.kind) ?? ""}`).join("|"),
		JSON.stringify(plot.scales?.color ?? null),
		JSON.stringify(plot.scales?.fill ?? null),
	].join("|");

/**
 * The color scale a trace's ramp closes on: the layer's own from the build, else the chart's current
 * one on the layer's paint aesthetic.
 */
function traceScale(
	scales: ChartScales | undefined,
	layers: readonly LayerSpec[],
	trace: Trace,
): ColorScale | undefined {
	if (trace.colorOptions) return trace.colorOptions;
	const layer = layers.find((one) => one.id === trace.layerId);
	return layer ? scales?.[paintAesthetic(layer)] : undefined;
}

/**
 * The author's colors laid over the palette's.
 *
 * This walks the traces. A series' own color reaches four places, and a scaled channel repaints
 * over `Trace.colorExtent`.
 */
export function paint(
	built: PlotPanels,
	series: readonly LayerSpec[],
	palettes: Palettes,
	scales?: ChartScales,
): PlotPanels {
	const picked = new Map(
		series.flatMap((one) => {
			const color = drawsOneColor(one) ? geomColor(one.style, one.kind) : undefined;
			return color ? [[one.id, color] as const] : [];
		}),
	);
	if (built.status === "empty") return built;
	const scaled = built.panels.some((panel) => panel.frame.traces.some((trace) => trace.colorExtent));
	if (picked.size === 0 && !scaled) return built;

	const recolor = (trace: Trace): Trace => {
		let out = trace;
		if (trace.colorExtent) {
			/* Read the way `shareScales` reads them. A recolor keeps a series' own map. */
			const options = rampOptionsFor(trace.data.geom, traceScale(scales, series, trace));
			const maps = trace.sequential ? {...palettes, sequential: trace.sequential} : palettes;
			out = {
				...out,
				colorDomain: colorDomainOf(trace.colorExtent, options),
				ramp: valueRamp(trace.colorExtent, maps, options),
			};
		}
		const color = picked.get(trace.layerId);
		if (!color) return out;
		return {
			...out,
			color: color,
			ramp: () => color,
			data:
				trace.data.geom === "sankey"
					? {...trace.data, links: trace.data.links.map((link) => ({...link, color: color}))}
					: trace.data,
		};
	};

	return {
		...built,
		panels: built.panels.map((panel) => ({...panel, frame: rewriteTraces(panel.frame, recolor)})),
	};
}

/**
 * A finished frame with its traces rewritten.
 *
 * A frame holds a trace in four places and a pass puts its rewrite back in all four.
 */
function rewriteTraces(frame: ReadyFrame, rewrite: (trace: Trace) => Trace): ReadyFrame {
	const traces = frame.traces.map(rewrite);
	const at = new Map(traces.map((trace) => [trace.id, trace]));

	return {
		...frame,
		traces,
		slotted: frame.slotted.map((trace) => at.get(trace.id) ?? trace),
		labeled: frame.labeled.map((entry) => ({...entry, trace: at.get(entry.trace.id) ?? entry.trace})),
		/* A row of an unsplit series is keyed by its trace. A rewrite reaches that kind alone. */
		legend: frame.legend.map((row) => {
			const trace = at.get(row.key) ?? traces.find((one) => one.grouped && one.layerId === row.key);
			return trace ? {...row, color: trace.color} : row;
		}),
	};
}

/** Lines a set of ranges kept, against the lines the build drew. */
export interface Kept {
	within: number;
	of: number;
}

/**
 * The build with the reader's ranges laid over it.
 *
 * A third pass beside `paint`. A dragged range changes which records draw.
 */
export function narrow(built: PlotPanels, ranges: AxisRanges): {panels: PlotPanels; kept: Kept | null} {
	if (built.status === "empty" || !anyRange(ranges)) return {panels: built, kept: null};

	let within = 0;
	let of = 0;

	const keep = (trace: Trace): Trace => {
		if (trace.data.at !== "records" || trace.data.geom !== "parcoords") return trace;
		const lines = keptLines(
			trace.data.lines,
			trace.data.axes.map((axis) => axis.id),
			ranges,
		);
		within += lines.length;
		of += trace.data.lines.length;
		return {...trace, data: {...trace.data, lines}};
	};

	const panels = built.panels.map((panel) => ({...panel, frame: rewriteTraces(panel.frame, keep)}));

	return {panels: {...built, panels}, kept: of > 0 ? {within, of} : null};
}

/**
 * The plot as one frame, or as a panel per value of the facet field.
 */
/**
 * The traces with their identity levels taken off. A marginal pools.
 *
 * A pooled density is the default. A point takes its category's index as its weight.
 */
const stripLevels = (traces: Trace[]): Trace[] =>
	traces.map((trace) => (trace.colorLevels ? {...trace, colorLevels: undefined} : trace));

/**
 * The categorical assignment a facet's panels share, off the whole table.
 *
 * Read once here and pinned onto each panel. A field the caller pinned is left alone.
 */
function facetAssignments(plot: ChartSpec, data: PlotData, pinned?: Assignments): Assignments | undefined {
	const fields = new Map(data.fields.map((field) => [field.id, field]));
	const shared: Assignments = {};

	for (const series of plot.layers) {
		const id = paintColumn(series);
		/* A measure runs a scale and `shareScales` already spans that; only identity needs an index. */
		if (!id || fields.get(id)?.numeric !== false) continue;
		if (pinned?.[id]) continue;

		const codes: Record<string, number> = {};
		let next = 0;
		for (const value of rowsByValue(data, id).keys()) {
			codes[value] = next;
			next += 1;
		}
		shared[id] = codes;
	}

	if (Object.keys(shared).length === 0) return pinned;
	return {...shared, ...pinned};
}

export function buildPanels(
	plot: ChartSpec,
	data: PlotData,
	{palettes: palette, partition, metrics = REGULAR, pinned}: BuildOptions & {partition: Partition},
): PlotPanels {
	const table = readOnce(data);
	if (!partition.field) {
		const frame = buildFrame(plot, table, {palettes: palette, metrics, pinned});
		return frame.status === "empty"
			? frame
			: {status: "ready", panels: [{value: "", count: data.rowCount, frame}], facetDropped: 0};
	}

	const panels: FacetPanel[] = [];
	let firstEmpty: {status: "empty"; title: string; reason: string} | null = null;
	let emptied = 0;
	const shared = facetAssignments(plot, data, pinned);

	for (const [value, rows] of partition.groups.slice(0, FACET_CAP)) {
		const frame = buildFrame(panelSpec(plot, partition.field.id, value), viewOf(table, rows), {
			palettes: palette,
			metrics,
			pinned: shared,
			facet: {field: partition.field, value},
		});
		// A panel with nothing in it is dropped. A blank one reads as a broken axis.
		if (frame.status === "empty") {
			firstEmpty ??= frame;
			emptied += 1;
		} else panels.push({value, count: rows.length, frame});
	}

	if (panels.length === 0) {
		return (
			firstEmpty ?? {
				status: "empty",
				title: "No panels",
				reason: `Nothing in these rows carries a value for ${partition.field.label}.`,
			}
		);
	}

	return {
		status: "ready",
		panels: shareScales(panels, palette, plot, {x: plot.scales?.x?.order, y: plot.scales?.y?.order}),
		facetField: partition.field,
		/* The cap's overflow and the groups whose rows drew nothing. The footer counts both. */
		facetDropped: Math.max(0, partition.groups.length - FACET_CAP) + emptied,
	};
}

/**
 * The spec one panel draws. A layer's rows naming the facet column keep that panel's rows.
 *
 * Rows without it repeat in each panel, as in ggplot.
 */
function panelSpec(plot: ChartSpec, facet: string, value: string): ChartSpec {
	if (!plot.layers.some((series) => series.data?.some((row) => facet in row))) return plot;
	return {
		...plot,
		layers: plot.layers.map((series) =>
			series.data?.some((row) => facet in row)
				? {...series, data: series.data.filter((row) => row[facet] != null && String(row[facet]) === value)}
				: series,
		),
	};
}

/**
 * Counts of the curves a fit drew and the ones it failed on.
 *
 * A failed curve leaves no geom on the chart. Both counts are stated.
 */
export function fitNote(fitted: FitState, all: Fit[]): string[] {
	if (fitted.problem) return [fitted.problem];
	if (fitted.pending) return ["fitting"];
	if (all.length === 0) return [];

	const ok = all.filter((fit) => fit.success).length;
	const dropped = [...fitted.byLayer.values()].reduce((sum, entry) => sum + entry.dropped, 0);

	// Counted over the plot. The areas compound on one frame.
	const banded = all.length > BAND_LIMIT && all.some((fit) => fit.band);

	return [
		all.length === 1
			? ok === 1
				? `fit r² ${(all[0]!.r2 ?? 0).toFixed(3)}`
				: `fit failed: ${all[0]!.reason ?? "unknown"}`
			: `${ok.toLocaleString()} of ${all.length.toLocaleString()} curves fitted`,
		...(dropped > 0 ? [`${dropped.toLocaleString()} groups past the cap`] : []),
		// A band that was computed and not drawn should not read as a band that was not asked for.
		...(banded ? [`bands hidden above ${BAND_LIMIT} curves`] : []),
	];
}

/**
 * The footer's one sentence.
 *
 * Only what a reader would otherwise get wrong. `held` is what the reader took out and leads the
 * list.
 */
/** What the footer reads beside the frame. */
export interface FooterOptions {
	/** The fits the fitter answered, and whether any are pending. */
	fitted: FitState;
	/** Facet levels past the cap, which the sentence counts. */
	facetDropped?: number;
	/** What the reader took out, which leads the sentence. */
	held?: string[];
	/** What a geom drew in place of the one the spec asked for. */
	substituted?: Substitution;
}

export function footerOf(
	frame: ReadyFrame,
	{fitted, facetDropped = 0, held = [], substituted}: FooterOptions,
): string | undefined {
	/*
    Rule 7's third row, stated. This line appears where the caller substituted.

    Nothing appears where the caller drew raw points past the switch. The critic reports that.
  */
	const substitution = substituted
		? [
				`${substituted.rows.toLocaleString()} records drawn as a ${substituted.drew} of ${substituted.cells.toLocaleString()} cells`,
			]
		: [];

	/*
    Which interval the whiskers stand for, named once for the figure.

    Read off the traces. Two series disagreeing both get named.
  */
	const intervals = [
		...new Set(
			frame.traces.flatMap((trace) =>
				trace.data.at === "groups" && "error" in trace.data && trace.data.error ? [trace.data.error] : [],
			),
		),
	].map((kind) => (kind === "sem" ? "whiskers are one standard error" : "whiskers are one standard deviation"));

	/*
    The bandwidth a kernel smoothed at, named once for the figure.

    No reader recovers the number from the curve. One clause whether the figure holds one kernel
    or twenty.
  */
	const smoothing = [
		...new Set(
			frame.traces.flatMap((trace) => {
				if (trace.data.at !== "groups") return [];
				if (trace.data.geom === "density") return [trace.data.curve.bandwidth];
				if (trace.data.geom === "violin") return trace.data.violins.map((violin) => violin.bandwidth);
				return [];
			}),
		),
	]
		.filter((width) => width > 0)
		.sort((a, b) => a - b);
	const round = (width: number) => Number(width.toPrecision(3));
	const bandwidth =
		smoothing.length === 0
			? []
			: smoothing.length === 1
				? [`smoothed at a bandwidth of ${round(smoothing[0]!)}`]
				: [`smoothed at bandwidths of ${round(smoothing[0]!)} to ${round(smoothing[smoothing.length - 1]!)}`];

	/*
    The one cap the frame lacks, joined to the ledger it has.

    A facet's dropped panels reach here as an argument. `buildLayers` records the replicate and
    flow caps itself.
  */
	const ledger = [...frame.omitted];
	omit(ledger, "panels", facetDropped);

	/*
    Walked in the order the wording table declares. Where a clause falls is that table's business.
  */
	const counted = OMITTED_KINDS.flatMap((of) => {
		const count = omittedCount(ledger, of);
		return count > 0 ? [omissionLine(of, count)] : [];
	});

	return (
		[
			...held,
			...intervals,
			...bandwidth,
			...substitution,
			...counted,
			...(frame.labelRule ? ["overlapping labels hidden"] : []),
			...(frame.unbuilt.length > 0 ? [`${frame.unbuilt.join(" and ")} unknown to this version`] : []),
			...fitNote(fitted, drawnFits(frame.traces, fitted)),
		].join(", ") || undefined
	);
}
