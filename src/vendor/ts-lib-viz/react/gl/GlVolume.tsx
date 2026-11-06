/**
 * A scalar field read along the ray, on the shared context.
 *
 * The geometry uploaded is the box: eight corners and twelve triangles, packed the way a cube's
 * points are, so the same camera serves it. What the fragment stage does with them is the whole
 * geom. The field goes up as a 3D texture of bytes and the chart's magnitude map as a 256-wide
 * strip, so the colors a ray writes are the colors the rest of the figure is drawn in.
 */

import {useEffect, useMemo, useRef} from "react";

import {boxMesh, type Field3d, type Orbit, type Rgb} from "../../core/internal.js";
import {packColors, packDepth, packPositions, type Rect} from "./encode.js";
import type {LayerHandle} from "./renderer.js";
import {useSharedRenderer} from "./context.js";
import {useGlRefresh} from "./refresh.js";
import type {UnitRamp} from "../../core/internal.js";

/** Samples a ray takes across the box. Enough to resolve a 32-cell field from any angle. */
export const RAY_STEPS = 160;

/** Steps in the transfer strip, which is what a byte of field indexes. */
const RAMP_STEPS = 256;

/** Opacity a ray leaves after crossing the whole field. */
const RAY_OPACITY = 0.75;

/**
 * Absorption one step takes to reach `RAY_OPACITY` on this field.
 *
 * A count grid is long-tailed. The diamonds field averages 8 levels of 255 over its filled cells.
 */
function densityFor(values: Uint8Array, steps: number): number {
	let sum = 0;
	for (let at = 0; at < values.length; at += 1) sum += values[at]!;
	const mean = sum / (255 * values.length);
	if (mean <= 0) return 0;
	return Math.min(1, RAY_OPACITY / (steps * mean));
}

export interface GlVolumeProps {
	field: Field3d;
	orbit: Orbit;
	width: number;
	height: number;
	/** The magnitude map over nought to one, as an RGB triple in the same range. */
	ramp: UnitRamp<Rgb>;
	/** Set to draw the shell where the field holds `isoLevel`; clear to read it through its depth. */
	iso: boolean;
	/** Where the shell stands, over nought to one of the field's own range. */
	isoLevel?: number;
	/** How much of the field one step absorbs, for the integrating read. Derived from the field when absent. */
	density?: number;
	fallback?: React.ReactNode;
}

export function GlVolume({
	field,
	orbit,
	width,
	height,
	ramp,
	iso,
	isoLevel = 0.5,
	density,
	fallback = null,
}: GlVolumeProps) {
	const area = useRef<SVGRectElement>(null);
	const handle = useRef<LayerHandle | null>(null);
	const renderer = useSharedRenderer();

	const packed = useMemo(() => {
		const box = boxMesh(field.xDomain, field.yDomain, field.zDomain);
		const corners = box.positions.length / 3;
		const xs = new Float64Array(corners);
		const ys = new Float64Array(corners);
		const zs = new Float64Array(corners);
		for (let corner = 0; corner < corners; corner += 1) {
			xs[corner] = box.positions[corner * 3]!;
			ys[corner] = box.positions[corner * 3 + 1]!;
			zs[corner] = box.positions[corner * 3 + 2]!;
		}

		const strip = new Uint8Array(RAMP_STEPS * 4);
		for (let step = 0; step < RAMP_STEPS; step += 1) {
			const [r, g, b] = ramp(step / (RAMP_STEPS - 1));
			strip[step * 4] = Math.round(r * 255);
			strip[step * 4 + 1] = Math.round(g * 255);
			strip[step * 4 + 2] = Math.round(b * 255);
			strip[step * 4 + 3] = 255;
		}

		return {
			positions: packPositions(xs, ys),
			depth: packDepth(zs),
			// The box carries no color of its own; the ray writes every pixel it keeps.
			colors: packColors(corners, () => [0, 0, 0], 0),
			indices: box.indices,
			// The normals go unread by the ray, and the buffer is eight vectors.
			normals: new Float32Array(corners * 3),
			density: densityFor(field.values, RAY_STEPS),
			strip,
		};
	}, [field, ramp]);

	const rect = useMemo(
		() => (): Rect | null => {
			const box = area.current?.getBoundingClientRect();
			return box ? {left: box.left, top: box.top, width: box.width, height: box.height} : null;
		},
		[],
	);

	useGlRefresh(renderer);

	const input = useMemo(
		() => ({
			positions: packed.positions,
			colors: packed.colors,
			depth: {...packed.depth, domain: field.zDomain, orbit},
			mesh: {normals: packed.normals, indices: packed.indices},
			volume: {
				field: field.values,
				dims: field.dims,
				ramp: packed.strip,
				iso,
				level: isoLevel,
				density: density ?? packed.density,
				steps: RAY_STEPS,
			},
			size: 1,
			xDomain: field.xDomain,
			yDomain: field.yDomain,
			rect,
		}),
		[packed, field, orbit, iso, isoLevel, density, rect],
	);

	useEffect(() => {
		if (!renderer) return;
		const layer = renderer.add(input);
		handle.current = layer;
		return () => {
			layer.release();
			handle.current = null;
		};
		// Created once; the effect below carries every later change to it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderer, rect]);

	useEffect(() => {
		handle.current?.update(input);
	}, [input]);

	if (!renderer) return <>{fallback}</>;

	return <rect ref={area} width={width} height={height} fill="transparent" pointerEvents="none" />;
}
