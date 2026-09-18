/**
 * Full streamdown plugin set for `MessageResponse` / `Reasoning` markdown.
 *
 * This module is only ever reached through `useStreamdownPlugins`'s dynamic
 * import (SW-2007): mermaid, KaTeX, and the shiki grammars behind these
 * plugins land in a lazy chunk instead of the consumer's main bundle. Do not
 * import it statically from component code.
 *
 * `@streamdown/math` and `@streamdown/mermaid` are *optional* peer
 * dependencies, so they are resolved with `import()` rather than a static
 * import. A static import forces every consumer that bundles the root barrel
 * to install both — Rollup has to link the named export at build time, and
 * when the package is absent the specifier resolves to an empty
 * `__vite-optional-peer-dep:` stub and the build aborts (#190). Loading them
 * dynamically lets a consumer that omits them degrade at runtime instead:
 * markdown still renders, just without math or mermaid.
 */
import { cjk } from "@streamdown/cjk";

import { streamdownCodePlugin } from "./streamdown-code-plugin";

import type { PluginConfig } from "streamdown";

/**
 * Resolve one optional peer's plugin export, or `undefined` when the package
 * is not installed. Mirrors how `plotly.js-dist`, `@rdkit/rdkit` and the
 * provider SDKs are loaded elsewhere in the kit.
 */
async function optionalPlugin<T>(load: () => Promise<T>): Promise<T | undefined> {
  try {
    return await load();
  } catch {
    return undefined;
  }
}

/**
 * Build the plugin set, including only the optional plugins that are actually
 * installed. Callers reach this through `useStreamdownPlugins`.
 */
export async function getStreamdownPlugins(): Promise<PluginConfig> {
  const [math, mermaid] = await Promise.all([
    optionalPlugin(async () => (await import("@streamdown/math")).math),
    optionalPlugin(async () => (await import("@streamdown/mermaid")).mermaid),
  ]);

  return {
    cjk,
    code: streamdownCodePlugin,
    ...(math ? { math } : {}),
    ...(mermaid ? { mermaid } : {}),
  };
}
