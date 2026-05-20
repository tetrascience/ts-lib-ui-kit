import { describe, expect, it } from "vitest";

import {
  allPositions,
  parsePos,
  pos,
  rectPositions,
  resolveDimensions,
  rowLabel,
} from "../wellGrid";

describe("wellGrid", () => {
  it("resolves preset dimensions", () => {
    expect(resolveDimensions("96")).toEqual({ rows: 8, columns: 12 });
    expect(resolveDimensions("384")).toEqual({ rows: 16, columns: 24 });
    expect(resolveDimensions("1536")).toEqual({ rows: 32, columns: 48 });
  });

  it("falls back to custom rows/columns", () => {
    expect(resolveDimensions("custom", 4, 6)).toEqual({ rows: 4, columns: 6 });
  });

  it("formats row labels including double-letter rows", () => {
    expect(rowLabel(0)).toBe("A");
    expect(rowLabel(15)).toBe("P");
    expect(rowLabel(25)).toBe("Z");
    expect(rowLabel(26)).toBe("AA");
    expect(rowLabel(31)).toBe("AF");
  });

  it("pads column numbers", () => {
    expect(pos(0, 0, 12)).toBe("A01");
    expect(pos(7, 11, 12)).toBe("H12");
    expect(pos(15, 23, 24)).toBe("P24");
  });

  it("parses well ids", () => {
    expect(parsePos("A01", { rows: 8, columns: 12 })).toEqual({ row: 0, col: 0 });
    expect(parsePos("H12", { rows: 8, columns: 12 })).toEqual({ row: 7, col: 11 });
    expect(parsePos("Z99", { rows: 8, columns: 12 })).toBeNull();
  });

  it("expands rectangles", () => {
    const ps = rectPositions(0, 0, 1, 2, 12);
    expect(ps).toEqual(["A01", "A02", "A03", "B01", "B02", "B03"]);
  });

  it("enumerates every well in a plate", () => {
    const dims = resolveDimensions("96");
    const all = allPositions(dims);
    expect(all).toHaveLength(96);
    expect(all[0]).toBe("A01");
    expect(all.at(-1)).toBe("H12");
  });
});
