/**
 * Hexbin density, and the switch that decides when it takes over from points.
 *
 * One component holding the geom-switch rule, so a chart cannot silently misrepresent its own
 * density: points below 1,500 records, translucent points to 15,000, hexbin above. The switch gets
 * reported in the footer, because a reader who thinks they are looking at individual records will
 * misjudge what they see.
 *
 * Below the switch this delegates to `Points`, which is where a geom carries the record it stands
 * for. Drawing them here meant a scatter under the threshold lost identity the same data had above
 * it, for no reason a reader could see.
 */

import {useEffect, useMemo} from "react";

import {
	boundsOf,
	hexbin,
	hexPath,
	hexRadiusFor,
	latticeFor,
	rectPath,
	rectbin,
	treatmentOf,
} from "../../core/internal.js";
import type {Bin2dOptions, GeomHit, Lattice, PlotPoint, PointTreatment, UnitRamp} from "../../core/internal.js";
import type {Scale} from "../../core/internal.js";
import {Points, type PointHit} from "./Points.js";

export interface HexbinProps {
	points: PlotPoint[];
	x: Scale;
	y: Scale;
	/** Overrides the count-derived choice, which is `treatmentOf` the point count. */
	mode?: PointTreatment;
	/**
	 * How the bins tile. Hexagons unless asked.
	 *
	 * A hexagon has six neighbors all the same distance away, so a cluster reads as a cluster. A
	 * square is what a reader cross-references against an axis: one x interval by one y interval,
	 * and a count that reads back to the pair of ranges behind it.
	 */
	tiling?: "hex" | "rect";
	radius?: number;
	/**
	 * Cell size and alignment in the data's own units, which is `stat_bin_2d`'s parameter set.
	 *
	 * Resolved to a pixel lattice against the scales, so `bins: 20` draws twenty cells across the
	 * range whatever the panel is wide. Absent takes `radius`, which is what every figure drew before
	 * the parameters existed.
	 */
	bin?: Bin2dOptions;
	/** Maps 0..1 to a color. Comes from the palette context a layer up. */
	ramp: UnitRamp;
	/** Colors a bin by the mean of its weight channel instead of by its count. */
	colorBy?: "count" | "mean";
	/** One paint for each bin, where the author picked one over the ramp. */
	fill?: string;
	/** Outline paint on each bin, and its width. Absent draws none. */
	stroke?: string;
	lineWidth?: number;
	opacity?: number;
	/** A bin under the pointer: the records it counts and their mean weight, placed at its center. */
	onHover?: (hit: GeomHit<{count: number; mean?: number}> | null) => void;
	/**
	 * How many bins the density drew, for a caller that has to state the substitution.
	 *
	 * Rule 7 asks the switch to be reported, and the footer wants a cell count the caller cannot see
	 * from outside. Called after a render in hexbin mode, with the bin count of what is on screen.
	 */
	onBins?: (cells: number) => void;
	/**
	 * A record under the pointer, below the density switch.
	 *
	 * Held apart from `onHover`: a bin reports a population and a point reports a lot, and a caller
	 * that conflated them would print a count where a name belongs.
	 */
	onPoint?: (hit: PointHit | null) => void;
	/** A record taken below the density switch. Absent above it, where no single geom is under the pointer. */
	onSelectPoint?: (hit: PointHit) => void;
	/** Plot area, so the point branch can catch the pointer across the frame. */
	width?: number;
	height?: number;
}

export function Hexbin({
	points,
	x,
	y,
	mode,
	tiling = "hex",
	radius = 6,
	bin,
	ramp,
	colorBy = "count",
	fill,
	stroke,
	lineWidth = 1,
	opacity,
	onHover,
	onBins,
	onPoint,
	onSelectPoint,
	width,
	height,
}: HexbinProps) {
	const chosen = mode ?? treatmentOf(points.length);

	const projected = useMemo(() => points.map((p) => ({x: x(p.x), y: y(p.y), weight: p.weight})), [points, x, y]);

	/* Stated parameters resolve against the ranges of the data, which is the dimension ggplot reads. */
	const lattice = useMemo<Lattice | null>(() => {
		if (!bin || points.length === 0) return null;
		const xs = points.map((point) => point.x);
		const ys = points.map((point) => point.y);
		return latticeFor(boundsOf(xs), boundsOf(ys), {x, y}, bin);
	}, [bin, points, x, y]);

	const bins = useMemo(() => {
		if (chosen !== "binned") return [];
		/* A square of the hexagon's own width, so the two tilings draw cells of about one area. */
		if (!lattice) return tiling === "rect" ? rectbin(projected, radius * 1.732) : hexbin(projected, radius);
		return tiling === "rect" ? rectbin(projected, lattice) : hexbin(projected, hexRadiusFor(lattice), lattice.origin);
	}, [chosen, lattice, projected, radius, tiling]);

	useEffect(() => {
		if (chosen === "binned") onBins?.(bins.length);
	}, [chosen, bins, onBins]);

	const extent = useMemo(() => {
		if (bins.length === 0) return [0, 1] as const;
		const values = bins.map((b) => (colorBy === "mean" ? (b.mean ?? 0) : b.count));
		return boundsOf(values);
	}, [bins, colorBy]);

	/*
    The point branch reads its weights against the same window the bins do.

    A weight arrives in its own units, a stability in degrees or a titer in mg/L, and the ramp takes
    zero to one. The bin branch scales against the extent of the bins; the point branch handed the
    ramp a raw measurement, which clamped every geom to the top of the scale and drew a bound color
    channel as one flat color. Scaling here keeps both sides of the switch on one reading, and the
    points keep their own units for whatever the readout prints.
  */
	const pointRamp = useMemo(() => {
		if (chosen === "binned") return ramp;
		let lo = Infinity;
		let hi = -Infinity;
		for (const point of points) {
			if (point.weight == null) continue;
			if (point.weight < lo) lo = point.weight;
			if (point.weight > hi) hi = point.weight;
		}
		if (hi < lo) return ramp;
		/* One shared reading takes the middle of the span the points read. */
		if (hi === lo) return () => ramp(0.55);
		return (weight: number) => ramp(0.15 + Math.min(1, Math.max(0, (weight - lo) / (hi - lo))) * 0.8);
	}, [chosen, points, ramp]);

	if (chosen !== "binned") {
		return (
			<Points
				points={points}
				x={x}
				y={y}
				faded={chosen === "faded"}
				ramp={pointRamp}
				width={width}
				height={height}
				onHover={onPoint}
				onSelect={onSelectPoint}
			/>
		);
	}

	const path =
		tiling === "rect"
			? rectPath(lattice?.width ?? radius * 1.732, lattice?.height)
			: hexPath(lattice ? hexRadiusFor(lattice) : radius);
	const span = extent[1] - extent[0] || 1;

	return (
		<g>
			{bins.map((bin, index) => {
				const value = colorBy === "mean" ? (bin.mean ?? 0) : bin.count;
				// Square root, so a bin twice as dark holds roughly twice the records instead of
				// four times: linear on count makes a long tail invisible.
				const t = Math.sqrt((value - extent[0]) / span);
				return (
					<path
						key={bin.key}
						d={path}
						transform={`translate(${bin.cx},${bin.cy})`}
						fill={fill ?? ramp(0.15 + t * 0.8)}
						fillOpacity={opacity}
						{...(stroke ? {stroke, strokeWidth: lineWidth} : {})}
						onMouseEnter={() =>
							onHover?.({datum: {count: bin.count, mean: bin.mean}, index, at: {x: bin.cx, y: bin.cy}})
						}
						onMouseLeave={() => onHover?.(null)}
					/>
				);
			})}
		</g>
	);
}
