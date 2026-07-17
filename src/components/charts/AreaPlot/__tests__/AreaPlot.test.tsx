import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { AreaPlot } from "../AreaPlot";

import type { AreaPlotProps } from "../AreaPlot";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Controllable ResizeObserver stub — jsdom has no layout, so tests push the
// container size in explicitly (mirrors the ScatterPlotInteractive test pattern).
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

interface PlotCall {
  el: HTMLElement;
  layout: {
    width: number;
    height: number;
    xaxis: { title: { text?: string }; automargin?: boolean };
    yaxis: { title: { text?: string }; automargin?: boolean };
  };
  config: { responsive: boolean };
}

function lastPlotCall(): PlotCall {
  const call = plotly.newPlot.mock.calls.at(-1) as unknown as [
    HTMLElement,
    unknown,
    PlotCall["layout"],
    PlotCall["config"],
  ];
  return { el: call[0], layout: call[2], config: call[3] };
}

const dataSeries: AreaPlotProps["dataSeries"] = [
  { name: "Series 1", x: [0, 1, 2, 3], y: [10, 18, 14, 22] },
];

const roots: Array<{ root: Root; container: HTMLElement }> = [];

// Async act so the lazy Plotly import (SW-2007) resolves and the draw
// completes before assertions run.
async function render(props: AreaPlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<AreaPlot {...props} />);
  });
}

beforeEach(() => {
  // useChartTooltip binds Plotly hover events via plotElement.on(...); give the
  // mocked plot element a no-op emitter so binding doesn't throw.
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: () => void }).on = () => {};
    return Promise.resolve();
  });
  // Real Plotly.relayout returns a promise; the resize effect chains .catch on it.
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

describe("AreaPlot sizing", () => {
  it("uses explicit width/height and disables Plotly responsiveness", async () => {
    await render({ dataSeries, width: 800, height: 400 });

    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    const { layout, config } = lastPlotCall();
    expect(layout.width).toBe(800);
    expect(layout.height).toBe(400);
    expect(config.responsive).toBe(false);
  });

  it("reserves tick/legend space via automargin on both axes", async () => {
    await render({ dataSeries, width: 800, height: 400 });
    const { layout } = lastPlotCall();
    expect(layout.xaxis.automargin).toBe(true);
    expect(layout.yaxis.automargin).toBe(true);
  });

  it("defaults axis titles to undefined instead of Columns/Rows", async () => {
    await render({ dataSeries, width: 800, height: 400 });
    const { layout } = lastPlotCall();
    expect(layout.xaxis.title.text).toBeUndefined();
    expect(layout.yaxis.title.text).toBeUndefined();
  });

  it("fills its container from the measured size when width/height are omitted", async () => {
    await render({ dataSeries });

    // No measurement yet → no plot is created with a zero-size canvas.
    expect(plotly.newPlot).not.toHaveBeenCalled();

    await act(async () => {
      triggerResize(320, 200);
    });

    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    const { layout } = lastPlotCall();
    expect(layout.width).toBe(320);
    expect(layout.height).toBe(200);
  });

  it("fills only the omitted dimension (fixed width + measured height)", async () => {
    await render({ dataSeries, width: 500 });

    // Height is still unmeasured, so the plot must not initialize at height 0.
    expect(plotly.newPlot).not.toHaveBeenCalled();

    await act(async () => {
      triggerResize(999, 300);
    });

    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    const { layout } = lastPlotCall();
    // Fixed width wins; height comes from the measurement.
    expect(layout.width).toBe(500);
    expect(layout.height).toBe(300);
  });

  it("relayouts in place on resize instead of recreating the plot", async () => {
    await render({ dataSeries });

    await act(async () => {
      triggerResize(320, 200);
    });
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);

    await act(async () => {
      triggerResize(640, 300);
    });

    // Still a single newPlot; the size change went through relayout.
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    expect(plotly.relayout).toHaveBeenCalledWith(expect.anything(), { width: 640, height: 300 });
  });

  it("purges the plot on unmount", async () => {
    await render({ dataSeries, width: 800, height: 400 });
    const { el } = lastPlotCall();
    act(() => {
      roots[0].root.unmount();
    });
    roots.shift();
    expect(plotly.purge).toHaveBeenCalledWith(el);
  });
});
