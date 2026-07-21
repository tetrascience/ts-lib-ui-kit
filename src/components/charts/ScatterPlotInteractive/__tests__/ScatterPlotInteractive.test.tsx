import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { COLORS, DEFAULT_COLOR_SCALE, DEFAULT_MARKER_SIZE } from "../constants";
import { ScatterPlotInteractive } from "../ScatterPlotInteractive";

import type { ScatterPlotInteractiveProps, ScatterPoint, SelectionMode } from "../types";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Radix tooltip positioning (floating-ui) requires ResizeObserver, which jsdom lacks
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver?: typeof ResizeObserverStub }).ResizeObserver ??=
  ResizeObserverStub;

// Capture the event callbacks the component registers via plotElement.on(...)
const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  restyle: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));

vi.mock("plotly.js-dist", () => ({ default: plotly }));

type EventHandler = (eventData?: unknown) => void;

let handlers: Record<string, EventHandler>;

/** Shape of the trace object the component hands to Plotly.newPlot */
interface CapturedTrace {
  x: number[];
  y: number[];
  ids: string[];
  mode: string;
  type: string;
  marker: {
    size: number[];
    symbol: string[];
    color: string[] | number[];
    colorscale?: string | Array<[number, string]>;
    showscale?: boolean;
    cmin?: number;
    cmax?: number;
    colorbar?: { title: { text: string } };
    line: { color: string; width: number };
  };
  hoverinfo: string;
  text: string[];
  hovertemplate?: string;
  unselected: { marker: { opacity: number } };
  selected: { marker: { opacity: number; line: { color: string; width: number } } };
}

function lastPlotCall(): {
  el: HTMLElement;
  trace: CapturedTrace;
  layout: Partial<Plotly.Layout>;
  config: Partial<Plotly.Config>;
} {
  const call = plotly.newPlot.mock.calls.at(-1) as unknown as [
    HTMLElement,
    [CapturedTrace],
    Partial<Plotly.Layout>,
    Partial<Plotly.Config>,
  ];
  return { el: call[0], trace: call[1][0], layout: call[2], config: call[3] };
}

function lastRestyleCall(): { selectedpoints: [number[] | null] } {
  const call = plotly.restyle.mock.calls.at(-1) as unknown as [
    HTMLElement,
    { selectedpoints: [number[] | null] },
    number[],
  ];
  return call[1];
}

const data: ScatterPoint[] = [
  { id: "a", x: 1, y: 10, label: "Point A", metadata: { group: "g1", v: 0 } },
  { id: "b", x: 2, y: 20, metadata: { group: "g2", v: 5 } },
  { id: "c", x: 3, y: 30, metadata: { group: "g1", v: 10 } },
];

const roots: Array<{ root: Root; container: HTMLElement }> = [];

function render(props: ScatterPlotInteractiveProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => {
    root.render(<ScatterPlotInteractive {...props} />);
  });
  return {
    container,
    rerender: (nextProps: ScatterPlotInteractiveProps) =>
      act(() => {
        root.render(<ScatterPlotInteractive {...nextProps} />);
      }),
    unmount: () =>
      act(() => {
        root.unmount();
      }),
  };
}

function fire(event: string, eventData?: unknown) {
  act(() => {
    handlers[event]?.(eventData);
  });
}

const mouseEvent = (mods: Partial<{ shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }> = {}) => ({
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  ...mods,
});

const clickEvent = (
  ids: string[],
  pointIndex: number,
  mods?: Partial<{ shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }>,
) => ({
  points: [{ data: { ids }, pointIndex }],
  event: mouseEvent(mods),
});

beforeEach(() => {
  handlers = {};
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: (event: string, cb: EventHandler) => void }).on = (event, cb) => {
      handlers[event] = cb;
    };
    return Promise.resolve();
  });
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
});

describe("ScatterPlotInteractive rendering", () => {
  it("creates a plot with token-backed default and selected colors", () => {
    render({ data, title: "My Scatter" });

    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    const { trace, layout, config } = lastPlotCall();

    expect(trace.x).toEqual([1, 2, 3]);
    expect(trace.y).toEqual([10, 20, 30]);
    expect(trace.ids).toEqual(["a", "b", "c"]);
    expect(trace.marker.color).toEqual([COLORS.primary, COLORS.primary, COLORS.primary]);
    expect(trace.marker.size).toEqual([DEFAULT_MARKER_SIZE, DEFAULT_MARKER_SIZE, DEFAULT_MARKER_SIZE]);
    expect(trace.selected.marker.line.color).toBe(COLORS.selected);
    expect(trace.unselected.marker.opacity).toBe(0.3);

    expect(layout.title).toMatchObject({ text: "My Scatter" });
    // Lasso wins when both selection tools are enabled (the defaults)
    expect(layout.dragmode).toBe("lasso");
    expect(config.modeBarButtonsToAdd).toEqual(["select2d", "lasso2d"]);

    // Initial selection sync clears any stale Plotly selection
    expect(lastRestyleCall()).toEqual({ selectedpoints: [null] });
  });

  it("does not create a plot for empty data", () => {
    render({ data: [] });
    expect(plotly.newPlot).not.toHaveBeenCalled();
    expect(plotly.restyle).not.toHaveBeenCalled();
  });

  it("applies explicit and disabled axis ranges", () => {
    render({
      data,
      xAxis: { range: [0, 5] },
      yAxis: { autoRange: false },
    });

    const { layout } = lastPlotCall();
    expect(layout.xaxis?.range).toEqual([0, 5]);
    expect(layout.xaxis?.autorange).toBe(false);
    expect(layout.yaxis?.range).toBeUndefined();
    expect(layout.yaxis?.autorange).toBe(true);
  });

  it("disables selection tooling when both box and lasso are off", () => {
    render({ data, enableBoxSelection: false, enableLassoSelection: false, enableClickSelection: false });

    const { layout, config } = lastPlotCall();
    expect(layout.dragmode).toBe(false);
    expect(config.modeBarButtonsToAdd).toEqual([]);
    expect(handlers.plotly_click).toBeUndefined();
    expect(handlers.plotly_selected).toBeUndefined();
    expect(handlers.plotly_deselect).toBeUndefined();
  });

  it("uses box-select dragmode when only box selection is enabled", () => {
    render({ data, enableLassoSelection: false });
    expect(lastPlotCall().layout.dragmode).toBe("select");
  });

  it("appends a custom className to the container", () => {
    const { container } = render({ data, className: "custom" });
    expect(container.querySelector(".scatter-plot-interactive.custom")).not.toBeNull();

    const plain = render({ data });
    expect(plain.container.firstElementChild?.className).toBe("scatter-plot-interactive relative");
  });

  it("downsamples the plotted data when configured", () => {
    const many: ScatterPoint[] = Array.from({ length: 20 }, (_, i) => ({ id: i, x: i, y: i % 7 }));
    render({ data: many, downsampling: { enabled: true, maxPoints: 5 } });

    const { trace } = lastPlotCall();
    expect(trace.x).toHaveLength(5);
  });

  it("purges the plot on unmount", () => {
    const { unmount } = render({ data });
    const { el } = lastPlotCall();
    unmount();
    expect(plotly.purge).toHaveBeenCalledWith(el);
  });
});

describe("tooltips", () => {
  const hoverEvent = (pointIndex: number, x: number, y: number) => ({
    points: [{ pointIndex, x, y, data: { ids: ["a", "b", "c"] } }],
    event: { clientX: x * 10 + 5, clientY: y * 10 + 5 },
  });
  const tooltipContent = () =>
    document.querySelector('[data-slot="tooltip-content"]');

  it("builds tooltip text and suppresses Plotly's native hover label by default", () => {
    render({ data });
    const { trace } = lastPlotCall();
    // "none" keeps hover events firing for the themed HTML tooltip
    expect(trace.hoverinfo).toBe("none");
    expect(trace.hovertemplate).toBeUndefined();
    expect(trace.text[0]).toContain("X: 1.00");
    expect(trace.text[0]).toContain("Label: Point A");
  });

  it("shows and hides the design-system tooltip on hover/unhover", () => {
    vi.useFakeTimers();
    try {
      render({
        data,
        tooltip: { enabled: true, content: (p) => `id=${p.id}<br>row 2` },
      });

      fire("plotly_hover", hoverEvent(1, 2, 20));
      const tip = tooltipContent();
      expect(tip).not.toBeNull();
      expect(tip?.textContent).toContain("id=b");
      expect(tip?.textContent).toContain("row 2");
      // Anchor positioned at the mouse coordinates (viewport, portaled to body)
      const anchor = document.querySelector(
        '[data-slot="chart-tooltip-anchor"]',
      ) as HTMLElement;
      expect(anchor.style.left).toBe("25px");

      fire("plotly_unhover");
      // Still visible during the grace period, hidden afterwards
      expect(tooltipContent()).not.toBeNull();
      act(() => {
        vi.runAllTimers();
      });
      expect(tooltipContent()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores hover events without points and out-of-range indices", () => {
    render({ data });

    fire("plotly_hover", { points: [] });
    expect(tooltipContent()).toBeNull();

    // Out-of-range index produces no lines, so no tooltip is shown
    fire("plotly_hover", hoverEvent(99, 1, 10));
    expect(tooltipContent()).toBeNull();
  });

  it("uses Plotly's native hover labels when tooltip.native is set", () => {
    render({ data, tooltip: { enabled: true, native: true, content: (p) => `id=${p.id}` } });
    const { trace } = lastPlotCall();
    expect(trace.hoverinfo).toBe("text");
    expect(trace.hovertemplate).toBe("%{text}<extra></extra>");
    expect(trace.text).toEqual(["id=a", "id=b", "id=c"]);
    expect(handlers.plotly_hover).toBeUndefined();
    expect(handlers.plotly_unhover).toBeUndefined();
  });

  it("skips hover info entirely when tooltips are disabled", () => {
    render({ data, tooltip: { enabled: false } });
    const { trace } = lastPlotCall();
    expect(trace.hoverinfo).toBe("skip");
    expect(trace.hovertemplate).toBeUndefined();
    expect(trace.text).toEqual([]);
    expect(handlers.plotly_hover).toBeUndefined();
  });
});

describe("continuous color mapping", () => {
  it("maps numeric field values onto the default diverging colorscale", () => {
    render({ data, colorMapping: { type: "continuous", field: "v" } });

    const { trace } = lastPlotCall();
    expect(trace.marker.color).toEqual([0, 5, 10]);
    expect(trace.marker.colorscale).toEqual(DEFAULT_COLOR_SCALE);
    expect(trace.marker.showscale).toBe(true);
    expect(trace.marker.cmin).toBe(0);
    expect(trace.marker.cmax).toBe(10);
    expect(trace.marker.colorbar).toMatchObject({ title: { text: "v" } });
  });

  it("zeroes non-numeric values and respects explicit min/max and showColorBar", () => {
    const mixed: ScatterPoint[] = [
      { id: 1, x: 0, y: 0, metadata: { v: 4 } },
      { id: 2, x: 1, y: 1, metadata: { v: "bad" } },
    ];
    render({
      data: mixed,
      colorMapping: { type: "continuous", field: "v", min: -10, max: 10, colorScale: "Viridis" },
      showColorBar: false,
    });

    const { trace } = lastPlotCall();
    expect(trace.marker.color).toEqual([4, 0]);
    expect(trace.marker.colorscale).toBe("Viridis");
    expect(trace.marker.showscale).toBe(false);
    expect(trace.marker.cmin).toBe(-10);
    expect(trace.marker.cmax).toBe(10);
  });

  it("falls back to flat token colors for a continuous mapping without a field", () => {
    render({ data, colorMapping: { type: "continuous" } });

    const { trace } = lastPlotCall();
    expect(trace.marker.color).toEqual([COLORS.primary, COLORS.primary, COLORS.primary]);
    expect(trace.marker.cmin).toBeUndefined();
    expect(trace.marker.colorbar).toBeUndefined();
  });
});

describe("click selection", () => {
  it("replaces the selection on plain click and reports the clicked point", () => {
    const onSelectionChange = vi.fn();
    const onPointClick = vi.fn();
    render({ data, onSelectionChange, onPointClick });

    fire("plotly_click", clickEvent(["a", "b", "c"], 1));

    expect(onPointClick).toHaveBeenCalledWith(data[1], expect.objectContaining({ shiftKey: false }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["b"]), "replace");
    // Internal (uncontrolled) state syncs back into Plotly
    expect(lastRestyleCall()).toEqual({ selectedpoints: [[1]] });
  });

  it("adds to the selection on shift-click", () => {
    const onSelectionChange = vi.fn();
    render({ data, onSelectionChange });

    fire("plotly_click", clickEvent(["a", "b", "c"], 0));
    fire("plotly_click", clickEvent(["a", "b", "c"], 2, { shiftKey: true }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["a", "c"]), "add");
    expect(lastRestyleCall()).toEqual({ selectedpoints: [[0, 2]] });
  });

  it("ignores clicks without ids or with unknown ids", () => {
    const onSelectionChange = vi.fn();
    render({ data, onSelectionChange });

    fire("plotly_click", { points: [{ data: {}, pointIndex: 0 }], event: mouseEvent() });
    fire("plotly_click", clickEvent(["nope"], 0));

    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

describe("box/lasso selection", () => {
  it("replaces the selection and restores original (numeric) id types", () => {
    const numericData: ScatterPoint[] = [
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 1 },
    ];
    const onSelectionChange = vi.fn();
    render({ data: numericData, onSelectionChange });

    fire("plotly_selected", {
      points: [
        { data: { ids: ["1", "2"] }, pointIndex: 0 },
        { data: { ids: ["1", "2"] }, pointIndex: 1 },
        // No ids on the trace — dropped from the selection
        { data: {}, pointIndex: 0 },
        // Unknown id — kept as the raw string Plotly reported
        { data: { ids: ["999"] }, pointIndex: 0 },
      ],
    });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set<string | number>([1, 2, "999"]), "replace");
    expect(lastRestyleCall()).toEqual({ selectedpoints: [[0, 1]] });
  });

  it("ignores selection events without points", () => {
    const onSelectionChange = vi.fn();
    render({ data, onSelectionChange });

    fire("plotly_selected");
    fire("plotly_selected", {});

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("clears the selection on deselect", () => {
    const onSelectionChange = vi.fn();
    render({ data, onSelectionChange });

    fire("plotly_click", clickEvent(["a", "b", "c"], 0));
    fire("plotly_deselect");

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(), "replace");
    expect(lastRestyleCall()).toEqual({ selectedpoints: [null] });
  });
});

describe("controlled selection", () => {
  it("syncs the selectedIds prop into Plotly without internal state", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render({ data, selectedIds: new Set(["b"]), onSelectionChange });

    expect(lastRestyleCall()).toEqual({ selectedpoints: [[1]] });

    // Clicking notifies the consumer but does not change the plot until the prop does
    fire("plotly_click", clickEvent(["a", "b", "c"], 2));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["c"]), "replace" satisfies SelectionMode);
    expect(lastRestyleCall()).toEqual({ selectedpoints: [[1]] });

    rerender({ data, selectedIds: new Set(), onSelectionChange });
    expect(lastRestyleCall()).toEqual({ selectedpoints: [null] });
  });

  it("matches numeric selectedIds against string ids via normalization", () => {
    const numericData: ScatterPoint[] = [
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 1 },
    ];
    render({ data: numericData, selectedIds: new Set([2]) });
    expect(lastRestyleCall()).toEqual({ selectedpoints: [[1]] });
  });
});
