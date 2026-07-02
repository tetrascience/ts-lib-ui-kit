import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ScatterGraph } from "../ScatterGraph";

import type { ScatterGraphProps } from "../ScatterGraph";
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

const dataSeries: ScatterGraphProps["dataSeries"] = [
  { name: "A", x: [1, 2, 3], y: [10, 20, 30] },
];

function render(props: ScatterGraphProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  // Explicit size keeps the chart out of container-fill mode, which would need
  // a ResizeObserver measurement that jsdom can't provide.
  act(() => root.render(<ScatterGraph width={600} height={400} {...props} />));
}

const fire = (event: string, data?: unknown) => act(() => handlers[event]?.(data));

/** All shapes passed to Plotly.relayout calls that set `shapes`. */
function lastShapes(): Array<{ type?: string; layer?: string }> | undefined {
  const calls = plotly.relayout.mock.calls as unknown as Array<[unknown, { shapes?: unknown }]>;
  const withShapes = calls.filter((c) => c[1] && "shapes" in c[1]);
  return withShapes.at(-1)?.[1].shapes as Array<{ type?: string; layer?: string }> | undefined;
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

describe("ScatterGraph crosshair", () => {
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
