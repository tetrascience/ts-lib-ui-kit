import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useComposedRefs } from "../compose-refs";
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const IS_REACT_18 = React.version.startsWith("18.");

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/**
 * A component that needs its own ref and also accepts a consumer's. The consumer ref
 * travels as an ordinary prop: React 18 strips a `ref` prop from plain function
 * components, and this tests the hook, not React's ref delivery.
 */
function Box({ consumer, internal }: { consumer?: React.Ref<HTMLDivElement>; internal: React.Ref<HTMLDivElement> }) {
  return <div data-testid="box" ref={useComposedRefs(internal, consumer)} />;
}

const box = () => container.querySelector('[data-testid="box"]');

describe("useComposedRefs", () => {
  it("writes the node to both an object ref and a callback ref, and clears them on unmount", () => {
    const internal = React.createRef<HTMLDivElement>();
    const seen: Array<HTMLDivElement | null> = [];
    const consumer = (node: HTMLDivElement | null) => void seen.push(node);
    act(() => root.render(<Box internal={internal} consumer={consumer} />));
    expect(internal.current).toBe(box());
    expect(seen.at(-1)).toBe(box());

    act(() => root.render(<span />));
    expect(internal.current).toBeNull();
    expect(seen.at(-1)).toBeNull();
  });

  it("tolerates a missing consumer ref", () => {
    const internal = React.createRef<HTMLDivElement>();
    act(() => root.render(<Box internal={internal} />));
    expect(internal.current).toBe(box());
  });

  it("moves the node to a swapped consumer ref while the element stays mounted", () => {
    const internal = React.createRef<HTMLDivElement>();
    const first = React.createRef<HTMLDivElement>();
    const second = React.createRef<HTMLDivElement>();
    act(() => root.render(<Box internal={internal} consumer={first} />));
    const node = box();
    expect(first.current).toBe(node);

    act(() => root.render(<Box internal={internal} consumer={second} />));
    expect(box()).toBe(node);
    expect(first.current).toBeNull();
    expect(second.current).toBe(node);
    expect(internal.current).toBe(node);

    act(() => root.render(<span />));
    expect(second.current).toBeNull();
    expect(internal.current).toBeNull();
  });

  it("clears a consumer ref that is removed while the element stays mounted", () => {
    const internal = React.createRef<HTMLDivElement>();
    const conditional = React.createRef<HTMLDivElement>();
    act(() => root.render(<Box internal={internal} consumer={conditional} />));
    expect(conditional.current).toBe(box());

    act(() => root.render(<Box internal={internal} />));
    expect(conditional.current).toBeNull();
    expect(internal.current).toBe(box());
  });

  it.runIf(!IS_REACT_18)("runs a React 19 callback ref's cleanup instead of calling it with null", () => {
    const internal = React.createRef<HTMLDivElement>();
    const cleanup = vi.fn();
    const consumer = vi.fn((node: HTMLDivElement | null) => {
      if (node === null) throw new Error("a cleanup-returning ref must not be called with null");
      return cleanup;
    });
    act(() => root.render(<Box internal={internal} consumer={consumer} />));
    expect(consumer).toHaveBeenCalledWith(box());

    act(() => root.render(<span />));
    expect(cleanup).toHaveBeenCalledOnce();
    expect(consumer).toHaveBeenCalledTimes(1);
    // The ref without a cleanup is still cleared on the cleanup path.
    expect(internal.current).toBeNull();
  });
});
