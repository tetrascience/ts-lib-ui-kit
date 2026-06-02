import { ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

export interface PlateZoomControlProps {
  zoom: number;
  onZoomChange: (next: number) => void;
  /** Increment per click. Defaults to 0.1. */
  step?: number;
  min?: number;
  max?: number;
  /** Render a percentage readout between the buttons. Defaults to true. */
  showReadout?: boolean;
  className?: string;
}

const ZOOM_DECIMALS = 2;

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
  const setZoom = (next: number) => onZoomChange(clamp(Number(next.toFixed(ZOOM_DECIMALS)), min, max));

  return (
    <ButtonGroup className={cn(className)} data-slot="plate-zoom-control">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Zoom out"
        disabled={zoom <= min}
        onClick={() => setZoom(zoom - step)}
      >
        <ZoomOut aria-hidden />
      </Button>
      {showReadout ? (
        <ButtonGroupText className="min-w-[3.25rem] justify-center text-xs tabular-nums">
          {Math.round(zoom * 100)}%
        </ButtonGroupText>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Zoom in"
        disabled={zoom >= max}
        onClick={() => setZoom(zoom + step)}
      >
        <ZoomIn aria-hidden />
      </Button>
    </ButtonGroup>
  );
}
