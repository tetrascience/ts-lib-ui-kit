import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Tree, TreeEmpty, TreeItem, TreeItemGroup, TreeItemLabel } from "./tree";

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

  it("falls back to the first root node while the selected node is hidden, and back again", () => {
    // `summary` is selected but its parent `Reports` is collapsed, so it is not rendered.
    render(<Fixture defaultSelectedId="summary" expandedIds={new Set(["documents"])} />);
    expect(item("summary")).toBeNull();
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["documents"]);

    // Once the branch opens (a lazy subtree arriving, say) entry returns to the selected node.
    render(<Fixture defaultSelectedId="summary" expandedIds={new Set(["documents", "reports"])} />);
    expect(tabStops().map((el) => el.dataset.treeItemId)).toEqual(["summary"]);
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

  it("matches only what a screen reader announces, not aria-hidden text", () => {
    vi.useFakeTimers();
    render(
      <Tree aria-label="Files">
        <TreeItem id="first">
          <TreeItemLabel trailing={<span aria-hidden="true">zzz</span>}>First</TreeItemLabel>
        </TreeItem>
        <TreeItem id="second">
          <TreeItemLabel trailing={<span>zzz</span>}>Second</TreeItemLabel>
        </TreeItem>
        <TreeItem id="zeta">
          <TreeItemLabel>Zeta</TreeItemLabel>
        </TreeItem>
      </Tree>,
    );
    focus("second");
    press("z");
    expect(document.activeElement).toBe(item("zeta"));

    // A fresh query: `First` is announced as "First", so "fi" finds it, and `Second`'s visible
    // "zzz" is the only trailing text that took part in the search above.
    vi.advanceTimersByTime(1000);
    press("f");
    press("i");
    expect(document.activeElement).toBe(item("first"));
  });

  it("claims a printable key even when nothing matches", () => {
    render(<Fixture expandedIds={new Set(["documents", "reports"])} />);
    focus("summary");
    let unhandled = true;
    flushSync(() => {
      unhandled = item("summary")!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "x", bubbles: true, cancelable: true }),
      );
    });
    // Claimed on the node it was pressed on, so the ancestors it bubbles through leave it alone.
    expect(unhandled).toBe(false);
    expect(document.activeElement).toBe(item("summary"));
  });

  it("highlights the typed prefix on every matching label while the buffer is live", () => {
    vi.useFakeTimers();
    render(<Fixture expandedIds={new Set(["documents"])} />);
    focus("archive");
    press("d");
    const matches = () =>
      [...container.querySelectorAll<HTMLElement>('[data-slot="tree-item-typeahead-match"]')].map((el) => [
        el.closest<HTMLElement>('[role="treeitem"]')?.dataset.treeItemId,
        el.textContent,
      ]);
    expect(matches()).toEqual([
      ["documents", "D"],
      ["drafts", "D"],
    ]);
    // The label's accessible name is unchanged by the split.
    expect(item("documents")?.querySelector('[data-slot="tree-item-label"]')?.textContent).toBe("Documents");

    press("r");
    expect(matches()).toEqual([["drafts", "Dr"]]);

    // Timer-driven updates happen outside any React event, so each is flushed explicitly. When the
    // buffer lapses the highlight lingers in a fading state, and is removed once the fade is over.
    flushSync(() => vi.advanceTimersByTime(650));
    expect(matches()).toEqual([["drafts", "Dr"]]);
    expect(container.querySelector('[data-slot="tree-item-typeahead-match"]')?.dataset.state).toBe("fading");
    flushSync(() => vi.advanceTimersByTime(1000));
    expect(matches()).toEqual([]);
  });

  it("leaves modified chords to the browser", () => {
    render(<Fixture />);
    focus("documents");
    for (const init of [
      { key: "ArrowDown", ctrlKey: true },
      { key: "End", altKey: true },
      { key: "Home", metaKey: true },
    ]) {
      let claimed = false;
      flushSync(() => {
        claimed = !item("documents")!.dispatchEvent(
          new KeyboardEvent("keydown", { ...init, bubbles: true, cancelable: true }),
        );
      });
      expect(claimed).toBe(false);
      expect(document.activeElement).toBe(item("documents"));
    }
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
    function Controlled() {
      const [expandedIds, setExpandedIds] = React.useState(new Set(["documents"]));
      return <Fixture expandedIds={expandedIds} onExpandedChange={setExpandedIds} />;
    }
    render(<Controlled />);
    focus("reports");
    press("*");
    expect(item("reports")?.getAttribute("aria-expanded")).toBe("true");
    expect(item("drafts")?.getAttribute("aria-expanded")).toBe("true");
    expect(item("summary")).not.toBeNull();
    // Level 1 is untouched: `Shared` stays collapsed.
    expect(item("shared")?.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("Tree empty and error states (SW-2542)", () => {
  it("renders a whole-tree placeholder as a treeitem, not a real, indexable node", () => {
    render(
      <Tree aria-label="Files">
        <TreeEmpty>No files yet.</TreeEmpty>
      </Tree>,
    );
    const placeholder = container.querySelector('[data-slot="tree-empty"]')!;
    expect(placeholder.getAttribute("role")).toBe("treeitem");
    expect(placeholder.getAttribute("aria-selected")).toBe("false");
    // Not `aria-disabled`: Chromium (and Playwright's actionability checks with it) treats that as
    // inherited by descendants, which would make a nested retry button unreachable.
    expect(placeholder.hasAttribute("aria-disabled")).toBe(false);
    expect(placeholder.hasAttribute("data-tree-item-id")).toBe(false);
    expect(placeholder.hasAttribute("aria-posinset")).toBe(false);
    expect(tabStops()).toEqual([]);
  });

  it("does not block a nested interactive control (e.g. a retry button) from receiving focus", () => {
    render(
      <Tree aria-label="Files">
        <TreeEmpty>
          Couldn&apos;t load this folder.
          <button type="button">Retry</button>
        </TreeEmpty>
      </Tree>,
    );
    const button = container.querySelector("button")!;
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("does not claim a set slot from real siblings when it stands in for a branch's failed load", () => {
    render(
      <Tree aria-label="Files" defaultExpandedIds={new Set(["shared"])}>
        <TreeItem id="documents">
          <TreeItemLabel>Documents</TreeItemLabel>
        </TreeItem>
        <TreeItem id="shared" hasChildren>
          <TreeItemLabel>Shared</TreeItemLabel>
          <TreeItemGroup>
            <TreeEmpty>Couldn&apos;t load this folder.</TreeEmpty>
          </TreeItemGroup>
        </TreeItem>
        <TreeItem id="archive">
          <TreeItemLabel>Archive</TreeItemLabel>
        </TreeItem>
      </Tree>,
    );
    expect(item("documents")?.getAttribute("aria-setsize")).toBe("3");
    expect(item("shared")?.getAttribute("aria-setsize")).toBe("3");
    expect(item("archive")?.getAttribute("aria-setsize")).toBe("3");
  });

  it("is skipped over, not stalled on, by arrow-key traversal", () => {
    render(
      <Tree aria-label="Files" defaultExpandedIds={new Set(["shared"])}>
        <TreeItem id="documents">
          <TreeItemLabel>Documents</TreeItemLabel>
        </TreeItem>
        <TreeItem id="shared" hasChildren>
          <TreeItemLabel>Shared</TreeItemLabel>
          <TreeItemGroup>
            <TreeEmpty>Couldn&apos;t load this folder.</TreeEmpty>
          </TreeItemGroup>
        </TreeItem>
        <TreeItem id="archive">
          <TreeItemLabel>Archive</TreeItemLabel>
        </TreeItem>
      </Tree>,
    );
    focus("shared");
    press("ArrowDown");
    expect(document.activeElement).toBe(item("archive"));
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
