/**
 * Bars: banded, binned, stacked, dodged, with the interval and the readings that belong on them.
 *
 * One component, because a stack is a floor on the datum and not a payload of its own. There was a
 * second, `StackedBars`, taking a category with its segments; nothing ever built that shape, since
 * building it meant collapsing the trace per series that the legend, the color assignment and the
 * hover all read. A floor keeps the traces whole and makes a stack and a dodge the same kind of
 * change, so the second component went.
 *
 * Stacked segments are separate rounded blocks with a gap between them, instead of one contiguous
 * bar divided by borders. The gap does the work a border would, and it does it without adding a line
 * to read. Each segment keeps a floor height, so a one-percent share stays visible instead of
 * collapsing to a sliver that reads as absent; that distorts the smallest shares by design, and the
 * readout carries the figure. Fills are solid: a hatch or texture adds visual noise carrying no
 * data, and it breaks down at the small segment sizes a stack produces.
 *
 * The radius is a fixed six pixels instead of half the segment height. Proportional rounding turns
 * a short segment into a lozenge, and a column of lozenges reads as a row of tags instead of as a
 * quantity stacked up.
 *
 * A muted state lets one category read as the selection while the rest stay legible as context,
 * which is what makes a bar chart usable as a control instead of only as a readout.
 *
 * `Bars` draws its own interval and its own replicates where the data carries them. A reader meets a
 * bar, its whisker and the readings behind it as one geom, and a caller composing the three by hand
 * can put them out of step: the prototype's dose response did that, drawing whiskers beside bars it
 * had positioned separately. Both stay exported for a caller drawing either with no bar under it.
 */

import type {BarDatum, GeomHit, Scale} from "../../core/internal.js";

/** Matches --chart-radius-geom. Fixed, so a short geom stays a block instead of a lozenge. */
export const MARK_RADIUS = 6;

/** Paper between two neighbors, so a row of bins reads as separate counts. */
export const MARK_GAP = 3;

/** Widest a bar draws where the series states no thickness, in pixels. */
export const BAR_CAP = 40;

/**
 * Pixel distance between the closest pair of geoms.
 *
 * A banded scale hands its bandwidth in, and that is the whole slot. A binned bar sits on a value
 * scale, where the slot is the gap the scale puts between bin centers, and that gap is narrower than
 * the panel divided by the bin count whenever the domain runs past the data. Taking the closest pair
 * is what stops the widest bin from covering its neighbor.
 */
function pitchOf(data: BarDatum[], x: Scale, band: number): number {
	const centers = data
		.filter((d) => d.at != null)
		.map((d) => x(d.at as number))
		.sort((a, b) => a - b);
	if (centers.length < 2) return band;

	let closest = Infinity;
	for (let i = 1; i < centers.length; i++) closest = Math.min(closest, centers[i]! - centers[i - 1]!);
	return closest > 0 && Number.isFinite(closest) ? closest : band;
}

export type {BarDatum};

export interface BarsProps {
	data: BarDatum[];
	x: Scale;
	y: Scale;
	band: number;
	baseline?: number;
	color?: string;
	/** Widest a bar is drawn. The band bounds it where the band is narrower. */
	maxWidth?: number;
	/**
	 * Which slot of the band this series takes, where a dodge divided it. Absent takes the band whole.
	 *
	 * The core states which of how many and the arithmetic is here, since the band's width is the
	 * geom's own business, the way `maxWidth` is a cap the band bounds.
	 */
	slot?: {index: number; of: number; width?: number};
	/**
	 * Draws the geom across the frame instead of up it, the band running down the side.
	 *
	 * Read off the frame and not off the spec, since the frame refuses a transpose where the geoms
	 * read no shared pair. The arithmetic is the same either way round with the pair swapped, which is
	 * why this is a flag on the geom and not a second component.
	 */
	transposed?: boolean;
	/**
	 * Paper between two stacked segments, in pixels.
	 *
	 * A gap does the work a border between segments would and adds no line to read. Applied where a
	 * datum carries a floor, since a bar standing on the baseline has nothing to be set apart from.
	 */
	segmentGap?: number;
	/** Shortest a stacked segment draws, so a one-percent share stays visible instead of vanishing. */
	minSegment?: number;
	opacity?: number;
	/** Outline paint. Absent draws none, as ggplot's `color = NA` on a bar. */
	stroke?: string;
	/** Outline width in pixels, where `stroke` names a color. */
	lineWidth?: number;
	cap?: "full" | "top";
	/** Category drawn at full strength. The rest mute to context. */
	active?: string | null;
	/** The bar under the pointer, placed at the middle of its head. */
	onHover?: (hit: GeomHit<BarDatum> | null) => void;
	/** A bar clicked. The group it stands for is what a linked view filters on. */
	onSelect?: (hit: GeomHit<BarDatum>) => void;
}

export function Bars({
	data,
	x,
	y,
	band,
	baseline = 0,
	color = "var(--viz-ink)",
	maxWidth = BAR_CAP,
	slot,
	transposed = false,
	segmentGap = MARK_GAP,
	minSegment = 5,
	opacity = 1,
	stroke,
	lineWidth = 1,
	cap = "full",
	active,
	onHover,
	onSelect,
}: BarsProps) {
	/* The band's scale is whichever one the measure does not read, so the pitch comes off that one. */
	const along = transposed ? y : x;
	const whole = Math.max(1, Math.min(pitchOf(data, along, band) - MARK_GAP, maxWidth));
	/*
    The slot divides the geom's own width, so a dodge inside a narrow band stays inside the band.

    `slot.width` is how much of the band the set takes, which is what aligns a dodged geom with a
    wider one beside it. A datum's own `slotOf` and `slotAt` override the set's count and index, which
    is what `preserve: "total"` writes: the band divides by what it holds and the widths follow the count.
  */
	const spread = slot?.width == null ? whole : whole * slot.width;
	const slots = (d: BarDatum) => d.slotOf ?? slot?.of ?? 1;
	const widthOf = (d: BarDatum) => (slot ? Math.max(1, spread / slots(d) - MARK_GAP / 2) : whole);
	const offsetOf = (d: BarDatum) => (slot ? ((d.slotAt ?? slot.index) - (slots(d) - 1) / 2) * (spread / slots(d)) : 0);
	const measure = transposed ? x : y;
	const zero = measure(baseline);
	const hasActive = active != null;

	/* The dots spread across the bar's own width and not the whole band, so they sit over the geom. */
	const replicated = data.flatMap((d) =>
		d.values?.length ? [{category: d.category, values: d.values, band: widthOf(d), offset: offsetOf(d)}] : [],
	);

	return (
		<g>
			{data.map((d, index) => {
				/*
          A segment runs from its floor to its own top, and a bar with no floor runs from the ground.

          The gap comes off the segment and it keeps its middle, so a column of segments stays the
          height the readings add up to instead of drifting down by a gap a segment.
        */
				const stacked = d.floor != null;
				const foot = stacked ? measure(d.floor!) : zero;
				const top = measure(d.value + (d.floor ?? 0));
				const reach = Math.abs(foot - top);
				const length = stacked ? Math.max(minSegment, reach - segmentGap) : Math.max(1, reach);
				const width = widthOf(d);
				const cx = along(d.at ?? d.category) + offsetOf(d);
				/* A quarter of the smaller side at most. A narrow bar or a short segment keeps its corners square. */
				const radius = Math.min(MARK_RADIUS, width / 4, length / 4);
				const dim = hasActive && d.category !== active;

				/*
          One box, sized by role and then handed to the screen the way round the frame drew.

          `width` is the band's extent and `length` the measure's, so the swap is one expression and
          not a second branch through the rounding, the gap and the muting below.
        */
				const start = Math.min(foot, top) + (stacked ? (reach - length) / 2 : 0);
				const box = transposed
					? {x: start, y: cx - width / 2, w: length, h: width}
					: {x: cx - width / 2, y: start, w: width, h: length};
				const head = transposed ? (top >= foot ? "right" : "left") : top <= foot ? "top" : "bottom";
				const hit = {datum: d, index, at: transposed ? {x: top, y: cx} : {x: cx, y: top}};

				return (
					<g
						key={d.category}
						data-geom="bar"
						onMouseEnter={() => onHover?.(hit)}
						onMouseLeave={() => onHover?.(null)}
						onClick={onSelect ? () => onSelect(hit) : undefined}
						style={onSelect ? {cursor: "pointer"} : undefined}
					>
						{cap === "top" ? (
							// Rounded head, square foot: the bar sits on the baseline instead of floating.
							<path
								d={roundedHead(box, radius, head)}
								fill={dim ? "var(--viz-rule)" : (d.color ?? color)}
								fillOpacity={opacity}
								{...(stroke ? {stroke, strokeWidth: lineWidth} : {})}
							/>
						) : (
							<rect
								x={box.x}
								y={box.y}
								width={box.w}
								height={box.h}
								rx={radius}
								fill={dim ? "var(--viz-rule)" : (d.color ?? color)}
								fillOpacity={opacity}
								{...(stroke ? {stroke, strokeWidth: lineWidth} : {})}
							/>
						)}
					</g>
				);
			})}
			{data.some((d) => d.error != null) && <ErrorBars data={data} x={x} y={y} transposed={transposed} />}
			{replicated.length > 0 && <ReplicateDots data={replicated} x={x} y={y} band={whole} transposed={transposed} />}
		</g>
	);
}

/**
 * A block standing on a baseline, rounded where it stops and square where it sits.
 *
 * The radius clamps to the bar's own width and height, so a two-pixel bin in a widget keeps a corner
 * proportional to itself while a full-width bar takes the fixed six.
 */
export function roundedTop(x: number, y: number, w: number, h: number, r: number): string {
	const radius = Math.min(r, w / 2, h);
	return [
		`M${x},${y + h}`,
		`L${x},${y + radius}`,
		`Q${x},${y} ${x + radius},${y}`,
		`L${x + w - radius},${y}`,
		`Q${x + w},${y} ${x + w},${y + radius}`,
		`L${x + w},${y + h}`,
		"Z",
	].join("");
}

/** A block rounded at its head, the end away from the baseline, and square at its foot. */
function roundedHead(
	box: {x: number; y: number; w: number; h: number},
	r: number,
	head: "top" | "bottom" | "left" | "right",
): string {
	const {x, y, w, h} = box;
	if (head === "top") return roundedTop(x, y, w, h, r);
	const radius = head === "bottom" ? Math.min(r, w / 2, h) : Math.min(r, h / 2, w);
	const path =
		head === "bottom"
			? [
					`M${x},${y}`,
					`L${x},${y + h - radius}`,
					`Q${x},${y + h} ${x + radius},${y + h}`,
					`L${x + w - radius},${y + h}`,
					`Q${x + w},${y + h} ${x + w},${y + h - radius}`,
					`L${x + w},${y}`,
				]
			: head === "right"
				? [
						`M${x},${y}`,
						`L${x + w - radius},${y}`,
						`Q${x + w},${y} ${x + w},${y + radius}`,
						`L${x + w},${y + h - radius}`,
						`Q${x + w},${y + h} ${x + w - radius},${y + h}`,
						`L${x},${y + h}`,
					]
				: [
						`M${x + w},${y}`,
						`L${x + radius},${y}`,
						`Q${x},${y} ${x},${y + radius}`,
						`L${x},${y + h - radius}`,
						`Q${x},${y + h} ${x + radius},${y + h}`,
						`L${x + w},${y + h}`,
					];
	return [...path, "Z"].join("");
}

export interface ErrorBarsProps {
	data: BarDatum[];
	x: Scale;
	y: Scale;
	capWidth?: number;
	color?: string;
	/** The band runs down the frame and the measure runs across. Matches `Bars`. */
	transposed?: boolean;
}

export function ErrorBars({data, x, y, capWidth = 7, color = "var(--viz-ink)", transposed = false}: ErrorBarsProps) {
	const along = transposed ? y : x;
	const measure = transposed ? x : y;
	return (
		<g stroke={color} strokeWidth={1.1} strokeLinecap="round" fill="none">
			{data.map((d) => {
				if (d.error == null || d.error <= 0) return null;
				const band = along(d.at ?? d.category);
				const hi = measure(d.value + d.error);
				const lo = measure(d.value - d.error);
				const half = capWidth / 2;
				/* The whisker runs along the measure and each cap crosses the band. */
				const whisker = transposed ? {x1: hi, x2: lo, y1: band, y2: band} : {x1: band, x2: band, y1: hi, y2: lo};
				const capAt = (at: number) =>
					transposed
						? {x1: at, x2: at, y1: band - half, y2: band + half}
						: {x1: band - half, x2: band + half, y1: at, y2: at};
				return (
					<g key={d.category}>
						<line {...whisker} />
						<line {...capAt(hi)} />
						<line {...capAt(lo)} />
					</g>
				);
			})}
		</g>
	);
}

/** Replicate values behind each bar, so the reader sees n instead of trusting a whisker. */
export interface ReplicateDotsProps {
	/** A group's own `band` and `offset` win over the props. A dodge with uneven slots sets both per group. */
	data: {category: string; values: number[]; band?: number; offset?: number}[];
	x: Scale;
	y: Scale;
	band: number;
	/** Pixels off the category center. The dots follow a dodged geom into its slot. */
	offset?: number;
	color?: string;
	/** The band runs down the frame and the measure runs across. Matches `Bars`. */
	transposed?: boolean;
}

export function ReplicateDots({
	data,
	x,
	y,
	band,
	offset: shift = 0,
	color = "var(--viz-ink)",
	transposed = false,
}: ReplicateDotsProps) {
	const along = transposed ? y : x;
	const measure = transposed ? x : y;
	return (
		<g>
			{data.map((group) => {
				const jitter = Math.min((group.band ?? band) * 0.32, 11);
				return group.values.map((value, i) => {
					// Deterministic spread. The dots hold still across renders.
					const offset = group.values.length === 1 ? 0 : (i / (group.values.length - 1) - 0.5) * 2 * jitter;
					const across = along(group.category) + (group.offset ?? shift) + offset;
					const at = measure(value);
					return (
						<circle
							key={`${group.category}-${i}`}
							cx={transposed ? at : across}
							cy={transposed ? across : at}
							r={1.9}
							fill={color}
							fillOpacity={0.5}
						/>
					);
				});
			})}
		</g>
	);
}
