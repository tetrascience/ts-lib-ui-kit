import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { BarChart } from "../BarChart";

import type { BarChartProps } from "../BarChart";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Controllable ResizeObserver stub — jsdom has no layout, so tests push the
// container size in explicitly (mirrors the AreaPlot test pattern).
let triggerResize: (width: number, height: number) => void;
class ResizeObserverStub {
  constructor(
    private callback: (entries: Array<{ contentRect: { width: number; height: number } }>) => void,
  ) {
    triggerResize = (width, height) => this.callback([{ contentRect: { width, height } }]);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver?: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

const lastLayout = (): { barmode?: string; width?: number; height?: number } =>
  (plotly.newPlot.mock.calls.at(-1)?.[2] as { barmode?: string; width?: number; height?: number }) ?? {};

const dataSeries: BarChartProps["dataSeries"] = [
  { name: "Series 1", x: [0, 1, 2], y: [10, 18, 14] },
];

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(props: BarChartProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<BarChart {...props} />);
  });
}

beforeEach(() => {
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: () => void }).on = () => {};
    return Promise.resolve();
  });
  plotly.relayout.mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
  vi.clearAllMocks();
});

describe("BarChart", () => {
  it("maps the overlay variant to Plotly's overlay barmode", async () => {
    await render({ dataSeries, variant: "overlay", width: 600, height: 400 });
    expect(lastLayout().barmode).toBe("overlay");
  });

  it("re-checks the applied size in place when only the height changes", async () => {
    await render({ dataSeries });

    await act(async () => {
      triggerResize(320, 200);
    });
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);

    // Same width, new height: the resize effect re-runs; its width check
    // matches the applied size, so the height comparison branch is evaluated.
    await act(async () => {
      triggerResize(320, 260);
    });
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    expect(plotly.relayout).toHaveBeenCalledWith(expect.anything(), { width: 320, height: 260 });
  });
});
