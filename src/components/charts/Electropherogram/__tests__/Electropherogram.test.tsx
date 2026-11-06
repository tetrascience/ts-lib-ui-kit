import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, afterEach, vi } from "vitest";

import { Electropherogram } from "../Electropherogram";

import type { ChartSpec, Palettes, VizData } from "@/vendor/ts-lib-viz/core";
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
  return container;
}

const lastCall = (): VizCall => viz.calls[viz.calls.length - 1];

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
  viz.calls.length = 0;
});

describe("Electropherogram", () => {
  it("renders an empty-state message and does not mount the chart when data is empty", async () => {
    const container = await render(<Electropherogram data={[]} />);
    expect(container.textContent).toContain("No data available");
    expect(viz.calls).toHaveLength(0);
  });

  it("hands one row per position to the chart, with the four trace heights", async () => {
    await render(
      <Electropherogram
        data={[
          { position: 1, base: "A", peakA: 50, peakT: 10, peakG: 10, peakC: 10 },
          { position: 2, base: "T", peakA: 10, peakT: 50, peakG: 10, peakC: 10 },
        ]}
      />,
    );
    expect(lastCall().data).toEqual([
      expect.objectContaining({
        position: 1,
        peakA: 50,
        peakT: 10,
        letterA: "A",
        letterT: "",
        letterG: "",
        letterC: "",
      }),
      expect.objectContaining({
        position: 2,
        peakA: 10,
        peakT: 50,
        letterA: "",
        letterT: "T",
        letterG: "",
        letterC: "",
      }),
    ]);
  });

  it("draws one line per base in its own colour, with the letters in the same colours", async () => {
    await render(
      <Electropherogram
        data={[{ position: 1, base: "A", peakA: 50, peakT: 10, peakG: 10, peakC: 10 }]}
        colorA="#111111"
        colorT="#222222"
        colorG="#333333"
        colorC="#444444"
      />,
    );
    const layers = lastCall().spec.layers;
    const lines = layers.filter((layer) => layer.kind === "line");
    const letters = layers.filter((layer) => layer.kind === "text");
    expect(lines.map((layer) => layer.style?.color)).toEqual(["#111111", "#222222", "#333333", "#444444"]);
    expect(letters.map((layer) => [layer.aes.label, layer.style?.color])).toEqual([
      ["letterA", "#111111"],
      ["letterT", "#222222"],
      ["letterG", "#333333"],
      ["letterC", "#444444"],
    ]);
  });

  it("labels each position with the base the item states, not the one its peaks suggest", async () => {
    await render(<Electropherogram data={[{ position: 5, base: "G", peakA: 90, peakT: 5, peakG: 5, peakC: 5 }]} />);
    expect(lastCall().data[0]).toMatchObject({ letterG: "G", letterA: "" });
  });

  it("infers the base from the tallest peak when the item states none", async () => {
    await render(<Electropherogram data={[{ position: 5, peakA: 5, peakT: 5, peakG: 40, peakC: 5 }]} />);
    expect(lastCall().data[0]).toMatchObject({ letterG: "G" });
  });

  it("leaves a position unlabelled when every peak is equal", async () => {
    await render(<Electropherogram data={[{ position: 5, peakA: 10, peakT: 10, peakG: 10, peakC: 10 }]} />);
    expect(lastCall().data[0]).toMatchObject({ letterA: "", letterT: "", letterG: "", letterC: "" });
  });

  it("sets position ticks at the interval the caller asks for", async () => {
    await render(
      <Electropherogram
        positionInterval={5}
        data={[
          { position: 11, base: "A", peakA: 10, peakT: 0, peakG: 0, peakC: 0 },
          { position: 24, base: "T", peakA: 0, peakT: 10, peakG: 0, peakC: 0 },
        ]}
      />,
    );
    const xScale = lastCall().spec.scales?.x;
    expect(xScale?.breaks).toEqual([15, 20]);
  });

  it("curves each trace through every peak it was given", async () => {
    await render(
      <Electropherogram
        data={[
          { position: 1, base: "A", peakA: 0, peakT: 0, peakG: 0, peakC: 0 },
          { position: 2, base: "A", peakA: 50, peakT: 0, peakG: 0, peakC: 0 },
          { position: 3, base: "A", peakA: 20, peakT: 0, peakG: 0, peakC: 0 },
        ]}
      />,
    );
    const trace = lastCall().spec.layers.find((layer) => layer.kind === "line");
    const curve = (trace?.data ?? []) as Array<{ x: number; y: number }>;
    for (const [x, y] of [
      [1, 0],
      [2, 50],
      [3, 20],
    ]) {
      expect(curve).toContainEqual({ x, y });
    }
    expect(curve.length).toBeGreaterThan(3);
  });

  it("never overshoots a peak or dips below the baseline between peaks", async () => {
    await render(
      <Electropherogram
        data={[0, 100, 0, 100, 0].map((peakA, index) => ({
          position: index + 1,
          base: "A",
          peakA,
          peakT: 0,
          peakG: 0,
          peakC: 0,
        }))}
      />,
    );
    const trace = lastCall().spec.layers.find((layer) => layer.kind === "line");
    const heights = ((trace?.data ?? []) as Array<{ y: number }>).map((point) => point.y);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...heights)).toBeLessThanOrEqual(100);
  });

  it("keeps a flat run flat and handles a sharp rise after it", async () => {
    await render(
      <Electropherogram
        data={[10, 10, 50, 1, 100].map((peakA, index) => ({
          position: index + 1,
          base: "A",
          peakA,
          peakT: 0,
          peakG: 0,
          peakC: 0,
        }))}
      />,
    );
    const trace = lastCall().spec.layers.find((layer) => layer.kind === "line");
    const curve = (trace?.data ?? []) as Array<{ x: number; y: number }>;
    const flat = curve.filter((point) => point.x <= 2);
    expect(flat.every((point) => point.y === 10)).toBe(true);
    expect(curve.every((point) => Number.isFinite(point.y))).toBe(true);
  });

  it("returns a single point as its own curve when there is only one position", async () => {
    await render(<Electropherogram data={[{ position: 7, base: "A", peakA: 30, peakT: 0, peakG: 0, peakC: 0 }]} />);
    const trace = lastCall().spec.layers.find((layer) => layer.kind === "line");
    expect(trace?.data).toEqual([{ x: 7, y: 30 }]);
  });

  it("does not overshoot a peak after a steep rise from a low point", async () => {
    await render(
      <Electropherogram
        data={[0, 1, 100].map((peakA, index) => ({
          position: index + 1,
          base: "A",
          peakA,
          peakT: 0,
          peakG: 0,
          peakC: 0,
        }))}
      />,
    );
    const trace = lastCall().spec.layers.find((layer) => layer.kind === "line");
    const heights = ((trace?.data ?? []) as Array<{ y: number }>).map((point) => point.y);
    expect(Math.max(...heights)).toBeLessThanOrEqual(100);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(0);
  });
});
