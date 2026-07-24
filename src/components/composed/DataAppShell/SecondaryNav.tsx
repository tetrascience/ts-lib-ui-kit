import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronRight, type LucideIcon } from "lucide-react";
import * as React from "react";

import { ShellCollapseButton } from "./CollapseButton";
import { useOptionalDataAppShell } from "./ShellContext";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export type NavStepStatus = "done" | "active" | "todo";

export interface NavStep {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon or custom React SVG component */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Optional count/status badge */
  badge?: React.ReactNode;
  /** Explicit status — overrides the linear derivation from `activeKey` */
  status?: NavStepStatus;
  /** Disables the step */
  disabled?: boolean;
  /** Tooltip/title text explaining why the step is disabled */
  disabledReason?: string;
  /** One level of nesting — child steps rendered indented under this step */
  steps?: NavStep[];
}

export type DataAppShellSecondaryNavOrientation = "vertical" | "horizontal";

// =============================================================================
// CVA variants
// =============================================================================

const dataAppShellSecondaryNavVariants = cva("shrink-0", {
  variants: {
    orientation: {
      /** Collapsible left panel; collapses to an icon-only rail */
      vertical: "flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden",
      /** Wizard/stepper row rendered above the main content */
      horizontal: "flex flex-row items-center min-w-0",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

const dataAppShellSecondaryNavItemVariants = cva(
  "cursor-pointer bg-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      orientation: {
        vertical:
          "flex items-center gap-2 py-2 px-2.5 w-full text-left whitespace-nowrap leading-tight border-l-[5px] border-r-0 border-t-0 border-b-0",
        /** Icon-only row in the collapsed rail */
        rail: "flex justify-center items-center py-3.5 w-full border-l-[5px] border-r-0 border-t-0 border-b-0",
        // ring-inset — the steps row is an overflow-x-auto scroll container,
        // which would clip an outset ring at the row's edges
        horizontal:
          "flex items-center gap-2 h-7 px-2.5 text-sm rounded-md whitespace-nowrap border-none focus-visible:ring-inset",
      },
      status: {
        done: "",
        active: "",
        todo: "",
      },
    },
    compoundVariants: [
      {
        orientation: "vertical",
        status: "active",
        class: "border-l-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground shadow-sm",
      },
      {
        orientation: "vertical",
        status: "done",
        class: "border-l-sidebar-border text-foreground hover:bg-sidebar-accent/50",
      },
      {
        orientation: "vertical",
        status: "todo",
        class: "border-l-sidebar-border text-muted-foreground hover:bg-sidebar-accent/50",
      },
      { orientation: "rail", status: "active", class: "border-l-primary" },
      { orientation: "rail", status: "done", class: "border-l-border" },
      { orientation: "rail", status: "todo", class: "border-l-border" },
      {
        orientation: "horizontal",
        status: "active",
        class: "bg-primary/10 text-primary font-medium",
      },
      {
        orientation: "horizontal",
        status: "done",
        class: "text-foreground hover:bg-accent",
      },
      {
        orientation: "horizontal",
        status: "todo",
        class: "text-muted-foreground hover:bg-accent hover:text-foreground",
      },
    ],
    defaultVariants: { orientation: "vertical", status: "todo" },
  }
);

// =============================================================================
// Props
// =============================================================================

export interface DataAppShellSecondaryNavProps
  extends Omit<React.ComponentProps<"nav">, "onSelect" | "title">,
    VariantProps<typeof dataAppShellSecondaryNavVariants> {
  /** Step entries; one level of nesting via `steps` on a step */
  steps: NavStep[];
  /** Controlled active step id — steps before it derive `done`, after it `todo` */
  activeKey?: string;
  /** Called with the selected step id after the step resolves as enabled */
  onSelect?: (key: string, step: NavStep) => void;
  /** Panel title shown in the vertical header (e.g. "Steps") */
  title?: React.ReactNode;
  /** Renders the collapse toggle. Vertical collapses to an icon rail;
   *  horizontal collapses to a compact step dropdown. */
  collapsible?: boolean;
  /** Controlled collapsed state. When omitted inside a `DataAppShell`, the
   *  shell's single collapse state drives it (one toggle for all zones). */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state */
  defaultCollapsed?: boolean;
  /** Called when the collapse toggle flips the state */
  onCollapsedChange?: (collapsed: boolean) => void;
}

// =============================================================================
// Status derivation
// =============================================================================

/** Depth-first flatten — parents immediately followed by their children. */
function flattenSteps(steps: NavStep[]): NavStep[] {
  return steps.flatMap((step) => [step, ...(step.steps ?? [])]);
}

/**
 * Explicit `status` wins; otherwise derived linearly from `activeKey`:
 * before the active step → `done`, after it (or no active step) → `todo`.
 */
function resolveStatus(step: NavStep, index: number, activeIndex: number): NavStepStatus {
  if (step.status) return step.status;
  if (activeIndex < 0) return "todo";
  if (index === activeIndex) return "active";
  return index < activeIndex ? "done" : "todo";
}

// =============================================================================
// Step icon — status-aware (done → check)
// =============================================================================

function StepIcon({
  step,
  status,
  className,
}: {
  step: NavStep;
  status: NavStepStatus;
  className?: string;
}) {
  const Icon = step.icon;
  if (status === "done") {
    return <Check className={cn("w-4 h-4 text-positive", className)} />;
  }
  if (Icon) {
    return (
      <Icon
        className={cn(
          "w-4 h-4",
          status === "active" ? "text-primary" : "text-muted-foreground",
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full",
        status === "active" ? "bg-primary" : "bg-muted-foreground/40",
        className
      )}
    />
  );
}

// =============================================================================
// DataAppShellSecondaryNav
// =============================================================================

/**
 * The Data App Shell's secondary (per-page/step) nav — one `steps` model
 * rendered on either axis via `orientation`:
 *
 * - **vertical** — collapsible left panel; collapses to an icon-only rail
 *   with tooltips and a ▸ expand toggle
 * - **horizontal** — wizard/stepper row above the main content
 *
 * Step status (`done` / `active` / `todo`) is derived linearly from
 * `activeKey`, or set explicitly per step. Supports one level of nesting.
 */
function DataAppShellSecondaryNav({
  orientation,
  steps,
  activeKey,
  onSelect,
  title,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  ...props
}: DataAppShellSecondaryNavProps) {
  const resolvedOrientation: DataAppShellSecondaryNavOrientation = orientation ?? "vertical";

  // Inside a DataAppShell with `hideNavOnCollapse`, the shell's single collapse
  // toggle drives this zone too (nav rail + secondary collapse together into
  // one icon rail). Otherwise the zone owns its collapse — unless explicitly
  // controlled via the `collapsed` prop, which always wins.
  const shell = useOptionalDataAppShell();
  const followShell = collapsed === undefined && shell != null && shell.hideNavOnCollapse;
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsed ?? (followShell ? shell.collapsed : internalCollapsed);
  const setCollapsed = (next: boolean) => {
    if (collapsed === undefined) {
      if (followShell) shell.setCollapsed(next);
      else setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const flat = flattenSteps(steps);
  const indexById = new Map(flat.map((step, index) => [step.id, index] as const));
  const activeIndex = activeKey == null ? -1 : (indexById.get(activeKey) ?? -1);
  const statusOf = (step: NavStep) =>
    resolveStatus(step, indexById.get(step.id) ?? -1, activeIndex);

  const handleSelect = (step: NavStep) => {
    if (step.disabled) return;
    onSelect?.(step.id, step);
  };

  // ── Collapsed icon rail (vertical) ───────────────────────────────────────
  if (resolvedOrientation === "vertical" && isCollapsed) {
    return (
      <nav
        data-slot="data-app-shell-secondary-nav"
        data-orientation="vertical"
        data-collapsed="true"
        className={cn(
          "flex flex-col shrink-0 w-[46px] bg-sidebar border-r border-sidebar-border",
          className
        )}
        {...props}
      >
        <TooltipProvider>
          <div className="flex justify-center items-center h-11 shrink-0 border-b border-sidebar-border">
            <ShellCollapseButton
              data-slot="data-app-shell-secondary-nav-toggle"
              direction="right"
              label="Expand"
              onClick={() => setCollapsed(false)}
            />
          </div>
          <div
            data-slot="data-app-shell-secondary-nav-items"
            className="flex flex-col overflow-y-auto"
          >
            {flat.map((step) => {
              const status = statusOf(step);
              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    {/* aria-disabled (not disabled) — a disabled button gets no
                        pointer/focus events, which would make the tooltip carrying
                        the label/disabledReason unreachable in the icon-only rail */}
                    <button
                      type="button"
                      data-slot="data-app-shell-secondary-nav-item"
                      data-status={status}
                      aria-label={step.label}
                      aria-current={status === "active" ? "step" : undefined}
                      aria-disabled={step.disabled || undefined}
                      className={cn(
                        dataAppShellSecondaryNavItemVariants({ orientation: "rail", status }),
                        step.disabled && "opacity-45 cursor-not-allowed"
                      )}
                      onClick={() => handleSelect(step)}
                    >
                      <StepIcon step={step} status={status} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {step.disabled ? (step.disabledReason ?? step.label) : step.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </nav>
    );
  }

  // ── Collapsed horizontal — compact step dropdown (place in the top bar) ───
  if (resolvedOrientation === "horizontal" && collapsible && isCollapsed) {
    const active = activeKey == null ? undefined : flat.find((s) => s.id === activeKey);
    return (
      <nav
        data-slot="data-app-shell-secondary-nav"
        data-orientation="horizontal"
        data-collapsed="true"
        className={cn("flex items-center gap-1.5 min-w-0", className)}
        {...props}
      >
        <Select
          value={activeKey}
          onValueChange={(id) => {
            const step = flat.find((s) => s.id === id);
            if (step) handleSelect(step);
          }}
        >
          <SelectTrigger
            data-slot="data-app-shell-secondary-nav-step-select"
            size="sm"
            aria-label="Current step"
            className="h-7 min-w-0"
          >
            <SelectValue placeholder="Select step">
              {active
                ? `Step ${(indexById.get(active.id) ?? 0) + 1} · ${active.label}`
                : "Select step"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {flat.map((step, index) => (
              <SelectItem key={step.id} value={step.id} disabled={step.disabled}>
                {`Step ${index + 1} · ${step.label}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ShellCollapseButton
          data-slot="data-app-shell-secondary-nav-toggle"
          direction="down"
          label="Show steps"
          tooltipSide="bottom"
          onClick={() => setCollapsed(false)}
        />
      </nav>
    );
  }

  // ── Horizontal stepper ───────────────────────────────────────────────────
  if (resolvedOrientation === "horizontal") {
    return (
      <nav
        data-slot="data-app-shell-secondary-nav"
        data-orientation="horizontal"
        data-collapsed="false"
        className={cn(dataAppShellSecondaryNavVariants({ orientation: "horizontal" }), className)}
        {...props}
      >
        <div
          data-slot="data-app-shell-secondary-nav-items"
          className="flex flex-row items-center gap-1 min-w-0 overflow-x-auto flex-1"
        >
          {flat.map((step, index) => {
            const status = statusOf(step);
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                )}
                <button
                  type="button"
                  data-slot="data-app-shell-secondary-nav-item"
                  data-status={status}
                  aria-current={status === "active" ? "step" : undefined}
                  title={step.disabled ? (step.disabledReason ?? step.label) : undefined}
                  className={cn(
                    dataAppShellSecondaryNavItemVariants({ orientation: "horizontal", status })
                  )}
                  onClick={() => handleSelect(step)}
                  disabled={step.disabled}
                >
                  <StepIcon step={step} status={status} className="shrink-0" />
                  <span>{step.label}</span>
                  {step.badge != null && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                      {step.badge}
                    </Badge>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {collapsible && (
          <ShellCollapseButton
            data-slot="data-app-shell-secondary-nav-toggle"
            direction="up"
            label="Collapse steps"
            tooltipSide="bottom"
            className="ml-2"
            onClick={() => setCollapsed(true)}
          />
        )}
      </nav>
    );
  }

  // ── Vertical expanded panel ──────────────────────────────────────────────
  const renderStep = (step: NavStep, nested: boolean) => {
    const status = statusOf(step);
    return (
      <button
        type="button"
        key={step.id}
        data-slot="data-app-shell-secondary-nav-item"
        data-status={status}
        aria-current={status === "active" ? "step" : undefined}
        title={step.disabled ? (step.disabledReason ?? step.label) : undefined}
        className={cn(
          dataAppShellSecondaryNavItemVariants({ orientation: "vertical", status }),
          nested && "pl-8"
        )}
        onClick={() => handleSelect(step)}
        disabled={step.disabled}
      >
        <span className="flex items-center justify-center w-6 h-6 shrink-0">
          <StepIcon step={step} status={status} />
        </span>
        <span className={cn("text-sm truncate min-w-0", status === "todo" && "font-light")}>
          {step.label}
        </span>
        {step.badge != null && (
          <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px]">
            {step.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <nav
      data-slot="data-app-shell-secondary-nav"
      data-orientation="vertical"
      data-collapsed="false"
      className={cn(
        dataAppShellSecondaryNavVariants({ orientation: "vertical" }),
        "w-[180px]",
        className
      )}
      {...props}
    >
      {(title != null || collapsible) && (
        <div
          data-slot="data-app-shell-secondary-nav-header"
          className="flex items-center gap-1.5 h-11 px-2.5 pl-4 shrink-0 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-sidebar-border"
        >
          <span className="flex-1 truncate">{title}</span>
          {collapsible && (
            <ShellCollapseButton
              data-slot="data-app-shell-secondary-nav-toggle"
              direction="left"
              label="Collapse"
              onClick={() => setCollapsed(true)}
            />
          )}
        </div>
      )}
      <div
        data-slot="data-app-shell-secondary-nav-items"
        className="flex flex-col overflow-y-auto"
      >
        {steps.map((step) => (
          <React.Fragment key={step.id}>
            {renderStep(step, false)}
            {step.steps?.map((child) => renderStep(child, true))}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

export {
  DataAppShellSecondaryNav,
  dataAppShellSecondaryNavVariants,
  dataAppShellSecondaryNavItemVariants,
};
