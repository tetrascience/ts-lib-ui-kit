import { useEffect, useState } from "react";

import type { PluginConfig } from "streamdown";

// Module-level cache so the lazy chunk is fetched once and later mounts get
// the plugins synchronously on first render (no highlight flash).
let cachedPlugins: PluginConfig | null = null;
let pluginsPromise: Promise<PluginConfig> | null = null;

function loadStreamdownPlugins(): Promise<PluginConfig> {
  pluginsPromise ??= import("./streamdown-plugins")
    .then((mod) => {
      cachedPlugins = mod.streamdownPlugins;
      return cachedPlugins;
    })
    .catch((error) => {
      pluginsPromise = null;
      cachedPlugins = null;
      throw error;
    });
  return pluginsPromise;
}

/**
 * Lazily loads the streamdown plugin set (SW-2007). Markdown renders
 * immediately without plugins; code highlighting, math, and mermaid upgrade
 * in place once the lazy chunk arrives, keeping shiki/KaTeX/mermaid out of
 * the consumer's main bundle.
 */
export function useStreamdownPlugins(): PluginConfig | undefined {
  const [plugins, setPlugins] = useState<PluginConfig | undefined>(
    cachedPlugins ?? undefined,
  );

  useEffect(() => {
    if (plugins) return;
    let cancelled = false;
    void loadStreamdownPlugins().then((loaded) => {
      if (!cancelled) setPlugins(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [plugins]);

  return plugins;
}
