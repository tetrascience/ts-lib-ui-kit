import { describe, it, expect, vi } from "vitest";

vi.mock("plotly.js-dist", () => ({ default: {} }));

import { PlateMap } from "../PlateMap";

import { isVisualizationComponent } from "@/lib/visualization";

describe("PlateMap visualization metadata", () => {
  it("exposes a .visualization static property", () => {
    expect(isVisualizationComponent(PlateMap)).toBe(true);
  });

  it("declares plate_map as its input kind", () => {
    expect(PlateMap.visualization.id).toBe("plate-map");
    expect(PlateMap.visualization.inputKind).toBe("plate_map");
  });

  it("lists the expected tunable props", () => {
    const names = PlateMap.visualization.tunableProps.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "colorScale",
        "precision",
        "showColorBar",
        "showLegend",
        "markerShape",
        "visualizationMode",
      ]),
    );
  });

  it("provides a default for every tunable prop", () => {
    for (const param of PlateMap.visualization.tunableProps) {
      expect(param.default, `${param.name} should have a default`).toBeDefined();
    }
  });
});
