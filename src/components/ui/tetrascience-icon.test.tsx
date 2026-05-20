import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { TetraScienceIcon } from "./tetrascience-icon";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
});

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui));
  return container;
}

describe("TetraScienceIcon", () => {
  it("renders the branded SVG with defaults and forwarded props", () => {
    const ref = React.createRef<SVGSVGElement>();

    render(
      <TetraScienceIcon
        ref={ref}
        aria-label="TetraScience"
        className="text-primary"
        data-testid="tetra-icon"
        fill="rebeccapurple"
        size={32}
      />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBe(ref.current);
    expect(svg?.getAttribute("aria-label")).toBe("TetraScience");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg?.className.baseVal).toContain("shrink-0");
    expect(svg?.className.baseVal).toContain("text-primary");

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(2);
    expect(paths[0]?.getAttribute("stroke")).toBe("rebeccapurple");
    expect(paths[1]?.getAttribute("fill")).toBe("rebeccapurple");
  });
});
