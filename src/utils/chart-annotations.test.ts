import { describe, it, expect } from "vitest";

import { annotationLegendTraces, buildChartAnnotations } from "./chart-annotations";

import type { PlotlyThemeColors } from "@/hooks/use-plotly-theme";

const LIGHT: PlotlyThemeColors = {
  paperBg: "transparent",
  plotBg: "transparent",
  textColor: "rgba(26, 26, 26, 1)",
  textSecondary: "rgba(26, 26, 26, 0.6)",
  gridColor: "rgba(158, 172, 192, 0.55)",
  lineColor: "rgba(26, 26, 26, 1)",
  tickColor: "rgba(225, 231, 239, 1)",
  legendColor: "rgba(4, 38, 63, 1)",
  spikeColor: "rgba(100, 116, 139, 1)",
  markerOutline: "rgba(26, 26, 26, 0.45)",
  isDark: false,
};

describe("buildChartAnnotations", () => {
  it("returns empty layers when no config is provided", () => {
    const { shapes, legendItems } = buildChartAnnotations(LIGHT);
    expect(shapes).toEqual([]);
    expect(legendItems).toEqual([]);
  });

  it("builds a vertical shape for an x-axis reference line", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 0.7 }],
    });
    expect(shapes).toHaveLength(1);
    const [shape] = shapes;
    expect(shape.type).toBe("line");
    // Vertical: fixed x in data coords, full-height via paper y-reference.
    expect(shape.xref).toBe("x");
    expect(shape.yref).toBe("paper");
    expect(shape.x0).toBe(0.7);
    expect(shape.x1).toBe(0.7);
    expect(shape.y0).toBe(0);
    expect(shape.y1).toBe(1);
    // Threshold lines draw above the data.
    expect(shape.layer).toBe("above");
  });

  it("builds a horizontal shape for a y-axis reference line", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "y", value: 3 }],
    });
    const [shape] = shapes;
    expect(shape.xref).toBe("paper");
    expect(shape.yref).toBe("y");
    expect(shape.y0).toBe(3);
    expect(shape.y1).toBe(3);
    expect(shape.x0).toBe(0);
    expect(shape.x1).toBe(1);
  });

  it("applies default width/dash and honors overrides on reference lines", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      referenceLines: [
        { axis: "x", value: 1 },
        { axis: "x", value: 2, width: 4, dash: "solid", color: "#ff0000" },
      ],
    });
    expect(shapes[0].line).toMatchObject({ width: 2, dash: "dash", color: LIGHT.textColor });
    expect(shapes[1].line).toMatchObject({ width: 4, dash: "solid", color: "#ff0000" });
  });

  it("builds a normalized rect for a band and draws it below the data", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      // `from`/`to` given in reverse order should still normalize low→high.
      bands: [{ axis: "y", from: 3, to: -3 }],
    });
    const [shape] = shapes;
    expect(shape.type).toBe("rect");
    expect(shape.y0).toBe(-3);
    expect(shape.y1).toBe(3);
    expect(shape.layer).toBe("below");
    expect(shape.opacity).toBe(0.12);
  });

  it("honors band color and opacity overrides", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      bands: [{ axis: "x", from: 0, to: 1, color: "#038599", opacity: 0.3 }],
    });
    expect(shapes[0].fillcolor).toBe("#038599");
    expect(shapes[0].opacity).toBe(0.3);
  });

  it("emits legend items only when a label is present", () => {
    const { legendItems } = buildChartAnnotations(LIGHT, {
      referenceLines: [
        { axis: "x", value: 0.7, label: "cutoff" },
        { axis: "x", value: 0.9 },
      ],
      bands: [{ axis: "y", from: -3, to: 3, label: "±3σ" }],
    });
    expect(legendItems).toHaveLength(2);
    // Bands come before reference lines in draw order.
    expect(legendItems.map((i) => i.label)).toEqual(["±3σ", "cutoff"]);
  });

  it("tags legend items with the right kind and swatch metadata", () => {
    const { legendItems } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1, label: "cutoff", color: "#E15759", dash: "dot", width: 3 }],
      bands: [{ axis: "x", from: 0, to: 2, label: "pass", color: "#038599", opacity: 0.2 }],
    });
    const band = legendItems.find((i) => i.label === "pass");
    const line = legendItems.find((i) => i.label === "cutoff");
    expect(band).toMatchObject({ kind: "band", color: "#038599", opacity: 0.2 });
    expect(line).toMatchObject({ kind: "line", color: "#E15759", dash: "dot", width: 3 });
  });

  it("renders bands before reference lines so lines sit on top", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1 }],
      bands: [{ axis: "x", from: 0, to: 2 }],
    });
    expect(shapes[0].type).toBe("rect");
    expect(shapes[1].type).toBe("line");
  });

  it("falls back to a theme-aware neutral color when none is given", () => {
    const { legendItems } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1, label: "x" }],
    });
    expect(legendItems[0].color).toBe(LIGHT.textColor);
  });
});

describe("annotationLegendTraces", () => {
  it("returns one legend-only trace per item, drawing nothing on the plot", () => {
    const { legendItems } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1, label: "cutoff", color: "#E15759", dash: "dot", width: 3 }],
      bands: [{ axis: "x", from: 0, to: 2, label: "pass", color: "#038599", opacity: 0.2 }],
    });
    const traces = annotationLegendTraces(legendItems);
    expect(traces).toHaveLength(2);
    for (const t of traces) {
      expect(t.x).toEqual([null]);
      expect(t.y).toEqual([null]);
      expect(t.showlegend).toBe(true);
      expect(t.hoverinfo).toBe("skip");
    }
  });

  it("renders a line swatch for reference lines", () => {
    const traces = annotationLegendTraces([
      { label: "cutoff", color: "#E15759", kind: "line", dash: "dot", width: 3 },
    ]);
    expect(traces[0].mode).toBe("lines");
    expect(traces[0].name).toBe("cutoff");
    expect(traces[0].line).toMatchObject({ color: "#E15759", dash: "dot", width: 3 });
  });

  it("renders a square swatch for bands and floors faint opacity", () => {
    const traces = annotationLegendTraces([
      { label: "pass", color: "#038599", kind: "band", opacity: 0.1 },
    ]);
    expect(traces[0].mode).toBe("markers");
    expect(traces[0].marker).toMatchObject({ color: "#038599", symbol: "square" });
    // 0.1 is below the legend floor, so it's raised to 0.35 for visibility.
    expect((traces[0].marker as { opacity: number }).opacity).toBe(0.35);
  });
});
