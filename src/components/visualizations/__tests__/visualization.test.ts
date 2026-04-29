import React, { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const plotlyMock = vi.hoisted(() => ({
  newPlot: vi.fn(),
  purge: vi.fn(),
}));

vi.mock("plotly.js-dist", () => ({ default: plotlyMock }));

import { PlotlyVisualization, ScalarVisualization, TableVisualization } from "../index";

import { isVisualizationComponent } from "@/lib/visualization";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
  unmount: () => Promise<void>;
}

const mountedRoots: RenderResult[] = [];

afterEach(async () => {
  for (const mountedRoot of mountedRoots.splice(0)) {
    await mountedRoot.unmount();
  }

  plotlyMock.newPlot.mockReset();
  plotlyMock.purge.mockReset();
});

describe("generic visualization metadata", () => {
  it("exposes Plotly as a discoverable visualization", () => {
    expect(isVisualizationComponent(PlotlyVisualization)).toBe(true);
    expect(PlotlyVisualization.visualization).toMatchObject({
      id: "plotly",
      inputKind: "plot",
    });
  });

  it("exposes table as a discoverable visualization", () => {
    expect(isVisualizationComponent(TableVisualization)).toBe(true);
    expect(TableVisualization.visualization).toMatchObject({
      id: "table",
      inputKind: "table",
    });
  });

  it("exposes scalar as a discoverable visualization", () => {
    expect(isVisualizationComponent(ScalarVisualization)).toBe(true);
    expect(ScalarVisualization.visualization).toMatchObject({
      id: "scalar",
      inputKind: "number",
    });
  });

  it("renders Plotly payloads with merged layout and config", async () => {
    const data = [{ x: [1, 2], y: [3, 4], type: "scatter" }];
    const { container, unmount } = await renderVisualization(
      React.createElement(PlotlyVisualization, {
        className: "custom-chart",
        config: { scrollZoom: true },
        data,
        height: 240,
        layout: {
          margin: { t: 1, r: 2, b: 3, l: 4 },
          paper_bgcolor: "white",
          plot_bgcolor: "gray",
          title: { text: "Configured title" },
        },
        showLegend: false,
        title: "Chart title",
      }),
    );

    expect(container.textContent).toContain("Chart title");
    expect(container.querySelector(".custom-chart")).not.toBeNull();
    expect(plotlyMock.newPlot).toHaveBeenCalledTimes(1);
    expect(plotlyMock.newPlot).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      data,
      expect.objectContaining({
        autosize: true,
        height: 240,
        margin: { t: 1, r: 2, b: 3, l: 4 },
        paper_bgcolor: "white",
        plot_bgcolor: "gray",
        showlegend: false,
        title: { text: "Configured title" },
      }),
      expect.objectContaining({
        displaylogo: false,
        responsive: true,
        scrollZoom: true,
      }),
    );

    await unmount();
    expect(plotlyMock.purge).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("renders Plotly defaults for invalid data and missing optional props", async () => {
    await renderVisualization(
      React.createElement(PlotlyVisualization, {
        data: "not plot data" as never,
      }),
    );

    expect(plotlyMock.newPlot).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      [],
      expect.objectContaining({
        autosize: true,
        height: 380,
        margin: { t: 40, r: 20, b: 48, l: 56 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        showlegend: true,
        font: expect.objectContaining({
          color: "rgba(26, 26, 26, 0.6)",
          family: "Inter, sans-serif",
        }),
      }),
      expect.objectContaining({
        displaylogo: false,
        responsive: true,
      }),
    );
  });

  it("renders table rows, empty states, and numeric cells", async () => {
    const { container, root } = await renderVisualization(
      React.createElement(TableVisualization, {
        columns: ["Name", "Value", "Flag", "Missing"],
        maxHeight: 180,
        rows: [
          ["Alpha", 12, true, null],
          ["Beta", 0, false, undefined],
        ],
        title: "Result table",
      }),
    );

    expect(container.textContent).toContain("Result table");
    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("12");
    expect(container.textContent).toContain("true");
    expect(container.querySelector('[data-slot="table-cell"]')?.className).toContain("p-4");

    await act(async () => {
      root.render(React.createElement(TableVisualization, { columns: ["Only column"], rows: [] }));
    });

    expect(container.textContent).toContain("No rows");
  });

  it("renders scalar primitives, object payloads, and empty values", async () => {
    const { container, root } = await renderVisualization(
      React.createElement(ScalarVisualization, {
        label: "Concentration",
        unit: "mg/mL",
        value: 42,
      }),
    );

    expect(container.textContent).toContain("Concentration:");
    expect(container.textContent).toContain("42 mg/mL");

    await act(async () => {
      root.render(
        React.createElement(ScalarVisualization, {
          data: { unit: "RFU", value: "128" },
          title: "Signal",
        }),
      );
    });

    expect(container.textContent).toContain("Signal:");
    expect(container.textContent).toContain("128 RFU");

    await act(async () => {
      root.render(
        React.createElement(ScalarVisualization, {
          data: { unit: 123, value: null },
          unit: "fallback",
        }),
      );
    });

    expect(container.textContent).toContain("fallback");
  });
});

async function renderVisualization(element: ReactElement): Promise<RenderResult> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  let mounted = true;

  await act(async () => {
    root.render(element);
  });

  const result: RenderResult = {
    container,
    root,
    unmount: async () => {
      if (!mounted) return;
      await act(async () => {
        root.unmount();
      });
      container.remove();
      mounted = false;
    },
  };

  mountedRoots.push(result);
  return result;
}
