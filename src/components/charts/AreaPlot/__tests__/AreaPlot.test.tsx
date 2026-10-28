import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { AreaPlot, areaRows } from "../AreaPlot";

import type { AreaDataSeries, AreaPlotProps } from "../AreaPlot";
import type { ChartSpec, Palettes, VizData } from "@tetrascience-npm/ts-lib-viz/core";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ts-lib-viz resolves its own copy of React when it is linked into this repo,
// so the real <Viz> cannot mount under this jsdom project. The adapter's
// contract is the spec and rows it hands to <Viz>, so capture those instead.
interface VizCall {
  spec: ChartSpec;
  data: VizData;
  palettes?: Palettes;
}
const viz = vi.hoisted(() => ({ calls: [] as VizCall[] }));
vi.mock("@tetrascience-npm/ts-lib-viz/react", () => ({
  Viz: (props: VizCall) => {
    viz.calls.push(props);
    return <div data-viz-stub="" />;
  },
}));

const dataSeries: AreaDataSeries[] = [
  { name: "Series 1", x: [0, 1, 2], y: [10, 18, 14] },
  { name: "Series 2", x: [0, 1, 2], y: [3, 4, 5] },
];

describe("areaRows", () => {
  it("draws each series from a zero baseline to its value in the normal variant", () => {
    expect(areaRows([dataSeries[0]], "normal")).toEqual([
      { x: 0, y: 10, series: "Series 1", lo: 0, hi: 10 },
      { x: 1, y: 18, series: "Series 1", lo: 0, hi: 18 },
      { x: 2, y: 14, series: "Series 1", lo: 0, hi: 14 },
    ]);
  });

  it("stacks each series on the running top of the series before it, per x", () => {
    const second = areaRows(dataSeries, "stacked").filter((row) => row.series === "Series 2");
    expect(second.map((row) => [row.x, row.lo, row.hi])).toEqual([
      [0, 10, 13],
      [1, 18, 22],
      [2, 14, 19],
    ]);
  });

  it("keeps the series' own y on stacked rows so tooltips show the value, not the sum", () => {
    const row = areaRows(dataSeries, "stacked").find(
      (candidate) => candidate.series === "Series 2" && candidate.x === 0,
    );
    expect(row?.y).toBe(3);
  });

  it("returns no rows when there are no series", () => {
    expect(areaRows([], "stacked")).toEqual([]);
  });
});

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(props: AreaPlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<AreaPlot {...props} />);
  });
  return container;
}

function lastCall(): VizCall {
  const call = viz.calls.at(-1);
  if (!call) throw new Error("Viz was not rendered");
  return call;
}

beforeEach(() => {
  viz.calls.length = 0;
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
});

describe("AreaPlot spec", () => {
  it("mounts a Viz host and hands it the flattened rows", async () => {
    const container = await render({ dataSeries, width: 800, height: 400 });
    expect(container.querySelector("[data-viz-stub]")).not.toBeNull();
    expect(lastCall().data).toEqual(areaRows(dataSeries, "normal"));
  });

  it("states the stated width and height on the spec", async () => {
    await render({ dataSeries, width: 800, height: 400 });
    expect(lastCall().spec.width).toBe(800);
    expect(lastCall().spec.height).toBe(400);
  });

  it("leaves width and height off the spec when the chart fills its container", async () => {
    await render({ dataSeries });
    expect(lastCall().spec).not.toHaveProperty("width");
    expect(lastCall().spec).not.toHaveProperty("height");
  });

  it("sets the headline from title and leaves it absent without one", async () => {
    await render({ dataSeries, title: "Throughput" });
    expect(lastCall().spec.headline).toBe("Throughput");

    await render({ dataSeries });
    expect(lastCall().spec.headline).toBeUndefined();
  });

  it("maps xTitle, yTitle and the ranges onto the scales", async () => {
    await render({
      dataSeries,
      xTitle: "Columns",
      yTitle: "Rows",
      xRange: [0, 10],
      yRange: [0, 50],
    });
    const { scales } = lastCall().spec;
    expect(scales?.x).toMatchObject({ title: "Columns", limits: [0, 10] });
    expect(scales?.y).toMatchObject({ title: "Rows", limits: [0, 50] });
  });

  it("builds a ribbon from lo to hi with a line on top, colored by series", async () => {
    await render({ dataSeries, variant: "stacked" });
    const { layers } = lastCall().spec;
    expect(layers.map((layer) => layer.kind)).toEqual(["ribbon", "line"]);
    expect(layers[0].aes).toMatchObject({ x: "x", ymin: "lo", ymax: "hi", fill: "series" });
    expect(layers[1].aes).toMatchObject({ x: "x", y: "hi", color: "series" });
  });

  it("replaces numeric x ticks with the given labels, in order of the unique x values", async () => {
    await render({ dataSeries, xTickText: ["Mon", "Tue", "Wed"] });
    expect(lastCall().spec.scales?.x).toMatchObject({
      breaks: [0, 1, 2],
      labels: { "0": "Mon", "1": "Tue", "2": "Wed" },
    });
  });

  it("falls back to the numeric value for x ticks that have no label", async () => {
    await render({ dataSeries, xTickText: ["Mon"] });
    expect(lastCall().spec.scales?.x).toMatchObject({
      labels: { "0": "Mon", "1": "1", "2": "2" },
    });
  });

  it("leaves x breaks and labels unset without xTickText", async () => {
    await render({ dataSeries });
    const x = lastCall().spec.scales?.x;
    expect(x).not.toHaveProperty("breaks");
    expect(x).not.toHaveProperty("labels");
  });

  it("colors each series from the palette in order, honoring a per-series color", async () => {
    await render({
      dataSeries: [
        { name: "A", x: [0], y: [1], color: "#ff0000" },
        { name: "B", x: [0], y: [2] },
      ],
    });
    const palettes = lastCall().palettes;
    expect(palettes?.categorical(0)).toBe("#ff0000");
    expect(palettes?.categoricalSize).toBe(2);
  });
});
