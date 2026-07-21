import type { RDKitModule } from "@rdkit/rdkit"

/**
 * Loader for the RDKit.js WebAssembly module.
 *
 * RDKit ships a ~6.6 MB `.wasm` blob, so it must never be part of the main
 * bundle. It is loaded lazily, once per page, the first time a molecule
 * actually needs rendering.
 *
 * **Air-gapped by default, no CDN.** The loader dynamically imports the
 * `@rdkit/rdkit` package the consumer has installed — nothing is fetched from a
 * public CDN. Molecule rendering is opt-in: `@rdkit/rdkit` is an optional
 * peer dependency, so a consumer that never renders a structure needn't install
 * it, and one that does simply adds it to their own dependencies.
 *
 * **Bundled apps should set `wasmSrc`.** Without it, RDKit resolves
 * `RDKit_minimal.wasm` relative to the glue script, which a bundler (Vite,
 * webpack, …) usually does not emit next to the output — so the fetch 404s at
 * runtime and the first molecule silently fails to load. Copy the WASM into a
 * served path (or resolve it via your bundler, e.g. Vite's `?url`) and pass it
 * to {@link configureRDKit} once at startup. Alternatively hand the loader a
 * module you initialised yourself (`instance`).
 *
 * @see https://www.rdkitjs.com
 */

/** The `initRDKitModule` factory exported by `@rdkit/rdkit`. */
type RDKitFactory = (options?: {
  locateFile?: () => string
  print?: (msg: string) => void
  printErr?: (msg: string) => void
}) => Promise<RDKitModule>

/** Options controlling how the RDKit module is located and loaded. */
export interface RDKitLoaderConfig {
  /**
   * URL of the `RDKit_minimal.wasm` binary, passed to RDKit as `locateFile`.
   * Set this when your bundler doesn't serve the WASM next to the glue script
   * (e.g. copy it into your app's public dir and point here). When omitted,
   * RDKit's own default resolution is used.
   */
  wasmSrc?: string
  /**
   * A module already initialised by the consumer (e.g. shared with other parts
   * of the app). When provided, no import or network work is done.
   */
  instance?: RDKitModule
  /**
   * Override how the `initRDKitModule` factory is obtained. Defaults to
   * `import("@rdkit/rdkit")`. Provide this only for unusual setups (custom
   * bundler resolution, a vendored copy, etc.).
   */
  importFactory?: () => Promise<RDKitFactory>
}

const defaultConfig: RDKitLoaderConfig = {}

/**
 * Set process-wide defaults for how RDKit is loaded. Call once, before the
 * first molecule renders — typically at app startup. Later calls are ignored
 * once loading has begun.
 *
 * Bundled apps should set `wasmSrc` — see the module doc above for why.
 *
 * @example
 * ```ts
 * // Serve the WASM yourself (e.g. copied into /public) — no CDN, air-gapped.
 * configureRDKit({ wasmSrc: "/assets/RDKit_minimal.wasm" })
 * // …or resolve it from the installed package via your bundler (Vite):
 * import wasmSrc from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url"
 * configureRDKit({ wasmSrc })
 * ```
 */
export function configureRDKit(config: RDKitLoaderConfig): void {
  if (loadPromise) return
  Object.assign(defaultConfig, config)
}

let loadPromise: Promise<RDKitModule> | null = null

/** Dynamically import the installed `@rdkit/rdkit` and return its factory. */
async function importRDKitFactory(): Promise<RDKitFactory> {
  const mod = (await import("@rdkit/rdkit")) as unknown as {
    default?: RDKitFactory
  } & RDKitFactory
  // The package exports the factory as both `module.exports` and `.default`.
  return mod.default ?? (mod as RDKitFactory)
}

/**
 * Load and initialise the RDKit module, memoised so the WASM is fetched and
 * compiled only once per page. Safe to call from many components concurrently;
 * they all await the same promise.
 *
 * @throws if run outside a browser, if `@rdkit/rdkit` isn't installed, or if
 * the WASM cannot be loaded.
 */
export function loadRDKit(): Promise<RDKitModule> {
  if (defaultConfig.instance) {
    return Promise.resolve(defaultConfig.instance)
  }
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("RDKit can only be loaded in a browser environment")
    }

    let initRDKitModule: RDKitFactory
    try {
      initRDKitModule = await (defaultConfig.importFactory ?? importRDKitFactory)()
    } catch (cause) {
      const detail = cause instanceof Error ? ` (${cause.message})` : ""
      throw new Error(
        `Failed to load @rdkit/rdkit${detail}. Install it as a dependency to ` +
          "render molecule structures: `yarn add @rdkit/rdkit`.",
      )
    }

    // RDKit is an Emscripten module: its C++ stdout/stderr (including the noisy
    // "SMILES Parse Error" it emits for invalid input we handle gracefully)
    // flow through `print`/`printErr`, which default to console.log/error.
    // Route them to console.debug so a bad SMILES never spams the host app's
    // console — invalid input is surfaced through the renderer's fallback UI.
    return initRDKitModule({
      ...(defaultConfig.wasmSrc
        ? { locateFile: () => defaultConfig.wasmSrc as string }
        : {}),
      print: (msg: string) => console.debug("[RDKit]", msg),
      printErr: (msg: string) => console.debug("[RDKit]", msg),
    })
  })()

  // Let a failed attempt be retried on the next call rather than caching the
  // rejection forever.
  loadPromise.catch(() => {
    loadPromise = null
  })

  return loadPromise
}

/** Drawing options for {@link moleculeToSvg}. */
export interface MoleculeSvgOptions {
  /** Rendered width in pixels. @default 250 */
  width?: number
  /** Rendered height in pixels. @default 200 */
  height?: number
  /** Lighten carbons/bonds so the structure is legible on dark surfaces. */
  dark?: boolean
  /** Optional caption drawn beneath the structure by RDKit. */
  legend?: string
  /**
   * Extra RDKit MolDraw2D options, merged last. See
   * https://www.rdkitjs.com/#drawing-molecules-all-options
   */
  drawOptions?: Record<string, unknown>
}

/**
 * Render a SMILES string to an SVG string using an initialised RDKit module.
 * Returns `null` when the SMILES cannot be parsed. Frees the underlying C++
 * molecule before returning, so callers never need to.
 *
 * Synchronous by design so it can feed render callbacks that must return a
 * string (e.g. the interactive scatter's `tooltip.content`) — load RDKit ahead
 * of time with {@link loadRDKit} or {@link useRDKit}, then call this.
 */
export function moleculeToSvg(
  rdkit: RDKitModule,
  smiles: string,
  options: MoleculeSvgOptions = {},
): string | null {
  const { width = 250, height = 200, dark = false, legend, drawOptions } = options

  const mol = rdkit.get_mol(smiles)
  if (!mol) return null

  try {
    if (!mol.is_valid()) return null

    const details: Record<string, unknown> = {
      width,
      height,
      // Transparent background so the structure sits on the kit's surface
      // tokens in both light and dark mode.
      backgroundColour: [0, 0, 0, 0],
      ...(legend ? { legend } : {}),
      ...(dark ? { atomColourPalette: DARK_ATOM_PALETTE } : {}),
      ...drawOptions,
    }

    // RDKit prefixes an XML prolog (`<?xml …?>`) which is invalid inside inline
    // HTML; strip it so the SVG embeds cleanly whether injected via
    // dangerouslySetInnerHTML or dropped into a chart tooltip string.
    return mol
      .get_svg_with_highlights(JSON.stringify(details))
      .replace(/^\s*<\?xml[^>]*\?>\s*/i, "")
  } finally {
    mol.delete()
  }
}

const RGB_MAX = 255

/** Parse a `#rrggbb` string into RDKit's 0–1 RGB triple. */
function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / RGB_MAX,
    parseInt(hex.slice(3, 5), 16) / RGB_MAX,
    parseInt(hex.slice(5, 7), 16) / RGB_MAX,
  ]
}

/**
 * Atom colours for dark surfaces. RDKit's stock CPK palette (dark blue N, etc.)
 * is too dim on a dark background, so carbons/default are lightened and the
 * common heteroatoms shifted to brighter, higher-contrast hues. Keys are atomic
 * numbers; `-1` is the default for anything unlisted.
 */
const DARK_ATOM_HEX: Record<string, string> = {
  "-1": "#e5e5e5", // default (carbon skeleton)
  "6": "#e5e5e5", // C
  "7": "#75a1ff", // N — soft blue (was hard-to-read dark blue)
  "8": "#ff7575", // O — soft red
  "9": "#8ceb99", // F
  "15": "#ff9e59", // P
  "16": "#f2cc59", // S
  "17": "#8ceb99", // Cl
  "35": "#e69e73", // Br
  "53": "#c499f2", // I
}

const DARK_ATOM_PALETTE = Object.fromEntries(
  Object.entries(DARK_ATOM_HEX).map(([key, hex]) => [key, hexToRgb01(hex)]),
) as Record<string, [number, number, number]>
