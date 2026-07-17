/**
 * Shared slim Shiki setup (SW-2007).
 *
 * Importing `createHighlighter` from "shiki" pulls the full bundle — ~200
 * grammars, each its own module — which balloons consumer builds (~9k
 * modules) and can OOM Vite's default heap. This module uses `shiki/core`
 * with an explicit language set instead: the engine, themes, and grammars
 * all arrive through dynamic imports, so they land in lazy chunks and only
 * the languages listed here are ever pulled into a build.
 *
 * Consumers can extend the set at runtime with `registerCodeBlockLanguage`.
 */
import type { HighlighterCore, LanguageRegistration } from "shiki/core";

type LanguageLoader = () => Promise<{ default: LanguageRegistration[] }>;

// Default grammars, chosen for scientific data-app content. Keys are the
// canonical ids requested via `lang`; aliases map onto them below.
const languageLoaders = new Map<string, LanguageLoader>([
  ["bash", () => import("@shikijs/langs/bash")],
  ["javascript", () => import("@shikijs/langs/javascript")],
  ["json", () => import("@shikijs/langs/json")],
  ["markdown", () => import("@shikijs/langs/markdown")],
  ["python", () => import("@shikijs/langs/python")],
  ["sql", () => import("@shikijs/langs/sql")],
  ["tsx", () => import("@shikijs/langs/tsx")],
  ["typescript", () => import("@shikijs/langs/typescript")],
  ["yaml", () => import("@shikijs/langs/yaml")],
]);

const languageAliases = new Map<string, string>([
  ["sh", "bash"],
  ["shell", "bash"],
  ["shellscript", "bash"],
  ["zsh", "bash"],
  ["js", "javascript"],
  ["jsx", "tsx"],
  ["md", "markdown"],
  ["py", "python"],
  ["ts", "typescript"],
  ["yml", "yaml"],
]);

/**
 * Resolve a requested language to a registered canonical id, or null when
 * the language isn't in the set (callers fall back to plaintext).
 */
export function resolveCodeBlockLanguage(language: string): string | null {
  const normalized = language.trim().toLowerCase();
  const canonical = languageAliases.get(normalized) ?? normalized;
  return languageLoaders.has(canonical) ? canonical : null;
}

/** Canonical ids of every language the slim highlighter can load. */
export function getSupportedCodeBlockLanguages(): string[] {
  return [...languageLoaders.keys()];
}

/**
 * Register an additional grammar for `CodeBlock`/`MessageResponse` code
 * highlighting, e.g.:
 *
 * ```ts
 * registerCodeBlockLanguage("rust", () => import("@shikijs/langs/rust"), ["rs"]);
 * ```
 *
 * The loader stays a dynamic import, so added grammars are also code-split.
 */
export function registerCodeBlockLanguage(
  language: string,
  loader: LanguageLoader,
  aliases: string[] = [],
): void {
  languageLoaders.set(language, loader);
  for (const alias of aliases) {
    languageAliases.set(alias, language);
  }
}

// One shared highlighter core; grammars are loaded into it on demand.
let corePromise: Promise<HighlighterCore> | null = null;
const loadedLanguages = new Map<string, Promise<void>>();

function getHighlighterCore(): Promise<HighlighterCore> {
  corePromise ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
    import("@shikijs/themes/github-light"),
    import("@shikijs/themes/github-dark"),
  ]).then(([core, engine, githubLight, githubDark]) =>
    core.createHighlighterCore({
      // The JS regex engine avoids shipping the oniguruma WASM asset;
      // `forgiving` skips the few grammar rules it can't translate.
      engine: engine.createJavaScriptRegexEngine({ forgiving: true }),
      langs: [],
      themes: [githubLight.default, githubDark.default],
    }),
  );
  return corePromise;
}

/**
 * Get the shared highlighter with the requested language loaded. `lang` is
 * the id to pass to `codeToTokens` — the canonical id when supported,
 * otherwise "text" (plaintext needs no grammar).
 */
export async function getCodeBlockHighlighter(
  language: string,
): Promise<{ highlighter: HighlighterCore; lang: string }> {
  const canonical = resolveCodeBlockLanguage(language);
  const highlighter = await getHighlighterCore();
  if (canonical) {
    let pending = loadedLanguages.get(canonical);
    if (!pending) {
      const loader = languageLoaders.get(canonical);
      pending = loader
        ? loader().then((grammar) => highlighter.loadLanguage(...grammar.default))
        : Promise.resolve();
      loadedLanguages.set(canonical, pending);
    }
    await pending;
  }
  return { highlighter, lang: canonical ?? "text" };
}
