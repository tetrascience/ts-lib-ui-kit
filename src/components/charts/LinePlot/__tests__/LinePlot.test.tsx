import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { LinePlot } from "../LinePlot";

import type { LinePlotProps } from "../LinePlot";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

const roots: Array<{ root: Root; container: HTMLElement }> = [];

function render(props: LinePlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  // Explicit size keeps the chart out of container-fill mode (jsdom has no ResizeObserver measurement).
  act(() => root.render(<LinePlot width={600} height={400} {...props} />));
}

type Trace = { mode?: string; error_y?: { array?: number[]; visible?: boolean } };
const lastTraces = (): Trace[] =>
  (plotly.newPlot.mock.calls.at(-1)?.[1] as Trace[]) ?? [];

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

describe("LinePlot error bars", () => {
  const series = { name: "A", x: [1, 2, 3], y: [10, 20, 30] };

  it("synthesizes a default error_y when the variant asks for error bars and none is provided", () => {
    render({ dataSeries: [series], variant: "lines+markers+error_bars" });
    const [trace] = lastTraces();
    expect(trace.error_y?.visible).toBe(true);
    // Fallback fills the array with one entry per y value.
    expect(trace.error_y?.array).toHaveLength(series.y.length);
  });

  it("uses a caller-provided error_y as-is", () => {
    render({
      dataSeries: [{ ...series, error_y: { type: "data", array: [1, 2, 3], visible: true } }],
      variant: "lines+markers+error_bars",
    });
    expect(lastTraces()[0].error_y?.array).toEqual([1, 2, 3]);
  });

  it("omits error_y for the plain lines variant", () => {
    render({ dataSeries: [series], variant: "lines" });
    expect(lastTraces()[0].error_y).toBeUndefined();
  });
});
