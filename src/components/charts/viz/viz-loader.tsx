import { useEffect, useState } from "react";

import type { ComponentType, FC } from "react";

/**
 * Lazy ts-lib-viz loader (SW-2007).
 *
 * `@tetrascience-npm/ts-lib-viz` is an optional peer dependency. Apps that draw the kit's charts
 * install it; apps that do not never pull it, its d3 packages or its MCP dependencies. A static
 * import would put it in every consumer's main chunk, and a named static import from a missing
 * optional peer fails the consumer's build, so every chart reaches it through this module's
 * dynamic `import()`.
 *
 * A chart component is wrapped in `withViz`, which loads the library and draws a sized, empty
 * placeholder until it arrives. Code that only runs under that wrapper (spec builders, `VizChart`)
 * uses the synchronous `plot`, `palettesFor` and `getLoadedViz`.
 *
 * A missing peer does not fail the consumer's build: the dynamic import resolves to an empty stub.
 * `loadViz` checks the shape of what it loaded, so a stub rejects with the install message.
 */

type VizCore = typeof import("@tetrascience-npm/ts-lib-viz/core");
type VizReact = typeof import("@tetrascience-npm/ts-lib-viz/react");

export interface VizModules {
  core: VizCore;
  react: VizReact;
}

const MISSING_VIZ_MESSAGE =
  "Failed to load '@tetrascience-npm/ts-lib-viz'. It is an optional peer dependency of " +
  "@tetrascience-npm/tetrascience-react-ui required by the chart components. " +
  "Install it in your app (e.g. `yarn add @tetrascience-npm/ts-lib-viz`).";

let loadedViz: VizModules | null = null;
let vizPromise: Promise<VizModules> | null = null;

/** Imports ts-lib-viz on first use. Later calls reuse the same promise. */
export function loadViz(): Promise<VizModules> {
  vizPromise ??= Promise.all([
    import("@tetrascience-npm/ts-lib-viz/core"),
    import("@tetrascience-npm/ts-lib-viz/react"),
  ])
    .then(([core, react]) => {
      // A bundler resolves a missing optional peer to an empty module, which must not be cached.
      if (typeof core.plot !== "function" || !react.Viz) throw new Error("ts-lib-viz resolved to an empty module");
      loadedViz = { core, react };
      return loadedViz;
    })
    .catch((error: unknown) => {
      // Reset so a later mount can retry, and rethrow with install guidance.
      vizPromise = null;
      console.error(MISSING_VIZ_MESSAGE, error);
      throw new Error(MISSING_VIZ_MESSAGE);
    });
  return vizPromise;
}

/** The loaded library. Only valid once `loadViz()` has resolved, which `withViz` guarantees. */
export function getLoadedViz(): VizModules {
  if (!loadedViz) {
    throw new Error("ts-lib-viz accessed before loadViz() resolved. Render the chart through withViz().");
  }
  return loadedViz;
}

/** ts-lib-viz's `plot`, for code that runs under `withViz`. */
export const plot: VizCore["plot"] = ((...args: Parameters<VizCore["plot"]>) =>
  getLoadedViz().core.plot(...args)) as VizCore["plot"];

/** ts-lib-viz's `palettesFor`, for code that runs under `withViz`. */
export const palettesFor: VizCore["palettesFor"] = (...args) => getLoadedViz().core.palettesFor(...args);

/** The loaded library, or null while it loads. Starts the load on mount. */
export function useViz(): VizModules | null {
  const [viz, setViz] = useState<VizModules | null>(loadedViz);
  useEffect(() => {
    if (viz) return;
    let current = true;
    loadViz().then(
      (modules) => {
        if (current) setViz(modules);
      },
      // The loader has logged the install message. The chart stays a placeholder.
      () => {},
    );
    return () => {
      current = false;
    };
  }, [viz]);
  return viz;
}

interface Sized {
  width?: unknown;
  height?: unknown;
}

const sizeOf = (value: unknown): number | string => (typeof value === "number" ? value : "100%");

/**
 * The chart, drawn once ts-lib-viz has loaded. Until then it holds the chart's place with an
 * empty box of the same size, so the page does not shift when the chart arrives.
 */
export function withViz<P extends object>(name: string, Chart: ComponentType<P>): FC<P> {
  const Lazy: FC<P> = (props) => {
    const viz = useViz();
    if (viz) return <Chart {...props} />;
    const { width, height } = props as Sized;
    return <div data-ts-chart-loading="" aria-busy="true" style={{ width: sizeOf(width), height: sizeOf(height) }} />;
  };
  Lazy.displayName = name;
  return Lazy;
}
