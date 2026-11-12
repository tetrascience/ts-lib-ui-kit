import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, afterEach, vi } from "vitest";

import { Chart } from "../Chart";
import { controlChartMarks } from "../kinds/LinePlot";

import type { ChartSpec, VizData } from "@/vendor/ts-lib-viz/core";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The real <Viz> cannot mount under this jsdom project, so capture the spec and rows
// each line chart hands to it, as Chart.test.tsx does.
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

describe("controlChartMarks", () => {
  it("draws the centre line and the default bands at 1, 2 and 3 sigma", () => {
    const { bands, lines } = controlChartMarks({ center: 100, sigma: 5 });
    expect(bands).toEqual([
      { multiple: 3, lo: 85, hi: 115 },
      { multiple: 2, lo: 90, hi: 110 },
      { multiple: 1, lo: 95, hi: 105 },
    ]);
    expect(lines.map((line) => [line.label, line.value])).toEqual([
      ["Mean", 100],
      ["+1σ", 105],
      ["-1σ", 95],
      ["+2σ", 110],
      ["-2σ", 90],
      ["+3σ", 115],
      ["-3σ", 85],
    ]);
  });

  it("marks the sigma lines dashed, and the centre line in the theme ink", () => {
    const { lines } = controlChartMarks({ center: 0, sigma: 1, bands: [2] });
    expect(lines[0]).toEqual({ axis: "y", value: 0, label: "Mean" });
    expect(lines[1]).toMatchObject({ linetype: "dashed", color: "#737373" });
  });

  it("uses the stated centre label", () => {
    const { lines } = controlChartMarks({ center: 1, sigma: 1, bands: [], centerLabel: "Target" });
    expect(lines).toEqual([{ axis: "y", value: 1, label: "Target" }]);
  });

  it("takes the bands the caller states, once each, widest first", () => {
    const { bands } = controlChartMarks({ center: 0, sigma: 1, bands: [1, 2, 2, 0.5] });
    expect(bands.map((band) => band.multiple)).toEqual([2, 1, 0.5]);
  });

  it("drops bands that are not positive finite multiples", () => {
    const { bands, lines } = controlChartMarks({ center: 0, sigma: 1, bands: [0, -1, Number.NaN, 1] });
    expect(bands.map((band) => band.multiple)).toEqual([1]);
    expect(lines).toHaveLength(3);
  });

  it("draws the centre line alone when sigma is not positive", () => {
    expect(controlChartMarks({ center: 4, sigma: 0 })).toEqual({
      bands: [],
      lines: [{ axis: "y", value: 4, label: "Mean" }],
    });
    expect(controlChartMarks({ center: 4, sigma: Number.POSITIVE_INFINITY }).bands).toEqual([]);
  });

  it("draws nothing without a finite centre", () => {
    expect(controlChartMarks()).toEqual({ bands: [], lines: [] });
    expect(controlChartMarks({ center: Number.NaN, sigma: 1 })).toEqual({ bands: [], lines: [] });
  });
});

describe("Chart control chart", () => {
  const series = [
    { name: "Run A", x: [1, 2, 3], y: [98, 101, 103] },
    { name: "Run B", x: [1, 2, 3], y: [99, 100, 97] },
  ];

  it("draws three ribbon bands behind the series, spanning the x range", async () => {
    await render(<Chart type="line" dataSeries={series} controlChart={{ center: 100, sigma: 2 }} />);
    const layers = lastCall().spec.layers;
    const ribbons = layers.filter((layer) => layer.kind === "ribbon");
    expect(ribbons).toHaveLength(3);
    expect(ribbons[0].data).toEqual([
      { x: 1, ymin: 94, ymax: 106 },
      { x: 3, ymin: 94, ymax: 106 },
    ]);
    // Bands sit before the series, so the series draws over them.
    const firstLine = layers.findIndex((layer) => layer.kind === "line");
    const lastRibbon = layers.map((layer) => layer.kind).lastIndexOf("ribbon");
    expect(lastRibbon).toBeLessThan(firstLine);
  });

  it("draws the centre and sigma lines as reference lines", async () => {
    await render(<Chart type="line" dataSeries={series} controlChart={{ center: 100, sigma: 2, bands: [1] }} />);
    const hlines = lastCall().spec.layers.filter((layer) => layer.kind === "hline");
    // A reference line keeps its text as the row it draws from.
    const texts = hlines.map((line) => (line.data as Array<{ label?: string }> | undefined)?.[0]?.label);
    expect(texts).toEqual(["Mean", "+1σ", "-1σ"]);
  });

  it("keeps the caller's own reference lines after the control lines", async () => {
    await render(
      <Chart
        type="line"
        dataSeries={series}
        controlChart={{ center: 100, sigma: 2, bands: [] }}
        referenceLines={[{ axis: "y", value: 110, label: "limit" }]}
      />,
    );
    const hlines = lastCall().spec.layers.filter((layer) => layer.kind === "hline");
    expect(hlines).toHaveLength(2);
  });

  it("adds no bands when the line chart has no control chart", async () => {
    await render(<Chart type="line" dataSeries={series} />);
    expect(lastCall().spec.layers.some((layer) => layer.kind === "ribbon")).toBe(false);
    expect(lastCall().spec.layers.some((layer) => layer.kind === "hline")).toBe(false);
  });
});
