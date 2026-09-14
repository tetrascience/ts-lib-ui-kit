import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { auditDist, collectLeaks } from "../audit-css-leaks";
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

  it("accepts any layered rule in a global entry", () => {
    const css =
      "@layer theme{:root{--a:1}}@layer base{body{margin:0}}" +
      "@layer ts-ui-kit{:root{--b:2}.histogram-title{font-size:32px}}" +
      "@layer utilities{.flex{display:flex}}";
    expect(collectLeaks(css, "global")).toEqual([]);
  });

  it("holds a scoped entry to the kit-authored layers too, but not Tailwind's", () => {
    const css =
      "@layer theme{:root,:host{--spacing:1px}}" +
      "@layer base{body{margin:0}}" +
      `@layer ts-ui-kit{${S}{--a:1}.dark{--a:2}}` +
      "@layer utilities{.flex{display:flex}}";
    expect(collectLeaks(css, "scoped")).toEqual([
      { selector: "body", layer: "base" },
      { selector: ".dark", layer: "ts-ui-kit" },
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
    expect(scoped).toContain(`@layer ts-ui-kit{${S}{--a:1}.dark ${S}{--a:2}${S} .histogram-title{font-size:32px}}`);
    expect(auditDist(dist).map((r) => [r.file, r.leaks.length])).toEqual([
      ["index.css", 0],
      ["index.tailwind.css", 0],
      ["index.scoped.css", 0],
    ]);
  });

  it("reports the unlayered rules of a regressed build, per file", () => {
    const dist = makeDist("@layer ts-ui-kit{:root{--a:1}}.divider{width:2px}");
    buildScopedCss(dist);
    const results = auditDist(dist);

    expect(results.find((r) => r.file === "index.css")?.leaks).toEqual([{ selector: ".divider", layer: null }]);
    // The scoped build confines the leak, so the scoped entry itself is clean —
    // the gate fails on the global entries, where the fix belongs.
    expect(results.find((r) => r.file === "index.scoped.css")?.leaks).toEqual([]);
  });
});
