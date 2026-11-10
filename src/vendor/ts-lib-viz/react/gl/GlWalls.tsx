/**
 * Rules and panes on the cube's back walls, drawn on the shared context.
 *
 * A surface in front hides both. A pane draws under the rules.
 */

import {useEffect, useMemo, useRef} from "react";

import {
	rgbOf,
	type CubeDomains,
	type CubeQuad,
	type CubeSegment,
	type Orbit,
	type ThemeSnapshot,
	type VizToken,
} from "../../core/internal.js";
import {packQuads, packSegments, type Rect} from "./encode.js";
import type {LayerHandle, LineInput} from "./renderer.js";
import {useSharedRenderer} from "./context.js";
import {useGlRefresh} from "./refresh.js";

export interface GlWallsProps {
	/** Segments drawn as rules. */
	rules?: CubeSegment[];
	/** Quads drawn as panes, under the rules. */
	panes?: CubeQuad[];
	domains: CubeDomains;
	orbit: Orbit;
	width: number;
	height: number;
	/** The token the rules or panes draw in. */
	color: VizToken;
	opacity?: number;
	/** Rule width in CSS pixels. */
	linewidth?: number;
	/** The live token values where the chart sits, for the GL path's colors. */
	theme?: ThemeSnapshot | null;
}

export function GlWalls({
	rules,
	panes,
	domains,
	orbit,
	width,
	height,
	color,
	opacity = 1,
	linewidth = 1,
	theme,
}: GlWallsProps) {
	const area = useRef<SVGRectElement>(null);
	const handle = useRef<LayerHandle | null>(null);
	const renderer = useSharedRenderer();

	/* Keyed on the values. A turn rebuilds the walls, and they change only on a flip. */
	const key = (panes ?? rules ?? []).flat(2).join(",");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const packed = useMemo(() => (panes ? packQuads(panes) : packSegments(rules ?? [])), [key]);
	const rgb = useMemo(() => (theme && rgbOf(theme[color])) ?? [0.5, 0.5, 0.5], [theme, color]);

	const input = () => {
		const lines: LineInput = {other: packed.other, corners: packed.corners, width: panes ? 0 : linewidth};
		return {
			positions: packed.positions,
			depth: {...packed.depth, domain: domains.z, orbit},
			lines,
			color: [rgb[0], rgb[1], rgb[2], opacity] as const,
			opaque: opacity >= 1,
			xDomain: domains.x,
			yDomain: domains.y,
		};
	};

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
		const layer = renderer.add({...input(), size: 1, rect});
		handle.current = layer;
		return () => {
			layer.release();
			handle.current = null;
		};
		// Created once; the effect below carries every later change to it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderer, rect]);

	useEffect(() => {
		handle.current?.update(input());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [packed, domains, orbit, rgb, opacity, linewidth]);

	return <rect ref={area} width={width} height={height} fill="none" pointerEvents="none" />;
}
