"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CHEVRONS = {
  left: ChevronLeft,
  right: ChevronRight,
  up: ChevronUp,
  down: ChevronDown,
} as const;

export interface ShellCollapseButtonProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  /** Chevron direction the button points at. */
  direction: keyof typeof CHEVRONS;
  /** Accessible name + tooltip text (e.g. "Collapse navigation"). */
  label: string;
  /** Tooltip side. Defaults to `right` (rail/sidebar placements). */
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

/**
 * The shell's shared collapse/expand affordance — a small outlined square with
 * a chevron, placed in a zone's header row when expanded and at the top of the
 * collapsed rail. One component so every zone's trigger looks identical.
 */
function ShellCollapseButton({ direction, label, tooltipSide = "right", ...props }: ShellCollapseButtonProps) {
  const Chevron = CHEVRONS[direction];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="data-app-shell-collapse-button"
            variant="outline"
            size="icon"
            className="w-5 h-5 shrink-0 text-muted-foreground hover:text-primary hover:border-primary"
            aria-label={label}
            {...props}
          >
            <Chevron className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { ShellCollapseButton };
