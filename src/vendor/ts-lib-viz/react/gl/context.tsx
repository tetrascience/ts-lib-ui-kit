/**
 * Who a geom asks for the GPU, and when.
 *
 * `glSurface` builds the page's renderer on first ask, and building it appends a canvas to the
 * document. The geoms asked for it from `useMemo`, which runs while React is rendering, so the
 * first chart to consider the GPU mutated the document mid-render. Three things followed from
 * that: a render React discarded left the canvas behind, a server render answered "no GPU" while
 * the client answered "yes" and the two produced different trees for the same props, and the
 * decision was made before any effect could say where the chart had landed.
 *
 * `useSharedRenderer` moves the ask into an effect. The first render answers null whichever side it
 * runs on, so the geoms draw their SVG treatment, and the swap to the GPU happens after mount
 * where a discarded render costs nothing.
 *
 * `VizGlProvider` is the other half. `SharedRenderer` already takes a `Host` — a canvas, its
 * rectangle, its pixel ratio — and the page singleton was the only thing that ever supplied one,
 * which left the seam hypothetical. A provider supplies a second: its canvas is a React child
 * positioned against the provider's own box, so charts inside a dialog, a transformed parent or a
 * scroll container get a GL layer that lands where their SVG chrome is. A host with a canvas of
 * its own passes one directly.
 *
 * One context for the page stays the decision on record. A provider does not add a context per
 * chart; it decides which canvas the one context draws into. See the ADR "One WebGL2 context for
 * the page".
 */

import {createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";

import {SharedRenderer, type FrameStats, type Host} from "./renderer.js";
import {glSurface, hostFor} from "./surface.js";

/**
 * The renderer in force.
 *
 * `undefined` means no provider, which is what sends `useSharedRenderer` to the page singleton. `null`
 * means a provider is present and the GPU is unavailable, which a geom reads as "draw the fallback"
 * instead of as "go look elsewhere".
 */
const GlContext = createContext<SharedRenderer | null | undefined>(undefined);

/** The canvas a provider mounts: its own box, behind the chart chrome, deaf to the pointer. */
const CANVAS_STYLE = {
	position: "absolute",
	inset: 0,
	width: "100%",
	height: "100%",
	pointerEvents: "none",
	zIndex: 0,
} as const;

export interface VizGlProviderProps {
	/**
	 * A canvas the host already owns, read through `hostFor` or built by hand.
	 *
	 * Absent, the provider mounts its own and positions it against its box, which is the case that
	 * makes a chart inside a transformed or scrolled parent line up.
	 *
	 * Keyed on its canvas. A fresh object over the same canvas keeps the renderer, and its `rect` and
	 * `dpr` are read from the latest one.
	 */
	host?: Host;
	/** Timed frames. Costs a GPU query a frame, so it stays off unless asked for. */
	measure?: boolean;
	/** The host drives frames itself, and `schedule` puts none up. */
	driven?: boolean;
	children: ReactNode;
}

/**
 * A renderer for the charts below it.
 *
 * Built in an effect and disposed with the provider, so nothing is created while React renders and
 * a provider that unmounts takes its context with it.
 */
export function VizGlProvider({host, measure, driven, children}: VizGlProviderProps) {
	const holder = useRef<HTMLCanvasElement>(null);
	const [renderer, setRenderer] = useState<SharedRenderer | null>(null);
	const hosted = useRef(host);
	hosted.current = host;
	const canvas = host?.canvas;

	useEffect(() => {
		const given = hosted.current;
		const supplied: Host | null = given
			? {
					canvas: given.canvas,
					rect: () => (hosted.current ?? given).rect(),
					dpr: () => (hosted.current ?? given).dpr(),
				}
			: holder.current
				? hostFor(holder.current)
				: null;
		if (!supplied) return;
		const built = new SharedRenderer(supplied, {measure, driven});
		setRenderer(built.available ? built : null);
		return () => {
			built.dispose();
			setRenderer(null);
		};
	}, [canvas, measure, driven]);

	return (
		<GlContext.Provider value={renderer}>
			{host ? null : (
				<div style={{position: "relative"}}>
					<canvas ref={holder} style={CANVAS_STYLE} data-ts-lib-viz="gl-provider" />
					{children}
				</div>
			)}
			{host ? children : null}
		</GlContext.Provider>
	);
}

/**
 * The renderer a geom should draw through, or null while there is none.
 *
 * Null on the first render either side of a hydration boundary, which is what keeps the server's
 * tree and the client's first tree the same. A geom reads null as its SVG treatment.
 */
export function useSharedRenderer(): SharedRenderer | null {
	const provided = useContext(GlContext);
	const [page, setPage] = useState<SharedRenderer | null>(null);

	useEffect(() => {
		if (provided !== undefined) return;
		setPage(glSurface());
	}, [provided]);

	return useMemo(() => (provided === undefined ? page : provided), [provided, page]);
}

/** What a host reads off the renderer in force. */
export interface GlRenderer {
	/** Whether the GPU path draws at all. False sends each geom to its SVG treatment. */
	readonly available: boolean;
	/** Puts a frame up on the next animation frame. Draws nothing under `driven`. */
	schedule(): void;
	/** Draws a frame now. Under `driven`, the only thing that puts one up. */
	drawNow(): void;
	/** The frame budget's readings, or null where the renderer holds none. */
	stats(): FrameStats | null;
}

/** The renderer in force as a host reads it, or null while there is none. */
export const useGlRenderer: () => GlRenderer | null = useSharedRenderer;
