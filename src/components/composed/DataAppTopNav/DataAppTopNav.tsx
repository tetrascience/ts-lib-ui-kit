import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

/** A single breadcrumb item */
export interface TopNavBreadcrumbItem {
  /** Display label */
  label: string;
  /** Whether this item is clickable (non-current items) */
  isClickable?: boolean;
  /** Click handler for navigation */
  onClick?: () => void;
}

/** Data count displayed as pill in the top nav */
export interface DataCount {
  /** Label (e.g. "INPUT", "OUTPUT") */
  label: string;
  /** Numeric count */
  count: number;
  /** Visual variant */
  variant?: "default" | "outline" | "primary";
  /** Click handler (e.g. to open output table) */
  onClick?: () => void;
}

export interface DataAppTopNavProps {
  /** Breadcrumb items from root to current page */
  breadcrumbs?: TopNavBreadcrumbItem[];
  /** Separator between breadcrumbs */
  separator?: React.ReactNode;
  /** Data counts shown on the right side (e.g. Input 649,568 → Output 645,396) */
  dataCounts?: DataCount[];
  /** Whether to show the "Next" navigation button */
  showNextButton?: boolean;
  /** Label for the next button */
  nextButtonLabel?: string;
  /** Whether the next button is disabled */
  nextButtonDisabled?: boolean;
  /** Click handler for the next button */
  onNextClick?: () => void;
  /** Additional action buttons to render in the right section */
  actions?: React.ReactNode;
  /** Whether the nav is in "stuck" (scrolled) state */
  isStuck?: boolean;
  /** Additional className */
  className?: string;
}

// =============================================================================
// Sub-components
// =============================================================================

const countPillVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tabular-nums cursor-default transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-muted text-muted-foreground",
        outline:
          "bg-transparent border border-border text-foreground",
        primary:
          "bg-primary/10 border border-primary/30 text-primary",
      },
      clickable: {
        true: "cursor-pointer hover:bg-primary/15",
        false: "",
      },
    },
    defaultVariants: { variant: "default", clickable: false },
  }
);

function formatLargeNumber(n: number): string {
  return n.toLocaleString();
}

// =============================================================================
// DataAppTopNav
// =============================================================================

function DataAppTopNav({
  breadcrumbs = [],
  separator,
  dataCounts = [],
  showNextButton = false,
  nextButtonLabel = "Next",
  nextButtonDisabled = false,
  onNextClick,
  actions,
  className,
}: DataAppTopNavProps) {
  const separatorElement = separator ?? (
    <span className="text-muted-foreground/50 text-[13px] mx-1">/</span>
  );

  return (
    <div
      data-slot="data-app-top-nav"
      className={cn(
        "flex items-center justify-between h-10 px-4 bg-background border-b border-border sticky top-0 z-40 w-full",
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-0 min-w-0"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <span aria-hidden="true">{separatorElement}</span>
              )}
              {item.isClickable && !isLast ? (
                <button
                  type="button"
                  className="text-[13px] text-primary hover:underline cursor-pointer bg-transparent border-none p-0 font-normal"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={cn(
                    "text-[13px]",
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right: Data counts + actions + Next button */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Data counts */}
        {dataCounts.length > 0 && (
          <div className="flex items-center gap-1.5">
            {dataCounts.map((dc, i) => (
              <React.Fragment key={`${dc.label}-${i}`}>
                {i > 0 && (
                  <span className="text-muted-foreground/50 text-xs">
                    {"\u2192"}
                  </span>
                )}
                <div
                  className={cn(
                    countPillVariants({
                      variant: dc.variant ?? "outline",
                      clickable: !!dc.onClick,
                    })
                  )}
                  onClick={dc.onClick}
                  role={dc.onClick ? "button" : undefined}
                  tabIndex={dc.onClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      dc.onClick &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      dc.onClick();
                    }
                  }}
                >
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wide font-medium">
                    {dc.label}
                  </span>
                  <span className="font-semibold text-sm">
                    {formatLargeNumber(dc.count)}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Custom actions */}
        {actions}

        {/* Next button */}
        {showNextButton && (
          <Button
            size="sm"
            disabled={nextButtonDisabled}
            onClick={onNextClick}
            className="gap-1"
          >
            {nextButtonLabel}
            <ChevronRight className="w-4 h-4" data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default DataAppTopNav;
export { DataAppTopNav };
