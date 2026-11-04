/**
 * Two measures as a smoothed density, drawn as nested bands.
 *
 * The hexbin beside this answers the same question by counting into cells, and the two are read
 * differently. A bin is a number a reader can take off the chart; a contour is a shape, and the
 * shape is what says whether a population is one cloud or two. A scatter of a quarter of a million
 * records shows neither.
 *
 * `d3-contour` estimates the density and this draws it. The estimate runs in pixel space, so it is
 * computed here instead of in the layer engine, which resolves traces before a width is known. See
 * the ADR "Density is estimated where the pixels are".
 *
 * The rings carry magnitude, so they take the sequential map instead of the categorical one, per
 * chart-design rule 8.
 */

import {contourDensity, contours} from "d3-contour";
import {scaleLinear} from "d3-scale";
import {useMemo} from "react";

import {placePoints, type PlotPoint, type Relief} from "../../core/internal.js";
import type {Scale, UnitRamp, ValueRamp} from "../../core/internal.js";

/**
 * Bands drawn between the sparsest and the densest.
 *
 * Enough that a gradient reads as one, few enough that the rings stay countable. Past a dozen the
 * bands are thinner than their own edges and the chart reads as a blur.
 */
const BANDS = 10;

/** Radius the estimate smooths over, in pixels. Wider loses the second cloud, narrower draws noise. */
const BANDWIDTH = 18;

/** A GeoJSON multipolygon as one path, holes and all. Drawn even-odd, which is what makes a ring a ring. */
const toPath = (rings: number[][][][], place: (x: number, y: number) => [number, number] = (x, y) => [x, y]): string =>
	rings
		.map((polygon) =>
			polygon
				.map(
					(ring) =>
						`M${ring
							.map(([x, y]) => {
								const [px, py] = place(x!, y!);
								return `${px.toFixed(1)},${py.toFixed(1)}`;
							})
							.join("L")}Z`,
				)
				.join(""),
		)
		.join("");

/** Levels a lattice is cut at, on round numbers across its range. */
const LEVELS = 20;

/** Bands of a lattice's own values, placed through the frame's scales. */
function Lattice({
	grid,
	x,
	y,
	ramp,
	fill,
	stroke = "var(--viz-paper)",
	opacity,
}: {
	grid: Relief;
	x: Scale;
	y: Scale;
	ramp: ValueRamp;
	fill?: string;
	stroke?: string;
	opacity?: number;
}) {
	const bands = useMemo(() => {
		const {values, columns, rows, xDomain, yDomain, zDomain} = grid;
		const thresholds = scaleLinear().domain(zDomain).nice().ticks(LEVELS);
		const cut = contours().size([columns, rows]).thresholds(thresholds)(
			Array.from(values, (value) => (Number.isNaN(value) ? -Infinity : value)),
		);
		const dx = (xDomain[1] - xDomain[0]) / columns;
		const dy = (yDomain[1] - yDomain[0]) / rows;
		const place = (gx: number, gy: number): [number, number] => [x(xDomain[0] + gx * dx), y(yDomain[0] + gy * dy)];
		return cut.map((band) => ({value: band.value, d: toPath(band.coordinates as unknown as number[][][][], place)}));
	}, [grid, x, y]);

	return (
		<g pointerEvents="none" data-geom="contour-lattice">
			{bands.map((band) => (
				<path
					key={band.value}
					d={band.d}
					fill={fill ?? ramp(band.value)}
					fillOpacity={opacity}
					stroke={stroke}
					strokeWidth={0.5}
					fillRule="evenodd"
				/>
			))}
		</g>
	);
}

export interface ContourProps {
	points: PlotPoint[];
	x: Scale;
	y: Scale;
	width: number;
	height: number;
	/** Sequential map, taken over zero to one. */
	ramp: UnitRamp;
	/**
	 * Multiplier on the smoothing radius. Absent takes 1.
	 *
	 * The author's reach into a radius the geom owns, which is what ggplot's `adjust` is on a
	 * two-dimensional density. Under one the second cloud sharpens and the rings pick up noise; over
	 * one the two clouds merge, which is the same claim a wide bandwidth makes on a curve.
	 */
	adjust?: number;
	/** The rows' own lattice, where a measure is bound to `z`. Its values are cut in place of a density. */
	grid?: Relief;
	/** The measure's color in its own units, for the lattice's bands. */
	levelRamp?: ValueRamp;
	/** One paint for each band, where the author picked one over the ramp. */
	fill?: string;
	/** Paint on each band's edge. Absent draws the lattice's paper seam and the density's none. */
	stroke?: string;
	opacity?: number;
}

export function Contour(props: ContourProps) {
	if (props.grid && props.levelRamp)
		return (
			<Lattice
				grid={props.grid}
				x={props.x}
				y={props.y}
				ramp={props.levelRamp}
				fill={props.fill}
				stroke={props.stroke}
				opacity={props.opacity}
			/>
		);
	return <Density {...props} />;
}

/** The density estimate over the points, cut into nested bands. */
function Density({points, x, y, width, height, ramp, adjust = 1, fill, stroke, opacity = 0.72}: ContourProps) {
	const bands = useMemo(() => {
		if (width <= 0 || height <= 0 || points.length < 2) return [];
		const radius = BANDWIDTH * (adjust > 0 ? adjust : 1);
		const placed = placePoints(
			points,
			(v) => x(v),
			(v) => y(v),
		);

		return contourDensity<(typeof placed)[number]>()
			.x((p) => p.x)
			.y((p) => p.y)
			.size([Math.round(width), Math.round(height)])
			.bandwidth(radius)
			.thresholds(BANDS)(placed);
	}, [points, x, y, width, height, adjust]);

	if (bands.length === 0) return null;

	return (
		<g pointerEvents="none">
			{bands.map((band, index) => (
				<path
					key={band.value}
					d={toPath(band.coordinates as unknown as number[][][][])}
					fill={fill ?? ramp(bands.length === 1 ? 1 : index / (bands.length - 1))}
					fillOpacity={opacity}
					{...(stroke ? {stroke, strokeWidth: 0.5} : {})}
					fillRule="evenodd"
				/>
			))}
		</g>
	);
}
