import type { RDKitModule } from "@rdkit/rdkit"

/**
 * Loader for the RDKit.js WebAssembly module.
 *
 * RDKit ships a ~6.6 MB `.wasm` blob, so it must never be part of the main
 * bundle. Instead we load it lazily, once per page, the first time a molecule
 * actually needs rendering. By default the loader script and WASM are pulled
 * from a public CDN, so consumers of the kit do not need to install
 * `@rdkit/rdkit` or serve any static assets. Consumers who cannot reach a CDN
 * (air-gapped, strict CSP) can point the loader at self-hosted copies via
 * {@link configureRDKit}, or hand it a pre-initialised module.
 *
 * @see https://www.rdkitjs.com
 */

/** RDKit npm version the CDN URLs are pinned to. */
export const RDKIT_VERSION = "2025.3.4-1.0.0"

/** Options controlling how the RDKit module is located and loaded. */
export interface RDKitLoaderConfig {
  /**
   * URL of the `RDKit_minimal.js` loader script. When omitted, a pinned
   * jsDelivr URL for {@link RDKIT_VERSION} is used.
   */
  scriptSrc?: string
  /**
   * URL of the `RDKit_minimal.wasm` binary. When omitted, a pinned jsDelivr
   * URL for {@link RDKIT_VERSION} is used. Passed to RDKit as `locateFile`.
   */
  wasmSrc?: string
  /**
   * A module already initialised by the consumer (e.g. self-hosted, or shared
   * with other parts of the app). When provided, no network request is made.
   */
  instance?: RDKitModule
}

const CDN_BASE = `https://cdn.jsdelivr.net/npm/@rdkit/rdkit@${RDKIT_VERSION}/dist`

const defaultConfig: Required<Omit<RDKitLoaderConfig, "instance">> & {
  instance?: RDKitModule
} = {
  scriptSrc: `${CDN_BASE}/RDKit_minimal.js`,
  wasmSrc: `${CDN_BASE}/RDKit_minimal.wasm`,
  instance: undefined,
}

/**
 * Set process-wide defaults for how RDKit is loaded. Call once, before the
 * first molecule renders — typically at app startup. Later calls are ignored
 * once loading has begun.
 *
 * @example
 * ```ts
 * // Serve the assets yourself instead of hitting the CDN.
 * configureRDKit({
 *   scriptSrc: "/assets/RDKit_minimal.js",
 *   wasmSrc: "/assets/RDKit_minimal.wasm",
 * })
 * ```
 */
export function configureRDKit(config: RDKitLoaderConfig): void {
  if (loadPromise) return
  Object.assign(defaultConfig, config)
}

let loadPromise: Promise<RDKitModule> | null = null

// `window.initRDKitModule` is declared globally by the `@rdkit/rdkit` types.

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-rdkit-loader]`,
    )
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve()
        return
      }
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load the RDKit loader script")),
      )
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.dataset.rdkitLoader = "true"
    script.addEventListener("load", () => {
      script.dataset.loaded = "true"
      resolve()
    })
    script.addEventListener("error", () =>
      reject(new Error(`Failed to load the RDKit loader script from ${src}`)),
    )
    document.head.append(script)
  })
}

/**
 * Load and initialise the RDKit module, memoised so the WASM is fetched and
 * compiled only once per page. Safe to call from many components concurrently;
 * they all await the same promise.
 *
 * @throws if run outside a browser, or if the script/WASM cannot be loaded.
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

    if (!window.initRDKitModule) {
      await injectScript(defaultConfig.scriptSrc)
    }
    if (!window.initRDKitModule) {
      throw new Error("RDKit loader script did not define initRDKitModule")
    }

    // RDKit is an Emscripten module: its C++ stdout/stderr (including the noisy
    // "SMILES Parse Error" it emits for invalid input we handle gracefully)
    // flow through `print`/`printErr`, which default to console.log/error.
    // Route them to console.debug so a bad SMILES never spams the host app's
    // console — invalid input is surfaced through the renderer's fallback UI.
    const initOptions = {
      locateFile: () => defaultConfig.wasmSrc,
      print: (msg: string) => console.debug("[RDKit]", msg),
      printErr: (msg: string) => console.debug("[RDKit]", msg),
    }
    return await window.initRDKitModule(
      initOptions as Parameters<typeof window.initRDKitModule>[0],
    )
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
