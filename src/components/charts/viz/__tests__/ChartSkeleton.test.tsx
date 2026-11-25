import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChartSkeleton } from "../ChartSkeleton";

import type { ChartSkeletonShape } from "../ChartSkeleton";
import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container?.remove();
  container = null;
  vi.restoreAllMocks();
});

function mount(element: React.ReactElement): HTMLElement {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(element));
  return container.firstElementChild as HTMLElement;
}

const paths = (box: HTMLElement) => [...box.querySelectorAll("path")].map((path) => path.getAttribute("d"));

const SHAPES: ChartSkeletonShape[] = ["line", "area", "bar", "histogram", "box", "scatter", "pie", "plate", "trace"];

describe("ChartSkeleton", () => {
  it.each(SHAPES)("draws the %s outline, names it, and marks the region busy without text", (shape) => {
    const box = mount(<ChartSkeleton shape={shape} width={300} height={200} />);
    expect(box.getAttribute("data-ts-chart-loading")).toBe(shape);
    expect(box.getAttribute("aria-busy")).toBe("true");
    expect(box.textContent).toBe("");
    expect(box.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(paths(box).length).toBeGreaterThan(0);
  });

  it("draws a different outline for each shape", () => {
    const drawn = SHAPES.map((shape) =>
      paths(mount(<ChartSkeleton shape={shape} width={300} height={200} />)).join("|"),
    );
    expect(new Set(drawn).size).toBe(SHAPES.length);
  });

  it("puts axes under the plotted shapes and none under a pie or a plate", () => {
    const AXES = "M8 4V54H96";
    expect(paths(mount(<ChartSkeleton shape="bar" width={300} height={200} />))).toContain(AXES);
    expect(paths(mount(<ChartSkeleton shape="pie" width={300} height={200} />))).not.toContain(AXES);
    expect(paths(mount(<ChartSkeleton shape="plate" width={300} height={200} />))).not.toContain(AXES);
  });

  it("keeps a round outline's proportions and stretches the others to the box", () => {
    const aspect = (shape: ChartSkeletonShape) =>
      mount(<ChartSkeleton shape={shape} width={300} height={200} />)
        .querySelector("svg")
        ?.getAttribute("preserveAspectRatio");
    expect(aspect("pie")).toBe("xMidYMid meet");
    expect(aspect("plate")).toBe("xMidYMid meet");
    expect(aspect("line")).toBe("none");
  });

  it("takes the chart's stated size", () => {
    const box = mount(<ChartSkeleton shape="line" width={300} height={200} />);
    expect(box.style.width).toBe("300px");
    expect(box.style.height).toBe("200px");
  });

  it("fills its parent when the parent has a height to give", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
    const box = mount(<ChartSkeleton shape="line" />);
    expect(box.style.width).toBe("100%");
    expect(box.style.height).toBe("100%");
  });

  it("draws at the chart's default height when the parent has none to give", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(0);
    const box = mount(<ChartSkeleton shape="line" />);
    expect(box.style.height).toBe("320px");
  });
});
