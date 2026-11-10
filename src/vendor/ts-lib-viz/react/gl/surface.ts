/**
 * The page's one GL canvas, and the renderer over it.
 *
 * Created on first use and kept for the document's life, because the context is the scarce thing:
 * dropping and remaking one per chart is what the shared context exists to avoid. A caller that
 * wants an isolated renderer mounts a `VizGlProvider`, over a canvas of its own through `host`.
 *
 * The canvas is fixed to the viewport and takes no pointer events, so it paints behind the charts'
 * own SVG chrome and never intercepts a hover.
 */

import {SharedRenderer, type Host, type RendererOptions} from "./renderer.js";

let renderer: SharedRenderer | null = null;
let canvas: HTMLCanvasElement | null = null;

const CANVAS_STYLE = {
	position: "fixed",
	inset: "0",
	width: "100%",
	height: "100%",
	pointerEvents: "none",
	// Behind the chart chrome, above the page's own ground.
	zIndex: "0",
} as const;

function surfaceCanvas(): HTMLCanvasElement {
	if (canvas) return canvas;
	const element = document.createElement("canvas");
	element.dataset.tsLibViz = "gl-surface";
	Object.assign(element.style, CANVAS_STYLE);
	document.body.appendChild(element);
	canvas = element;
	return element;
}

/** A canvas element read as a host: its rectangle in page coordinates, and the display's ratio. */
export const hostFor = (canvas: HTMLCanvasElement): Host => ({
	canvas,
	rect: () => {
		const box = canvas.getBoundingClientRect();
		return {left: box.left, top: box.top, width: box.width, height: box.height};
	},
	dpr: () => window.devicePixelRatio || 1,
});

/**
 * The page's renderer, built on first ask.
 *
 * Returns null where there is no document, which is the headless case: a caller reads that as the
 * GPU tier being unavailable and draws its SVG treatment.
 */
export function glSurface(options: RendererOptions = {}): SharedRenderer | null {
	if (typeof document === "undefined") return null;
	if (renderer) return renderer.available ? renderer : null;
	renderer = new SharedRenderer(hostFor(surfaceCanvas()), options);
	return renderer.available ? renderer : null;
}

/** The page's renderer where something already built it, and null otherwise. Builds nothing. */
export const existingGlSurface = (): SharedRenderer | null => (renderer?.available ? renderer : null);

/** Drops the page renderer and its canvas. For a test, or a host tearing down its own root. */
export function releaseGlSurface(): void {
	renderer?.dispose();
	renderer = null;
	canvas?.remove();
	canvas = null;
}

/**
 * Redraws every layer.
 *
 * The layers' rectangles are read fresh each frame, so a scroll or a resize needs nothing but a
 * new frame. A host binds this to whatever moves its charts.
 */
export function refreshGlSurface(): void {
	renderer?.schedule();
}
