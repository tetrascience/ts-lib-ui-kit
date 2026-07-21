import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WellLegendItem {
  id: string;
  label: React.ReactNode;
  color: string;
  /** Optional secondary text shown beneath the label. */
  meta?: React.ReactNode;
  disabled?: boolean;
}

export interface WellLegendProps {
  items: WellLegendItem[];
  /** Render-prop for fully custom cards. Bypasses the default card layout. */
  renderItem?: (item: WellLegendItem) => React.ReactNode;
  onHoverEnter?: (id: string) => void;
  onHoverLeave?: (id: string) => void;
  onRemove?: (id: string) => void;
  removeLabel?: string;
  emptyLabel?: string;
  className?: string;
}

export function WellLegend({
  items,
  renderItem,
  onHoverEnter,
  onHoverLeave,
  onRemove,
  removeLabel = "Remove",
  emptyLabel = "No items",
  className,
}: WellLegendProps) {
  if (items.length === 0) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)} data-slot="well-legend-empty">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} data-slot="well-legend">
      {items.map((item) => {
        if (renderItem) return <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>;
        return (
          <Card
            key={item.id}
            size="sm"
            data-slot="well-legend-item"
            data-disabled={item.disabled || undefined}
            className={cn("py-2 hover:bg-accent/40")}
            onMouseEnter={() => onHoverEnter?.(item.id)}
            onMouseLeave={() => onHoverLeave?.(item.id)}
          >
            <CardContent className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 size-3.5 shrink-0 rounded-sm border border-foreground/20",
                  item.disabled && "opacity-50"
                )}
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate text-xs font-medium",
                    item.disabled && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </div>
                {item.meta ? (
                  <div className="truncate text-[0.65rem] text-muted-foreground">{item.meta}</div>
                ) : null}
              </div>
              {onRemove ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${removeLabel} ${typeof item.label === "string" ? item.label : item.id}`}
                  onClick={() => onRemove(item.id)}
                >
                  <X aria-hidden />
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
