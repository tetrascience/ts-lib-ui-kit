import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// The loader memoizes Plotly at module scope, so each test re-imports it fresh
// (vi.resetModules) after installing a per-test mock of "plotly.js-dist".
describe("plotly-loader", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("plotly.js-dist");
    vi.restoreAllMocks();
  });

  it("loads Plotly, memoizes the promise, and exposes it synchronously", async () => {
    const fakePlotly = { newPlot: vi.fn() };
    vi.doMock("plotly.js-dist", () => ({ default: fakePlotly }));

    const { loadPlotly, getLoadedPlotly } = await import("../plotly-loader");

    const first = loadPlotly();
    const second = loadPlotly();
    expect(first).toBe(second); // reuses the in-flight promise

    expect(await first).toBe(fakePlotly);
    expect(getLoadedPlotly()).toBe(fakePlotly);
  });

  it("throws if getLoadedPlotly is called before loadPlotly resolves", async () => {
    vi.doMock("plotly.js-dist", () => ({ default: { newPlot: vi.fn() } }));

    const { getLoadedPlotly } = await import("../plotly-loader");

    expect(() => getLoadedPlotly()).toThrow(/before loadPlotly\(\) resolved/);
  });

  it("rethrows with install guidance and resets so a later call can retry", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.doMock("plotly.js-dist", () => {
      throw new Error("simulated missing optional peer");
    });

    const { loadPlotly } = await import("../plotly-loader");

    const failed = loadPlotly();
    await expect(failed).rejects.toThrow(/optional peer dependency/);
    expect(consoleError).toHaveBeenCalled();

    // The failed promise was cleared, so a subsequent call starts a fresh
    // attempt (a new promise) rather than returning the cached rejection.
    const retry = loadPlotly();
    expect(retry).not.toBe(failed);
    await expect(retry).rejects.toThrow(/optional peer dependency/);
  });
});
