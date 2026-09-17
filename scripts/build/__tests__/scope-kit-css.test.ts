import { describe, expect, it } from "vitest";

import { SCOPE_SELECTOR, scopeCss, scopeSelector } from "../scope-kit-css";

const S = SCOPE_SELECTOR;

describe("scopeSelector", () => {
  it("drops empty selectors", () => {
    expect(scopeSelector("  ")).toEqual([]);
  });

  it("rewrites document-level selectors onto the marker, keeping compounds", () => {
    expect(scopeSelector(":root")).toEqual([S]);
    expect(scopeSelector("html")).toEqual([S]);
    expect(scopeSelector("body")).toEqual([S]);
    expect(scopeSelector(":host")).toEqual([S]);
    expect(scopeSelector(":root:not(.dark)")).toEqual([`${S}:not(.dark)`]);
    expect(scopeSelector("body > main")).toEqual([`${S} > main`]);
  });

  it("does not mistake a class or tag that merely starts with a document token", () => {
    expect(scopeSelector("bodyguard")).toEqual([`${S} bodyguard`]);
    expect(scopeSelector(".dark-mode")).toEqual([`${S} .dark-mode`]);
  });

  it("covers the marker element itself for `*` and bare pseudos", () => {
    expect(scopeSelector("*")).toEqual([S, `${S} *`]);
    expect(scopeSelector("::before")).toEqual([`${S} ::before`, `${S}::before`]);
    expect(scopeSelector(":-moz-focusring")).toEqual([`${S} :-moz-focusring`, `${S}:-moz-focusring`]);
  });

  it("covers `.dark` above the marker, on the marked shell itself, and nested inside it", () => {
    expect(scopeSelector(".dark")).toEqual([`.dark ${S}`, `${S}.dark`, `${S} .dark`]);
    expect(scopeSelector(".dark .foo")).toEqual([`.dark ${S} .foo`, `${S}.dark .foo`, `${S} .dark .foo`]);
    expect(scopeSelector(".dark > .foo")).toEqual([`.dark ${S} > .foo`, `${S}.dark > .foo`, `${S} .dark > .foo`]);
    expect(scopeSelector(".dark:hover")).toEqual([`.dark:hover ${S}`, `${S}.dark:hover`, `${S} .dark:hover`]);
  });

  it("prefixes ordinary selectors and leaves already-scoped ones alone", () => {
    expect(scopeSelector(".histogram-title")).toEqual([`${S} .histogram-title`]);
    expect(scopeSelector(`${S} .x`)).toEqual([`${S} .x`]);
  });

  it("honours a custom scope", () => {
    expect(scopeSelector(":root", "[data-app]")).toEqual(["[data-app]"]);
  });
});

describe("scopeCss", () => {
  it("scopes unlayered rules, including those nested in conditional at-rules", () => {
    expect(scopeCss(".divider{width:2px}")).toBe(`${S} .divider{width:2px}`);
    expect(scopeCss("@media (min-width:40rem){.title{margin:0}}")).toBe(
      `@media (min-width:40rem){${S} .title{margin:0}}`,
    );
    expect(scopeCss("@container pf (max-width:64rem){[data-slot=pf]{gap:0}}")).toBe(
      `@container pf (max-width:64rem){${S} [data-slot=pf]{gap:0}}`,
    );
  });

  it("scopes the kit's own layer and preflight, deduplicating merged selectors", () => {
    expect(scopeCss("@layer ts-ui-kit{:root{--a:1}.dark{--a:2}}")).toBe(
      `@layer ts-ui-kit{${S}{--a:1}.dark ${S},${S}.dark,${S} .dark{--a:2}}`,
    );
    expect(scopeCss("@layer base{*,::after{margin:0}body{color:red}}")).toBe(
      `@layer base{${S},${S} *,${S} ::after,${S}::after{margin:0}${S}{color:red}}`,
    );
    // `:root, [data-ts-ui-root]` collapses to a single selector.
    expect(scopeCss(`@layer ts-ui-kit{:root,${S}{--a:1}}`)).toBe(`@layer ts-ui-kit{${S}{--a:1}}`);
    expect(scopeCss("@layer base{@supports (color:red){::placeholder{opacity:1}}}")).toBe(
      `@layer base{@supports (color:red){${S} ::placeholder,${S}::placeholder{opacity:1}}}`,
    );
  });

  it("leaves Tailwind's layers and the layer-order statement untouched", () => {
    const css =
      "@layer theme,base,components,utilities,ts-ui-kit;" +
      "@layer theme{:root,:host{--spacing:.25rem}}" +
      "@layer properties{@supports (color:red){*{--tw-x:initial}}}" +
      "@layer components;" +
      "@layer utilities{.flex{display:flex}}";
    expect(scopeCss(css)).toBe(css);
  });

  it("leaves at-rules that are not selector-matched alone", () => {
    const css =
      "@keyframes spin{to{transform:rotate(1turn)}}" +
      '@property --x{syntax:"<length>";inherits:false;initial-value:0px}' +
      "@font-face{font-family:Kit;src:url(k.woff2)}";
    expect(scopeCss(css)).toBe(css);
    // …even when nested inside a scoped layer.
    expect(scopeCss("@layer ts-ui-kit{@keyframes k{0%{opacity:0}}.a{opacity:1}}")).toBe(
      `@layer ts-ui-kit{@keyframes k{0%{opacity:0}}${S} .a{opacity:1}}`,
    );
  });
});
