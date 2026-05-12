import { Check, ChevronDown, Plus, X } from "lucide-react";

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

export type PlateMapPlateSelectorVariant = "dropdown" | "tabs";

export interface PlateMapPlateSelectorProps {
  plates?: PlateMapPlateOption[];
  activePlateId?: string;
  onPlateChange?: (plateId: string) => void;
  onAddPlate?: () => void;
  /** When supplied, the tabs variant renders a delete affordance per plate. */
  onRemovePlate?: (plateId: string) => void;
  addPlateLabel?: string;
  removePlateLabel?: string;
  label?: string;
  /** Layout. `"dropdown"` is the default single-trigger menu, `"tabs"` is a horizontal tab strip. */
  variant?: PlateMapPlateSelectorVariant;
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
  onRemovePlate,
  addPlateLabel = "Add Plate",
  removePlateLabel = "Remove plate",
  label = "Plate",
  variant = "dropdown",
  align = "start",
  side = "bottom",
  className,
}: PlateMapPlateSelectorProps) {
  const activePlate = plates.find((plate) => plate.id === activePlateId) ?? (activePlateId ? undefined : plates[0]);

  if (variant === "tabs") {
    return (
      <div
        role="tablist"
        aria-label={label}
        className={cn("flex flex-wrap items-center gap-1", className)}
        data-slot="plate-tabs"
      >
        {plates.map((plate) => {
          const selected = plate.id === activePlate?.id;
          const canRemove = !!onRemovePlate && plates.length > 1;
          return (
            <div
              key={plate.id}
              className={cn(
                "inline-flex items-stretch overflow-hidden rounded-md border",
                selected ? "border-primary" : "border-border",
              )}
            >
              <Button
                type="button"
                role="tab"
                aria-selected={selected}
                variant={selected ? "default" : "ghost"}
                size="sm"
                disabled={plate.disabled || !onPlateChange}
                className="h-7 rounded-none border-0 px-2 text-xs"
                onClick={() => onPlateChange?.(plate.id)}
              >
                <span className="truncate">{plate.label ?? plate.barcode}</span>
                {plate.count === undefined ? null : (
                  <span
                    className={cn(
                      "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-sm px-1 text-[0.65rem] font-semibold",
                      selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {plate.count}
                  </span>
                )}
              </Button>
              {canRemove ? (
                <Button
                  type="button"
                  variant={selected ? "default" : "ghost"}
                  size="icon-xs"
                  aria-label={`${removePlateLabel} ${plate.label ?? plate.barcode}`}
                  className="h-7 rounded-none border-0 border-l border-border/60"
                  onClick={() => onRemovePlate?.(plate.id)}
                >
                  <X aria-hidden />
                </Button>
              ) : null}
            </div>
          );
        })}
        {onAddPlate ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={addPlateLabel}
            className="h-7"
            onClick={() => onAddPlate()}
          >
            <Plus aria-hidden />
          </Button>
        ) : null}
      </div>
    );
  }

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
