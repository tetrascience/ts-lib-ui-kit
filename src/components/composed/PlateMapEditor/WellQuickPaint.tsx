import type { WellSelectOption } from "./types";

import { cn } from "@/lib/utils";

/** Swatches grow to this many across before wrapping to another row. */
const QUICK_PAINT_MAX_COLUMNS = 6;

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

  // Grows to six across, then wraps — twelve categorical colours land as a
  // tidy 6x2 rather than a strip wider than the plate.
  const columns = Math.min(options.length, QUICK_PAINT_MAX_COLUMNS);

  return (
    <div
      data-slot="well-quick-paint"
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-popover p-1.5 shadow-elevation-3",
        className,
      )}
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
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
                "inline-flex size-8 items-center justify-center rounded-md transition-colors",
                "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive && "bg-accent",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-5 rounded-full border border-foreground/20",
                  isActive && "ring-2 ring-ring ring-offset-1 ring-offset-popover",
                )}
                style={{ backgroundColor: option.swatch ?? fallbackColor }}
              />
            </button>
          );
        })}
      </div>
      {selectionSize === undefined ? null : (
        <span className="px-0.5 text-center text-[0.7rem] whitespace-nowrap text-muted-foreground">
          {selectionSize} {selectionSize === 1 ? "well" : "wells"}
        </span>
      )}
    </div>
  );
}
