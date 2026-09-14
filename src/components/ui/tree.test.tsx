import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Tree, TreeItem, TreeItemGroup, TreeItemLabel } from "./tree";

/*
 * SW-2541: the keyboard half of the WAI-ARIA tree pattern that has to be verified by test rather
 * than by story — roving tabindex, typeahead, `*` and focus retention. The visual behaviour and the
 * primary arrow-key model are covered by the play functions in `tree.stories.tsx`.
 */

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui));
}

const item = (id: string) => container.querySelector<HTMLElement>(`[data-tree-item-id="${id}"]`);
const tabStops = () => [...container.querySelectorAll<HTMLElement>('[role="treeitem"][tabindex="0"]')];

function press(key: string) {
  const target = document.activeElement ?? document.body;
  flushSync(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

function focus(id: string) {
  flushSync(() => item(id)?.focus());
}

/**
 * Documents ▸ Reports ▸ summary.txt, Drafts, Shared ▸ notes.md, Archive. `Drafts` and `Shared`
 * are branches; `Archive` is a leaf.
 */
function Fixture({
  expandedIds,
  onExpandedChange,
  defaultSelectedId,
  draftsKey = "drafts",
}: {
  expandedIds?: Set<string>;
  onExpandedChange?: (ids: Set<string>) => void;
  defaultSelectedId?: string;
  /** Remounting `Drafts` under a new React key simulates a lazy fetch that swaps the node out. */
  draftsKey?: string;
}) {
  return (
    <Tree
      aria-label="Files"
      expandedIds={expandedIds}
      onExpandedChange={onExpandedChange}
      defaultExpandedIds={new Set(["documents"])}
      defaultSelectedId={defaultSelectedId}
    >
      <TreeItem id="documents" hasChildren>
        <TreeItemLabel>Documents</TreeItemLabel>
        <TreeItemGroup>
          <TreeItem id="reports" hasChildren>
            <TreeItemLabel>Reports</TreeItemLabel>
            <TreeItemGroup>
              <TreeItem id="summary">
                <TreeItemLabel>summary.txt</TreeItemLabel>
              </TreeItem>
            </TreeItemGroup>
          </TreeItem>
          <TreeItem key={draftsKey} id="drafts" hasChildren>
            <TreeItemLabel>Drafts</TreeItemLabel>
          </TreeItem>
        </TreeItemGroup>
      </TreeItem>
      <TreeItem id="shared" hasChildren>
        <TreeItemLabel>Shared</TreeItemLabel>
        <TreeItemGroup>
          <TreeItem id="notes">
            <TreeItemLabel>notes.md</TreeItemLabel>
          </TreeItem>
        </TreeItemGroup>
      </TreeItem>
      <TreeItem id="archive">
        <TreeItemLabel>Archive</TreeItemLabel>
      </TreeItem>
    </Tree>
  );
}

describe("Tree roving tabindex", () => {
  it("has exactly one tab stop, and it follows focus", () => {
    render(<Fixture />);
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["documents"]);

    focus("shared");
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["shared"]);
  });

  it("enters at the selected node when there is one", () => {
    render(<Fixture defaultSelectedId="reports" />);
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["reports"]);
  });

  it("falls back to the first root node when the selected node is hidden", () => {
    // `summary` is selected but its parent `Reports` is collapsed, so it is not rendered.
    render(<Fixture defaultSelectedId="summary" />);
    expect(item("summary")).toBeNull();
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["documents"]);
  });
});

describe("Tree typeahead", () => {
  it("focuses the next visible node whose label starts with the typed character", () => {
    render(<Fixture />);
    focus("documents");
    press("s");
    // `summary.txt` is hidden inside the collapsed `Reports`, so `Shared` is the first visible match.
    expect(document.activeElement).toBe(item("shared"));
  });

  it("accumulates a multi-character query and wraps around", () => {
    render(<Fixture />);
    focus("shared");
    press("d");
    press("r");
    expect(document.activeElement).toBe(item("drafts"));
  });

  it("cycles through matches when the same character is repeated", () => {
    render(<Fixture />);
    focus("archive");
    press("d");
    expect(document.activeElement).toBe(item("documents"));
    press("d");
    expect(document.activeElement).toBe(item("drafts"));
  });

  it("resets the buffer after a pause", () => {
    vi.useFakeTimers();
    render(<Fixture />);
    focus("documents");
    press("s");
    expect(document.activeElement).toBe(item("shared"));

    vi.advanceTimersByTime(1000);
    press("a");
    // A stale buffer would search for "sa" and find nothing; a fresh one finds `Archive`.
    expect(document.activeElement).toBe(item("archive"));
  });

  it("ignores space and modified keys", () => {
    render(<Fixture />);
    focus("documents");
    press(" ");
    expect(document.activeElement).toBe(item("documents"));
    flushSync(() => {
      item("documents")?.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }));
    });
    expect(document.activeElement).toBe(item("documents"));
  });
});

describe("Tree * (expand siblings)", () => {
  it("expands every collapsed branch at the focused node's level, and nothing deeper", () => {
    render(<Fixture />);
    focus("archive");
    press("*");
    expect(item("documents")?.getAttribute("aria-expanded")).toBe("true");
    expect(item("shared")?.getAttribute("aria-expanded")).toBe("true");
    // Level 2 is untouched: `Reports` stays collapsed.
    expect(item("reports")?.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(item("archive"));
  });

  it("works at a nested level, and round-trips through controlled state", () => {
    const onExpandedChange = vi.fn();
    render(<Fixture expandedIds={new Set(["documents"])} onExpandedChange={onExpandedChange} />);
    focus("reports");
    press("*");
    const [next] = onExpandedChange.mock.calls.at(-1) as [Set<string>];
    expect([...next].sort()).toEqual(["documents", "drafts", "reports"]);
  });
});

describe("Tree focus retention", () => {
  it("moves focus to the ancestor when the focused node's branch collapses", () => {
    render(<Fixture />);
    focus("reports");
    press("ArrowRight");
    press("ArrowRight");
    expect(document.activeElement).toBe(item("summary"));

    // Collapse the grandparent through its chevron, from the pointer, so the focused node is
    // removed without the key handler being involved.
    flushSync(() => {
      item("documents")?.querySelector<HTMLElement>('[data-slot="tree-item-indicator"]')?.click();
    });
    expect(item("summary")).toBeNull();
    expect(document.activeElement).toBe(item("documents"));
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["documents"]);
  });

  it("survives the focused node being remounted, as by a lazy load", () => {
    render(<Fixture draftsKey="placeholder" />);
    focus("drafts");
    const before = item("drafts");

    render(<Fixture draftsKey="loaded" />);
    const after = item("drafts");
    expect(after).not.toBe(before);
    expect(document.activeElement).toBe(after);
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["drafts"]);
  });

  it("moves the tab stop without stealing focus when the tree was not focused", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    try {
      render(<Fixture expandedIds={new Set(["documents"])} />);
      focus("drafts");
      flushSync(() => outside.focus());

      render(<Fixture expandedIds={new Set()} />);
      expect(item("drafts")).toBeNull();
      expect(document.activeElement).toBe(outside);
      expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["documents"]);
    } finally {
      outside.remove();
    }
  });
});
