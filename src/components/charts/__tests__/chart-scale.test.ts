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

  it("compacts vertical chrome for a short-but-wide canvas and keeps side margins", () => {
    const scale = resolveChartScale(1200, 300);
    expect(scale.tickFontSize).toBe(COMPACT_SCALE.tickFontSize);
    expect(scale.titleFontSize).toBe(COMPACT_SCALE.titleFontSize);
    expect(scale.margin.b).toBe(COMPACT_SCALE.margin.b);
    expect(scale.margin.tTitle).toBe(COMPACT_SCALE.margin.tTitle);
    expect(scale.margin.l).toBe(REGULAR_SCALE.margin.l);
    expect(scale.margin.r).toBe(REGULAR_SCALE.margin.r);
  });

  it("compacts only side margins for a narrow-but-tall canvas", () => {
    const custom = { ...REGULAR_SCALE, legendFontSize: 16 };
    const scale = resolveChartScale(400, 600, custom);
    expect(scale.tickFontSize).toBe(custom.tickFontSize);
    expect(scale.legendFontSize).toBe(16);
    expect(scale.margin.b).toBe(custom.margin.b);
    expect(scale.margin.l).toBe(COMPACT_SCALE.margin.l);
    expect(scale.margin.r).toBe(COMPACT_SCALE.margin.r);
  });

  it("returns the same object for the same inputs so effect deps stay stable", () => {
    const custom = { ...REGULAR_SCALE, legendFontSize: 16 };
    expect(resolveChartScale(1200, 300)).toBe(resolveChartScale(1200, 300));
    expect(resolveChartScale(400, 600, custom)).toBe(resolveChartScale(400, 600, custom));
    expect(resolveChartScale(400, 600, custom)).not.toBe(resolveChartScale(400, 600));
  });

  it("computes how many labels fit, never fewer than two", () => {
    expect(maxTickCount(100, 25)).toBe(4);
    expect(maxTickCount(10, 25)).toBe(2);
    expect(maxTickCount(100, 0)).toBe(2);
  });

  it("thins ticks evenly while keeping both the first and the last", () => {
    // Even stride would land on 6; the axis maximum (7) must stay labelled
    expect(thinTicks([0, 1, 2, 3, 4, 5, 6, 7], 4)).toEqual([0, 2, 4, 7]);
    expect(thinTicks([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([0, 3, 6]);
    expect(thinTicks([10, 20, 30, 40, 50], 2)).toEqual([10, 50]);
    // maxCount below 2 is treated as 2 rather than dropping the first tick
    expect(thinTicks([10, 20, 30, 40, 50], 1)).toEqual([10, 50]);
    expect(thinTicks([10, 20, 30], 0)).toEqual([10, 30]);
    expect(thinTicks([0, 1, 2], 4)).toEqual([0, 1, 2]);
  });

  it("never returns more than maxCount ticks", () => {
    for (let n = 1; n <= 20; n++) {
      for (let max = 2; max <= 6; max++) {
        const ticks = Array.from({ length: n }, (_, i) => i);
        const out = thinTicks(ticks, max);
        expect(out.length).toBeLessThanOrEqual(Math.max(max, Math.min(n, max)));
        expect(out[0]).toBe(0);
        expect(out[out.length - 1]).toBe(n - 1);
      }
    }
  });
});
