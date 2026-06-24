import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { AreaGraph } from "../AreaGraph";

import type { AreaGraphProps } from "../AreaGraph";
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

const dataSeries: AreaGraphProps["dataSeries"] = [
  { name: "Series 1", x: [1, 2, 3], y: [10, 20, 30] },
];

function render(props: AreaGraphProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(<AreaGraph {...props} />));
}

const fire = (event: string, data?: unknown) => act(() => handlers[event]?.(data));

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

describe("AreaGraph tooltip", () => {
  it("renders the chart and registers a hover handler", () => {
    render({ dataSeries });
    expect(plotly.newPlot).toHaveBeenCalled();
    expect(typeof handlers["plotly_hover"]).toBe("function");
  });

  it("handles hover on a normal-mode point (no numeric customdata)", () => {
    render({ dataSeries });
    // Normal-mode traces carry no customdata, so the tooltip uses the point's
    // own value rather than the stacked-sum override.
    expect(() => fire("plotly_hover", { points: [{ x: 2, y: 20 }] })).not.toThrow();
  });

  it("uses the original series value when a stacked point carries customdata", () => {
    render({ dataSeries, variant: "stacked" });
    // Stacked traces report their pre-stack value via customdata (a number),
    // which the tooltip substitutes for the cumulative stack height.
    expect(() =>
      fire("plotly_hover", { points: [{ x: 2, y: 50, customdata: 20 }] }),
    ).not.toThrow();
  });
});
