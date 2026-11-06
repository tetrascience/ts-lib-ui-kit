/**
 * The gesture that turns a cube.
 *
 * The design language permits a third position scale where the reader can rotate, so this is part
 * of the geom and not a control beside it. A cube that mounts without it is the static projection
 * the rule refuses.
 *
 * The arithmetic is in `core/camera.ts` for the reason the 2D zoom's is in `core/zoom.ts`: what the
 * orbit does to a matrix is a fact about numbers, and only the pointer handling needs a DOM. See
 * the ADR "A third position scale is permitted where the reader can rotate".
 */

import {useCallback, useEffect, useRef, useState} from "react";

import {AT_REST_ORBIT, dollied, orbited, type Orbit} from "../core/internal.js";

export interface OrbitControl {
	orbit: Orbit;
	/**
	 * Attach to the group the gesture is read over, which is also where the wheel is caught.
	 *
	 * The group and not a rectangle inside it: a rectangle drawn over the geoms to catch the drag
	 * takes their hover and their click along with it, and one drawn under them catches nothing
	 * where a geom is. Handlers on the group see both, since what a geom does not stop bubbles.
	 */
	ref: React.RefObject<SVGGElement | null>;
	onPointerDown: (event: React.PointerEvent) => void;
	onPointerMove: (event: React.PointerEvent) => void;
	onPointerUp: (event: React.PointerEvent) => void;
	/** Whether a drag is in progress, so a cursor can say so. */
	turning: boolean;
	/**
	 * Whether the press that just ended turned the cube.
	 *
	 * A turn ends over a geom and the click that follows would select it. The flag holds until the
	 * next press, so the click belonging to a turn is the only one it suppresses. Same contract as
	 * the flat viewport's `panned`.
	 */
	turned: () => boolean;
	reset: () => void;
}

/** Pointer travel that makes a press a turn and not a click, in pixels. */
const TURN_FLOOR = 3;

/** A notch of wheel, in the units `dollied` counts. Trackpads report pixels and mice report lines. */
const notchesOf = (event: WheelEvent): number => (event.deltaMode === 0 ? event.deltaY / 100 : event.deltaY);

export function useOrbit(initial: Orbit = AT_REST_ORBIT): OrbitControl {
	const [orbit, setOrbit] = useState<Orbit>(initial);
	const [turning, setTurning] = useState(false);
	const from = useRef<{x: number; y: number} | null>(null);
	/** Where the press began. A turn is read off the travel from here. */
	const origin = useRef<{x: number; y: number}>({x: 0, y: 0});
	const moved = useRef(false);
	const ref = useRef<SVGGElement | null>(null);

	/*
	  The wheel listener is attached by hand because React's is passive, and a passive listener
	  cannot stop the page scrolling out from under a reader who meant to dolly in.
	*/
	useEffect(() => {
		const surface = ref.current;
		if (!surface) return;
		const onWheel = (event: WheelEvent) => {
			/* A pinch arrives as a wheel with the control key held. A plain wheel scrolls the page. */
			if (!event.ctrlKey) return;
			event.preventDefault();
			setOrbit((held) => dollied(held, notchesOf(event)));
		};
		surface.addEventListener("wheel", onWheel, {passive: false});
		return () => surface.removeEventListener("wheel", onWheel);
	}, []);

	const onPointerDown = useCallback((event: React.PointerEvent) => {
		/*
      A turn is a drag, and a drag over text is a selection unless something says otherwise.

      Without this the axis names and every tick number highlight as the reader turns the box, and
      the selection survives the gesture. `user-select: none` on the group covers the text inside
      it; this covers the drag that carries on past the group's edge.
    */
		event.preventDefault();
		event.currentTarget.setPointerCapture?.(event.pointerId);
		from.current = {x: event.clientX, y: event.clientY};
		origin.current = {x: event.clientX, y: event.clientY};
		moved.current = false;
		setTurning(true);
	}, []);

	const onPointerMove = useCallback((event: React.PointerEvent) => {
		const start = from.current;
		if (!start) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		const travel = Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y);
		if (travel >= TURN_FLOOR) moved.current = true;
		from.current = {x: event.clientX, y: event.clientY};
		setOrbit((held) => orbited(held, dx, dy));
	}, []);

	const onPointerUp = useCallback((event: React.PointerEvent) => {
		if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		from.current = null;
		setTurning(false);
	}, []);

	const turned = useCallback(() => moved.current, []);

	const reset = useCallback(() => setOrbit(initial), [initial]);

	return {orbit, ref, onPointerDown, onPointerMove, onPointerUp, turning, turned, reset};
}
