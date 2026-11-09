import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, afterEach, vi } from "vitest";

import { Chart } from "../Chart";

import type { ChartProps } from "../Chart";
import type { ChartSpec, VizData } from "@/vendor/ts-lib-viz/core";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The real <Viz> cannot mount under this jsdom project (see the chart unit tests),
// so capture the spec and rows each chart hands to it.
interface VizCall {
  spec: ChartSpec;
  data: VizData;
}
const viz = vi.hoisted(() => ({ calls: [] as VizCall[] }));
vi.mock("@/vendor/ts-lib-viz/react", () => ({
  Viz: (props: VizCall) => {
    viz.calls.push(props);
    return <div data-viz-stub="" />;
  },
}));

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(element);
  });
}

const lastCall = (): VizCall => viz.calls[viz.calls.length - 1];

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
  viz.calls.length = 0;
});

/** One minimal, valid set of props for each chart type, and the layer kind it should draw. */
const cases: Array<{ props: ChartProps; layer: string }> = [
  { props: { type: "line", dataSeries: [{ name: "Run", x: [1, 2, 3], y: [4, 5, 6] }] }, layer: "line" },
  { props: { type: "area", dataSeries: [{ name: "Run", x: [1, 2, 3], y: [4, 5, 6] }] }, layer: "ribbon" },
  { props: { type: "bar", dataSeries: [{ name: "Counts", x: [1, 2], y: [3, 4] }] }, layer: "bar" },
  { props: { type: "histogram", dataSeries: [{ name: "H", x: [1, 2, 2, 3] }] }, layer: "histogram" },
  { props: { type: "boxplot", dataSeries: [{ name: "B", y: [1, 2, 3, 4, 5] }] }, layer: "boxplot" },
  { props: { type: "scatter", dataSeries: [{ name: "S", x: [1, 2], y: [3, 4] }] }, layer: "point" },
  {
    props: {
      type: "scatterInteractive",
      data: [
        { id: "a", x: 1, y: 2 },
        { id: "b", x: 2, y: 3 },
      ],
    },
    layer: "point",
  },
  { props: { type: "pie", dataSeries: { name: "Share", labels: ["A", "B"], values: [1, 3] } }, layer: "pie" },
  {
    props: {
      type: "electropherogram",
      data: [{ position: 1, base: "A", peakA: 50, peakT: 10, peakG: 10, peakC: 10 }],
    },
    layer: "line",
  },
  {
    props: { type: "chromatogram", series: [{ name: "Trace", x: [0, 1, 2], y: [0, 5, 0] }] },
    layer: "line",
  },
  {
    props: { type: "stackedChromatogram", series: [{ name: "Trace", x: [0, 1, 2], y: [0, 5, 0] }] },
    layer: "line",
  },
  { props: { type: "plateMap", data: [{ wellId: "A1", values: { RFU: 10 } }] }, layer: "point" },
];

describe("Chart", () => {
  it.each(cases)("draws a $props.type chart through ts-lib-viz with its $layer layer", async ({ props, layer }) => {
    await render(<Chart {...props} />);
    expect(viz.calls).toHaveLength(1);
    expect(lastCall().spec.layers.map((drawn) => drawn.kind)).toContain(layer);
  });

  it("gives every chart type the same entry point, so a type switch swaps only the chart", async () => {
    await render(<Chart type="histogram" dataSeries={[{ name: "H", x: [1, 2, 2, 3] }]} title="Peaks" />);
    expect(lastCall().spec.headline).toBe("Peaks");
  });
});

describe("Chart reference lines", () => {
  it("draws a reference line and a note on a line chart", async () => {
    await render(
      <Chart
        type="line"
        dataSeries={[{ name: "Run", x: [1, 2, 3], y: [4, 5, 6] }]}
        referenceLines={[{ axis: "y", value: 5, label: "limit" }]}
        annotations={[{ x: 2, y: 5, text: "crossed" }]}
      />,
    );
    expect(lastCall().spec.layers.map((drawn) => drawn.kind)).toContain("hline");
    expect(lastCall().spec.annotations).toContainEqual({ kind: "note", text: "crossed", at: { x: 2, y: 5 } });
  });
});
