import { describe, it, expect } from "vitest";

import { colorBreaks, colorLabel, colorRampFrom, regionSegments } from "../plate-spec";

describe("colorRampFrom", () => {
  it("returns the end colours exactly and blends between them", () => {
    const ramp = colorRampFrom([
      [0, "#000000"],
      [1, "#ffffff"],
    ]);
    expect(ramp(0)).toBe("#000000");
    expect(ramp(1)).toBe("#ffffff");
    expect(ramp(0.5)).toBe("#808080");
  });

  it("clamps positions outside 0..1 to the ends", () => {
    const ramp = colorRampFrom([
      [0, "#000000"],
      [1, "#ffffff"],
    ]);
    expect(ramp(-3)).toBe("#000000");
    expect(ramp(7)).toBe("#ffffff");
  });

  it("blends within the segment a value falls in, across several stops", () => {
    const ramp = colorRampFrom([
      [0, "#ff0000"],
      [0.5, "#00ff00"],
      [1, "#0000ff"],
    ]);
    expect(ramp(0.25)).toBe("#808000");
  });

  it("sorts stops that arrive out of order", () => {
    const ramp = colorRampFrom([
      [1, "#ffffff"],
      [0, "#000000"],
    ]);
    expect(ramp(0)).toBe("#000000");
  });

  it("returns a stop unblended when its colour is not hex", () => {
    const ramp = colorRampFrom([
      [0, "rebeccapurple"],
      [1, "#ffffff"],
    ]);
    expect(ramp(0.5)).toBe("rebeccapurple");
  });

  it("returns the start colour where two stops share a position", () => {
    const ramp = colorRampFrom([
      [0.5, "#123456"],
      [0.5, "#abcdef"],
    ]);
    expect(ramp(0.5)).toBe("#123456");
  });

  it("answers transparent for an empty scale and the one colour for a single stop", () => {
    expect(colorRampFrom([])(0.5)).toBe("transparent");
    expect(colorRampFrom([[0.3, "#336699"]])(0.9)).toBe("#336699");
  });
});

describe("regionSegments", () => {
  it("outlines the block of wells just inside its outer edges", () => {
    const segments = regionSegments({ minRow: 0, maxRow: 1, minCol: 0, maxCol: 1 });
    // Columns are 1-based and rows 0-based, so the block spans x 1..2 and y 0..1.
    expect(segments).toEqual([
      { x: 0.51, y: -0.49, xend: 2.49, yend: -0.49 },
      { x: 2.49, y: -0.49, xend: 2.49, yend: 1.49 },
      { x: 2.49, y: 1.49, xend: 0.51, yend: 1.49 },
      { x: 0.51, y: 1.49, xend: 0.51, yend: -0.49 },
    ]);
  });
});

describe("colorBreaks and colorLabel", () => {
  it("places round breaks inside the range", () => {
    expect(colorBreaks(1000, 29000)).toEqual([5000, 10000, 15000, 20000, 25000]);
  });

  it("answers a single break for a range with no width", () => {
    expect(colorBreaks(5, 5)).toEqual([5]);
  });

  it("labels thousands as k and keeps the unit", () => {
    expect(colorLabel(20000, " AU")).toBe("20k AU");
    expect(colorLabel(1500, " AU")).toBe("1.5k AU");
    expect(colorLabel(250, "")).toBe("250");
  });
});
