import { describe, expect, it, beforeAll } from "vitest";

import { seriesPalettes, uniqueSeriesNames } from "../kinds/series";

import { loadViz } from "@/components/charts/viz/viz-loader";

describe("uniqueSeriesNames", () => {
  it("counts a repeated name, so ts-lib-viz does not merge the two series", () => {
    expect(uniqueSeriesNames([{ name: "Run" }, { name: "Run" }, { name: "Control" }])).toEqual([
      "Run",
      "Run (2)",
      "Control",
    ]);
  });
});

describe("uniqueSeriesNames with reserved names", () => {
  it("never counts a name onto a series the caller already named that way", () => {
    expect(uniqueSeriesNames([{ name: "Run" }, { name: "Run" }, { name: "Run (2)" }])).toEqual([
      "Run",
      "Run (3)",
      "Run (2)",
    ]);
  });
});

describe("seriesPalettes", () => {
  it("skips a series with no rows, so the series after it keep their own colour", () => {
    const palettes = seriesPalettes(
      [
        { name: "empty", color: "#111111" },
        { name: "second", color: "#222222" },
      ],
      [false, true],
    );
    expect(palettes.categorical?.(0)).toBe("#222222");
  });

  it("keeps each colour at its own position when every series has rows", () => {
    const palettes = seriesPalettes(
      [
        { name: "first", color: "#111111" },
        { name: "second", color: "#222222" },
      ],
      [true, true],
    );
    expect(palettes.categorical?.(0)).toBe("#111111");
    expect(palettes.categorical?.(1)).toBe("#222222");
  });
});

// The charts load ts-lib-viz lazily. Loading it first lets each test render and build specs at once.
beforeAll(async () => {
  await loadViz();
});
