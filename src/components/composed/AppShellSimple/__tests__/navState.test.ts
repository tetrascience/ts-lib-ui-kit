import { describe, expect, it } from "vitest";

import {
  type AppShellSimpleNavState,
  dirFor,
  indexOfNav,
  NAV_ORDER,
  NAV_WIDTH,
  type NavCursor,
  navToggleLabel,
  nextNav,
  resolveCursor,
  snapNav,
} from "../navState";

const state = ({ index }: NavCursor) => NAV_ORDER[index];

// ---------------------------------------------------------------------------
// snapNav — drag width → state. Widths are 220 / 48 / 0; the snap points are
// the midpoints, 134 and 24.
// ---------------------------------------------------------------------------

describe("snapNav", () => {
  it.each([
    [400, "sidebar"],
    [220, "sidebar"],
    [134, "sidebar"],
    [133, "rail"],
    [48, "rail"],
    [24, "rail"],
    [23, "hidden"],
    [0, "hidden"],
    [-50, "hidden"],
  ] as const)("snaps a %ipx drag to %s", (width, expected) => {
    expect(state(snapNav(width))).toBe(expected);
  });

  it("points the snapped cursor inward so the next toggle keeps moving", () => {
    expect(snapNav(220).dir).toBe(1);
    expect(snapNav(48).dir).toBe(1);
    expect(snapNav(0).dir).toBe(-1);
  });

  it("snaps each fixed width back to its own state", () => {
    for (const nav of NAV_ORDER) expect(state(snapNav(NAV_WIDTH[nav]))).toBe(nav);
  });
});

// ---------------------------------------------------------------------------
// nextNav — the toggle's ping-pong
// ---------------------------------------------------------------------------

describe("nextNav", () => {
  it("ping-pongs sidebar → rail → hidden → rail → sidebar without wrapping", () => {
    const visited: AppShellSimpleNavState[] = [];
    let cursor: NavCursor = { index: 0, dir: 1 };
    for (let i = 0; i < 5; i++) {
      cursor = nextNav(cursor);
      visited.push(state(cursor));
    }
    expect(visited).toEqual(["rail", "hidden", "rail", "sidebar", "rail"]);
  });

  it("reverses at either end instead of stepping out of range", () => {
    expect(nextNav({ index: 2, dir: 1 })).toEqual({ index: 1, dir: -1 });
    expect(nextNav({ index: 0, dir: -1 })).toEqual({ index: 1, dir: 1 });
  });
});

// ---------------------------------------------------------------------------
// navToggleLabel — names the transition, not the destination
// ---------------------------------------------------------------------------

describe("navToggleLabel", () => {
  it("names each transition the toggle can perform", () => {
    expect(navToggleLabel(0, 1)).toBe("Collapse navigation to icons");
    expect(navToggleLabel(1, 2)).toBe("Hide navigation");
    expect(navToggleLabel(2, 1)).toBe("Expand navigation to icons");
    expect(navToggleLabel(1, 0)).toBe("Expand navigation to labels");
  });
});

// ---------------------------------------------------------------------------
// indexOfNav / dirFor — fallbacks and the direction convention
// ---------------------------------------------------------------------------

describe("indexOfNav", () => {
  it("falls back to sidebar for a value outside the type", () => {
    // Plain-JS consumers, or a value read back from storage, can pass a state
    // the type forbids; an index of -1 would render an undefined width.
    const bogus: string = "expanded";
    expect(indexOfNav(bogus as AppShellSimpleNavState)).toBe(0);
  });
});

describe("dirFor", () => {
  it("points inward from both ends and forward from the middle", () => {
    expect(NAV_ORDER.map((_, i) => dirFor(i))).toEqual([1, 1, -1]);
  });
});

// ---------------------------------------------------------------------------
// resolveCursor — controlled vs uncontrolled
// ---------------------------------------------------------------------------

describe("resolveCursor", () => {
  it("uses the stored cursor as-is when uncontrolled", () => {
    expect(resolveCursor({ index: 1, dir: -1 })).toEqual({ index: 1, dir: -1 });
  });

  it("keeps the stored direction while the controlled nav agrees with it", () => {
    // Travelling back from hidden: the next click should expand to labels.
    expect(resolveCursor({ index: 1, dir: -1 }, "rail")).toEqual({ index: 1, dir: -1 });
  });

  it("resets the direction when the parent moved the nav itself", () => {
    // Stored "at hidden, heading back"; the parent jumped to rail. A stale
    // dir of -1 would make the next click expand to labels instead of hiding.
    expect(resolveCursor({ index: 2, dir: -1 }, "rail")).toEqual({ index: 1, dir: 1 });
  });

  it("stays on the controlled state when the parent rejects a requested change", () => {
    // The shell stored the requested rail cursor; the parent kept sidebar, so
    // the next click requests rail again rather than drifting on to hidden.
    const cursor = resolveCursor({ index: 1, dir: 1 }, "sidebar");
    expect(cursor).toEqual({ index: 0, dir: 1 });
    expect(state(nextNav(cursor))).toBe("rail");
  });

  it("falls back to sidebar for an unknown controlled value", () => {
    const bogus: string = "expanded";
    expect(resolveCursor({ index: 0, dir: 1 }, bogus as AppShellSimpleNavState)).toEqual({ index: 0, dir: 1 });
  });
});
