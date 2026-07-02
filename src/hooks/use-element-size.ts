import { useEffect, useRef, useState } from "react";

/** Element dimensions in CSS pixels, rounded to whole numbers. */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Observe an element's content-box size with a `ResizeObserver` and return the
 * latest rounded `{ width, height }`.
 *
 * Attach the returned `ref` to the element whose size should drive layout
 * (e.g. the flex/grid cell a chart needs to fill). The size is `{ 0, 0 }` until
 * the first measurement, and stays `{ 0, 0 }` in environments without a
 * `ResizeObserver` (e.g. SSR), so callers should treat a zero dimension as
 * "not yet measured" and skip work that needs real pixels.
 *
 * @example
 * ```tsx
 * const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();
 * return <div ref={containerRef} className="size-full">…</div>;
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  React.RefObject<T | null>,
  ElementSize,
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      // Bail on identical measurements so consumers driving Plotly layout off
      // this size don't trigger a redundant relayout (and a feedback loop).
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
