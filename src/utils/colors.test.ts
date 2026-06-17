import { describe, it, expect } from "vitest";

import {
  CHART_COLORS,
  CHART_SEQUENTIAL,
  CHART_DIVERGING,
  seriesColor,
  toPlotlyColorscale,
} from "./colors";

describe("CHART_COLORS", () => {
  it("provides 12 categorical palette slots", () => {
    expect(CHART_COLORS).toHaveLength(12);
  });

  it("resolves to Plotly-parseable colors outside the browser stylesheet", () => {
    // jsdom has no resolved CSS variables, so the hex fallbacks apply
    for (const color of CHART_COLORS) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("chart ramps", () => {
  it("provides 12-step sequential and diverging ramps", () => {
    for (const ramp of [
      ...Object.values(CHART_SEQUENTIAL),
      ...Object.values(CHART_DIVERGING),
    ]) {
      expect(ramp).toHaveLength(12);
    }
  });
});

describe("seriesColor", () => {
  it("cycles through the palette by index when no explicit color is given", () => {
    expect(seriesColor(0)).toBe(CHART_COLORS[0]);
    expect(seriesColor(2)).toBe(CHART_COLORS[2]);
  });

  it("wraps around when the index exceeds the palette length", () => {
    expect(seriesColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
    expect(seriesColor(CHART_COLORS.length + 3)).toBe(CHART_COLORS[3]);
  });

  it("uses the explicit color when provided", () => {
    expect(seriesColor(5, "#abcdef")).toBe("#abcdef");
  });

  it("falls back to the palette for a null override", () => {
    expect(seriesColor(1, null)).toBe(CHART_COLORS[1]);
  });
});

describe("toPlotlyColorscale", () => {
  it("spaces stops evenly from 0 to 1", () => {
    const scale = toPlotlyColorscale(["#000000", "#888888", "#ffffff"]);
    expect(scale).toEqual([
      [0, "#000000"],
      [0.5, "#888888"],
      [1, "#ffffff"],
    ]);
  });

  it("returns an empty colorscale for an empty ramp", () => {
    expect(toPlotlyColorscale([])).toEqual([]);
  });

  it("pins a single-color ramp to both ends", () => {
    expect(toPlotlyColorscale(["#123456"])).toEqual([
      [0, "#123456"],
      [1, "#123456"],
    ]);
  });

  it("converts the 12-step ramps without NaN positions", () => {
    const scale = toPlotlyColorscale(CHART_DIVERGING.blueOrange);
    expect(scale).toHaveLength(12);
    expect(scale[0][0]).toBe(0);
    expect(scale[11][0]).toBe(1);
    for (const [position] of scale) {
      expect(Number.isFinite(position)).toBe(true);
    }
  });
});
