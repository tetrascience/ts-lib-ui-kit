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

/** How far (px) from a point Plotly still reports a hover — larger = stickier */
const HOVER_DISTANCE_PX = 40;
/** Grace period before hiding, so the tooltip survives gaps between points */
const HIDE_GRACE_MS = 150;
/** Distance (px) between the anchor position and the tooltip arrow */
const TOOLTIP_OFFSET_PX = 12;

export interface ChartTooltipAnchor {
  left: number;
  top: number;
  lines: string[];
}

interface ChartTooltipEmitter {
  on: (event: string, handler: (data: ChartTooltipHoverEvent) => void) => void;
}

interface ChartTooltipHoverEvent {
  points?: ChartTooltipHoverPoint[];
  event?: MouseEvent;
}

export interface ChartTooltipProps {
  /** Anchor position (relative to the chart container) and content lines */
  anchor: ChartTooltipAnchor | null;
}

/**
 * The design-system tooltip anchored at a chart position. Render inside a
 * `relative` chart container; drive it with `useChartTooltip`.
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
            className="pointer-events-none absolute size-0"
            style={{ left: anchor.left, top: anchor.top }}
          />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={TOOLTIP_OFFSET_PX}
          className="pointer-events-none"
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
 * // in the (relative-positioned) container:
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
      const rect = plotDiv.getBoundingClientRect();
      const mouse = eventData.event;
      setAnchor({
        left: mouse ? mouse.clientX - rect.left : 0,
        top: mouse ? mouse.clientY - rect.top : 0,
        lines,
      });
    });

    emitter.on("plotly_unhover", () => {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setAnchor(null), HIDE_GRACE_MS);
    });
  }, []);

  return {
    bindTooltip,
    tooltipElement: <ChartTooltip anchor={anchor} />,
  };
}
