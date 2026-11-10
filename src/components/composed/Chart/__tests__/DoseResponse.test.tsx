import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, afterEach, vi } from "vitest";

import { Chart } from "../Chart";
import { doseResponseRows } from "../kinds/DoseResponse";

import type { DoseResponseSeries } from "../kinds/DoseResponse";
import type { ChartSpec, Fitter, VizData } from "@/vendor/ts-lib-viz/core";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The real <Viz> cannot mount under this jsdom project, so capture what the chart hands it.
interface VizCall {
  spec: ChartSpec;
  data: VizData;
  fitter?: Fitter;
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

const series: DoseResponseSeries[] = [{ name: "Compound A", dose: [0.1, 1, 10, 100], response: [5, 30, 70, 95] }];

describe("doseResponseRows", () => {
  it("drops doses a log axis cannot place, and readings that are not finite", () => {
    const rows = doseResponseRows([
      { name: "S", dose: [0, -1, 1, Number.NaN, 10], response: [1, 2, 3, 4, Number.NaN] },
    ]);
    expect(rows.map((row) => row.x)).toEqual([1]);
  });

  it("spans each response by its error, and collapses to the response without one", () => {
    const withError = doseResponseRows([{ name: "S", dose: [1], response: [50], error: [4] }]);
    expect(withError[0]).toMatchObject({ lo: 46, hi: 54 });
    const without = doseResponseRows([{ name: "S", dose: [1], response: [50] }]);
    expect(without[0]).toMatchObject({ lo: 50, hi: 50 });
  });
});

describe("Chart doseResponse", () => {
  it("draws the points on a log10 dose axis", async () => {
    await render(<Chart type="doseResponse" dataSeries={series} />);
    expect(lastCall().spec.scales?.x?.transform).toBe("log10");
    expect(lastCall().spec.layers.map((drawn) => drawn.kind)).toEqual(["point"]);
    expect(lastCall().data).toHaveLength(4);
  });

  it("draws points and no curve when no fitter is supplied", async () => {
    await render(<Chart type="doseResponse" dataSeries={series} />);
    expect(lastCall().fitter).toBeUndefined();
    expect(lastCall().spec.layers.every((drawn) => drawn.fit === undefined)).toBe(true);
  });

  it("asks for a 4PL curve and hands the fitter to Viz when one is supplied", async () => {
    const fitter: Fitter = async () => new Map();
    await render(<Chart type="doseResponse" dataSeries={series} fitter={fitter} />);
    expect(lastCall().fitter).toBe(fitter);
    expect(lastCall().spec.layers[0].fit).toMatchObject({ model: "4pl" });
  });

  it("adds error bars only when a series gives an error", async () => {
    await render(<Chart type="doseResponse" dataSeries={series} />);
    expect(lastCall().spec.layers.map((drawn) => drawn.kind)).not.toContain("errorbar");

    await render(<Chart type="doseResponse" dataSeries={[{ ...series[0], error: [1, 2, 3, 4] }]} />);
    expect(lastCall().spec.layers.map((drawn) => drawn.kind)).toContain("errorbar");
  });
});
