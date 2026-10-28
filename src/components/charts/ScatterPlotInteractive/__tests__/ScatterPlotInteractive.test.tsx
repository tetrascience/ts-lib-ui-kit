import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { COLORS, DEFAULT_MARKER_SIZE } from "../constants";
import { ScatterPlotInteractive } from "../ScatterPlotInteractive";

import type { ScatterPlotInteractiveProps, ScatterPoint, SelectionMode } from "../types";
import type { Brushed, Selected } from "@tetrascience-npm/ts-lib-viz/core";
import type { Viz } from "@tetrascience-npm/ts-lib-viz/react";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ts-lib-viz resolves its own copy of React when it runs under Vitest's jsdom
// project, so the real Viz hits an invalid hook call here. The chart is
// replaced with a stub that records the spec, data and gesture callbacks that
// ScatterPlotInteractive hands it. Tests then drive those callbacks the way Viz
// would after a click or a brush. Real drawing and gestures are covered by the
// Storybook play functions.
type VizProps = React.ComponentProps<typeof Viz>;
const vizCalls = vi.hoisted(() => ({ props: [] as VizProps[] }));
vi.mock("@tetrascience-npm/ts-lib-viz/react", async () => {
  const ReactModule = await import("react");
  return {
    Viz: (props: VizProps) => {
      vizCalls.props.push(props);
      return ReactModule.createElement("div", { "data-testid": "viz-stub" });
    },
  };
});

const data: ScatterPoint[] = [
  { id: "a", x: 1, y: 10, label: "Point A", metadata: { group: "g1", v: 0 } },
  { id: "b", x: 2, y: 20, metadata: { group: "g2", v: 5 } },
  { id: "c", x: 3, y: 30, metadata: { group: "g1", v: 10 } },
];

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(props: ScatterPlotInteractiveProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<ScatterPlotInteractive {...props} />);
  });
  return {
    container,
    rerender: async (nextProps: ScatterPlotInteractiveProps) => {
      await act(async () => {
        root.render(<ScatterPlotInteractive {...nextProps} />);
      });
    },
  };
}

/** The props of the most recent chart draw. */
function lastViz(): VizProps {
  const props = vizCalls.props.at(-1);
  if (!props) throw new Error("Viz was never rendered");
  return props;
}

type Modifiers = Partial<{ shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }>;

/** A pointerdown on the chart wrapper, which is where the component reads modifier keys. */
function pressOn(container: HTMLElement, modifiers: Modifiers = {}) {
  const wrapper = container.firstElementChild as HTMLElement;
  act(() => {
    wrapper.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, ...modifiers }));
  });
}

function clickSelected(keys: string[]): Selected {
  return { layerId: "points", kind: "point", datum: null, rows: keys.map((_, i) => i), keys, predicate: null };
}

function brushed(shape: "box" | "lasso", keys: string[]): Brushed {
  return {
    shape,
    region: [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ],
    rows: keys.map((_, i) => i),
    keys,
    predicate: null,
  };
}

function fireSelect(selected: Selected | null) {
  act(() => {
    lastViz().onSelect?.(selected);
  });
}

function fireBrush(region: Brushed | null) {
  act(() => {
    lastViz().onBrush?.(region);
  });
}

beforeEach(() => {
  vizCalls.props.length = 0;
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
  it("hands the chart one point layer keyed by each record's id", async () => {
    await render({ data, title: "My Scatter" });

    const { spec, data: rows, keyField } = lastViz();
    expect(keyField).toBe("key");
    expect(rows).toEqual([
      expect.objectContaining({ key: "a", x: 1, y: 10, label: "Point A" }),
      expect.objectContaining({ key: "b", x: 2, y: 20, label: "b" }),
      expect.objectContaining({ key: "c", x: 3, y: 30, label: "c" }),
    ]);
    expect(spec.headline).toBe("My Scatter");
    expect(spec.layers).toHaveLength(1);
    expect(spec.layers[0].kind).toBe("point");
    expect(spec.layers[0].aes).toMatchObject({ x: "x", y: "y" });
    // No size mapping is set, so the marker size is left to the chart default.
    expect(spec.layers[0].style?.size).toBeUndefined();
  });

  it("uses a static color for the layer when no color mapping is set", async () => {
    await render({ data, colorMapping: { type: "static", value: COLORS.primary } });
    expect(lastViz().spec.layers[0].style?.color).toBe(COLORS.primary);
  });

  it("mounts with no rows and still declares the point layer", async () => {
    await render({ data: [] });
    expect(lastViz().data).toEqual([]);
    expect(lastViz().spec.layers[0].kind).toBe("point");
  });

  it("maps axis titles, explicit ranges and log scales onto the spec", async () => {
    await render({
      data,
      xAxis: { title: "Time (s)", range: [0, 5] },
      yAxis: { scale: "log" },
    });

    const { spec } = lastViz();
    expect(spec.scales?.x).toMatchObject({ title: "Time (s)", limits: [0, 5] });
    expect(spec.scales?.y?.transform).toBe("log10");
    expect(spec.scales?.y?.limits).toBeUndefined();
  });

  it("writes tooltip fields into the chart rows, reading metadata by name", async () => {
    await render({ data, tooltip: { fields: ["group", "v"] } });
    expect(lastViz().data[0]).toMatchObject({ key: "a", group: "g1", v: 0 });
    expect(lastViz().data[1]).toMatchObject({ key: "b", group: "g2", v: 5 });
  });

  it("does not let a tooltip field overwrite a chart column", async () => {
    await render({ data, tooltip: { fields: ["x", "label"] } });
    expect(lastViz().data[1]).toMatchObject({ key: "b", x: 2, label: "b" });
  });

  it("uses the tooltip fields, defaulting to the label", async () => {
    await render({ data });
    expect(lastViz().spec.tooltip).toEqual(["label"]);

    await render({ data, tooltip: { fields: ["group", "v"] } });
    expect(lastViz().spec.tooltip).toEqual(["group", "v"]);
  });

  it("passes a stated width and height into the spec", async () => {
    await render({ data, width: 500, height: 300 });
    expect(lastViz().spec.width).toBe(500);
    expect(lastViz().spec.height).toBe(300);
  });

  it("appends a custom className to the wrapper", async () => {
    const { container } = await render({ data, className: "custom" });
    expect(container.querySelector(".custom")).not.toBeNull();
  });

  it("downsamples the plotted rows when configured", async () => {
    const many: ScatterPoint[] = Array.from({ length: 20 }, (_, i) => ({ id: i, x: i, y: i % 7 }));
    await render({ data: many, downsampling: { enabled: true, maxPoints: 5 } });
    expect(lastViz().data).toHaveLength(5);
  });
});

describe("brush mode", () => {
  it("uses lasso when both box and lasso are enabled, since lasso wins", async () => {
    await render({ data, enableBoxSelection: true, enableLassoSelection: true });
    expect(lastViz().brush).toBe("lasso");
  });

  it("uses box when only box selection is enabled", async () => {
    await render({ data, enableBoxSelection: true, enableLassoSelection: false });
    expect(lastViz().brush).toBe("box");
  });

  it("uses lasso when only lasso is enabled", async () => {
    await render({ data, enableBoxSelection: false, enableLassoSelection: true });
    expect(lastViz().brush).toBe("lasso");
  });

  it("disables the brush when neither box nor lasso is enabled (the defaults)", async () => {
    await render({ data });
    expect(lastViz().brush).toBeUndefined();
  });
});

describe("click selection", () => {
  it("replaces the selection on a plain click and reports the clicked point", async () => {
    const onSelectionChange = vi.fn();
    const onPointClick = vi.fn();
    const { container } = await render({
      data,
      enableClickSelection: true,
      onSelectionChange,
      onPointClick,
    });

    pressOn(container);
    fireSelect(clickSelected(["b"]));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["b"]), "replace");
    expect(onPointClick).toHaveBeenCalledWith(data[1], expect.objectContaining({ type: "pointerdown" }));
  });

  it("adds to the selection on shift-click", async () => {
    const onSelectionChange = vi.fn();
    const { container } = await render({
      data,
      enableClickSelection: true,
      selectedIds: new Set(["a"]),
      onSelectionChange,
    });

    pressOn(container, { shiftKey: true });
    fireSelect(clickSelected(["c"]));

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["a", "c"]), "add");
  });

  it("removes from the selection on ctrl-click and on meta-click", async () => {
    const onSelectionChange = vi.fn();
    const { container } = await render({
      data,
      enableClickSelection: true,
      selectedIds: new Set(["a", "b"]),
      onSelectionChange,
    });

    pressOn(container, { ctrlKey: true });
    fireSelect(clickSelected(["a"]));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["b"]), "remove");

    pressOn(container, { metaKey: true });
    fireSelect(clickSelected(["b"]));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["a"]), "remove");
  });

  it("toggles on shift and ctrl together", async () => {
    const onSelectionChange = vi.fn();
    const { container } = await render({
      data,
      enableClickSelection: true,
      selectedIds: new Set(["a"]),
      onSelectionChange,
    });

    pressOn(container, { shiftKey: true, ctrlKey: true });
    fireSelect(clickSelected(["a"]));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set<string>(), "toggle" satisfies SelectionMode);
  });

  it("keeps numeric ids as numbers in the selection", async () => {
    const numeric: ScatterPoint[] = [
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 1 },
    ];
    const onSelectionChange = vi.fn();
    await render({ data: numeric, enableClickSelection: true, onSelectionChange });

    fireSelect(clickSelected(["2"]));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([2]), "replace");
  });

  it("clears the selection when a click lands on empty plot area", async () => {
    const onSelectionChange = vi.fn();
    await render({ data, enableClickSelection: true, selectedIds: new Set(["a", "b"]), onSelectionChange });
    fireSelect(null);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(), "replace");
  });

  it("does nothing on a click when click selection is off", async () => {
    const onSelectionChange = vi.fn();
    await render({ data, enableClickSelection: false, onSelectionChange });
    fireSelect(clickSelected(["a"]));
    fireSelect(null);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

describe("box and lasso selection", () => {
  it("reports the brushed records as a replace selection", async () => {
    const onSelectionChange = vi.fn();
    await render({ data, enableBoxSelection: true, onSelectionChange });

    fireBrush(brushed("box", ["a", "c"]));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["a", "c"]), "replace");
  });

  it("uses the modifier keys held when the brush starts", async () => {
    const onSelectionChange = vi.fn();
    const { container } = await render({
      data,
      enableLassoSelection: true,
      selectedIds: new Set(["b"]),
      onSelectionChange,
    });

    pressOn(container, { shiftKey: true });
    fireBrush(brushed("lasso", ["a"]));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["a", "b"]), "add");
  });

  it("ignores a brush that has been cleared", async () => {
    const onSelectionChange = vi.fn();
    await render({ data, enableBoxSelection: true, onSelectionChange });
    fireBrush(null);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

describe("controlled selection", () => {
  it("draws the selectedIds prop as an extra highlighted layer over the points", async () => {
    await render({ data, selectedIds: new Set(["b"]) });

    const { spec } = lastViz();
    expect(spec.layers).toHaveLength(2);
    const [highlight] = spec.layers;
    expect(highlight.kind).toBe("point");
    expect(highlight.data).toEqual([expect.objectContaining({ key: "b", x: 2, y: 20 })]);
    expect(highlight.style?.size).toBe(DEFAULT_MARKER_SIZE + 6);
  });

  it("matches numeric selectedIds against string ids", async () => {
    const numeric: ScatterPoint[] = [
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 1 },
    ];
    await render({ data: numeric, selectedIds: new Set([2]) });
    expect(lastViz().spec.layers[0].data).toEqual([expect.objectContaining({ key: "2" })]);
  });

  it("notifies the consumer on click without changing the drawn selection until the prop does", async () => {
    const onSelectionChange = vi.fn();
    const { container, rerender } = await render({
      data,
      enableClickSelection: true,
      selectedIds: new Set(["b"]),
      onSelectionChange,
    });

    pressOn(container);
    fireSelect(clickSelected(["c"]));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["c"]), "replace");
    expect(lastViz().spec.layers).toHaveLength(2);
    expect(lastViz().spec.layers[0].data).toEqual([expect.objectContaining({ key: "b" })]);

    await rerender({ data, enableClickSelection: true, selectedIds: new Set(), onSelectionChange });
    expect(lastViz().spec.layers).toHaveLength(1);
  });
});

describe("continuous color mapping", () => {
  it("scales the color legend to the data range when no min and max are given", async () => {
    await render({ data, colorMapping: { type: "continuous", field: "v" } });

    const { spec, data: rows } = lastViz();
    expect(rows.map((row) => row.color)).toEqual([0, 5, 10]);
    expect(spec.scales?.color).toMatchObject({ title: "v", limits: [0, 10] });
  });

  it("uses explicit min and max for the color scale", async () => {
    await render({
      data,
      colorMapping: { type: "continuous", field: "v", min: -10, max: 10 },
    });
    expect(lastViz().spec.scales?.color?.limits).toEqual([-10, 10]);
  });

  it("coerces a non-numeric color value to NaN", async () => {
    const mixed: ScatterPoint[] = [
      { id: 1, x: 0, y: 0, metadata: { v: 4 } },
      { id: 2, x: 1, y: 1, metadata: { v: "bad" } },
    ];
    await render({ data: mixed, colorMapping: { type: "continuous", field: "v" } });
    expect(lastViz().data.map((row) => row.color)).toEqual([4, NaN]);
  });

  it("colors categories with the categorical palette in order", async () => {
    await render({
      data,
      colorMapping: { type: "categorical", field: "group", categoryColors: { g2: "#abcdef" } },
    });
    // Categories sort to g1, g2. The palette follows that order.
    expect(lastViz().palettes?.categorical(0)).not.toBe("#abcdef");
    expect(lastViz().palettes?.categorical(1)).toBe("#abcdef");
  });
});
