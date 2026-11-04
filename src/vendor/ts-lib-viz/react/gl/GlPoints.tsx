/**
 * The point geom on the GPU, for counts where an SVG scatter stops being a chart.
 *
 * Same props as `Points` and the same hover contract. What changes is the paint and where the
 * projection happens: the SVG path projects on the CPU and writes a path string per geom, which is
 * megabytes of string at a quarter of a million, while this hands the GPU data-space offsets once
 * and moves a camera after that.
 *
 * React mounts the layer and updates it when the data changes. It is not in the frame path: the
 * renderer holds the loop, so a zoom or a scroll costs no render here.
 */

import {useEffect, useMemo, useRef, useState} from "react";

import type {Orbit, PlotPoint, PointHit, PointShape, Rgb, Scale, ValueRamp} from "../../core/internal.js";
import {packColors, packDepth, packPositions, packSizes, type Rect} from "./encode.js";
import type {LayerHandle} from "./renderer.js";
import {useSharedRenderer} from "./context.js";
import {useGlRefresh} from "./refresh.js";

export interface GlPointsProps {
	points: PlotPoint[];
	/** Read for the domains alone: the GPU does the projection the SVG path asks these for. */
	x: Scale;
	y: Scale;
	xDomain: [number, number];
	yDomain: [number, number];
	width: number;
	height: number;
	/** Maps a point's weight to an RGB triple in the range 0 to 1. */
	ramp: ValueRamp<Rgb>;
	radius?: number;
	opacity?: number;
	shape?: PointShape;
	/** Draws each glyph as an outline with the page showing through it. */
	hollow?: boolean;
	/**
	 * The third scale, which puts the layer under a camera.
	 *
	 * The points carry `z` and this says what it spans and where the reader is standing. Absent
	 * draws the flat layer, on the program the flat frame numbers were measured against.
	 */
	cube?: {domain: [number, number]; orbit: Orbit};
	/** The point under the pointer, placed at the pointer. */
	onHover?: (hit: PointHit | null) => void;
	onSelect?: (hit: PointHit) => void;
	/** Drawn when the page has no WebGL2, so a chart says something instead of nothing. */
	fallback?: React.ReactNode;
}

const DEFAULT_RADIUS = 1.6;
const DEFAULT_OPACITY = 0.16;

export function GlPoints({
	points,
	xDomain,
	yDomain,
	width,
	height,
	ramp,
	radius = DEFAULT_RADIUS,
	opacity = DEFAULT_OPACITY,
	shape = "circle",
	hollow = false,
	cube,
	onHover,
	onSelect,
	fallback = null,
}: GlPointsProps) {
	const area = useRef<SVGRectElement>(null);
	const handle = useRef<LayerHandle | null>(null);
	const [hovered, setHovered] = useState<number | null>(null);

	const renderer = useSharedRenderer();
	const pickable = Boolean(onHover || onSelect);

	/* The jitter offset is added here as well as in `placePoints`, so a cloud crossing the switch to
	   the GPU keeps the nudge it had one geom below it. */
	const positions = useMemo(
		() =>
			packPositions(
				points.map((point) => point.x + (point.dx ?? 0)),
				points.map((point) => point.y + (point.dy ?? 0)),
			),
		[points],
	);

	const colors = useMemo(
		() => packColors(points.length, (index) => ramp(points[index]!.weight ?? 0.62), opacity),
		[points, ramp, opacity],
	);

	/*
	  The third coordinate's buffer is packed against the points and the domain, and holds still while
	  the reader turns the cube. The orbit sits inside `DepthInput` beside the offsets, so keying the
	  pack on the whole `cube` re-walked the points at each frame of a drag. The camera is a uniform
	  and the offsets are a buffer, so they key on different things.
	*/
	const zDomain = cube?.domain;
	const depthOffsets = useMemo(
		() => (zDomain ? packDepth(points.map((point) => point.z ?? zDomain[0])) : undefined),
		[points, zDomain],
	);

	const depth = useMemo(
		() => (cube && depthOffsets ? {...depthOffsets, domain: cube.domain, orbit: cube.orbit} : undefined),
		[cube, depthOffsets],
	);

	/*
	  A layer whose points carry no resolved radius packs nothing, so a fixed-diameter chart keeps
	  the one uniform it had and pays no bytes a geom.
	*/
	const sizes = useMemo(() => {
		if (!points.some((point) => point.size != null)) return undefined;
		return packSizes(points.length, (index) => (points[index]!.size ?? radius) * 2);
	}, [points, radius]);

	/** The plot area in page coordinates, read by the renderer on each frame. */
	const rect = useMemo(
		() => (): Rect | null => {
			const box = area.current?.getBoundingClientRect();
			return box ? {left: box.left, top: box.top, width: box.width, height: box.height} : null;
		},
		[],
	);

	/*
	  The layer reads its rectangle inside the frame, so a page that moved under it needs one more
	  frame before the geoms are where the axes are. A layer nobody redraws keeps the last frame it
	  drew, which after a resize is a canvas that was cleared.
	*/
	useGlRefresh(renderer);

	useEffect(() => {
		if (!renderer) return;
		const layer = renderer.add({
			positions,
			colors,
			sizes,
			depth,
			size: radius * 2,
			shape,
			hollow,
			xDomain,
			yDomain,
			rect,
			// The id buffer is another four bytes a geom, so a chart nobody hovers skips it.
			pickable,
		});
		handle.current = layer;
		return () => {
			layer.release();
			handle.current = null;
		};
		// The layer is created once; the effect below carries every later change to it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderer, rect]);

	useEffect(() => {
		handle.current?.update({
			positions,
			colors,
			sizes,
			depth,
			size: radius * 2,
			shape,
			hollow,
			xDomain,
			yDomain,
			pickable,
		});
	}, [positions, colors, sizes, depth, radius, shape, hollow, xDomain, yDomain, pickable]);

	if (!renderer) return <>{fallback}</>;

	const report = (event: React.PointerEvent<SVGRectElement>) => {
		const index = handle.current?.pick(event.clientX, event.clientY) ?? null;
		setHovered(index);
		const point = index == null ? null : points[index];
		const box = event.currentTarget.getBoundingClientRect();
		onHover?.(
			point ? {datum: point, index: index!, at: {x: event.clientX - box.left, y: event.clientY - box.top}} : null,
		);
	};

	const clear = () => {
		setHovered(null);
		onHover?.(null);
	};

	const take = (event: React.MouseEvent<SVGRectElement>) => {
		const point = hovered == null ? null : points[hovered];
		const box = event.currentTarget.getBoundingClientRect();
		if (point && hovered != null)
			onSelect?.({datum: point, index: hovered, at: {x: event.clientX - box.left, y: event.clientY - box.top}});
	};

	return (
		<g>
			{/* The capture surface is also what reports the plot area's position each frame. */}
			<rect
				ref={area}
				width={width}
				height={height}
				fill="transparent"
				cursor={onSelect && hovered != null ? "pointer" : undefined}
				onPointerMove={onHover || onSelect ? report : undefined}
				onPointerLeave={onHover ? clear : undefined}
				onClick={onSelect ? take : undefined}
			/>
		</g>
	);
}
