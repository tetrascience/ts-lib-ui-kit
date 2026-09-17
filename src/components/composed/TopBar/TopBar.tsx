import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// =============================================================================
// TopBar — sticky 3-slot header
// =============================================================================

const topBarVariants = cva(
  "flex items-center h-11 px-3 bg-sidebar border-b border-sidebar-border w-full gap-2 z-40",
  {
    variants: {
      sticky: {
        true: "sticky top-0",
        false: "",
      },
    },
    defaultVariants: { sticky: true },
  }
);

export interface TopBarProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof topBarVariants> {
  /** Left slot — typically a breadcrumb. */
  left?: React.ReactNode;
  /**
   * Center "context" slot — e.g. a version/status selector. Only rendered when
   * provided; keeps the left/right columns balanced when present.
   */
  center?: React.ReactNode;
  /** Right slot — actions, help, user menu, etc. */
  right?: React.ReactNode;
}

/**
 * Sticky application header with three slots — left / center / right.
 *
 * - **left** is typically a breadcrumb, but any node can be slotted in.
 * - **center** is an optional "context" slot (e.g. a version/status selector).
 * - **right** holds actions, a help affordance, a `UserMenu`, etc.
 */
function TopBar({ left, center, right, sticky, className, ...props }: TopBarProps) {
  return (
    <div
      data-slot="top-bar"
      className={cn(topBarVariants({ sticky }), className)}
      {...props}
    >
      <div
        data-slot="top-bar-left"
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        {left}
      </div>

      {center != null && (
        <div
          data-slot="top-bar-center"
          className="flex items-center gap-2 shrink-0"
        >
          {center}
        </div>
      )}

      <div
        data-slot="top-bar-right"
        className="flex items-center gap-2 shrink-0 justify-end"
      >
        {right}
      </div>
    </div>
  );
}

export { TopBar, topBarVariants };
