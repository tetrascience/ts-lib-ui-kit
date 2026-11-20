import { describe, it, expect } from "vitest";

import { sharedBinning } from "../kinds/Histogram";

describe("sharedBinning", () => {
  it("uses the bins a series states", () => {
    expect(sharedBinning([{ name: "a", x: [1, 9], xbins: { start: 0, end: 10, size: 2 } }])).toEqual({
      binwidth: 2,
      boundary: 0,
    });
  });

  it("covers every series with one round step, aiming for about twenty bins", () => {
    expect(
      sharedBinning([
        { name: "a", x: [0, 10] },
        { name: "b", x: [40, 55] },
      ]),
    ).toEqual({ binwidth: 5, boundary: 0 });
  });

  it("answers a unit bin for data with no spread, and for no data", () => {
    expect(sharedBinning([{ name: "a", x: [7, 7] }])).toEqual({ binwidth: 1, boundary: 7 });
    expect(sharedBinning([{ name: "a", x: [] }])).toEqual({ binwidth: 1, boundary: 0 });
  });
});
