import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DiffViewer2 } from "../DiffViewer2";

import { getCodeBlockHighlighter } from "@/lib/shiki";

/*
 * The stories exercise the highlighted diff in a real browser. These cover what
 * they cannot reach without changing what a story shows: the plain-text diff
 * used when Shiki fails, expanding a fold, and a result that arrives too late.
 */
vi.mock("@/lib/shiki", () => ({ getCodeBlockHighlighter: vi.fn() }));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub {
  observe() {}
  disconnect() {}
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  vi.mocked(getCodeBlockHighlighter).mockRejectedValue(new Error("no highlighter"));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

/** Renders and lets the (failing) highlighter promise settle. */
const render = (ui: React.ReactElement) =>
  act(async () => {
    root.render(ui);
    await Promise.resolve();
  });

const viewer = () => container.querySelector('[data-slot="diff-viewer-2"]');
const all = (slot: string) => [...container.querySelectorAll(`[data-slot="diff-viewer-2-${slot}"]`)];
const lines = (kind: string) => all("line").filter((line) => line.getAttribute("data-diff") === kind);

const numbered = (changed: string) =>
  Array.from({ length: 20 }, (_, i) => (i === 9 ? changed : `line ${i + 1}`)).join("\n");

describe("DiffViewer2", () => {
  it("shows the loading label until the diff is ready", async () => {
    vi.mocked(getCodeBlockHighlighter).mockReturnValue(new Promise(() => {}));
    await render(<DiffViewer2 original="a" modified="b" loadingLabel="Chargement…" />);
    expect(viewer()?.getAttribute("data-state")).toBe("loading");
    expect(viewer()?.getAttribute("aria-busy")).toBe("true");
    expect(viewer()?.textContent).toBe("Chargement…");
  });

  it("falls back to a plain-text diff, with markers, when Shiki cannot highlight", async () => {
    await render(<DiffViewer2 original={"a\nb"} modified={"a\nc\nd"} originalLabel="Avant" modifiedLabel="Après" />);

    expect(viewer()?.getAttribute("data-state")).toBe("ready");
    expect(lines("removed").map((line) => line.textContent)).toEqual(["b"]);
    expect(lines("added").map((line) => line.textContent)).toEqual(["c", "d"]);
    // The second added line has no counterpart on the original side.
    expect(lines("filler")).toHaveLength(1);
    expect(all("marker").map((marker) => marker.textContent)).toEqual(["", "", "-", "+", "", "+"]);
    expect([...container.querySelectorAll("th")].map((heading) => heading.textContent)).toEqual(["Avant", "Après"]);
  });

  it("heads the two line-number columns in unified mode, and nothing without line numbers", async () => {
    await render(<DiffViewer2 original="a" modified="b" mode="unified" />);
    expect([...container.querySelectorAll("th")].map((heading) => heading.textContent)).toEqual([
      "Original",
      "Modified",
    ]);
    expect(all("line-number").map((cell) => cell.textContent)).toEqual(["1", "", "", "1"]);

    await render(<DiffViewer2 original="a" modified="b" mode="unified" lineNumbers={false} />);
    expect(container.querySelector("thead")).toBeNull();
    expect(all("line-number")).toHaveLength(0);
  });

  it("reveals a folded run when its button is pressed", async () => {
    await render(
      <DiffViewer2
        original={numbered("line 10")}
        modified={numbered("line ten")}
        collapseUnchanged
        expandUnchangedLabel={(count) => `Afficher ${count} lignes`}
      />,
    );
    expect(all("fold").map((fold) => fold.textContent)).toEqual(["Afficher 6 lignes", "Afficher 7 lignes"]);
    expect(all("row")).toHaveLength(7);

    act(() => all("fold")[0].querySelector("button")?.click());
    expect(all("fold").map((fold) => fold.textContent)).toEqual(["Afficher 7 lignes"]);
    expect(all("row")).toHaveLength(13);
  });

  it("becomes a named tab stop only while the diff scrolls", async () => {
    await render(<DiffViewer2 original="a" modified="b" scrollRegionLabel="Diff défilant" />);
    const scroller = all("scroller")[0];
    expect(scroller.hasAttribute("tabindex")).toBe(false);
    expect(scroller.hasAttribute("role")).toBe(false);

    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
    await render(<DiffViewer2 original="a" modified="b" scrollRegionLabel="Diff défilant" key="remount" />);
    const scrolling = all("scroller")[0];
    expect(scrolling.getAttribute("tabindex")).toBe("0");
    expect(scrolling.getAttribute("role")).toBe("group");
    expect(scrolling.getAttribute("aria-label")).toBe("Diff défilant");
    vi.restoreAllMocks();
  });

  it("ignores a result that arrives after the texts have changed", async () => {
    let failFirst: (error: Error) => void = () => {};
    vi.mocked(getCodeBlockHighlighter).mockReturnValueOnce(
      new Promise((_, reject) => {
        failFirst = reject;
      }),
    );
    await render(<DiffViewer2 original="old" modified="older" />);
    await render(<DiffViewer2 original="a" modified="b" />);
    await act(async () => {
      failFirst(new Error("late"));
      await Promise.resolve();
    });
    expect(lines("added").map((line) => line.textContent)).toEqual(["b"]);
  });
});
