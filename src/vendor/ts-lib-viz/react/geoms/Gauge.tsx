/**
 * One reading against a stated range, as an arc with the number under it.
 *
 * The track states where the ends are. A scale ring outside it sections the range.
 */

import {dialLayout, gaugeAngle, polarPoint, GAUGE_SWEEP, type RingLayout} from "../../core/internal.js";

export interface GaugeProps {
	value: number;
	/** Low and high end of the dial, in the measure's own units. */
	range: [number, number];
	width: number;
	height: number;
	/** Ink on the arc the reading sweeps. */
	color: string;
	/** Ink on the track behind it, which is the page's own muted tone. */
	trackColor?: string;
	/** Weight of both arcs, in pixels. */
	thickness?: number;
	opacity?: number;
	/** How far the dial turns, in degrees. Default 180. */
	sweep?: number;
	/** How much of the room the dial takes, as a fraction. Under 1 leaves space for a scale ring. */
	radius?: number;
	/** Sections the scale ring is cut into. Absent draws no ring. */
	bands?: number;
	/** The magnitude map a section reads at its own midpoint. */
	ramp?: (at: number) => string;
	/**
	 * The number written under the arc.
	 *
	 * `format` takes the reading in its own units. `fontSize` is the axis size, and the number draws
	 * well above it. `wanted` decides whether the reading gets its number.
	 */
	numbers?: {format: (value: number) => string; wanted?: (value: number) => boolean; color?: string; fontSize: number};
	/** The measure's name, written under the number. */
	label?: string;
}

/** How much larger the reading draws than the panel's axis type. */
const NUMBER_SCALE = 2.6;

/** Weight of an arc where the author states none, in pixels. */
const WEIGHT = 18;

/** Gap between the dial and the scale ring outside it, in pixels. */
const SCALE_GAP = 6;

/** Weight of the scale ring, in pixels. */
const RING_WEIGHT = 7;

/** Gap between one section of the scale ring and the next, in radians. */
const SECTION_GAP = 0.02;

/** A whole turn, in radians, less the rounding a sum of angles leaves. */
const FULL_TURN = Math.PI * 2 - 1e-9;

/**
 * The two range ends as text, in panel pixels.
 *
 * A wrapped dial writes them outside the ring. A half dial writes them a line under the round cap.
 */
function rangeEnds(
	layout: RingLayout,
	range: [number, number],
	sweep: {start: number; turn: number},
	room: {ring: number; weight: number},
	numbers?: GaugeProps["numbers"],
): {text: string; x: number; y: number; anchor?: "start" | "end"}[] {
	const type = numbers?.fontSize ?? 11;
	const wrapped = sweep.turn > Math.PI;
	const closed = sweep.turn >= FULL_TURN;
	return range.map((end, side) => {
		const angle = side === 0 ? sweep.start : sweep.start + sweep.turn;
		const text = numbers ? numbers.format(end) : String(end);
		if (wrapped) {
			const on = polarPoint(layout, layout.outer + room.ring + type * 1.6, angle);
			/* A closed ring puts both ends at its seam. The low end writes left of it and the high end right. */
			if (closed)
				return {
					text,
					x: on.x + (side === 0 ? -type : type) / 2,
					y: on.y + type * 0.35,
					anchor: side === 0 ? "end" : "start",
				};
			return {text, x: on.x, y: on.y + type * 0.35};
		}
		const under = polarPoint(layout, (layout.inner + layout.outer + room.ring) / 2, angle);
		return {text, x: under.x, y: layout.cy + room.weight / 2 + type * 1.5};
	});
}

/** The reading's ink. Over a scale ring it takes the hue of the section it lands in. */
function readingHue(fraction: number, color: string, bands?: number, ramp?: (at: number) => string): string {
	if (!bands || !ramp) return color;
	const landed = Math.min(bands - 1, Math.floor(fraction * bands));
	return ramp((landed + 0.5) / bands);
}

/*
  A dial carrying no number is a stat tile with decoration, and the critic reports it.

  See the ADR "Polar is permitted where the figure writes its numbers".
*/
export function Gauge({
	value,
	range,
	width,
	height,
	color,
	trackColor,
	thickness = WEIGHT,
	opacity,
	sweep,
	radius,
	bands,
	ramp,
	numbers,
	label,
}: GaugeProps) {
	const turn = sweep == null ? GAUGE_SWEEP : (Math.min(sweep, 360) * Math.PI) / 180;
	const ringRoom = bands ? SCALE_GAP + RING_WEIGHT : 0;
	const layout = dialLayout(width, height, thickness, turn, radius ?? 1);
	if (layout.outer <= 0) return null;

	const start = -turn / 2;
	const at = gaugeAngle(value, range, turn);
	const ringRadius = layout.outer + ringRoom - RING_WEIGHT / 2;
	const wrapped = turn > Math.PI;

	/** One arc along a single radius, which takes a round cap at each end. A full turn draws as two halves. */
	const arc = (reach: number, from: number, to: number): string => {
		const head = polarPoint(layout, reach, from);
		const tail = polarPoint(layout, reach, to);
		if (to - from >= FULL_TURN) {
			const half = polarPoint(layout, reach, from + Math.PI);
			return `M ${head.x} ${head.y} A ${reach} ${reach} 0 1 1 ${half.x} ${half.y} A ${reach} ${reach} 0 1 1 ${head.x} ${head.y}`;
		}
		return `M ${head.x} ${head.y} A ${reach} ${reach} 0 ${to - from > Math.PI ? 1 : 0} 1 ${tail.x} ${tail.y}`;
	};

	const ends = rangeEnds(layout, range, {start, turn}, {ring: ringRoom, weight: thickness}, numbers);

	const cuts = bands ?? 1;
	const reading = readingHue((at - start) / turn, color, bands, ramp);
	const sections = Array.from({length: bands ?? 0}, (_, index) => ({
		key: index,
		path: arc(
			ringRadius,
			start + (index / cuts) * turn + SECTION_GAP,
			start + ((index + 1) / cuts) * turn - SECTION_GAP,
		),
		hue: ramp?.((index + 0.5) / cuts) ?? color,
	}));

	const numberY = wrapped ? layout.cy : layout.cy - layout.outer * 0.3;

	return (
		<>
			<g data-geom="gauge" fill="none" strokeLinecap="round">
				<path
					d={arc(layout.labelRadius, start, start + turn)}
					stroke={trackColor ?? "currentColor"}
					strokeOpacity={0.12}
					strokeWidth={thickness}
				/>
				{/* A reading at the low end sweeps nothing. Its cap alone would read as a value. */}
				{at > start && (
					<path
						d={arc(layout.labelRadius, start, at)}
						stroke={reading}
						strokeOpacity={opacity}
						strokeWidth={thickness}
					/>
				)}
			</g>

			{sections.length > 0 && (
				<g data-geom="gauge-scale" fill="none" strokeWidth={RING_WEIGHT}>
					{sections.map((section) => (
						<path key={section.key} d={section.path} stroke={section.hue} />
					))}
				</g>
			)}

			<g pointerEvents="none" textAnchor="middle" fontSize={numbers?.fontSize}>
				{ends.map((end, side) => (
					<text
						key={side === 0 ? "low" : "high"}
						x={end.x}
						y={end.y}
						textAnchor={end.anchor}
						fill={numbers?.color ?? "var(--viz-ink-muted)"}
					>
						{end.text}
					</text>
				))}
				{numbers && (numbers.wanted?.(value) ?? true) && (
					<text
						x={layout.cx}
						y={numberY}
						fill={numbers.color ?? "var(--viz-ink)"}
						fontSize={numbers.fontSize * NUMBER_SCALE}
						dominantBaseline="central"
					>
						{numbers.format(value)}
					</text>
				)}
				{label && (
					<text x={layout.cx} y={numberY + (numbers?.fontSize ?? 11) * 2.2} fill="var(--viz-ink-muted)" opacity={0.7}>
						{label}
					</text>
				)}
			</g>
		</>
	);
}
