import { Beaker, FolderKanban } from "lucide-react";
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataAppShellPrimaryNav } from "../PrimaryNav";

import type { NavGroup } from "../PrimaryNav";

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

const navGroups: NavGroup[] = [
  {
    pages: [
      { id: "projects", label: "Projects", icon: FolderKanban, badge: 3 },
      { id: "runs", label: "Runs", icon: Beaker },
      { id: "misc", label: "Misc" }, // no icon — falls back to the dot indicator
    ],
  },
];

// ---------------------------------------------------------------------------
// top variant — horizontal placement (not exercised by the shell stories)
// ---------------------------------------------------------------------------

describe("DataAppShellPrimaryNav — top variant", () => {
  it("renders horizontal items with visible labels and badge counts", () => {
    render(
      <DataAppShellPrimaryNav variant="top" navGroups={navGroups} activeKey="projects" />
    );

    const nav = container.querySelector("[data-slot='data-app-shell-primary-nav']");
    expect(nav?.getAttribute("data-variant")).toBe("top");

    const items = container.querySelectorAll(
      "[data-slot='data-app-shell-primary-nav-item']"
    );
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain("Projects");
    expect(items[0].querySelector("[data-slot='badge']")?.textContent).toBe("3");
  });

  it("marks the activeKey item with aria-current and fires onClick + onSelect on select", () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <DataAppShellPrimaryNav
        variant="top"
        navGroups={[{ pages: [{ id: "a", label: "A", onClick }, { id: "b", label: "B" }] }]}
        activeKey="a"
        onSelect={onSelect}
      />
    );

    const [itemA, itemB] = [...container.querySelectorAll<HTMLButtonElement>(
        "[data-slot='data-app-shell-primary-nav-item']"
      )];
    expect(itemA.getAttribute("aria-current")).toBe("page");
    expect(itemB.getAttribute("aria-current")).toBeNull();

    flushSync(() => itemA.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("a", expect.objectContaining({ id: "a" }));
  });

  it("renders user and actions in the trailing slot", () => {
    render(
      <DataAppShellPrimaryNav
        variant="top"
        navGroups={navGroups}
        actions={<button type="button">Help</button>}
        user={<span data-testid="user-slot">GP</span>}
      />
    );

    const userArea = container.querySelector(
      "[data-slot='data-app-shell-primary-nav-user']"
    );
    expect(userArea?.textContent).toContain("Help");
    expect(userArea?.querySelector("[data-testid='user-slot']")).not.toBeNull();
  });

  it("renders a vertical separator between groups", () => {
    render(
      <DataAppShellPrimaryNav
        variant="top"
        navGroups={[
          { pages: [{ id: "a", label: "A" }] },
          { pages: [{ id: "b", label: "B" }] },
        ]}
      />
    );

    const itemsArea = container.querySelector(
      "[data-slot='data-app-shell-primary-nav-items']"
    );
    expect(itemsArea?.querySelector(".border-l")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// rail / sidebar branches not covered by the shell stories
// ---------------------------------------------------------------------------

describe("DataAppShellPrimaryNav — rail and sidebar", () => {
  it("rail overlays badge counts on the icon box and falls back to a dot when a page has no icon", () => {
    render(
      <DataAppShellPrimaryNav variant="rail" navGroups={navGroups} activeKey="misc" />
    );

    const items = container.querySelectorAll(
      "[data-slot='data-app-shell-primary-nav-item']"
    );
    expect(items[0].querySelector("[data-slot='badge']")?.textContent).toBe("3");
    // The icon-less active page renders the dot indicator
    expect(items[2].querySelector(".rounded-full.bg-primary")).not.toBeNull();
  });

  it("sidebar renders badge counts at the end of the row", () => {
    render(
      <DataAppShellPrimaryNav variant="sidebar" navGroups={navGroups} activeKey="runs" />
    );

    const items = container.querySelectorAll(
      "[data-slot='data-app-shell-primary-nav-item']"
    );
    expect(items[0].textContent).toContain("Projects");
    expect(items[0].querySelector("[data-slot='badge']")?.textContent).toBe("3");
    expect(items[1].getAttribute("aria-current")).toBe("page");
  });

  it("sidebar renders group section labels", () => {
    render(
      <DataAppShellPrimaryNav
        variant="sidebar"
        navGroups={[
          { label: "Platform", pages: [{ id: "a", label: "Overview", icon: FolderKanban }] },
          { label: "Workspace", pages: [{ id: "b", label: "Reports", icon: Beaker }] },
        ]}
      />
    );

    const labels = [...container.querySelectorAll("span")]
      .map((s) => s.textContent)
      .filter((t) => t === "Platform" || t === "Workspace");
    expect(labels).toEqual(["Platform", "Workspace"]);
  });
});

// ---------------------------------------------------------------------------
// renderItem escape hatch
// ---------------------------------------------------------------------------

describe("DataAppShellPrimaryNav — renderItem", () => {
  it("replaces the default item rendering and receives active state", () => {
    render(
      <DataAppShellPrimaryNav
        variant="top"
        navGroups={navGroups}
        activeKey="runs"
        renderItem={(page, { active }) => (
          <a href={`#${page.id}`} data-testid={`custom-${page.id}`}>
            {page.label}
            {active ? " (active)" : ""}
          </a>
        )}
      />
    );

    expect(
      container.querySelectorAll("[data-slot='data-app-shell-primary-nav-item']")
    ).toHaveLength(0);
    expect(
      container.querySelector("[data-testid='custom-runs']")?.textContent
    ).toContain("(active)");
    expect(
      container.querySelector("[data-testid='custom-projects']")?.textContent
    ).not.toContain("(active)");
  });
});
