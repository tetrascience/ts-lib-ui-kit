/**
 * Pure side-nav state machine for `AppShellSimple` — the ping-pong order, the
 * drag snap points, and the toggle's label. Kept free of React and the DOM so
 * the thresholds and transitions are unit-tested directly; the component only
 * wires these to clicks, keys, and pointer events.
 */

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
export type NavCursor = { index: number; dir: 1 | -1 };

// Ping-pong order (does not wrap): labels ↔ icons ↔ hidden.
export const NAV_ORDER: AppShellSimpleNavState[] = ["sidebar", "rail", "hidden"];
export const LAST_NAV = NAV_ORDER.length - 1;

// Single source of truth for the direction convention: point inward from the
// ends so the next toggle keeps the ping-pong moving (middle defaults forward).
export const dirFor = (index: number): 1 | -1 => (index >= LAST_NAV ? -1 : 1);

/** Index of a nav state; an unknown value (plain JS, stale storage) is `sidebar`. */
export const indexOfNav = (state: AppShellSimpleNavState) => Math.max(0, NAV_ORDER.indexOf(state));

// Fixed widths per state — the border drag snaps between these; it never sets
// an in-between width.
const RAIL_WIDTH = 48;
export const SIDEBAR_WIDTH = 220;
// Snap thresholds: midpoints between the fixed widths.
const RAIL_SNAP = (RAIL_WIDTH + SIDEBAR_WIDTH) / 2;
const HIDE_SNAP = RAIL_WIDTH / 2;

export const NAV_WIDTH: Record<AppShellSimpleNavState, number> = {
  sidebar: SIDEBAR_WIDTH,
  rail: RAIL_WIDTH,
  hidden: 0,
};

/**
 * The cursor the shell renders from. Uncontrolled, the stored cursor is the
 * truth. Controlled, `nav` owns the index; the stored `dir` only survives if
 * the stored index still agrees — a parent that moved the nav itself (or
 * rejected a requested change) invalidates it, so it resets to `dirFor`.
 */
export function resolveCursor(stored: NavCursor, controlled?: AppShellSimpleNavState): NavCursor {
  const index = controlled === undefined ? stored.index : indexOfNav(controlled);
  return { index, dir: stored.index === index ? stored.dir : dirFor(index) };
}

/** Map a dragged pixel width to the nearest nav state. */
export function snapNav(width: number): NavCursor {
  const index = width >= RAIL_SNAP ? 0 : width >= HIDE_SNAP ? 1 : LAST_NAV;
  return { index, dir: dirFor(index) };
}

/** Next cursor in the ping-pong, reversing direction at either end. */
export function nextNav({ index, dir }: NavCursor): NavCursor {
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
export function navToggleLabel(from: number, to: number): string {
  switch (NAV_ORDER[to]) {
    case "sidebar":
      return "Expand navigation to labels";
    case "hidden":
      return "Hide navigation";
    default:
      return to > from ? "Collapse navigation to icons" : "Expand navigation to icons";
  }
}
