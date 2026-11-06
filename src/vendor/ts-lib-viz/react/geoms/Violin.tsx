/**
 * Kernel density per category, mirrored around the band center.
 *
 * A box says where the middle half sits and nothing about the shape it takes. Two distributions with
 * the same quartiles draw the same box while one is bimodal and the other is not, and which of those
 * a scientist is holding decides whether the median means anything. The violin is the geom that
 * disagrees.
 *
 * It carries the box's median tick so the two can be read together, and it takes the same color
 * ramp, since a set of geoms that shares a frame should share a system. The outline is written by
 * hand instead of through a curve generator, per the ADR "A layer draws over a shared frame".
 *
 * The density itself is `kde` in `/core`. A distribution is a distribution whatever produced it, so
 * the geom names no domain and takes its meaning from what the caller bound.
 */

import type {GeomHit, Scale, ValueRamp, ViolinDatum} from "../../core/internal.js";

export type {ViolinDatum};

export interface ViolinProps {
	data: ViolinDatum[];
	x: Scale;
	y: Scale;
	band: number;
	/** Maps a group's median, in the units it carries, to a color. */
	ramp: ValueRamp;
	/**
	 * Widest the outline is drawn, in pixels.
	 *
	 * Unset, it takes most of its slot and stops at sixty-eight, the proportion that leaves air between
	 * neighbors. Set, it is the width asked for, bounded only by the slot.
	 */
	thickness?: number;
	/** Opacity of the interior. Absent is 0.72. */
	opacity?: number;
	/** Paint on the outline, and its width. Absent takes the interior's color at 0.9 pixels. */
	stroke?: string;
	lineWidth?: number;
	/**
	 * Draws the outline across the frame instead of up it, the band running down the side.
	 *
	 * Read off the frame, since it refuses a transpose where the geoms read no shared pair. The walk
	 * is the same one with the pair swapped: out along the density and back along its mirror.
	 */
	transposed?: boolean;
	/**
	 * Which side of the band the density occupies.
	 *
	 * Both is the distribution read on its own. One side is the raincloud's, which spends the other
	 * half of the band on the box and the readings. Stated in band space, so a transpose carries it.
	 */
	side?: "both" | "high" | "low";
	showMedian?: boolean;
	/** The violin under the pointer, placed at its median. */
	onHover?: (hit: GeomHit<ViolinDatum> | null) => void;
	onSelect?: (hit: GeomHit<ViolinDatum>) => void;
}

export function Violin({
	data,
	x,
	y,
	band,
	ramp,
	thickness,
	opacity = 0.72,
	stroke,
	lineWidth = 0.9,
	transposed = false,
	side = "both",
	showMedian = true,
	onHover,
	onSelect,
}: ViolinProps) {
	const half = thickness != null ? Math.min(band, thickness) / 2 : Math.min(band * 0.42, 34);
	/* The band's scale is whichever one the density does not read. */
	const along = transposed ? y : x;
	const measure = transposed ? x : y;
	/* A vertex named by role, handed to the screen the way round the frame drew. */
	const at = (band_: number, on: number) => (transposed ? `${on},${band_}` : `${band_},${on}`);

	return (
		<g>
			{data.map((d, index) => {
				const cx = along(d.category);
				const color = ramp(d.median);
				const middle = measure(d.median);
				const hit = {datum: d, index, at: transposed ? {x: middle, y: cx} : {x: cx, y: middle}};

				/*
				  Both sides, or one of them.

				  Mirroring is the default and reads as a distribution: the shape is symmetric about the
				  band and a reader takes width off either arm. One side is what a raincloud wants, and
				  what it buys is the other half of the band, which the box and the readings go into. The
				  flat edge sits on the band center, so the three layers of a raincloud share one line.

				  The offset is band space and the grid is measure space, so `at` carries a transpose for
				  free: which screen axis the arm runs along is the frame's answer and not this one's.
				*/
				const outward = side === "low" ? -1 : 1;
				const arm = d.grid.map(
					(value, i) => `${i === 0 ? "M" : "L"}${at(cx + outward * d.weight[i]! * half, measure(value))}`,
				);
				const back =
					side === "both"
						? d.grid.map((value, i) => `L${at(cx - d.weight[i]! * half, measure(value))}`).reverse()
						: [`L${at(cx, measure(d.grid[d.grid.length - 1]!))}`, `L${at(cx, measure(d.grid[0]!))}`];
				const outline = [...arm, ...back, "Z"].join("");
				/* A mirrored median spans the band; a one-sided one starts at the flat edge. */
				const medianFrom = side === "both" ? cx - half * 0.5 : cx;
				const medianTo = side === "both" ? cx + half * 0.5 : cx + outward * half * 0.6;

				/*
				  How wide the outline is at one reading, for the quantile lines the statistic asked for.

				  Read off the estimate instead of drawn at a fixed length, so a line stops where the density
				  it sits inside stops. A quartile line running past the arm would claim width the estimate
				  does not carry, which is the thing a violin exists to state.
				*/
				const widthAt = (value: number) => {
					let nearest = 0;
					let gap = Infinity;
					for (let i = 0; i < d.grid.length; i += 1) {
						const away = Math.abs(d.grid[i]! - value);
						if (away < gap) {
							gap = away;
							nearest = i;
						}
					}
					return (d.weight[nearest] ?? 0) * half;
				};

				return (
					<g
						key={d.category}
						data-geom="violin"
						onMouseEnter={() => onHover?.(hit)}
						onMouseLeave={() => onHover?.(null)}
						onClick={onSelect ? () => onSelect(hit) : undefined}
						style={onSelect ? {cursor: "pointer"} : undefined}
					>
						<path d={outline} fill={color} fillOpacity={opacity} stroke={stroke ?? color} strokeWidth={lineWidth} />
						{(d.quantiles ?? []).map((value) => {
							const span = widthAt(value);
							const from = side === "both" ? cx - span : cx;
							const to = cx + outward * span;
							return (
								<line
									key={value}
									x1={transposed ? measure(value) : from}
									x2={transposed ? measure(value) : to}
									y1={transposed ? from : measure(value)}
									y2={transposed ? to : measure(value)}
									stroke="var(--viz-paper)"
									strokeWidth={0.8}
									strokeOpacity={0.55}
								/>
							);
						})}
						{/* Inside the arm that was drawn, so a one-sided outline has no line hanging off it. */}
						{showMedian && (
							<line
								x1={transposed ? measure(d.median) : medianFrom}
								x2={transposed ? measure(d.median) : medianTo}
								y1={transposed ? medianFrom : measure(d.median)}
								y2={transposed ? medianTo : measure(d.median)}
								stroke="var(--viz-paper)"
								strokeWidth={1.6}
								strokeOpacity={0.85}
							/>
						)}
					</g>
				);
			})}
		</g>
	);
}
