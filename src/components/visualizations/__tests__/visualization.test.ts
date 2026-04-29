import { describe, expect, it, vi } from "vitest";

vi.mock("plotly.js-dist", () => ({ default: {} }));

import { PlotlyVisualization, ScalarVisualization, TableVisualization } from "../index";

import { isVisualizationComponent } from "@/lib/visualization";

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
});
