/**
 * Lazy Plotly loader (SW-2007).
 *
 * The kit ships preserved ES modules with all dependencies externalized, so a
 * static `import Plotly from "plotly.js-dist"` in any chart lands the full
 * ~4.7 MB Plotly dist in the consumer's main chunk — before any chart renders.
 * Loading it through this module's dynamic `import()` instead lets consumer
 * bundlers split Plotly into its own chunk, fetched only when a chart mounts.
 *
 * Chart components must call `loadPlotly()` before drawing. Code that only
 * runs after a plot exists (hover handlers, resize relayouts, unmount purges)
 * can use the synchronous `getLoadedPlotly()`.
 */

type PlotlyModule = typeof import("plotly.js-dist");

let loadedPlotly: PlotlyModule | null = null;
let plotlyPromise: Promise<PlotlyModule> | null = null;

/** Import Plotly on first use; subsequent calls reuse the same promise. */
export function loadPlotly(): Promise<PlotlyModule> {
  plotlyPromise ??= import("plotly.js-dist").then((mod) => {
    // plotly.js-dist is CJS; depending on the consumer's bundler interop the
    // API surface is either the namespace itself or its `default` export.
    const withDefault = mod as PlotlyModule & { default?: PlotlyModule };
    loadedPlotly = withDefault.default ?? withDefault;
    return loadedPlotly;
  });
  return plotlyPromise;
}

/**
 * Synchronous access to the loaded Plotly module. Only valid after
 * `loadPlotly()` has resolved — i.e. in code paths that can only run once a
 * plot has been drawn (event handlers, cleanups, resize effects).
 */
export function getLoadedPlotly(): PlotlyModule {
  if (!loadedPlotly) {
    throw new Error(
      "Plotly accessed before loadPlotly() resolved. Call loadPlotly() and draw the plot first.",
    );
  }
  return loadedPlotly;
}

export type { PlotlyModule };
