import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeaderMenu, DataAppShell } from "../DataAppShell";
import { useDataAppShell, useOptionalDataAppShell } from "../ShellContext";

import type { NavGroup } from "../PrimaryNav";
import type { DataAppShellContextValue } from "../ShellContext";

import { TdpNavigationProvider } from "@/components/composed/tdp-link";

// act() rather than flushSync: it flushes effects and every update lane on React 18
// and 19 alike, so these assertions hold in the React 18 CI job too (UXT-77).
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// matchMedia stub — controllable from tests
// ---------------------------------------------------------------------------

type MediaListener = (e: { matches: boolean }) => void;

let mediaMatches = false;
let mediaListeners: MediaListener[] = [];

function setMediaMatches(matches: boolean) {
  mediaMatches = matches;
  for (const listener of mediaListeners) listener({ matches });
}

beforeEach(() => {
  mediaMatches = false;
  mediaListeners = [];
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: mediaMatches,
      media: query,
      addEventListener: (_: string, listener: MediaListener) => {
        mediaListeners.push(listener);
      },
      removeEventListener: (_: string, listener: MediaListener) => {
        mediaListeners = mediaListeners.filter((l) => l !== listener);
      },
    })),
  );
});

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
  vi.unstubAllGlobals();
});

function render(ui: React.ReactElement) {
  act(() => root.render(ui));
}

const navGroups: NavGroup[] = [{ pages: [{ id: "home", label: "Home" }] }];

function shell(props: Partial<React.ComponentProps<typeof DataAppShell>> = {}) {
  return (
    <DataAppShell appName="APP" navGroups={navGroups} {...props}>
      <p>content</p>
    </DataAppShell>
  );
}

const rail = () => container.querySelector("[data-slot='data-app-sidebar-rail']");

// ---------------------------------------------------------------------------
// Responsive auto-collapse — visible through hideNavOnCollapse (the rail
// itself is permanent; collapse drives the secondary zone / rail hiding)
// ---------------------------------------------------------------------------

describe("DataAppShell — responsive auto-collapse", () => {
  it("collapses when the media query matches and restores when it stops matching", () => {
    mediaMatches = true;
    const onCollapsedChange = vi.fn();
    render(shell({ onCollapsedChange, hideNavOnCollapse: true }));

    expect(rail()).toBeNull();
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);

    act(() => setMediaMatches(false));
    expect(rail()).not.toBeNull();
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  });

  it("does not re-expand a shell the user collapsed manually", () => {
    render(shell({ defaultCollapsed: true, hideNavOnCollapse: true }));
    expect(rail()).toBeNull();

    // Breakpoint enters and leaves — the manual collapse must survive.
    act(() => setMediaMatches(true));
    act(() => setMediaMatches(false));
    expect(rail()).toBeNull();
  });

  it("does not subscribe when autoCollapse is false", () => {
    render(shell({ autoCollapse: false }));
    expect(mediaListeners).toHaveLength(0);
    expect(rail()).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Zone visibility
// ---------------------------------------------------------------------------

describe("DataAppShell — zones", () => {
  it("hides the primary nav and top bar zones via their switches", () => {
    render(shell({ showNavRail: false, showTopBar: false }));
    expect(rail()).toBeNull();
    expect(container.querySelector("[data-slot='data-app-top-nav']")).toBeNull();
    expect(container.querySelector("[data-slot='data-app-shell-content']")).not.toBeNull();
  });

  it("renders the secondaryBar zone between top bar and content", () => {
    render(shell({ secondaryBar: <div data-testid="wf-bar">steps</div> }));
    expect(container.querySelector("[data-testid='wf-bar']")).not.toBeNull();
  });

  it("renders a top nav row instead of the rail for navVariant=horizontal", () => {
    render(shell({ navVariant: "horizontal" }));
    expect(rail()).toBeNull();
    const shellRoot = container.querySelector("[data-slot='data-app-shell']");
    expect(shellRoot?.getAttribute("data-nav-variant")).toBe("horizontal");
    expect(
      container.querySelector("[data-slot='data-app-shell-primary-nav'][data-variant='top']"),
    ).not.toBeNull();
  });

  it("publishes {navVariant, collapsed} via ShellContext to zone children", () => {
    let seen: DataAppShellContextValue | null = null;
    function Probe() {
      seen = useDataAppShell();
      return null;
    }
    render(
      <DataAppShell
        appName="APP"
        navGroups={navGroups}
        defaultCollapsed
        hideNavOnCollapse
        autoCollapse={false}
      >
        <Probe />
      </DataAppShell>,
    );
    expect(seen).not.toBeNull();
    expect(seen!.navVariant).toBe("vertical");
    expect(seen!.collapsed).toBe(true);
    expect(seen!.hideNavOnCollapse).toBe(true);

    act(() => seen!.setCollapsed(false));
    expect(seen!.collapsed).toBe(false);
    expect(rail()).not.toBeNull();
  });

  it("useDataAppShell throws outside a DataAppShell; the optional variant returns null", () => {
    let optional: DataAppShellContextValue | null | undefined;
    function OptionalProbe() {
      optional = useOptionalDataAppShell();
      return null;
    }
    render(<OptionalProbe />);
    expect(optional).toBeNull();

    // Catch inside the component — React 19 routes render errors through
    // onUncaughtError instead of rethrowing them out of the render call.
    let caught: Error | null = null;
    function ThrowingProbe() {
      try {
        useDataAppShell();
      } catch (error) {
        caught = error as Error;
      }
      return null;
    }
    render(<ThrowingProbe />);
    expect(caught?.message).toMatch(/within a DataAppShell/);
  });

  it("hideNavOnCollapse removes the nav zone and offers a floating expand button", () => {
    render(shell({ defaultCollapsed: true, hideNavOnCollapse: true }));
    expect(rail()).toBeNull();

    const fab = container.querySelector<HTMLButtonElement>(
      "[data-slot='data-app-shell-expand-fab']",
    );
    expect(fab).not.toBeNull();
    act(() => fab!.click());
    expect(rail()).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Breadcrumb rendering — link / plain / page branches
// ---------------------------------------------------------------------------

describe("DataAppShell — breadcrumbs", () => {
  it("renders href items as links, non-interactive middle items as plain text, and the last as the page", () => {
    render(
      shell({
        breadcrumbs: [
          { label: "Root", href: "/root" }, // link branch
          { label: "Middle" }, // plain span branch (not clickable, not last)
          { label: "Current" }, // page branch (last)
        ],
      }),
    );

    const link = container.querySelector<HTMLAnchorElement>("a[href='/root']");
    expect(link?.textContent).toContain("Root");

    // "Middle" is a plain span — neither a link nor a button
    const middle = [...container.querySelectorAll("span")].find((s) => s.textContent === "Middle");
    expect(middle).not.toBeUndefined();
    expect(container.querySelector("a[href], button")?.textContent).not.toBe("Middle");
  });
});

// ---------------------------------------------------------------------------
// App header menu — back-to-platform link vs callback
// ---------------------------------------------------------------------------

describe("AppHeaderMenu — back to platform", () => {
  /** Opens the radix dropdown trigger (pointerdown is what radix listens for). */
  function openMenu(trigger: HTMLElement) {
    act(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
    });
  }

  it("renders a TDP link for backToPlatformPath", () => {
    render(
      <TdpNavigationProvider tdpBaseUrl="https://tetrascience.com/org">
        <AppHeaderMenu appName="APP" appFullName="App Name" version="v1" backToPlatformPath="/platform" compact={false} />
      </TdpNavigationProvider>,
    );
    const trigger = [...container.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
      b.textContent?.includes("App Name"),
    )!;
    openMenu(trigger);

    // Dropdown content is portalled to the body
    const link = [...document.body.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("Back to TDP Platform"),
    );
    expect(link).not.toBeUndefined();
  });

  it("renders a button that calls onBackToPlatform when no path is set", () => {
    const onBackToPlatform = vi.fn();
    render(
      <AppHeaderMenu appName="APP" appFullName="App Name" onBackToPlatform={onBackToPlatform} compact={false} />,
    );
    const trigger = [...container.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
      b.textContent?.includes("App Name"),
    )!;
    openMenu(trigger);

    const back = [...document.body.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
      b.textContent?.includes("Back to TDP Platform"),
    )!;
    expect(back).not.toBeUndefined();
    act(() => back.click());
    expect(onBackToPlatform).toHaveBeenCalledOnce();
  });
});
