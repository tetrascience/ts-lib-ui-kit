/**
 * Full streamdown plugin set for `MessageResponse` / `Reasoning` markdown.
 *
 * This module is only ever reached through `useStreamdownPlugins`'s dynamic
 * import (SW-2007): mermaid, KaTeX, and the shiki grammars behind these
 * plugins land in a lazy chunk instead of the consumer's main bundle. Do not
 * import it statically from component code.
 */
import { cjk } from "@streamdown/cjk";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

import { streamdownCodePlugin } from "./streamdown-code-plugin";

import type { PluginConfig } from "streamdown";

export const streamdownPlugins: PluginConfig = {
  cjk,
  code: streamdownCodePlugin,
  math,
  mermaid,
};
