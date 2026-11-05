import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, afterEach, vi } from "vitest";

import { PlateMap } from "../PlateMap";
import { PLATE_FORMAT_CUSTOM } from "../types";

import type { WellData } from "../types";
import type { ChartSpec, Palettes, Selected, VizData } from "@/vendor/ts-lib-viz/core";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ts-lib-viz resolves its own copy of React when it is linked into this repo,
// so the real <Viz> cannot mount under this jsdom project. The adapter's
// contract is the spec, rows, palettes and click handler it hands to <Viz>.
interface VizCall {
  spec: ChartSpec;
  data: VizData;
  palettes?: Palettes;
  keyField?: string;
  onSelect?: (selected: Selected | null) => void;
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

/** The point layers of the last chart, in the order they were drawn. */
const pointLayers = () => lastCall().spec.layers.filter((layer) => layer.kind === "point");

afterEach(() => {
  act(() => roots.forEach(({ root }) => root.unmount()));
  roots.length = 0;
  document.body.innerHTML = "";
  viz.calls.length = 0;
});

describe("PlateMap categorical mode", () => {
  it("draws one point layer per category, with the empty category for blank wells", async () => {
    // 1x3 plate: two categorised wells and one blank well, which becomes "empty".
    const data: WellData[] = [
      { wellId: "A1", values: { type: "sample" } },
      { wellId: "A2", values: { type: "control" } },
    ];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={3} visualizationMode="categorical" />,
    );
    const layers = pointLayers();
    expect(layers).toHaveLength(3);
    expect(lastCall().spec.scales?.color).toBeUndefined();
    expect(lastCall().spec.legend).toMatchObject({ position: "none" });
  });

  it("colours each category's wells in that category's colour", async () => {
    const data: WellData[] = [
      { wellId: "A1", values: { type: "sample" } },
      { wellId: "A2", values: { type: "control" } },
    ];
    await render(
      <PlateMap
        data={data}
        plateFormat={PLATE_FORMAT_CUSTOM}
        rows={1}
        columns={2}
        visualizationMode="categorical"
        categoryColors={{ sample: "#111111", control: "#222222" }}
      />,
    );
    expect(pointLayers().map((layer) => layer.style?.color)).toEqual(["#222222", "#111111"]); // categories sort by name: control, then sample
  });

  it("draws a single category as one layer", async () => {
    const data: WellData[] = [{ wellId: "A1", values: { type: "sample" } }];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={1} visualizationMode="categorical" />,
    );
    expect(pointLayers()).toHaveLength(1);
  });
});

describe("PlateMap heatmap mode", () => {
  it("colours filled wells by their value and blank wells in the empty-well colour", async () => {
    const data: WellData[] = [
      { wellId: "A1", values: { signal: 5 } },
      // A2 omitted → a blank well with no value
    ];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={2} emptyWellColor="#cccccc" />,
    );
    const [filled, blank] = pointLayers();
    expect(filled.aes.color).toBe("value");
    expect(blank.style?.color).toBe("#cccccc");
    expect(lastCall().spec.legend).toMatchObject({ position: "none" });
    // The colour bar is React-drawn, beside the plate.
    expect(document.querySelector(".platemap-colour-bar")).not.toBeNull();
  });

  it("hides the colour bar when showColorBar is off", async () => {
    const data: WellData[] = [{ wellId: "A1", values: { signal: 5 } }];
    await render(<PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={1} showColorBar={false} />);
    expect(lastCall().spec.legend).toMatchObject({ position: "none" });
  });

  it("uses the palette of a named colourscale, and the default one for an unknown name", async () => {
    const data: WellData[] = [{ wellId: "A1", values: { signal: 5 } }];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={1} colorScale="TotallyUnknownScale" />,
    );
    const ramp = lastCall().palettes?.sequential;
    expect(ramp?.(0)).toMatch(/^#/);
    expect(ramp?.(1)).toMatch(/^#/);
  });

  it("reports a click on a well with its values and tooltip data", async () => {
    const onWellClick = vi.fn();
    const data: WellData[] = [{ wellId: "A1", values: { signal: 5 }, tooltipData: { sample: "S001" } }];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={1} onWellClick={onWellClick} />,
    );
    expect(lastCall().keyField).toBe("wellId");
    act(() => lastCall().onSelect?.({ datum: { wellId: "A1" } } as unknown as Selected));
    expect(onWellClick).toHaveBeenCalledWith(
      expect.objectContaining({ wellId: "A1", values: { signal: 5 }, tooltipData: { sample: "S001" } }),
    );
  });

  it("ignores a click that clears the selection or names no well", async () => {
    const onWellClick = vi.fn();
    const data: WellData[] = [{ wellId: "A1", values: { signal: 5 } }];
    await render(
      <PlateMap data={data} plateFormat={PLATE_FORMAT_CUSTOM} rows={1} columns={1} onWellClick={onWellClick} />,
    );
    act(() => lastCall().onSelect?.(null));
    act(() => lastCall().onSelect?.({ datum: null } as unknown as Selected));
    expect(onWellClick).not.toHaveBeenCalled();
  });

  it("outlines each region with four edges in one segment layer", async () => {
    const data: WellData[] = [{ wellId: "A1", values: { signal: 5 } }];
    await render(
      <PlateMap
        data={data}
        plateFormat={PLATE_FORMAT_CUSTOM}
        rows={2}
        columns={2}
        regions={[{ id: "r1", name: "Controls", wells: "A1:B2", borderColor: "#123456", borderWidth: 3 }]}
      />,
    );
    const outline = lastCall().spec.layers.filter((layer) => layer.kind === "segment");
    expect(outline).toHaveLength(1);
    expect(outline[0].style?.color).toBe("#123456");
    expect(outline[0].data).toHaveLength(4);
  });
});
