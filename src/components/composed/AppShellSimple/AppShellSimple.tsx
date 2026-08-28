/**
 * AppShellSimple (SW-2410) — a Data App Shell stripped down to just two zones:
 * a full-width **top bar** and a three-state **side nav**. For apps that don't
 * need the full `DataAppShell` (no secondary nav, right panel, horizontal nav
 * variant, or mobile Sheet).
 *
 *  - The side-nav control **lives in the top bar** (far left, above the nav).
 *    It ping-pongs the nav through three states — labels ↔ icons ↔ hidden —
 *    and dragging the nav's right border snaps between the same three.
 *  - The **breadcrumb is the top bar name** — it sits right after the toggle.
 *
 * Composes existing kit primitives (`TopBar`, `DataAppShellPrimaryNav`,
 * `Breadcrumb`, `Button`, `Tooltip`).
 */
import { PanelLeft } from "lucide-react";
import * as React from "react";

import { DataAppShellPrimaryNav, type NavGroup } from "@/components/composed/DataAppShell";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface AppShellSimpleCrumb {
  /** Display label */
  label: string;
  /** If set, the crumb renders as a link */
  href?: string;
  /** Click handler when there's no `href` */
  onClick?: () => void;
}

/**
 * The side nav has three states. The top-bar toggle ping-pongs between them,
 * and dragging the nav's right border snaps between them:
 * - `sidebar` — full panel with icon + label rows
 * - `rail`    — icon-only rail
 * - `hidden`  — no side nav; only the top bar + content
 */
export type AppShellSimpleNavState = "sidebar" | "rail" | "hidden";

/**
 * Where the nav sits in the ping-pong: which state (`index` into `NAV_ORDER`)
 * and which way the next toggle click moves (`dir`, reversing at either end).
 */
type NavCursor = { index: number; dir: 1 | -1 };

// Ping-pong order (does not wrap): labels ↔ icons ↔ hidden.
const NAV_ORDER: AppShellSimpleNavState[] = ["sidebar", "rail", "hidden"];
const LAST_NAV = NAV_ORDER.length - 1;

// Single source of truth for the direction convention: point inward from the
// ends so the next toggle keeps the ping-pong moving (middle defaults forward).
const dirFor = (index: number): 1 | -1 => (index >= LAST_NAV ? -1 : 1);

// Fixed widths per state — the border drag snaps between these; it never sets
// an in-between width.
const RAIL_WIDTH = 48;
const SIDEBAR_WIDTH = 220;
// Snap thresholds: midpoints between the fixed widths.
const RAIL_SNAP = (RAIL_WIDTH + SIDEBAR_WIDTH) / 2;
const HIDE_SNAP = RAIL_WIDTH / 2;

/** Map a dragged pixel width to the nearest nav state. */
function snapNav(width: number): NavCursor {
  const index = width >= RAIL_SNAP ? 0 : width >= HIDE_SNAP ? 1 : LAST_NAV;
  return { index, dir: dirFor(index) };
}

/** Next cursor in the ping-pong, reversing direction at either end. */
function nextNav({ index, dir }: NavCursor): NavCursor {
  const forward = index + dir;
  if (forward < 0 || forward > LAST_NAV) {
    const reversed = (dir * -1) as 1 | -1;
    return { index: index + reversed, dir: reversed };
  }
  return { index: forward, dir };
}

// Label describes the destination the next click moves to.
const NAV_TOGGLE_LABEL: Record<AppShellSimpleNavState, string> = {
  sidebar: "Expand navigation to labels",
  rail: "Collapse navigation to icons",
  hidden: "Hide navigation",
};

export interface AppShellSimpleProps {
  /** Nav groups rendered in the side nav */
  navGroups: NavGroup[];
  /** Breadcrumb trail — the top bar name */
  breadcrumbs: AppShellSimpleCrumb[];
  /** Right-side top bar actions (e.g. notifications, user menu) */
  headerActions?: React.ReactNode;
  /** Bottom-of-nav user slot */
  userMenu?: React.ReactNode;
  /** Uncontrolled initial nav state (default `sidebar`) */
  defaultNav?: AppShellSimpleNavState;
  /** Main content */
  children: React.ReactNode;
}

// =============================================================================
// Breadcrumb trail — the top bar name
// =============================================================================

function ShellBreadcrumb({ items }: { items: AppShellSimpleCrumb[] }) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && (!!item.href || !!item.onClick);
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator className="shrink-0">/</BreadcrumbSeparator>}
              <BreadcrumbItem className={isLast ? "min-w-0" : "shrink-0"}>
                {isLast ? (
                  <BreadcrumbPage className="truncate font-medium">{item.label}</BreadcrumbPage>
                ) : isClickable && item.href ? (
                  <BreadcrumbLink href={item.href} className="whitespace-nowrap">
                    {item.label}
                  </BreadcrumbLink>
                ) : isClickable && item.onClick ? (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline cursor-pointer bg-transparent border-none p-0 font-normal whitespace-nowrap"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
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
// Top-bar side-nav toggle — the collapse/expand control (SW-2410).
// =============================================================================

function SideNavToggle({ label, onCycle }: { label: string; onCycle: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="app-shell-simple-nav-toggle"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className="shrink-0 text-muted-foreground"
            onClick={onCycle}
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =============================================================================
// AppShellSimple — two zones: full-width top bar + collapsible side nav
// =============================================================================

export function AppShellSimple({
  navGroups,
  breadcrumbs,
  headerActions,
  userMenu,
  defaultNav = "sidebar",
  children,
}: AppShellSimpleProps) {
  const [nav, setNav] = React.useState<NavCursor>(() => {
    const index = Math.max(0, NAV_ORDER.indexOf(defaultNav));
    return { index, dir: dirFor(index) };
  });
  const navState = NAV_ORDER[nav.index];
  const cycleNav = () => setNav(nextNav);
  // Label describes where the next click lands.
  const nextLabel = NAV_TOGGLE_LABEL[NAV_ORDER[nextNav(nav).index]];

  // Drag the border to snap between the three states (widest → slimmest:
  // icon + text → icon rail → fully closed). Pointer capture keeps the drag
  // scoped to the handle — no window listeners to leak.
  const navRef = React.useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = React.useState(false);
  const snapToPointer = (clientX: number) =>
    setNav(snapNav(clientX - (navRef.current?.getBoundingClientRect().left ?? 0)));

  return (
    <div
      data-slot="app-shell-simple"
      data-nav-state={navState}
      // Full-width top bar spans both columns; the side nav sits below it on the
      // left. The toggle in the top bar's far-left cell aligns over the nav.
      className={cn(
        "grid h-screen w-full overflow-hidden [grid-template-columns:auto_minmax(0,1fr)] [grid-template-rows:auto_minmax(0,1fr)] [grid-template-areas:'top_top'_'nav_body']",
        resizing && "select-none cursor-col-resize"
      )}
    >
      {/* Top bar */}
      <div className="[grid-area:top] min-w-0">
        <TopBar
          left={
            <>
              <SideNavToggle label={nextLabel} onCycle={cycleNav} />
              <ShellBreadcrumb items={breadcrumbs} />
            </>
          }
          right={headerActions}
        />
      </div>

      {/* Side nav — sidebar (labels) or rail (icons); the toggle ping-pongs and
          the border drag snaps between states */}
      {navState !== "hidden" && (
        <div
          ref={navRef}
          data-slot="app-shell-simple-nav"
          className="[grid-area:nav] relative min-h-0 flex flex-col shrink-0 bg-sidebar border-r border-sidebar-border h-full transition-[width] duration-200"
          style={{ width: navState === "rail" ? RAIL_WIDTH : SIDEBAR_WIDTH }}
        >
          <DataAppShellPrimaryNav
            variant={navState === "rail" ? "rail" : "sidebar"}
            aria-label="Application navigation"
            navGroups={navGroups}
            user={userMenu}
            className="h-full w-full"
          />
          {/* Drag handle on the right border — snaps between the nav states */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize navigation"
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setResizing(true);
            }}
            onPointerMove={(e) => {
              if (resizing) snapToPointer(e.clientX);
            }}
            onPointerUp={() => setResizing(false)}
            className={cn(
              "absolute top-0 right-0 z-10 h-full w-1.5 translate-x-1/2 cursor-col-resize transition-colors hover:bg-primary/40",
              resizing && "bg-primary/60"
            )}
          />
        </div>
      )}

      {/* Body */}
      <main
        data-slot="app-shell-simple-content"
        className="[grid-area:body] min-h-0 min-w-0 overflow-auto bg-background"
      >
        {children}
      </main>
    </div>
  );
}
