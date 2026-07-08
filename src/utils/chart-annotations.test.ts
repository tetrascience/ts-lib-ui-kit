import { describe, it, expect } from "vitest";

import { buildChartAnnotations } from "./chart-annotations";

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

const DARK: PlotlyThemeColors = { ...LIGHT, textColor: "rgba(255, 255, 255, 0.9)", isDark: true };

describe("buildChartAnnotations", () => {
  it("returns empty layers when no config is provided", () => {
    const { shapes, annotations } = buildChartAnnotations(LIGHT);
    expect(shapes).toEqual([]);
    expect(annotations).toEqual([]);
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

  it("emits annotations only when a label is present", () => {
    const { annotations } = buildChartAnnotations(LIGHT, {
      referenceLines: [
        { axis: "x", value: 0.7, label: "cutoff" },
        { axis: "x", value: 0.9 },
      ],
      bands: [{ axis: "y", from: -3, to: 3, label: "±3σ" }],
    });
    expect(annotations).toHaveLength(2);
    const texts = annotations.map((a) => a.text);
    expect(texts).toContain("cutoff");
    expect(texts).toContain("±3σ");
  });

  it("centers a band label at the midpoint of its range", () => {
    const { annotations } = buildChartAnnotations(LIGHT, {
      bands: [{ axis: "x", from: 10, to: 30, label: "pass" }],
    });
    expect(annotations[0].x).toBe(20);
  });

  it("renders bands before reference lines so lines sit on top", () => {
    const { shapes } = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1 }],
      bands: [{ axis: "x", from: 0, to: 2 }],
    });
    expect(shapes[0].type).toBe("rect");
    expect(shapes[1].type).toBe("line");
  });

  it("uses a legible, opaque label backing in each theme", () => {
    const light = buildChartAnnotations(LIGHT, {
      referenceLines: [{ axis: "x", value: 1, label: "x" }],
    }).annotations[0];
    const dark = buildChartAnnotations(DARK, {
      referenceLines: [{ axis: "x", value: 1, label: "x" }],
    }).annotations[0];

    expect(light.bgcolor).toBe("rgba(255, 255, 255, 0.85)");
    expect(light.font?.color).toBe(LIGHT.textColor);
    expect(dark.bgcolor).toBe("rgba(15, 23, 42, 0.85)");
    expect(dark.font?.color).toBe(DARK.textColor);
    // Label border echoes the annotated line's color.
    expect(light.bordercolor).toBe(LIGHT.textColor);
  });
});
