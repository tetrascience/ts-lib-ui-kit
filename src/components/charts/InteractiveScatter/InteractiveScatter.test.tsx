import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InteractiveScatter } from "./InteractiveScatter";

import type { InteractiveScatterProps, ScatterPoint, SelectionMode } from "./types";

import { isVisualizationComponent } from "@/lib/visualization";

type PlotlyHandler = (eventData?: unknown) => void;
type PlotlyElement = HTMLDivElement & {
  on: (eventName: string, handler: PlotlyHandler) => void;
};
type PlotlyCall = [PlotlyElement, Array<Record<string, any>>, Record<string, any>, Record<string, any>];

const plotlyState = vi.hoisted(() => ({
  handlers: new Map<string, (eventData?: unknown) => void>(),
  newPlot: vi.fn(),
  on: vi.fn(),
  purge: vi.fn(),
  restyle: vi.fn(),
}));

vi.mock("plotly.js-dist", () => ({
  default: {
    newPlot: plotlyState.newPlot,
    purge: plotlyState.purge,
    restyle: plotlyState.restyle,
  },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const DATA: ScatterPoint[] = [
  { id: 1, x: 1, y: 10, label: "Alpha", metadata: { group: "control", intensity: 3 } },
  { id: "b", x: 2, y: 20, label: "Beta", metadata: { group: "treated", intensity: 7 } },
  { id: 3, x: 3, y: 30, metadata: { group: "treated", intensity: 11 } },
];

beforeEach(() => {
  plotlyState.handlers.clear();
  plotlyState.newPlot.mockReset();
  plotlyState.on.mockReset();
  plotlyState.purge.mockReset();
  plotlyState.restyle.mockReset();

  plotlyState.on.mockImplementation((eventName: string, handler: PlotlyHandler) => {
    plotlyState.handlers.set(eventName, handler);
  });
  plotlyState.newPlot.mockImplementation((element: PlotlyElement) => {
    element.on = plotlyState.on as PlotlyElement["on"];
  });
});

afterEach(() => {
  document.body.innerHTML = "";
});

async function renderInteractiveScatter(props: Partial<InteractiveScatterProps> = {}) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<InteractiveScatter data={DATA} {...props} />);
  });

  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

async function triggerPlotlyEvent(eventName: string, eventData?: unknown) {
  const handler = plotlyState.handlers.get(eventName);
  if (!handler) {
    throw new Error(`Missing Plotly handler for ${eventName}`);
  }

  await act(async () => {
    handler(eventData);
  });
}

function latestPlotlyCall(): PlotlyCall {
  const call = plotlyState.newPlot.mock.calls.at(-1);
  if (!call) {
    throw new Error("Expected Plotly.newPlot to have been called");
  }
  return call as PlotlyCall;
}

function expectSelection(
  call: unknown[] | undefined,
  expectedIds: Array<string | number>,
  expectedMode: SelectionMode,
) {
  expect(call).toBeDefined();
  const [selectedIds, mode] = call as [Set<string | number>, SelectionMode];
  expect([...selectedIds]).toEqual(expectedIds);
  expect(mode).toBe(expectedMode);
}

describe("InteractiveScatter", () => {
  it("exposes visualization metadata on the existing component export", () => {
    expect(isVisualizationComponent(InteractiveScatter)).toBe(true);
    if (!isVisualizationComponent(InteractiveScatter)) {
      throw new Error("Expected InteractiveScatter to expose visualization metadata");
    }

    expect(InteractiveScatter.visualization).toMatchObject({
      id: "interactive-scatter",
      inputKind: "plot",
    });
    expect(InteractiveScatter.visualization.tunableProps.map((prop) => prop.name)).toEqual([
      "enableClickSelection",
      "enableBoxSelection",
      "enableLassoSelection",
      "height",
    ]);
  });

  it("renders Plotly data, wires interactions, and preserves selected ID types", async () => {
    const onPointClick = vi.fn();
    const onSelectionChange = vi.fn();

    const { container, unmount } = await renderInteractiveScatter({
      className: "custom-scatter",
      onPointClick,
      onSelectionChange,
      title: "Assay response",
    });

    expect(container.querySelector(".interactive-scatter.custom-scatter")).not.toBeNull();

    const [, plotData, layout, config] = latestPlotlyCall();
    const trace = plotData[0];

    expect(trace.ids).toEqual(["1", "b", "3"]);
    expect(trace.hoverinfo).toBe("text");
    expect(trace.text[0]).toContain("Label: Alpha");
    expect(layout.dragmode).toBe("lasso");
    expect(config.modeBarButtonsToAdd).toEqual(["select2d", "lasso2d"]);
    expect(plotlyState.handlers.has("plotly_click")).toBe(true);
    expect(plotlyState.handlers.has("plotly_selected")).toBe(true);
    expect(plotlyState.handlers.has("plotly_deselect")).toBe(true);
    expect(plotlyState.restyle).toHaveBeenCalledWith(expect.anything(), { selectedpoints: [null] }, [0]);

    await triggerPlotlyEvent("plotly_click", {
      points: [{ data: { ids: ["1", "b", "3"] }, pointIndex: 0 }],
      event: { shiftKey: true, ctrlKey: false, metaKey: false },
    });

    expect(onPointClick).toHaveBeenCalledWith(DATA[0], expect.objectContaining({ shiftKey: true }));
    expectSelection(onSelectionChange.mock.calls.at(-1), [1], "add");

    await triggerPlotlyEvent("plotly_selected", {
      points: [
        { data: { ids: ["1", "b", "3"] }, pointIndex: 1 },
        { data: {}, pointIndex: 2 },
      ],
    });

    expectSelection(onSelectionChange.mock.calls.at(-1), ["b"], "replace");

    await triggerPlotlyEvent("plotly_deselect");

    expectSelection(onSelectionChange.mock.calls.at(-1), [], "replace");

    await unmount();

    expect(plotlyState.purge).toHaveBeenCalled();
  });

  it("supports controlled selection and mapped marker configuration", async () => {
    const onSelectionChange = vi.fn();

    const { unmount } = await renderInteractiveScatter({
      colorMapping: {
        type: "continuous",
        field: "intensity",
        colorScale: "Viridis",
        min: 0,
        max: 12,
      },
      enableBoxSelection: false,
      enableLassoSelection: false,
      height: 320,
      onSelectionChange,
      selectedIds: new Set([3]),
      shapeMapping: {
        type: "categorical",
        field: "group",
        categoryShapes: { control: "square", treated: "diamond" },
      },
      showColorBar: false,
      sizeMapping: {
        type: "continuous",
        field: "intensity",
        min: 0,
        max: 12,
        sizeRange: [6, 18],
      },
      tooltip: { enabled: false },
      width: 640,
      xAxis: { range: [0, 4], title: "X axis" },
      yAxis: { autoRange: false, title: "Y axis" },
    });

    const [, plotData, layout, config] = latestPlotlyCall();
    const trace = plotData[0];

    expect(trace.hoverinfo).toBe("skip");
    expect(trace.text).toEqual([]);
    expect(trace.marker.color).toEqual([3, 7, 11]);
    expect(trace.marker.colorscale).toBe("Viridis");
    expect(trace.marker.showscale).toBe(false);
    expect(trace.marker.cmin).toBe(0);
    expect(trace.marker.cmax).toBe(12);
    expect(trace.marker.size).toEqual([9, 13, 17]);
    expect(trace.marker.symbol).toEqual(["square", "diamond", "diamond"]);
    expect(layout.xaxis.range).toEqual([0, 4]);
    expect(layout.yaxis.autorange).toBe(true);
    expect(config.modeBarButtonsToAdd).toEqual([]);
    expect(plotlyState.handlers.has("plotly_click")).toBe(true);
    expect(plotlyState.handlers.has("plotly_selected")).toBe(false);
    expect(plotlyState.handlers.has("plotly_deselect")).toBe(false);
    expect(plotlyState.restyle).toHaveBeenCalledWith(expect.anything(), { selectedpoints: [[2]] }, [0]);

    await triggerPlotlyEvent("plotly_click", {
      points: [{ data: { ids: ["1", "b", "3"] }, pointIndex: 2 }],
      event: { shiftKey: false, ctrlKey: true, metaKey: false },
    });

    expectSelection(onSelectionChange.mock.calls.at(-1), [], "remove");

    await unmount();
  });

  it("downsamples data and calculates continuous marker ranges", async () => {
    const data = Array.from({ length: 6 }, (_, index): ScatterPoint => {
      const value = index + 1;
      return {
        id: value,
        x: value,
        y: value * 10,
        metadata: { intensity: value * 5 },
      };
    });

    const { unmount } = await renderInteractiveScatter({
      colorMapping: {
        type: "continuous",
        field: "intensity",
        colorScale: [
          [0, "#000000"],
          [1, "#ffffff"],
        ],
      },
      data,
      downsampling: { enabled: true, maxPoints: 3 },
      enableClickSelection: false,
      tooltip: { enabled: true, content: (point) => `Point ${point.id}` },
      xAxis: { scale: "log" },
      yAxis: { range: [0, 70] },
    });

    const [, plotData, layout] = latestPlotlyCall();
    const trace = plotData[0];

    expect(trace.x).toHaveLength(3);
    expect(trace.text[0]).toMatch(/^Point /);
    expect(trace.marker.colorscale).toEqual([
      [0, "#000000"],
      [1, "#ffffff"],
    ]);
    expect(trace.marker.cmin).toBeGreaterThanOrEqual(5);
    expect(trace.marker.cmax).toBeLessThanOrEqual(30);
    expect(layout.xaxis.type).toBe("log");
    expect(layout.yaxis.range).toEqual([0, 70]);

    await unmount();
  });

  it("skips Plotly setup when there is no data", async () => {
    const { container, unmount } = await renderInteractiveScatter({
      className: "empty-scatter",
      data: [],
    });

    expect(container.querySelector(".interactive-scatter.empty-scatter")).not.toBeNull();
    expect(plotlyState.newPlot).not.toHaveBeenCalled();
    expect(plotlyState.restyle).not.toHaveBeenCalled();

    await unmount();

    expect(plotlyState.purge).not.toHaveBeenCalled();
  });
});
