/**
 * The frame's arithmetic, apart from its drawing.
 *
 * Axis specs, tick stepping and the plot area inside a margin. The frame derivation and the zoom
 * pass read these without a DOM.
 */

import {
	scaleBand,
	scaleLinear,
	scaleLog,
	scaleSqrt,
	scaleSymlog,
	scaleUtc,
	type ScaleContinuousNumeric,
} from "d3-scale";

import {METRICS, type Metrics} from "./sizing.js";
import type {SidePanel} from "./spec.js";
import {compactFor} from "./tick-format.js";
import {isLog, TRANSFORMS, transformOf, type AxisTransform} from "./transform.js";

/**
 * Tick length and type size an axis falls back to.
 *
 * The regular column of `METRICS`. A spec built with metrics has its own resolved values.
 */
export const TICK_LEN = METRICS.regular.tickLength;
export const TICK_PX = METRICS.regular.axis;

/**
 * How far above the plot area a vertical axis title draws.
 *
 * `Frame` draws the title at this offset and the critic measures the top tick label against it.
 */
export const Y_TITLE_ABOVE = 5;

/**
 * How an axis draws itself, apart from what it measures.
 *
 * `labelTicks` is off for an inner panel of a small multiple. The dashes stay.
 */
export interface AxisChrome {
	labelTicks?: boolean;
	/** Width of the rule and the ticks. A vertical axis draws its rule only where this is set. */
	lineWidth?: number;
	tickLength?: number;
	/** Which side of the rule the ticks fall on. */
	tickSide?: "out" | "in";
	/** Degrees the tick labels turn, counterclockwise, keeping the end of the label at the tick. */
	tickAngle?: number;
	/** Where the title sits along the rule. A vertical title turns to run along its own axis. */
	titleAlign?: "start" | "center" | "end";
	fontSize?: number;
	/**
	 * Weight of the tick and title ink. Muted is the default the ten rules ask for.
	 *
	 * Strong pulls the text up to geom ink. A band axis carrying identity is read as much as the
	 * cells beside it, and muted labels on a grid of categories read as chrome.
	 */
	ink?: "muted" | "strong";
	grid?: boolean;
	minorGrid?: boolean;
}

export interface LinearAxisSpec extends AxisChrome {
	domain: [number, number];
	label?: string;
	/** Shorthand for `transform: "log10"`. */
	log?: boolean;
	/** How positions map. A stated transform wins over `log`. */
	transform?: AxisTransform;
	/** Whether the axis runs high to low. */
	reverse?: boolean;
	/**
	 * Whether the domain is epoch milliseconds, read as dates.
	 *
	 * A sibling of `log`. It decides the scale, and eighteen months wants monthly ticks. Read in
	 * UTC.
	 */
	time?: boolean;
	/**
	 * Whether a value outside the domain draws at the end of the scale. On by default. A caller
	 * narrowing the domain turns this off and clips the plot area.
	 */
	clamp?: boolean;
	/** A reading past this range draws at its nearer end, in data units. ggplot's `oob = squish`. A zoom keeps it. */
	squish?: [number, number];
	/** Labeled ticks wanted. A log axis reads this as a cap on the decades shown. */
	tickCount?: number;
	/** Interval between labeled ticks, in data units. Takes precedence over `tickCount`. */
	tickStep?: number;
	/** Unlabeled subdivisions between the labeled ticks. On by default. */
	minorTicks?: boolean;
	/** Labeled ticks, in data units. Over `tickStep` and `tickCount`. */
	breaks?: readonly number[];
	/** Unlabeled ticks, in data units. Over `minorTicks`. */
	minorBreaks?: readonly number[];
	format?: (value: number) => string;
	/** What a tick is written as, keyed as `String(value)` writes it. Over `format`. */
	names?: Record<string, string>;
}

export interface BandAxisSpec extends AxisChrome {
	/** Categories in the order they should appear. */
	values: string[];
	label?: string;
	padding?: number;
	/**
	 * Breaks in the band, each the index in `values` the break falls before.
	 *
	 * What `gaps_row` states. A break is room and the bands narrow to pay for it.
	 */
	gaps?: number[];
	/**
	 * Pixels a break takes.
	 *
	 * Resolved by the frame off the panel's metrics. The band arithmetic and the content-fit sum
	 * read one number.
	 */
	gapSize?: number;
	/**
	 * What a category is written as, where that differs from its value.
	 *
	 * Drawn text. `values` stays the column's own strings. A category with no entry is written as
	 * itself.
	 */
	names?: Record<string, string>;
}

export type AxisSpec = LinearAxisSpec | BandAxisSpec;

export const isBand = (spec: AxisSpec): spec is BandAxisSpec => "values" in spec;

export interface AxisEnd {
	axis: "x" | "y";
	end: "low" | "high";
	text: string;
}

export interface FrameNote {
	text: string;
	/** Data coordinates. The note survives a rescale. */
	at: {x: number | string; y: number | string};
	toward?: {x: number | string; y: number | string};
	align?: "start" | "middle" | "end";
	/** Position in the plot's own list. A note moved on the chart writes back to its record. */
	source: number;
}

/** A note after a drag, in the units it was written in. */
export interface MovedNote {
	source: number;
	at: {x: number | string; y: number | string};
	toward?: {x: number | string; y: number | string};
}

export type Scale = (value: number | string) => number;

/** The chrome with each fallback taken. The arithmetic reads numbers. */
export interface Chrome {
	lineWidth: number;
	tickLength: number;
	tickSide: "out" | "in";
	tickAngle: number;
	titleAlign: "start" | "center" | "end";
	fontSize: number;
	rule: boolean;
	ink: "muted" | "strong";
	grid: boolean;
	minorGrid: boolean;
}

export const chromeOf = (spec: AxisSpec, titleAlign: "start" | "center" | "end"): Chrome => ({
	lineWidth: spec.lineWidth ?? 1,
	tickLength: spec.tickLength ?? TICK_LEN,
	tickSide: spec.tickSide ?? "out",
	tickAngle: spec.tickAngle ?? 0,
	titleAlign: spec.titleAlign ?? titleAlign,
	fontSize: spec.fontSize ?? TICK_PX,
	ink: spec.ink ?? "muted",
	rule: spec.lineWidth != null,
	grid: spec.grid ?? false,
	minorGrid: spec.minorGrid ?? false,
});

/**
 * Rough glyph width at the tick size. Reserving room costs no text measurement.
 *
 * Slightly over the average. A label wider than its room draws over whatever is outside the
 * margin.
 */
const CHAR_W = 0.62;

/**
 * How wide a run of characters draws at a given type size.
 *
 * Anything reserving room for text reads this one estimate.
 */
export const textRun = (characters: number, fontSize: number): number => characters * fontSize * CHAR_W;

/**
 * Gap between a tick and the label beside it, in pixels.
 *
 * Read by the drawing and by the room reserved for it. One number for both.
 */
export const LABEL_GAP = 4;

/**
 * Room the ticks and their labels take outside the plot area.
 *
 * A turned label reaches across. The room it needs is the longest label's width with the turn
 * applied.
 */
export function tickRoom(chrome: Chrome, labeled: boolean, longest: number, axis: "x" | "y"): number {
	const beyond = chrome.tickSide === "out" ? chrome.tickLength : 0;
	if (!labeled) return beyond;

	const line = chrome.fontSize;
	const run = textRun(longest, chrome.fontSize);
	const radians = (chrome.tickAngle * Math.PI) / 180;
	const upright = axis === "x" ? line : run;
	const across = axis === "x" ? run : line;
	const reach = Math.abs(Math.cos(radians)) * upright + Math.abs(Math.sin(radians)) * across;

	return beyond + reach + LABEL_GAP;
}

/**
 * Room one label takes along its own axis.
 *
 * The arithmetic above with the axes swapped. A column label needs its whole run and a row label
 * needs one line.
 */
export function bandReach(chrome: Chrome, longest: number, axis: "x" | "y"): number {
	const line = chrome.fontSize;
	const run = textRun(longest, chrome.fontSize);
	const radians = (chrome.tickAngle * Math.PI) / 180;
	const flat = axis === "x" ? run : line;
	const turned = axis === "x" ? line : run;

	return Math.abs(Math.cos(radians)) * flat + Math.abs(Math.sin(radians)) * turned;
}

/**
 * Room one axis needs, for a caller setting the frame's margin.
 *
 * A facet shares one margin across its panels. The chrome belongs to the axis.
 */
/**
 * Room a title takes past its own line of type.
 *
 * Half of it opens the gap after the tick labels. The other half is the margin past the title.
 */
export const TITLE_PAD = 8;

/** Share of a line of type above its baseline. The rest hangs below it. */
export const ASCENT = 0.75;

export function axisRoom(
	spec: AxisSpec,
	axis: "x" | "y",
	/** Longest label in characters, which a caller knows for categories and guesses for numbers. */
	longest: number,
	hasTitle: boolean,
): number {
	const chrome = chromeOf(spec, "end");
	return tickRoom(chrome, spec.labelTicks !== false, longest, axis) + (hasTitle ? chrome.fontSize + TITLE_PAD : 0);
}

/*
  The polar arithmetic. One layout answers the label radius and a slice's room.

  Angles run clockwise from twelve o'clock, in radians. Screen coordinates are `sin` across and
  `-cos` down.
*/

/** Room a ring leaves between its outer edge and the panel, in pixels. */
export const POLAR_INSET = 10;

/** Where a slice's label sits, as a fraction of the way from the hole to the outer edge. */
const LABEL_AT = 0.68;

/** A ring's center, its two radii, and the radius its labels sit on. */
export interface RingLayout {
	cx: number;
	cy: number;
	outer: number;
	/** Zero on a pie. The hole, resolved from the fraction `innerRadius` states. */
	inner: number;
	labelRadius: number;
}

/**
 * Places a ring in a panel of this size.
 *
 * The outer radius comes off the shorter side. `hole` is a fraction of it. Zero draws a pie.
 */
export function ringLayout(width: number, height: number, hole = 0): RingLayout {
	const outer = Math.max(0, Math.min(width, height) / 2 - POLAR_INSET);
	const inner = Math.min(Math.max(0, hole), 0.95) * outer;
	return {
		cx: width / 2,
		cy: height / 2,
		outer,
		inner,
		labelRadius: inner + (outer - inner) * LABEL_AT,
	};
}

/** One slice's share of the turn, from one angle to the next. */
export interface Slice {
	from: number;
	to: number;
	/** Halfway between the two, which is where a label goes. */
	mid: number;
}

/**
 * Divides a full turn between the values, in arrival order.
 *
 * A negative reading takes no arc. An empty total returns no slices.
 */
export function sliceAngles(values: readonly number[]): Slice[] {
	const shares = values.map((value) => Math.max(0, value));
	const total = shares.reduce((sum, share) => sum + share, 0);
	if (!(total > 0)) return [];

	const out: Slice[] = [];
	let at = 0;
	for (const share of shares) {
		const to = at + (share / total) * Math.PI * 2;
		out.push({from: at, to, mid: (at + to) / 2});
		at = to;
	}
	return out;
}

/** Where an angle at this radius falls, in the panel's own pixels. */
export const polarPoint = (layout: RingLayout, radius: number, angle: number): {x: number; y: number} => ({
	x: layout.cx + radius * Math.sin(angle),
	y: layout.cy - radius * Math.cos(angle),
});

/**
 * Joins two angles at one radius, as an SVG path.
 *
 * The curve is a quadratic bending toward the center. A half-turn link passes through it.
 */
export function linkPath(layout: RingLayout, radius: number, from: number, to: number): string {
	const head = polarPoint(layout, radius, from);
	const tail = polarPoint(layout, radius, to);
	return `M ${head.x} ${head.y} Q ${layout.cx} ${layout.cy} ${tail.x} ${tail.y}`;
}

/**
 * The path of one arc, as SVG.
 *
 * A ring with a hole draws two arcs and two edges. A pie closes through the center.
 */
export function arcPath(layout: RingLayout, from: number, to: number): string {
	/* A full turn ends where it starts, and an arc between one point and itself draws nothing. Two halves close it. */
	if (to - from >= Math.PI * 2 - 1e-9) {
		const circle = (radius: number, sweep: 0 | 1) => {
			const head = polarPoint(layout, radius, from);
			const foot = polarPoint(layout, radius, from + Math.PI);
			return `M ${head.x} ${head.y} A ${radius} ${radius} 0 1 ${sweep} ${foot.x} ${foot.y} A ${radius} ${radius} 0 1 ${sweep} ${head.x} ${head.y} Z`;
		};
		return layout.inner <= 0 ? circle(layout.outer, 1) : `${circle(layout.outer, 1)} ${circle(layout.inner, 0)}`;
	}
	const large = to - from > Math.PI ? 1 : 0;
	const outerStart = polarPoint(layout, layout.outer, from);
	const outerEnd = polarPoint(layout, layout.outer, to);
	const sweep = `A ${layout.outer} ${layout.outer} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`;

	if (layout.inner <= 0) {
		return `M ${layout.cx} ${layout.cy} L ${outerStart.x} ${outerStart.y} ${sweep} Z`;
	}

	const innerEnd = polarPoint(layout, layout.inner, to);
	const innerStart = polarPoint(layout, layout.inner, from);
	return [
		`M ${outerStart.x} ${outerStart.y}`,
		sweep,
		`L ${innerEnd.x} ${innerEnd.y}`,
		`A ${layout.inner} ${layout.inner} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
		"Z",
	].join(" ");
}

/**
 * Slices with labels that fit around the ring.
 *
 * The label ring's circumference over one label's run. `longest` is the drawn text in characters.
 */
export function slicesLegible(layout: RingLayout, fontSize: number, longest: number): number {
	const ring = 2 * Math.PI * layout.labelRadius;
	const room = Math.max(textRun(longest, fontSize), fontSize);
	return Math.max(1, Math.floor(ring / room));
}

/**
 * How far a dial sweeps, in radians.
 *
 * A half turn, opening upward. The arc runs from nine o'clock over the top to three o'clock.
 */
export const GAUGE_SWEEP = Math.PI;

/**
 * Places a dial in a panel, with an arc of the stated weight.
 *
 * A dial draws a half circle above its center and its number below.
 */
export function dialLayout(
	width: number,
	height: number,
	weight: number,
	sweep: number = GAUGE_SWEEP,
	scale = 1,
): RingLayout {
	/* A half turn draws above its center. A wider one wraps below and takes the panel's middle. */
	const wrapped = sweep > Math.PI;
	const cy = height * (wrapped ? 0.5 : DIAL_BASELINE);
	const room = Math.min(width / 2, wrapped ? Math.min(cy, height - cy) : cy);
	const outer = Math.max(0, room - POLAR_INSET) * Math.max(0, scale);
	const inner = Math.max(0, outer - Math.min(weight, outer));
	return {cx: width / 2, cy, outer, inner, labelRadius: inner + (outer - inner) / 2};
}

/** Where a dial's center falls down the panel, leaving the rest for its number. */
const DIAL_BASELINE = 0.68;

/**
 * Where one reading falls along a dial, as an angle.
 *
 * Clamped to the ends. A reading outside the range draws pinned at the end.
 */
export function gaugeAngle(value: number, range: [number, number], sweep: number = GAUGE_SWEEP): number {
	const [lo, hi] = range;
	const span = hi - lo;
	const at = span === 0 ? 0.5 : Math.min(1, Math.max(0, (value - lo) / span));
	return -sweep / 2 + at * sweep;
}

/** Room outside a radar's outermost ring for the measure names at the spoke ends, in pixels. */
const SPOKE_LABEL = 22;

/** A radar's center, the radius of its outermost ring, and how many spokes divide the turn. */
export interface SpokeLayout {
	cx: number;
	cy: number;
	radius: number;
	spokes: number;
}

/**
 * Places a radar's rules in a panel.
 *
 * The radius comes off the shorter side. A measure's name draws outside the outermost ring and
 * the radius gives up that room first.
 */
export function spokeLayout(spokes: number, width: number, height: number): SpokeLayout {
	return {
		cx: width / 2,
		cy: height / 2,
		radius: Math.max(0, Math.min(width, height) / 2 - POLAR_INSET - SPOKE_LABEL),
		spokes: Math.max(1, spokes),
	};
}

/**
 * Where a reading falls along one spoke, in panel pixels.
 *
 * `at` runs zero to one along the rule. The first spoke points up and the rest divide the turn
 * clockwise.
 */
export function spokePoint(layout: SpokeLayout, index: number, at: number): {x: number; y: number} {
	const angle = (index / layout.spokes) * Math.PI * 2;
	const radius = layout.radius * at;
	return {x: layout.cx + radius * Math.sin(angle), y: layout.cy - radius * Math.cos(angle)};
}

/** Ticks a reader can count from: multiples of the step, landing on round numbers. */
export const TICK_LIMIT = 200;

export function everyStep(domain: [number, number], step: number): number[] | null {
	if (!(step > 0) || !Number.isFinite(step)) return null;
	const lo = Math.min(domain[0], domain[1]);
	const hi = Math.max(domain[0], domain[1]);
	// A step far below the span would generate thousands of ticks and paint the axis solid.
	if ((hi - lo) / step > TICK_LIMIT) return null;

	const out: number[] = [];
	const first = Math.ceil(lo / step) * step;
	for (let at = first; at <= hi + step * 1e-9; at += step) {
		// Re-derived from the multiple. A 0.1 step stays off 0.30000004.
		out.push(Number((Math.round(at / step) * step).toPrecision(12)));
	}
	/* No multiple of the step lands inside. The caller falls back to the scale's own ticks. */
	return out.length === 0 ? null : out;
}

/**
 * Whole powers of the base on a log axis.
 *
 * `scaleLog.ticks()` returns the minor ticks between decades. Thinned past the cap.
 */
export function decades(all: number[], cap = 6, base: 2 | 10 = 10): number[] {
	const whole = all.filter((value) => {
		const log = base === 10 ? Math.log10(value) : Math.log2(value);
		return Math.abs(log - Math.round(log)) < 1e-9;
	});
	// A domain inside one decade has no whole ones. The minor ticks are the answer.
	if (whole.length < 2) return all.length <= cap ? all : thin(all, cap);
	return whole.length <= cap ? whole : thin(whole, cap);
}

const thin = (values: number[], cap: number): number[] =>
	values.filter((_, index) => index % Math.ceil(values.length / cap) === 0);

/**
 * Pseudo-log ticks: zero and the signed whole decades inside a domain.
 *
 * Past `perSide` decades a side the labels skip decades. Past a hundred they start at ten.
 */
function signedDecades(domain: [number, number], perSide = Infinity): number[] {
	const lo = Math.min(domain[0], domain[1]);
	const hi = Math.max(domain[0], domain[1]);
	const top = Math.floor(Math.log10(Math.max(Math.abs(lo), Math.abs(hi), 1)));
	const first = Number.isFinite(perSide) && top >= 2 ? 1 : 0;
	const stride = Math.max(1, Math.ceil((top + 1 - first) / perSide));
	const out = lo <= 0 && hi >= 0 ? [0] : [];
	for (let exponent = first; exponent <= top; exponent += stride) {
		for (const value of [-(10 ** exponent), 10 ** exponent]) if (value >= lo && value <= hi) out.push(value);
	}
	return out.sort((a, b) => a - b);
}

/** The d3 scale that draws a transform. */
const scaleFor = (transform: AxisTransform): ScaleContinuousNumeric<number, number> =>
	transform === "log10"
		? scaleLog()
		: transform === "log2"
			? scaleLog().base(2)
			: transform === "sqrt"
				? scaleSqrt()
				: transform === "pseudo_log"
					? scaleSymlog()
					: scaleLinear();

/**
 * The plot area inside a frame of this size.
 *
 * A caller that rewrites a domain has to know the pixels the rule runs between.
 */
export const innerSize = (width: number, height: number, margin: Edges) => ({
	width: Math.max(10, width - margin.left - margin.right),
	height: Math.max(10, height - margin.top - margin.bottom),
});

/** Tallest a fixed data aspect draws the plot area, as a multiple of its width. */
export const RATIO_CAP = 4;

/**
 * Plot-area height that holds a fixed data aspect. ggplot's `coord_fixed`.
 *
 * `ratio` is units of y per unit of x on screen, both in transformed space. Null over a band.
 */
export function fixedHeight(x: AxisSpec, y: AxisSpec, width: number, ratio: number): number | null {
	if (isBand(x) || isBand(y) || !(ratio > 0)) return null;
	const span = (spec: LinearAxisSpec) => {
		const {forward} = TRANSFORMS[transformOf(spec)];
		return Math.abs(forward(spec.domain[1]) - forward(spec.domain[0]));
	};
	const across = span(x);
	const down = span(y);
	return across > 0 && down > 0 && Number.isFinite(across) && Number.isFinite(down)
		? Math.min(width * ratio * (down / across), width * RATIO_CAP)
		: null;
}

/** Room taken off each edge, in the shape a margin already has. */
export interface Edges {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** One side panel with the box it draws in, in the frame's own coordinates. */
export interface SideRegion {
	panel: SidePanel;
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Room the side panels take off each edge.
 *
 * Answerable from the list alone. The panel size is derived before the frame exists.
 */
export function sideRoom(sides: readonly SidePanel[] | undefined): Edges {
	const held = sides ?? [];
	const total = (edge: SidePanel["position"]) =>
		held.reduce((sum, panel) => (panel.position === edge ? sum + Math.max(0, panel.size) : sum), 0);
	return {top: total("top"), right: total("right"), bottom: total("bottom"), left: total("left")};
}

/**
 * Where the side panels draw, and what the plot area keeps.
 *
 * A side takes its extent off its own edge before the margin. Two sides on one edge stack
 * outward.
 */
export function sideLayout(
	sides: readonly SidePanel[] | undefined,
	width: number,
	height: number,
	margin: Edges,
): {room: Edges; inner: {width: number; height: number}; inside: Edges; regions: SideRegion[]} {
	const held = sides ?? [];
	const room = sideRoom(held);
	const inner = innerSize(width - room.left - room.right, height - room.top - room.bottom, margin);

	/*
    Each edge splits in two -- the panels inside the axis labels and those past them.

    `inner` reads the totals. The run is outside panels, labels, inside panels, geoms.
  */
	const within = (panel: SidePanel) => panel.inside ?? panel.content.kind === "track";
	/* Carried with its place in the declaration. Two equal panels are two entries either way. */
	const on = (edge: SidePanel["position"], inside: boolean) =>
		held.flatMap((panel, source) => (panel.position === edge && within(panel) === inside ? [{panel, source}] : []));
	const spanOf = (edge: SidePanel["position"], inside: boolean) =>
		on(edge, inside).reduce((sum, {panel}) => sum + Math.max(0, panel.size), 0);

	const insideRoom: Edges = {
		top: spanOf("top", true),
		right: spanOf("right", true),
		bottom: spanOf("bottom", true),
		left: spanOf("left", true),
	};
	const origin = {x: room.left + margin.left, y: room.top + margin.top};

	/* Outward from the geoms. The running sum is what the earlier panels took. */
	const stacked = (edge: SidePanel["position"], inside: boolean) => {
		let running = 0;
		return on(edge, inside).map(({panel, source}) => {
			const before = running;
			running += Math.max(0, panel.size);
			return {panel, source, before, size: Math.max(0, panel.size)};
		});
	};

	/* The near edge of the geoms on each side. An inside panel stacks away from it. */
	const near = {
		top: origin.y,
		bottom: origin.y + inner.height,
		left: origin.x,
		right: origin.x + inner.width,
	};
	/* And the near edge of the labels, which is where an outside panel stacks away from. */
	const past = {
		top: room.top - insideRoom.top,
		bottom: near.bottom + insideRoom.bottom + margin.bottom,
		left: room.left - insideRoom.left,
		right: near.right + insideRoom.right + margin.right,
	};

	const across = (y: number, height: number) => ({x: origin.x, y, width: inner.width, height});
	const down = (x: number, width: number) => ({x, y: origin.y, width, height: inner.height});

	const regions: (SideRegion & {source: number})[] = [
		...stacked("top", true).map(({panel, source, before, size}) => ({
			panel,
			source,
			...across(near.top - before - size, size),
		})),
		...stacked("top", false).map(({panel, source, before, size}) => ({
			panel,
			source,
			...across(past.top - before - size, size),
		})),
		...stacked("bottom", true).map(({panel, source, before, size}) => ({
			panel,
			source,
			...across(near.bottom + before, size),
		})),
		...stacked("bottom", false).map(({panel, source, before, size}) => ({
			panel,
			source,
			...across(past.bottom + before, size),
		})),
		...stacked("left", true).map(({panel, source, before, size}) => ({
			panel,
			source,
			...down(near.left - before - size, size),
		})),
		...stacked("left", false).map(({panel, source, before, size}) => ({
			panel,
			source,
			...down(past.left - before - size, size),
		})),
		...stacked("right", true).map(({panel, source, before, size}) => ({
			panel,
			source,
			...down(near.right + before, size),
		})),
		...stacked("right", false).map(({panel, source, before, size}) => ({
			panel,
			source,
			...down(past.right + before, size),
		})),
	];

	/* Declaration order. The stacking rule reads it. */
	return {
		room,
		inner,
		inside: insideRoom,
		/* Back in declaration order, by each panel's own place in the list. */
		regions: regions.sort((a, b) => a.source - b.source).map(({source: _source, ...region}) => region),
	};
}

/** What a side panel is handed -- the geoms' own scales and the panel it draws for. */
export interface SideChildProps extends FrameChildProps {
	panel: SidePanel;
}

export interface FrameChildProps {
	x: Scale;
	y: Scale;
	/** The value at a pixel along each axis. A band axis answers its nearest category. */
	xInvert: (px: number) => number | string;
	yInvert: (px: number) => number | string;
	/** Category width on a banded axis, zero on a continuous one. */
	xBand: number;
	yBand: number;
	/** Distance between two neighboring band centers, one data unit along a band. Zero on a continuous axis. */
	xStep: number;
	yStep: number;
	width: number;
	height: number;
	/**
	 * Type and spacing for the size this panel came out at.
	 *
	 * A geom takes its radius as a prop. Handed down resolved, and one panel has one answer.
	 */
	metrics: Metrics;
}

// ---- Scale building ----------------------------------------------------------

/**
 * What decides where an axis puts a value, as a comparable string.
 *
 * A scale is rebuilt on each render. The four inputs below are the whole of the mapping.
 */
/** A rename table as a stable string. Declaration order stays out of the key. */
const namesKey = (names: Record<string, string> | undefined): string =>
	names
		? Object.keys(names)
				.sort()
				.map((key) => `${key}=${names[key]}`)
				.join(",")
		: "";

export const scaleKey = (spec: AxisSpec, range: [number, number]): string =>
	isBand(spec)
		? `band|${range[0]},${range[1]}|${spec.padding ?? 0.24}|${spec.values.join("\u0000")}|${(spec.gaps ?? []).join(
				",",
			)}|${spec.gapSize ?? 0}|${namesKey(spec.names)}`
		: `${keyOf(transformOf(spec))}${spec.reverse ? "|reversed" : ""}|${spec.time ? "time" : "plain"}|${
				spec.clamp === false ? "free" : "held"
			}|${spec.squish?.join(",") ?? ""}|${range[0]},${range[1]}|${spec.domain[0]},${spec.domain[1]}`;

const keyOf = (transform: AxisTransform): string =>
	transform === "identity" ? "linear" : transform === "log10" ? "log" : transform;

export interface Axis {
	scale: Scale;
	/** The value at a pixel, for a caller reading a drag back into the units it was made in. */
	invert: (px: number) => number | string;
	bandwidth: number;
	/** Distance between two neighboring band centers, zero on a continuous axis. */
	step: number;
	/** Ticks that carry a label, unless the caller asked for the dashes alone. */
	ticks: (number | string)[];
	labelTicks: boolean;
	/** Ticks drawn as a shorter dash with no label. The eye reads the interval between majors. */
	minor: number[];
	format: (value: number | string) => string;
	label?: string;
	chrome: Chrome;
}

export function buildAxis(
	spec: AxisSpec,
	range: [number, number],
	defaultTicks: number,
	titleAlign: "start" | "center" | "end",
): Axis {
	const chrome = chromeOf(spec, titleAlign);

	if (isBand(spec)) {
		/*
      A break takes its room out of the range and the bands step over what is left.

      The total is capped at half the span.
    */
		const span = range[1] - range[0];
		const toward = span >= 0 ? 1 : -1;
		const breaks = [...new Set(spec.gaps ?? [])].filter((at) => at > 0 && at < spec.values.length);
		const room = Math.min(breaks.length * (spec.gapSize ?? 0), Math.abs(span) / 2);
		const each = breaks.length > 0 ? room / breaks.length : 0;

		const band = scaleBand<string>()
			.domain(spec.values)
			.range([range[0], range[1] - toward * room])
			.padding(spec.padding ?? 0.24);

		const shift = new Map<string, number>();
		let running = 0;
		const at = new Set(breaks);
		spec.values.forEach((value, index) => {
			if (at.has(index)) running += each;
			shift.set(value, toward * running);
		});

		const center = (v: string) => (band(v) ?? 0) + band.bandwidth() / 2 + (shift.get(v) ?? 0);
		return {
			scale: (v) => center(String(v)),
			/* A band has no inverse. The nearest center stands in and a drag lands in one category. */
			invert: (px) =>
				spec.values.reduce(
					(best, value) => (Math.abs(center(value) - px) < Math.abs(center(best) - px) ? value : best),
					spec.values[0] ?? "",
				),
			bandwidth: band.bandwidth(),
			step: band.step(),
			ticks: spec.values,
			labelTicks: spec.labelTicks !== false,
			minor: [],
			format: (v) => spec.names?.[String(v)] ?? String(v),
			label: spec.label,
			chrome,
		};
	}

	const held = spec.clamp !== false;
	/* A reversed axis puts the low end of its domain at the far end of the rule. */
	const toward: [number, number] = spec.reverse ? [range[1], range[0]] : range;
	const [lo, hi] = [Math.min(spec.domain[0], spec.domain[1]), Math.max(spec.domain[0], spec.domain[1])];
	const inside = (values: readonly number[]) => values.filter((value) => value >= lo && value <= hi);
	const [floor, ceiling] = spec.squish
		? [Math.min(spec.squish[0], spec.squish[1]), Math.max(spec.squish[0], spec.squish[1])]
		: [-Infinity, Infinity];
	const pinned = (value: number) => Math.min(ceiling, Math.max(floor, value));

	/*
    Time as a scale, apart from a number format.

    d3 picks the interval off the span. Ticks come back as `Date` and leave here as epoch numbers.
  */
	if (spec.time) {
		const clock = scaleUtc().domain(spec.domain).range(toward).clamp(held);
		const asDate = clock.tickFormat();
		const write = spec.format ?? ((value: number) => asDate(new Date(value)));
		const at = (count: number) => clock.ticks(count).map((tick) => +tick);

		const wanted = spec.tickCount ?? defaultTicks;
		const major = spec.breaks
			? inside(spec.breaks)
			: ((spec.tickStep ? everyStep(spec.domain, spec.tickStep) : null) ?? at(wanted));
		const minor = (
			spec.minorBreaks ? inside(spec.minorBreaks) : spec.minorTicks === false ? [] : at(wanted * 4)
		).filter((value) => !major.includes(value));

		return {
			scale: (value) => clock(new Date(pinned(Number(value)))),
			invert: (px) => +clock.invert(px),
			bandwidth: 0,
			step: 0,
			ticks: major,
			labelTicks: spec.labelTicks !== false,
			minor,
			format: (value) => spec.names?.[String(value)] ?? write(Number(value)),
			label: spec.label,
			chrome,
		};
	}

	const transform = transformOf(spec);
	const scale = scaleFor(transform).domain(spec.domain).range(toward).clamp(held);
	/* A break the transform has no place for drops, the way a reading there does. */
	const {admits} = TRANSFORMS[transform];
	const placeable = (values: readonly number[]) => inside(values).filter(admits);

	const automatic = (): number[] => {
		if (isLog(transform)) return decades(scale.ticks(), spec.tickCount, transform === "log2" ? 2 : 10);
		const powers = transform === "pseudo_log" ? signedDecades(spec.domain, 4) : [];
		return powers.length >= 2 ? powers : scale.ticks(spec.tickCount ?? defaultTicks);
	};
	const stepped = spec.breaks ? placeable(spec.breaks) : spec.tickStep ? everyStep(spec.domain, spec.tickStep) : null;
	const major = stepped ?? automatic();

	/* The default formatter is picked after the ticks. Its decimals come off the gap between them.
	   An author's own format is left alone. */
	const format = spec.format ?? compactFor(major);

	/*
    Minors are what the majors left behind.

    On a log axis those are the 2, 3, 5 between decades. On a linear axis they subdivide the
    labeled interval.
  */
	const subdivisions = (): number[] =>
		isLog(transform)
			? scale.ticks()
			: transform === "pseudo_log"
				? signedDecades(spec.domain)
				: scale.ticks((spec.tickCount ?? defaultTicks) * 4);
	const minor = (
		spec.minorBreaks ? placeable(spec.minorBreaks) : spec.minorTicks === false ? [] : subdivisions()
	).filter((value) => !major.includes(value));

	/* A value the transform has no place for draws at the low end of the rule, where ggplot draws -Inf. */
	const place = (value: number) => (admits(value) ? scale(value) : toward[0]);

	return {
		scale: (v) => place(pinned(Number(v))),
		invert: (px) => scale.invert(px),
		bandwidth: 0,
		step: 0,
		ticks: major,
		labelTicks: spec.labelTicks !== false,
		minor,
		format: (v) => spec.names?.[String(v)] ?? format(Number(v)),
		label: spec.label,
		chrome,
	};
}

/** The longest label an axis draws, in characters. */
export const longestOf = (axis: Axis): number =>
	axis.ticks.reduce<number>((most, tick) => Math.max(most, axis.format(tick).length), 0);
