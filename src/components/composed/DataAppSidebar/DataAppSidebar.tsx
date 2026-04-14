import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

/** A page entry in the main sidebar (e.g. Project, Explorer) */
export interface SidebarPageEntry {
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

/** A workflow step in the collapsible workflow panel */
export interface WorkflowStep {
  /** Unique identifier / path key */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon or custom React element */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Whether this step is currently active */
  active?: boolean;
  /** Whether this step is disabled */
  disabled?: boolean;
  /** Tooltip when disabled */
  disabledReason?: string;
  /** Input data count (displayed as "N →") */
  inputCount?: number;
  /** Output data count (displayed as "→ N") */
  outputCount?: number;
  /** Click handler */
  onClick?: () => void;
}

/** User profile information */
export interface SidebarUserProfile {
  /** Display name */
  name: string;
  /** Role label (e.g. "ADMIN", "USER") */
  role?: string;
  /** Custom avatar element; defaults to initials circle */
  avatar?: React.ReactNode;
}

/** User menu action */
export interface SidebarUserMenuItem {
  /** Label text */
  label: string;
  /** Click handler */
  onClick: () => void;
}

export interface DataAppSidebarProps {
  /** Application name/logo text shown at top of sidebar */
  appName: string;
  /** Full application name shown in the app menu dropdown */
  appFullName?: string;
  /** Custom logo element (replaces appName text) */
  logo?: React.ReactNode;
  /** Main page entries (e.g. Project, Explorer) */
  pages: SidebarPageEntry[];
  /** User profile for the avatar section */
  user?: SidebarUserProfile;
  /** Menu items for the user dropdown */
  userMenuItems?: SidebarUserMenuItem[];
  /** Callback when logo/app name is clicked */
  onLogoClick?: () => void;
  /** Callback when "Back to TDP Platform" is clicked */
  onBackToPlatform?: () => void;
  /** Whether the workflow panel is visible */
  showWorkflow?: boolean;
  /** Workflow steps to display in the collapsible panel */
  workflowSteps?: WorkflowStep[];
  /** Whether the workflow panel is collapsed */
  workflowCollapsed?: boolean;
  /** Called when the workflow panel collapse/expand is toggled */
  onWorkflowCollapseChange?: (collapsed: boolean) => void;
  /** Additional className */
  className?: string;
}

// =============================================================================
// Sub-components
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
// Main Sidebar (narrow icon rail)
// =============================================================================

function MainSidebar({
  appName,
  appFullName,
  logo,
  pages,
  user,
  userMenuItems,
  onLogoClick,
  onBackToPlatform,
}: Pick<
  DataAppSidebarProps,
  "appName" | "appFullName" | "logo" | "pages" | "user" | "userMenuItems" | "onLogoClick" | "onBackToPlatform"
>) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showAppMenu, setShowAppMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const appMenuRef = React.useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  React.useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  // Close app menu on outside click
  React.useEffect(() => {
    if (!showAppMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setShowAppMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAppMenu]);

  return (
    <nav
      data-slot="data-app-sidebar-rail"
      className="flex w-[60px] flex-col items-center shrink-0 bg-background border-r border-border h-full z-50"
    >
      {/* Logo with app menu */}
      <div ref={appMenuRef} className="relative flex items-center justify-center py-2 shrink-0">
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
          onClick={() => setShowAppMenu(!showAppMenu)}
        >
          {logo ?? (
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-border text-[11px] font-bold text-foreground">
              {appName}
            </span>
          )}
        </button>

        {/* App dropdown menu */}
        {showAppMenu && (
          <div className="absolute top-10 left-1 bg-background rounded-lg shadow-lg min-w-[220px] z-[1000] overflow-hidden border border-border">
            {/* Current app */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 cursor-pointer"
              onClick={() => {
                setShowAppMenu(false);
                onLogoClick?.();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") { setShowAppMenu(false); onLogoClick?.(); } }}
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                {logo ? (
                  <span className="scale-75">{logo}</span>
                ) : (
                  <span className="text-[10px] font-bold text-foreground">{appName}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {appFullName ?? appName}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Back to TDP Platform */}
            <button
              type="button"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground cursor-pointer bg-transparent border-none hover:bg-muted transition-colors"
              onClick={() => {
                setShowAppMenu(false);
                onBackToPlatform?.();
              }}
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              Back to TDP Platform
            </button>
          </div>
        )}
      </div>

      {/* Page entries */}
      <div className="flex flex-col items-center gap-4 px-2 pt-2 flex-1">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <button
              key={page.id}
              type="button"
              className="flex flex-col items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
              onClick={page.onClick}
              title={page.label}
            >
              <div
                className={cn(
                  pageItemVariants({ active: page.active ?? false })
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    page.active
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  page.active
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {page.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* User avatar */}
      {user && (
        <div
          ref={menuRef}
          className="relative w-full flex justify-center py-3 border-t border-border shrink-0"
        >
          {showUserMenu && userMenuItems && userMenuItems.length > 0 && (
            <div className="absolute bottom-14 left-2 bg-background rounded-lg shadow-lg min-w-[180px] z-[1000] overflow-hidden border border-border">
              {user.role && (
                <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide cursor-default">
                  {user.role}
                </div>
              )}
              {userMenuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-full text-left px-4 py-2 text-[13px] text-foreground cursor-pointer bg-transparent border-none hover:bg-muted transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    item.onClick();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          {user.avatar ? (
            <button
              type="button"
              className="cursor-pointer bg-transparent border-none p-0"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.avatar}
            </button>
          ) : (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold cursor-pointer border-none transition-opacity hover:opacity-85"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {getInitials(user.name)}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

// =============================================================================
// Workflow Steps Panel (collapsible)
// =============================================================================

const stepItemVariants = cva(
  "flex items-center gap-2 py-3.5 px-2.5 text-xs font-normal transition-colors duration-150 whitespace-nowrap leading-tight cursor-pointer border-l-[5px]",
  {
    variants: {
      active: {
        true: "border-l-primary bg-background font-semibold text-foreground shadow-sm",
        false:
          "border-l-border bg-transparent text-muted-foreground hover:bg-muted",
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
  // Collapsed: icon-only rail
  if (collapsed) {
    return (
      <div
        data-slot="data-app-panel-collapsed"
        className="flex flex-col shrink-0 w-[46px] bg-background border-r border-border"
      >
        {/* Expand button */}
        <div className="flex justify-center items-center h-14 border-b border-border">
          <button
            type="button"
            className="flex items-center justify-center w-5 h-5 border border-border rounded bg-background cursor-pointer text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
            onClick={() => onCollapseChange(false)}
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Step icons */}
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={cn(
                "flex justify-center items-center py-3.5 border-l-[5px] cursor-pointer bg-transparent border-r-0 border-t-0 border-b-0 w-full",
                step.active
                  ? "border-l-primary"
                  : "border-l-border",
                step.disabled && "opacity-45 cursor-not-allowed"
              )}
              onClick={() => !step.disabled && step.onClick?.()}
              disabled={step.disabled}
              title={
                step.disabled
                  ? step.disabledReason ?? step.label
                  : step.label
              }
            >
              {Icon ? (
                <Icon
                  className={cn(
                    "w-5 h-5",
                    step.active
                      ? "text-primary"
                      : "text-muted-foreground"
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
          );
        })}
      </div>
    );
  }

  // Expanded panel
  return (
    <nav
      data-slot="data-app-panel-expanded"
      className="flex flex-col shrink-0 w-[180px] bg-background border-r border-border transition-[width] duration-200 ease-in-out overflow-hidden"
    >
      {/* Header with collapse button */}
      <div className="flex items-center gap-1.5 h-14 px-2.5 pl-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-border">
        <span className="flex-1">Workflow</span>
        <button
          type="button"
          className="flex items-center justify-center w-5 h-5 border border-border rounded bg-background cursor-pointer text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
          onClick={() => onCollapseChange(true)}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Steps list */}
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
              title={
                step.disabled
                  ? step.disabledReason ?? step.label
                  : step.label
              }
            >
              {Icon && (
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 shrink-0",
                    step.active
                      ? "text-primary"
                      : "text-muted-foreground"
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
                      <span className="text-muted-foreground">
                        {formatCount(step.inputCount)}
                      </span>
                    )}
                    {step.inputCount != null &&
                      step.outputCount != null && (
                        <span className="mx-0.5">{"\u2192"}</span>
                      )}
                    {step.outputCount != null && (
                      <span className="text-muted-foreground">
                        {formatCount(step.outputCount)}
                      </span>
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
// DataAppSidebar (composed)
// =============================================================================

function DataAppSidebar({
  appName,
  appFullName,
  logo,
  pages,
  user,
  userMenuItems,
  onLogoClick,
  onBackToPlatform,
  showWorkflow = false,
  workflowSteps = [],
  workflowCollapsed = false,
  onWorkflowCollapseChange,
  className,
}: DataAppSidebarProps) {
  return (
    <div
      data-slot="data-app-sidebar"
      className={cn("flex flex-row h-full", className)}
    >
      {/* Hide main sidebar rail when workflow is collapsed */}
      {!(showWorkflow && workflowCollapsed) && (
        <MainSidebar
          appName={appName}
          appFullName={appFullName}
          logo={logo}
          pages={pages}
          user={user}
          userMenuItems={userMenuItems}
          onLogoClick={onLogoClick}
          onBackToPlatform={onBackToPlatform}
        />
      )}
      {showWorkflow && workflowSteps.length > 0 && (
        <WorkflowPanel
          steps={workflowSteps}
          collapsed={workflowCollapsed}
          onCollapseChange={
            onWorkflowCollapseChange ?? (() => { /* noop */ })
          }
        />
      )}
    </div>
  );
}

export default DataAppSidebar;
export { DataAppSidebar, WorkflowPanel, MainSidebar };
export type {
  DataAppSidebarProps as DataAppSidebarComponentProps,
};
