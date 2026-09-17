import { describe, expect, it } from "vitest";

import { buildChromatogramTooltipLines, htmlToTooltipLines, splitAxisTitle } from "../plotBuilder";

import type { ChromatogramSeries } from "../types";

const series: ChromatogramSeries[] = [
  { name: "Sample A", x: [0, 1, 2], y: [0, 10, 0], metadata: { sampleName: "Std 1", vial: 3 } },
  { name: "Sample B", x: [0, 1, 2], y: [0, 5, 0] },
];
const params = { series, xAxisTitle: "Retention Time (min)", yAxisTitle: "Signal (mAU)" };

describe("htmlToTooltipLines", () => {
  it("splits on <br> and strips other tags", () => {
    expect(htmlToTooltipLines("<b>Caffeine</b><br>Area: 12.5<br/>RT: <i>5.8</i>")).toEqual([
      "Caffeine",
      "Area: 12.5",
      "RT: 5.8",
    ]);
  });

  it("decodes entities and drops nested or unclosed tags", () => {
    expect(htmlToTooltipLines("S/N: 42 &amp; up<br><span style=\"color:red\">FAIL<script>x()</script></span>")).toEqual([
      "S/N: 42 & up",
      "FAILx()",
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(htmlToTooltipLines()).toEqual([]);
    expect(htmlToTooltipLines("")).toEqual([]);
  });
});

describe("splitAxisTitle", () => {
  it("separates a trailing parenthesised unit from the label", () => {
    expect(splitAxisTitle("Signal (mAU)")).toEqual({ label: "Signal", unit: "mAU" });
    expect(splitAxisTitle("Retention Time (min)")).toEqual({ label: "Retention Time", unit: "min" });
  });

  it("keeps the whole title as the label when there is no unit", () => {
    expect(splitAxisTitle("Intensity")).toEqual({ label: "Intensity", unit: "" });
    expect(splitAxisTitle("(mAU)")).toEqual({ label: "(mAU)", unit: "" });
    expect(splitAxisTitle("Signal ()")).toEqual({ label: "Signal ()", unit: "" });
    expect(splitAxisTitle("Signal (a (b))")).toEqual({ label: "Signal (a (b))", unit: "" });
    expect(splitAxisTitle("  Signal   (mAU)  ")).toEqual({ label: "Signal", unit: "mAU" });
  });
});

describe("buildChromatogramTooltipLines", () => {
  it("lists the shared x, then each series value with its unit and metadata", () => {
    const lines = buildChromatogramTooltipLines(
      [
        { curveNumber: 0, x: 1.234, y: 10 },
        { curveNumber: 1, x: 1.234, y: 5.5 },
      ],
      params
    );
    expect(lines).toEqual([
      "Retention Time: 1.23 min",
      "Sample A: 10.00 mAU",
      "Sample Name: Std 1",
      "Vial: 3",
      "Sample B: 5.50 mAU",
    ]);
  });

  it("omits units when an axis title has no parenthesised unit", () => {
    const lines = buildChromatogramTooltipLines([{ curveNumber: 0, x: 1, y: 2 }], {
      ...params,
      xAxisTitle: "Time",
      yAxisTitle: "Intensity",
    });
    expect(lines).toEqual(["Time: 1.00", "Sample A: 2.00", "Sample Name: Std 1", "Vial: 3"]);
  });

  it("appends hit-area peak hoverText as plain text, falling back to peak text", () => {
    const withHoverText = buildChromatogramTooltipLines(
      [{ curveNumber: 2, x: 5.8, y: 420, customdata: { peak: { x: 5.8, y: 420, hoverText: "<b>Caffeine</b><br>Area: 1" } } }],
      params
    );
    expect(withHoverText).toEqual(["Retention Time: 5.80 min", "Caffeine", "Area: 1"]);

    const withText = buildChromatogramTooltipLines(
      [{ curveNumber: 2, x: 5.8, y: 420, customdata: { peak: { x: 5.8, y: 420, text: "Caffeine" } } }],
      params
    );
    expect(withText).toEqual(["Retention Time: 5.80 min", "Caffeine"]);
  });

  it("reads region-overlay trace text and de-duplicates a peak reported twice", () => {
    const lines = buildChromatogramTooltipLines(
      [
        { curveNumber: 0, x: 5.8, y: 420 },
        // region overlay trace (text) and hit-area trace (customdata) for the same peak
        { curveNumber: 3, x: 5.8, y: 420, text: "Caffeine<br>Pass" },
        { curveNumber: 4, x: 5.8, y: 420, customdata: { peak: { x: 5.8, y: 420, hoverText: "Caffeine<br>Pass" } } },
      ],
      params
    );
    expect(lines).toEqual([
      "Retention Time: 5.80 min",
      "Sample A: 420.00 mAU",
      "Sample Name: Std 1",
      "Vial: 3",
      "Caffeine",
      "Pass",
    ]);
  });

  it("skips series points without a y value and points with nothing to say", () => {
    const lines = buildChromatogramTooltipLines(
      [
        { curveNumber: 0, x: 1 },
        { curveNumber: 5, x: 1, y: 1, customdata: null },
        { curveNumber: 6, x: 1, y: 1 },
      ],
      params
    );
    expect(lines).toEqual(["Retention Time: 1.00 min"]);
  });

  it("returns no lines when no point carries an x", () => {
    expect(buildChromatogramTooltipLines([], params)).toEqual([]);
  });
});
