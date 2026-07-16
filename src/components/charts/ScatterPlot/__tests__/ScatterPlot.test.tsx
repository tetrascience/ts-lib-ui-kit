import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ScatterPlot } from "../ScatterPlot";

import type { ScatterPlotProps } from "../ScatterPlot";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

type EventHandler = (eventData?: unknown) => void;
let handlers: Record<string, EventHandler>;

const roots: Array<{ root: Root; container: HTMLElement }> = [];

const dataSeries: ScatterPlotProps["dataSeries"] = [
  { name: "A", x: [1, 2, 3], y: [10, 20, 30] },
];

function render(props: ScatterPlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  // Explicit size keeps the chart out of container-fill mode, which would need
  // a ResizeObserver measurement that jsdom can't provide.
  act(() => root.render(<ScatterPlot width={600} height={400} {...props} />));
}

const fire = (event: string, data?: unknown) => act(() => handlers[event]?.(data));

/** All shapes passed to Plotly.relayout calls that set `shapes`. */
function lastShapes(): Array<{ type?: string; layer?: string }> | undefined {
  const calls = plotly.relayout.mock.calls as unknown as Array<[unknown, { shapes?: unknown }]>;
  const withShapes = calls.filter((c) => c[1] && "shapes" in c[1]);
  return withShapes.at(-1)?.[1].shapes as Array<{ type?: string; layer?: string }> | undefined;
}

type Trace = { name?: string; marker?: { symbol?: string; size?: number; color?: string } };

/** Traces passed to the most recent Plotly.newPlot call. */
function lastTraces(): Trace[] {
  const calls = plotly.newPlot.mock.calls as unknown as Array<[unknown, Trace[]]>;
  return calls.at(-1)?.[1] ?? [];
}

beforeEach(() => {
  handlers = {};
  plotly.relayout.mockReset();
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: (event: string, cb: EventHandler) => void }).on = (event, cb) => {
      handlers[event] = cb;
    };
    return Promise.resolve();
  });
});

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
});

describe("ScatterPlot crosshair", () => {
  it("draws crosshair guide lines behind the points on hover", () => {
    render({ dataSeries });
    fire("plotly_hover", { points: [{ x: 2, y: 20 }] });

    const shapes = lastShapes();
    expect(shapes).toHaveLength(2);
    // Both rendered beneath the markers
    expect(shapes?.every((s) => s.layer === "below")).toBe(true);
    expect(shapes?.every((s) => s.type === "line")).toBe(true);
  });

  it("clears the crosshair on unhover", () => {
    render({ dataSeries });
    fire("plotly_hover", { points: [{ x: 2, y: 20 }] });
    fire("plotly_unhover");
    expect(lastShapes()).toEqual([]);
  });

  it("ignores hover events without points", () => {
    render({ dataSeries });
    plotly.relayout.mockClear();
    fire("plotly_hover", { points: [] });
    // No shape relayout for an empty hover
    expect(lastShapes()).toBeUndefined();
  });
});

describe("ScatterPlot series handling", () => {
  it("accepts a single series object (normalized to one trace)", () => {
    render({ dataSeries: { name: "Solo", x: [1, 2], y: [3, 4] } });
    const traces = lastTraces();
    expect(traces).toHaveLength(1);
    expect(traces[0].name).toBe("Solo");
    expect(traces[0].marker?.symbol).toBe("circle");
  });

  it("renders all series as circles in the default variant", () => {
    render({
      dataSeries: [
        { name: "A", x: [1], y: [1] },
        { name: "B", x: [2], y: [2] },
      ],
    });
    const traces = lastTraces();
    expect(traces.map((t) => t.marker?.symbol)).toEqual(["circle", "circle"]);
  });

  it("cycles marker symbols per series in the stacked variant", () => {
    render({
      variant: "stacked",
      dataSeries: [
        { name: "A", x: [1], y: [1] },
        { name: "B", x: [2], y: [2] },
        { name: "C", x: [3], y: [3] },
      ],
    });
    const traces = lastTraces();
    expect(traces.map((t) => t.marker?.symbol)).toEqual(["circle", "square", "diamond"]);
  });

  it("honors per-series symbol, size, and color overrides", () => {
    render({
      variant: "stacked",
      markerSize: 12,
      dataSeries: [
        { name: "A", x: [1], y: [1], symbol: "star", size: 20, color: "#123456" },
        { name: "B", x: [2], y: [2] },
      ],
    });
    const traces = lastTraces();
    expect(traces[0].marker?.symbol).toBe("star");
    expect(traces[0].marker?.size).toBe(20);
    expect(traces[0].marker?.color).toBe("#123456");
    // Second series falls back to the shared markerSize and cycled symbol
    expect(traces[1].marker?.size).toBe(12);
    expect(traces[1].marker?.symbol).toBe("square");
  });
});
