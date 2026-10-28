import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ScatterPlot } from "../ScatterPlot";

import type { ScatterPlotProps } from "../ScatterPlot";
import type { Viz } from "@tetrascience-npm/ts-lib-viz/react";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ts-lib-viz resolves its own copy of React when it runs under Vitest's jsdom
// project, so the real Viz hits an invalid hook call here. The chart is
// replaced with a stub that records the spec and data VizChart hands it. The
// real drawing is covered by the Storybook play functions.
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

const roots: Array<{ root: Root; container: HTMLElement }> = [];

const dataSeries: ScatterPlotProps["dataSeries"] = [{ name: "A", x: [1, 2, 3], y: [10, 20, 30] }];

async function render(props: ScatterPlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<ScatterPlot {...props} />);
  });
  return container;
}

/** The props of the most recent chart draw. */
function lastViz(): VizProps {
  const props = vizCalls.props.at(-1);
  if (!props) throw new Error("Viz was never rendered");
  return props;
}

beforeEach(() => {
  vizCalls.props.length = 0;
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});

describe("ScatterPlot rendering", () => {
  it("mounts and hands the chart a headline and axis titles", async () => {
    await render({ dataSeries, title: "Growth", xTitle: "Time (h)", yTitle: "OD600", width: 600, height: 400 });

    const { spec } = lastViz();
    expect(spec.headline).toBe("Growth");
    expect(spec.scales?.x?.title).toBe("Time (h)");
    expect(spec.scales?.y?.title).toBe("OD600");
  });

  it("passes a stated width and height into the chart spec", async () => {
    await render({ dataSeries, width: 600, height: 400 });
    expect(lastViz().spec.width).toBe(600);
    expect(lastViz().spec.height).toBe(400);
  });

  it("omits the spec size and fills the container when no size is given", async () => {
    const container = await render({ dataSeries });
    const { spec } = lastViz();
    expect(spec.width).toBeUndefined();
    expect(spec.height).toBeUndefined();
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("100%");
    expect(wrapper.style.height).toBe("100%");
  });

  it("applies the x and y ranges as scale limits", async () => {
    await render({ dataSeries, xRange: [0, 10], yRange: [-1, 1] });
    expect(lastViz().spec.scales?.x?.limits).toEqual([0, 10]);
    expect(lastViz().spec.scales?.y?.limits).toEqual([-1, 1]);
  });
});

describe("ScatterPlot series handling", () => {
  it("draws every point as a point layer colored by series name", async () => {
    await render({
      dataSeries: [
        { name: "A", x: [1, 2], y: [3, 4] },
        { name: "B", x: [5], y: [6] },
      ],
    });

    const { spec, data } = lastViz();
    expect(spec.layers).toHaveLength(1);
    expect(spec.layers[0].kind).toBe("point");
    expect(spec.layers[0].aes).toMatchObject({ x: "x", y: "y", color: "series" });
    expect(spec.layers[0].aes.shape).toBeUndefined();
    expect(data).toEqual([
      { x: 1, y: 3, series: "A" },
      { x: 2, y: 4, series: "A" },
      { x: 5, y: 6, series: "B" },
    ]);
  });

  it("accepts a single series object", async () => {
    await render({ dataSeries: { name: "Solo", x: [1, 2], y: [3, 4] } });
    expect(lastViz().data).toEqual([
      { x: 1, y: 3, series: "Solo" },
      { x: 2, y: 4, series: "Solo" },
    ]);
  });

  it("maps series to marker shape only in the stacked variant", async () => {
    await render({ dataSeries, variant: "stacked" });
    expect(lastViz().spec.layers[0].aes).toMatchObject({ color: "series", shape: "series" });
  });

  it("uses markerSize for the point layer, defaulting to 10", async () => {
    await render({ dataSeries });
    expect(lastViz().spec.layers[0].style?.size).toBe(10);

    await render({ dataSeries, markerSize: 14 });
    expect(lastViz().spec.layers[0].style?.size).toBe(14);
  });

  it("uses a per-series color override as that series' palette entry", async () => {
    await render({
      dataSeries: [
        { name: "A", x: [1], y: [1], color: "#123456" },
        { name: "B", x: [2], y: [2] },
      ],
    });
    const { palettes } = lastViz();
    expect(palettes?.categorical(0)).toBe("#123456");
    expect(palettes?.categorical(1)).not.toBe("#123456");
  });

  it("does not carry per-series symbol or size overrides into the chart", async () => {
    // Documents the Plotly-era overrides that ts-lib-viz does not take. The
    // series' size and symbol are ignored, and the shared markerSize applies.
    await render({
      variant: "stacked",
      markerSize: 12,
      dataSeries: [{ name: "A", x: [1], y: [1], symbol: "star", size: 20 }],
    });
    const { spec, data } = lastViz();
    expect(spec.layers[0].style?.size).toBe(12);
    expect(data[0]).toEqual({ x: 1, y: 1, series: "A" });
  });
});
