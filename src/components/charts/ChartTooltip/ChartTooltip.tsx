import Plotly from "plotly.js-dist";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { chartTooltipLines } from "./lines";

import type { ChartTooltipHoverPoint } from "./lines";
import type { Ref } from "react";

import { cn } from "@/lib/utils";

export { chartTooltipLines } from "./lines";
export type { ChartTooltipHoverPoint } from "./lines";

/**
 * How far (px) from a point Plotly still reports a hover. Matches Plotly's
 * default — a larger radius makes tooltips snap to neighbors in dense plots
 */
const HOVER_DISTANCE_PX = 20;
/** Grace period before hiding, so the tooltip survives gaps between points */
const HIDE_GRACE_MS = 150;
/** How long the exit animation plays before the tooltip unmounts */
const EXIT_ANIMATION_MS = 200;

/** Which edge of the point the tooltip is placed against (matches Radix). */
export type ChartTooltipSide = "top" | "bottom" | "left" | "right";

export interface ChartTooltipAnchor {
  left: number;
  top: number;
  lines: string[];
  /** Preferred placement side; auto-flips to the opposite when it won't fit */
  side?: ChartTooltipSide;
  /** Plays the exit animation before the tooltip unmounts */
  closing?: boolean;
}

/** Keep an anchor point this far from the viewport edges when clamping */
const VIEWPORT_PADDING_PX = 8;
/** Gap (px) between the anchor point and the bubble on every side */
const TOOLTIP_GAP_PX = 10;

/** The opposite side to flip to when the preferred one has no room */
const OPPOSITE_SIDE: Record<ChartTooltipSide, ChartTooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * Per-side transforms. The wrapper carries positioning transforms (kept off
 * the bubble so they don't clobber the entry/exit animation), and the arrow
 * sits on the edge facing the point.
 */
const SIDE_CLASSES: Record<ChartTooltipSide, { wrapper: string; arrow: string }> = {
  top: {
    wrapper: "-translate-x-1/2 -translate-y-[calc(100%+10px)]",
    arrow: "-bottom-1 left-1/2 -translate-x-1/2",
  },
  bottom: {
    wrapper: "-translate-x-1/2 translate-y-[10px]",
    arrow: "-top-1 left-1/2 -translate-x-1/2",
  },
  left: {
    wrapper: "-translate-y-1/2 -translate-x-[calc(100%+10px)]",
    arrow: "-right-1 top-1/2 -translate-y-1/2",
  },
  right: {
    wrapper: "-translate-y-1/2 translate-x-[10px]",
    arrow: "-left-1 top-1/2 -translate-y-1/2",
  },
};

interface ChartTooltipEmitter {
  on: (event: string, handler: (data: ChartTooltipHoverEvent) => void) => void;
}

interface ChartTooltipHoverEvent {
  points?: ChartTooltipHoverPoint[];
  event?: MouseEvent;
}

export interface ChartTooltipProps {
  /** Anchor position (viewport coordinates) and content lines */
  anchor: ChartTooltipAnchor | null;
  /** Ref to the bubble node, used by cursor-following charts to clamp it on-screen */
  bubbleRef?: Ref<HTMLDivElement>;
}

/**
 * Resolve the side the bubble actually renders on: keep the preferred side
 * when it fits in the viewport, otherwise flip to the opposite side.
 */
const resolveSide = (
  preferred: ChartTooltipSide,
  anchor: { left: number; top: number },
  width: number,
  height: number,
): ChartTooltipSide => {
  const pad = VIEWPORT_PADDING_PX;
  const reach = TOOLTIP_GAP_PX;
  const fits: Record<ChartTooltipSide, boolean> = {
    top: anchor.top - reach - height >= pad,
    bottom: anchor.top + reach + height <= window.innerHeight - pad,
    left: anchor.left - reach - width >= pad,
    right: anchor.left + reach + width <= window.innerWidth - pad,
  };
  // Flip only when the preferred side overflows and the opposite has room
  if (!fits[preferred] && fits[OPPOSITE_SIDE[preferred]]) {
    return OPPOSITE_SIDE[preferred];
  }
  return preferred;
};

/**
 * The design-system tooltip anchored at a chart position; drive it with
 * `useChartTooltip`.
 *
 * Renders the same visual as the ui `TooltipContent` (bubble + arrow) but
 * positions it directly from the anchor coordinates — Radix's popper
 * repositions asynchronously and mis-measures animated content, which made
 * tooltips drift on charts. Placement supports all four sides with
 * Radix-style collision flipping.
 */
export function ChartTooltip({ anchor, bubbleRef }: ChartTooltipProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const preferredSide = anchor?.side ?? "top";
  const [resolvedSide, setResolvedSide] = useState<ChartTooltipSide>(preferredSide);

  // Forward the wrapper node to both the internal measure ref and the
  // optional external ref (used by cursor-following charts to clamp it)
  const setBubbleNode = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof bubbleRef === "function") bubbleRef(node);
      else if (bubbleRef) {
        (bubbleRef as { current: HTMLDivElement | null }).current = node;
      }
    },
    [bubbleRef],
  );

  // Measure before paint and flip to the opposite side if needed
  useLayoutEffect(() => {
    const node = wrapperRef.current;
    if (!anchor || !node) return;
    const next = resolveSide(
      preferredSide,
      anchor,
      node.offsetWidth,
      node.offsetHeight,
    );
    setResolvedSide((current) => (current === next ? current : next));
  }, [anchor, preferredSide]);

  if (!anchor) return null;
  const side = SIDE_CLASSES[resolvedSide];
  return createPortal(
    <div
      data-slot="chart-tooltip-anchor"
      className="pointer-events-none fixed z-50"
      style={{ left: anchor.left, top: anchor.top }}
    >
      {/* Positioning transforms live on this node; animations (which also
          drive `transform`) live on the bubble below so they can't clobber
          each other */}
      <div ref={setBubbleNode} className={cn("w-max", side.wrapper)}>
        <div
          role="tooltip"
          data-slot="tooltip-content"
          data-side={resolvedSide}
          className={cn(
            "relative w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
            anchor.closing
              ? "animate-out fade-out zoom-out-95 fill-mode-forwards"
              : "animate-in fade-in-0 zoom-in-95",
          )}
        >
          {anchor.lines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))}
          <span
            aria-hidden
            className={cn(
              "absolute size-2.5 rotate-45 rounded-[2px] bg-foreground",
              side.arrow,
            )}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export interface UseChartTooltipOptions {
  /** Axis label used for the default x line (falls back to "X") */
  xLabel?: string;
  /** Axis label used for the default y line (falls back to "Y") */
  yLabel?: string;
  /** Override the default line builder entirely */
  getLines?: (points: ChartTooltipHoverPoint[]) => string[];
  /**
   * Track the cursor instead of anchoring to the hovered point's bounds, and
   * keep the tooltip clamped inside the viewport. Use for traces with large
   * hover targets (e.g. pie slices) where a fixed anchor feels disconnected.
   */
  followCursor?: boolean;
  /**
   * Override Plotly's hover hit radius (px). A larger radius makes big markers
   * (e.g. heatmap circles) hoverable across their whole face.
   */
  hoverDistance?: number;
  /**
   * Preferred side to place the tooltip on relative to the point. Auto-flips to
   * the opposite side when there isn't room (Radix-style). Defaults to "top".
   */
  side?: ChartTooltipSide;
}

/** Clamp an anchor point so a bubble of `width`×`height` stays on-screen */
const clampAnchor = (
  left: number,
  top: number,
  width: number,
  height: number,
): { left: number; top: number } => {
  const halfWidth = width / 2;
  const clampedLeft = Math.min(
    Math.max(left, halfWidth + VIEWPORT_PADDING_PX),
    window.innerWidth - halfWidth - VIEWPORT_PADDING_PX,
  );
  // The bubble sits above the anchor; keep its top edge inside the viewport
  const clampedTop = Math.min(
    Math.max(top, height + 10 + VIEWPORT_PADDING_PX),
    window.innerHeight - VIEWPORT_PADDING_PX,
  );
  return { left: clampedLeft, top: clampedTop };
};

/**
 * Drives the design-system tooltip from Plotly hover events.
 *
 * ```tsx
 * const { bindTooltip, tooltipElement } = useChartTooltip({ xLabel, yLabel });
 * // after Plotly.newPlot(...): set trace hoverinfo to "none", then
 * bindTooltip(plotRef.current);
 * // anywhere in the chart markup:
 * {tooltipElement}
 * ```
 */
export function useChartTooltip(options: UseChartTooltipOptions = {}) {
  const [anchor, setAnchor] = useState<ChartTooltipAnchor | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  // Measured bubble node, used to clamp the cursor-following tooltip on-screen
  const bubbleRef = useRef<HTMLDivElement>(null);
  // Active lines while a cursor-following tooltip is shown; null when hidden
  const cursorLinesRef = useRef<string[] | null>(null);
  // Removes the mousemove listener registered by the previous bindTooltip call
  const detachMouseMoveRef = useRef<(() => void) | null>(null);

  const bindTooltip = useCallback((plotDiv: HTMLElement | null) => {
    if (!plotDiv) return;
    // The chart effect can re-run (size/theme/props changes) and call this
    // again on the same node; drop the prior mousemove listener so they don't
    // accumulate. (Plotly's own hover/unhover handlers are cleared by newPlot.)
    detachMouseMoveRef.current?.();
    detachMouseMoveRef.current = null;
    setAnchor(null);
    cursorLinesRef.current = null;

    // A larger hover radius makes the tooltip easier to acquire and keep
    void Plotly.relayout(plotDiv, {
      hoverdistance: optionsRef.current.hoverDistance ?? HOVER_DISTANCE_PX,
    });

    const emitter = plotDiv as unknown as ChartTooltipEmitter;

    // Place the cursor-following tooltip at the (clamped) cursor position
    const positionAtCursor = (lines: string[], clientX: number, clientY: number) => {
      const bubble = bubbleRef.current;
      const { left, top } = clampAnchor(
        clientX,
        clientY,
        bubble?.offsetWidth ?? 0,
        bubble?.offsetHeight ?? 0,
      );
      setAnchor({ left, top, lines, side: optionsRef.current.side });
    };

    emitter.on("plotly_hover", (eventData) => {
      const points = eventData.points ?? [];
      const { getLines, xLabel, yLabel, followCursor } = optionsRef.current;
      const lines = getLines
        ? getLines(points)
        : chartTooltipLines(points, { xLabel, yLabel });
      if (lines.length === 0) return;

      clearTimeout(hideTimerRef.current);

      const mouse = eventData.event;
      if (followCursor) {
        cursorLinesRef.current = lines;
        positionAtCursor(lines, mouse?.clientX ?? 0, mouse?.clientY ?? 0);
        return;
      }

      // Anchor to the hovered point's bounds (in plot-div pixels) when
      // Plotly provides them; fall back to the mouse position. The anchor
      // is position:fixed, so viewport coordinates are used directly.
      const point = points[0];
      const bbox = point?.bbox;
      let left = 0;
      let top = 0;
      if (bbox) {
        const rect = plotDiv.getBoundingClientRect();
        left = rect.left + (bbox.x0 + bbox.x1) / 2;
        // Bars report a zero-height bbox that sits below their visual top;
        // anchor to the bar's true top via the axis projection instead.
        const yaxis = point?.yaxis;
        if (
          bbox.y0 === bbox.y1 &&
          typeof point?.y === "number" &&
          typeof yaxis?.l2p === "function" &&
          typeof yaxis._offset === "number"
        ) {
          top = rect.top + yaxis._offset + yaxis.l2p(point.y);
        } else {
          top = rect.top + Math.min(bbox.y0, bbox.y1);
        }
      } else if (mouse) {
        left = mouse.clientX;
        top = mouse.clientY;
      }
      setAnchor({ left, top, lines, side: optionsRef.current.side });
    });

    // While following the cursor, keep the tooltip glued to the pointer even
    // when Plotly does not re-fire hover within the same point (e.g. a slice)
    const handleMouseMove = (event: MouseEvent) => {
      if (!optionsRef.current.followCursor) return;
      const lines = cursorLinesRef.current;
      if (!lines) return;
      positionAtCursor(lines, event.clientX, event.clientY);
    };
    plotDiv.addEventListener("mousemove", handleMouseMove);
    detachMouseMoveRef.current = () =>
      plotDiv.removeEventListener("mousemove", handleMouseMove);

    emitter.on("plotly_unhover", () => {
      clearTimeout(hideTimerRef.current);
      cursorLinesRef.current = null;
      // After the grace period, play the exit animation, then unmount
      hideTimerRef.current = setTimeout(() => {
        setAnchor((previous) =>
          previous ? { ...previous, closing: true } : previous,
        );
        hideTimerRef.current = setTimeout(() => setAnchor(null), EXIT_ANIMATION_MS);
      }, HIDE_GRACE_MS);
    });
  }, []);

  return {
    bindTooltip,
    tooltipElement: <ChartTooltip anchor={anchor} bubbleRef={bubbleRef} />,
  };
}
