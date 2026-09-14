/**
 * Confines the kit's stylesheet to a consumer-marked DOM subtree (SW-2596).
 *
 * `dist/index.css` is authored for an app that owns its document: design
 * tokens on `:root` / `.dark`, Tailwind's preflight on `html` / `body` / `*`,
 * and a `body { background-color }` canvas. Inside someone else's document —
 * a Module Federation remote, a widget embedded in a legacy page — none of
 * those claims are the kit's to make. Every rule in the layers the kit authors
 * (`ts-ui-kit` — tokens plus per-component CSS — and Tailwind's `base`, which
 * holds preflight) is rewritten here so it can only match at or beneath an
 * element carrying `data-ts-ui-root`; the result ships as
 * `dist/index.scoped.css`.
 *
 * Tailwind's own `theme`, `properties`, `components` and `utilities` layers
 * are deliberately left alone: they are keyed on Tailwind's class names, a
 * host's unlayered CSS already outranks them, and scoping `theme` would strip
 * `--spacing` / `--radius-*` from anything the kit portals to `document.body`.
 *
 * The selector rewriting mirrors the consumer-side plugin ts-service-web
 * shipped as a stopgap (`shared/ts-ui-components/postcss/scopeKitCss.cjs`,
 * PUI-5962) — the same rules, verified in production across five platform
 * apps — so upgrading to a kit that ships this file is a straight swap.
 */
import postcss, { type AtRule, type ChildNode, type Container, type Plugin } from "postcss";

/** The attribute a consumer of `index.scoped.css` places on its shell (and on portaled surfaces). */
export const SCOPE_ATTRIBUTE = "data-ts-ui-root";
export const SCOPE_SELECTOR = `[${SCOPE_ATTRIBUTE}]`;

/** The cascade layer every kit-authored rule is emitted into. */
export const KIT_LAYER = "ts-ui-kit";

/** Layers whose rules the scoped entry must confine: the kit's own, and preflight. */
export const SCOPED_LAYERS: ReadonlySet<string> = new Set(["base", KIT_LAYER]);

/**
 * At-rules whose contents are not selector-matched; scoping them only breaks
 * them. `@keyframes` and `@font-face` names are therefore still global in the
 * scoped entry — which is why every kit-authored keyframe is `ts-`-prefixed
 * (`ts-shimmer`, `ts-border-sweep`, …) and the `Inter Variable` face keeps its
 * vendor name. The remaining unprefixed names (`spin`, `pulse`, `enter`,
 * `accordion-down`, …) are Tailwind's and tw-animate-css's own, shared by any
 * host running the same libraries.
 */
export const UNSCOPABLE_AT_RULES: ReadonlySet<string> = new Set([
  "font-face",
  "keyframes",
  "property",
  "import",
  "charset",
  "counter-style",
  "page",
]);

/** Document-level selectors the kit uses to mean "the styling root". */
const LEADING_DOCUMENT_TOKEN = /^(?::root|:host|html|body)(?![\w-])/u;

/** A combinator or descendant space directly after a matched leading token. */
const LEADING_COMBINATOR = /^[\s>+~]/u;

const DARK = ".dark";

/**
 * Rewrites one selector so it can only match inside the scope marker. Returns
 * zero, one or two selectors — `*` and bare pseudos must cover the marker
 * element itself as well as its descendants.
 */
export function scopeSelector(selector: string, scope: string = SCOPE_SELECTOR): string[] {
  const trimmed = selector.trim();

  if (trimmed === "") return [];

  // Already confined (e.g. a consumer-facing rule authored against the marker).
  if (trimmed.includes(scope)) return [trimmed];

  // `*` has to reach the marker's own box too, or a reset's `box-sizing` /
  // `margin` never lands on the shell itself.
  if (trimmed === "*") return [scope, `${scope} *`];

  // `:root`, `html`, `body`, `:host` — and compounds on them (`:root:not(.dark)`).
  const documentToken = LEADING_DOCUMENT_TOKEN.exec(trimmed);
  if (documentToken) return [`${scope}${trimmed.slice(documentToken[0].length)}`];

  // Dark mode is keyed off `.dark`, which consumers set on <html> (an ancestor
  // of the marker) or on the marked shell itself. Cover both: keep `.dark`
  // above the marker, and also fold it onto the marker as a compound.
  if (trimmed.startsWith(DARK) && !/^[\w-]/u.test(trimmed.slice(DARK.length))) {
    const rest = trimmed.slice(DARK.length);
    if (rest === "") return [`${DARK} ${scope}`, `${scope}${DARK}`];
    if (LEADING_COMBINATOR.test(rest)) return [`${DARK} ${scope}${rest}`, `${scope}${DARK}${rest}`];
    // A compound on `.dark` itself (`.dark:hover`) — the scope follows it, or carries it.
    return [`${DARK}${rest} ${scope}`, `${scope}${DARK}${rest}`];
  }

  // A bare pseudo (`::before`, `::placeholder`, `:-moz-focusring`) is
  // implicitly `*::before`, so it needs the same two-part treatment as `*`.
  if (trimmed.startsWith(":")) return [`${scope} ${trimmed}`, `${scope}${trimmed}`];

  return [`${scope} ${trimmed}`];
}

function scopeContainer(container: Container<ChildNode>, scope: string): void {
  container.each((node) => {
    if (node.type === "rule") {
      node.selectors = [...new Set(node.selectors.flatMap((sel) => scopeSelector(sel, scope)))];
      return;
    }
    if (node.type === "atrule" && node.nodes && !UNSCOPABLE_AT_RULES.has(node.name.toLowerCase())) {
      scopeContainer(node, scope);
    }
  });
}

function isScopedLayer(node: AtRule): boolean {
  return node.name.toLowerCase() === "layer" && SCOPED_LAYERS.has(node.params.trim());
}

export interface ScopeKitCssOptions {
  /** Attribute selector to confine rules to. Defaults to `[data-ts-ui-root]`. */
  scope?: string;
}

/**
 * PostCSS plugin: scopes every unlayered rule (including those nested in
 * unlayered `@media` / `@supports` / `@container`) and every rule inside the
 * `ts-ui-kit` and `base` layers.
 */
export function scopeKitCss(options: ScopeKitCssOptions = {}): Plugin {
  const scope = options.scope ?? SCOPE_SELECTOR;
  return {
    postcssPlugin: "ts-ui-kit-scope-css",
    Once(root) {
      root.each((node) => {
        if (node.type === "rule") {
          node.selectors = [...new Set(node.selectors.flatMap((sel) => scopeSelector(sel, scope)))];
          return;
        }
        if (node.type !== "atrule" || !node.nodes) return;

        const name = node.name.toLowerCase();
        if (UNSCOPABLE_AT_RULES.has(name)) return;

        if (name === "layer") {
          if (isScopedLayer(node)) scopeContainer(node, scope);
          return;
        }

        // Unlayered `@media` / `@supports` / `@container`: as global as a bare rule.
        scopeContainer(node, scope);
      });
    },
  };
}
scopeKitCss.postcss = true;

/** Convenience wrapper: scope a stylesheet string in one call. */
export function scopeCss(css: string, options: ScopeKitCssOptions = {}): string {
  return postcss([scopeKitCss(options)]).process(css, { from: undefined }).css;
}
