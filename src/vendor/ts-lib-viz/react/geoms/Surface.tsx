/**
 * A relief, and a structure: the two cube kinds that draw a lit surface.
 *
 * The design language always allowed this case. A topographic relief and a protein structure are 3D
 * objects, and drawing them as one is the honest choice, which is the sentence the coordinates rule
 * carried before it was amended. What the amendment adds is the camera: the reader turns the object
 * and the light crosses it, which is what a still projection cannot give.
 *
 * Height carries the color as well as the position. A surface read by shading alone hides a plateau
 * under a light that happens to face it, and the ramp is the reading that survives any camera.
 */

import {useMemo} from "react";

import type {LayerStyle, MeshData, Rgb, ThemeSnapshot, UnitRamp} from "../../core/internal.js";
import {rgbOf} from "../../core/internal.js";
import {GlMesh} from "../gl/GlMesh.js";
import {CubeStage} from "./cube-stage.js";

export interface SurfaceProps {
	mesh: MeshData;
	xDomain: [number, number];
	yDomain: [number, number];
	width: number;
	height: number;
	/** The magnitude map, over nought to one, in the CSS the rest of the chart is drawn in. */
	ramp: UnitRamp;
	labels: {x: string; y: string; z: string};
	format?: (value: number) => string;
	/** Which back faces of the box take a pane. */
	panes?: LayerStyle["panes"];
	/** The live token values where the chart sits, for the GL path's colors. */
	theme?: ThemeSnapshot | null;
}

const MUTED: Rgb = [0.55, 0.55, 0.58];

/** The middle of the vertices, which is what the layer packs its offsets against. */
function centerOf(positions: Float32Array): [number, number, number] {
	const lo = [Infinity, Infinity, Infinity];
	const hi = [-Infinity, -Infinity, -Infinity];
	for (let at = 0; at < positions.length; at += 3) {
		for (let axis = 0; axis < 3; axis += 1) {
			const value = positions[at + axis]!;
			if (value < lo[axis]!) lo[axis] = value;
			if (value > hi[axis]!) hi[axis] = value;
		}
	}
	return [0, 1, 2].map((axis) => (Number.isFinite(lo[axis]!) ? (lo[axis]! + hi[axis]!) / 2 : 0)) as [
		number,
		number,
		number,
	];
}

export function Surface({mesh, xDomain, yDomain, width, height, ramp, labels, format, panes, theme}: SurfaceProps) {
	const domains = useMemo(() => ({x: xDomain, y: yDomain, z: mesh.zDomain}), [xDomain, yDomain, mesh.zDomain]);
	const center = useMemo(() => centerOf(mesh.positions), [mesh.positions]);

	const glRamp = useMemo(() => {
		const cache = new Map<number, Rgb>();
		return (t: number): Rgb => {
			const step = Math.round(t * 64) / 64;
			const held = cache.get(step);
			if (held) return held;
			const rgb = rgbOf(ramp(step)) ?? MUTED;
			cache.set(step, rgb);
			return rgb;
		};
	}, [ramp]);

	return (
		<CubeStage
			domains={domains}
			center={center}
			width={width}
			height={height}
			labels={labels}
			format={format}
			panes={panes}
			theme={theme}
		>
			{({orbit}) => (
				<GlMesh
					mesh={mesh}
					xDomain={xDomain}
					yDomain={yDomain}
					orbit={orbit}
					width={width}
					height={height}
					ramp={glRamp}
				/>
			)}
		</CubeStage>
	);
}
