import type { WellSelectOption } from "./types";

import { cn } from "@/lib/utils";

export interface WellQuickPaintProps {
  /** Swatch options, normally a `select` field's `options`. */
  options: WellSelectOption[];
  /** Fired with the chosen option's value. */
  onPick: (value: string) => void;
  /** Currently applied value across the selection, when they all agree. */
  activeValue?: string;
  /** Count shown alongside the swatches, e.g. "6 wells". */
  selectionSize?: number;
  /** Accessible name for the group. Defaults to `"Quick paint"`. */
  label?: string;
  /** Fallback colour for an option with no `swatch`. */
  fallbackColor?: string;
  className?: string;
}

/**
 * Swatch strip for painting a value across the current selection in one click.
 *
 * Presentational and position-agnostic — `PlatePaintGrid` anchors it above the
 * selection. Bring your own container to use it anywhere else.
 */
export function WellQuickPaint({
  options,
  onPick,
  activeValue,
  selectionSize,
  label = "Quick paint",
  fallbackColor = "var(--surface-container)",
  className,
}: WellQuickPaintProps) {
  if (options.length === 0) return null;

  return (
    <div
      data-slot="well-quick-paint"
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-popover px-1.5 py-1 shadow-elevation-3",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = activeValue !== undefined && option.value === activeValue;
        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            aria-label={option.label}
            aria-pressed={isActive}
            onClick={() => onPick(option.value)}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-md transition-colors",
              "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive && "bg-accent",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-3.5 rounded-full border border-foreground/20",
                isActive && "ring-2 ring-ring ring-offset-1 ring-offset-popover",
              )}
              style={{ backgroundColor: option.swatch ?? fallbackColor }}
            />
          </button>
        );
      })}
      {selectionSize === undefined ? null : (
        <span className="ml-0.5 pr-1 text-[0.7rem] whitespace-nowrap text-muted-foreground">
          {selectionSize} {selectionSize === 1 ? "well" : "wells"}
        </span>
      )}
    </div>
  );
}
