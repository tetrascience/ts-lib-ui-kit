import Plotly from "plotly.js-dist";
import { useCallback, useRef, useState } from "react";

import { chartTooltipLines } from "./lines";

import type { ChartTooltipHoverPoint } from "./lines";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
/** Distance (px) between the anchor position and the tooltip arrow */
const TOOLTIP_OFFSET_PX = 6;

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

/**
 * The design-system tooltip anchored at a chart position; drive it with
 * `useChartTooltip`.
 */
export function ChartTooltip({ anchor }: ChartTooltipProps) {
  if (!anchor) return null;
  return (
    <TooltipProvider>
      {/* Re-key per anchor so Radix repositions to the moved trigger */}
      <Tooltip open key={`${anchor.left},${anchor.top}`}>
        <TooltipTrigger asChild>
          <span
            aria-hidden
            data-slot="chart-tooltip-anchor"
            className="pointer-events-none fixed size-0"
            style={{ left: anchor.left, top: anchor.top }}
          />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={TOOLTIP_OFFSET_PX}
          // The base component only animates Radix-managed states; controlled
          // chart tooltips animate entry on mount and exit via `closing`
          className={
            anchor.closing
              ? "pointer-events-none animate-out fade-out-0 zoom-out-95 fill-mode-forwards"
              : "pointer-events-none animate-in fade-in-0 zoom-in-95"
          }
        >
          {anchor.lines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
