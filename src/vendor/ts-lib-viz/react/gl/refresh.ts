import {useEffect} from "react";

import type {SharedRenderer} from "./renderer.js";

/**
 * Asks for a frame when the page or a scroll container around the chart moves.
 *
 * A nested container's scroll reaches the window in the capture phase alone.
 */
export function useGlRefresh(renderer: SharedRenderer | null): void {
	useEffect(() => {
		if (!renderer) return;
		const refresh = () => renderer.schedule();
		window.addEventListener("scroll", refresh, {passive: true, capture: true});
		window.addEventListener("resize", refresh);
		return () => {
			window.removeEventListener("scroll", refresh, {capture: true});
			window.removeEventListener("resize", refresh);
		};
	}, [renderer]);
}
