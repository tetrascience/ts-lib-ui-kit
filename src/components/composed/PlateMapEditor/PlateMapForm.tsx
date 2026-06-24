import * as React from "react";

import { WellMetadataForm } from "./WellMetadataForm";

import type { WellField, WellRecord } from "./types";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface PlateMapFormProps<T extends WellRecord = WellRecord> {
  fields: WellField<T>[];
  /** Staged values applied across the current selection on Apply. */
  value: Partial<T>;
  onChange: (next: Partial<T>) => void;
  selectionSize: number;
  onApply: () => void;
  onClear: () => void;
  applyLabel?: string;
  clearLabel?: string;
  /** Helper slot rendered between the fields and the action row. */
  extras?: React.ReactNode;
  /** Legend block rendered beneath the form, separated by a divider. */
  legend?: React.ReactNode;
  /**
   * Fully replaces the built-in `WellMetadataForm` — e.g. a drag-and-drop
   * source palette. The legend slot still renders beneath the replacement.
   */
  formSlot?: React.ReactNode;
  className?: string;
}

/**
 * Card-agnostic metadata form panel. Renders the staged-value form (or a
 * caller-supplied `formSlot`) plus an optional legend. Bring your own
 * container — drop it bare into a sidebar, wrap it in a `Card`, or stack it
 * above the grid.
 */
export function PlateMapForm<T extends WellRecord = WellRecord>({
  fields,
  value,
  onChange,
  selectionSize,
  onApply,
  onClear,
  applyLabel,
  clearLabel,
  extras,
  legend,
  formSlot,
  className,
}: PlateMapFormProps<T>) {
  return (
    <div data-slot="plate-map-form" className={cn("flex flex-col gap-3", className)}>
      {formSlot ?? (
        <WellMetadataForm<T>
          fields={fields}
          value={value}
          onChange={onChange}
          selectionSize={selectionSize}
          onApply={onApply}
          onClear={onClear}
          applyLabel={applyLabel}
          clearLabel={clearLabel}
          extras={extras}
        />
      )}
      {legend ? (
        <>
          <Separator />
          {legend}
        </>
      ) : null}
    </div>
  );
}
