/**
 * The box a cube kind draws inside, and the gesture that turns it.
 *
 * Shared by the geoms that position in three scales, because the box, the labels and the camera are
 * the same for a cloud and for a surface: what differs is what gets drawn inside. The design
 * language's two conditions live here, so a kind cannot ship the third scale without them.
 *
 * The children take the matrix, so anything the CPU draws over the GPU's work lands where the
 * camera put it. See the ADR "A third position scale is permitted where the reader can rotate".
 */

import {useMemo, type ReactNode} from "react";

import {
	cubeChrome,
	cubeMatrix,
	projectData,
	type CubeDomains,
	type LayerStyle,
	type Orbit,
	type ThemeSnapshot,
} from "../../core/internal.js";
import {useOrbit} from "../orbit.js";
import {GlWalls} from "../gl/GlWalls.js";
import {useSharedRenderer} from "../gl/context.js";

/** The grid's width in CSS pixels, its token and its opacity. */
const GRID_WIDTH = 1.5;
const GRID_INK = "--viz-ink-muted";
const GRID_OPACITY = 0.5;
/** The box edges' opacity. */
const EDGE_OPACITY = 0.35;
/** The panes' token, and an opacity for each. Two shades keep the corner between the walls in view. */
const PANE_INK = "--viz-rule";
const PANE_OPACITY = {x: 0.45, y: 0.75, z: 0.6} as const;

/** Pixels a tick and a title stand off the box, away from its middle, so both clear the geoms. */
const TICK_CLEARANCE = 14;
const TITLE_CLEARANCE = 34;

export interface CubeView {
	matrix: Float32Array;
	orbit: Orbit;
	/** Whether the press that just ended turned the box, so a geom can hold back its click. */
	turned: () => boolean;
}

export interface CubeStageProps {
	domains: CubeDomains;
	/** The center the layers packed against, so the box and the geoms agree about where nought is. */
	center: [number, number, number];
	width: number;
	height: number;
	labels: {x: string; y: string; z: string};
	format?: (value: number) => string;
	/** Which back faces take a pane. Absent draws none. */
	panes?: LayerStyle["panes"];
	/** The live token values where the chart sits, for the GL path's colors. */
	theme?: ThemeSnapshot | null;
	children: (view: CubeView) => ReactNode;
}

/**
 * A point moved off its own edge, away from the middle of the box.
 *
 * Pushing radially from the middle is the obvious move and it fails on the vertical scale: that
 * edge runs close to the middle in x, so the direction away from it is barely a direction and the
 * title lands on the geoms. Stepping along the edge's own perpendicular puts a label beside the
 * rule it belongs to whichever way the cube is turned.
 */
function beside(
	point: {x: number; y: number},
	edge: {from: {x: number; y: number}; to: {x: number; y: number}},
	middle: {x: number; y: number},
	by: number,
) {
	const dx = edge.to.x - edge.from.x;
	const dy = edge.to.y - edge.from.y;
	const length = Math.hypot(dx, dy) || 1;
	const nx = -dy / length;
	const ny = dx / length;
	// Whichever side of the rule is further from the middle is the side with room on it.
	const sign = (point.x - middle.x) * nx + (point.y - middle.y) * ny >= 0 ? 1 : -1;
	return {x: point.x + nx * by * sign, y: point.y + ny * by * sign};
}

export function CubeStage({
	domains,
	center,
	width,
	height,
	labels,
	format = (value) => value.toLocaleString(undefined, {maximumSignificantDigits: 3}),
	panes,
	theme,
	children,
}: CubeStageProps) {
	const orbit = useOrbit();
	const renderer = useSharedRenderer();

	/* One matrix a frame, shared by the box, the ticks and whatever the caller draws over them. */
	const matrix = useMemo(
		() => cubeMatrix(orbit.orbit, width / (height || 1), domains, center),
		[orbit.orbit, width, height, domains, center],
	);

	const chrome = useMemo(
		() => cubeChrome(matrix, domains, center, width, height),
		[matrix, domains, center, width, height],
	);
	const filled = panes === "all" ? (["x", "y", "z"] as const) : panes === "walls" ? (["x", "y"] as const) : [];

	return (
		/*
      The export reads this: a file cannot be turned, so a copy of a cube admits as much.

      The gesture is read here and not on a rectangle inside, so a drag that starts over a geom
      turns the box while the geom keeps the hover and the click that belong to it. What a geom
      does not stop bubbles up to this group.
    */
		<g
			ref={orbit.ref}
			data-viz-cube="true"
			style={{cursor: orbit.turning ? "grabbing" : "grab", userSelect: "none", WebkitUserSelect: "none"}}
			onPointerDown={orbit.onPointerDown}
			onPointerMove={orbit.onPointerMove}
			onPointerUp={orbit.onPointerUp}
			onPointerCancel={orbit.onPointerUp}
		>
			{/* The GPU draws the back walls' panes and rules, and the geoms in front hide them. */}
			{renderer ? (
				<>
					{filled.map((axis) => (
						<GlWalls
							key={`pane${axis}`}
							panes={[chrome.walls.panes[axis]]}
							domains={domains}
							orbit={orbit.orbit}
							width={width}
							height={height}
							color={PANE_INK}
							opacity={PANE_OPACITY[axis]}
							theme={theme}
						/>
					))}
					<GlWalls
						rules={chrome.walls.grid}
						domains={domains}
						orbit={orbit.orbit}
						width={width}
						height={height}
						color={GRID_INK}
						opacity={GRID_OPACITY}
						linewidth={GRID_WIDTH}
						theme={theme}
					/>
					<GlWalls
						rules={chrome.walls.edges}
						domains={domains}
						orbit={orbit.orbit}
						width={width}
						height={height}
						color="--viz-rule"
						opacity={EDGE_OPACITY}
						theme={theme}
					/>
				</>
			) : (
				<>
					{filled.map((axis) => (
						<polygon
							key={`pane${axis}`}
							data-pane={axis}
							points={chrome.walls.panes[axis]
								.map((point) => projectData(matrix, point, center, width, height))
								.map((at) => `${at.x},${at.y}`)
								.join(" ")}
							fill={`var(${PANE_INK})`}
							fillOpacity={PANE_OPACITY[axis]}
						/>
					))}
					{chrome.grid.map((line, index) => (
						<line
							key={`grid${index}`}
							data-grid="major"
							x1={line.from.x}
							y1={line.from.y}
							x2={line.to.x}
							y2={line.to.y}
							stroke={`var(${GRID_INK})`}
							strokeOpacity={GRID_OPACITY}
							strokeWidth={GRID_WIDTH}
						/>
					))}
				</>
			)}

			{chrome.edges.map((edge, index) =>
				renderer && edge.back ? null : (
					<line
						key={index}
						x1={edge.from.x}
						y1={edge.from.y}
						x2={edge.to.x}
						y2={edge.to.y}
						stroke="var(--viz-rule)"
						strokeWidth={1}
						opacity={EDGE_OPACITY}
					/>
				),
			)}

			{chrome.axes.map((axis) => {
				const mid = {x: (axis.from.x + axis.to.x) / 2, y: (axis.from.y + axis.to.y) / 2};
				const title = beside(mid, axis, chrome.middle, TITLE_CLEARANCE);
				return (
					<g key={axis.axis}>
						{axis.ticks.map((tick, index) => {
							const at = beside(tick.at, axis, chrome.middle, TICK_CLEARANCE);
							return (
								<text
									key={index}
									x={at.x}
									y={at.y}
									fontSize={10}
									textAnchor="middle"
									dominantBaseline="middle"
									fill="var(--viz-ink-muted)"
								>
									{format(tick.value)}
								</text>
							);
						})}
						<text
							x={title.x}
							y={title.y}
							fontSize={11}
							textAnchor="middle"
							dominantBaseline="middle"
							fill="var(--viz-ink)"
						>
							{labels[axis.axis]}
						</text>
					</g>
				);
			})}

			{/* Painted so the empty air in the box turns it too, and under the geoms so they stay reachable. */}
			<rect width={width} height={height} fill="transparent" />

			{children({matrix, orbit: orbit.orbit, turned: orbit.turned})}
		</g>
	);
}

/** The middle of a set of readings, which is the center the GL layers pack against. */
export const middleOf = (values: number[]): number => {
	let lo = Infinity;
	let hi = -Infinity;
	for (const value of values) {
		if (value < lo) lo = value;
		if (value > hi) hi = value;
	}
	return Number.isFinite(lo) ? (lo + hi) / 2 : 0;
};
