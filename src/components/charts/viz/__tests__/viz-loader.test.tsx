import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CORE = "@tetrascience-npm/ts-lib-viz/core";
const REACT = "@tetrascience-npm/ts-lib-viz/react";

/** A fresh copy of the loader, so each test starts with nothing loaded. */
const freshLoader = () => import("../viz-loader");

let root: Root | null = null;
let container: HTMLElement | null = null;

beforeEach(() => {
  vi.resetModules();
  vi.doMock(REACT, () => ({ Viz: () => <svg data-viz-stub="" /> }));
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container?.remove();
  container = null;
  vi.doUnmock(CORE);
  vi.doUnmock(REACT);
  vi.restoreAllMocks();
});

async function mount(element: React.ReactElement): Promise<HTMLElement> {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(element);
  });
  return container;
}

describe("loadViz", () => {
  it("loads the library once and hands the same modules to later callers", async () => {
    const { loadViz, getLoadedViz } = await freshLoader();
    const first = await loadViz();
    expect(typeof first.core.plot).toBe("function");
    expect(await loadViz()).toBe(first);
    expect(getLoadedViz()).toBe(first);
  });

  it("refuses synchronous access before the library has loaded", async () => {
    const { getLoadedViz, plot } = await freshLoader();
    expect(() => getLoadedViz()).toThrow(/before loadViz\(\) resolved/);
    expect(() => plot([], {})).toThrow(/before loadViz\(\) resolved/);
  });

  it("rejects an empty module, which is what a bundler gives for a missing optional peer", async () => {
    vi.doMock(CORE, () => ({}));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadViz } = await freshLoader();
    await expect(loadViz()).rejects.toThrow(/yarn add @tetrascience-npm\/ts-lib-viz/);
    expect(logged).toHaveBeenCalled();
  });

  it("retries on the next call after a failed load", async () => {
    vi.doMock(CORE, () => ({}));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadViz } = await freshLoader();
    await expect(loadViz()).rejects.toThrow();
    vi.doUnmock(CORE);
    expect(typeof (await loadViz()).core.plot).toBe("function");
  });

  it("passes plot and palettesFor through to the loaded library", async () => {
    const { loadViz, plot, palettesFor } = await freshLoader();
    await loadViz();
    const spec = plot([{ x: 1, y: 2 }], { x: "x", y: "y" })
      .line()
      .spec();
    expect(spec.layers.map((layer) => layer.kind)).toEqual(["line"]);
    expect(typeof palettesFor().categorical).toBe("function");
  });
});

describe("withViz", () => {
  it("draws the skeleton first, then the chart once the library loads", async () => {
    const { withViz, loadViz } = await freshLoader();
    const Lazy = withViz(
      "Demo",
      ({ label }: { label: string; width?: number; height?: number }) => <p data-chart="">{label}</p>,
      "line",
    );
    expect(Lazy.displayName).toBe("Demo");

    const host = await mount(<Lazy label="drawn" width={320} />);
    await act(async () => {
      await loadViz();
    });
    expect(host.querySelector("[data-chart]")?.textContent).toBe("drawn");
    expect(host.querySelector("[data-ts-chart-loading]")).toBeNull();
  });

  it("draws at once when the library is already loaded", async () => {
    const { withViz, loadViz } = await freshLoader();
    await loadViz();
    const Lazy = withViz("Demo", () => <p data-chart="" />, "bar");
    const host = await mount(<Lazy />);
    expect(host.querySelector("[data-chart]")).not.toBeNull();
  });

  it("stays the chart's skeleton, at its size, when the library cannot load", async () => {
    vi.doMock(CORE, () => ({}));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { withViz } = await freshLoader();
    const Lazy = withViz("Demo", (_props: { width?: number; height?: number }) => <p data-chart="" />, "pie");
    const host = await mount(<Lazy width={320} height={180} />);
    await act(async () => {
      await Promise.resolve();
    });
    const placeholder = host.querySelector<HTMLElement>("[data-ts-chart-loading]");
    expect(placeholder?.style.width).toBe("320px");
    expect(placeholder?.style.height).toBe("180px");
    expect(placeholder?.getAttribute("data-ts-chart-loading")).toBe("pie");
    expect(placeholder?.getAttribute("aria-busy")).toBe("true");
    expect(host.querySelector("[data-chart]")).toBeNull();
  });
});
