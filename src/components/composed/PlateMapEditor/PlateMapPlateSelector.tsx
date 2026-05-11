import { Check, ChevronDown, Plus } from "lucide-react";

import type { PlateMapPlateOption } from "./types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PlateMapPlateSelectorProps {
  plates?: PlateMapPlateOption[];
  activePlateId?: string;
  onPlateChange?: (plateId: string) => void;
  onAddPlate?: () => void;
  addPlateLabel?: string;
  label?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

function PlatePill({ plate, selected }: { plate: PlateMapPlateOption; selected?: boolean }) {
  return (
    <Badge variant={selected ? "info" : "outline"} className="max-w-44">
      <span className="truncate">{plate.label ?? plate.barcode}</span>
    </Badge>
  );
}

export function PlateMapPlateSelector({
  plates = [],
  activePlateId,
  onPlateChange,
  onAddPlate,
  addPlateLabel = "Add Plate",
  label = "Plate",
  align = "start",
  side = "bottom",
  className,
}: PlateMapPlateSelectorProps) {
  const activePlate = plates.find((plate) => plate.id === activePlateId) ?? (activePlateId ? undefined : plates[0]);

  if (plates.length === 0) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!onAddPlate}
        aria-label={addPlateLabel}
        className={cn("min-w-28 justify-start", className)}
        onClick={() => onAddPlate?.()}
      >
        <Plus aria-hidden />
        {addPlateLabel}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={label}
          className={cn("min-w-36 justify-between", className)}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {activePlate ? <PlatePill plate={activePlate} selected /> : <span>{addPlateLabel}</span>}
          </span>
          <ChevronDown aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-64">
        <DropdownMenuGroup>
          {plates.map((plate) => {
            const selected = plate.id === activePlate?.id;
            return (
              <DropdownMenuItem
                key={plate.id}
                disabled={plate.disabled || !onPlateChange}
                onClick={() => onPlateChange?.(plate.id)}
              >
                {selected ? <Check aria-hidden /> : <span className="size-4" aria-hidden />}
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <PlatePill plate={plate} selected={selected} />
                  {plate.count === undefined ? null : (
                    <span className="shrink-0 text-xs text-muted-foreground">{plate.count} wells</span>
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        {onAddPlate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddPlate()}>
              <Plus aria-hidden />
              {addPlateLabel}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
