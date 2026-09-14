import { describe, expect, it } from "vitest";

import {
  COMPACT_SCALE,
  REGULAR_SCALE,
  isCompactChart,
  maxTickCount,
  resolveChartScale,
  thinTicks,
} from "../chart-scale";

describe("chart-scale", () => {
  it("treats short or narrow canvases as compact", () => {
    expect(isCompactChart(1000, 600)).toBe(false);
    expect(isCompactChart(310, 200)).toBe(true);
    expect(isCompactChart(1000, 320)).toBe(true);
    expect(isCompactChart(400, 600)).toBe(true);
  });

  it("returns the caller's regular scale when not compact", () => {
    const custom = { ...REGULAR_SCALE, legendFontSize: 16 };
    expect(resolveChartScale(1000, 600, custom)).toBe(custom);
    expect(resolveChartScale(1000, 600)).toBe(REGULAR_SCALE);
    expect(resolveChartScale(300, 200, custom)).toBe(COMPACT_SCALE);
  });

  it("computes how many labels fit, never fewer than two", () => {
    expect(maxTickCount(100, 25)).toBe(4);
    expect(maxTickCount(10, 25)).toBe(2);
    expect(maxTickCount(100, 0)).toBe(2);
  });

  it("thins ticks evenly and keeps the first one", () => {
    expect(thinTicks([0, 1, 2, 3, 4, 5, 6, 7], 4)).toEqual([0, 2, 4, 6]);
    expect(thinTicks([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([0, 3, 6]);
    expect(thinTicks([0, 1, 2], 4)).toEqual([0, 1, 2]);
  });
});
