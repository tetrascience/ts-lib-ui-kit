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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
      <div className={cn("inline-flex flex-wrap items-center gap-1", className)} data-slot="plate-tabs">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={activePlate?.id ?? ""}
          aria-label={label}
          onValueChange={(value) => {
            if (value) onPlateChange?.(value);
          }}
        >
          {plates.map((plate) => {
            const selected = plate.id === activePlate?.id;
            const canRemove = !!onRemovePlate && plates.length > 1;
            return (
              <div key={plate.id} className="inline-flex items-stretch">
                <ToggleGroupItem
                  value={plate.id}
                  disabled={plate.disabled || !onPlateChange}
                  aria-label={plate.label ?? plate.barcode}
                  className={cn(canRemove && "rounded-r-none border-r-0")}
                >
                  <span className="truncate">{plate.label ?? plate.barcode}</span>
                  {plate.count === undefined ? null : (
                    <Badge variant={selected ? "secondary" : "outline"} className="ml-1 h-4 px-1 text-[0.65rem]">
                      {plate.count}
                    </Badge>
                  )}
                </ToggleGroupItem>
                {canRemove ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`${removePlateLabel} ${plate.label ?? plate.barcode}`}
                    className="rounded-l-none"
                    onClick={() => onRemovePlate?.(plate.id)}
                  >
                    <X aria-hidden />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </ToggleGroup>
        {onAddPlate ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={addPlateLabel} onClick={() => onAddPlate()}>
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
    // `modal={false}`: this is a lightweight plate-picker menu, not a
    // blocking modal — the trigger and rest of the editor should stay
    // perceivable and focusable while the menu is open (Radix's default
    // `modal` otherwise marks the trigger `aria-hidden` while it remains
    // focusable, which trips axe's aria-hidden-focus rule).
    <DropdownMenu modal={false}>
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
