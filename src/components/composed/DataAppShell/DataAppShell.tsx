import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  HelpCircle,
  Menu,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { TDPLink } from "@/components/composed/tdp-link";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
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

export interface BreadcrumbItemConfig {
  /** Display label */
  label: string;
  /** If provided, renders as a link */
  href?: string;
  /** Click handler (used when no href is provided) */
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
  /** Optional version string shown below the app name/icon in the sidebar header */
  version?: string;
  /** Navigation groups; each group contains one or more pages */
  navGroups: NavGroup[];
  /** Callback when the app name / icon is clicked in the dropdown */
  onAppNameClick?: () => void;
  /** TDP path to navigate to when "Back to TDP Platform" is clicked (uses TDPLink — requires TdpNavigationProvider) */
  backToPlatformPath?: string;
  /** Fallback callback when "Back to TDP Platform" is clicked and no backToPlatformPath is set */
  onBackToPlatform?: () => void;
  /** Slot rendered at the bottom of the sidebar (e.g. user avatar + menu) */
  userMenu?: React.ReactNode;

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
// Sidebar shared body (used by desktop rail + mobile Sheet)
// =============================================================================

interface SidebarBodyProps
  extends Pick<
    DataAppShellProps,
    | "appName"
    | "appFullName"
    | "appIcon"
    | "version"
    | "navGroups"
    | "onAppNameClick"
    | "backToPlatformPath"
    | "onBackToPlatform"
    | "userMenu"
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
  version,
  navGroups,
  onAppNameClick,
  backToPlatformPath,
  onBackToPlatform,
  userMenu,
  compact,
  onAfterNavClick,
}: SidebarBodyProps) {
  return (
    <TooltipProvider>
      {/* ── Header: app icon / name + version ──────────────────────────────── */}
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
                !compact && "flex items-center gap-3 w-full text-left"
              )}
            >
              {/* Icon */}
              <span
                className={cn(
                  "flex items-center justify-center rounded-lg bg-sidebar-accent border border-sidebar-border font-bold text-foreground shrink-0",
                  compact ? "w-9 h-9 text-[11px]" : "w-8 h-8 text-[10px]"
                )}
              >
                {appIcon ?? appName}
              </span>

              {/* Name (expanded only — no version here) */}
              {!compact && (
                <span className="text-sm font-semibold text-foreground truncate leading-snug">
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
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {appFullName ?? appName}
                </span>
                {version && (
                  <span className="text-[10px] text-muted-foreground/70 font-mono leading-none mt-0.5">
                    {version}
                  </span>
                )}
              </div>
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
          "flex-1 min-h-0",
          compact
            ? "flex flex-col items-center gap-1 px-2 pt-3 overflow-y-auto"
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
                          <div className={cn(pageIconVariants({ active: page.isActive ?? false, compact: true }))}>
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

                // Expanded (mobile) row
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
                    <div className={cn(pageIconVariants({ active: page.isActive ?? false, compact: false }))}>
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

      {/* ── Bottom: user menu slot ──────────────────────────────────────────── */}
      {userMenu && (
        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border",
            compact ? "flex flex-col items-center py-2" : "p-2"
          )}
        >
          {userMenu}
        </div>
      )}
    </TooltipProvider>
  );
}

// =============================================================================
// Icon rail sidebar (desktop only — hidden on mobile)
// =============================================================================

function IconRailSidebar(props: Omit<SidebarBodyProps, "compact" | "onAfterNavClick">) {
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
  version,
  navGroups,
  onAppNameClick,
  backToPlatformPath,
  onBackToPlatform,
  userMenu,
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
    version,
    navGroups,
    onAppNameClick,
    backToPlatformPath,
    onBackToPlatform,
    userMenu,
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
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Application navigation menu
          </SheetDescription>
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
