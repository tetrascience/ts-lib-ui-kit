import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { LinePlot, lineRows } from "../LinePlot";

import type { LineDataSeries, LinePlotProps } from "../LinePlot";
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

const series: LineDataSeries = { name: "A", x: [1, 2, 3], y: [10, 20, 30] };

describe("lineRows", () => {
  it("collapses the error span to the point itself when there is no error_y", () => {
    expect(lineRows([series])).toEqual([
      { x: 1, y: 10, series: "A", lo: 10, hi: 10 },
      { x: 2, y: 20, series: "A", lo: 20, hi: 20 },
      { x: 3, y: 30, series: "A", lo: 30, hi: 30 },
    ]);
  });

  it("spans y plus or minus the per-point error when error_y is visible", () => {
    const rows = lineRows([{ ...series, error_y: { type: "data", array: [1, 2, 3], visible: true } }]);
    expect(rows.map((row) => [row.lo, row.hi])).toEqual([
      [9, 11],
      [18, 22],
      [27, 33],
    ]);
  });

  it("ignores error_y when it is hidden", () => {
    const rows = lineRows([{ ...series, error_y: { type: "data", array: [5, 5, 5], visible: false } }]);
    expect(rows.every((row) => row.lo === row.y && row.hi === row.y)).toBe(true);
  });

  it("treats a missing error entry as zero rather than NaN", () => {
    const rows = lineRows([{ ...series, error_y: { type: "data", array: [4], visible: true } }]);
    expect(rows[0]).toMatchObject({ lo: 6, hi: 14 });
    expect(rows[1]).toMatchObject({ lo: 20, hi: 20 });
  });

  it("keeps each series' name on its rows", () => {
    const rows = lineRows([series, { name: "B", x: [1], y: [5] }]);
    expect(rows.map((row) => row.series)).toEqual(["A", "A", "A", "B"]);
  });
});

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(props: LinePlotProps) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<LinePlot {...props} />);
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

describe("LinePlot variants", () => {
  it("draws only a line for the lines variant", async () => {
    await render({ dataSeries: [series], variant: "lines" });
    expect(lastCall().spec.layers.map((layer) => layer.kind)).toEqual(["line"]);
  });

  it("adds markers for the lines+markers variant", async () => {
    await render({ dataSeries: [series], variant: "lines+markers" });
    expect(lastCall().spec.layers.map((layer) => layer.kind)).toEqual(["line", "point"]);
  });

  it("adds an errorbar from lo to hi for the lines+markers+error_bars variant", async () => {
    await render({ dataSeries: [series], variant: "lines+markers+error_bars" });
    const { layers } = lastCall().spec;
    expect(layers.map((layer) => layer.kind)).toEqual(["line", "point", "errorbar"]);
    expect(layers[2].aes).toMatchObject({ ymin: "lo", ymax: "hi" });
  });

  it("defaults to the lines variant", async () => {
    await render({ dataSeries: [series] });
    expect(lastCall().spec.layers.map((layer) => layer.kind)).toEqual(["line"]);
  });

  it("does not add an errorbar when error_y is given but the variant is not error_bars", async () => {
    await render({
      dataSeries: [{ ...series, error_y: { type: "data", array: [1, 1, 1], visible: true } }],
      variant: "lines+markers",
    });
    expect(lastCall().spec.layers.map((layer) => layer.kind)).not.toContain("errorbar");
  });
});

describe("LinePlot spec", () => {
  it("hands the flattened rows to Viz with the stated size", async () => {
    await render({ dataSeries: [series], width: 600, height: 400 });
    expect(lastCall().data).toEqual(lineRows([series]));
    expect(lastCall().spec.width).toBe(600);
    expect(lastCall().spec.height).toBe(400);
  });

  it("sets the headline, axis titles and ranges on the spec", async () => {
    await render({
      dataSeries: [series],
      title: "Growth",
      xTitle: "Day",
      yTitle: "Signal",
      xRange: [0, 5],
      yRange: [0, 40],
    });
    const { headline, scales } = lastCall().spec;
    expect(headline).toBe("Growth");
    expect(scales?.x).toMatchObject({ title: "Day", limits: [0, 5] });
    expect(scales?.y).toMatchObject({ title: "Signal", limits: [0, 40] });
  });

  it("maps line x and y to the series color", async () => {
    await render({ dataSeries: [series] });
    expect(lastCall().spec.layers[0].aes).toMatchObject({ x: "x", y: "y", color: "series" });
  });

  it("replaces numeric x ticks with categorical labels", async () => {
    await render({ dataSeries: [series], xTickText: ["Mon", "Tue", "Wed"] });
    expect(lastCall().spec.scales?.x).toMatchObject({
      breaks: [1, 2, 3],
      labels: { "1": "Mon", "2": "Tue", "3": "Wed" },
    });
  });

  it("leaves x breaks unset without xTickText", async () => {
    await render({ dataSeries: [series] });
    expect(lastCall().spec.scales?.x).not.toHaveProperty("breaks");
  });
});
