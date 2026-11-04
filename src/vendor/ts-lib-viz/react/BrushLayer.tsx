/**
 * A box or a lasso dragged over a scatter's plot area.
 *
 * The layer wraps the geoms and hears presses on their hover targets. A click clears the region.
 */

import {useRef, useState, type ReactNode} from "react";

import {
	brushedOf,
	type Brushed,
	type BrushShape,
	type ChartSpec,
	type FrameChildProps,
	type Pixel,
	type Trace,
} from "../core/internal.js";

/** Pointer travel that makes a press a drag and not a click, in pixels. */
const DRAG_FLOOR = 3;

/** Travel between two lasso vertices, in pixels. */
const VERTEX_GAP = 2;

export interface BrushLayerProps {
	shape: BrushShape;
	child: FrameChildProps;
	traces: readonly Trace[];
	spec: ChartSpec;
	keyField?: string;
	transposed?: boolean;
	onBrush?: (brushed: Brushed | null) => void;
	/** Receives a released box's two corners in plot-area pixels. A layer with it zooms and selects nothing. */
	onRegion?: (corners: readonly [Pixel, Pixel]) => void;
	children: ReactNode;
}

/** The outline of a region through its pixels. A box takes its two corners. */
function outlineOf(shape: BrushShape, at: readonly Pixel[]): string {
	if (shape === "box") {
		const [a, b] = at;
		return a && b ? `M${a.x},${a.y}H${b.x}V${b.y}H${a.x}Z` : "";
	}
	return `${at.map((one, index) => `${index === 0 ? "M" : "L"}${one.x},${one.y}`).join("")}Z`;
}

export function BrushLayer({
	shape,
	child,
	traces,
	spec,
	keyField,
	transposed = false,
	onBrush,
	onRegion,
	children,
}: BrushLayerProps) {
	const area = useRef<SVGRectElement>(null);
	const start = useRef<Pixel | null>(null);
	const dragged = useRef(false);
	/* The vertices while the hand is down, in plot-area pixels. Read at release. */
	const trail = useRef<Pixel[]>([]);
	const [path, setPath] = useState<Pixel[] | null>(null);
	/* The released region in data units. A zoom redraws it over the records it holds. */
	const [held, setHeld] = useState<Brushed["region"] | null>(null);

	const local = (event: React.PointerEvent): Pixel => {
		const box = area.current?.getBoundingClientRect();
		const x = event.clientX - (box?.left ?? 0);
		const y = event.clientY - (box?.top ?? 0);
		return {x: Math.min(child.width, Math.max(0, x)), y: Math.min(child.height, Math.max(0, y))};
	};

	const onPointerDown = (event: React.PointerEvent<SVGGElement>) => {
		if (event.button !== 0) return;
		start.current = local(event);
		trail.current = [start.current];
		dragged.current = false;
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const onPointerMove = (event: React.PointerEvent<SVGGElement>) => {
		const from = start.current;
		if (!from) return;
		const at = local(event);
		if (!dragged.current && Math.hypot(at.x - from.x, at.y - from.y) < DRAG_FLOOR) return;
		dragged.current = true;
		const last = trail.current[trail.current.length - 1] ?? from;
		if (shape === "box") trail.current = [from, at];
		else if (Math.hypot(at.x - last.x, at.y - last.y) >= VERTEX_GAP) trail.current = [...trail.current, at];
		setPath(trail.current);
	};

	const onPointerUp = (event: React.PointerEvent<SVGGElement>) => {
		const from = start.current;
		start.current = null;
		event.currentTarget.releasePointerCapture?.(event.pointerId);
		if (!from) return;
		setPath(null);
		if (!dragged.current) {
			if (held) {
				setHeld(null);
				onBrush?.(null);
			}
			return;
		}
		/* The region ends where the hand lets go. */
		const end = local(event);
		if (onRegion) {
			onRegion([from, end]);
			return;
		}
		const region = shape === "box" ? [from, end] : [...trail.current, end];
		const brushed = brushedOf(
			traces,
			shape,
			region,
			{scale: child.x, invert: child.xInvert, step: child.xStep},
			{scale: child.y, invert: child.yInvert, step: child.yStep},
			{spec, keyField, transposed},
		);
		setHeld(brushed.region);
		onBrush?.(brushed);
	};

	/* A press the browser cancels, a touch scroll or a stolen pointer, leaves no region. */
	const onPointerCancel = () => {
		start.current = null;
		setPath(null);
	};

	/* The click a drag ends on belongs to the drag. A geom under the hand does not take it. */
	const swallow = (event: React.MouseEvent) => {
		if (dragged.current) event.stopPropagation();
	};

	/* The held region, back through the scales the panel draws with now. */
	const place = (at: Brushed["region"][number]): Pixel =>
		transposed ? {x: child.x(at.y), y: child.y(at.x)} : {x: child.x(at.x), y: child.y(at.y)};
	const outline = path ?? held?.map(place) ?? null;

	return (
		<g
			data-brush={onRegion ? "zoom" : shape}
			style={{cursor: "crosshair"}}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerCancel}
			onClickCapture={swallow}
		>
			<rect ref={area} width={child.width} height={child.height} fill="transparent" />
			{children}
			{outline && outline.length > 1 && (
				<path
					data-brush-region=""
					d={outlineOf(shape, outline)}
					fill="var(--viz-ink)"
					fillOpacity={0.06}
					stroke="var(--viz-ink)"
					strokeOpacity={0.6}
					strokeDasharray="4 3"
					pointerEvents="none"
				/>
			)}
		</g>
	);
}
