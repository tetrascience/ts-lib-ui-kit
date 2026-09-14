/**
 * CI gate for SW-2596: no stylesheet the kit ships may make document-level
 * claims.
 *
 * A rule "leaks" when it can match host markup the kit was never asked to
 * style. For the global entries (`index.css`, `index.tailwind.css`) that is
 * any rule outside a cascade layer — an unlayered `:root { --border: … }` or
 * `.divider { width: 2px }` beats the host's own CSS whenever the kit's
 * `<style>` lands later, which is exactly how one platform app restyled every
 * other TDP page (PUI-5962). For the scoped entry (`index.scoped.css`) the
 * bar is higher: rules in the layers the kit authors (`ts-ui-kit`, `base`)
 * must also carry `[data-ts-ui-root]` in every selector.
 *
 * Run after `yarn build`: `yarn tsx scripts/build/audit-css-leaks.ts`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postcss, { type ChildNode, type Container } from "postcss";

import { SCOPED_LAYERS, SCOPE_SELECTOR, UNSCOPABLE_AT_RULES } from "./scope-kit-css";

export type AuditMode = "global" | "scoped";

export interface Leak {
  /** The offending selector, verbatim. */
  selector: string;
  /** `null` for an unlayered rule, else the enclosing layer's name. */
  layer: string | null;
}

/**
 * Collects every selector that could match outside the kit's own subtree.
 *
 * - `global`: any rule outside a `@layer` whose selector lacks the scope marker.
 * - `scoped`: the above, plus rules inside the kit-authored layers.
 *
 * `@keyframes` / `@font-face` / `@property` contents are skipped — keyframe
 * steps parse as rules but are not selector-matched.
 */
export function collectLeaks(css: string, mode: AuditMode): Leak[] {
  const leaks: Leak[] = [];

  const mustBeScoped = (layer: string | null): boolean =>
    layer === null || (mode === "scoped" && SCOPED_LAYERS.has(layer));

  const visit = (container: Container<ChildNode>, layer: string | null): void => {
    container.each((node) => {
      if (node.type === "rule") {
        if (!mustBeScoped(layer)) return;
        for (const selector of node.selectors) {
          if (!selector.includes(SCOPE_SELECTOR)) leaks.push({ selector, layer });
        }
        return;
      }
      if (node.type !== "atrule" || !node.nodes) return;

      const name = node.name.toLowerCase();
      if (UNSCOPABLE_AT_RULES.has(name)) return;
      visit(node, name === "layer" ? node.params.trim() : layer);
    });
  };

  visit(postcss.parse(css), null);
  return leaks;
}

/** The stylesheets the package publishes, and the bar each is held to. */
export const AUDITED_STYLESHEETS: ReadonlyArray<{ file: string; mode: AuditMode }> = [
  { file: "index.css", mode: "global" },
  { file: "index.tailwind.css", mode: "global" },
  { file: "index.scoped.css", mode: "scoped" },
];

export function auditDist(distDir: string): Array<{ file: string; mode: AuditMode; leaks: Leak[] }> {
  return AUDITED_STYLESHEETS.map(({ file, mode }) => {
    const css = fs.readFileSync(path.join(distDir, file), "utf8");
    return { file, mode, leaks: collectLeaks(css, mode) };
  });
}

// CLI: `yarn tsx scripts/build/audit-css-leaks.ts [distDir]`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distDir = path.resolve(process.argv[2] ?? "dist");
  const results = auditDist(distDir);
  let failed = false;
  for (const { file, mode, leaks } of results) {
    if (leaks.length === 0) {
      console.log(`✓ ${file} (${mode}): no document-level rules`);
      continue;
    }
    failed = true;
    console.log(`✗ ${file} (${mode}): ${leaks.length} selector(s) can match outside the kit's subtree:`);
    for (const { selector, layer } of leaks) {
      const where = layer === null ? "unlayered" : `@layer ${layer}`;
      console.log(`    ${where}  ${selector}`);
    }
  }
  if (failed) {
    console.log(
      "\nKit-authored CSS must live in `@layer ts-ui-kit` (tokens, component .scss) — see AGENTS.md › CSS. " +
        "Utilities go through `@utility`; never emit an unlayered rule.",
    );
    process.exitCode = 1;
  }
}
