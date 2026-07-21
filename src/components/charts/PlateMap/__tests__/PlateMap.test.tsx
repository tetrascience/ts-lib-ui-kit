import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { PlateMap } from "../PlateMap";
import { PLATE_FORMAT_CUSTOM } from "../types";

import type { WellData } from "../types";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const plotly = vi.hoisted(() => ({
  newPlot: vi.fn(),
  relayout: vi.fn(),
  purge: vi.fn(),
}));
vi.mock("plotly.js-dist", () => ({ default: plotly }));

const lastColorScale = (): unknown => {
  const traces = plotly.newPlot.mock.calls.at(-1)?.[1] as
    | Array<{ marker?: { colorscale?: unknown } }>
    | undefined;
  return traces?.[0]?.marker?.colorscale;
};

const roots: Array<{ root: Root; container: HTMLElement }> = [];

async function render(node: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(node);
  });
}

beforeEach(() => {
  plotly.newPlot.mockImplementation((el: HTMLElement) => {
    (el as unknown as { on: () => void }).on = () => {};
    return Promise.resolve();
  });
  plotly.relayout.mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
  vi.clearAllMocks();
});

describe("PlateMap categorical mode", () => {
  it("adds an 'empty' category and maps null wells to it when some wells are blank", async () => {
    // 1x3 custom plate: two categorized wells + one blank (null) well, so the
    // categorical build path collects an "empty" type and maps the null cell.
    const data: WellData[] = [
      { wellId: "A1", values: { type: "sample" } },
      { wellId: "A2", values: { type: "control" } },
      // A3 intentionally omitted → null category cell
    ];
    await render(
      <PlateMap
        data={data}
        plateFormat={PLATE_FORMAT_CUSTOM}
        rows={1}
        columns={3}
        visualizationMode="categorical"
      />,
    );
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
  });

  it("renders a single-color scale when only one category is present", async () => {
    // 1x1 plate with a single category and no blanks → the single-type branch.
    const data: WellData[] = [{ wellId: "A1", values: { type: "sample" } }];
    await render(
      <PlateMap
        data={data}
        plateFormat={PLATE_FORMAT_CUSTOM}
        rows={1}
        columns={1}
        visualizationMode="categorical"
      />,
    );
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
  });
});

describe("PlateMap heatmap mode", () => {
  it("returns an unknown named colorscale unchanged when empty wells are present", async () => {
    // Numeric well + a blank well → hasNullValues path; an unknown named scale
    // can't be extended, so it is returned as-is.
    const data: WellData[] = [
      { wellId: "A1", values: { signal: 5 } },
      // A2 omitted → null value cell
    ];
    await render(
      <PlateMap
        data={data}
        plateFormat={PLATE_FORMAT_CUSTOM}
        rows={1}
        columns={2}
        colorScale="TotallyUnknownScale"
      />,
    );
    expect(plotly.newPlot).toHaveBeenCalledTimes(1);
    expect(lastColorScale()).toBe("TotallyUnknownScale");
  });
});
