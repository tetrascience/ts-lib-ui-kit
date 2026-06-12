import Plotly from "plotly.js-dist";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { chartTooltipLines } from "./lines";

import type { ChartTooltipHoverPoint } from "./lines";

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

export interface ChartTooltipAnchor {
  left: number;
  top: number;
  lines: string[];
  /** Plays the exit animation before the tooltip unmounts */
  closing?: boolean;
}

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
}

/** Show the tooltip below the point when the anchor is this close to the top */
const FLIP_THRESHOLD_PX = 72;

/**
 * The design-system tooltip anchored at a chart position; drive it with
 * `useChartTooltip`.
 *
 * Renders the same visual as the ui `TooltipContent` (bubble + arrow) but
 * positions it directly from the anchor coordinates — Radix's popper
 * repositions asynchronously and mis-measures animated content, which made
 * tooltips drift on charts.
 */
export function ChartTooltip({ anchor }: ChartTooltipProps) {
  if (!anchor) return null;
  // Flip below the point when there is no room above it
  const flipped = anchor.top < FLIP_THRESHOLD_PX;
  return createPortal(
    <div
      data-slot="chart-tooltip-anchor"
      className="pointer-events-none fixed z-50"
      style={{ left: anchor.left, top: anchor.top }}
    >
      {/* Positioning transforms live on this node; animations (which also
          drive `transform`) live on the bubble below so they can't clobber
          each other */}
      <div
        className={cn(
          "w-max -translate-x-1/2",
          flipped
            ? "translate-y-[10px]"
            : "-translate-y-[calc(100%+10px)]",
        )}
      >
        <div
          data-slot="tooltip-content"
          data-side={flipped ? "bottom" : "top"}
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
              "absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground",
              flipped ? "-top-1" : "-bottom-1",
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
}

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

  const bindTooltip = useCallback((plotDiv: HTMLElement | null) => {
    if (!plotDiv) return;
    setAnchor(null);

    // A larger hover radius makes the tooltip easier to acquire and keep
    void Plotly.relayout(plotDiv, { hoverdistance: HOVER_DISTANCE_PX });

    const emitter = plotDiv as unknown as ChartTooltipEmitter;

    emitter.on("plotly_hover", (eventData) => {
      const points = eventData.points ?? [];
      const { getLines, xLabel, yLabel } = optionsRef.current;
      const lines = getLines
        ? getLines(points)
        : chartTooltipLines(points, { xLabel, yLabel });
      if (lines.length === 0) return;

      clearTimeout(hideTimerRef.current);
      // Anchor to the hovered point's bounds (in plot-div pixels) when
      // Plotly provides them; fall back to the mouse position. The anchor
      // is position:fixed, so viewport coordinates are used directly.
      const bbox = points[0]?.bbox;
      const mouse = eventData.event;
      let left = 0;
      let top = 0;
      if (bbox) {
        const rect = plotDiv.getBoundingClientRect();
        left = rect.left + (bbox.x0 + bbox.x1) / 2;
        top = rect.top + Math.min(bbox.y0, bbox.y1);
      } else if (mouse) {
        left = mouse.clientX;
        top = mouse.clientY;
      }
      setAnchor({ left, top, lines });
    });

    emitter.on("plotly_unhover", () => {
      clearTimeout(hideTimerRef.current);
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
    tooltipElement: <ChartTooltip anchor={anchor} />,
  };
}
