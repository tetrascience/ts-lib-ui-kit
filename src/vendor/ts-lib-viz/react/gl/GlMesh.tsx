/**
 * A triangle mesh on the shared context, under the same camera the cube's geoms use.
 *
 * The vertices are packed the way a cube's points are, as offsets on the pair plus one on the third
 * scale, so one matrix serves both programs and a relief can be drawn beside a cloud in one canvas.
 * What this adds is the face list and a normal a vertex, which is what a light needs to make a
 * projection read as an object.
 */

import {useEffect, useMemo, useRef} from "react";

import type {MeshData, Orbit, Rgb, UnitRamp} from "../../core/internal.js";
import {packColors, packDepth, packPositions, type Rect} from "./encode.js";
import type {LayerHandle} from "./renderer.js";
import {useSharedRenderer} from "./context.js";
import {useGlRefresh} from "./refresh.js";

export interface GlMeshProps {
	mesh: MeshData;
	xDomain: [number, number];
	yDomain: [number, number];
	orbit: Orbit;
	width: number;
	height: number;
	/** Maps a vertex's height, over nought to one, to an RGB triple in the same range. */
	ramp: UnitRamp<Rgb>;
	/** Drawn when the page has no WebGL2, so a chart says something instead of nothing. */
	fallback?: React.ReactNode;
}

export function GlMesh({mesh, xDomain, yDomain, orbit, width, height, ramp, fallback = null}: GlMeshProps) {
	const area = useRef<SVGRectElement>(null);
	const handle = useRef<LayerHandle | null>(null);
	const renderer = useSharedRenderer();

	const packed = useMemo(() => {
		const count = mesh.positions.length / 3;
		const xs = new Float64Array(count);
		const ys = new Float64Array(count);
		const zs = new Float64Array(count);
		for (let vertex = 0; vertex < count; vertex += 1) {
			xs[vertex] = mesh.positions[vertex * 3]!;
			ys[vertex] = mesh.positions[vertex * 3 + 1]!;
			zs[vertex] = mesh.positions[vertex * 3 + 2]!;
		}

		const [lo, hi] = mesh.zDomain;
		const span = hi - lo || 1;
		return {
			positions: packPositions(xs, ys),
			depth: packDepth(zs),
			// Height carries the color, which is the reading a relief is for.
			colors: packColors(count, (vertex) => ramp((zs[vertex]! - lo) / span), 1),
		};
	}, [mesh, ramp]);

	const rect = useMemo(
		() => (): Rect | null => {
			const box = area.current?.getBoundingClientRect();
			return box ? {left: box.left, top: box.top, width: box.width, height: box.height} : null;
		},
		[],
	);

	useGlRefresh(renderer);

	useEffect(() => {
		if (!renderer) return;
		const layer = renderer.add({
			positions: packed.positions,
			colors: packed.colors,
			depth: {...packed.depth, domain: mesh.zDomain, orbit},
			mesh: {normals: mesh.normals, indices: mesh.indices},
			// A triangle has no diameter; the uniform is read by the point programs alone.
			size: 1,
			opaque: true,
			xDomain,
			yDomain,
			rect,
		});
		handle.current = layer;
		return () => {
			layer.release();
			handle.current = null;
		};
		// Created once; the effect below carries every later change to it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderer, rect]);

	useEffect(() => {
		handle.current?.update({
			positions: packed.positions,
			colors: packed.colors,
			depth: {...packed.depth, domain: mesh.zDomain, orbit},
			mesh: {normals: mesh.normals, indices: mesh.indices},
			xDomain,
			yDomain,
		});
	}, [packed, mesh, orbit, xDomain, yDomain]);

	if (!renderer) return <>{fallback}</>;

	return <rect ref={area} width={width} height={height} fill="transparent" pointerEvents="none" />;
}
