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
 * directly instead, the same way `scripts/mcp/build-metadata.ts` already
 * uses ts-morph to read authored metadata out of story sources rather than
 * hand-maintaining a parallel catalog. AST parsing (vs. a regex over the
 * source text) means every `export ... from "@/..."` form — `export *`,
 * `export * as Ns`, `export { a, b }`, `export type { A }` — is handled
 * uniformly with no special-casing, and comments/commented-out lines are
 * never mistaken for real exports since the parser never sees them as
 * statements in the first place.
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

import { Project } from "ts-morph";

const SRC_DIR = path.resolve(__dirname, "../../src");
const INDEX_TS = path.join(SRC_DIR, "index.ts");

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
 * `utils/colors` → { category: "utils", name: "colors" }. Throws on a
 * single-segment export (e.g. `@/hooks`, with no further path segment) —
 * silently producing an entry key like `"hooks/"` would be a nonsense
 * output path rather than a clean failure.
 */
function categorize(relativePath: string): { category: string; name: string } {
  const segments = relativePath.split("/");
  const [category, name] =
    segments[0] === "components"
      ? [segments[1], segments.slice(2).join("/")]
      : [segments[0], segments.slice(1).join("/")];

  if (!category || !name) {
    throw new Error(
      `[component-entries] "@/${relativePath}" has no category/name segment to derive an entry ` +
        `key from (got category="${category}", name="${name}"). Single-segment exports from ` +
        "src/index.ts aren't supported by this generator.",
    );
  }
  return { category, name };
}

/**
 * One Vite lib entry per public export of `src/index.ts`, keyed
 * `<category>/<name>` (e.g. `"ui/button"`, `"composed/StatCard"`,
 * `"utils/colors"`), plus every key in `reservedKeys` (typically the
 * hand-written entries in vite.config.ts: `index`, `server`,
 * `providers/*`, `jest-setup`). Throws if a generated key collides with a
 * reserved key or with another generated key — Rollup can only
 * canonicalize one module's output to a given entry-key path, so a
 * collision would silently drop one entry from the build (a reserved-key
 * collision is worse: the hand-written entry disappears with no error).
 */
export function getComponentEntries(
  reservedKeys: ReadonlySet<string> = new Set(),
): Record<string, string> {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(INDEX_TS);

  const entries: Record<string, string> = {};
  const seenSourceFiles = new Map<string, string>();

  for (const exportDecl of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = exportDecl.getModuleSpecifierValue();
    if (!moduleSpecifier?.startsWith("@/")) continue;

    const relativePath = moduleSpecifier.slice("@/".length);
    const sourceFilePath = resolveSourceFile(relativePath);
    const { category, name } = categorize(relativePath);
    const entryKey = `${category}/${name}`;

    if (reservedKeys.has(entryKey)) {
      throw new Error(
        `[component-entries] entry key "${entryKey}" (from "@/${relativePath}") collides with a ` +
          "hand-written vite.config.ts entry. Rename the source path so its basename differs.",
      );
    }
    const existing = seenSourceFiles.get(entryKey);
    if (existing && existing !== sourceFilePath) {
      throw new Error(
        `[component-entries] entry key "${entryKey}" collides: ${existing} vs ${sourceFilePath}. ` +
          "Rename one of the source paths so their basenames differ across categories.",
      );
    }
    seenSourceFiles.set(entryKey, sourceFilePath);
    entries[entryKey] = sourceFilePath;
  }

  return entries;
}
