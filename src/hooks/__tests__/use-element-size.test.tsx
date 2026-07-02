import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useElementSize, type ElementSize } from "../use-element-size";

import type { Root } from "react-dom/client";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ResizeCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;

// Controllable ResizeObserver stub: capture the observed element and the
// callback so tests can push synthetic measurements (jsdom has no layout).
let observed: Element | null;
let triggerResize: (width: number, height: number) => void;
let disconnectSpy: ReturnType<typeof vi.fn>;

class ResizeObserverStub {
  constructor(private callback: ResizeCallback) {
    triggerResize = (width, height) => this.callback([{ contentRect: { width, height } }]);
  }
  observe(element: Element) {
    observed = element;
  }
  unobserve() {}
  disconnect() {
    disconnectSpy();
  }
}

const roots: Array<{ root: Root; container: HTMLElement }> = [];

function renderHook() {
  const result: { current: { ref: React.RefObject<HTMLDivElement | null>; size: ElementSize } } = {
    current: { ref: { current: null }, size: { width: 0, height: 0 } },
  };

  function Probe() {
    const [ref, size] = useElementSize<HTMLDivElement>();
    result.current = { ref, size };
    return <div ref={ref} />;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => {
    root.render(<Probe />);
  });
  return result;
}

beforeEach(() => {
  observed = null;
  disconnectSpy = vi.fn();
  (globalThis as unknown as { ResizeObserver?: typeof ResizeObserverStub }).ResizeObserver =
    ResizeObserverStub;
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
});

describe("useElementSize", () => {
  it("starts at zero and observes the attached element", () => {
    const result = renderHook();
    expect(result.current.size).toEqual({ width: 0, height: 0 });
    expect(observed).toBe(result.current.ref.current);
  });

  it("reports rounded dimensions from ResizeObserver entries", () => {
    const result = renderHook();
    act(() => {
      triggerResize(320.4, 199.6);
    });
    expect(result.current.size).toEqual({ width: 320, height: 200 });
  });

  it("keeps a stable size object when measurements are unchanged", () => {
    const result = renderHook();
    act(() => {
      triggerResize(100, 100);
    });
    const first = result.current.size;
    act(() => {
      triggerResize(100.2, 99.8);
    });
    // Rounds to the same values, so the identity must not change.
    expect(result.current.size).toBe(first);
  });

  it("disconnects the observer on unmount", () => {
    renderHook();
    act(() => {
      roots[0].root.unmount();
    });
    roots.shift();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it("stays at zero when ResizeObserver is unavailable", () => {
    (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver = undefined;
    const result = renderHook();
    expect(result.current.size).toEqual({ width: 0, height: 0 });
  });
});
