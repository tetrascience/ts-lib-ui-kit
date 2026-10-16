import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataAppShellRightPanel, DataAppShellRightPanelTrigger } from "../RightPanel";

// act() rather than flushSync: it flushes effects and every update lane on React 18
// and 19 alike, so these assertions hold in the React 18 CI job too (UXT-77).
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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
  window.localStorage.clear();
});

function render(ui: React.ReactElement) {
  act(() => root.render(ui));
}

const getPanel = () =>
  container.querySelector<HTMLElement>("aside[data-slot='data-app-shell-right-panel']");
const getHandle = () =>
  container.querySelector<HTMLElement>("[data-slot='data-app-shell-right-panel-drag-handle']");

function pointerEvent(type: string, init: MouseEventInit) {
  // jsdom has no PointerEvent constructor — a MouseEvent with the pointer
  // event type still reaches React's onPointer* handlers.
  return new MouseEvent(type, { bubbles: true, ...init });
}

function keydown(el: Element, key: string) {
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });
}

// ---------------------------------------------------------------------------
// Blocked / failing storage — persistence must fail safe, not crash
// ---------------------------------------------------------------------------

describe("DataAppShellRightPanel — storage failure tolerance", () => {
  it("falls back to defaultWidth when localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    render(<DataAppShellRightPanel id="p1" open title="Details" defaultWidth={333} />);
    expect(getPanel()?.style.width).toBe("333px");
  });

  it("keeps resizing when localStorage.setItem throws on persist", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    render(<DataAppShellRightPanel id="p2" open title="Details" defaultWidth={320} />);
    const handle = getHandle()!;
    keydown(handle, "ArrowLeft"); // grows + commits → setItem throws, caught
    expect(getPanel()?.style.width).toBe("336px");
  });
});

// ---------------------------------------------------------------------------
// DragHandle pointer paths not reachable with trusted browser pointers
// ---------------------------------------------------------------------------

describe("DataAppShellRightPanel — DragHandle pointer edge cases", () => {
  it("ignores non-primary-button presses", () => {
    render(<DataAppShellRightPanel id="p3" open title="Details" defaultWidth={320} />);
    const handle = getHandle()!;

    act(() => {
      handle.dispatchEvent(pointerEvent("pointerdown", { button: 2, clientX: 500 }));
      handle.dispatchEvent(pointerEvent("pointermove", { clientX: 400 }));
    });
    expect(getPanel()?.style.width).toBe("320px");
  });

  it("swallows setPointerCapture failures and still drags", () => {
    render(<DataAppShellRightPanel id="p4" open title="Details" defaultWidth={320} />);
    const handle = getHandle()!;
    handle.setPointerCapture = () => {
      throw new DOMException("NotFoundError");
    };

    act(() => {
      handle.dispatchEvent(pointerEvent("pointerdown", { button: 0, clientX: 500 }));
      handle.dispatchEvent(pointerEvent("pointermove", { clientX: 450 }));
    });
    expect(getPanel()?.style.width).toBe("370px");
  });

  it("releases an actively captured pointer and persists on pointer up", () => {
    render(<DataAppShellRightPanel id="p5" open title="Details" defaultWidth={320} />);
    const handle = getHandle()!;
    handle.setPointerCapture = vi.fn();
    handle.hasPointerCapture = vi.fn(() => true);
    const release = vi.fn();
    handle.releasePointerCapture = release;

    // One act per event — the browser renders between pointer events,
    // and the commit path reads the width applied by the last render.
    act(() => handle.dispatchEvent(pointerEvent("pointerdown", { button: 0, clientX: 500 })));
    act(() => handle.dispatchEvent(pointerEvent("pointermove", { clientX: 460 })));
    act(() => handle.dispatchEvent(pointerEvent("pointerup", { clientX: 460 })));

    expect(release).toHaveBeenCalledOnce();
    expect(getPanel()?.style.width).toBe("360px");
    expect(window.localStorage.getItem("ts-ui.right-panel.p5.width")).toBe("360");
  });

  it("ignores keys the separator does not handle", () => {
    render(<DataAppShellRightPanel id="p6" open title="Details" defaultWidth={320} />);
    keydown(getHandle()!, "Enter");
    expect(getPanel()?.style.width).toBe("320px");
  });
});

// ---------------------------------------------------------------------------
// Closed states
// ---------------------------------------------------------------------------

describe("DataAppShellRightPanel — closed rendering", () => {
  it("renders nothing while closed when showTrigger is false", () => {
    render(<DataAppShellRightPanel id="p7" open={false} showTrigger={false} title="Details" />);
    expect(getPanel()).toBeNull();
    expect(
      container.querySelector("[data-slot='data-app-shell-right-panel-trigger']"),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Trigger — asChild slots onto any clickable element
// ---------------------------------------------------------------------------

describe("DataAppShellRightPanelTrigger — asChild", () => {
  it("merges trigger styling and handlers onto the child element", () => {
    const onOpen = vi.fn();
    render(
      <DataAppShellRightPanelTrigger asChild variant="icon" aria-label="Open history" onClick={onOpen}>
        <a href="#history">History</a>
      </DataAppShellRightPanelTrigger>,
    );

    // No wrapping <button> — the anchor itself became the trigger
    expect(container.querySelector("button")).toBeNull();
    const link = container.querySelector<HTMLAnchorElement>(
      "a[data-slot='data-app-shell-right-panel-trigger']",
    )!;
    expect(link).not.toBeNull();
    expect(link.getAttribute("data-variant")).toBe("icon");
    expect(link.getAttribute("aria-label")).toBe("Open history");
    expect(link.className).toContain("rounded-lg");

    act(() => link.click());
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("renders its own button with the default icon when not asChild", () => {
    render(<DataAppShellRightPanelTrigger aria-label="Open panel" />);
    const button = container.querySelector<HTMLButtonElement>(
      "button[data-slot='data-app-shell-right-panel-trigger']",
    )!;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.getAttribute("data-variant")).toBe("fab");
    expect(button.querySelector("svg")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Overlay variant — reuses the Sheet (portalled to document.body)
// ---------------------------------------------------------------------------

describe("DataAppShellRightPanel — overlay variant", () => {
  const getDialog = () =>
    document.body.querySelector<HTMLElement>(
      "[data-slot='data-app-shell-right-panel'][data-variant='overlay']",
    );

  it("renders the panel inside a Sheet dialog while open, and only the FAB while closed", () => {
    render(
      <DataAppShellRightPanel id="ov" variant="overlay" open title="Details">
        <p>overlay body</p>
      </DataAppShellRightPanel>,
    );
    // The overlay content is portalled to the body, not the inline container
    const dialog = getDialog();
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("style")).toContain("width");
    expect(document.body.textContent).toContain("overlay body");
    // No docked <aside> — the overlay does not reflow main
    expect(getPanel()).toBeNull();
  });

  it("renders the FAB trigger (no dialog) while closed", () => {
    render(
      <DataAppShellRightPanel id="ov2" variant="overlay" open={false} title="Details" triggerLabel="Open details" />,
    );
    expect(getDialog()).toBeNull();
    expect(
      container.querySelector("[data-slot='data-app-shell-right-panel-trigger']"),
    ).not.toBeNull();
  });

  it("closes via the header close button", () => {
    const onOpenChange = vi.fn();
    render(
      <DataAppShellRightPanel id="ov3" variant="overlay" open title="Details" onOpenChange={onOpenChange}>
        <p>body</p>
      </DataAppShellRightPanel>,
    );
    const close = document.body.querySelector<HTMLButtonElement>("button[aria-label='Close panel']")!;
    expect(close).not.toBeNull();
    act(() => close.click());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
