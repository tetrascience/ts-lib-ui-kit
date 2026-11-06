/**
 * A wheel and a drag, in the shape the domain arithmetic reads.
 *
 * `zoomedAxes` has been able to turn a transform into the slice of a domain it leaves visible since
 * the zoom was written, and nothing produced a transform. This is that half: the gesture, held
 * inside the data it is reading, and no opinion about what a chart does with the result.
 *
 * It reports a transform and not a set of scales, which is what keeps the arithmetic in `/core` and
 * testable without a pointer. See the ADR "A zoom rewrites the domain".
 */

import {useCallback, useEffect, useRef, useState} from "react";

import {AT_REST_ZOOM, isZoomed, MAX_SCALE, zoomedBy, zoomedTo, type ZoomTransform} from "../core/internal.js";

/** How hard one notch of wheel closes in. Exponential, so a trackpad and a mouse read alike. */
const PER_NOTCH = 0.002;

/** Pointer travel that makes a press a pan and not a click, in pixels. */
const PAN_FLOOR = 3;

/**
 * The transform held inside the data it reads.
 *
 * Scale below one would show a reader padding around a domain that already fits, and a translate
 * past either end would put empty frame beside the geoms. Both are held here and not at the two
 * gestures, so a wheel and a drag cannot disagree about where the edge of the data is.
 */
function held(next: ZoomTransform, width: number, height: number): ZoomTransform {
	const scaleX = Math.min(MAX_SCALE, Math.max(1, next.scaleX));
	const scaleY = Math.min(MAX_SCALE, Math.max(1, next.scaleY));
	return {
		scaleX,
		scaleY,
		translateX: Math.min(0, Math.max(-(scaleX - 1) * width, next.translateX)),
		translateY: Math.min(0, Math.max(-(scaleY - 1) * height, next.translateY)),
	};
}

type Area = {left: number; top: number; right: number; bottom: number};

export interface ZoomView {
	/** Put this on the element the gesture is read against. */
	surface: React.RefObject<HTMLDivElement | null>;
	transform: ZoomTransform;
	/** Whether the view has moved off rest, which is what decides whether the geoms want clipping. */
	zoomed: boolean;
	reset: () => void;
	/** One step in or out about the plot area's center. */
	zoomBy: (factor: number, area: Area) => void;
	/** Fills the plot area with a box in the gesture's pixels. */
	zoomTo: (box: Area, area: Area) => void;
	/** Spread onto the same element. The wheel attaches itself; these cannot. */
	handlers: {
		onPointerDown: (event: React.PointerEvent) => void;
		onPointerMove: (event: React.PointerEvent) => void;
		onPointerUp: (event: React.PointerEvent) => void;
	};
	/**
	 * Whether the press that just ended was a pan.
	 *
	 * A drag across a scatter ends over a geom, and the click that follows would select it. The flag
	 * holds until the next press, so the click belonging to a pan is the only one it suppresses.
	 */
	panned: () => boolean;
}

/**
 * A viewport over a panel of this size.
 *
 * The box is the panel and not the plot area, since a gesture is read against the element it landed
 * on and `zoomedAxes` carries the margin between the two. With `pan` off, a drag belongs to a brush.
 */
export function useZoom(enabled: boolean, width: number, height: number, pan = true, wheel = true): ZoomView {
	const surface = useRef<HTMLDivElement>(null);
	const [transform, setTransform] = useState<ZoomTransform>(AT_REST_ZOOM);

	/*
	  One render per frame, however many wheel and pointer events arrive in it.

	  The first event of a frame renders at once and the rest land in `live`, which the frame's end
	  renders. A trackpad sends several events a frame, and each one rebuilt the scales.
	*/
	const live = useRef<ZoomTransform>(AT_REST_ZOOM);
	const queued = useRef(false);
	const move = useCallback((next: (from: ZoomTransform) => ZoomTransform) => {
		live.current = next(live.current);
		if (queued.current) return;
		setTransform(live.current);
		queued.current = true;
		const flush = () => {
			queued.current = false;
			setTransform(live.current);
		};
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(flush);
		else setTimeout(flush, 16);
	}, []);

	const reset = useCallback(() => {
		live.current = AT_REST_ZOOM;
		setTransform(AT_REST_ZOOM);
	}, []);

	const zoomBy = useCallback(
		(factor: number, area: Area) => move((from) => held(zoomedBy(from, factor, area), width, height)),
		[move, width, height],
	);
	const zoomTo = useCallback(
		(box: Area, area: Area) => move((from) => held(zoomedTo(from, box, area), width, height)),
		[move, width, height],
	);

	/* Back to rest wherever the caller turns the gesture off, so a prop cannot leave a figure zoomed. */
	useEffect(() => {
		if (!enabled) reset();
	}, [enabled, reset]);

	useEffect(() => {
		const element = surface.current;
		if (!element || !enabled || !wheel) return;

		/*
      Attached here and not through `onWheel`, because React registers that one passive and
      `preventDefault` on a passive listener is ignored: the chart would zoom and the page would
      scroll under it at the same time.
    */
		const onWheel = (event: WheelEvent) => {
			event.preventDefault();
			const box = element.getBoundingClientRect();
			const at = {x: event.clientX - box.left, y: event.clientY - box.top};
			const factor = Math.exp(-event.deltaY * PER_NOTCH);

			move((from) =>
				held(
					{
						scaleX: from.scaleX * factor,
						scaleY: from.scaleY * factor,
						/* The value under the cursor stays under it, which is what makes a wheel read as a zoom. */
						translateX: at.x - (at.x - from.translateX) * factor,
						translateY: at.y - (at.y - from.translateY) * factor,
					},
					width,
					height,
				),
			);
		};

		element.addEventListener("wheel", onWheel, {passive: false});
		return () => element.removeEventListener("wheel", onWheel);
	}, [enabled, wheel, width, height, move]);

	const from = useRef<{x: number; y: number} | null>(null);
	const moved = useRef(false);

	const onPointerDown = useCallback(
		(event: React.PointerEvent) => {
			if (!enabled || !pan) return;
			from.current = {x: event.clientX, y: event.clientY};
			moved.current = false;
			/* Capture keeps the drag alive past the edge of the panel where the host has it. */
			event.currentTarget.setPointerCapture?.(event.pointerId);
		},
		[enabled, pan],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent) => {
			/* A gesture turned off mid-drag drops the drag with it. */
			if (!enabled) from.current = null;
			const start = from.current;
			if (!start) return;

			const dx = event.clientX - start.x;
			const dy = event.clientY - start.y;
			if (Math.abs(dx) >= PAN_FLOOR || Math.abs(dy) >= PAN_FLOOR) moved.current = true;
			from.current = {x: event.clientX, y: event.clientY};

			move((at) => held({...at, translateX: at.translateX + dx, translateY: at.translateY + dy}, width, height));
		},
		[enabled, width, height, move],
	);

	const onPointerUp = useCallback((event: React.PointerEvent) => {
		from.current = null;
		event.currentTarget.releasePointerCapture?.(event.pointerId);
	}, []);

	const panned = useCallback(() => moved.current, []);

	return {
		surface,
		transform,
		zoomed: isZoomed(transform),
		reset,
		zoomBy,
		zoomTo,
		handlers: {onPointerDown, onPointerMove, onPointerUp},
		panned,
	};
}
