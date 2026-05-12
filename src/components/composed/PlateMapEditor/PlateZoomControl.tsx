import { ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PlateZoomControlProps {
  zoom: number;
  onZoomChange: (next: number) => void;
  /** Increment per click. Defaults to 0.1. */
  step?: number;
  min?: number;
  max?: number;
  /** Render a percentage readout beside the buttons. Defaults to true. */
  showReadout?: boolean;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function PlateZoomControl({
  zoom,
  onZoomChange,
  step = 0.1,
  min = 0.5,
  max = 2,
  showReadout = true,
  className,
}: PlateZoomControlProps) {
  const setZoom = (next: number) => onZoomChange(clamp(Number(next.toFixed(2)), min, max));

  return (
    <div className={cn("inline-flex items-center gap-1", className)} data-slot="plate-zoom-control">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Zoom out"
        disabled={zoom <= min}
        onClick={() => setZoom(zoom - step)}
      >
        <ZoomOut aria-hidden />
      </Button>
      {showReadout ? (
        <span className="min-w-[44px] text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Zoom in"
        disabled={zoom >= max}
        onClick={() => setZoom(zoom + step)}
      >
        <ZoomIn aria-hidden />
      </Button>
    </div>
  );
}
