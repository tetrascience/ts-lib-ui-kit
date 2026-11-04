/**
 * The GPU tier as a host reaches it: the provider, the canvas it draws into, and the frame budget.
 *
 * One shared context, a layer per chart, picking off the same geometry. The regime is 15k geoms
 * upward. Below it the SVG geoms are the cheaper answer and the switch reads a count.
 */

export {useGlRenderer, VizGlProvider, type GlRenderer, type VizGlProviderProps} from "./context.js";
export {hostFor, refreshGlSurface, releaseGlSurface} from "./surface.js";
export type {FrameStats, Host, Times} from "./renderer.js";
export type {Rect} from "./encode.js";
