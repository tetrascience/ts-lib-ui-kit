import { describe, it, expect } from "vitest";

import { chartTooltipLines } from "../lines";

describe("chartTooltipLines", () => {
  it("returns no lines for an empty hover", () => {
    expect(chartTooltipLines([])).toEqual([]);
  });

  it("formats pie slices with label, value, and percent", () => {
    expect(
      chartTooltipLines([{ label: "pH", value: 12, percent: 23.5 }]),
    ).toEqual(["pH", "Value: 12", "23.5%"]);
  });

  it("omits the percent line when the slice has none", () => {
    expect(chartTooltipLines([{ label: "pH", value: 1.5 }])).toEqual([
      "pH",
      "Value: 1.50",
    ]);
  });

  it("uses the slice's text percentage when no numeric percent is given", () => {
    expect(
      chartTooltipLines([{ label: "pH", value: 12, text: "23%" }]),
    ).toEqual(["pH", "Value: 12", "23%"]);
  });

  it("splits trace-provided hover text on <br>", () => {
    expect(
      chartTooltipLines([{ text: "Well A1<br>Value: 42", x: 1, y: 1 }]),
    ).toEqual(["Well A1", "Value: 42"]);
  });

  it("formats a single cartesian point with axis labels and trace name", () => {
    expect(
      chartTooltipLines([{ x: 1, y: 2.345, data: { name: "Series A" } }], {
        xLabel: "Time",
        yLabel: "Signal",
      }),
    ).toEqual(["Series A", "Time: 1", "Signal: 2.35"]);
  });

  it("falls back to X/Y labels and includes z values", () => {
    expect(chartTooltipLines([{ x: "col-1", y: "row-A", z: 7 }])).toEqual([
      "X: col-1",
      "Y: row-A",
      "Value: 7",
    ]);
  });

  it("renders unified multi-trace hovers as one line per trace", () => {
    expect(
      chartTooltipLines(
        [
          { x: 5, y: 10, data: { name: "A" } },
          { x: 5, y: 20, data: { name: "B" } },
          { x: 5, data: { name: "no-y" } },
        ],
        { xLabel: "Position" },
      ),
    ).toEqual(["Position: 5", "A: 10", "B: 20"]);
  });

  it("labels unnamed traces in unified hovers", () => {
    expect(chartTooltipLines([{ x: 1, y: 2 }, { x: 1, y: 3 }])).toEqual([
      "X: 1",
      "Series: 2",
      "Series: 3",
    ]);
  });
});
