import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { auditDist, collectLeaks, effectiveLayerOrder, isKitAnchored, layerOrderViolations } from "../audit-css-leaks";
import { buildScopedCss, SCOPED_CSS_BANNER } from "../build-scoped-css";
import { SCOPE_SELECTOR } from "../scope-kit-css";

const S = SCOPE_SELECTOR;

describe("collectLeaks", () => {
  it("flags every unlayered rule in a global entry, wherever it is nested", () => {
    const css =
      ":root{--a:1}.divider{width:2px}" +
      "@media (min-width:1px){.title{margin:0}}" +
      "@supports (color:red){@container x (min-width:1px){[data-slot=pf]{gap:0}}}";
    expect(collectLeaks(css, "global").map((l) => l.selector)).toEqual([
      ":root",
      ".divider",
      ".title",
      "[data-slot=pf]",
    ]);
  });

  it("accepts any layered rule in a global entry, when the kit layer's selectors are anchored", () => {
    const css =
      "@layer theme{:root{--a:1}}@layer base{body{margin:0}}" +
      "@layer ts-ui-kit{:root{--b:2}.dark{--b:3}.histogram-title{font-size:32px}" +
      "[data-slot=process-flow] [data-slot=process-flow-label]{gap:0}.dark .scatter-plot-interactive path{x:1}}" +
      "@layer utilities{.flex{display:flex}}";
    expect(collectLeaks(css, "global")).toEqual([]);
  });

  it("rejects a generic class name inside the kit layer — layering alone does not stop a name collision", () => {
    // PUI-5962 verbatim: a layered `.divider { width: 2px }` still collapses a host's
    // `<div class="divider">` when the host has no competing declaration.
    const css = "@layer ts-ui-kit{.divider{width:2px}.title,.histogram-title{margin:0}.dark .legend-item{x:1}}";
    expect(collectLeaks(css, "global")).toEqual([
      { selector: ".divider", layer: "ts-ui-kit", kind: "unanchored" },
      { selector: ".title", layer: "ts-ui-kit", kind: "unanchored" },
      { selector: ".dark .legend-item", layer: "ts-ui-kit", kind: "unanchored" },
    ]);
    // The scoped entry holds the same bar, on top of requiring the marker.
    expect(collectLeaks("@layer ts-ui-kit{[data-ts-ui-root] .divider{width:2px}}", "scoped")).toEqual([
      { selector: "[data-ts-ui-root] .divider", layer: "ts-ui-kit", kind: "unanchored" },
    ]);
  });

  it("tracks nested layers by their full dotted name", () => {
    expect(collectLeaks("@layer a{@layer ts-ui-kit{.divider{x:1}}}", "global")).toEqual([]);
    expect(collectLeaks("@layer ts-ui-kit{@layer inner{.divider{x:1}}}", "global")).toEqual([]);
    expect(collectLeaks("@layer x{@layer y{.divider{x:1}}}", "scoped").map((l) => l.layer)).toEqual([]);
  });

  it("holds a scoped entry to the kit-authored layers too, but not Tailwind's", () => {
    const css =
      "@layer theme{:root,:host{--spacing:1px}}" +
      "@layer base{body{margin:0}}" +
      `@layer ts-ui-kit{${S}{--a:1}.dark{--a:2}}` +
      "@layer utilities{.flex{display:flex}}";
    expect(collectLeaks(css, "scoped")).toEqual([
      { selector: "body", layer: "base", kind: "unscoped" },
      { selector: ".dark", layer: "ts-ui-kit", kind: "unscoped" },
    ]);
  });

  it("ignores keyframe steps, @font-face and @property", () => {
    const css =
      "@keyframes k{0%{opacity:0}to{opacity:1}}@font-face{font-family:K}" +
      '@property --x{syntax:"*";inherits:false}' +
      "@layer ts-ui-kit{@keyframes j{50%{opacity:.5}}}";
    expect(collectLeaks(css, "global")).toEqual([]);
    expect(collectLeaks(css, "scoped")).toEqual([]);
  });

  it("does not count a layer-order statement as a layer", () => {
    expect(collectLeaks("@layer a,b;.x{color:red}", "global").map((l) => l.selector)).toEqual([".x"]);
  });
});

describe("isKitAnchored", () => {
  it("accepts kit-owned attributes, prefixes and token hooks", () => {
    for (const sel of [
      "[data-slot=process-flow]",
      "[data-ts-ui-root] .x",
      ".ts-border-glow",
      ".histogram-legend-divider",
      ".platemap-legend__item--horizontal",
      ".tdp-search__filter-label",
      ":root",
      ".dark",
      ".dark:hover",
      "html .electropherogram-chart",
    ]) {
      expect(isKitAnchored(sel), sel).toBe(true);
    }
  });

  it("rejects selectors that name nothing the kit owns", () => {
    for (const sel of [".divider", ".title", "h2", ".dark-mode", ".darkroom .x", "[data-state=open]", ".legend-item"]) {
      expect(isKitAnchored(sel), sel).toBe(false);
    }
  });
});

describe("layer order", () => {
  it("fixes each layer's position at its first appearance, statement or block", () => {
    expect(effectiveLayerOrder("@layer a,b;@layer c{}@layer b{}@layer a{}")).toEqual(["a", "b", "c"]);
  });

  it("accepts the expected order and ignores layers it does not know", () => {
    expect(layerOrderViolations("@layer properties,theme,base,components,utilities,ts-ui-kit;@layer host{}")).toEqual(
      [],
    );
    expect(layerOrderViolations("@layer theme{}@layer utilities{}@layer ts-ui-kit{}")).toEqual([]);
  });

  it("reports the layers that end up out of sequence", () => {
    // The pre-fix index.tailwind.css shape: `layer(theme)` / `layer(utilities)` imports
    // came before the order statement, leaving `base` above `utilities`.
    expect(layerOrderViolations("@layer theme{}@layer utilities{}@layer base{}")).toEqual(["utilities", "base"]);
    expect(layerOrderViolations("@layer theme,base,components,utilities;@layer properties{}")).toEqual([
      "theme",
      "base",
      "components",
      "utilities",
      "properties",
    ]);
  });
});

describe("buildScopedCss + auditDist", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  const makeDist = (indexCss: string): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kit-css-"));
    dirs.push(dir);
    fs.writeFileSync(path.join(dir, "index.css"), indexCss);
    fs.writeFileSync(path.join(dir, "index.tailwind.css"), indexCss);
    return dir;
  };

  it("writes a scoped entry that passes the audit when the source is fully layered", () => {
    const dist = makeDist(
      "@layer theme,base,components,utilities,ts-ui-kit;" +
        "@layer theme{:root,:host{--spacing:1px}}" +
        "@layer base{*,::before{box-sizing:border-box}body{margin:0}}" +
        "@layer ts-ui-kit{:root{--a:1}.dark{--a:2}.histogram-title{font-size:32px}}",
    );
    const target = buildScopedCss(dist);
    const scoped = fs.readFileSync(target, "utf8");

    expect(scoped.startsWith(SCOPED_CSS_BANNER)).toBe(true);
    expect(scoped).toContain(
      `@layer ts-ui-kit{${S}{--a:1}.dark ${S},${S}.dark,${S} .dark{--a:2}${S} .histogram-title{font-size:32px}}`,
    );
    expect(auditDist(dist).map((r) => [r.file, r.leaks.length, r.misorderedLayers.length])).toEqual([
      ["index.css", 0, 0],
      ["index.tailwind.css", 0, 0],
      ["index.scoped.css", 0, 0],
    ]);
  });

  it("reports the unlayered rules of a regressed build, per file", () => {
    const dist = makeDist("@layer ts-ui-kit{:root{--a:1}}.divider{width:2px}");
    buildScopedCss(dist);
    const results = auditDist(dist);

    expect(results.find((r) => r.file === "index.css")?.leaks).toEqual([
      { selector: ".divider", layer: null, kind: "unscoped" },
    ]);
    // The scoped build confines the leak, so the scoped entry itself is clean —
    // the gate fails on the global entries, where the fix belongs.
    expect(results.find((r) => r.file === "index.scoped.css")?.leaks).toEqual([]);
  });
});
