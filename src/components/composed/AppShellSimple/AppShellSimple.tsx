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

import {
  DataAppShellPrimaryNav,
  type NavGroup,
  type NavPage,
} from "@/components/composed/DataAppShell";
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

const indexOfNav = (state: AppShellSimpleNavState) => Math.max(0, NAV_ORDER.indexOf(state));

// Fixed widths per state — the border drag snaps between these; it never sets
// an in-between width.
const RAIL_WIDTH = 48;
const SIDEBAR_WIDTH = 220;
// Snap thresholds: midpoints between the fixed widths.
const RAIL_SNAP = (RAIL_WIDTH + SIDEBAR_WIDTH) / 2;
const HIDE_SNAP = RAIL_WIDTH / 2;

const NAV_WIDTH: Record<AppShellSimpleNavState, number> = {
  sidebar: SIDEBAR_WIDTH,
  rail: RAIL_WIDTH,
  hidden: 0,
};

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

/**
 * Label for the toggle, describing the transition the next click performs.
 * `rail` is reachable from both directions, so it can't be keyed on the
 * destination alone — arriving from `hidden` is an expand, not a collapse.
 */
function navToggleLabel(from: number, to: number): string {
  switch (NAV_ORDER[to]) {
    case "sidebar":
      return "Expand navigation to labels";
    case "hidden":
      return "Hide navigation";
    default:
      return to > from ? "Collapse navigation to icons" : "Expand navigation to icons";
  }
}

export interface AppShellSimpleProps {
  /**
   * Whether the app has a side nav at all (default `true`). When `false`, the
   * shell renders as a top bar + full-width body: no nav zone, and no top-bar
   * toggle. This is the app-level switch — distinct from the runtime `hidden`
   * nav state, which the end user can toggle back open. `navGroups` is ignored
   * when `showNav` is `false`.
   */
  showNav?: boolean;
  /** Nav groups rendered in the side nav (ignored when `showNav` is `false`) */
  navGroups?: NavGroup[];
  /** Controlled active page id — takes precedence over per-page `isActive` */
  activeKey?: string;
  /** Called with the selected page id after the page's own `onClick` */
  onSelect?: (key: string, page: NavPage) => void;
  /** Breadcrumb trail — the top bar name */
  breadcrumbs: AppShellSimpleCrumb[];
  /** Right-side top bar actions (e.g. notifications, user menu) */
  headerActions?: React.ReactNode;
  /** Bottom-of-nav user slot */
  userMenu?: React.ReactNode;
  /** Uncontrolled initial nav state (default `sidebar`) */
  defaultNav?: AppShellSimpleNavState;
  /** Controlled nav state — pair with `onNavChange`; overrides `defaultNav` */
  nav?: AppShellSimpleNavState;
  /** Fired whenever the nav state changes (toggle, drag, or keyboard resize) */
  onNavChange?: (nav: AppShellSimpleNavState) => void;
  /** Main content */
  children: React.ReactNode;
}

const EMPTY_NAV_GROUPS: NavGroup[] = [];

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
                  <BreadcrumbLink href={item.href} className="whitespace-nowrap text-primary">
                    {item.label}
                  </BreadcrumbLink>
                ) : isClickable && item.onClick ? (
                  <BreadcrumbLink asChild className="whitespace-nowrap text-primary">
                    <button type="button" className="cursor-pointer" onClick={item.onClick}>
                      {item.label}
                    </button>
                  </BreadcrumbLink>
                ) : (
                  <span className="whitespace-nowrap">{item.label}</span>
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
  showNav = true,
  navGroups = EMPTY_NAV_GROUPS,
  activeKey,
  onSelect,
  breadcrumbs,
  headerActions,
  userMenu,
  defaultNav = "sidebar",
  nav: navProp,
  onNavChange,
  children,
}: AppShellSimpleProps) {
  // The cursor is always local: `index` is only authoritative while
  // uncontrolled, but `dir` (which way the ping-pong is travelling) has no
  // prop equivalent and is tracked here in both modes.
  const [cursor, setCursor] = React.useState<NavCursor>(() => {
    const index = indexOfNav(navProp ?? defaultNav);
    return { index, dir: dirFor(index) };
  });

  const index = navProp === undefined ? cursor.index : indexOfNav(navProp);
  // A controlled index moved by the parent invalidates our stored direction.
  const dir = cursor.index === index ? cursor.dir : dirFor(index);
  const navState = NAV_ORDER[index];

  const applyNav = React.useCallback(
    (next: NavCursor) => {
      setCursor(next);
      if (next.index !== index) onNavChange?.(NAV_ORDER[next.index]);
    },
    [index, onNavChange]
  );

  const nextCursor = nextNav({ index, dir });
  const cycleNav = () => applyNav(nextCursor);
  // Label describes the transition the next click performs.
  const nextLabel = navToggleLabel(index, nextCursor.index);

  // Drag the border to snap between the three states (widest → slimmest:
  // icon + text → icon rail → fully closed). Pointer capture keeps the drag
  // scoped to the handle — no window listeners to leak.
  //
  // The nav zone stays mounted at `width: 0` in the `hidden` state rather than
  // unmounting: unmounting mid-drag destroyed the element holding pointer
  // capture, so `pointerup` never came back and `resizing` stuck on. Keeping it
  // mounted also makes the handle draggable back out of `hidden`.
  const navId = React.useId();
  const navRef = React.useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = React.useState(false);
  const snapToPointer = (clientX: number) =>
    applyNav(snapNav(clientX - (navRef.current?.getBoundingClientRect().left ?? 0)));

  const stepNav = (delta: 1 | -1) => {
    const target = Math.min(LAST_NAV, Math.max(0, index + delta));
    if (target !== index) applyNav({ index: target, dir: dirFor(target) });
  };

  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    // ← narrower · → wider, matching the on-screen direction of the drag
    // (the arrow moves the nav's right border the same way).
    const move: Record<string, () => void> = {
      ArrowLeft: () => stepNav(1),
      ArrowRight: () => stepNav(-1),
      Home: () => applyNav({ index: 0, dir: dirFor(0) }),
      End: () => applyNav({ index: LAST_NAV, dir: dirFor(LAST_NAV) }),
    };
    const action = move[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const isHidden = navState === "hidden";

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
              {showNav && <SideNavToggle label={nextLabel} onCycle={cycleNav} />}
              <ShellBreadcrumb items={breadcrumbs} />
            </>
          }
          right={headerActions}
        />
      </div>

      {/* Side nav — sidebar (labels), rail (icons), or collapsed to zero width
          when hidden; the toggle ping-pongs and the border drag snaps between
          states. Omitted entirely when the app opts out (`showNav={false}`). */}
      {showNav && (
        <div
          ref={navRef}
          id={navId}
          data-slot="app-shell-simple-nav"
          data-nav-state={navState}
          className={cn(
            "[grid-area:nav] relative min-h-0 flex flex-col shrink-0 bg-sidebar h-full transition-[width] duration-200",
            isHidden ? "overflow-hidden" : "border-r border-sidebar-border"
          )}
          style={{ width: NAV_WIDTH[navState] }}
        >
          {/* `inert` keeps the collapsed nav out of the tab order and the
              accessibility tree while it stays mounted for the drag handle. */}
          <div
            data-slot="app-shell-simple-nav-content"
            className="h-full w-full overflow-hidden"
            inert={isHidden}
          >
            <DataAppShellPrimaryNav
              variant={navState === "rail" ? "rail" : "sidebar"}
              aria-label="Application navigation"
              navGroups={navGroups}
              activeKey={activeKey}
              onSelect={onSelect}
              user={userMenu}
              className="h-full w-full"
            />
          </div>
          {/* Drag handle on the right border — snaps between the nav states.
              Also a keyboard-operable window splitter (arrows / Home / End). */}
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label="Resize navigation"
            aria-controls={navId}
            aria-valuemin={0}
            aria-valuemax={SIDEBAR_WIDTH}
            aria-valuenow={NAV_WIDTH[navState]}
            aria-valuetext={navState}
            onKeyDown={onHandleKeyDown}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setResizing(true);
            }}
            onPointerMove={(e) => {
              if (!resizing) return;
              // Defensive: a lost capture can strand `resizing` on, which would
              // otherwise turn a plain hover into a resize.
              if (e.buttons === 0) {
                setResizing(false);
                return;
              }
              snapToPointer(e.clientX);
            }}
            onPointerUp={() => setResizing(false)}
            onPointerCancel={() => setResizing(false)}
            onLostPointerCapture={() => setResizing(false)}
            className={cn(
              "absolute top-0 right-0 z-10 h-full translate-x-1/2 cursor-col-resize transition-colors hover:bg-primary/40 focus-visible:outline-none focus-visible:bg-primary/60 focus-visible:ring-2 focus-visible:ring-ring",
              isHidden ? "w-3" : "w-1.5",
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
