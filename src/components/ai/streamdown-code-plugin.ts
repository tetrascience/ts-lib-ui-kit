/**
 * Slim replacement for `@streamdown/code` (SW-2007).
 *
 * The upstream plugin statically imports the full "shiki" bundle (~200
 * grammars), landing a second full Shiki copy in every consumer build. This
 * plugin implements the same streamdown `CodeHighlighterPlugin` contract on
 * top of the shared slim highlighter in `@/lib/shiki`, so only the explicit
 * language set is bundled and every grammar arrives as a lazy chunk.
 */

import type { BundledLanguage } from "shiki";
import type { CodeHighlighterPlugin } from "streamdown";

import {
  getCodeBlockHighlighter,
  getSupportedCodeBlockLanguages,
  resolveCodeBlockLanguage,
} from "@/lib/shiki";

type HighlightCallback = NonNullable<Parameters<CodeHighlighterPlugin["highlight"]>[1]>;
type HighlightResult = Parameters<HighlightCallback>[0];

const THEMES: ReturnType<CodeHighlighterPlugin["getThemes"]> = [
  "github-light",
  "github-dark",
];

// Highlighted-token cache + pending-callback registry, mirroring the
// upstream plugin's sync-return/async-callback protocol: return cached
// tokens synchronously, otherwise kick off highlighting and notify via the
// callback when tokens are ready.
const resultsCache = new Map<string, HighlightResult>();
const subscribers = new Map<string, Set<HighlightCallback>>();

const KEY_SLICE_LENGTH = 100;

const cacheKey = (code: string, lang: string): string => {
  const head = code.slice(0, KEY_SLICE_LENGTH);
  const tail = code.length > KEY_SLICE_LENGTH ? code.slice(-KEY_SLICE_LENGTH) : "";
  return `${lang}:${code.length}:${head}:${tail}`;
};

export const streamdownCodePlugin: CodeHighlighterPlugin = {
  name: "shiki",
  type: "code-highlighter",
  getSupportedLanguages: () => getSupportedCodeBlockLanguages() as BundledLanguage[],
  getThemes: () => THEMES,
  supportsLanguage: (language) => resolveCodeBlockLanguage(language) !== null,
  highlight({ code, language }, callback) {
    // Unsupported languages resolve to plaintext inside the shared
    // highlighter, so streaming still renders the raw code.
    const lang = resolveCodeBlockLanguage(language) ?? "text";
    const key = cacheKey(code, lang);

    const cached = resultsCache.get(key);
    if (cached) {
      return cached;
    }

    if (callback) {
      let pending = subscribers.get(key);
      if (!pending) {
        pending = new Set();
        subscribers.set(key, pending);
      }
      pending.add(callback);
    }

    getCodeBlockHighlighter(lang)
      .then(({ highlighter, lang: resolvedLang }) => {
        const result = highlighter.codeToTokens(code, {
          lang: resolvedLang,
          themes: { dark: THEMES[1], light: THEMES[0] },
        });
        resultsCache.set(key, result);
        const pending = subscribers.get(key);
        if (pending) {
          for (const notify of pending) {
            notify(result);
          }
          subscribers.delete(key);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to highlight code:", error);
        subscribers.delete(key);
      });

    return null;
  },
};
