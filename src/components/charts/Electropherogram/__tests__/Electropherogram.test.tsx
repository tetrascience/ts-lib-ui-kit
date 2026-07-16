import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { Electropherogram } from "../Electropherogram";

import type { PeakData } from "../Electropherogram";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

const roots: Array<{ root: Root; container: HTMLElement }> = [];

function render(data: PeakData[]) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(<Electropherogram data={data} width={600} height={400} />));
  return container;
}

beforeEach(() => {
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: (event: string, cb: () => void) => void }).on = () => {};
    return Promise.resolve();
  });
});

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("Electropherogram", () => {
  it("renders an empty-state message and skips plotting when data is empty", () => {
    const container = render([]);
    expect(container.textContent).toContain("No data available");
    expect(plotly.newPlot).not.toHaveBeenCalled();
  });

  it("plots the base traces when data is provided", () => {
    render([
      { position: 1, base: "A", peakA: 50, peakT: 10, peakG: 10, peakC: 10 },
      { position: 2, base: "T", peakA: 10, peakT: 50, peakG: 10, peakC: 10 },
    ]);
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    const traces = plotly.newPlot.mock.calls[0][1] as Array<{ name: string }>;
    expect(traces.map((t) => t.name)).toEqual(["A", "T", "G", "C"]);
  });
});
