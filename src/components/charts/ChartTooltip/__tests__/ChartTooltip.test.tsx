import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { loadPlotly } from "../../plotly-loader";
import { useChartTooltip } from "../ChartTooltip";

import type { UseChartTooltipOptions } from "../ChartTooltip";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  restyle: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

type EventHandler = (eventData?: unknown) => void;
let handlers: Record<string, EventHandler>;
let domHandlers: Record<string, (e: unknown) => void>;

/** Fake Plotly plot div: captures the handlers the hook registers. */
function makePlotDiv(rect: Partial<DOMRect> = {}) {
  handlers = {};
  domHandlers = {};
  const fullRect = { left: 100, top: 100, width: 400, height: 300, right: 500, bottom: 400, x: 100, y: 100, ...rect };
  return {
    on: (event: string, handler: EventHandler) => {
      handlers[event] = handler;
    },
    addEventListener: (event: string, handler: (e: unknown) => void) => {
      domHandlers[event] = handler;
    },
    getBoundingClientRect: () => fullRect as DOMRect,
  } as unknown as HTMLElement;
}

const roots: Array<{ root: Root; container: HTMLElement }> = [];

function renderHook(options: UseChartTooltipOptions, plotDiv: HTMLElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  const Harness: React.FC = () => {
    const { bindTooltip, tooltipElement } = useChartTooltip(options);
    React.useEffect(() => bindTooltip(plotDiv), [bindTooltip]);
    return <>{tooltipElement}</>;
  };
  act(() => {
    root.render(<Harness />);
  });
}

const fire = (event: string, data?: unknown) => act(() => handlers[event]?.(data));
const fireDom = (event: string, data?: unknown) => act(() => domHandlers[event]?.(data));

const anchorEl = () => document.querySelector('[data-slot="chart-tooltip-anchor"]') as HTMLElement | null;
const contentEl = () => document.querySelector('[data-slot="tooltip-content"]') as HTMLElement | null;

beforeEach(async () => {
  plotly.relayout.mockReset();
  // bindTooltip calls getLoadedPlotly() synchronously (SW-2007 lazy loader);
  // prime the loader so it resolves to the mock before any hook renders.
  await loadPlotly();
});

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
});

describe("useChartTooltip", () => {
  it("relayouts the default hover radius and shows lines on hover", () => {
    renderHook({ xLabel: "Time", yLabel: "Signal" }, makePlotDiv());
    expect(plotly.relayout).toHaveBeenCalledWith(expect.anything(), { hoverdistance: 20 });

    fire("plotly_hover", {
      points: [{ x: 1, y: 2, data: { name: "S" }, bbox: { x0: 10, x1: 30, y0: 40, y1: 60 } }],
    });
    const tip = contentEl();
    expect(tip).not.toBeNull();
    expect(tip?.textContent).toContain("S");
    expect(tip?.textContent).toContain("Time: 1");
    // Marker bbox: anchored at the top of the bbox (rect.top 100 + min(40,60))
    expect(anchorEl()?.style.top).toBe("140px");
    expect(anchorEl()?.style.left).toBe("120px"); // 100 + (10+30)/2
  });

  it("honors a custom hover radius", () => {
    renderHook({ hoverDistance: 18 }, makePlotDiv());
    expect(plotly.relayout).toHaveBeenCalledWith(expect.anything(), { hoverdistance: 18 });
  });

  it("anchors bars to their true top via the axis projection", () => {
    renderHook({}, makePlotDiv());
    fire("plotly_hover", {
      points: [
        {
          x: 1,
          y: 20,
          data: { name: "Bar" },
          // Bars report a zero-height bbox below their visual top
          bbox: { x0: 10, x1: 30, y0: 200, y1: 200 },
          yaxis: { _offset: 5, l2p: () => 40 },
        },
      ],
    });
    // 100 (rect.top) + 5 (_offset) + 40 (l2p) — not 100 + 200
    expect(anchorEl()?.style.top).toBe("145px");
  });

  it("follows the cursor and clamps to the viewport", () => {
    renderHook({ followCursor: true }, makePlotDiv());
    fire("plotly_hover", {
      points: [{ label: "pH", value: 7, percent: 50 }],
      event: { clientX: 5, clientY: 300 },
    });
    // clientX 5 clamps to the left viewport padding (8)
    expect(anchorEl()?.style.left).toBe("8px");

    // A bare mousemove keeps following the cursor without a new hover event
    fireDom("mousemove", { clientX: 400, clientY: 300 });
    expect(anchorEl()?.style.left).toBe("400px");
  });

  it("flips to the opposite side when the preferred side has no room", () => {
    // A point pinned to the very top has no room above, so a top-preferred
    // tooltip flips below
    renderHook({ side: "top" }, makePlotDiv({ top: 0 }));
    fire("plotly_hover", {
      points: [{ x: 1, y: 2, data: { name: "S" }, bbox: { x0: 10, x1: 30, y0: 0, y1: 4 } }],
    });
    expect(contentEl()?.getAttribute("data-side")).toBe("bottom");
  });

  it("hides after the grace period on unhover", () => {
    vi.useFakeTimers();
    try {
      renderHook({}, makePlotDiv());
      fire("plotly_hover", {
        points: [{ x: 1, y: 2, data: { name: "S" }, bbox: { x0: 10, x1: 30, y0: 40, y1: 60 } }],
      });
      expect(contentEl()).not.toBeNull();

      fire("plotly_unhover");
      // Still present during the grace period
      expect(contentEl()).not.toBeNull();
      act(() => vi.runAllTimers());
      expect(contentEl()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores hovers that produce no lines", () => {
    renderHook({}, makePlotDiv());
    fire("plotly_hover", { points: [] });
    expect(anchorEl()).toBeNull();
  });
});
