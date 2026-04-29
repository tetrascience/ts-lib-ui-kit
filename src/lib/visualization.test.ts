import { createElement } from "react";
import { describe, it, expect } from "vitest";

import { isVisualizationComponent, withVisualization, type VisualizationMeta } from "./visualization";

import type { FC } from "react";

const TestComponent: FC<{ label: string }> = ({ label }) => createElement("div", null, label);

const META: VisualizationMeta = {
  id: "test-viz",
  inputKind: "test_kind",
  description: "Test visualization for unit tests.",
  tunableProps: [
    {
      name: "color",
      type: "string",
      description: "Stroke color.",
      default: "#000000",
    },
  ],
};

describe("withVisualization", () => {
  it("attaches metadata as a static property", () => {
    const Wrapped = withVisualization(TestComponent, META);
    expect(Wrapped.visualization).toEqual(META);
  });

  it("preserves the original component reference", () => {
    const Wrapped = withVisualization(TestComponent, META);
    expect(Wrapped).toBe(TestComponent);
  });
});

describe("isVisualizationComponent", () => {
  it("recognizes a wrapped component", () => {
    const Wrapped = withVisualization(TestComponent, META);
    expect(isVisualizationComponent(Wrapped)).toBe(true);
  });

  it("rejects a plain component", () => {
    const Plain: FC = () => createElement("span");
    expect(isVisualizationComponent(Plain)).toBe(false);
  });

  it("rejects non-component values", () => {
    expect(isVisualizationComponent()).toBe(false);
    expect(isVisualizationComponent({})).toBe(false);
    expect(isVisualizationComponent("plate-map")).toBe(false);
  });
});
