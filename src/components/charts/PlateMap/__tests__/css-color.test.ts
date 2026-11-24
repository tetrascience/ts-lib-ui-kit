import { describe, expect, it } from "vitest";

import { mixRgb, parseCssColor, toHex } from "../css-color";

describe("parseCssColor", () => {
  it("reads six-digit and three-digit hex, with or without an alpha digit", () => {
    expect(parseCssColor("#336699")).toEqual([51, 102, 153]);
    expect(parseCssColor("#369")).toEqual([51, 102, 153]);
    expect(parseCssColor("#336699cc")).toEqual([51, 102, 153]);
    expect(parseCssColor("#369c")).toEqual([51, 102, 153]);
  });

  it("reads rgb() and rgba() with commas, spaces and percentages", () => {
    expect(parseCssColor("rgb(0, 0, 255)")).toEqual([0, 0, 255]);
    expect(parseCssColor("rgb(0 128 255)")).toEqual([0, 128, 255]);
    expect(parseCssColor("rgba(10, 20, 30, 0.5)")).toEqual([10, 20, 30]);
    expect(parseCssColor("rgb(100%, 0%, 50%)")).toEqual([255, 0, 128]);
    expect(parseCssColor("rgb(0 128 255 / 40%)")).toEqual([0, 128, 255]);
  });

  it("reads a CSS colour name in any case, and ignores surrounding space", () => {
    expect(parseCssColor("red")).toEqual([255, 0, 0]);
    expect(parseCssColor(" RebeccaPurple ")).toEqual([102, 51, 153]);
  });

  it("clamps a channel outside 0 to 255", () => {
    expect(parseCssColor("rgb(300, -5, 12)")).toEqual([255, 0, 12]);
  });

  it("answers null for text that is not a colour it reads", () => {
    expect(parseCssColor("not-a-colour")).toBeNull();
    expect(parseCssColor("rgb(a, b, c)")).toBeNull();
    expect(parseCssColor("#12")).toBeNull();
    expect(parseCssColor("")).toBeNull();
  });
});

describe("toHex and mixRgb", () => {
  it("writes a colour as lower-case hex, rounding each channel", () => {
    expect(toHex([255, 0, 127.5])).toBe("#ff0080");
    expect(toHex([0, 0, 0])).toBe("#000000");
  });

  it("blends two colours channel by channel", () => {
    expect(toHex(mixRgb([0, 0, 255], [255, 0, 0], 0.5))).toBe("#800080");
    expect(mixRgb([10, 20, 30], [20, 40, 60], 0)).toEqual([10, 20, 30]);
    expect(mixRgb([10, 20, 30], [20, 40, 60], 1)).toEqual([20, 40, 60]);
  });
});
