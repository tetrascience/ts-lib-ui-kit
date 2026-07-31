/**
 * Derives one Vite lib-mode entry per public export from `src/index.ts` —
 * the single source of truth for the package's public API. Every export
 * gains its own subpath (`@tetrascience-npm/tetrascience-react-ui/ui/button`,
 * `.../composed/StatCard`, …) so a consumer's bundler — and critically,
 * Jest's CJS `require()`, which has no tree-shaking — only evaluates the
 * one module it imports instead of the full ~155-module barrel.
 *
 * A hand-maintained manifest (component name → path) would just be a second
 * source of truth that drifts from `index.ts`; this parses that file
 * directly instead, the same way it's already the source `sync-storybook-*`
 * scripts read from for other generated artifacts.
 *
 * Declaring a file as an explicit `build.lib.entry` (rather than leaving it
 * reachable only transitively through the `index` barrel) changes what
 * Rollup names its output chunk: with `preserveModules` on, the module's
 * `.js`/`.cjs` canonicalizes to the entry's key path (e.g. `dist/ui/button.js`)
 * instead of the barrel's source-relative path (`dist/components/ui/button.js`)
 * — verified against the pre-existing `providers/*` entries, no duplicate
 * file is produced.
 *
 * Type declarations are a separate story: `vite-plugin-dts`'s `rollupTypes`
 * is off in this build (see the comment on the `dts()` plugin call in
 * vite.config.ts for why — in short, it corrupts every entry but one once
 * there are this many). With it off, every source file gets its own
 * self-contained `.d.ts` mirroring its `src/`-relative path regardless of
 * entry declarations — so package.json's exports map "types" conditions
 * point at `dist/components/<category>/<Name>[/index].d.ts`, not at the
 * entry-key path used for "import"/"require". Two categories mix file
 * shapes (a single-file `Name.tsx` vs. a `Name/index.ts` directory
 * barrel) — `ui/data-table` and `composed/tdp-link` + `composed/tdp-url`
 * are the current exceptions and need literal (non-wildcard) exports map
 * entries; adding a differently-shaped component to either category needs
 * the same treatment, or its subpath's types will 404 at the wildcard
 * pattern.
 */
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(__dirname, "../../src");
const INDEX_TS = path.join(SRC_DIR, "index.ts");

// Matches `export * from "@/a/b";` and `export { x, y } from "@/a/b";` (including multiline).
const EXPORT_FROM_RE = /export\s+(?:\*|\{[\s\S]*?\})\s+from\s+"@\/([^"]+)"\s*;?/g;

const CANDIDATE_SUFFIXES = [".tsx", ".ts", "/index.ts", "/index.tsx"];

function resolveSourceFile(relativePath: string): string {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = path.join(SRC_DIR, `${relativePath}${suffix}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `[component-entries] could not resolve "@/${relativePath}" from src/index.ts to a source file`,
  );
}

/**
 * `components/ui/button` → { category: "ui", name: "button" };
 * `utils/colors` → { category: "utils", name: "colors" }.
 */
function categorize(relativePath: string): { category: string; name: string } {
  const segments = relativePath.split("/");
  if (segments[0] === "components") {
    return { category: segments[1], name: segments.slice(2).join("/") };
  }
  return { category: segments[0], name: segments.slice(1).join("/") };
}

/**
 * One Vite lib entry per public export of `src/index.ts`, keyed
 * `<category>/<name>` (e.g. `"ui/button"`, `"composed/StatCard"`,
 * `"utils/colors"`). Throws if two distinct source files would collide on
 * the same entry key — Rollup can only canonicalize one module's output to
 * a given entry-key path, so a same-name collision across categories would
 * silently drop one of the two from the build.
 */
export function getComponentEntries(): Record<string, string> {
  const indexSource = fs.readFileSync(INDEX_TS, "utf8");
  const entries: Record<string, string> = {};
  const seenSourceFiles = new Map<string, string>();

  for (const match of indexSource.matchAll(EXPORT_FROM_RE)) {
    const relativePath = match[1];
    const sourceFile = resolveSourceFile(relativePath);
    const { category, name } = categorize(relativePath);
    const entryKey = `${category}/${name}`;

    const existing = seenSourceFiles.get(entryKey);
    if (existing && existing !== sourceFile) {
      throw new Error(
        `[component-entries] entry key "${entryKey}" collides: ${existing} vs ${sourceFile}. ` +
          "Rename one of the source paths so their basenames differ across categories.",
      );
    }
    seenSourceFiles.set(entryKey, sourceFile);
    entries[entryKey] = sourceFile;
  }

  return entries;
}
