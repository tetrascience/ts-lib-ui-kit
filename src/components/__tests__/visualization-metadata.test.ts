import { describe, expect, it, vi } from "vitest";

const plotlyMock = vi.hoisted(() => ({
  newPlot: vi.fn(),
  purge: vi.fn(),
  restyle: vi.fn(),
}));

vi.mock("plotly.js-dist", () => ({ default: plotlyMock }));

import { AreaGraph } from "@/components/charts/AreaGraph";
import { BarGraph } from "@/components/charts/BarGraph";
import { Boxplot } from "@/components/charts/Boxplot";
import { Chromatogram } from "@/components/charts/Chromatogram";
import { ChromatogramChart } from "@/components/charts/ChromatogramChart";
import { DotPlot } from "@/components/charts/DotPlot";
import { Heatmap } from "@/components/charts/Heatmap";
import { Histogram } from "@/components/charts/Histogram";
import { InteractiveScatter } from "@/components/charts/InteractiveScatter";
import { LineGraph } from "@/components/charts/LineGraph";
import { PieChart } from "@/components/charts/PieChart";
import { PlateMap } from "@/components/charts/PlateMap";
import { ScatterGraph } from "@/components/charts/ScatterGraph";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { isVisualizationComponent } from "@/lib/visualization";

const VISUALIZATION_COMPONENTS = [
  ["AreaGraph", AreaGraph, "area-graph", "plot"],
  ["BarGraph", BarGraph, "bar-graph", "plot"],
  ["Boxplot", Boxplot, "boxplot", "plot"],
  ["Chromatogram", Chromatogram, "chromatogram", "plot"],
  ["ChromatogramChart", ChromatogramChart, "chromatogram-chart", "plot"],
  ["DotPlot", DotPlot, "dot-plot", "plot"],
  ["Heatmap", Heatmap, "heatmap", "plate_map"],
  ["Histogram", Histogram, "histogram", "plot"],
  ["InteractiveScatter", InteractiveScatter, "interactive-scatter", "plot"],
  ["LineGraph", LineGraph, "line-graph", "plot"],
  ["PieChart", PieChart, "pie-chart", "plot"],
  ["PlateMap", PlateMap, "plate-map", "plate_map"],
  ["ScatterGraph", ScatterGraph, "scatter-graph", "plot"],
  ["Badge", Badge, "badge", "number"],
  ["DataTable", DataTable, "data-table", "table"],
] as const;

describe("existing component visualization metadata", () => {
  it.each(VISUALIZATION_COMPONENTS)("exposes %s as a discoverable visualization", (_name, component, id, inputKind) => {
    expect(isVisualizationComponent(component)).toBe(true);
    if (!isVisualizationComponent(component)) {
      throw new Error("Expected component to expose visualization metadata");
    }

    expect(component.visualization).toMatchObject({ id, inputKind });
    expect(component.visualization.tunableProps.length).toBeGreaterThanOrEqual(0);
  });
});
