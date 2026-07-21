import { ArrowLeft, ChevronRight, HelpCircle, Menu } from "lucide-react";
import * as React from "react";

import { DataAppShellPrimaryNav } from "./PrimaryNav";
import { DataAppShellProvider, type DataAppShellNavVariant } from "./ShellContext";

import type { NavGroup } from "./PrimaryNav";

import { TDPLink } from "@/components/composed/tdp-link";
import { TopBar } from "@/components/composed/TopBar";
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

// Nav item types live with the nav engine — re-exported here for back-compat.
export type { NavPage, NavGroup } from "./PrimaryNav";

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
  /** Center "context" slot in the top bar (e.g. a version / status selector) */
  headerCenter?: React.ReactNode;
  /** Slot for right-side actions in the top nav (e.g. data count pills, next button) */
  headerActions?: React.ReactNode;

  // -- Shell zones --
  /** Primary nav axis — `vertical` (sidebar/rail, default) or `horizontal` (top nav row) */
  navVariant?: DataAppShellNavVariant;
  /** Slot rendered between the primary nav and the content (e.g. a vertical `DataAppShellSecondaryNav`) */
  sidebarPanel?: React.ReactNode;
  /** Full-width zone between the top bar and the content row (e.g. a horizontal `DataAppShellSecondaryNav`) */
  secondaryBar?: React.ReactNode;
  /** Slot rendered after the content (e.g. a DataAppShellRightPanel) — its FAB anchors to the content row */
  rightPanel?: React.ReactNode;
  /** Show the primary nav zone. Set false to hide it entirely. */
  showNavRail?: boolean; // default true
  /** Show the top bar zone. Set false to hide it entirely. */
  showTopBar?: boolean; // default true

  // -- Collapse (vertical nav only) --
  /** Controlled collapse state — drives the secondary zone (via ShellContext)
   *  and, with `hideNavOnCollapse`, the primary rail */
  collapsed?: boolean;
  /** Uncontrolled initial collapse state */
  defaultCollapsed?: boolean;
  /** Called whenever the shell collapse state flips */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Collapsing also hides the primary rail, leaving one icon rail (the secondary
   *  nav) with an expand affordance — or a floating expand button if there is none. */
  hideNavOnCollapse?: boolean;
  /** Media query that auto-collapses the shell while it matches.
   *  Pass `false` to disable. Defaults to `"(max-width: 1023px)"`. */
  autoCollapse?: string | false;

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
   * compact=true  → narrow icon rail (48px): icon-only nav buttons, tooltips on hover
   * compact=false → expanded mobile sheet (220px): icon + label side-by-side rows
   */
  compact: boolean;
  /** Called after a nav page item is clicked — used by mobile sheet to close itself */
  onAfterNavClick?: () => void;
}

// =============================================================================
// App header menu — logo/name button opening the app dropdown
// =============================================================================

interface AppHeaderMenuProps
  extends Pick<
    DataAppShellProps,
    | "appName"
    | "appFullName"
    | "appIcon"
    | "version"
    | "onAppNameClick"
    | "backToPlatformPath"
    | "onBackToPlatform"
  > {
  /** compact=true → icon-only trigger (rail); compact=false → icon + name row */
  compact: boolean;
  /** Which side of the trigger the dropdown opens on — `right` beside a rail, `bottom` under a top bar */
  menuSide?: "right" | "bottom";
}

function AppHeaderMenu({
  appName,
  appFullName,
  appIcon,
  version,
  onAppNameClick,
  backToPlatformPath,
  onBackToPlatform,
  compact,
  menuSide = "right",
}: AppHeaderMenuProps) {
  return (
    <DropdownMenu modal={false}>
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
                  "flex items-center justify-center rounded-lg bg-sidebar-accent border border-sidebar-border font-bold text-foreground shrink-0 w-8 h-8 text-[10px]"
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
          <DropdownMenuContent side={menuSide} align="start" className="min-w-[220px]">
            <DropdownMenuItem
              className="gap-3 px-3 py-2.5"
              onSelect={() => onAppNameClick?.()}
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
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5 p-0" asChild>
              {backToPlatformPath ? (
                <TDPLink
                  path={backToPlatformPath}
                  navigationOptions={{ newTab: false }}
                  className="flex items-center gap-2.5 w-full px-2 py-1.5 !no-underline hover:!no-underline"
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
  );
}

// =============================================================================
// Sidebar shared body — the PrimaryNav engine with the app header + user slots
// =============================================================================

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
    <DataAppShellPrimaryNav
      variant={compact ? "rail" : "sidebar"}
      aria-label="Application navigation"
      navGroups={navGroups}
      onSelect={() => onAfterNavClick?.()}
      header={
        <AppHeaderMenu
          appName={appName}
          appFullName={appFullName}
          appIcon={appIcon}
          version={version}
          onAppNameClick={onAppNameClick}
          backToPlatformPath={backToPlatformPath}
          onBackToPlatform={onBackToPlatform}
          compact={compact}
        />
      }
      user={userMenu}
      className="h-full w-full"
    />
  );
}

// =============================================================================
// Icon rail sidebar (desktop only — hidden on mobile)
// =============================================================================

function IconRailSidebar(props: Omit<SidebarBodyProps, "compact" | "onAfterNavClick">) {
  return (
    <div
      data-slot="data-app-sidebar-rail"
      className="hidden md:flex w-12 flex-col shrink-0 bg-sidebar border-r border-sidebar-border h-full z-50"
    >
      <SidebarBody compact {...props} />
    </div>
  );
}

// =============================================================================
// Breadcrumb trail — rendered from the shell's breadcrumb config
// =============================================================================

function TopNavBreadcrumb({ items }: { items: BreadcrumbItemConfig[] }) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
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
                    className="text-sm text-primary hover:underline cursor-pointer bg-transparent border-none p-0 font-normal"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// =============================================================================
// Top nav — maps shell props onto the reusable TopBar (left/center/right)
// =============================================================================

function TopNav({
  breadcrumbs = [],
  onHelpClick,
  headerCenter,
  headerActions,
  mobileTrigger,
}: {
  breadcrumbs?: BreadcrumbItemConfig[];
  onHelpClick?: () => void;
  headerCenter?: React.ReactNode;
  headerActions?: React.ReactNode;
  mobileTrigger?: React.ReactNode;
}) {
  return (
    <TopBar
      data-slot="data-app-top-nav"
      left={
        <>
          {/* Mobile hamburger (hidden on md+) */}
          {mobileTrigger}
          <TopNavBreadcrumb items={breadcrumbs} />
        </>
      }
      center={headerCenter}
      right={
        <>
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
                    aria-label="Help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Help</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      }
    />
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
  headerCenter,
  headerActions,
  navVariant = "vertical",
  sidebarPanel,
  secondaryBar,
  rightPanel,
  showNavRail = true,
  showTopBar = true,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  hideNavOnCollapse = false,
  autoCollapse = "(max-width: 1023px)",
  children,
  className,
}: DataAppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // ── Single collapse toggle (controlled/uncontrolled) ───────────────────────
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const collapsedRef = React.useRef(collapsed);
  collapsedRef.current = collapsed;
  // Set when the media query (not the user) collapsed the shell, so leaving
  // the breakpoint restores the expanded state without fighting manual toggles.
  const autoCollapsedRef = React.useRef(false);

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      autoCollapsedRef.current = false;
      if (collapsedProp === undefined) setInternalCollapsed(next);
      onCollapsedChange?.(next);
    },
    [collapsedProp, onCollapsedChange],
  );

  // ── Responsive auto-collapse below the breakpoint ───────────────────────────
  // The media-query handler lives in a ref so the subscription survives
  // re-renders without re-running for every collapse/callback change.
  const applyAutoCollapseRef = React.useRef((matches: boolean) => void matches);
  applyAutoCollapseRef.current = (matches: boolean) => {
    if (matches && !collapsedRef.current) {
      if (collapsedProp === undefined) setInternalCollapsed(true);
      onCollapsedChange?.(true);
      autoCollapsedRef.current = true;
    } else if (!matches && autoCollapsedRef.current) {
      autoCollapsedRef.current = false;
      if (collapsedProp === undefined) setInternalCollapsed(false);
      onCollapsedChange?.(false);
    }
  };

  React.useEffect(() => {
    if (autoCollapse === false || navVariant !== "vertical") return;
    const mql = window.matchMedia(autoCollapse);
    applyAutoCollapseRef.current(mql.matches);
    const onChange = (e: MediaQueryListEvent) => applyAutoCollapseRef.current(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [autoCollapse, navVariant]);

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

  // hideNavOnCollapse — the primary nav zone leaves the grid entirely while
  // collapsed; the secondary zone (if any) becomes the single icon rail.
  const navHidden = !showNavRail || (hideNavOnCollapse && collapsed);
  const isVertical = navVariant === "vertical";

  // CSS-grid template areas per navVariant — the shell knows zones, never
  // domain concepts. Zones absent from the tree simply collapse their track.
  // The secondary (side) zone starts below the top bar / secondary bar, so
  // breadcrumbs span the full width beside the primary nav.
  const gridClass = isVertical
    ? "grid h-screen w-full overflow-hidden [grid-template-columns:auto_auto_minmax(0,1fr)] [grid-template-rows:auto_auto_minmax(0,1fr)] [grid-template-areas:'nav_top_top'_'nav_sub_sub'_'nav_side_body']"
    : "grid h-screen w-full overflow-hidden [grid-template-columns:auto_minmax(0,1fr)] [grid-template-rows:auto_auto_auto_minmax(0,1fr)] [grid-template-areas:'pnav_pnav'_'top_top'_'sub_sub'_'side_body']";

  return (
    <DataAppShellProvider value={{ navVariant, collapsed, setCollapsed, hideNavOnCollapse }}>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <div
          data-slot="data-app-shell"
          data-nav-variant={navVariant}
          data-collapsed={collapsed || undefined}
          className={cn(gridClass, className)}
        >
          {/* Primary nav zone */}
          {!navHidden &&
            (isVertical ? (
              <div className="[grid-area:nav] min-h-0">
                <IconRailSidebar {...sidebarProps} />
              </div>
            ) : (
              <div className="[grid-area:pnav] hidden md:block border-b border-sidebar-border bg-sidebar px-3 py-1.5">
                <DataAppShellPrimaryNav
                  variant="top"
                  aria-label="Application navigation"
                  navGroups={navGroups}
                  header={<AppHeaderMenu {...sidebarProps} compact menuSide="bottom" />}
                  user={userMenu}
                />
              </div>
            ))}

          {/* Floating expand affordance — hideNavOnCollapse with no secondary rail */}
          {hideNavOnCollapse && collapsed && !sidebarPanel && (
            <Button
              data-slot="data-app-shell-expand-fab"
              variant="outline"
              size="icon-sm"
              aria-label="Expand navigation"
              className="absolute left-2 top-2 z-50 shadow-elevation-2"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

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
            <SidebarBody
              compact={false}
              onAfterNavClick={() => setMobileNavOpen(false)}
              {...sidebarProps}
            />
          </SheetContent>

          {/* Secondary (side) zone — e.g. a vertical DataAppShellSecondaryNav */}
          {sidebarPanel && <div className="[grid-area:side] min-h-0 flex">{sidebarPanel}</div>}

          {/* Top bar zone */}
          {showTopBar && (
            <div className="[grid-area:top] min-w-0">
              <TopNav
                breadcrumbs={breadcrumbs}
                onHelpClick={onHelpClick}
                headerCenter={headerCenter}
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
            </div>
          )}

          {/* Secondary bar zone — e.g. a horizontal DataAppShellSecondaryNav */}
          {secondaryBar && <div className="[grid-area:sub] min-w-0">{secondaryBar}</div>}

          {/* Body zone: content + right panel. relative — anchors the right
              panel's floating FAB trigger */}
          <div className="[grid-area:body] relative flex min-h-0 min-w-0 overflow-hidden">
            <main
              data-slot="data-app-shell-content"
              className="flex-1 min-w-0 overflow-auto bg-background"
            >
              {children}
            </main>

            {/* Right panel slot (e.g. DataAppShellRightPanel) */}
            {rightPanel}
          </div>
        </div>
      </Sheet>
    </DataAppShellProvider>
  );
}

export default DataAppShell;
export { AppHeaderMenu, DataAppShell };
