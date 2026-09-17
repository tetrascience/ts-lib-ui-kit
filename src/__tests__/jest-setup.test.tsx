import fs from "fs";
import path from "path";

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";


import {
  KIT_SHIKI_LANGUAGES,
  ResizableGroupStub,
  ResizablePanelStub,
  ResizableSeparatorStub,
  StickToBottomStub,
  StreamdownStub,
  createHighlighterCoreStub,
  installUiKitDomShims,
  installUiKitJestMocks,
  plotlyStub,
  rdkitFactoryStub,
  rdkitModuleStub,
  streamdownPluginStub,
  useStickToBottomContextStub,
  useStickToBottomStub,
} from "../jest-setup";

import type { JestMockApi, MockPlotElement } from "../jest-setup";
import type { ReactNode } from "react";
import type { Root } from "react-dom/client";

import { getSupportedCodeBlockLanguages } from "@/lib/shiki";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type MutableGlobal = Record<string, unknown>;

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(node: ReactNode): Promise<HTMLElement> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(node);
  });
  return container;
}

afterEach(async () => {
  for (const { root, container } of roots.splice(0)) {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  }
});

describe("installUiKitJestMocks", () => {
  interface Registration {
    factory: () => unknown;
    virtual: boolean;
  }

  function record(unresolvable: string[] = []): Map<string, Registration> {
    const registrations = new Map<string, Registration>();
    const fake: JestMockApi = {
      mock: (moduleName, factory, options) => {
        if (unresolvable.includes(moduleName) && !options?.virtual) {
          throw new Error(`Cannot find module '${moduleName}'`);
        }
        registrations.set(moduleName, {
          factory: factory ?? (() => ({})),
          virtual: options?.virtual === true,
        });
        return fake;
      },
    };
    installUiKitJestMocks(fake);
    return registrations;
  }

  it("registers every ESM-only / optional-peer module the kit reaches", () => {
    const registrations = record();
    const expected = [
      "plotly.js-dist",
      "@rdkit/rdkit",
      "streamdown",
      "use-stick-to-bottom",
      "react-resizable-panels",
      "@streamdown/cjk",
      "@streamdown/math",
      "@streamdown/mermaid",
      "shiki/core",
      "shiki/engine/javascript",
      "@shikijs/themes/github-light",
      "@shikijs/themes/github-dark",
      ...KIT_SHIKI_LANGUAGES.map((lang) => `@shikijs/langs/${lang}`),
    ];
    expect([...registrations.keys()].sort()).toEqual([...expected].sort());
  });

  /**
   * Cross-checks the registered set against the kit's runtime optional
   * peers (`package.json`'s `peerDependenciesMeta`) instead of hand-copying
   * the same list `installUiKitJestMocks` uses — the test above proves the
   * setup registers what it registers, this one proves it registers what
   * the *package* actually needs. Server-only peers (Athena/Databricks/
   * Snowflake SDKs) are excluded: they're loaded from `src/server/**`,
   * which real Node `require()` under `environment: "node"` handles
   * without any of this file's mocks — see vite.config.ts's test.projects.
   */
  it("covers every optional peer actually imported from client-facing source", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"),
    ) as { peerDependenciesMeta?: Record<string, { optional?: boolean }> };
    const optionalPeers = Object.entries(pkg.peerDependenciesMeta ?? {})
      .filter(([, meta]) => meta.optional)
      .map(([name]) => name);
    expect(optionalPeers.length).toBeGreaterThan(0);

    const clientDirs = ["components", "hooks", "lib"].map((dir) =>
      path.resolve(__dirname, "../", dir),
    );
    function walk(dir: string): string[] {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
      });
    }
    const clientSource = clientDirs.flatMap(walk).map((f) => fs.readFileSync(f, "utf8"));
    const clientFacingPeers = optionalPeers.filter((peer) =>
      clientSource.some((src) => src.includes(`"${peer}"`) || src.includes(`'${peer}'`)),
    );
    expect(clientFacingPeers.length).toBeGreaterThan(0);

    const registrations = record();
    for (const peer of clientFacingPeers) {
      expect(registrations.has(peer), `expected a registration for ${peer}`).toBe(true);
    }
  });

  it("falls back to a virtual mock when non-virtual registration fails", () => {
    // installUiKitJestMocks's own try/catch logic against a fake jest.mock
    // that mirrors real Jest's observed behavior (verified separately,
    // against real Jest, in scripts/verify-jest-consumer/ — see AGENTS.md):
    // jest.mock(id, factory) throws synchronously for a genuinely
    // unresolvable specifier (a missing optional peer, or an ESM-only
    // package Jest's CJS resolver can't see), and succeeds non-virtually
    // for anything else.
    const registrations = record(["plotly.js-dist", "streamdown"]);
    expect(registrations.get("plotly.js-dist")?.virtual).toBe(true);
    expect(registrations.get("streamdown")?.virtual).toBe(true);
    expect(registrations.get("use-stick-to-bottom")?.virtual).toBe(false);
    expect(registrations.get("shiki/core")?.virtual).toBe(false);
  });

  it("factories produce the shapes the kit's imports consume", () => {
    const registrations = record();
    const factoryOutput = (name: string): unknown => registrations.get(name)?.factory();
    const factoryOutputObject = (name: string): Record<string, unknown> =>
      factoryOutput(name) as Record<string, unknown>;

    // plotly and rdkit loaders both do `mod.default ?? mod`.
    expect(factoryOutput("plotly.js-dist")).toBe(plotlyStub);
    expect(factoryOutput("@rdkit/rdkit")).toBe(rdkitFactoryStub);

    expect(factoryOutputObject("streamdown").Streamdown).toBe(StreamdownStub);
    const stick = factoryOutputObject("use-stick-to-bottom");
    expect(stick.StickToBottom).toBe(StickToBottomStub);
    expect(stick.useStickToBottomContext).toBe(useStickToBottomContextStub);
    const panels = factoryOutputObject("react-resizable-panels");
    expect(panels.Group).toBe(ResizableGroupStub);
    expect(panels.PanelGroup).toBe(ResizableGroupStub);
    expect(panels.PanelResizeHandle).toBe(ResizableSeparatorStub);

    // Each @streamdown/* package exports exactly one of these — separate
    // one-key objects, not a shared multi-key literal.
    expect(factoryOutputObject("@streamdown/cjk")).toEqual({ cjk: streamdownPluginStub });
    expect(factoryOutputObject("@streamdown/math")).toEqual({ math: streamdownPluginStub });
    expect(factoryOutputObject("@streamdown/mermaid")).toEqual({ mermaid: streamdownPluginStub });
    expect(streamdownPluginStub()).toEqual({});

    expect(factoryOutputObject("shiki/core").createHighlighterCore).toBe(createHighlighterCoreStub);
    const engine = factoryOutputObject("shiki/engine/javascript")
      .createJavaScriptRegexEngine as () => unknown;
    expect(engine()).toEqual({});

    // Consumed via `.default` after Rollup's dynamic-import interop, which
    // unconditionally sets `namespace.default = <raw factory return>` with
    // no `__esModule` check (vite.config.ts's `dynamicImportInCjs: false`
    // comment has the full story) — so the factory must return the value
    // that belongs at `.default` directly, not wrapped in `{ default: … }`.
    expect(factoryOutput("@shikijs/themes/github-dark")).toEqual({});
    expect(factoryOutput("@shikijs/langs/python")).toEqual([]);
  });
});

describe("KIT_SHIKI_LANGUAGES", () => {
  it("matches the real language set src/lib/shiki.ts supports", () => {
    // Guards against the exact drift AGENTS.md warns maintainers about:
    // extending src/lib/shiki.ts's language set without extending this
    // constant leaves the new language unmockable, silently.
    expect([...KIT_SHIKI_LANGUAGES].sort()).toEqual([...getSupportedCodeBlockLanguages()].sort());
  });
});

describe("installUiKitDomShims", () => {
  const OBSERVER_KEYS = ["ResizeObserver", "IntersectionObserver"] as const;
  const ELEMENT_KEYS = [
    "scrollIntoView",
    "scrollTo",
    "hasPointerCapture",
    "setPointerCapture",
    "releasePointerCapture",
  ] as const;

  function elementProto(): MutableGlobal {
    return window.Element.prototype as unknown as MutableGlobal;
  }

  it("installs missing observers, matchMedia, and element methods", () => {
    // jsdom (this repo's jsdom ^28, confirmed empirically) implements none
    // of these natively — this isn't a defensive "just in case" guard, it's
    // load-bearing for every jsdom-environment kit test.
    const globalRef = globalThis as unknown as MutableGlobal;
    const savedGlobals = OBSERVER_KEYS.map((k) => [k, globalRef[k]] as const);
    const savedElement = ELEMENT_KEYS.map((k) => [k, elementProto()[k]] as const);
    const savedMatchMedia = window.matchMedia;
    try {
      for (const key of OBSERVER_KEYS) delete globalRef[key];
      for (const key of ELEMENT_KEYS) delete elementProto()[key];
      delete (window as unknown as MutableGlobal).matchMedia;

      installUiKitDomShims();

      for (const key of OBSERVER_KEYS) expect(globalRef[key], key).toBeTypeOf("function");
      for (const key of ELEMENT_KEYS) expect(elementProto()[key], key).toBeTypeOf("function");

      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      expect(mql.matches).toBe(false);
      expect(mql.media).toBe("(prefers-color-scheme: dark)");
      expect(mql.dispatchEvent(new Event("change"))).toBe(false);
      mql.addEventListener("change", () => {});
      mql.removeEventListener("change", () => {});

      const ObserverCtor = globalRef.ResizeObserver as new (
        cb: () => void,
      ) => { observe: () => void; unobserve: () => void; disconnect: () => void };
      const observer = new ObserverCtor(() => {});
      observer.observe();
      observer.unobserve();
      observer.disconnect();

      const IntersectionCtor = globalRef.IntersectionObserver as new (
        cb: () => void,
      ) => { takeRecords: () => unknown[]; observe: () => void; disconnect: () => void };
      const intersection = new IntersectionCtor(() => {});
      intersection.observe();
      intersection.disconnect();
      expect(intersection.takeRecords()).toEqual([]);

      const el = document.createElement("div");
      el.scrollIntoView();
      el.setPointerCapture(1);
      el.releasePointerCapture(1);
      expect(el.hasPointerCapture(1)).toBe(false);
    } finally {
      for (const [key, value] of savedGlobals) {
        if (value === undefined) delete globalRef[key];
        else globalRef[key] = value;
      }
      for (const [key, value] of savedElement) {
        if (value === undefined) delete elementProto()[key];
        else elementProto()[key] = value;
      }
      if (savedMatchMedia === undefined) {
        delete (window as unknown as MutableGlobal).matchMedia;
      } else {
        (window as unknown as MutableGlobal).matchMedia = savedMatchMedia;
      }
    }
  });

  it("leaves existing implementations untouched", () => {
    const globalRef = globalThis as unknown as MutableGlobal;
    const savedResize = globalRef.ResizeObserver;
    const savedMatchMedia = window.matchMedia;
    const savedScroll = elementProto().scrollIntoView;
    class Existing {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    const existingMatchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;
    const existingScroll = () => {};
    try {
      globalRef.ResizeObserver = Existing;
      (window as unknown as MutableGlobal).matchMedia = existingMatchMedia;
      elementProto().scrollIntoView = existingScroll;

      installUiKitDomShims();

      expect(globalRef.ResizeObserver).toBe(Existing);
      expect(window.matchMedia).toBe(existingMatchMedia);
      expect(elementProto().scrollIntoView).toBe(existingScroll);
    } finally {
      if (savedResize === undefined) delete globalRef.ResizeObserver;
      else globalRef.ResizeObserver = savedResize;
      (window as unknown as MutableGlobal).matchMedia = savedMatchMedia;
      elementProto().scrollIntoView = savedScroll;
    }
  });
});

describe("plotly stub", () => {
  it("attaches the plot event API and resolves the element", async () => {
    const el = document.createElement("div");
    const plotEl = await plotlyStub.newPlot(el);
    expect(plotEl).toBe(el);

    const seen: unknown[] = [];
    const handler = (payload: unknown) => seen.push(payload);
    plotEl.on("plotly_hover", handler);
    plotEl.emit("plotly_hover", { points: [] });
    expect(seen).toEqual([{ points: [] }]);
    plotEl.removeListener("plotly_hover", handler);
    plotEl.emit("plotly_hover", { points: [] });
    expect(seen).toHaveLength(1);
  });

  it("supports once and removeAllListeners", async () => {
    const plotEl = (await plotlyStub.react(document.createElement("div"))) as MockPlotElement;
    let calls = 0;
    plotEl.once("plotly_click", () => {
      calls += 1;
    });
    plotEl.emit("plotly_click");
    plotEl.emit("plotly_click");
    expect(calls).toBe(1);

    plotEl.on("plotly_relayout", () => {
      calls += 1;
    });
    plotEl.removeAllListeners("plotly_relayout");
    plotEl.emit("plotly_relayout");
    plotEl.on("plotly_selected", () => {
      calls += 1;
    });
    plotEl.removeAllListeners();
    plotEl.emit("plotly_selected");
    expect(calls).toBe(1);
  });

  it("resolves the mutation and export helpers", async () => {
    const el = document.createElement("div");
    await expect(plotlyStub.relayout(el)).resolves.toBe(el);
    await expect(plotlyStub.restyle(el)).resolves.toBe(el);
    await expect(plotlyStub.update(el)).resolves.toBe(el);
    await expect(plotlyStub.addTraces(el)).resolves.toBe(el);
    await expect(plotlyStub.deleteTraces(el)).resolves.toBe(el);
    await expect(plotlyStub.extendTraces(el)).resolves.toBe(el);
    await expect(plotlyStub.toImage()).resolves.toMatch(/^data:image\/png/);
    await expect(plotlyStub.downloadImage()).resolves.toBe("mock-download");
    await expect(plotlyStub.Plots.resize()).resolves.toBeUndefined();
    expect(() => {
      plotlyStub.purge();
      plotlyStub.setPlotConfig();
    }).not.toThrow();
  });
});

describe("rdkit stub", () => {
  it("resolves a factory that always returns a valid, empty-SVG molecule", async () => {
    const mod = await rdkitFactoryStub();
    expect(mod).toBe(rdkitModuleStub);
    const mol = mod.get_mol("CCO");
    expect(mol.is_valid()).toBe(true);
    expect(mol.get_svg_with_highlights("{}")).toContain("<svg");
    expect(() => mol.delete()).not.toThrow();
  });
});

describe("component stubs", () => {
  it("Streamdown renders markdown source as text", async () => {
    const container = await render(
      <StreamdownStub className="md"># Heading with **bold**</StreamdownStub>,
    );
    const el = container.querySelector('[data-slot="streamdown-mock"]');
    expect(el?.textContent).toBe("# Heading with **bold**");
    expect(el?.className).toBe("md");
  });

  it("StickToBottom renders root and content, and reports at-bottom", async () => {
    const container = await render(
      <StickToBottomStub className="conv" role="log">
        <StickToBottomStub.Content className="content">hello</StickToBottomStub.Content>
      </StickToBottomStub>,
    );
    expect(
      container.querySelector('[data-slot="stick-to-bottom-mock"]')?.getAttribute("role"),
    ).toBe("log");
    expect(
      container.querySelector('[data-slot="stick-to-bottom-content-mock"]')?.textContent,
    ).toBe("hello");

    const context = useStickToBottomContextStub();
    expect(context.isAtBottom).toBe(true);
    expect(() => {
      context.scrollToBottom();
      context.stopScroll();
    }).not.toThrow();
    const hook = useStickToBottomStub();
    expect(hook.isAtBottom).toBe(true);
    expect(() => {
      hook.scrollRef(null);
      hook.contentRef(null);
    }).not.toThrow();
  });

  it("resizable panels render group, panels, and separator", async () => {
    const container = await render(
      <ResizableGroupStub className="group">
        <ResizablePanelStub>left</ResizablePanelStub>
        <ResizableSeparatorStub>handle</ResizableSeparatorStub>
        <ResizablePanelStub>right</ResizablePanelStub>
      </ResizableGroupStub>,
    );
    expect(container.querySelector('[data-slot="resizable-group-mock"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-slot="resizable-panel-mock"]')).toHaveLength(2);
    expect(
      container.querySelector('[data-slot="resizable-separator-mock"]')?.getAttribute("role"),
    ).toBe("separator");
    expect(container.textContent).toBe("lefthandleright");
  });
});

describe("shiki stub", () => {
  it("tokenizes each line as a single unstyled token", async () => {
    const highlighter = await createHighlighterCoreStub();
    const result = highlighter.codeToTokens("const a = 1;\nconst b = 2;");
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0]).toEqual([{ content: "const a = 1;", color: "inherit" }]);
    expect(result.bg).toBe("transparent");
    expect(result.fg).toBe("inherit");
  });

  it("escapes markup in codeToHtml and no-ops the rest of the API", async () => {
    const highlighter = await createHighlighterCoreStub();
    expect(highlighter.codeToHtml("<b>&x</b>")).toBe(
      "<pre><code>&lt;b&gt;&amp;x&lt;/b&gt;</code></pre>",
    );
    await expect(highlighter.loadLanguage()).resolves.toBeUndefined();
    expect(highlighter.getLoadedLanguages()).toEqual([]);
    expect(() => highlighter.dispose()).not.toThrow();
  });
});

// The self-activation wiring (reading the Jest-injected `jest` wrapper
// variable and calling installUiKitJestMocks/installUiKitDomShims on
// import) is NOT tested here. Jest injects `jest` as a lexically-scoped
// free variable via its code transform — it is not `globalThis.jest` and
// Vitest has no equivalent transform, so there is no way to simulate the
// real activation path from this file; a test that sets `globalThis.jest`
// only proves a mechanism the file doesn't use. Real activation is
// verified end-to-end under actual Jest in
// scripts/verify-jest-consumer/ — see AGENTS.md's "Shipped Jest support"
// section.
