import { describe, expect, it } from "vitest";

import { seriesPalettes, uniqueSeriesNames } from "../kinds/series";

describe("uniqueSeriesNames", () => {
  it("counts a repeated name, so ts-lib-viz does not merge the two series", () => {
    expect(uniqueSeriesNames([{ name: "Run" }, { name: "Run" }, { name: "Control" }])).toEqual([
      "Run",
      "Run (2)",
      "Control",
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
