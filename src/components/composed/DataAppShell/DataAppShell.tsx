import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Menu,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { TDPLink } from "@/components/composed/tdp-link";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export interface NavPage {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon or custom React SVG component */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Whether this page is currently active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface NavGroup {
  /** Optional group label shown as a section header in expanded nav */
  label?: string;
  /** Page entries in this group */
  pages: NavPage[];
}

export interface WorkflowStep {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Whether this step is currently active */
  isActive?: boolean;
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
  /** If provided, renders as a link */
  href?: string;
  /** Click handler (used when no href is provided) */
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
  /** Full application name shown in the app dropdown and mobile nav header */
  appFullName?: string;
  /** Custom icon element shown in the logo area */
  appIcon?: React.ReactNode;
  /** Navigation groups; each group contains one or more pages */
  navGroups: NavGroup[];
  /** User profile for the avatar section */
  user?: UserProfile;
  /** Menu items for the user dropdown */
  userMenuItems?: UserMenuItem[];
  /** Callback when the app name / icon is clicked in the dropdown */
  onAppNameClick?: () => void;
  /** TDP path to navigate to when "Back to TDP Platform" is clicked (uses TDPLink — requires TdpNavigationProvider) */
  backToPlatformPath?: string;
  /** Fallback callback when "Back to TDP Platform" is clicked and no backToPlatformPath is set */
  onBackToPlatform?: () => void;
  /** App version string shown at the bottom of the icon rail */
  version?: string;

  // -- Top nav --
  /** Breadcrumb items from root to current page */
  breadcrumbs?: BreadcrumbItemConfig[];
  /** Callback when the help button is clicked; omit to hide the button */
  onHelpClick?: () => void;
  /** Slot for right-side actions in the top nav (e.g. data count pills, next button) */
  headerActions?: React.ReactNode;

  // -- Shell --
  /** Slot rendered between the icon rail and the content (e.g. WorkflowPanel) */
  sidebarPanel?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
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
// Sidebar shared body (used by desktop rail + mobile Sheet)
// =============================================================================

interface SidebarBodyProps
  extends Pick<
    DataAppShellProps,
    | "appName"
    | "appFullName"
    | "appIcon"
    | "navGroups"
    | "user"
    | "userMenuItems"
    | "onAppNameClick"
    | "backToPlatformPath"
    | "onBackToPlatform"
    | "version"
  > {
  /**
   * compact=true  → narrow icon rail (60px): icons + tiny labels stacked, tooltips on hover
   * compact=false → expanded mobile sheet (220px): icon + label side-by-side rows
   */
  compact: boolean;
  /** Called after a nav page item is clicked — used by mobile sheet to close itself */
  onAfterNavClick?: () => void;
}

const pageIconVariants = cva(
  "flex items-center justify-center rounded-lg transition-colors duration-150",
  {
    variants: {
      active: {
        true: "bg-primary/10",
        false: "bg-transparent",
      },
      compact: {
        true: "w-9 h-9 hover:bg-muted",
        false: "w-8 h-8",
      },
    },
    defaultVariants: { active: false, compact: true },
  }
);

function SidebarBody({
  appName,
  appFullName,
  appIcon,
  navGroups,
  user,
  userMenuItems,
  onAppNameClick,
  backToPlatformPath,
  onBackToPlatform,
  version,
  compact,
  onAfterNavClick,
}: SidebarBodyProps) {
  return (
    <TooltipProvider>
      {/* ── Logo / app dropdown ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-b border-sidebar-border",
          compact ? "flex justify-center py-2" : "flex px-3 py-2.5"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "cursor-pointer bg-transparent border-none p-0",
                !compact && "flex items-center gap-3 w-full"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-lg bg-sidebar-accent border border-sidebar-border font-bold text-foreground shrink-0",
                  compact ? "w-9 h-9 text-[11px]" : "w-8 h-8 text-[10px]"
                )}
              >
                {appIcon ?? appName}
              </span>
              {!compact && (
                <span className="text-sm font-semibold text-foreground truncate">
                  {appFullName ?? appName}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-[220px]">
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
              onClick={onAppNameClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAppNameClick?.();
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-sidebar-accent border border-sidebar-border flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-foreground">
                  {appIcon ?? appName}
                </span>
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

      {/* ── Nav groups ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1",
          compact
            ? "flex flex-col items-center gap-1 px-2 pt-3"
            : "flex flex-col py-2 overflow-y-auto"
        )}
      >
        {navGroups.map((group, groupIndex) => (
          <React.Fragment key={group.label ?? groupIndex}>
            {groupIndex > 0 && (
              <div
                className={cn(
                  "border-t border-sidebar-border",
                  compact ? "w-8 my-2" : "mx-3 my-1"
                )}
              />
            )}
            {!compact && group.label && (
              <span className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                {group.label}
              </span>
            )}
            <div
              className={cn(
                "flex flex-col",
                compact ? "items-center gap-3 w-full" : "gap-0.5"
              )}
            >
              {group.pages.map((page) => {
                const Icon = page.icon;
                const iconEl = Icon ? (
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      page.isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      page.isActive ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                  />
                );

                const handleClick = () => {
                  page.onClick?.();
                  onAfterNavClick?.();
                };

                if (compact) {
                  return (
                    <Tooltip key={page.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex flex-col items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 w-full"
                          onClick={handleClick}
                        >
                          <div
                            className={cn(
                              pageIconVariants({ active: page.isActive ?? false, compact: true })
                            )}
                          >
                            {iconEl}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-medium leading-tight text-center",
                              page.isActive
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground"
                            )}
                          >
                            {page.label}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{page.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                // Expanded (mobile) layout
                return (
                  <button
                    key={page.id}
                    type="button"
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 text-sm cursor-pointer bg-transparent border-none text-left transition-colors duration-150 rounded-md mx-1",
                      page.isActive
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                    onClick={handleClick}
                  >
                    <div
                      className={cn(
                        pageIconVariants({ active: page.isActive ?? false, compact: false })
                      )}
                    >
                      {iconEl}
                    </div>
                    <span>{page.label}</span>
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Bottom: version + user avatar ───────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border",
          compact ? "flex flex-col items-center" : "flex flex-col"
        )}
      >
        {version && (
          <span
            className={cn(
              "text-[9px] text-muted-foreground/60 font-mono tracking-wide",
              compact ? "pt-1.5 pb-0.5 text-center" : "px-3 pt-2 pb-0.5"
            )}
          >
            {version}
          </span>
        )}
        {user && (
          <div className={cn("py-2", compact ? "flex justify-center" : "px-2")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {compact ? (
                  <button
                    type="button"
                    className="cursor-pointer bg-transparent border-none p-0"
                  >
                    {user.avatar ?? (
                      <Avatar
                        size="sm"
                        className="bg-primary cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors cursor-pointer bg-transparent border-none text-left"
                  >
                    {user.avatar ?? (
                      <Avatar
                        size="sm"
                        className="bg-primary shrink-0"
                      >
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-medium text-foreground truncate">
                        {user.name}
                      </span>
                      {user.role && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </DropdownMenuTrigger>
              {userMenuItems && userMenuItems.length > 0 && (
                <DropdownMenuContent side="right" align="end" className="min-w-[180px]">
                  {user.role && compact && (
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
      </div>
    </TooltipProvider>
  );
}

// =============================================================================
// Icon rail sidebar (desktop only — hidden on mobile)
// =============================================================================

function IconRailSidebar(
  props: Omit<SidebarBodyProps, "compact" | "onAfterNavClick">
) {
  return (
    <nav
      data-slot="data-app-sidebar-rail"
      aria-label="Application navigation"
      className="hidden md:flex w-[60px] flex-col shrink-0 bg-sidebar border-r border-sidebar-border h-full z-50"
    >
      <SidebarBody compact {...props} />
    </nav>
  );
}

// =============================================================================
// Workflow panel (exported for story composition)
// =============================================================================

const stepItemVariants = cva(
  "flex items-center gap-2 py-3.5 px-2.5 text-xs font-normal transition-colors duration-150 whitespace-nowrap leading-tight cursor-pointer border-l-[5px] w-full bg-transparent border-r-0 border-t-0 border-b-0",
  {
    variants: {
      active: {
        true: "border-l-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground shadow-sm",
        false: "border-l-sidebar-border bg-transparent text-muted-foreground hover:bg-sidebar-accent/50",
      },
    },
    defaultVariants: { active: false },
  }
);

export interface WorkflowPanelProps {
  steps: WorkflowStep[];
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

export function WorkflowPanel({ steps, collapsed, onCollapseChange }: WorkflowPanelProps) {
  if (collapsed) {
    return (
      <div
        data-slot="data-app-panel-collapsed"
        className="flex flex-col shrink-0 w-[46px] bg-sidebar border-r border-sidebar-border"
      >
        <div className="flex justify-center items-center h-10 border-b border-sidebar-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-5 h-5"
                  onClick={() => onCollapseChange(false)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand workflow panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                      step.isActive ? "border-l-primary" : "border-l-border",
                      step.disabled && "opacity-45 cursor-not-allowed"
                    )}
                    onClick={() => !step.disabled && step.onClick?.()}
                    disabled={step.disabled}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          step.isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          step.isActive ? "bg-primary" : "bg-muted-foreground/40"
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
      className="flex flex-col shrink-0 w-[180px] bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      <div className="flex items-center gap-1.5 h-10 px-2.5 pl-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-sidebar-border">
        <span className="flex-1">Workflow</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-5 h-5"
                onClick={() => onCollapseChange(true)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse workflow panel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={cn(
                stepItemVariants({ active: step.isActive ?? false }),
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
                    step.isActive ? "text-primary" : "text-muted-foreground"
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
// Data count pills (exported for story / consumer composition)
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

export interface DataCountPillsProps {
  dataCounts: DataCount[];
  className?: string;
}

export function DataCountPills({ dataCounts, className }: DataCountPillsProps) {
  if (dataCounts.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
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
  );
}

// =============================================================================
// Top nav
// =============================================================================

function TopNav({
  breadcrumbs = [],
  onHelpClick,
  headerActions,
  mobileTrigger,
}: {
  breadcrumbs?: BreadcrumbItemConfig[];
  onHelpClick?: () => void;
  headerActions?: React.ReactNode;
  mobileTrigger?: React.ReactNode;
}) {
  return (
    <div
      data-slot="data-app-top-nav"
      className="flex items-center h-10 px-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-40 w-full gap-2"
    >
      {/* Mobile hamburger (hidden on md+) */}
      {mobileTrigger}

      {/* Left: Breadcrumbs */}
      <Breadcrumb className="flex-1 min-w-0">
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isClickable = !isLast && (!!item.href || !!item.onClick);
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : isClickable && item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : isClickable && item.onClick ? (
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

      {/* Right: header actions + help */}
      <div className="flex items-center gap-2 shrink-0">
        {headerActions}

        {onHelpClick && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground"
                  onClick={onHelpClick}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
  appIcon,
  navGroups,
  user,
  userMenuItems,
  onAppNameClick,
  backToPlatformPath,
  onBackToPlatform,
  version,
  breadcrumbs = [],
  onHelpClick,
  headerActions,
  sidebarPanel,
  children,
  className,
}: DataAppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const sidebarProps = {
    appName,
    appFullName,
    appIcon,
    navGroups,
    user,
    userMenuItems,
    onAppNameClick,
    backToPlatformPath,
    onBackToPlatform,
    version,
  };

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <div
        data-slot="data-app-shell"
        className={cn("flex flex-row w-full h-screen overflow-hidden", className)}
      >
        {/* Desktop icon rail (hidden on mobile) */}
        <IconRailSidebar {...sidebarProps} />

        {/* Mobile sidebar Sheet */}
        <SheetContent
          side="left"
          showCloseButton={false}
          className="p-0 bg-sidebar border-r border-sidebar-border data-[side=left]:w-[220px] data-[side=left]:sm:w-[220px] data-[side=left]:sm:max-w-[220px] flex flex-col"
        >
          <nav aria-label="Application navigation" className="flex flex-col h-full">
            <SidebarBody
              compact={false}
              onAfterNavClick={() => setMobileNavOpen(false)}
              {...sidebarProps}
            />
          </nav>
        </SheetContent>

        {/* Right: top nav + panel + content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopNav
            breadcrumbs={breadcrumbs}
            onHelpClick={onHelpClick}
            headerActions={headerActions}
            mobileTrigger={
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="md:hidden w-7 h-7 shrink-0 text-muted-foreground"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
            }
          />

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Sidebar panel slot (e.g. WorkflowPanel) */}
            {sidebarPanel}

            {/* Content area */}
            <main
              data-slot="data-app-shell-content"
              className="flex-1 overflow-auto bg-background"
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

export default DataAppShell;
export { DataAppShell };
