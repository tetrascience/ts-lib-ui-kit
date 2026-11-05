import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShellSimple } from "../AppShellSimple";

import type { NavGroup } from "@/components/composed/DataAppShell";

// act() flushes effects and every update lane on React 18 and 19 alike (UXT-77).
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// matchMedia stub — controllable from tests (same harness as DataAppShell's)
// ---------------------------------------------------------------------------

type MediaListener = (e: { matches: boolean }) => void;

let mediaMatches = false;
let mediaListeners: MediaListener[] = [];

function setMediaMatches(matches: boolean) {
  mediaMatches = matches;
  for (const listener of mediaListeners) listener({ matches });
}

let container: HTMLDivElement;
let root: Root;

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

function shell(props: Partial<React.ComponentProps<typeof AppShellSimple>> = {}) {
  return (
    <AppShellSimple navGroups={navGroups} breadcrumbs={[{ label: "Home" }]} {...props}>
      <p>content</p>
    </AppShellSimple>
  );
}

const navState = () => container.querySelector("[data-slot='app-shell-simple']")?.getAttribute("data-nav-state");
const clickToggle = () =>
  act(() => container.querySelector<HTMLElement>("[data-slot='app-shell-simple-nav-toggle']")!.click());

describe("AppShellSimple — responsive auto-collapse (UXT-274)", () => {
  it("collapses the sidebar to the rail while the query matches and restores it after", () => {
    mediaMatches = true;
    const onNavChange = vi.fn();
    render(shell({ onNavChange }));

    expect(navState()).toBe("rail");
    expect(onNavChange).toHaveBeenLastCalledWith("rail");

    act(() => setMediaMatches(false));
    expect(navState()).toBe("sidebar");
    expect(onNavChange).toHaveBeenLastCalledWith("sidebar");
  });

  it("lets one toggle click undo an auto-collapse", () => {
    mediaMatches = true;
    render(shell());
    expect(navState()).toBe("rail");

    clickToggle();
    expect(navState()).toBe("sidebar");
  });

  it("keeps a state the user chose when the query stops matching", () => {
    mediaMatches = true;
    render(shell());

    clickToggle(); // rail → sidebar
    clickToggle(); // sidebar → rail, now the user's choice
    expect(navState()).toBe("rail");

    act(() => setMediaMatches(false));
    expect(navState()).toBe("rail");
  });

  it("leaves a nav that starts as rail or hidden alone", () => {
    render(shell({ defaultNav: "hidden" }));
    act(() => setMediaMatches(true));
    act(() => setMediaMatches(false));
    expect(navState()).toBe("hidden");
  });

  it("reports the collapse through onNavChange when controlled", () => {
    mediaMatches = true;
    const onNavChange = vi.fn();
    render(shell({ nav: "sidebar", onNavChange }));

    expect(onNavChange).toHaveBeenCalledWith("rail");
    expect(navState()).toBe("sidebar"); // the parent owns the state
  });

  it("does not subscribe when autoCollapse is false or there is no nav", () => {
    render(shell({ autoCollapse: false }));
    render(shell({ showNav: false }));
    expect(mediaListeners).toHaveLength(0);
  });
});

describe("AppShellSimple — header slots (UXT-274)", () => {
  it("renders headerCenter in the top bar's center group", () => {
    render(shell({ headerCenter: <span data-testid="ctx">v3 · Draft</span> }));
    expect(container.querySelector("[data-slot='top-bar-center'] [data-testid='ctx']")).not.toBeNull();
  });
});
