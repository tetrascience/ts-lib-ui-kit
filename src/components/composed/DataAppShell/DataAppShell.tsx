import { cva } from "class-variance-authority";
import { ArrowLeft, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TDPLink } from "@/components/composed/tdp-link";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface NavPage {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon or custom React element */
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Whether this entry is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface WorkflowStep {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Whether this step is currently active */
  active?: boolean;
  /** Whether this step is disabled */
  disabled?: boolean;
  /** Tooltip shown when disabled */
  disabledReason?: string;
  /** Input data count (displayed before →) */
  inputCount?: number;
  /** Output data count (displayed after →) */
  outputCount?: number;
  /** Click handler */
  onClick?: () => void;
}

export interface UserProfile {
  /** Display name */
  name: string;
  /** Role label (e.g. "ADMIN", "USER") */
  role?: string;
  /** Custom avatar element; defaults to initials circle */
  avatar?: React.ReactNode;
}

export interface UserMenuItem {
  /** Label text */
  label: string;
  /** Click handler */
  onClick: () => void;
}

export interface BreadcrumbItemConfig {
  /** Display label */
  label: string;
  /** Whether this item is clickable */
  isClickable?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface DataCount {
  /** Label (e.g. "INPUT", "OUTPUT") */
  label: string;
  /** Numeric count */
  count: number;
  /** Visual variant */
  variant?: "default" | "outline" | "primary";
  /** Click handler */
  onClick?: () => void;
}

export interface DataAppShellProps {
  // -- Sidebar --
  /** Application name/abbreviation shown in the logo button */
  appName: string;
  /** Full application name shown in the app dropdown */
  appFullName?: string;
  /** Custom logo element (replaces appName text) */
  logo?: React.ReactNode;
  /** Main page entries (e.g. Project, Explorer) */
  pages: NavPage[];
  /** User profile for the avatar section */
  user?: UserProfile;
  /** Menu items for the user dropdown */
  userMenuItems?: UserMenuItem[];
  /** Callback when logo/app name is clicked */
  onLogoClick?: () => void;
  /** TDP path to navigate to when "Back to TDP Platform" is clicked (uses TDPLink — requires TdpNavigationProvider) */
  backToPlatformPath?: string;
  /** Fallback callback when "Back to TDP Platform" is clicked and no backToPlatformPath is set */
  onBackToPlatform?: () => void;

  // -- Workflow panel --
  /** Whether the workflow panel is visible */
  showWorkflow?: boolean;
  /** Workflow steps to display in the collapsible panel */
  workflowSteps?: WorkflowStep[];
  /** Whether the workflow panel is collapsed */
  workflowCollapsed?: boolean;
  /** Called when the workflow panel collapse/expand is toggled */
  onWorkflowCollapseChange?: (collapsed: boolean) => void;

  // -- Top nav --
  /** Breadcrumb items from root to current page */
  breadcrumbs?: BreadcrumbItemConfig[];
  /** Data counts shown on the right side (e.g. Input, Output) */
  dataCounts?: DataCount[];
  /** Whether to show the "Next" navigation button */
  showNextButton?: boolean;
  /** Label for the next button */
  nextButtonLabel?: string;
  /** Whether the next button is disabled */
  nextButtonDisabled?: boolean;
  /** Click handler for the next button */
  onNextClick?: () => void;
  /** Additional action buttons for the top nav */
  topNavActions?: React.ReactNode;

  // -- Shell --
  /** Main content area */
  children?: React.ReactNode;
  /** Additional className for the root container */
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const MILLION = 1_000_000;
const THOUSAND = 1_000;

function formatCount(n: number): string {
  if (n >= MILLION) return `${(n / MILLION).toFixed(n % MILLION === 0 ? 0 : 1)}M`;
  if (n >= THOUSAND) return `${(n / THOUSAND).toFixed(n % THOUSAND === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

// =============================================================================
// Icon rail sidebar
// =============================================================================

const pageItemVariants = cva(
  "flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150",
  {
    variants: {
      active: {
        true: "bg-primary/10",
        false: "bg-transparent hover:bg-muted",
      },
    },
    defaultVariants: { active: false },
  }
);

function IconRailSidebar({
  appName,
  appFullName,
  logo,
  pages,
  user,
  userMenuItems,
  onLogoClick,
  backToPlatformPath,
  onBackToPlatform,
}: Pick<
  DataAppShellProps,
  | "appName"
  | "appFullName"
  | "logo"
  | "pages"
  | "user"
  | "userMenuItems"
  | "onLogoClick"
  | "backToPlatformPath"
  | "onBackToPlatform"
>) {
  return (
    <TooltipProvider>
      <nav
        data-slot="data-app-sidebar-rail"
        aria-label="Application navigation"
        className="flex w-[60px] flex-col items-center shrink-0 bg-background border-r border-border h-full z-50"
      >
        {/* Logo with app dropdown */}
        <div className="relative flex items-center justify-center py-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
              >
                {logo ?? (
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground">
                    {appName}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="min-w-[220px]">
              {/* Current app header */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 cursor-pointer"
                onClick={onLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onLogoClick?.(); }}
              >
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                  {logo ? (
                    <span className="scale-75">{logo}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-foreground">{appName}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {appFullName ?? appName}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2.5 p-0" asChild>
                {backToPlatformPath ? (
                  <TDPLink
                    path={backToPlatformPath}
                    navigationOptions={{ newTab: false }}
                    className="flex items-center gap-2.5 w-full px-2 py-1.5 no-underline! hover:no-underline!"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    Back to TDP Platform
                  </TDPLink>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full px-2 py-1.5 bg-transparent border-none cursor-pointer"
                    onClick={onBackToPlatform}
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    Back to TDP Platform
                  </button>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page entries */}
        <div className="flex flex-col items-center gap-4 px-2 pt-2 flex-1">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <Tooltip key={page.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
                    onClick={page.onClick}
                  >
                    <div className={cn(pageItemVariants({ active: page.active ?? false }))}>
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          page.active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-tight text-center",
                        page.active ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {page.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{page.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* User avatar with dropdown */}
        {user && (
          <div className="w-full flex justify-center py-3 border-t border-border shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer bg-transparent border-none p-0"
                >
                  {user.avatar ?? (
                    <Avatar size="sm" className="bg-primary cursor-pointer hover:opacity-85 transition-opacity">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </button>
              </DropdownMenuTrigger>
              {userMenuItems && userMenuItems.length > 0 && (
                <DropdownMenuContent side="right" align="end" className="min-w-[180px]">
                  {user.role && (
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {user.role}
                    </DropdownMenuLabel>
                  )}
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      className="cursor-pointer"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}

// =============================================================================
// Workflow panel
// =============================================================================

const stepItemVariants = cva(
  "flex items-center gap-2 py-3.5 px-2.5 text-xs font-normal transition-colors duration-150 whitespace-nowrap leading-tight cursor-pointer border-l-[5px] w-full bg-transparent border-r-0 border-t-0 border-b-0",
  {
    variants: {
      active: {
        true: "border-l-primary bg-background font-semibold text-foreground shadow-sm",
        false: "border-l-border bg-transparent text-muted-foreground hover:bg-muted",
      },
    },
    defaultVariants: { active: false },
  }
);

function WorkflowPanel({
  steps,
  collapsed,
  onCollapseChange,
}: {
  steps: WorkflowStep[];
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}) {
  if (collapsed) {
    return (
      <div
        data-slot="data-app-panel-collapsed"
        className="flex flex-col shrink-0 w-[46px] bg-background border-r border-border"
      >
        <div className="flex justify-center items-center h-10 border-b border-border">
          <Button
            variant="outline"
            size="icon"
            className="w-5 h-5"
            onClick={() => onCollapseChange(false)}
            title="Expand workflow panel"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <TooltipProvider>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex justify-center items-center py-3.5 border-l-[5px] cursor-pointer bg-transparent border-r-0 border-t-0 border-b-0 w-full",
                      step.active ? "border-l-primary" : "border-l-border",
                      step.disabled && "opacity-45 cursor-not-allowed"
                    )}
                    onClick={() => !step.disabled && step.onClick?.()}
                    disabled={step.disabled}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          step.active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          step.active ? "bg-primary" : "bg-muted-foreground/40"
                        )}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {step.disabled ? (step.disabledReason ?? step.label) : step.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <nav
      data-slot="data-app-panel-expanded"
      aria-label="Workflow steps"
      className="flex flex-col shrink-0 w-[180px] bg-background border-r border-border overflow-hidden"
    >
      <div className="flex items-center gap-1.5 h-10 px-2.5 pl-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-border">
        <span className="flex-1">Workflow</span>
        <Button
          variant="outline"
          size="icon"
          className="w-5 h-5"
          onClick={() => onCollapseChange(true)}
          title="Collapse workflow panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-col">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={cn(
                stepItemVariants({ active: step.active ?? false }),
                step.disabled && "opacity-45 cursor-not-allowed"
              )}
              onClick={() => !step.disabled && step.onClick?.()}
              disabled={step.disabled}
              title={step.disabled ? (step.disabledReason ?? step.label) : step.label}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 shrink-0",
                    step.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>
              )}
              <span className="flex flex-col items-start gap-0.5 min-w-0">
                <span className="truncate">{step.label}</span>
                {(step.inputCount != null || step.outputCount != null) && (
                  <span className="text-[10px] text-muted-foreground font-normal tabular-nums">
                    {step.inputCount != null && (
                      <span>{formatCount(step.inputCount)}</span>
                    )}
                    {step.inputCount != null && step.outputCount != null && (
                      <span className="mx-0.5">{"\u2192"}</span>
                    )}
                    {step.outputCount != null && (
                      <span>{formatCount(step.outputCount)}</span>
                    )}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// =============================================================================
// Top nav
// =============================================================================

const countPillVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tabular-nums transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        outline: "bg-transparent border border-border text-foreground",
        primary: "bg-primary/10 border border-primary/30 text-primary",
      },
      clickable: {
        true: "cursor-pointer hover:bg-primary/15",
        false: "cursor-default",
      },
    },
    defaultVariants: { variant: "default", clickable: false },
  }
);

function TopNav({
  breadcrumbs = [],
  dataCounts = [],
  showNextButton = false,
  nextButtonLabel = "Next",
  nextButtonDisabled = false,
  onNextClick,
  actions,
}: {
  breadcrumbs?: BreadcrumbItemConfig[];
  dataCounts?: DataCount[];
  showNextButton?: boolean;
  nextButtonLabel?: string;
  nextButtonDisabled?: boolean;
  onNextClick?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="data-app-top-nav"
      className="flex items-center justify-between h-10 px-4 bg-background border-b border-border sticky top-0 z-40 w-full"
    >
      {/* Left: Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.isClickable ? (
                    <button
                      type="button"
                      className="text-[13px] text-primary hover:underline cursor-pointer bg-transparent border-none p-0 font-normal"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">{item.label}</span>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right: data counts + actions + next button */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {dataCounts.length > 0 && (
          <div className="flex items-center gap-1.5">
            {dataCounts.map((dc, i) => (
              <React.Fragment key={`${dc.label}-${i}`}>
                {i > 0 && (
                  <span className="text-muted-foreground/50 text-xs">{"\u2192"}</span>
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
                    if (dc.onClick && (e.key === "Enter" || e.key === " ")) dc.onClick();
                  }}
                >
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wide font-medium">
                    {dc.label}
                  </span>
                  <span className="font-semibold text-sm">{dc.count.toLocaleString()}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {actions}

        {showNextButton && (
          <Button size="sm" disabled={nextButtonDisabled} onClick={onNextClick} className="gap-1">
            {nextButtonLabel}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DataAppShell
// =============================================================================

function DataAppShell({
  appName,
  appFullName,
  logo,
  pages,
  user,
  userMenuItems,
  onLogoClick,
  backToPlatformPath,
  onBackToPlatform,
  showWorkflow = false,
  workflowSteps = [],
  workflowCollapsed = false,
  onWorkflowCollapseChange,
  breadcrumbs = [],
  dataCounts = [],
  showNextButton = false,
  nextButtonLabel,
  nextButtonDisabled,
  onNextClick,
  topNavActions,
  children,
  className,
}: DataAppShellProps) {
  const showWorkflowPanel = showWorkflow && workflowSteps.length > 0;

  return (
    <div
      data-slot="data-app-shell"
      className={cn("flex flex-row w-full h-screen overflow-hidden", className)}
    >
      {/* Icon rail (hidden when workflow is collapsed) */}
      {!(showWorkflow && workflowCollapsed) && (
        <IconRailSidebar
          appName={appName}
          appFullName={appFullName}
          logo={logo}
          pages={pages}
          user={user}
          userMenuItems={userMenuItems}
          onLogoClick={onLogoClick}
          backToPlatformPath={backToPlatformPath}
          onBackToPlatform={onBackToPlatform}
        />
      )}

      {/* Right of icon rail: top nav + workflow panel + content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopNav
          breadcrumbs={breadcrumbs}
          dataCounts={dataCounts}
          showNextButton={showNextButton}
          nextButtonLabel={nextButtonLabel}
          nextButtonDisabled={nextButtonDisabled}
          onNextClick={onNextClick}
          actions={topNavActions}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {showWorkflowPanel && (
            <WorkflowPanel
              steps={workflowSteps}
              collapsed={workflowCollapsed}
              onCollapseChange={onWorkflowCollapseChange ?? (() => { /* noop */ })}
            />
          )}

          <main
            data-slot="data-app-shell-content"
            className="flex-1 overflow-auto bg-background"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DataAppShell;
export { DataAppShell };
