import { describe, it, expect } from "vitest";

import { withAnnotations } from "../annotations";

import { plot } from "@/vendor/ts-lib-viz/core";

const base = plot([{ x: 1, y: 2 }], { x: "x", y: "y" })
  .line()
  .spec();

describe("withAnnotations", () => {
  it("returns the spec unchanged when there is nothing to add", () => {
    expect(withAnnotations(base)).toBe(base);
  });

  it("adds a horizontal line for a y value, with its label and style", () => {
    const spec = withAnnotations(base, [{ axis: "y", value: 5, label: "limit", color: "#c00", linetype: "dashed" }]);
    const line = spec.layers.find((layer) => layer.kind === "hline");
    expect(line).toBeDefined();
    expect(line?.style?.color).toBe("#c00");
    expect(line?.style?.linetype).toBe("dashed");
    expect(spec.layers.filter((layer) => layer.kind === "line")).toHaveLength(1);
  });

  it("adds a vertical line for an x value", () => {
    const spec = withAnnotations(base, [{ axis: "x", value: 3 }]);
    expect(spec.layers.some((layer) => layer.kind === "vline")).toBe(true);
    expect(spec.layers.some((layer) => layer.kind === "hline")).toBe(false);
  });

  it("writes each note at its data point", () => {
    const spec = withAnnotations(base, [], [{ x: 1, y: 2, text: "peak" }]);
    expect(spec.annotations).toEqual([{ kind: "note", text: "peak", at: { x: 1, y: 2 } }]);
  });

  it("keeps the annotations the spec already had", () => {
    const withNote = { ...base, annotations: [{ kind: "note" as const, text: "old", at: { x: 0, y: 0 } }] };
    const spec = withAnnotations(withNote, [], [{ x: 1, y: 2, text: "new" }]);
    expect(spec.annotations?.map((note) => (note.kind === "note" ? note.text : ""))).toEqual(["old", "new"]);
  });
});
