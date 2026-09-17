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
 * Layering alone is not enough, though. A layered `.divider { width: 2px }`
 * still collapses a host's `<div class="divider">` whenever the host has no
 * competing declaration — the cascade never runs, the kit's value simply
 * applies. So every selector inside `ts-ui-kit` must also be *anchored* to
 * something the kit owns: a `[data-slot=…]` / `[data-ts-…]` attribute, a
 * `ts-`-prefixed class, one of the registered component class prefixes, or
 * the token hooks `:root` / `:host` / `.dark`.
 *
 * Run after `yarn build`: `yarn tsx scripts/build/audit-css-leaks.ts`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postcss, { type ChildNode, type Container } from "postcss";

import { KIT_LAYER, SCOPED_LAYERS, SCOPE_SELECTOR, UNSCOPABLE_AT_RULES } from "./scope-kit-css";

export type AuditMode = "global" | "scoped";

export type LeakKind =
  /** The rule can match host markup: unlayered, or (scoped mode) in a kit layer without the marker. */
  | "unscoped"
  /** The rule sits in the kit's layer but its selector names nothing the kit owns. */
  | "unanchored";

export interface Leak {
  /** The offending selector, verbatim. */
  selector: string;
  /** `null` for an unlayered rule, else the enclosing layer's name (`a.b` for nested layers). */
  layer: string | null;
  kind: LeakKind;
}

/**
 * Class-name prefixes each component stylesheet owns. Adding a component
 * `.scss` with a new prefix means registering it here — the audit fails
 * otherwise, which is the point: an unprefixed `.title` or `.divider` inside
 * the kit layer is exactly the PUI-5962 collision.
 */
export const KIT_CLASS_PREFIXES: readonly string[] = [
  "ts-",
  "histogram-",
  "electropherogram-",
  "platemap-",
  "scatter-plot-interactive",
  "tdp-search",
];

/** Attribute selectors the kit owns outright. */
const KIT_ATTRIBUTE = /\[data-(?:slot|ts-)[\w-]*[=\]]/u;

/**
 * The kit's document-level token hooks — allowed in the kit layer (the scoped
 * build rewrites them) only as a *bare* compound: `:root`, `.dark`,
 * `:root:not(.dark)`. `.dark .divider` is not a hook, it is a namespaced-class
 * question about `.divider`.
 */
const TOKEN_HOOK = /^(?::root|:host|\.dark)(?![\w-])[^\s>+~]*$/u;

const CLASS_NAME = /\.((?:[\w-]|\\.)+)/gu;

/**
 * The scoped build prefixes every selector with the marker, which would
 * trivially satisfy the attribute anchor. Judge the selector the marker was
 * added to instead; the bare marker (a rewritten `:root`) counts as `:root`.
 */
function withoutScopeMarker(selector: string): string {
  const stripped = selector.split(SCOPE_SELECTOR).join(" ").trim();
  return stripped === "" ? ":root" : stripped;
}

/** Whether `selector` names something only the kit renders. */
export function isKitAnchored(selector: string): boolean {
  if (KIT_ATTRIBUTE.test(selector) || TOKEN_HOOK.test(selector)) return true;
  for (const [, className] of selector.matchAll(CLASS_NAME)) {
    if (KIT_CLASS_PREFIXES.some((prefix) => className.startsWith(prefix))) return true;
  }
  return false;
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
        for (const selector of node.selectors) {
          if (mustBeScoped(layer) && !selector.includes(SCOPE_SELECTOR)) {
            leaks.push({ selector, layer, kind: "unscoped" });
          } else if (layer === KIT_LAYER && !isKitAnchored(withoutScopeMarker(selector))) {
            leaks.push({ selector, layer, kind: "unanchored" });
          }
        }
        return;
      }
      if (node.type !== "atrule" || !node.nodes) return;

      const name = node.name.toLowerCase();
      if (UNSCOPABLE_AT_RULES.has(name)) return;
      if (name !== "layer") {
        visit(node, layer);
        return;
      }
      // A nested `@layer b` inside `@layer a` is the layer `a.b`.
      const inner = node.params.trim();
      visit(node, layer === null ? inner : `${layer}.${inner}`);
    });
  };

  visit(postcss.parse(css), null);
  return leaks;
}

/**
 * The cascade-layer order every published stylesheet must end up with.
 * `properties` (Tailwind's @property fallback) lowest, then Tailwind's four,
 * then the kit's own layer on top so component CSS keeps outranking utilities
 * the way the unlayered original did.
 */
export const EXPECTED_LAYER_ORDER: readonly string[] = [
  "properties",
  "theme",
  "base",
  "components",
  "utilities",
  KIT_LAYER,
];

/**
 * The order the browser will give the top-level layers of `css`: each name's
 * position is fixed by its first appearance, in a statement or a block.
 */
export function effectiveLayerOrder(css: string): string[] {
  const order: string[] = [];
  postcss.parse(css).each((node) => {
    if (node.type !== "atrule" || node.name.toLowerCase() !== "layer") return;
    for (const name of node.params.split(",").map((part) => part.trim())) {
      if (name && !order.includes(name)) order.push(name);
    }
  });
  return order;
}

/** Layers of `EXPECTED_LAYER_ORDER` that `css` places out of sequence (relative to the others). */
export function layerOrderViolations(css: string): string[] {
  const actual = effectiveLayerOrder(css).filter((name) => EXPECTED_LAYER_ORDER.includes(name));
  const expected = EXPECTED_LAYER_ORDER.filter((name) => actual.includes(name));
  return actual.filter((name, i) => name !== expected[i]);
}

/** The stylesheets the package publishes, and the bar each is held to. */
export const AUDITED_STYLESHEETS: ReadonlyArray<{ file: string; mode: AuditMode }> = [
  { file: "index.css", mode: "global" },
  { file: "index.tailwind.css", mode: "global" },
  { file: "index.scoped.css", mode: "scoped" },
];

export interface AuditResult {
  file: string;
  mode: AuditMode;
  leaks: Leak[];
  layerOrder: string[];
  misorderedLayers: string[];
}

export function auditDist(distDir: string): AuditResult[] {
  return AUDITED_STYLESHEETS.map(({ file, mode }) => {
    const css = fs.readFileSync(path.join(distDir, file), "utf8");
    return {
      file,
      mode,
      leaks: collectLeaks(css, mode),
      layerOrder: effectiveLayerOrder(css),
      misorderedLayers: layerOrderViolations(css),
    };
  });
}

// CLI: `yarn tsx scripts/build/audit-css-leaks.ts [distDir]`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const distDir = path.resolve(process.argv[2] ?? "dist");
  const results = auditDist(distDir);
  let failed = false;
  for (const { file, mode, leaks, layerOrder, misorderedLayers } of results) {
    const order = layerOrder.join(" < ");
    if (leaks.length === 0 && misorderedLayers.length === 0) {
      console.log(`✓ ${file} (${mode}): no document-level rules; layers ${order}`);
      continue;
    }
    failed = true;
    if (leaks.length > 0) {
      console.log(`✗ ${file} (${mode}): ${leaks.length} selector(s) can match outside the kit's subtree:`);
      for (const { selector, layer, kind } of leaks) {
        const where = layer === null ? "unlayered" : `@layer ${layer}`;
        console.log(`    ${where}  ${selector}  (${kind})`);
      }
    }
    if (misorderedLayers.length > 0) {
      console.log(
        `✗ ${file} (${mode}): cascade layers out of order — got ${order}, ` +
          `expected ${EXPECTED_LAYER_ORDER.join(" < ")} (misplaced: ${misorderedLayers.join(", ")})`,
      );
    }
  }
  if (failed) {
    console.log(
      "\nKit-authored CSS must live in `@layer ts-ui-kit` (tokens, component .scss) and every selector there " +
        "must name something the kit owns (a registered component prefix, `ts-`, `[data-slot]`, `[data-ts-*]`) — " +
        "see AGENTS.md › Styling. Utilities go through `@utility`; never emit an unlayered rule.",
    );
    process.exitCode = 1;
  }
}
