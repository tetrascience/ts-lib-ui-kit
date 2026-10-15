import { LayoutDashboard } from "lucide-react";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShellSimple, type AppShellSimpleNavState, type AppShellSimpleProps } from "../AppShellSimple";

import type { NavGroup } from "@/components/composed/DataAppShell";

// `act`, not `flushSync`: `pointermove` updates land on a continuous lane that
// `flushSync` leaves pending, which would make the drag assertions read stale state.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Render harness
// ---------------------------------------------------------------------------

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

function render(ui: React.ReactElement) {
  act(() => root.render(ui));
}

const navGroups: NavGroup[] = [{ pages: [{ id: "overview", label: "Overview", icon: LayoutDashboard }] }];

function Shell(props: Partial<AppShellSimpleProps>) {
  return (
    <AppShellSimple navGroups={navGroups} breadcrumbs={[{ label: "App" }]} {...props}>
      <p>Body</p>
    </AppShellSimple>
  );
}

const getShell = () => container.querySelector<HTMLElement>("[data-slot='app-shell-simple']");
const navState = () => getShell()?.getAttribute("data-nav-state");
const getToggle = () => container.querySelector<HTMLButtonElement>("[data-slot='app-shell-simple-nav-toggle']");
const toggleLabel = () => getToggle()?.getAttribute("aria-label");
const getZone = () => container.querySelector<HTMLElement>("[data-slot='app-shell-simple-nav']");
const isResizing = () => getShell()?.classList.contains("cursor-col-resize") ?? false;

function getHandle() {
  const handle = container.querySelector<HTMLElement>("[role='separator']");
  if (!handle) throw new Error("resize handle not found");
  // jsdom implements no pointer capture; the handle calls it on pointerdown.
  handle.setPointerCapture = vi.fn();
  return handle;
}

function clickToggle() {
  act(() => getToggle()?.click());
}

/** Dispatches a cancelable keydown and reports whether the shell prevented it. */
function keydown(el: Element, key: string) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  act(() => {
    el.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

function pointer(el: Element, type: string, init: MouseEventInit = {}) {
  // jsdom has no PointerEvent constructor — a MouseEvent with the pointer
  // event type still reaches React's onPointer* handlers.
  act(() => {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }));
  });
}

/** Pins the nav zone's left edge so drag widths are `clientX - left`. */
function pinNavLeft(left: number) {
  const zone = getZone();
  if (!zone) throw new Error("nav zone not found");
  vi.spyOn(zone, "getBoundingClientRect").mockReturnValue({ left } as DOMRect);
}

// ---------------------------------------------------------------------------
// Controlled mode — no story drives `nav` / `onNavChange`
// ---------------------------------------------------------------------------

describe("AppShellSimple — controlled nav", () => {
  it("requests the next state via onNavChange but renders only what the parent passes", () => {
    const onNavChange = vi.fn();
    render(<Shell nav="sidebar" onNavChange={onNavChange} />);

    clickToggle();
    expect(onNavChange).toHaveBeenLastCalledWith("rail");
    expect(navState()).toBe("sidebar");

    // The parent ignored the request, so the shell has not moved and the next
    // click asks for the same transition again rather than drifting onward.
    clickToggle();
    expect(onNavChange).toHaveBeenCalledTimes(2);
    expect(onNavChange).toHaveBeenLastCalledWith("rail");
  });

  it("ping-pongs through every state when the parent accepts each change", () => {
    const onNavChange = vi.fn();
    function Parent() {
      const [nav, setNav] = React.useState<AppShellSimpleNavState>("sidebar");
      return (
        <Shell
          nav={nav}
          onNavChange={(next) => {
            onNavChange(next);
            setNav(next);
          }}
        />
      );
    }
    render(<Parent />);

    for (let i = 0; i < 4; i++) clickToggle();
    expect(onNavChange.mock.calls.map(([next]) => next)).toEqual(["rail", "hidden", "rail", "sidebar"]);
    expect(navState()).toBe("sidebar");
  });

  it("resets the toggle direction when the parent moves the nav itself", () => {
    const onNavChange = vi.fn();
    render(<Shell nav="hidden" onNavChange={onNavChange} />);
    expect(toggleLabel()).toBe("Expand navigation to icons");

    // The stored cursor still says "travelling back from hidden"; a stale
    // direction would make the next click expand to labels.
    render(<Shell nav="rail" onNavChange={onNavChange} />);
    expect(navState()).toBe("rail");
    expect(toggleLabel()).toBe("Hide navigation");

    clickToggle();
    expect(onNavChange).toHaveBeenLastCalledWith("hidden");
  });
});

// ---------------------------------------------------------------------------
// onNavChange fires only on an actual change
// ---------------------------------------------------------------------------

describe("AppShellSimple — onNavChange", () => {
  it("fires with each new state on an uncontrolled toggle", () => {
    const onNavChange = vi.fn();
    render(<Shell onNavChange={onNavChange} />);

    clickToggle();
    clickToggle();
    expect(onNavChange.mock.calls.map(([next]) => next)).toEqual(["rail", "hidden"]);
  });

  it("does not fire when a keyboard step is clamped at either end", () => {
    const onNavChange = vi.fn();
    render(<Shell onNavChange={onNavChange} />);
    const handle = getHandle();

    // At `sidebar` (widest): wider and Home are no-ops.
    keydown(handle, "ArrowRight");
    keydown(handle, "Home");
    expect(navState()).toBe("sidebar");
    expect(onNavChange).not.toHaveBeenCalled();

    keydown(handle, "End");
    expect(onNavChange).toHaveBeenCalledTimes(1);

    // At `hidden` (narrowest): narrower and End are no-ops.
    keydown(handle, "ArrowLeft");
    keydown(handle, "End");
    expect(navState()).toBe("hidden");
    expect(onNavChange).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Resize handle — keyboard
// ---------------------------------------------------------------------------

describe("AppShellSimple — resize handle keyboard", () => {
  it("ignores keys it does not handle and leaves their default action alone", () => {
    const onNavChange = vi.fn();
    render(<Shell onNavChange={onNavChange} />);
    const handle = getHandle();

    expect(keydown(handle, "Tab")).toBe(false);
    expect(keydown(handle, "ArrowUp")).toBe(false);
    expect(navState()).toBe("sidebar");
    expect(onNavChange).not.toHaveBeenCalled();

    // Handled keys suppress the default (page scroll) even when clamped.
    expect(keydown(handle, "ArrowLeft")).toBe(true);
    expect(keydown(handle, "Home")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Resize handle — drag snapping and lifecycle
// ---------------------------------------------------------------------------

describe("AppShellSimple — resize handle drag", () => {
  // Widths are 220 (sidebar) / 48 (rail) / 0 (hidden); snap points are the
  // midpoints, 134 and 24, measured from the nav zone's left edge.
  it("snaps at the midpoints between widths, relative to the nav's left edge", () => {
    const onNavChange = vi.fn();
    render(<Shell defaultNav="rail" onNavChange={onNavChange} />);
    pinNavLeft(100);
    const handle = getHandle();

    pointer(handle, "pointerdown", { clientX: 148, buttons: 1 });
    expect(isResizing()).toBe(true);

    const moveTo = (width: number) => {
      pointer(handle, "pointermove", { clientX: 100 + width, buttons: 1 });
      return navState();
    };
    expect(moveTo(133)).toBe("rail");
    expect(moveTo(134)).toBe("sidebar");
    expect(moveTo(300)).toBe("sidebar");
    expect(moveTo(133)).toBe("rail");
    expect(moveTo(24)).toBe("rail");
    expect(moveTo(23)).toBe("hidden");
    expect(moveTo(-50)).toBe("hidden");

    // One call per state change, not one per pointermove.
    expect(onNavChange.mock.calls.map(([next]) => next)).toEqual(["sidebar", "rail", "hidden"]);
    expect(getZone()?.style.width).toBe("0px");
  });

  it("ignores pointermove until a drag starts on the handle", () => {
    const onNavChange = vi.fn();
    render(<Shell onNavChange={onNavChange} />);
    pinNavLeft(0);
    const handle = getHandle();

    pointer(handle, "pointermove", { clientX: 0, buttons: 1 });
    expect(navState()).toBe("sidebar");
    expect(onNavChange).not.toHaveBeenCalled();
  });

  it.each(["pointercancel", "lostpointercapture"])("ends the drag on %s", (type) => {
    render(<Shell />);
    pinNavLeft(0);
    const handle = getHandle();

    pointer(handle, "pointerdown", { clientX: 220, buttons: 1 });
    expect(isResizing()).toBe(true);

    pointer(handle, type);
    expect(isResizing()).toBe(false);

    // A move after the interrupted drag must not resize the nav.
    pointer(handle, "pointermove", { clientX: 10, buttons: 1 });
    expect(navState()).toBe("sidebar");
  });
});

// ---------------------------------------------------------------------------
// Defensive fallbacks
// ---------------------------------------------------------------------------

describe("AppShellSimple — invalid nav values", () => {
  // Plain-JS consumers (or a value read back from storage) can pass a state
  // the type forbids; the shell falls back to `sidebar` rather than rendering
  // an undefined width.
  const bogus: string = "expanded";

  it("falls back to sidebar for an unknown defaultNav", () => {
    render(<Shell defaultNav={bogus as AppShellSimpleNavState} />);
    expect(navState()).toBe("sidebar");
    expect(getZone()?.style.width).toBe("220px");
  });

  it("falls back to sidebar for an unknown controlled nav", () => {
    const onNavChange = vi.fn();
    render(<Shell nav={bogus as AppShellSimpleNavState} onNavChange={onNavChange} />);
    expect(navState()).toBe("sidebar");

    clickToggle();
    expect(onNavChange).toHaveBeenLastCalledWith("rail");
  });
});

// ---------------------------------------------------------------------------
// Breadcrumb precedence rules the story args don't exercise
// ---------------------------------------------------------------------------

describe("AppShellSimple — breadcrumb precedence", () => {
  it("renders the last crumb as the current page even when it has href or onClick", () => {
    const onClick = vi.fn();
    render(
      <Shell
        breadcrumbs={[
          { label: "Home", href: "/home" },
          { label: "Current", href: "/current", onClick },
        ]}
      />,
    );

    const current = container.querySelector("[aria-current='page']");
    expect(current?.textContent).toBe("Current");
    expect(container.querySelector("a[href='/current']")).toBeNull();
    expect([...container.querySelectorAll("button")].some((b) => b.textContent === "Current")).toBe(false);
  });

  it("prefers href over onClick on an earlier crumb", () => {
    const onClick = vi.fn();
    render(<Shell breadcrumbs={[{ label: "Home", href: "/home", onClick }, { label: "Current" }]} />);

    const link = container.querySelector<HTMLAnchorElement>("a[href='/home']");
    expect(link?.textContent).toBe("Home");
    expect([...container.querySelectorAll("button")].some((b) => b.textContent === "Home")).toBe(false);
  });

  it("renders with an empty breadcrumb trail", () => {
    render(<Shell breadcrumbs={[]} />);
    expect(container.querySelector("[aria-current='page']")).toBeNull();
    expect(container.querySelector("main")?.textContent).toContain("Body");
  });
});
