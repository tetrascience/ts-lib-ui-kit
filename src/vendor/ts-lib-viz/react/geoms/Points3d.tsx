/**
 * A cloud in three position scales.
 *
 * The design language's two conditions are met between this and `CubeStage`. The reader can rotate,
 * which is what makes the projection invertible. And the chart carries two depth cues: geoms scale
 * with distance in the vertex program, and each geom casts a copy of itself onto the floor of the
 * box, so the height a reader is asked to judge has a second reading at a known position. Under a
 * few hundred geoms the copy is joined to its geom by a drop line, which is the clearer cue and the
 * one that stops being drawable at scale.
 *
 * See the ADR "A third position scale is permitted where the reader can rotate".
 */

import {useMemo} from "react";

import {
	projectData,
	rgbOf,
	type LayerStyle,
	type PlotPoint,
	type PointHit,
	type Rgb,
	type ThemeSnapshot,
} from "../../core/internal.js";
import {GlPoints} from "../gl/GlPoints.js";
import {CubeStage, middleOf} from "./cube-stage.js";
import type {ValueRamp} from "../../core/internal.js";

/** Geoms up to which each one keeps a line down to its shadow. Past it the lines are the picture. */
export const DROP_LINE_CAP = 300;

export interface Points3dProps {
	points: PlotPoint[];
	xDomain: [number, number];
	yDomain: [number, number];
	zDomain: [number, number];
	width: number;
	height: number;
	/** Maps a point's weight to a color, in the CSS the rest of the chart is drawn in. */
	ramp: ValueRamp;
	/** Axis names, written along the box's outermost edges. */
	labels: {x: string; y: string; z: string};
	/** Tick text, so a cube reads in the same precision the flat charts do. */
	format?: (value: number) => string;
	/** Which back faces of the box take a pane. */
	panes?: LayerStyle["panes"];
	/** The live token values where the chart sits, for the GL path's colors. */
	theme?: ThemeSnapshot | null;
	radius?: number;
	/**
	 * The geom under the pointer, with the pixel the projection put it at.
	 *
	 * A flat geom knows where it drew itself and a cube geom does not: the GPU placed it under the
	 * camera and the CPU has the matrix. So the position is computed here, where the matrix is, and
	 * the readout lands beside the geom instead of at the panel origin.
	 */
	onHover?: (hit: PointHit | null) => void;
	onSelect?: (hit: PointHit) => void;
}

const MUTED: Rgb = [0.55, 0.55, 0.58];

/** Paints the shadow its one color. One function for the module's life, and the colors upload once. */
const SHADOW_RAMP = (): Rgb => MUTED;

export function Points3d({
	points,
	xDomain,
	yDomain,
	zDomain,
	width,
	height,
	ramp,
	labels,
	format,
	panes,
	theme,
	radius = 3,
	onHover,
	onSelect,
}: Points3dProps) {
	const domains = useMemo(() => ({x: xDomain, y: yDomain, z: zDomain}), [xDomain, yDomain, zDomain]);

	const center = useMemo(
		(): [number, number, number] => [
			middleOf(points.map((point) => point.x)),
			middleOf(points.map((point) => point.y)),
			middleOf(points.map((point) => point.z ?? zDomain[0])),
		],
		[points, zDomain],
	);

	/* The second depth cue: the same cloud flattened onto the floor of the box. */
	const shadow = useMemo(() => points.map((point) => ({...point, z: zDomain[0]})), [points, zDomain]);

	const glRamp = useMemo(() => {
		const cache = new Map<number, Rgb>();
		return (weight: number): Rgb => {
			const held = cache.get(weight);
			if (held) return held;
			const rgb = rgbOf(ramp(weight)) ?? MUTED;
			cache.set(weight, rgb);
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
			{({matrix, orbit, turned}) => {
				const cube = {domain: zDomain, orbit};

				/* The geom's own projection, where the card sits. The GPU pick reports the pointer. */
				const placed = (hit: PointHit): PointHit => {
					const at = projectData(matrix, [hit.datum.x, hit.datum.y, hit.datum.z ?? zDomain[0]], center, width, height);
					return {...hit, at: {x: at.x, y: at.y}};
				};

				const lines =
					points.length > DROP_LINE_CAP
						? []
						: points.map((point) => ({
								geom: projectData(matrix, [point.x, point.y, point.z ?? zDomain[0]], center, width, height),
								floor: projectData(matrix, [point.x, point.y, zDomain[0]], center, width, height),
							}));

				return (
					<>
						<GlPoints
							points={shadow}
							x={(value) => Number(value)}
							y={(value) => Number(value)}
							xDomain={xDomain}
							yDomain={yDomain}
							width={width}
							height={height}
							ramp={SHADOW_RAMP}
							radius={radius * 0.6}
							opacity={0.28}
							cube={cube}
						/>

						<GlPoints
							points={points}
							x={(value) => Number(value)}
							y={(value) => Number(value)}
							xDomain={xDomain}
							yDomain={yDomain}
							width={width}
							height={height}
							ramp={glRamp}
							radius={radius}
							opacity={1}
							cube={cube}
							onHover={onHover ? (hit) => onHover(hit && placed(hit)) : undefined}
							onSelect={onSelect ? (hit) => (turned() ? undefined : onSelect(placed(hit))) : undefined}
						/>

						{lines.map((line, index) => (
							<line
								key={index}
								x1={line.geom.x}
								y1={line.geom.y}
								x2={line.floor.x}
								y2={line.floor.y}
								stroke="var(--viz-ink-muted)"
								strokeWidth={0.75}
								opacity={0.3}
							/>
						))}
					</>
				);
			}}
		</CubeStage>
	);
}
