/**
 * Reading the live token values, and noticing when they change.
 *
 * The SVG geoms need none of this: a `var(--viz-ink)` in a `stroke` attribute is resolved by the
 * browser, and a theme flip repaints without React hearing about it. The GPU path is the caller:
 * a shader takes three floats, so the set has to be resolved to numbers once at mount and again
 * whenever the theme changes, and the color buffers repacked from the result.
 *
 * Two things make a snapshot trustworthy. A custom property resolves to whatever the author wrote,
 * so a theme declared in `oklch()` arrives in that syntax and the package's parser cannot read it;
 * the probe below hands the value to the browser as a `color` and reads back the computed form,
 * which is normalized to `rgb()`. And a flip is two separate signals: a class on the root element
 * for a host with a theme switch, and `prefers-color-scheme` for a host without one. Watching only
 * the class left a chart painted for the wrong theme on a machine that flipped at sunset.
 *
 * See the ADR "The theme tokens belong to the package".
 */

import {useEffect, useRef, useState, useSyncExternalStore} from "react";

import {LIGHT_THEME, VIZ_TOKENS, rgbOf, type ThemeSnapshot, type VizToken} from "../core/internal.js";

/** One pixel of a color, read back as `rgb()`. Null where the document draws no 2D canvas. */
function painted(color: string, doc: Document): string | null {
	const canvas = doc.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d", {willReadFrequently: true});
	if (!context) return null;
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 1);
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * A color in the form the parser reads.
 *
 * Computed off a detached element. An `oklch()`, `lab()` or `color()` is painted to one pixel. A
 * rejected value returns as written.
 */
function normalize(value: string, probe: HTMLElement): string {
	if (!value) return value;
	probe.style.color = "";
	probe.style.color = value;
	if (!probe.style.color) return value;
	const computed = getComputedStyle(probe).color || value;
	return rgbOf(computed) ? computed : (painted(computed, probe.ownerDocument) ?? computed);
}

/**
 * The token set as declared where this element sits.
 *
 * A token the host has not declared falls back to the shipped light value, so a chart mounted with
 * no theme installed draws in neutral grays instead of picking up whatever the browser defaults a
 * missing custom property to.
 */
export function resolveTheme(element: Element): ThemeSnapshot {
	const style = getComputedStyle(element);
	const doc = element.ownerDocument;
	const probe = doc.createElement("span");
	probe.style.display = "none";
	doc.body?.appendChild(probe);

	try {
		const out = {} as ThemeSnapshot;
		for (const token of VIZ_TOKENS) {
			const declared = style.getPropertyValue(token).trim();
			out[token] = declared ? normalize(declared, probe) : LIGHT_THEME[token];
		}
		return out;
	} finally {
		probe.remove();
	}
}

const sameSnapshot = (a: ThemeSnapshot, b: ThemeSnapshot) =>
	VIZ_TOKENS.every((token: VizToken) => a[token] === b[token]);

/**
 * Calls back with a fresh snapshot each time the resolved values change.
 *
 * Watches the root element's `class` and `style` attributes, which is where a host's theme switch
 * writes, and the `prefers-color-scheme` query for a host that leaves it to the system. Returns the
 * teardown.
 *
 * The callback fires on a real change and not on the signal. A class toggle that moves no token is
 * common on a page with one theme, and repacking color buffers for it would put a stall in a
 * scroll.
 */
export function watchTheme(element: Element, onChange: (snapshot: ThemeSnapshot) => void): () => void {
	const doc = element.ownerDocument;
	const view = doc.defaultView;
	let held = resolveTheme(element);

	const check = () => {
		const next = resolveTheme(element);
		if (sameSnapshot(held, next)) return;
		held = next;
		onChange(next);
	};

	const observer = new MutationObserver(check);
	observer.observe(doc.documentElement, {attributes: true, attributeFilter: ["class", "style"]});
	if (element !== doc.documentElement) {
		observer.observe(element, {attributes: true, attributeFilter: ["class", "style"]});
	}

	const query = view?.matchMedia?.("(prefers-color-scheme: dark)");
	query?.addEventListener?.("change", check);

	return () => {
		observer.disconnect();
		query?.removeEventListener?.("change", check);
	};
}

/** The page root's set, held while the root's class and style and the color scheme hold. */
let pageKey: string | null = null;
let pageHeld: ThemeSnapshot | null = null;

function pageTheme(): ThemeSnapshot {
	const root = document.documentElement;
	const scheme = root.ownerDocument.defaultView?.matchMedia?.("(prefers-color-scheme: dark)").matches;
	const key = `${root.className}|${root.getAttribute("style") ?? ""}|${scheme}`;
	if (key !== pageKey || !pageHeld) {
		pageKey = key;
		pageHeld = resolveTheme(root);
	}
	return pageHeld;
}

/* The element's own watcher carries a flip after mount, so the seed subscribes to nothing. */
const unwatched = () => () => undefined;
const noTheme = () => null;

/**
 * The token set where a component sits, kept current across theme flips.
 *
 * A client render starts from the page root's set, so a chart on a dark page builds once. The server
 * and a hydrating pass start at null, the one signal for "nothing to read yet", and the element's own
 * set replaces the seed once the ref attaches.
 */
export function useVizTheme(ref: {current: Element | null}): ThemeSnapshot | null {
	const seed = useSyncExternalStore(unwatched, pageTheme, noTheme);
	const seeded = useRef(seed);
	seeded.current = seed;
	const [snapshot, setSnapshot] = useState<ThemeSnapshot | null>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		/* The seed's identity survives where the element reads the same set, so nothing keyed on it reruns. */
		const next = resolveTheme(element);
		const held = seeded.current;
		setSnapshot(held && sameSnapshot(held, next) ? held : next);
		return watchTheme(element, setSnapshot);
	}, [ref]);

	return snapshot ?? seed;
}
