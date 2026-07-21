import { Download, Filter, LayoutGrid } from "lucide-react";
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataAppShellSecondaryNav } from "../SecondaryNav";

import type { NavStep } from "../SecondaryNav";

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
  flushSync(() => root.unmount());
  container.remove();
});

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui));
}

function click(el: Element | null) {
  flushSync(() => {
    el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

const steps: NavStep[] = [
  { id: "overview", label: "Data Overview", icon: LayoutGrid },
  {
    id: "filtering",
    label: "Filtering",
    icon: Filter,
    steps: [
      { id: "global", label: "Global Filters" },
      { id: "cluster", label: "Cluster Filters" },
    ],
  },
  { id: "export", label: "Export", icon: Download, badge: 12 },
];

const itemsOf = () =>
  [...container.querySelectorAll("[data-slot='data-app-shell-secondary-nav-item']")] as HTMLButtonElement[];

const statusOf = (label: string) =>
  itemsOf()
    // Icon-rail items have empty text — fall back to their aria-label
    .find((b) => (b.textContent || b.getAttribute("aria-label") || "").includes(label))
    ?.getAttribute("data-status");

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

describe("DataAppShellSecondaryNav — status derivation", () => {
  it("derives done/active/todo linearly across nesting from activeKey", () => {
    render(<DataAppShellSecondaryNav steps={steps} activeKey="cluster" />);

    expect(statusOf("Data Overview")).toBe("done");
    expect(statusOf("Filtering")).toBe("done");
    expect(statusOf("Global Filters")).toBe("done");
    expect(statusOf("Cluster Filters")).toBe("active");
    expect(statusOf("Export")).toBe("todo");

    const active = itemsOf().find((b) => b.getAttribute("data-status") === "active");
    expect(active?.getAttribute("aria-current")).toBe("step");
  });

  it("lets an explicit step status override the linear derivation", () => {
    const explicit: NavStep[] = [
      { id: "a", label: "A", status: "done" },
      { id: "b", label: "B" },
      { id: "c", label: "C", status: "done" }, // after active, still done
    ];
    render(<DataAppShellSecondaryNav steps={explicit} activeKey="b" />);

    expect(statusOf("A")).toBe("done");
    expect(statusOf("B")).toBe("active");
    expect(statusOf("C")).toBe("done");
  });

  it("marks every step todo when there is no active key and no explicit status", () => {
    render(<DataAppShellSecondaryNav steps={steps} />);
    expect(new Set(itemsOf().map((b) => b.getAttribute("data-status")))).toEqual(
      new Set(["todo"])
    );
  });
});

// ---------------------------------------------------------------------------
// Selection & disabled steps
// ---------------------------------------------------------------------------

describe("DataAppShellSecondaryNav — selection", () => {
  it("fires onSelect with the step id and skips disabled steps", () => {
    const onSelect = vi.fn();
    const withDisabled: NavStep[] = [
      { id: "one", label: "One" },
      { id: "two", label: "Two", disabled: true, disabledReason: "Finish One first" },
    ];
    render(
      <DataAppShellSecondaryNav steps={withDisabled} activeKey="one" onSelect={onSelect} />
    );

    const [one, two] = itemsOf();
    click(one);
    expect(onSelect).toHaveBeenCalledWith("one", expect.objectContaining({ id: "one" }));

    expect(two.disabled).toBe(true);
    expect(two.title).toBe("Finish One first");
    click(two);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps disabled rail steps focusable via aria-disabled but ignores selection", () => {
    const onSelect = vi.fn();
    const withDisabled: NavStep[] = [
      { id: "one", label: "One" },
      { id: "two", label: "Two", disabled: true, disabledReason: "Finish One first" },
    ];
    render(
      <DataAppShellSecondaryNav
        steps={withDisabled}
        activeKey="one"
        onSelect={onSelect}
        collapsible
        defaultCollapsed
      />
    );

    const [, two] = itemsOf();
    // Not the disabled attribute — that would swallow the pointer/focus events
    // the rail tooltip (label + disabledReason) relies on
    expect(two.disabled).toBe(false);
    expect(two.getAttribute("aria-disabled")).toBe("true");
    click(two);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Collapse — uncontrolled and controlled
// ---------------------------------------------------------------------------

describe("DataAppShellSecondaryNav — collapse", () => {
  const nav = () => container.querySelector("[data-slot='data-app-shell-secondary-nav']");
  const toggle = () =>
    container.querySelector("[data-slot='data-app-shell-secondary-nav-toggle']");

  it("collapses to an icon-only rail and expands back (uncontrolled)", () => {
    const onCollapsedChange = vi.fn();
    render(
      <DataAppShellSecondaryNav
        steps={steps}
        activeKey="filtering"
        title="Steps"
        collapsible
        onCollapsedChange={onCollapsedChange}
      />
    );

    expect(nav()?.getAttribute("data-collapsed")).toBe("false");
    click(toggle());
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(nav()?.getAttribute("data-collapsed")).toBe("true");

    // Icon rail: labels only via aria-label, active border kept, flattened nesting
    const railItems = itemsOf();
    expect(railItems).toHaveLength(5);
    expect(railItems.every((b) => b.getAttribute("aria-label"))).toBe(true);
    expect(statusOf("Filtering")).toBe("active");

    click(toggle());
    expect(nav()?.getAttribute("data-collapsed")).toBe("false");
  });

  it("respects a controlled collapsed prop without flipping internally", () => {
    const onCollapsedChange = vi.fn();
    render(
      <DataAppShellSecondaryNav
        steps={steps}
        collapsible
        collapsed
        onCollapsedChange={onCollapsedChange}
      />
    );

    expect(nav()?.getAttribute("data-collapsed")).toBe("true");
    click(toggle());
    // Controlled: reports intent but stays collapsed until the prop changes
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(nav()?.getAttribute("data-collapsed")).toBe("true");
  });

  it("starts collapsed with defaultCollapsed", () => {
    render(<DataAppShellSecondaryNav steps={steps} collapsible defaultCollapsed />);
    expect(nav()?.getAttribute("data-collapsed")).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// Horizontal orientation
// ---------------------------------------------------------------------------

describe("DataAppShellSecondaryNav — horizontal", () => {
  it("renders a flattened stepper row with separators, badges, and statuses", () => {
    render(
      <DataAppShellSecondaryNav orientation="horizontal" steps={steps} activeKey="global" />
    );

    const nav = container.querySelector("[data-slot='data-app-shell-secondary-nav']");
    expect(nav?.getAttribute("data-orientation")).toBe("horizontal");

    const items = itemsOf();
    expect(items).toHaveLength(5); // nesting flattens inline
    expect(statusOf("Global Filters")).toBe("active");
    expect(statusOf("Cluster Filters")).toBe("todo");
    expect(container.textContent).toContain("12"); // badge

    // No collapse affordance on the horizontal axis
    expect(
      container.querySelector("[data-slot='data-app-shell-secondary-nav-toggle']")
    ).toBeNull();
  });
});
