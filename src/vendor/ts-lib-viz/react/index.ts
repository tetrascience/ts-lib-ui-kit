/**
 * The `/react` surface: `Viz`, the GPU provider, the export path and the theme hooks.
 *
 * `Viz` draws a chart from its spec. The frame, the geoms and the legends it draws through stay
 * inside the package, and the arithmetic behind them is in `/core`.
 */

export {Viz, type VizProps} from "./Viz.js";
export {exportPng, exportSvg, type PngOptions, type SvgOptions} from "./export.js";
export {resolveTheme, useVizTheme, watchTheme} from "./theme.js";
export type {ToolbarItem, ToolbarOptions, ToolbarView} from "./Toolbar.js";
export {
	hostFor,
	refreshGlSurface,
	releaseGlSurface,
	useGlRenderer,
	VizGlProvider,
	type FrameStats,
	type GlRenderer,
	type Host,
	type Rect,
	type Times,
	type VizGlProviderProps,
} from "./gl/index.js";
