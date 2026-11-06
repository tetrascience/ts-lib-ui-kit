/**
 * `Viz`: the one component a caller renders, drawing whatever a spec asked for.
 *
 * A figure is a spec and this is what draws it, so the kinds cannot drift apart: `plot()` authors
 * the chain and the geoms come off the grammar table, and there is no second code path to disagree
 * with the first. The pipeline is `toPlotData`, `buildPanels`, the geom for each layer's geometry,
 * wrapped in the figure chrome, legend and tooltip.
 *
 * The component is also the consumer the grammar decisions were missing. It measures its own panel
 * and passes `sizingFor` through, runs the critic on each render and hands findings to
 * `onCritique`, sends override admissions and the build's caveats through `footerOf`, and applies
 * chart-design rule 7's third row where a scatter's count crosses the switch.
 */

import {useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode} from "react";

import {
	bandsUnder,
	binPoints,
	axisLabel,
	breakCount,
	buildPanels,
	colorsOf,
	critique,
	densityCells,
	densityGrid,
	placePoints,
	fitRequestsOver,
	fitsFor,
	drawnFits,
	footerOf,
	narrow,
	numberOf,
	GROWN_CAP,
	plotArea,
	zoomedAxes,
	BAND_LIMIT,
	FACET_CAP,
	LIGHT_THEME,
	metricsFor,
	onDarkPaper,
	overrideNotes,
	paint,
	partitionOf,
	palettesFor,
	tooltipRows,
	REGULAR,
	tooltipTitle,
	transformOf,
	rgbSnapshot,
	sameSubstitution,
	shapeOf,
	sideRoom,
	fixedHeight,
	type Edges,
	tickFormatter,
	trackFill,
	trackRamp,
	toPlotData,
	treatmentOf,
	type ChartSpec,
	type FieldOverride,
	type FigureSet,
	type Finding,
	type Selected,
	type VizData,
	type FacetPanel,
	type Fitter,
	type FrameChildProps,
	selectedOf,
	layerScale,
	type LayerHit,
	type AxisRanges,
	type Bin2dOptions,
	type LayerStyle,
	type Metrics,
	type PlotData,
	type PlotField,
	type PlotPoint,
	type Palettes,
	type ReadyFrame,
	type Brushed,
	type BrushShape,
	type Rgb,
	type SideChildProps,
	type Substitution,
	type ThemeSnapshot,
	type AxisSpec,
	type LinearAxisSpec,
	type RuleAxis,
	type Trace,
} from "../core/internal.js";
import {Figure} from "./Figure.js";
import {Frame} from "./Frame.js";
import {BrushLayer} from "./BrushLayer.js";
import {GlPoints} from "./gl/GlPoints.js";
import {useSharedRenderer} from "./gl/context.js";
import {useVizTheme} from "./theme.js";
import {SeriesLegend} from "./SeriesLegend.js";
import {SizeLegend} from "./SizeLegend.js";
import {MarkLegend} from "./MarkLegend.js";
import {ColorLegend} from "./ColorLegend.js";
import {Points3d} from "./geoms/Points3d.js";
import {Surface} from "./geoms/Surface.js";
import {Volume} from "./geoms/Volume.js";
import {TooltipCard, TooltipLayer, type TooltipRow} from "./Tooltip.js";
import {Box} from "./geoms/Box.js";
import {Bars} from "./geoms/Bars.js";
import {Hexbin} from "./geoms/Hexbin.js";
import {Heatmap} from "./geoms/Heatmap.js";
import {Contour} from "./geoms/Contour.js";
import {Line} from "./geoms/Line.js";
import {Points, type PointHit} from "./geoms/Points.js";
import {DendrogramPanel} from "./sides/DendrogramPanel.js";
import {TrackPanel} from "./sides/TrackPanel.js";
import {HistogramPanel} from "./sides/HistogramPanel.js";
import {DensityPanel} from "./sides/DensityPanel.js";
import {RugPanel} from "./sides/RugPanel.js";
import {FitCurve} from "./geoms/FitCurve.js";
import {Violin} from "./geoms/Violin.js";
import {Area} from "./geoms/Area.js";
import {DensityCurve} from "./geoms/DensityCurve.js";
import {Freqpoly} from "./geoms/Freqpoly.js";
import {Interval} from "./geoms/Interval.js";
import {Range} from "./geoms/Range.js";
import {Segment} from "./geoms/Segment.js";
import {Rule} from "./geoms/Rule.js";
import {Text} from "./geoms/Text.js";
import {Parallel} from "./geoms/Parallel.js";
import {Radar} from "./geoms/Radar.js";
import {Waterfall} from "./geoms/Waterfall.js";
import {Sankey} from "./geoms/Sankey.js";
import {Chord} from "./geoms/Chord.js";
import {Ideogram} from "./geoms/Ideogram.js";
import {Treemap} from "./geoms/Treemap.js";
import {Icicle} from "./geoms/Icicle.js";
import {Sunburst} from "./geoms/Sunburst.js";
import {Pie} from "./geoms/Pie.js";
import {Gauge} from "./geoms/Gauge.js";
import {useFits} from "./useFits.js";
import {useZoom} from "./useZoom.js";
import {exportPng, exportSvg} from "./export.js";
import {
	COLORBLIND,
	download,
	dragsOf,
	facetFields,
	fileName,
	paletteOptions,
	Toolbar,
	viewOf,
	viewPalettes,
	viewSpec,
	type ToolbarOptions,
	type ToolbarView,
} from "./Toolbar.js";
/** Height a chart takes when the caller names none. */
const DEFAULT_HEIGHT = 320;

/** Widest a chart guesses itself before the observer reports, so the first paint is not a sliver. */
const UNMEASURED_WIDTH = 640;

/** Gap between facet panels, and the narrowest panel worth cutting a column for. */
const FACET_GAP = 16;
const FACET_MIN = 260;

/** A facet strip's height, its type and its padding, and the axis title row under the grid, gap included. */
const STRIP_HEIGHT = 22;
const SHARED_TITLE_HEIGHT = 20;

/** Pointer travel that makes a press a drag and not a click, in pixels. The turn, the pan and the brush read 3. */
const DRAG_FLOOR = 3;

/**
 * The axis a frame draws where the geoms position themselves.
 *
 * A cube runs three scales in projection and a treemap positions by nesting, so a pair of flat
 * rules around either one measures nothing. A band with no categories draws no ticks and no rule,
 * and the margin gives the room back to the geoms.
 */
const BARE_AXIS: AxisSpec = {values: []};

const NO_VIEW: ToolbarView = {};
const NO_TOOLS: ToolbarOptions["items"] = [];

const WHOLE_PANEL = {top: 8, right: 8, bottom: 8, left: 8};

/**
 * The panel's own width, reported by a ResizeObserver for `sizingFor` to read.
 *
 * The holder is a callback ref. A holder moved to another element gets measured there.
 */
function useMeasuredWidth(): {
	holder: (element: HTMLDivElement | null) => void;
	element: HTMLDivElement | null;
	width: number;
} {
	const [element, holder] = useState<HTMLDivElement | null>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		if (!element) return;
		setWidth(element.getBoundingClientRect().width);
		// jsdom has no observer; the chart draws at the fallback width there, which the tests accept.
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			const box = entries[0]?.contentRect;
			if (box) setWidth(box.width);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [element]);

	return {holder, element, width};
}

/**
 * The plot area a stated band size asks for, in pixels, or null where the figure fills its container.
 *
 * Reads the distinct values off the table for each banded axis the author gave a size, which is what
 * `partitionOf` already does to cut panels and what the frame will do again to build its bands. Three
 * walks of one column is cheap beside the alternative, which is building the figure once to find out
 * how big it should have been.
 *
 * An axis with no stated size keeps whatever the container gave it, so a grid can fix its rows and
 * let its columns breathe.
 */
export function contentExtent(spec: ChartSpec, data: PlotData): {width: number | null; height: number | null} | null {
	const bound = (channel: "x" | "y") =>
		spec.layers.map((series) => series.aes[channel]).find((id) => typeof id === "string") as string | undefined;

	const along = (channel: "x" | "y") => {
		const axis = spec.scales?.[channel];
		const size = axis?.bandSize;
		const id = bound(channel);
		if (!size || !id) return null;
		const seen = new Set<string>();
		for (let row = 0; row < data.rowCount; row += 1) {
			const value = data.text(row, id);
			if (value != null) seen.add(value);
		}
		if (seen.size === 0) return null;

		/*
      The bands the axis will actually hold, which is not always the distinct values in the column.

      A kmeans order draws its centroids, so eight of them over four hundred rows want eight bands of
      room. And the frame caps a grown band, so asking for room for five thousand rows when a thousand
      draw would reserve a column of empty page.
    */
		const bands = Math.min(bandsUnder(axis.order, seen.size), GROWN_CAP);

		/*
      Breaks are room, so the sum pays for them.

      The gap pixel is the regular column's, since the metrics are resolved from this answer and
      cannot be read before it. A break is a handful of pixels and the sizing breakpoints are hundreds
      apart, so the estimate reaches the same class the real one does, and the band scale spends
      whatever the frame settles on.
    */
		return bands * size + breakCount(axis.order, bands) * REGULAR.gap;
	};

	const width = along("x");
	const height = along("y");
	return width == null && height == null ? null : {width, height};
}

/** Where the pointer sits, and what the readout says there. */
interface Hover {
	panel: number;
	at: {x: number; y: number};
	title?: string;
	rows: TooltipRow[];
	note?: string;
}

/** The hover, held outside React state. A pointer move re-renders the card and nothing under it. */
interface HoverStore {
	get: () => Hover | null;
	set: (hover: Hover | null) => void;
	subscribe: (listener: () => void) => () => void;
}

function hoverStore(): HoverStore {
	let held: Hover | null = null;
	const listeners = new Set<() => void>();
	return {
		get: () => held,
		set: (hover) => {
			held = hover;
			for (const listener of listeners) listener();
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

/** The card over one panel, the one subtree a hover renders. */
function PanelTooltip({
	hovers,
	panel,
	bounds,
}: {
	hovers: HoverStore;
	panel: number;
	bounds: {width: number; height: number};
}) {
	const hover = useSyncExternalStore(hovers.subscribe, hovers.get, hovers.get);
	return hover && hover.panel === panel ? (
		<TooltipLayer at={hover.at} bounds={bounds}>
			<TooltipCard title={hover.title} rows={hover.rows} note={hover.note} />
		</TooltipLayer>
	) : null;
}

interface PanelContext {
	spec: ChartSpec;
	data: PlotData;
	palettes: Palettes;
	panel: number;
	xField?: PlotField;
	fieldAt: Map<string, PlotField>;
	/**
	 * Value-scale domains, where both axes run one. Null under a band, which no density can bin.
	 *
	 * `affine` where both map straight to pixels, untransformed and unreversed, so a density bins in data units.
	 */
	domains: {x: [number, number]; y: [number, number]; affine: boolean} | null;
	/** The live token values where the chart sits, for the GL path's colors. */
	theme: ThemeSnapshot | null;
	onHover: (hover: Hover | null) => void;
	/** A geom clicked. Absent where the figure's author took no selection callback. */
	onSelect?: (hit: LayerHit) => void;
	onSubstitute: (panel: number, substituted: Substitution | null) => void;
	/** Whether the frame drew its shared pair with the roles swapped, so the band geoms agree with it. */
	transposed: boolean;
	/** The data's two continuous axes as drawn, zoom included, for a reference line. A band axis is null beside its categories. */
	ruleAxes: {x: RuleAxis | null; y: RuleAxis | null; xBand?: readonly string[]; yBand?: readonly string[]};
	/** Ranges a reader dragged on the parallel plot's rules, and where a new one is reported. */
	ranges?: AxisRanges;
	onRanges?: (next: AxisRanges) => void;
}

/**
 * One hit, reported as the card a reader sees.
 *
 * `LayerHit` is the union a hover collapses to, and `tooltipTitle` and `tooltipRows` are what turn
 * one into a name and a set of rows. Holding the translation here is what stops a branch from
 * building a card by hand and leaving the name off it, which is a readout of bare numbers with
 * nothing saying what they belong to.
 *
 * The pixel is the one the geom reported beside its datum, where the card sits.
 */
function reportHit(ctx: PanelContext, found: {hit: LayerHit; at: {x: number; y: number}} | null | undefined): void {
	if (!found) {
		ctx.onHover(null);
		return;
	}
	ctx.onHover({
		panel: ctx.panel,
		at: found.at,
		title: tooltipTitle(found.hit),
		rows: tooltipRows(found.hit, {plot: ctx.spec, data: ctx.data, xField: ctx.xField, fieldAt: ctx.fieldAt}),
	});
}

/**
 * Rule 7's third row on the GPU: the records binned at device-pixel resolution, drawn as one
 * opaque cell per pixel through the shared GL layer.
 *
 * Resolution is the thing this treatment refuses to lose, so the grid is one cell per device
 * pixel and nothing visual is coarser than the screen. The colors come off the live theme:
 * paper to ink by log density, which is what makes the layer follow a theme flip the way the SVG
 * geoms do for free. That is the wiring decision 18 was owed: `useVizTheme` reads the tokens,
 * `rgbSnapshot` packs them, and the GL buffers repack where a value moved.
 */
function DensityScatter({
	points,
	x,
	y,
	width,
	height,
	transposed,
	ctx,
}: {
	points: PlotPoint[];
	x: (value: number | string) => number;
	y: (value: number | string) => number;
	width: number;
	height: number;
	transposed: boolean;
	ctx: PanelContext;
}) {
	const dpr = (typeof window === "undefined" ? 1 : window.devicePixelRatio) || 1;

	/* The plot area in pixels, rising from its foot. The GPU draws the cells against it. */
	const box = useMemo(() => ({x: [0, width] as [number, number], y: [0, height] as [number, number]}), [width, height]);

	/* The readings as drawn, across then up, jitter folded in. Packed once per table and read on each zoom. */
	const columns = useMemo(() => {
		const across = new Float64Array(points.length);
		const up = new Float64Array(points.length);
		for (let at = 0; at < points.length; at += 1) {
			const point = points[at]!;
			const px = point.x + (point.dx ?? 0);
			const py = point.y + (point.dy ?? 0);
			across[at] = transposed ? py : px;
			up[at] = transposed ? px : py;
		}
		return {across, up};
	}, [points, transposed]);

	/* The window in data units where both axes map straight to pixels. A transformed or reversed axis bins as drawn. */
	const affine = ctx.domains?.affine ? ctx.domains : null;
	const domain = useMemo(
		() => (affine ? {x: affine.x, y: affine.y} : box),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- the four numbers are the window
		[affine?.x[0], affine?.x[1], affine?.y[0], affine?.y[1], box],
	);

	const cells = useMemo(() => {
		const grid = densityGrid(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
		if (domain !== box) {
			binPoints(grid, columns.across, columns.up, domain.x, domain.y);
			return densityCells(grid, domain.x, domain.y);
		}
		const placed = placePoints(points, x, y, {transposed});
		binPoints(
			grid,
			placed.map((at) => at.x),
			placed.map((at) => height - at.y),
			box.x,
			box.y,
		);
		return densityCells(grid, box.x, box.y);
	}, [points, columns, domain, x, y, transposed, box, width, height, dpr]);

	const glPoints = useMemo(() => {
		const out: PlotPoint[] = new Array(cells.cells);
		for (let at = 0; at < cells.cells; at += 1) {
			out[at] = {x: cells.xs[at]!, y: cells.ys[at]!, weight: cells.weight[at]!};
		}
		return out;
	}, [cells]);

	const ramp = useMemo(() => {
		const packed = rgbSnapshot(ctx.theme ?? LIGHT_THEME);
		const paper = packed["--viz-paper"];
		const ink = packed["--viz-ink"];
		return (weight: number): Rgb => {
			const t = 0.2 + 0.8 * Math.min(1, Math.max(0, weight));
			return [
				paper[0] + (ink[0] - paper[0]) * t,
				paper[1] + (ink[1] - paper[1]) * t,
				paper[2] + (ink[2] - paper[2]) * t,
			];
		};
	}, [ctx.theme]);

	const {onSubstitute, panel} = ctx;
	useEffect(() => {
		onSubstitute(panel, {drew: "density grid", cells: cells.cells, rows: points.length});
	}, [onSubstitute, panel, cells, points.length]);

	return (
		<GlPoints
			points={glPoints}
			x={x}
			y={y}
			xDomain={domain.x}
			yDomain={domain.y}
			width={width}
			height={height}
			ramp={ramp}
			radius={0.5 / dpr}
			opacity={1}
		/>
	);
}

/** The series a trace came from holds how its geoms are drawn, apart from what they encode. */
const styleOf = (ctx: PanelContext, trace: Trace): LayerStyle | undefined =>
	ctx.spec.layers.find((series) => series.id === trace.layerId)?.style;

/**
 * The lattice parameters the same series stated, for a geom that bins in two dimensions.
 *
 * A series stating none of them comes back absent, and the geom keeps the pixel radius it sizes its
 * cells from.
 */
const latticeOf = (ctx: PanelContext, trace: Trace): Bin2dOptions | undefined => {
	const series = ctx.spec.layers.find((held) => held.id === trace.layerId);
	const {binwidth, bins, center, boundary, closed, drop} = series?.statParams ?? {};
	const stated: Bin2dOptions = {bins, center, boundary, closed, drop};
	if (binwidth == null && Object.values(stated).every((value) => value == null)) return undefined;
	return {...stated, ...(binwidth != null ? {binwidth} : {})};
};

/**
 * What the grid writes inside its cells, resolved to a formatter and a type size.
 *
 * The format falls back to the color scale's, so a figure that stated its measure's shape once has
 * the cells, the legend and the readout agreeing without saying it twice. The type size falls back
 * to the panel's axis size, which is what ADR 0011 derives from the panel's own width.
 */
function numbersOf(ctx: PanelContext, trace: Trace, metrics: Metrics) {
	const layer = ctx.spec.layers.find((series) => series.id === trace.layerId);
	const asked = layer?.numbers;
	if (!layer || !asked) return undefined;
	const scale = layerScale(ctx.spec, layer);
	const cut = asked.when;
	return {
		format: tickFormatter(asked.format ?? scale?.format, asked.decimals ?? scale?.decimals),
		wanted: cut ? (value: number) => (cut.op === "above" ? value > cut.value : value < cut.value) : undefined,
		color: asked.color,
		fontSize: asked.fontSize ?? metrics.axis,
	};
}

/**
 * A scatter trace under chart-design rule 7.
 *
 * One geom per record to `FADE_ABOVE`, smaller and translucent to `GL_ABOVE`, and a density geom
 * above that, because a reader misjudges an overplotted block however fast it draws. What stood in
 * is reported upward, so `footerOf` states the substitution to the reader instead of leaving them
 * to think each hexagon is a record.
 */
function ScatterTrace({
	trace,
	points,
	x,
	y,
	width,
	height,
	radius,
	ctx,
	transposed = false,
	step,
}: {
	transposed?: boolean;
	/** Distance between two neighboring band centers on the category axis, in pixels. */
	step: number;
	trace: Trace;
	points: PointHit["datum"][];
	x: (value: number | string) => number;
	y: (value: number | string) => number;
	width: number;
	height: number;
	radius: number;
	ctx: PanelContext;
}) {
	const treatment = treatmentOf(points.length);
	const style = styleOf(ctx, trace);

	const {onSubstitute, panel} = ctx;
	useEffect(() => {
		if (treatment !== "binned") onSubstitute(panel, null);
	}, [treatment, onSubstitute, panel]);

	const reportPoint = (hit: PointHit | null) => reportHit(ctx, hit && {hit: {kind: "point", trace, hit}, at: hit.at});

	/*
	  The GPU draws the density grid where it can. Without WebGL2, or under a band axis a grid
	  cannot bin, the hexbin is the treatment: coarser cells, but the same rule and the same footer.

	  The renderer arrives after mount, so the first render draws the hexbin whichever side of a
	  hydration boundary it runs on and the grid takes over once there is something to draw it with.
	*/
	const gl = useSharedRenderer() != null;
	if (treatment === "binned" && gl && ctx.domains) {
		return (
			<DensityScatter points={points} x={x} y={y} width={width} height={height} transposed={transposed} ctx={ctx} />
		);
	}

	if (treatment === "binned") {
		return (
			<Hexbin
				points={points}
				x={x}
				y={y}
				mode="binned"
				tiling={style?.tiling}
				bin={latticeOf(ctx, trace)}
				ramp={trace.sequential ?? ctx.palettes.sequential}
				width={width}
				height={height}
				onBins={(cells) => onSubstitute(panel, {drew: "hexbin", cells, rows: points.length})}
				onHover={(bin) =>
					ctx.onHover(
						bin
							? {
									panel: ctx.panel,
									at: bin.at,
									rows: [{label: "records", value: bin.datum.count.toLocaleString()}],
									note: "hexagonal density; individual records are not hoverable",
								}
							: null,
					)
				}
			/>
		);
	}

	return (
		<Points
			points={points}
			x={x}
			y={y}
			transposed={transposed}
			step={step}
			faded={treatment === "faded"}
			ramp={trace.ramp}
			radius={treatment === "faded" ? undefined : (style?.size ?? radius)}
			opacity={style?.alpha}
			shape={style?.shape}
			hollow={style?.hollow}
			halo={style?.halo}
			width={width}
			height={height}
			onHover={reportPoint}
			onSelect={ctx.onSelect ? (hit) => ctx.onSelect?.({kind: "point", trace, hit}) : undefined}
		/>
	);
}

/** The geom a trace draws, picked off the payload the layer engine resolved. */
function TraceGeoms({trace, child, ctx}: {trace: Trace; child: FrameChildProps; ctx: PanelContext}) {
	const {x, y, xBand, width, height, metrics} = child;
	/* Which way round the frame drew, and the slot on whichever axis carries the categories. */
	const transposed = ctx.transposed;
	const band = transposed ? child.yBand : xBand;
	const style = styleOf(ctx, trace);

	const data = trace.data;

	if (data.at === "records") {
		if (data.geom === "point") {
			return (
				<ScatterTrace
					trace={trace}
					points={data.points}
					x={x}
					y={y}
					transposed={transposed}
					step={transposed ? child.yStep : child.xStep}
					width={width}
					height={height}
					radius={metrics.pointRadius}
					ctx={ctx}
				/>
			);
		}
		if (data.geom === "point3d") {
			return (
				<Points3d
					points={data.points}
					xDomain={data.xDomain}
					yDomain={data.yDomain}
					zDomain={data.zDomain}
					width={width}
					height={height}
					ramp={trace.ramp}
					radius={style?.size ?? metrics.pointRadius}
					panes={style?.panes}
					theme={ctx.theme}
					labels={{
						x: axisLabel(ctx.xField) ?? "X",
						y: axisLabel(trace.field) ?? "Y",
						z: axisLabel(data.zField) ?? data.zField.label,
					}}
					onHover={(hit) => reportHit(ctx, hit && {hit: {kind: "cube", trace, hit}, at: hit.at})}
					onSelect={ctx.onSelect ? (hit) => ctx.onSelect?.({kind: "cube", trace, hit}) : undefined}
				/>
			);
		}
		if (data.geom === "line") {
			return (
				<Line
					points={data.points}
					x={x}
					y={y}
					color={trace.color}
					step={style?.step}
					lineWidth={style?.linewidth}
					opacity={style?.alpha}
					/* A bound dash split the series, so each run draws the pattern its own level was given. */
					dash={trace.linetypeChannel?.at ?? style?.linetype}
				/>
			);
		}
		if (data.geom === "parcoords") {
			return (
				<Parallel
					axes={data.axes}
					lines={data.lines}
					width={width}
					height={height}
					ramp={trace.ramp}
					color={trace.color}
					opacity={style?.alpha}
					ranges={ctx.ranges}
					onRanges={ctx.onRanges}
					onHover={(found) =>
						reportHit(ctx, found && {hit: {kind: "record", trace, line: found.datum, at: found.at}, at: found.at})
					}
					onSelect={
						ctx.onSelect
							? (found) => ctx.onSelect?.({kind: "record", trace, line: found.datum, at: found.at})
							: undefined
					}
				/>
			);
		}
		/*
      The same rules turned round a center, so the payload is the parallel plot's and the geom differs.

      No brush reaches it. A range dragged down a flat rule reads as a span of that measure, and the
      same drag along a spoke crosses the polygons of every record between the two, so the gesture
      the parallel plot offers has no reading here.
    */
		if (data.geom === "radar") {
			return (
				<Radar
					axes={data.axes}
					lines={data.lines}
					width={width}
					height={height}
					ramp={trace.ramp}
					color={trace.color}
					fill={style?.fill}
					opacity={style?.alpha}
					fontSize={metrics.axis}
					onHover={(found) =>
						reportHit(ctx, found && {hit: {kind: "record", trace, line: found.datum, at: found.at}, at: found.at})
					}
					onSelect={
						ctx.onSelect
							? (found) => ctx.onSelect?.({kind: "record", trace, line: found.datum, at: found.at})
							: undefined
					}
				/>
			);
		}
		if (data.geom === "hex") {
			return (
				<Hexbin
					points={data.points}
					x={x}
					y={y}
					mode="binned"
					tiling={style?.tiling}
					/* An empty lattice takes thirty cells per axis, stat_bin_hex's default. */
					bin={latticeOf(ctx, trace) ?? {}}
					ramp={trace.sequential ?? ctx.palettes.sequential}
					fill={style?.fill}
					stroke={style?.color}
					lineWidth={style?.linewidth}
					opacity={style?.alpha}
				/>
			);
		}
		if (data.geom === "contour") {
			return (
				<Contour
					points={data.points}
					x={x}
					y={y}
					width={width}
					height={height}
					ramp={trace.sequential ?? ctx.palettes.sequential}
					adjust={data.adjust}
					grid={data.grid}
					levelRamp={trace.ramp}
					fill={style?.fill}
					stroke={style?.color}
					opacity={style?.alpha}
				/>
			);
		}
		/* A mark per reading, where the band beside it closes one region over all of them. */
		if (data.geom === "range") {
			return (
				<Range
					points={data.readings}
					x={x}
					y={y}
					color={trace.color}
					fill={style?.fill}
					glyph={data.glyph}
					thickness={style?.thickness}
					opacity={style?.alpha}
					lineWidth={style?.linewidth}
				/>
			);
		}
		if (data.geom === "ribbon") {
			return (
				<Interval
					points={data.readings}
					x={x}
					y={y}
					color={trace.color}
					stroke={style?.color}
					lineWidth={style?.linewidth}
					opacity={style?.alpha}
				/>
			);
		}
		if (data.geom === "segment") {
			return (
				<Segment
					points={data.segments}
					x={x}
					y={y}
					transposed={transposed}
					color={trace.color}
					opacity={style?.alpha}
					lineWidth={style?.linewidth}
					arrow={style?.arrow}
				/>
			);
		}
		/* A label per row. It writes in foreground ink until the layer maps a color or states one. */
		if (data.geom === "text") {
			const inked = Boolean(seriesOf(ctx.spec, trace.layerId)?.aes.color) || style?.color != null;
			return (
				<Text
					points={data.points}
					x={x}
					y={y}
					band={band}
					step={transposed ? child.yStep : child.xStep}
					slot={data.slot}
					transposed={transposed}
					ramp={trace.colorField ? trace.ramp : undefined}
					color={inked ? trace.color : undefined}
					fontSize={style?.fontSize ?? metrics.annotation}
					hjust={style?.hjust}
					vjust={style?.vjust}
					boxed={data.boxed}
				/>
			);
		}
		/* A reference line per row. Rule 4 ink unless the layer maps a color or states one. */
		if (data.geom === "hline" || data.geom === "vline" || data.geom === "abline") {
			const inked = Boolean(seriesOf(ctx.spec, trace.layerId)?.aes.color) || style?.color != null;
			return (
				<Rule
					rules={data.rules}
					x={x}
					y={y}
					xAxis={ctx.ruleAxes.x}
					yAxis={ctx.ruleAxes.y}
					xBand={ctx.ruleAxes.xBand}
					yBand={ctx.ruleAxes.yBand}
					width={width}
					height={height}
					transposed={transposed}
					color={inked ? trace.color : undefined}
					dash={trace.linetypeChannel?.at ?? style?.linetype}
					lineWidth={style?.linewidth ?? (inked ? 1.5 : 1)}
					opacity={style?.alpha}
					fontSize={metrics.annotation}
				/>
			);
		}
		/*
      A smooth's geoms are nothing. Its curve draws in the overlay below, off the coordinates the
      service returned, so the records it carries are what the request was built from and not
      something to put on the page. Stated instead of left to the fall-through, since a reader
      meeting an empty branch cannot tell a deliberate blank from a missing geom.
    */
		if (data.geom === "smooth") return null;
		return null;
	}

	if (data.geom === "isosurface" || data.geom === "volume") {
		return (
			<Volume
				field={data.field}
				width={width}
				height={height}
				ramp={style?.fill ? () => style.fill! : (trace.sequential ?? ctx.palettes.sequential)}
				iso={data.geom === "isosurface"}
				{...(style?.isoLevel != null ? {isoLevel: style.isoLevel} : {})}
				panes={style?.panes}
				theme={ctx.theme}
				labels={{
					x: axisLabel(ctx.xField) ?? "X",
					y: axisLabel(trace.field) ?? "Y",
					z: axisLabel(trace.zField) ?? trace.zField?.label ?? "Z",
				}}
			/>
		);
	}

	if (data.geom === "surface" || data.geom === "mesh3d") {
		return (
			<Surface
				mesh={data.mesh}
				xDomain={data.xDomain}
				yDomain={data.yDomain}
				width={width}
				height={height}
				ramp={style?.fill ? () => style.fill! : (trace.sequential ?? ctx.palettes.sequential)}
				panes={style?.panes}
				theme={ctx.theme}
				labels={{
					x: axisLabel(ctx.xField) ?? "X",
					y: axisLabel(trace.field) ?? "Y",
					z: axisLabel(data.zField) ?? data.zField.label,
				}}
			/>
		);
	}

	/*
    The two packed layouts, which read one hierarchy and take the panel whole.

    The rectangles arrive as fractions of the plot area, so the geom scales them and no scale from
    the frame reaches either. The value is written under a treemap's name because a packed layout has
    no axis to carry it, which is rule 9's own answer for a geom ending in a value.
  */
	/* A genome round a circle. The sectors carry base pairs and the rings read the same rows. */
	if (data.geom === "ideogram") {
		const written = polarText(ctx, trace, metrics);
		const layer = seriesOf(ctx.spec, trace.layerId);
		const scale = (layer && layerScale(ctx.spec, layer)) ?? {};
		return (
			<Ideogram
				sectors={data.sectors}
				tiles={data.tiles}
				levels={data.levels}
				links={data.links}
				linkDomain={data.linkDomain}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				categoricalSize={ctx.palettes.categoricalSize}
				ramp={trace.sequential ?? ctx.palettes.sequential}
				center={scale.center ?? ctx.palettes.center}
				stain={ctx.palettes.stain}
				fill={style?.fill}
				opacity={style?.alpha}
				gap={style?.gap}
				rotate={style?.rotate}
				fontSize={written.numbers?.fontSize ?? metrics.axis}
				numbers={written.numbers}
				panels={seriesOf(ctx.spec, trace.layerId)?.rings ?? []}
				rings={data.rings}
			/>
		);
	}

	/* The same flow round a center, with an axis per sector in that sector's own units. */
	if (data.geom === "chord") {
		const written = polarText(ctx, trace, metrics);
		const layer = seriesOf(ctx.spec, trace.layerId);
		const scale = (layer && layerScale(ctx.spec, layer)) ?? {};
		return (
			<Chord
				links={data.links}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				categoricalSize={ctx.palettes.categoricalSize}
				ramp={trace.sequential ?? ctx.palettes.sequential}
				center={scale.center ?? ctx.palettes.center}
				fill={style?.fill}
				opacity={style?.alpha}
				gap={style?.gap}
				rotate={style?.rotate}
				inset={style?.inset}
				fontSize={written.numbers?.fontSize ?? metrics.axis}
				numbers={written.numbers}
				panels={seriesOf(ctx.spec, trace.layerId)?.rings ?? []}
				rings={data.rings}
				onHover={(found) =>
					reportHit(
						ctx,
						found && {
							hit:
								found.kind === "flow"
									? {kind: "flow", trace, link: found.datum}
									: {kind: "sector", trace, sector: found.datum},
							at: found.at,
						},
					)
				}
			/>
		);
	}

	/* A flow, which takes the panel whole the way a packed layout does and writes its own labels. */
	if (data.geom === "sankey") {
		return (
			<Sankey
				nodes={data.nodes}
				links={data.links}
				normalize={data.normalize}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				fill={style?.fill}
				opacity={style?.alpha}
				format={(value) => numberOf(trace.field, value)}
				fontSize={metrics.axis}
			/>
		);
	}
	if (data.geom === "treemap") {
		return (
			<Treemap
				cells={data.cells}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				levels={trace.colorLevels}
				fill={style?.fill}
				opacity={style?.alpha}
				stroke={style?.color}
				format={(value) => numberOf(trace.field, value)}
				fontSize={metrics.axis}
			/>
		);
	}
	/* The same layout round a center, so it reads the cells the icicle reads and writes its numbers. */
	if (data.geom === "sunburst") {
		const written = polarText(ctx, trace, metrics);
		return (
			<Sunburst
				cells={data.cells}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				levels={trace.colorLevels}
				fill={style?.fill}
				opacity={style?.alpha}
				stroke={style?.color}
				numbers={written.numbers}
				names={written.names}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "node", trace, cell: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "node", trace, cell: found.datum}) : undefined}
			/>
		);
	}
	if (data.geom === "icicle") {
		return (
			<Icicle
				cells={data.cells}
				width={width}
				height={height}
				identity={ctx.palettes.categorical}
				levels={trace.colorLevels}
				fill={style?.fill}
				opacity={style?.alpha}
				stroke={style?.color}
				fontSize={metrics.axis}
			/>
		);
	}

	/*
    Signed steps, whose floors `stepped` resolved against the band's own order.

    The sign takes the hue, so the fall reaches for a second entry of the categorical map instead of
    the series' own. The search past it covers the figure that puts a waterfall second: the trace's
    color is that map's entry already, and a fall painted the same hue leaves the direction unread.
  */
	if (data.geom === "waterfall") {
		const rise = style?.fill ?? trace.color;
		const fall = [1, 2, 0].map(ctx.palettes.categorical).find((hue) => hue !== rise) ?? ctx.palettes.categorical(1);
		return (
			<Waterfall
				data={data.bars}
				x={x}
				y={y}
				band={band || (transposed ? height : width) / Math.max(1, data.bars.length)}
				transposed={transposed}
				maxWidth={style?.thickness}
				opacity={style?.alpha}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				rise={rise}
				fall={fall}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "bar", trace, datum: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "bar", trace, datum: found.datum}) : undefined}
			/>
		);
	}

	if (data.geom === "bar") {
		return (
			<Bars
				data={data.bars}
				x={x}
				y={y}
				band={band || (transposed ? height : width) / Math.max(1, data.bars.length)}
				slot={data.slot}
				transposed={transposed}
				maxWidth={style?.thickness}
				color={trace.color}
				opacity={style?.alpha}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "bar", trace, datum: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "bar", trace, datum: found.datum}) : undefined}
			/>
		);
	}
	if (data.geom === "line") {
		return (
			<Line
				points={data.bars.map((bar) => ({
					x: bar.at ?? bar.category,
					// The stack's top is what the edge runs along, and its floor is where the fill closes.
					y: bar.value + (bar.floor ?? 0),
					...(bar.floor == null ? {} : {floor: bar.floor}),
				}))}
				x={x}
				y={y}
				color={trace.color}
				step={style?.step}
				lineWidth={style?.linewidth}
				opacity={style?.alpha}
				/* The band path reaches this call site, so the bound dash is read here as well. */
				dash={trace.linetypeChannel?.at ?? style?.linetype}
			/>
		);
	}
	if (data.geom === "freqpoly") {
		return (
			<Freqpoly
				data={data.bars}
				x={x}
				y={y}
				color={trace.color}
				step={style?.step}
				lineWidth={style?.linewidth}
				opacity={style?.alpha}
				dash={trace.linetypeChannel?.at ?? style?.linetype}
			/>
		);
	}
	if (data.geom === "density") {
		return (
			<DensityCurve
				curve={data.curve}
				x={x}
				y={y}
				color={trace.color}
				fill={style?.fill}
				fillOpacity={style?.alpha}
				lineWidth={style?.linewidth}
			/>
		);
	}
	if (data.geom === "area") {
		return (
			<Area
				points={data.bars.map((bar) => ({
					x: bar.at ?? bar.category,
					// The stack's top is what the edge runs along, and its floor is where the fill closes.
					y: bar.value + (bar.floor ?? 0),
					...(bar.floor == null ? {} : {floor: bar.floor}),
				}))}
				x={x}
				y={y}
				color={trace.color}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				opacity={style?.alpha}
			/>
		);
	}
	if (data.geom === "boxplot") {
		return (
			<Box
				data={data.boxes}
				x={x}
				y={y}
				band={band}
				transposed={transposed}
				thickness={style?.thickness}
				opacity={style?.alpha}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				ramp={trace.ramp}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "box", trace, datum: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "box", trace, datum: found.datum}) : undefined}
			/>
		);
	}
	if (data.geom === "violin") {
		return (
			<Violin
				data={data.violins}
				x={x}
				y={y}
				band={band}
				transposed={transposed}
				thickness={style?.thickness}
				side={style?.half}
				opacity={style?.alpha}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				ramp={trace.ramp}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "violin", trace, datum: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "violin", trace, datum: found.datum}) : undefined}
			/>
		);
	}
	if (data.geom === "heatmap") {
		return (
			<Heatmap
				data={data.cells}
				x={x}
				y={y}
				xBand={xBand}
				yBand={child.yBand}
				ramp={trace.ramp}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				opacity={style?.alpha}
				numbers={numbersOf(ctx, trace, metrics)}
				cornerRadius={style?.cornerRadius}
				cellGap={style?.cellGap}
				fadeBySupport={style?.fadeBySupport}
				paper={(ctx.theme ?? LIGHT_THEME)["--viz-paper"]}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "cell", trace, cell: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "cell", trace, cell: found.datum}) : undefined}
			/>
		);
	}

	/*
    The polar geoms, which take the panel whole and read no scale off the frame.

    A ring's slices come off the same `BarDatum` payload the bars path builds, so the hover reports
    a `slice` hit that one readout serves beside the bars. The identity map colors by position in the
    ring, and the identity itself travels on the label, which is what the coordinate is permitted on.
    See the ADR "Polar is permitted where the figure writes its numbers".
  */
	if (data.geom === "pie") {
		const written = polarText(ctx, trace, metrics);
		/* A series naming a sequential map paints its ordered slices at even steps along it. */
		const named = seriesOf(ctx.spec, trace.layerId)?.palette;
		const stepped = named ? ctx.palettes.sequentialFor?.(named) : undefined;
		const last = Math.max(1, data.bars.length - 1);
		return (
			<Pie
				data={data.bars}
				width={width}
				height={height}
				identity={stepped ? (index) => stepped(index / last) : ctx.palettes.categorical}
				fill={style?.fill}
				hole={style?.innerRadius ?? 0}
				opacity={style?.alpha}
				stroke={style?.color}
				lineWidth={style?.linewidth}
				numbers={written.numbers}
				names={written.names}
				onHover={(found) => reportHit(ctx, found && {hit: {kind: "slice", trace, datum: found.datum}, at: found.at})}
				onSelect={ctx.onSelect ? (found) => ctx.onSelect?.({kind: "slice", trace, datum: found.datum}) : undefined}
			/>
		);
	}

	if (data.geom === "gauge") {
		const written = polarText(ctx, trace, metrics);
		return (
			<Gauge
				value={data.value}
				range={data.range}
				width={width}
				height={height}
				color={trace.color}
				thickness={style?.thickness}
				opacity={style?.alpha}
				sweep={style?.sweep}
				radius={style?.radius}
				bands={style?.sections}
				ramp={trace.sequential ?? ctx.palettes.sequential}
				numbers={written.numbers}
				label={axisLabel(trace.field) ?? trace.field?.label}
			/>
		);
	}

	return null;
}

/** Whether a value axis maps its domain straight onto pixels, low to high. */
const straight = (axis: LinearAxisSpec): boolean =>
	transformOf(axis) === "identity" && !axis.reverse && axis.domain[0] < axis.domain[1];

/** Two axis specs in the data's roles, as a reference line reads them. A band axis is null beside its categories. */
const ruleAxesOf = (x: AxisSpec, y: AxisSpec): PanelContext["ruleAxes"] => ({
	x: "domain" in x ? x : null,
	y: "domain" in y ? y : null,
	...("values" in x ? {xBand: x.values} : {}),
	...("values" in y ? {yBand: y.values} : {}),
});

/** Panel height that gives the data a fixed aspect, over the margin and the sides. Null over a band. */
function ratioHeight(frame: ReadyFrame, width: number, room: Edges, ratio: number): number | null {
	const {margin} = frame;
	const plot = fixedHeight(frame.x, frame.y, width - margin.left - margin.right - room.left - room.right, ratio);
	return plot == null ? null : Math.max(1, Math.round(plot + margin.top + margin.bottom + room.top + room.bottom));
}

/** The series a trace was built from, for a guide reading what that series stated. */
const seriesOf = (spec: ChartSpec, layerId: string) => spec.layers.find((held) => held.id === layerId);

/**
 * The text a polar geom writes on itself, off the series' own two fields.
 *
 * `numbers` writes the value and `label` writes the category, and a ring carrying neither draws
 * `angle-encodes-comparison` at `bad`. A `percent` format asks for the share of the total instead of
 * the raw reduction, since a reader of a pie is usually after the share and the geom is the one
 * holding the total.
 */
function polarText(ctx: PanelContext, trace: Trace, metrics: Metrics) {
	const series = ctx.spec.layers.find((held) => held.id === trace.layerId);
	const numbers = numbersOf(ctx, trace, metrics);
	return {
		numbers: numbers && {...numbers, share: series?.numbers?.format === "percent"},
		names: series?.directLabels?.when.kind === "all",
	};
}

/**
 * What draws into one side panel.
 *
 * The frame owns where the panel sits and this owns what goes in it, which is the split the `side`
 * render prop makes. The panel arrives with the geoms' own scales inside a group already translated
 * to the plot area's origin along the shared axis, so nothing here builds a scale: reading the band
 * scale for a category gives the pixel that category's cells were drawn at.
 *
 * The dendrogram is the only content built. The track, the histogram and the rug are steps 4 and 5
 * of the ADR "A figure takes side panels that share one axis".
 */
function sideContent(
	child: SideChildProps,
	frame: ReadyFrame,
	palettes: Palettes,
	dark: boolean,
	style?: LayerStyle,
): ReactNode {
	const across = child.panel.position === "top" || child.panel.position === "bottom";
	const axis = across ? "x" : "y";

	if (child.panel.content.kind === "dendrogram") {
		const tree = frame.clusterTrees[axis];
		/* A band with no clustering behind it draws nothing, and the critic refuses the spec as wrong. */
		if (!tree) return null;
		return (
			<DendrogramPanel
				tree={tree}
				at={across ? child.x : child.y}
				position={child.panel.position}
				width={child.width}
				height={child.height}
				depth={child.panel.content.depth}
			/>
		);
	}

	if (child.panel.content.kind === "track") {
		const field = child.panel.content.field;
		const track = frame.tracks.find((held) => held.field === field && held.axis === axis);
		/* A track that resolved to nothing draws nothing, and the critic says which of the three ways. */
		if (!track) return null;
		return (
			<TrackPanel
				track={track}
				at={across ? child.x : child.y}
				band={across ? child.xBand : child.yBand}
				position={child.panel.position}
				width={child.width}
				height={child.height}
				fill={trackFill(track, palettes, dark)}
				stroke={style?.color}
				lineWidth={style?.linewidth}
			/>
		);
	}

	const marginal = frame.marginals.find((held) => held.axis === axis && held.kind === child.panel.content.kind);
	/* A marginal on a band has no measure to distribute, which the critic reports. */
	if (!marginal) return null;
	const along = across ? child.x : child.y;

	const shared = {marginal, along, position: child.panel.position, width: child.width, height: child.height};
	/* One trace lends the margin its own hue. Pooled traces keep the muted ink. */
	const tint = frame.traces.length === 1 ? frame.traces[0]!.color : undefined;

	if (child.panel.content.kind === "histogram") return <HistogramPanel {...shared} fill={tint} />;
	if (child.panel.content.kind === "density") return <DensityPanel {...shared} />;
	return <RugPanel {...shared} stroke={tint} />;
}

/**
 * What a chart needs beyond the spec.
 *
 * The spec says what is drawn and these say what it is drawn from and against: the rows, the column
 * metadata a table cannot carry, the maps, the set a figure belongs to, and the two callbacks. A
 * field that belongs to the chart itself is on the spec and not here, which is what keeps one
 * answer to "where does the headline live".
 */
export interface VizProps {
	/** What is drawn. Authored in the builder, edited in the panel, or loaded from a store. */
	spec: ChartSpec;
	/** Rows, columns, or an arrow table. */
	data: VizData;
	/** Units and labels the table cannot carry, keyed by column. Read by content, so an inline object holds. */
	fieldOverrides?: Record<string, FieldOverride>;
	/**
	 * Column naming each record, for the tooltip title, a click and a brush. Defaults to the first text column.
	 *
	 * A click or a brush names records by it only where each value names one row.
	 */
	keyField?: string;
	/** color pinning and story order, per the ADR on figure sets. Its assignments key the build by content. */
	set?: FigureSet;
	/**
	 * The two color maps. The package's own palette unless the host has a switcher.
	 *
	 * Held by identity, since a map is a function. A new object each render rebuilds the figure.
	 */
	palettes?: Palettes;
	/**
	 * What answers a `LayerSpec.fit`. Absent draws the geoms and no curve.
	 *
	 * The consumer's, because the curve a reader takes a number off belongs to the stats service and
	 * the package will not draw a second one from a solver of its own. A chart whose spec asks for a
	 * fit and reaches no fitter stays correct: it draws what it has and claims no curve.
	 */
	fitter?: Fitter;
	/**
	 * Whether a wheel and a drag move the view. Off unless asked for.
	 *
	 * Off by default because a chart in a page of prose that swallowed the wheel would stop the page
	 * scrolling past it. On, the gesture rewrites the domain the axes state, so the ticks say what is
	 * on screen and the geoms keep the size they were drawn at. Double-click puts it back.
	 *
	 * A fixed window an author decided is a different thing and already has a home: `scales.x.limits`.
	 * This is the reader's own view, which is why it lives outside the spec.
	 */
	zoom?: boolean;
	/**
	 * What a drag across a scatter's plot area selects: a box, or a lasso drawn freehand. Off unless asked for.
	 *
	 * On, the drag selects in place of panning, and a wheel still zooms. One panel alone takes it.
	 */
	brush?: BrushShape;
	/** The records inside the region the reader dragged, or null once a click clears it. */
	onBrush?: (brushed: Brushed | null) => void;
	/** The reader's controls, as a ghost strip over the figure. Absent draws none. */
	toolbar?: ToolbarOptions;
	/** Called when the findings change. */
	onCritique?: (findings: Finding[]) => void;
	/** The geom the reader clicked, and the records it stands for. Null once a click on empty ground clears it. */
	onSelect?: (selected: Selected | null) => void;
}

/**
 * A chart, from the spec that describes it. The one component the package draws through.
 *
 * The package's own claim is that a chart is data: the same spec renders in a notebook, on a
 * dashboard and in an export. This is where that becomes true for a caller. `plot()` authors a spec
 * and hands it here, the builder panel edits one and hands it here, and a spec read back from a
 * store takes the same route.
 *
 * A namespace of eighteen kind components used to sit over this, each compiling its own props
 * through a second writer of `ChartSpec`. Two writers of one schema is what the ADR "Authoring is a
 * builder over the chart spec" removed: the props path emitted one series and could not express a
 * layered figure at all, and the two drifted, so a chart built through the namespace compiled a spec
 * asking for no curve and the `fitter` below could never fire.
 *
 * The data goes through `toPlotData` memoized on reference identity and the frame is rebuilt only
 * when the spec or the data moved, so a caller holding both steady re-renders without recomputing
 * either.
 */
export function Viz({
	spec: authored,
	data,
	fieldOverrides,
	keyField,
	set,
	palettes: chosen,
	fitter,
	zoom = false,
	brush,
	onBrush,
	onCritique,
	onSelect,
	toolbar,
}: VizProps) {
	/* Keyed on what the overrides say. An object written inline is a new identity each render. */
	const fieldsKey = JSON.stringify(fieldOverrides ?? null);
	const plotData = useMemo(
		() => toPlotData(data, {fieldOverrides, keyField}),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `fieldsKey` is the overrides as the table reads them
		[data, fieldsKey, keyField],
	);

	/* The reader's toolbar choices the toolbar still offers, laid over the authored spec. Empty returns the spec itself. */
	const [chosenView, setToolView] = useState<ToolbarView>(NO_VIEW);
	const exporting = useRef(false);
	const facetKey = JSON.stringify(toolbar?.facet?.by ?? null);
	const facetBy = useMemo(
		() => facetFields(plotData, toolbar?.facet?.by, authored.facet?.by),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `facetKey` is the host's facet list by content
		[plotData, facetKey, authored.facet?.by],
	);
	const toolKey = JSON.stringify(toolbar ? [toolbar.items, toolbar.palette?.options ?? null] : null);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- `toolKey` is the listed items and maps by content
	const toolView = useMemo(() => viewOf(chosenView, toolbar, facetBy), [chosenView, toolKey, facetBy]);
	const targetsKey = JSON.stringify(toolbar?.colorblind ?? null);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- `targetsKey` is the targets by content
	const targets = useMemo(() => ({...COLORBLIND, ...toolbar?.colorblind}), [targetsKey]);
	const spec = useMemo(() => viewSpec(authored, toolView, targets), [authored, toolView, targets]);
	const {headline, subtitle, caption} = spec;
	const {holder, element: measuredElement, width: measured} = useMeasuredWidth();
	/**
	 * One facet cell, measured.
	 *
	 * The grid decides how wide a panel is. It knows what else is in the row, what the gaps come to and
	 * what the container gave it, and arithmetic beside it does not: computing a panel width from the
	 * figure's own measurement put the drawings twenty pixels wider than the cells they sat in, because
	 * the legend was in the row and the sum had not been told. So one cell reports its width and every
	 * panel takes it, which holds because the tracks are equal fractions and equal fractions are equal.
	 *
	 * The first cell and not each of them: five observers would answer five times with one number.
	 */
	const {holder: cellHolder, width: cellWidth} = useMeasuredWidth();
	/* The measured element as a ref object, one per element, for the theme to read. */
	const themeRef = useMemo(() => ({current: measuredElement}), [measuredElement]);
	const theme = useVizTheme(themeRef);

	/* The magnitude map spends its range on the half of itself the paper leaves visible. */
	const dark = theme ? onDarkPaper(theme) : false;
	const {palette: picked, colorblind} = toolView;
	const palettes = useMemo(
		() => viewPalettes(chosen ?? palettesFor({dark}), {palette: picked, colorblind}, targets, dark),
		[chosen, dark, picked, colorblind, targets],
	);

	/*
    Keyed on the facet field and the table, which is all `partitionOf` reads.

    Keying it on the whole spec re-cut a quarter of a million rows every time a color moved, which
    is the split the function's own docstring claims and the dependency list defeated.
  */
	const partition = useMemo(() => partitionOf(spec, plotData), [spec.facet?.by, plotData]);

	/*
	  The panel's measured width, then the stated width, then the fallback.

	  A stated width sizes the figure. The panel measures what the row leaves it beside a side guide.
	*/
	const width = measured || spec.width || UNMEASURED_WIDTH;

	/* Panel size decides the sizing class, and a facet cuts the width into columns first. */
	const facets = partition.field ? Math.min(partition.groups.length, FACET_CAP) || 1 : 1;
	/* An author's count wins over the width, since asking for a row is saying which to lose. */
	const asked = spec.facet?.columns;
	const columns =
		asked != null && asked > 0
			? Math.max(1, Math.min(facets, Math.trunc(asked)))
			: Math.max(1, Math.min(facets, Math.floor((width + FACET_GAP) / (FACET_MIN + FACET_GAP)) || 1));
	const panelWidth = facets > 1 ? Math.floor((width - (columns - 1) * FACET_GAP) / columns) : width;

	/*
	  The height, resolved against the width one panel actually got.

	  A stated height is the figure's. A facet's rows divide it, less their strips, the gaps between
	  them and the axis title under the grid. A ratio is read per panel, and each of twelve panels holds
	  the shape. An explicit height is the more specific instruction and wins.
	*/
	const facetRows = Math.ceil(facets / columns);
	const perRow = (whole: number) =>
		partition.field
			? Math.max(
					1,
					Math.floor(
						(whole - (facetRows - 1) * FACET_GAP - facetRows * STRIP_HEIGHT - SHARED_TITLE_HEIGHT) / facetRows,
					),
				)
			: whole;
	const statedHeight =
		spec.height != null
			? perRow(spec.height)
			: spec.aspect
				? Math.max(1, Math.round(panelWidth * spec.aspect))
				: DEFAULT_HEIGHT;

	/*
	  The reader's ranges, and the build with them laid over it.

	  A third pass and not part of the build: a range changes which records are drawn and nothing
	  about what they are, so narrowing through `buildPanels` would re-walk the table on each frame
	  of a drag to arrive at the lines already in hand. The count comes back with the panels because
	  the footer states what was kept.
	*/
	const [ranges, setRanges] = useState<AxisRanges>({});
	/*
    The plot area a stated band size asks for, before any margin is known.

    This is what breaks the circle the inversion creates. Going the usual way the panel is given, the
    margin comes off the metrics and the plot area is what is left; going this way the plot area is
    stated and the panel is what it plus the margin comes to, so the margin would need metrics that
    need a panel that needs the margin. Reading the categories off the table settles the plot area
    first, and the metrics come off whichever end is known.

    Counted from the table and not from a built frame, because the build takes the metrics as an
    argument and cannot run before them.
  */
	const content = useMemo(
		() => (spec.sizing === "content" ? contentExtent(spec, plotData) : null),
		[
			spec.sizing,
			spec.scales?.x?.bandSize,
			spec.scales?.y?.bandSize,
			spec.scales?.x?.order,
			spec.scales?.y?.order,
			spec.layers,
			plotData,
		],
	);

	const metrics = metricsFor(content?.width ?? panelWidth, content?.height ?? statedHeight);

	/*
    The expensive half, keyed on the spec as the build reads it.

    `shapeOf` leaves out the one field `paint` reapplies, so a color the author picks reuses the
    layers and repaints a couple of dozen traces. Keying on the spec object rebuilt a quarter of a
    million points on each frame of a color drag, which is what `shapeOf`, `colorsOf` and `paint`
    were written to prevent while nothing outside the tests called them.
  */
	const shape = useMemo(() => shapeOf(spec), [spec]);
	const colors = useMemo(() => colorsOf(spec), [spec]);

	/* The pinned colors by content, for the same reason as the fields. */
	const assignmentsKey = JSON.stringify(set?.assignments ?? null);
	const layers = useMemo(
		() => buildPanels(spec, plotData, {palettes, partition, metrics, pinned: set?.assignments}),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `shape` is the spec as the build reads it
		[shape, plotData, palettes, partition, metrics, assignmentsKey],
	);

	/* Returns what it was handed where nothing carries a color of its own, so identity survives. */
	// eslint-disable-next-line react-hooks/exhaustive-deps -- `colors` is the spec as `paint` reads it
	const painted = useMemo(() => paint(layers, spec.layers, palettes, spec.scales), [layers, colors, palettes]);

	/* The reader's ranges laid over the build, which is a filter and not a rebuild. */
	const {panels: built, kept} = useMemo(() => narrow(painted, ranges), [painted, ranges]);

	const [hovers] = useState(hoverStore);

	const panelCount = built.status === "ready" ? built.panels.length : 0;

	const firstFrame: ReadyFrame | null = built.status === "ready" ? (built.panels[0]?.frame ?? null) : null;

	/*
    A side is room the plot area gives up, so a figure sized to its content asks for it on top.

    Going the other way the sides would eat into a stated band size, and a dendrogram beside a
    twelve-pixel row would leave the rows at ten. Under a facet the sides are refused: the panels
    share one band and a cluster order belongs to the cells that produced it, so a tree drawn beside
    each panel would point at rows that panel never held. The critic says so in the same breath.
  */
	const sides = spec.facet?.by ? undefined : spec.sides;
	const room = sideRoom(sides);

	/* A fixed data aspect sets the height off the width and both domains. A facet's panels share them. */
	const height =
		(spec.ratio != null && firstFrame && ratioHeight(firstFrame, panelWidth, room, spec.ratio)) || statedHeight;

	/*
	  The reader's own view, over the one panel.

	  A facet is a small multiple over shared scales, so twelve panels each holding their own window
	  would be twelve charts that no longer compare. Sharing one window across them is the right
	  answer, and it wants a gesture resolved against whichever panel the pointer is over, which is
	  its own piece of work. So a faceted chart does not take the gesture.
	*/
	/* A listed drag mode takes the drag. The wheel stays with the `zoom` prop. */
	const tools = toolbar?.items ?? NO_TOOLS;
	const drags = dragsOf(tools);
	const drag = drags.length === 0 ? undefined : (toolView.drag ?? drags.find((mode) => mode === brush) ?? drags[0]);
	const brushShape = drag === undefined ? brush : drag === "box" || drag === "lasso" ? drag : undefined;
	const takesGesture = zoom || drags.length > 0 || tools.includes("zoom") || tools.includes("reset");
	const view = useZoom(
		takesGesture && panelCount === 1,
		panelWidth,
		height,
		drag === undefined ? zoom && brushShape == null : drag === "pan",
		zoom,
	);
	/* A move off a brush mode clears the held selection with the host. */
	const lastShape = useRef(brushShape);
	useEffect(() => {
		if (lastShape.current != null && lastShape.current !== brushShape) onBrush?.(null);
		lastShape.current = brushShape;
	}, [brushShape, onBrush]);
	/* The sole panel's size, and its plot area in the gesture's pixels for the zoom buttons and the zoom box. */
	const soleWidth =
		firstFrame && content?.width != null
			? content.width + firstFrame.margin.left + firstFrame.margin.right + room.left + room.right
			: panelWidth;
	const soleHeight =
		firstFrame && content?.height != null
			? content.height + firstFrame.margin.top + firstFrame.margin.bottom + room.top + room.bottom
			: height;
	const soleArea = firstFrame && panelCount === 1 ? plotArea(soleWidth, soleHeight, firstFrame.margin) : null;

	/*
	  A click carries what a query can act on, not only what the reader touched.

	  `selectionOf` reads the clicked geom against the compiled spec and the table's key column, so
	  the predicate names records instead of pixels. Absent where the author took no callback, which
	  is what keeps the geoms free of a click handler nobody is listening for.

	  A pan across a scatter ends over a geom, and the click that follows it is the gesture ending and
	  not a reader choosing that record, so the viewport gets asked before the callback fires.
	*/
	const panned = view.panned;
	/* The press under a click, and whether it moved past the drag floor. A turn, a grip or a note drag ends in a click. */
	const press = useRef({x: 0, y: 0, down: false, moved: false});
	const gesture = {
		onPointerDownCapture: (event: React.PointerEvent) => {
			press.current = {x: event.clientX, y: event.clientY, down: true, moved: false};
		},
		onPointerMoveCapture: (event: React.PointerEvent) => {
			const held = press.current;
			if (held.down && Math.hypot(event.clientX - held.x, event.clientY - held.y) >= DRAG_FLOOR) held.moved = true;
		},
		onPointerUpCapture: () => {
			press.current.down = false;
		},
	};
	/* Whether a geom took the click in flight, and whether a selection is held for an empty click to clear. */
	const claimed = useRef(false);
	const holding = useRef(false);
	const reportSelect = useMemo(
		() =>
			onSelect
				? (hit: LayerHit) => {
						if (panned() || press.current.moved) return;
						claimed.current = true;
						holding.current = true;
						onSelect(selectedOf(hit, {spec, data: plotData}));
					}
				: undefined,
		[onSelect, spec, plotData, panned],
	);
	/* A click that reached the panels with no geom under it clears what is held. Geoms hear it first. */
	const clearSelect = onSelect
		? () => {
				const took = claimed.current;
				const dragged = panned() || press.current.moved;
				claimed.current = false;
				press.current.moved = false;
				if (took || dragged || !holding.current) return;
				holding.current = false;
				onSelect(null);
			}
		: undefined;
	const [substituted, setSubstituted] = useState<Substitution | null>(null);
	/*
    Held on what the substitution says and not on the object saying it.

    A geom reports what it drew from an effect, and the answer is a fresh object each time it fires.
    Setting state from that closes a circle wherever the reporting effect's own inputs are rebuilt per
    render, and the footer sentence never changed: the caller re-renders, the effect fires, the state
    takes a new identity, and round again. Same answer `onCritique` takes, which is to compare what
    was said instead of what carried it.
  */
	const onSubstitute = useMemo(
		() => (panel: number, sub: Substitution | null) => {
			if (panel === 0) setSubstituted((held) => (sameSubstitution(held, sub) ? held : sub));
		},
		[],
	);

	/*
    The plot area the geoms were actually given, for a finding that has to reason in drawn pixels.

    The panel less its margin and less what the sides took, which is `renderPanel`'s own arithmetic
    for the container path. A figure that stated a band size needs none of this and the critic reads
    the stated number first; this is the grid that left the decision to the layout, where working it
    out is the only way to know a cell is four pixels tall.
  */
	const area = useMemo(
		() =>
			firstFrame
				? {
						width: Math.max(0, panelWidth - firstFrame.margin.left - firstFrame.margin.right - room.left - room.right),
						height: Math.max(0, height - firstFrame.margin.top - firstFrame.margin.bottom - room.top - room.bottom),
					}
				: undefined,
		[firstFrame, panelWidth, height, room.left, room.right, room.top, room.bottom],
	);

	/*
	  One hook over the whole plot, per the ADR on facets, and one ask covering its panels. A group
	  is keyed by its panel as well as its split value, so two panels holding the same value get a
	  curve each, fitted on their own rows. `fitRequestsOver` merges per series on the way out, so
	  the fitter still receives one request per series whatever the panel count.
	*/
	const panelTraces = useMemo(
		() =>
			built.status === "ready" ? built.panels.map((panel) => ({value: panel.value, traces: panel.frame.traces})) : [],
		[built],
	);
	const requests = useMemo(() => fitRequestsOver(panelTraces, spec.layers), [panelTraces, spec.layers]);
	const fits = useFits(requests, fitter);

	const findings = useMemo(
		/* The measured element, so the fit check can say a content-sized figure outgrew its column. */
		() =>
			critique(spec, {
				frame: firstFrame ?? undefined,
				substituted: substituted ?? undefined,
				container: measured || undefined,
				area,
			}),
		[spec, firstFrame, substituted, measured],
	);
	/*
    Reported when the findings change and not when the array is rebuilt.

    Setting state from `onCritique` is the obvious use and what the demo does, and it closed a
    circle: the caller re-renders, a `scales` written inline is a new object, the spec
    memo misses on it, the findings array is rebuilt, and the callback fires again. The findings
    themselves were identical every time round. Keying on what a finding says is the same answer
    `shapeOf` gives the build, and it holds whatever a caller does with their props.
  */
	const reported = findings.map((finding) => `${finding.code}:${finding.path}:${finding.message}`).join("|");
	/* The latest callback, read when the findings change. An arrow written inline is a new identity each render. */
	const critiqued = useRef(onCritique);
	critiqued.current = onCritique;
	// eslint-disable-next-line react-hooks/exhaustive-deps -- `reported` is the findings as a reader would read them
	useEffect(() => {
		critiqued.current?.(findings);
	}, [reported]);

	if (built.status === "empty") {
		return (
			<div ref={holder} style={spec.width == null ? undefined : {width: spec.width}}>
				<Figure headline={headline} subtitle={subtitle}>
					<div
						className="flex flex-col items-center justify-center gap-1 text-sm"
						style={{height, color: "var(--viz-ink-muted)"}}
					>
						<span className="font-medium">{built.title}</span>
						<span>{built.reason}</span>
					</div>
				</Figure>
			</div>
		);
	}

	/*
	  A zoom is a step that drops data, so it says so.

	  It leads the footer because `held` is what the reader themselves took out, and it is the one
	  line on that list they can put back. Without it a reader arriving at a zoomed figure reads a
	  slice of a measure as the whole of it.
	*/
	const held = [
		...(kept ? [`${kept.within.toLocaleString()} of ${kept.of.toLocaleString()} records inside the ranges`] : []),
		...(view.zoomed ? ["showing part of the range"] : []),
		...overrideNotes(spec, findings),
	];
	const footer = firstFrame
		? footerOf(firstFrame, {
				fitted: fits,
				facetDropped: built.facetDropped,
				held,
				substituted: substituted ?? undefined,
			})
		: undefined;
	const footerLine = [footer, caption].filter(Boolean).join(" · ") || undefined;

	const legend = firstFrame && firstFrame.legend.length > 1 ? firstFrame.legend : null;

	/* The traces a guide reads. A layer that keeps out of the legend reaches none of them. */
	const guided = firstFrame?.traces.filter((trace) => trace.showLegend !== false);

	/* What the swatches are of: the identity channel's field, or the field a series split on. */
	const named = guided?.find((trace) => trace.colorLevels?.length || (trace.grouped ? undefined : trace.splitField));
	const legendTitle = axisLabel(named?.colorField ?? (named?.grouped ? undefined : named?.splitField)) ?? undefined;
	/* The scale the swatches are titled off: the layer's own over the chart's, on the layer's paint aesthetic. */
	const swatched = seriesOf(spec, (named ?? guided?.[0])?.layerId ?? "");
	const swatchScale = swatched ? layerScale(spec, swatched) : spec.scales?.color;

	/*
	  The cap the footer already states, held to.

	  `fitNote` writes "bands hidden above 12 curves" off the same count, so the line under the chart
	  and the paint on it come from one comparison. Counted over the plot and not per series, since
	  the shaded areas compound on one frame whoever asked for them.
	*/
	const bandsDrawn = firstFrame ? drawnFits(firstFrame.traces, fits).length <= BAND_LIMIT : true;
	/* A bound size channel draws geoms nobody can read back without one. */
	const sized = guided?.find((trace) => trace.sizeField && trace.sizeDomain && trace.sizeRadii);

	/*
	  The three channels that keep a figure readable once its hue is gone, each with a guide.

	  A shape and a categorical opacity carry their levels on one trace, since both resolve per mark
	  and one trace holds every mark. A dash is a pattern per trace, so its guide is gathered back off
	  the set the way the series legend gathers its rows.

	  A continuous opacity draws no guide. Three sample marks at three opacities make a ramp a reader
	  cannot take a number off, and the channel is weak enough that the honest answer is to leave the
	  reading to the position scales. `opacityChannel.domain` sits on the trace for a caller who wants
	  to draw one anyway.
	*/
	const shaped = guided?.find((trace) => trace.shapeChannel?.levels?.length);
	const faded = guided?.find((trace) => trace.alphaChannel?.levels?.length);

	const dashed = guided?.filter((trace) => trace.linetypeChannel) ?? [];
	const dashLevels = [...new Map(dashed.map((trace) => [trace.linetypeChannel!.value, trace.linetypeChannel!.at]))];

	/** Each guide's title, keyed by the aesthetic it maps. The author's word wins over the field's. */
	const scales = spec.scales;

	/*
    Gated on the domain and not on a bound field, which is what lets a grid draw one.

    A heatmap cell holds a reduction, so no field sits on its color channel and `colorField` is
    absent; the domain is what says a scale ran. `trace.name` already carries what the reduction is
    called, which is the label a bound field would have supplied.

    Filtered and not found. One bar a chart is what left reference figure 1 short: two series each
    binding a measure to color drew off two domains and got one guide between them, so a reader had
    no way to tell which measure a color came from. A split gives many traces off one series and
    they share a scale, so the set is cut to one bar per column.
  */
	const colored = guided?.filter((trace) => trace.colorDomain) ?? [];
	const colorBars = [...new Map(colored.map((trace) => [trace.colorField?.id ?? trace.layerId, trace])).values()];

	/*
    A legend per annotation track, since a strip of colors nobody can read back is decoration.

    Each is labeled with its own column, which the series legend does not need and two tracks beside
    one grid do. A category track samples the figure's own categorical map, so a value keeps the color
    it has anywhere else in the set; a measure track draws its own bar off the map it named.
  */
	const tracks = firstFrame?.tracks ?? [];

	/*
    Where the legends sit, and which way they read.

    Rule 2 asks for a legend outside the plot area and writes names under the chart as its worked
    example. All four edges are outside it, so the rule's argument holds on each; placement inside
    the panel is the thing it argues against and has no setting here.

    Stacked on a side and run across on a top or a bottom, since a column of rows beside a chart
    reads down and a row under one reads along. An author can say otherwise.
  */
	const placement = spec.legend?.position ?? "bottom";
	const onSide = placement === "left" || placement === "right";
	const legendsFirst = placement === "left" || placement === "top";
	const stacked = (spec.legend?.direction ?? (onSide ? "vertical" : "horizontal")) === "vertical";
	const along = {start: "items-start", center: "items-center", end: "items-end"}[spec.legend?.align ?? "start"];

	const legends =
		placement === "none" ||
		!(legend || colorBars.length || sized || shaped || faded || dashLevels.length > 1) ? null : (
			/*
			  A grid over the guides, each one contributing a name cell and a body cell.

			  A flex row wrapped them around each other and two bars naming two measures started at
			  different offsets. A name stands over its own body either way. Down the side the guides
			  run in one column. Across the foot the names take a row and the bodies take the one
			  under it.
			*/
			<div
				className={`grid ${along} gap-x-4 gap-y-1`}
				style={{
					...(stacked
						? {
								gridTemplateColumns: "minmax(0, max-content)",
								...(spec.legend?.align ? {justifyItems: spec.legend.align} : {}),
							}
						: {
								gridTemplateRows: "max-content max-content",
								gridAutoFlow: "column",
								gridAutoColumns: "minmax(min-content, max-content)",
							}),
					...(spec.legend?.fontSize == null ? {} : {fontSize: spec.legend.fontSize}),
				}}
			>
				{/* The rows read the way the legend as a whole does: a column beside a chart, a row under one. */}
				{legend && (
					<SeriesLegend
						orientation={stacked ? "column" : "row"}
						/* The channel's own field names the legend, which is what says what the colors are of.
						   A split names its field the same way; unlabeled swatches leave a reader guessing. */
						label={swatchScale?.title ?? legendTitle}
						items={legend.map((row) => ({id: row.key, label: row.label, color: row.color}))}
					/>
				)}
				{/*
				  One bar per column a series colored by, each reading that series' own scale.

				  The title falls back through the series' own scale before the chart's, since two bars
				  naming one measure between them name neither.
				*/}
				{colorBars.map((bar) => {
					const layer = seriesOf(spec, bar.layerId);
					const scale = (layer && layerScale(spec, layer)) ?? {};
					return (
						<ColorLegend
							key={bar.id}
							label={scale.title ?? axisLabel(bar.colorField) ?? bar.name}
							domain={bar.colorDomain!}
							ramp={bar.ramp}
							center={scale.center ?? palettes.center}
							breaks={scale.bins}
							ticks={scale.breaks?.map((at) => ({at, label: scale.labels?.[String(at)]}))}
							format={scale.format ? tickFormatter(scale.format, scale.decimals) : undefined}
						/>
					);
				})}
				{tracks.map((track) =>
					track.kind === "identity" ? (
						<SeriesLegend
							key={`t${track.field}`}
							label={track.label}
							items={track.levels.map((value) => ({
								id: value,
								label: value,
								color: palettes.categorical(track.codes.get(value) ?? 0),
							}))}
						/>
					) : (
						<ColorLegend
							key={`t${track.field}`}
							label={track.label}
							domain={track.domain}
							ramp={trackRamp(track, palettes, dark)}
						/>
					),
				)}
				{sized && (
					<SizeLegend
						label={scales?.size?.title ?? axisLabel(sized.sizeField) ?? sized.sizeField!.label}
						domain={sized.sizeDomain!}
						radii={sized.sizeRadii!}
						color={sized.color}
					/>
				)}
				{shaped && (
					<MarkLegend
						orientation={stacked ? "column" : "row"}
						label={scales?.shape?.title ?? axisLabel(shaped.shapeChannel!.field) ?? shaped.shapeChannel!.field.label}
						color={shaped.color}
						levels={shaped.shapeChannel!.levels!.map((level) => ({label: level.value, shape: level.at}))}
					/>
				)}
				{faded && (
					<MarkLegend
						orientation={stacked ? "column" : "row"}
						label={scales?.alpha?.title ?? axisLabel(faded.alphaChannel!.field) ?? faded.alphaChannel!.field.label}
						color={faded.color}
						levels={faded.alphaChannel!.levels!.map((level) => ({
							label: level.value,
							shape: "circle" as const,
							opacity: level.at,
						}))}
					/>
				)}
				{/* One row per pattern, gathered off the traces the split produced. */}
				{dashLevels.length > 1 && (
					<MarkLegend
						orientation={stacked ? "column" : "row"}
						label={
							scales?.linetype?.title ??
							axisLabel(dashed[0]!.linetypeChannel!.field) ??
							dashed[0]!.linetypeChannel!.field.label
						}
						color={dashed[0]!.color}
						levels={dashLevels.map(([value, dash]) => ({label: value, dash}))}
					/>
				)}
			</div>
		);

	/*
	  Equal panels, and the first column wider by the room its numbers take.

	  Written as a grid track and not as a measurement. `100%` is the grid's own content box, so the
	  browser resolves it after the legend beside it has taken its share, and nothing here can fall out
	  of step with the layout. The tracks sum to the full width: the first is a share plus the axis
	  room, the rest are that share, and the shares are cut after the room and the gaps come off.
	*/
	const axisRoom = firstFrame?.axisFree ? 0 : (firstFrame?.margin.left ?? 0);
	const evenColumns = built.facetField != null && columns > 1 && axisRoom > 0;

	/*
	  The cell the observer watches is one of the equal ones.

	  Every panel takes one measurement, which holds while the tracks are equal fractions. The first
	  track is no longer one of them, so watching it handed the inner panels the wide number and they
	  drew past their own cells into the gap. The first panel adds the room back, which is the same
	  constant its track adds.
	*/
	const measuredCell = evenColumns ? 1 : 0;

	const renderPanel = (panel: FacetPanel, index: number) => {
		const frame = panel.frame;
		const facetColumn = built.facetField == null ? 0 : index % columns;

		/*
		  The numbers go down the first column, so the room for them goes to the first column's cell.

		  Every panel reserved it before, which kept the plot areas equal and left four fifths of the
		  reservation as empty page inside the geoms' own box: at five panels the blank between two
		  drawings came to more than either drawing. The plot areas stay equal because the grid hands
		  the first track that width on top of an equal share, so the sum works out per panel without
		  anything here measuring pixels. That is the arithmetic the last attempt at this got wrong: it
		  computed the widths in advance against a container the legend had already narrowed.
		*/
		const margin = facetColumn === 0 ? frame.margin : {...frame.margin, left: 0};

		/*
      A stated band size decides the plot area, so the panel is that plus the room its axes take.

      The margin is the frame's own, derived from the chrome the author set, so this reads it after
      the build instead of guessing at it beforehand.
    */
		/* Faceting: the cell the grid gave, reported by the cell itself. `panelWidth` is the estimate the
		   first paint draws at, before the observer has answered. */
		const panelW =
			content?.width != null
				? content.width + margin.left + margin.right + room.left + room.right
				: built.facetField
					? (cellWidth || panelWidth) + (facetColumn === 0 ? axisRoom : 0)
					: panelWidth;
		const panelH =
			content?.height != null
				? content.height + frame.margin.top + frame.margin.bottom + room.top + room.bottom
				: height;

		/*
		  The gesture read as a pair of domains, which is the whole of what a zoom does here.

		  The traces are left alone: what a trace holds was decided by the rows and the bindings, and
		  a hand moving changes neither, so the pass that walked the records is not asked to run
		  again. The geoms reposition on the new scales and `clip` keeps the ones now outside the
		  window off the ticks beside them.
		*/
		const axes = view.zoomed
			? zoomedAxes(frame, view.transform, plotArea(panelW, panelH, frame.margin))
			: {x: frame.x, y: frame.y};

		const ctx: PanelContext = {
			spec,
			data: plotData,
			palettes,
			panel: index,
			xField: frame.xField,
			fieldAt: frame.fieldAt,
			transposed: frame.transposed,
			/* The window on screen, where both axes run a value scale. The density route asks for both. */
			domains:
				"domain" in axes.x && "domain" in axes.y
					? {x: axes.x.domain, y: axes.y.domain, affine: straight(axes.x) && straight(axes.y)}
					: null,
			ruleAxes: ruleAxesOf(frame.transposed ? axes.y : axes.x, frame.transposed ? axes.x : axes.y),
			theme,
			onHover: hovers.set,
			onSelect: reportSelect,
			onSubstitute,
			ranges,
			onRanges: setRanges,
		};

		/*
		  One set of numbers down the left and one along the bottom, which is what a facet reads as.

		  Each panel wrote its own pair before this, so five panels at a hundred pixels put five sets of
		  tick labels across the figure and each set landed on its neighbor's geoms. The room stays
		  reserved in every panel, since equal margins are what keep the plot areas on one line, and only
		  the outer panels write into it. ggplot hoists the axis out of the panels instead and gets the
		  same reading; this keeps the frame arithmetic per panel, which is what `buildPanels` already
		  hands back.
		*/
		const facetted = built.facetField != null;
		const rows = Math.ceil(built.panels.length / columns);
		const lastRowFrom = (rows - 1) * columns;
		const column = index % columns;
		const row = Math.floor(index / columns);

		/* Numbers on the outer panels: down the left of the first column, along the bottom of the last
		   row. That is where a reader looks for them and it is one set of each. */
		const writesY = !facetted || column === 0;
		const writesX = !facetted || index >= lastRowFrom;

		/*
		  The name once, near the middle of the run it names.

		  The numbers belong to a panel and the name belongs to the axis, so writing it on each panel
		  that carries numbers named the measure five times across one row. The middle panel is as close
		  to centered as a per-panel frame reaches: centering it across the whole row would mean drawing
		  it outside every panel, which is a layout this does not have.
		*/
		const titlesY = !facetted || (column === 0 && row === Math.floor((rows - 1) / 2));
		/* Never inside a panel where the figure facets: the grid writes it once underneath, centered
		   over all of them, because the measure is the same across the row. */
		const titlesX = !facetted;

		const outerOnly = <T extends object>(axis: T, ticks: boolean, title: boolean): T =>
			ticks && title ? axis : {...axis, ...(ticks ? {} : {labelTicks: false}), ...(title ? {} : {label: undefined})};

		return (
			<div
				key={panel.value || "panel"}
				/* The first cell reports its width and the rest take it, since the tracks are equal. */
				ref={index === measuredCell ? cellHolder : undefined}
				className="flex min-w-0 flex-col"
			>
				{built.facetField && (
					/*
					  The strip: the level's own name on a card, centered over the panel it names.

					  A card and not bare text, because the strip is chrome and the reader has to tell it
					  from the figure's own words. ggplot fills it, and what the fill buys is a row of names
					  that reads as one band across the top instead of five captions.

					  The name alone. The row count was here and it said the same number five times over a
					  synthetic table and something misleading over a real one: a panel's count is a fact
					  about the split and not about the level, and the figure already states its own n. One
					  line either way, since a wrapped strip pushes its panel's plot area below its
					  neighbors' and a facet is read by comparing across the row.
					*/
					<span
						data-viz-strip=""
						className="text-xs font-medium"
						title={panel.value}
						style={{
							color: "var(--viz-ink)",
							background: "var(--viz-rule)",
							height: STRIP_HEIGHT,
							boxSizing: "border-box",
							lineHeight: `${STRIP_HEIGHT - 6}px`,
							padding: "3px 6px",
							textAlign: "center",
							/*
							  Inset to the plot area, so the strip names the panel and not the panel plus its
							  axis, and its edges line up with the geoms under it. Every panel carries the same
							  margin now, so one inset keeps the strips equal to each other as well as to their
							  own panel: the alignment holds because the numbers are the same, and not because
							  they were computed to match.
							*/
							marginLeft: margin.left,
							marginRight: margin.right,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{panel.value}
					</span>
				)}
				<Frame
					width={panelW}
					height={panelH}
					x={frame.axisFree ? BARE_AXIS : outerOnly(axes.x, writesX, titlesX)}
					y={frame.axisFree ? BARE_AXIS : outerOnly(axes.y, writesY, titlesY)}
					clip={view.zoomed || frame.clip === true}
					margin={frame.axisFree ? WHOLE_PANEL : margin}
					metrics={frame.metrics}
					axisEnds={frame.annotations.axisEnds}
					notes={frame.annotations.notes}
					sides={sides}
					side={(child) => sideContent(child, frame, palettes, dark, spec.layers[0]?.style)}
					overlay={
						toolView.tooltip === false
							? undefined
							: ({width: innerW, height: innerH}) => (
									<PanelTooltip hovers={hovers} panel={index} bounds={{width: innerW, height: innerH}} />
								)
					}
				>
					{(child) => {
						const geoms = (
							<>
								{frame.traces.map((trace) => (
									<TraceGeoms key={trace.id} trace={trace} child={child} ctx={ctx} />
								))}
								{/* Over the geoms, since a fit is an overlay and reads against the points it came from. */}
								{frame.traces.map((trace) =>
									fitsFor(trace, fits, panel.value).map((fit) => (
										<FitCurve
											key={`${trace.id}-${fit.id}`}
											fit={fit}
											x={child.x}
											y={child.y}
											color={trace.color}
											/* A smooth's curve is its geom and takes the layer's width and opacity. A fit's rides over points. */
											{...(trace.data.geom === "smooth"
												? {
														lineWidth: seriesOf(spec, trace.layerId)?.style?.linewidth,
														opacity: seriesOf(spec, trace.layerId)?.style?.alpha,
													}
												: {})}
											showBand={bandsDrawn}
										/>
									)),
								)}
							</>
						);
						if (drag === "zoomBox" && soleArea) {
							const {left, top} = soleArea;
							return (
								<BrushLayer
									key="zoomBox"
									shape="box"
									child={child}
									traces={frame.traces}
									spec={spec}
									onRegion={([a, b]) =>
										view.zoomTo({left: a.x + left, top: a.y + top, right: b.x + left, bottom: b.y + top}, soleArea)
									}
								>
									{geoms}
								</BrushLayer>
							);
						}
						return brushShape && built.panels.length === 1 ? (
							<BrushLayer
								key={brushShape}
								shape={brushShape}
								child={child}
								traces={frame.traces}
								spec={spec}
								keyField={plotData.keyField}
								transposed={frame.transposed}
								onBrush={onBrush}
							>
								{geoms}
							</BrushLayer>
						) : (
							geoms
						);
					}}
				</Frame>
			</div>
		);
	};

	/*
	  The horizontal axis is named once, under the whole grid.

	  It was named on the middle panel of the last row, which is the closest a per-panel frame reaches
	  to centered and still reads as labeling that one panel. The measure is the same across the row, so
	  the name belongs to the figure: it goes below the grid, centered over all of it, and every panel
	  drops it. The vertical one stays inside its panel, where `titleAlign: "center"` turns it to run
	  along the rule it names.
	*/
	const sharedXTitle = built.facetField ? axisLabel(firstFrame?.xField) : undefined;

	const share = `((100% - ${FACET_GAP * Math.max(0, columns - 1)}px - ${axisRoom}px) / ${columns})`;
	const facetTracks =
		columns > 1 && axisRoom > 0
			? `calc(${share} + ${axisRoom}px) repeat(${columns - 1}, calc(${share}))`
			: `repeat(${columns}, minmax(0, 1fr))`;

	const drawn =
		built.panels.length === 1 ? (
			renderPanel(built.panels[0]!, 0)
		) : (
			<div className="flex min-w-0 flex-col" style={{gap: 4}}>
				<div className="grid" style={{gap: FACET_GAP, gridTemplateColumns: facetTracks}}>
					{built.panels.map(renderPanel)}
				</div>
				{sharedXTitle && (
					<span
						className="text-xs"
						style={{color: "var(--viz-ink-muted)", textAlign: "center", lineHeight: `${SHARED_TITLE_HEIGHT - 4}px`}}
					>
						{sharedXTitle}
					</span>
				)}
			</div>
		);

	/*
	  The element the gesture is read against, which is the panel and not the figure.

	  Wrapping the headline as well would let a wheel over the title move the geoms under it, and
	  `touch-action` off is what stops a drag on a touchpad scrolling the page instead of panning.
	  Double-click resets, which is the affordance a reader already expects of a zoomed view.
	*/
	const panels = takesGesture ? (
		<div
			ref={view.surface}
			style={zoom || drags.length > 0 ? {touchAction: "none"} : undefined}
			onDoubleClick={view.reset}
			{...view.handlers}
		>
			{drawn}
		</div>
	) : (
		drawn
	);

	/* The strip's corner: the plot area's top right, inset four pixels. A facet anchors to the grid's right edge. */
	const edge = firstFrame?.axisFree ? WHOLE_PANEL : firstFrame?.margin;
	const stripAt: React.CSSProperties | undefined = !edge
		? undefined
		: built.facetField
			? {top: STRIP_HEIGHT + edge.top + 4, right: edge.right + 4}
			: {top: edge.top + room.top + 4, left: soleWidth - edge.right - room.right - 4, transform: "translateX(-100%)"};

	const changeView = (next: ToolbarView) => {
		setToolView(next);
		toolbar?.onChange?.(next);
	};
	/* One PNG in flight at a time. A failed one reports to the console. */
	const exportAs = (format: "png" | "svg") => {
		const root = measuredElement;
		if (!root) return;
		const name = fileName(headline, format);
		if (format === "png") {
			if (exporting.current) return;
			exporting.current = true;
			exportPng(root)
				.then((blob) => download(blob, name))
				.catch((error: unknown) => console.error("The PNG export failed", error))
				.finally(() => (exporting.current = false));
		} else download(new Blob([exportSvg(root, {ground: toolbar?.export?.ground})], {type: "image/svg+xml"}), name);
	};

	return (
		<div data-viz-ghost={toolbar ? "" : undefined} style={spec.width == null ? undefined : {width: spec.width}}>
			<Figure headline={headline} subtitle={subtitle} caption={footerLine}>
				{/* A guide box down the side reads against the middle of the panel, the way ggplot sets it. */}
				<div className={onSide ? "flex min-w-0 items-center gap-4" : "flex min-w-0 flex-col gap-2"}>
					{legendsFirst && legends}
					{/*
					  Measured here instead of at the figure, which is the box a side guide narrows.

					  A stated width sizes the figure. The panel takes what the row leaves it, and reading
					  the figure's own number drew the plot out under the guides beside it.
					*/}
					<div
						ref={holder}
						className="min-w-0 flex-1"
						style={toolbar ? {position: "relative"} : undefined}
						onClick={clearSelect}
						{...(onSelect ? gesture : {})}
					>
						{panels}
						{toolbar && stripAt && (
							<Toolbar
								at={stripAt}
								options={toolbar}
								view={toolView}
								onView={changeView}
								drag={drag}
								palettes={paletteOptions(toolbar.palette?.options, {
									magnitude: firstFrame?.traces.some((trace) => trace.colorField?.numeric) ?? false,
									centered: (chosen ?? palettesFor({dark})).center !== undefined,
								})}
								facetBy={facetBy}
								facet={{by: spec.facet?.by ?? null, columns: spec.facet?.columns}}
								viewLocked={panelCount > 1 ? "A faceted figure keeps its panels at rest" : undefined}
								facetLocked={authored.sides?.length ? "A facet draws no side panels" : undefined}
								onZoom={(factor) => soleArea && view.zoomBy(factor, soleArea)}
								onReset={view.reset}
								onExport={exportAs}
							/>
						)}
					</div>
					{!legendsFirst && legends}
				</div>
			</Figure>
		</div>
	);
}
