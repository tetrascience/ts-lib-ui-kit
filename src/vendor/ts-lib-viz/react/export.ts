/**
 * Export handles file handling -- e.g png and svg export.
 * During export, a file must maintain the same tokens as the rendered plot. png are rasterized from svg.
 */

import {resolveTheme} from "./theme.js";
import {existingGlSurface} from "./gl/surface.js";
import {VIZ_TOKENS, type ThemeSnapshot} from "../core/internal.js";

/** Resolves theme tokens to literal values. The file then carries its own colors. */
export function resolveTokens(svg: string, snapshot: ThemeSnapshot): string {
	let out = svg;
	for (const token of VIZ_TOKENS) {
		out = out.split(`var(${token})`).join(snapshot[token]);
	}
	return out;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** Finds the figure's panel SVGs, or the first SVG where none is marked. Throws where the element holds none. */
function panelsOf(root: Element): SVGSVGElement[] {
	if (root instanceof SVGSVGElement) return [root];
	const marked = [...root.querySelectorAll<SVGSVGElement>("svg[data-viz-panel]")];
	if (marked.length > 0) return marked;
	const first = root.querySelector("svg");
	if (!first) throw new Error("exportSvg: no svg under the element handed in");
	return [first];
}

/** The size an SVG draws at, off its box and then its attributes. */
const sizeOf = (svg: SVGSVGElement) => ({
	width: svg.clientWidth || Number(svg.getAttribute("width")) || 640,
	height: svg.clientHeight || Number(svg.getAttribute("height")) || 320,
});

/**
 * Builds the figure as one SVG element with each panel at its offset.
 *
 * A facet's strips are HTML, and each is written in as its card and its name.
 */
function figureOf(root: Element): {panels: SVGSVGElement[]; figure: SVGSVGElement; width: number; height: number} {
	const panels = panelsOf(root);
	if (panels.length === 1) {
		const only = panels[0]!;
		return {panels, figure: only.cloneNode(true) as SVGSVGElement, ...sizeOf(only)};
	}

	const doc = root.ownerDocument;
	const origin = root.getBoundingClientRect();
	const figure = doc.createElementNS(SVG_NS, "svg") as SVGSVGElement;
	let width = 0;
	let height = 0;
	for (const panel of panels) {
		const box = panel.getBoundingClientRect();
		const [x, y] = [box.left - origin.left, box.top - origin.top];
		const copy = panel.cloneNode(true) as SVGSVGElement;
		copy.setAttribute("x", String(x));
		copy.setAttribute("y", String(y));
		figure.appendChild(copy);
		const size = sizeOf(panel);
		width = Math.max(width, x + size.width);
		height = Math.max(height, y + size.height);
	}

	for (const strip of root.querySelectorAll<HTMLElement>("[data-viz-strip]")) {
		const box = strip.getBoundingClientRect();
		const [x, y] = [box.left - origin.left, box.top - origin.top];
		const card = doc.createElementNS(SVG_NS, "rect");
		card.setAttribute("x", String(x));
		card.setAttribute("y", String(y));
		card.setAttribute("width", String(box.width));
		card.setAttribute("height", String(box.height));
		card.setAttribute("fill", "var(--viz-rule)");
		const name = doc.createElementNS(SVG_NS, "text");
		name.setAttribute("x", String(x + box.width / 2));
		name.setAttribute("y", String(y + box.height / 2));
		name.setAttribute("text-anchor", "middle");
		name.setAttribute("dominant-baseline", "central");
		name.setAttribute("font-size", doc.defaultView?.getComputedStyle(strip).fontSize || "12px");
		name.setAttribute("font-weight", "500");
		name.setAttribute("fill", "var(--viz-ink)");
		name.textContent = strip.textContent;
		figure.append(card, name);
	}

	figure.setAttribute("width", String(width));
	figure.setAttribute("height", String(height));
	return {panels, figure, width, height};
}

/**
 * Admits that a static copy of a cube loses depth. A file cannot be rotated.
 *
 * Under WebGL an SVG copy drops the geoms and back-wall chrome. A PNG keeps both.
 */
export const STATIC_CUBE_NOTE = "One view of a turned figure. Depth is not recoverable in this copy.";

/** Whether the chart holds a cube. A cube export carries the depth note. */
const holdsCube = (svg: SVGSVGElement): boolean => svg.querySelector("[data-viz-cube]") != null;

/** Adds the depth note under the geoms. */
function noteInto(clone: SVGSVGElement, height: number): void {
	const line = clone.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
	line.setAttribute("x", "4");
	line.setAttribute("y", String(Math.max(10, height - 4)));
	line.setAttribute("font-size", "10");
	line.setAttribute("fill", "var(--viz-ink-muted)");
	line.textContent = STATIC_CUBE_NOTE;
	clone.appendChild(line);
}

/** Sets the paper for the figure. Enables background resolution for both dark and light mode. */
function groundInto(clone: SVGSVGElement, snapshot: ThemeSnapshot): void {
	const paper = clone.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
	paper.setAttribute("x", "0");
	paper.setAttribute("y", "0");
	paper.setAttribute("width", "100%");
	paper.setAttribute("height", "100%");
	paper.setAttribute("fill", snapshot["--viz-paper"]);
	clone.insertBefore(paper, clone.firstChild);
}

export interface SvgOptions {
	/** Whether the file paints its own paper. Off where the caller composites its own ground. */
	ground?: boolean;
}

/**
 * The chart as a standalone SVG document. Colors and font resolve at export.
 */
export function exportSvg(root: Element, {ground = true}: SvgOptions = {}): string {
	const {panels, figure: clone, height} = figureOf(root);
	const svg = panels[0]!;
	const snapshot = resolveTheme(svg);

	clone.setAttribute("xmlns", SVG_NS);
	if (ground) groundInto(clone, snapshot);
	const family = svg.ownerDocument.defaultView?.getComputedStyle(svg).fontFamily;
	if (family) clone.setAttribute("font-family", family);
	if (panels.some(holdsCube)) noteInto(clone, height);

	const text = new XMLSerializer().serializeToString(clone);
	return `<?xml version="1.0" encoding="UTF-8"?>\n${resolveTokens(text, snapshot)}`;
}

export interface PngOptions {
	/** Device pixels per CSS pixel. Two, the default, draws a retina-density file. */
	scale?: number;
}

/**
 * The chart as a PNG, at `scale` device pixels per CSS pixel.
 *
 * Composites the page's density layer under the chart where a renderer already drew one. The file
 * matches the screen, and the export builds no renderer of its own.
 */
export async function exportPng(root: Element, {scale = 2}: PngOptions = {}): Promise<Blob> {
	const {panels, width, height} = figureOf(root);
	const svg = panels[0]!;
	const snapshot = resolveTheme(svg);

	const image = new Image();
	/* The canvas paints the ground for this path. */
	const held = new Blob([exportSvg(root, {ground: false})], {type: "image/svg+xml;charset=utf-8"});
	const url = URL.createObjectURL(held);
	try {
		await new Promise<void>((resolve, reject) => {
			image.onload = () => resolve();
			image.onerror = () => reject(new Error("exportPng: the SVG did not rasterise"));
			image.src = url;
		});

		const canvas = svg.ownerDocument.createElement("canvas");
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("exportPng: no 2d context to compose in");

		ctx.fillStyle = snapshot["--viz-paper"];
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		/* The GL slice must be copied in the same task as the draw. A later read returns a cleared buffer. */
		const surface = existingGlSurface();
		const glCanvas = svg.ownerDocument.querySelector<HTMLCanvasElement>('canvas[data-ts-lib-viz="gl-surface"]');
		if (surface && glCanvas && glCanvas.width > 0) {
			const view = svg.ownerDocument.defaultView;
			const dpr = view?.devicePixelRatio || 1;
			/* Each panel's slice lands at the panel's own offset in the figure. */
			const origin = (panels.length === 1 ? svg : root).getBoundingClientRect();
			surface.drawNow();
			for (const panel of panels) {
				const rect = panel.getBoundingClientRect();
				ctx.drawImage(
					glCanvas,
					rect.left * dpr,
					rect.top * dpr,
					rect.width * dpr,
					rect.height * dpr,
					(rect.left - origin.left) * scale,
					(rect.top - origin.top) * scale,
					rect.width * scale,
					rect.height * scale,
				);
			}
		}

		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		return await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error("exportPng: the canvas gave no blob"))),
				"image/png",
			);
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}
