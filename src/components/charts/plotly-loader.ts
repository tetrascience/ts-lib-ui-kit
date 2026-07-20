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
 *
 * `plotly.js-dist` is an *optional* peer dependency (SW-2007): consumers that
 * use the kit's charts must add it to their own app; consumers that don't
 * never install its ~4.7 MB. A missing peer surfaces at build time as an
 * unresolved-import error from the consumer's bundler; the runtime guard below
 * covers the rarer case where the import resolves but fails to evaluate.
 */

type PlotlyModule = typeof import("plotly.js-dist");

const MISSING_PLOTLY_MESSAGE =
  "Failed to load 'plotly.js-dist'. It is an optional peer dependency of " +
  "@tetrascience-npm/tetrascience-react-ui required by the chart components — " +
  "install it in your app (e.g. `yarn add plotly.js-dist`).";

let loadedPlotly: PlotlyModule | null = null;
let plotlyPromise: Promise<PlotlyModule> | null = null;

/** Import Plotly on first use; subsequent calls reuse the same promise. */
export function loadPlotly(): Promise<PlotlyModule> {
  plotlyPromise ??= import("plotly.js-dist")
    .then((mod) => {
      // plotly.js-dist is CJS; depending on the consumer's bundler interop the
      // API surface is either the namespace itself or its `default` export.
      const withDefault = mod as PlotlyModule & { default?: PlotlyModule };
      loadedPlotly = withDefault.default ?? withDefault;
      return loadedPlotly;
    })
    .catch((error: unknown) => {
      // Reset so a later mount can retry, and rethrow with install guidance.
      plotlyPromise = null;
      console.error(MISSING_PLOTLY_MESSAGE, error);
      throw new Error(MISSING_PLOTLY_MESSAGE);
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
