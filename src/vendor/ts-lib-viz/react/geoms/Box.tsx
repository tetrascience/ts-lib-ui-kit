/**
 * Box and whisker, drawn as a thick colored block.
 *
 * The interquartile range renders as a thick colored block carrying the same corner radius as the
 * bars, so the whole set reads as one system. Thick and short, because that is what a box plot
 * claims: the middle half of the distribution lives between these two points.
 *
 * The radius stays a fixed three pixels. Rounding proportional to the geom turns a short box into a
 * lozenge and a tall one into a capsule, so a series of boxes stops reading as one kind of geom.
 *
 * The remaining geoms stay thin against it. Whiskers are hairlines, the median is a light tick that
 * spans the block, and outliers are open circles so a dense tail stays countable.
 */

import type {BoxDatum, GeomHit, Scale, ValueRamp} from "../../core/internal.js";

/** Matches --chart-radius-thin. */
const BOX_RADIUS = 3;

export type {BoxDatum};

export interface BoxProps {
	data: BoxDatum[];
	x: Scale;
	y: Scale;
	band: number;
	/** Maps a group's median, in the units it carries, to a color. */
	ramp: ValueRamp;
	/**
	 * Thickness of the interquartile block.
	 *
	 * Unset, the block takes most of its slot and stops at thirteen pixels, which is the proportion
	 * that leaves air between boxes on a crowded axis. Set, it is the width the author asked for, and
	 * the slot is the only thing that still bounds it: a box wider than its slot overlaps its neighbor.
	 */
	thickness?: number;
	/** Opacity of the interquartile block. */
	opacity?: number;
	/** Outline paint on the block, and its width. Absent draws none. */
	stroke?: string;
	lineWidth?: number;
	/**
	 * Draws the summary across the frame instead of up it, the band running down the side.
	 *
	 * Read off the frame, since it refuses a transpose where the geoms read no shared pair. The five
	 * numbers land the same way round either way: the same walk with the pair swapped.
	 */
	transposed?: boolean;
	showOutliers?: boolean;
	showMedian?: boolean;
	/** The box under the pointer, placed at its median. */
	onHover?: (hit: GeomHit<BoxDatum> | null) => void;
	/** A box clicked. The group it summarises is what a linked view filters on. */
	onSelect?: (hit: GeomHit<BoxDatum>) => void;
}

export function Box({
	data,
	x,
	y,
	band,
	ramp,
	thickness,
	opacity,
	stroke,
	lineWidth = 1,
	transposed = false,
	showOutliers = true,
	showMedian = true,
	onHover,
	onSelect,
}: BoxProps) {
	const width = thickness != null ? Math.min(band, thickness) : Math.min(band * 0.62, 13);
	/* The band's scale is whichever one the five numbers do not read. */
	const along = transposed ? y : x;
	const measure = transposed ? x : y;

	/*
     Two helpers name the roles, so the body below reads once for both ways round.

     `block` is the interquartile rectangle and `rule` a line from one reading to another at the
     band's own position. Everything else is a point on the two scales.
   */
	const block = (at: number, from: number, to: number, thick: number, long: number) =>
		transposed
			? {x: Math.min(from, to), y: at - thick / 2, width: long, height: thick}
			: {x: at - thick / 2, y: Math.min(from, to), width: thick, height: long};
	const rule = (at: number, from: number, to: number) =>
		transposed ? {x1: from, x2: to, y1: at, y2: at} : {x1: at, x2: at, y1: from, y2: to};
	const cross = (at: number, half: number, on: number) =>
		transposed ? {x1: on, x2: on, y1: at - half, y2: at + half} : {x1: at - half, x2: at + half, y1: on, y2: on};

	return (
		<g>
			{data.map((d, index) => {
				const cx = along(d.category);
				const color = ramp(d.median);
				const middle = measure(d.median);
				const hit = {datum: d, index, at: transposed ? {x: middle, y: cx} : {x: cx, y: middle}};
				const top = measure(d.q3);
				const bottom = measure(d.q1);
				const boxLength = Math.max(width * 0.7, Math.abs(bottom - top));
				const radius = Math.min(BOX_RADIUS, width / 2, boxLength / 2);

				return (
					<g
						key={d.category}
						data-geom="box"
						onMouseEnter={() => onHover?.(hit)}
						onMouseLeave={() => onHover?.(null)}
						onClick={onSelect ? () => onSelect(hit) : undefined}
						style={onSelect ? {cursor: "pointer"} : undefined}
					>
						<line
							{...rule(cx, measure(d.hi), measure(d.lo))}
							stroke="var(--viz-ink-muted)"
							strokeWidth={0.9}
							strokeOpacity={0.7}
						/>
						<rect
							{...block(cx, top, bottom, width, boxLength)}
							rx={radius}
							fill={color}
							fillOpacity={opacity}
							{...(stroke ? {stroke, strokeWidth: lineWidth} : {})}
						/>
						{showMedian && boxLength > width * 1.6 && (
							<line
								{...cross(cx, width / 2, measure(d.median))}
								stroke="var(--viz-paper)"
								strokeWidth={1.6}
								strokeOpacity={0.85}
							/>
						)}
						{showOutliers &&
							d.outliers.map((value, i) => (
								<circle
									key={i}
									cx={transposed ? measure(value) : cx}
									cy={transposed ? cx : measure(value)}
									r={1.9}
									fill="none"
									stroke="var(--viz-ink-muted)"
									strokeWidth={0.8}
								/>
							))}
					</g>
				);
			})}
		</g>
	);
}
