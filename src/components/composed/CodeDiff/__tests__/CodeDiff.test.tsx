import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CodeDiff } from "../CodeDiff";

import type { CodeDiffLine } from "../CodeDiff";

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

const viewer = () => container.querySelector('[data-slot="code-diff"]');
const all = (slot: string) => [...container.querySelectorAll(`[data-slot="code-diff-${slot}"]`)];
const lines = (kind: string) => all("line").filter((line) => line.getAttribute("data-diff") === kind);

const numbered = (changed: string) =>
  Array.from({ length: 20 }, (_, i) => (i === 9 ? changed : `line ${i + 1}`)).join("\n");

describe("CodeDiff", () => {
  it("shows the loading label until the diff is ready", async () => {
    vi.mocked(getCodeBlockHighlighter).mockReturnValue(new Promise(() => {}));
    await render(<CodeDiff original="a" modified="b" loadingLabel="Chargement…" />);
    expect(viewer()?.getAttribute("data-state")).toBe("loading");
    expect(viewer()?.getAttribute("aria-busy")).toBe("true");
    expect(viewer()?.textContent).toBe("Chargement…");
  });

  it("falls back to a plain-text diff, with markers, when Shiki cannot highlight", async () => {
    await render(<CodeDiff original={"a\nb"} modified={"a\nc\nd"} originalLabel="Avant" modifiedLabel="Après" />);

    expect(viewer()?.getAttribute("data-state")).toBe("ready");
    expect(lines("removed").map((line) => line.textContent)).toEqual(["b"]);
    expect(lines("added").map((line) => line.textContent)).toEqual(["c", "d"]);
    // The second added line has no counterpart on the original side.
    expect(lines("filler")).toHaveLength(1);
    expect(all("marker").map((marker) => marker.textContent)).toEqual(["", "", "-", "+", "", "+"]);
    expect([...container.querySelectorAll("th")].map((heading) => heading.textContent)).toEqual(["Avant", "Après"]);
  });

  it("heads the two line-number columns in unified mode, and nothing without line numbers", async () => {
    await render(<CodeDiff original="a" modified="b" mode="unified" />);
    expect([...container.querySelectorAll("th")].map((heading) => heading.textContent)).toEqual([
      "Original",
      "Modified",
    ]);
    expect(all("line-number").map((cell) => cell.textContent)).toEqual(["1", "", "", "1"]);

    await render(<CodeDiff original="a" modified="b" mode="unified" lineNumbers={false} />);
    expect(container.querySelector("thead")).toBeNull();
    expect(all("line-number")).toHaveLength(0);
  });

  it("reveals a folded run when its button is pressed", async () => {
    await render(
      <CodeDiff
        original={numbered("line 10")}
        modified={numbered("line ten")}
        collapseUnchanged
        expandUnchangedLabel={(count) => `Afficher ${count} lignes`}
      />,
    );
    const foldNames = () => all("fold").map((fold) => fold.querySelector("button")?.getAttribute("aria-label"));
    expect(foldNames()).toEqual(["Afficher 6 lignes", "Afficher 7 lignes"]);
    // Only a fold with lines after it has a hunk header to show.
    expect(all("fold").map((fold) => fold.textContent)).toEqual(["@@ -7,7 +7,7 @@", ""]);
    expect(all("row")).toHaveLength(7);

    act(() => all("fold")[0].querySelector("button")?.click());
    expect(foldNames()).toEqual(["Afficher 7 lignes"]);
    expect(all("row")).toHaveLength(13);
  });

  it("grows with the diff unless given a maximum height", async () => {
    await render(<CodeDiff original="a" modified="b" />);
    expect((viewer() as HTMLElement).style.maxHeight).toBe("");
    expect((viewer() as HTMLElement).style.height).toBe("");

    await render(<CodeDiff original="a" modified="b" maxHeight={240} />);
    expect((viewer() as HTMLElement).style.maxHeight).toBe("240px");
  });

  it("opens a long fold twenty lines at a time, from the side each button points to", async () => {
    const lines = (edits: Record<number, string>) =>
      Array.from({ length: 120 }, (_, i) => edits[i + 1] ?? `line ${i + 1}`).join("\n");
    await render(
      <CodeDiff
        original={lines({})}
        modified={lines({ 30: "line thirty", 90: "line ninety" })}
        collapseUnchanged
        expandUpLabel="Vers le haut"
        expandDownLabel="Vers le bas"
      />,
    );
    const names = () => [...container.querySelectorAll("[data-slot=code-diff-fold] button")].map((b) => b.ariaLabel);
    const foldButtons = () => [...container.querySelectorAll<HTMLElement>("[data-slot=code-diff-fold] button")];
    const press = (name: string) =>
      act(() =>
        foldButtons()
          .find((button) => button.ariaLabel === name)
          ?.click(),
      );
    const numbers = () => all("line-number").map((cell) => cell.textContent);

    // Lines 1-26 above the first change, 34-86 between the two, 94-120 below the second.
    expect(names()).toEqual(["Vers le haut", "Vers le bas", "Vers le haut", "Vers le bas"]);
    expect(all("fold").map((fold) => fold.textContent)).toEqual(["@@ -27,7 +27,7 @@", "@@ -87,7 +87,7 @@", ""]);

    // Up from the first change: lines 7-26 appear, and the six left open in one go.
    press("Vers le haut");
    expect(numbers()[0]).toBe("7");
    expect(names()[0]).toBe("Show 6 unchanged lines");

    // Down into the middle fold continues the code above it: lines 34-53.
    press("Vers le bas");
    expect(numbers()).toContain("53");
    expect(numbers()).not.toContain("54");

    // Up from the second change: lines 67-86, leaving 54-66, few enough to open at once.
    press("Vers le haut");
    expect(numbers()).toContain("67");
    expect(names()).toEqual(["Show 6 unchanged lines", "Show 13 unchanged lines", "Vers le bas"]);
    press("Show 13 unchanged lines");
    expect(numbers()).toContain("60");
  });

  it("becomes a named tab stop only while the diff scrolls", async () => {
    await render(<CodeDiff original="a" modified="b" scrollRegionLabel="Diff défilant" />);
    const scroller = all("scroller")[0];
    expect(scroller.hasAttribute("tabindex")).toBe(false);
    expect(scroller.hasAttribute("role")).toBe(false);

    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
    await render(<CodeDiff original="a" modified="b" scrollRegionLabel="Diff défilant" key="remount" />);
    const scrolling = all("scroller")[0];
    expect(scrolling.getAttribute("tabindex")).toBe("0");
    expect(scrolling.getAttribute("role")).toBe("group");
    expect(scrolling.getAttribute("aria-label")).toBe("Diff défilant");
    vi.restoreAllMocks();
  });

  it("tells the line render props which line they are drawing", async () => {
    const seen: string[] = [];
    const describe = ({ side, lineNumber, kind, text }: CodeDiffLine) => `${side} ${lineNumber} ${kind} ${text}`;
    await render(
      <CodeDiff
        original={"a\nb"}
        modified={"a\nc"}
        mode="unified"
        lineActionsVisibility="always"
        renderLineActions={(line) => {
          seen.push(describe(line));
          return <button type="button">{describe(line)}</button>;
        }}
        renderLineAnnotation={(line) => (line.kind === "removed" ? <p>note on {line.text}</p> : null)}
      />,
    );

    // An unchanged line is drawn once in unified mode, and reported as the modified text's.
    expect([...new Set(seen)]).toEqual(["modified 1 unchanged a", "original 2 removed b", "modified 2 added c"]);
    expect(all("line-actions")).toHaveLength(3);
    expect(all("line-actions")[0].firstElementChild?.className).not.toContain("opacity-0");

    // One annotation row, directly under the removed line, spanning the whole table.
    expect(all("annotation")).toHaveLength(1);
    expect(all("annotation")[0].previousElementSibling).toBe(all("row")[1]);
    expect(all("annotation")[0].textContent).toBe("note on b");
    // It spans the actions, marker and code columns, clear of the two line-number columns.
    const cells = [...all("annotation")[0].querySelectorAll("td")];
    expect(cells.map((cell) => cell.getAttribute("colspan"))).toEqual(["2", "3"]);
    expect(cells[0].textContent).toBe("");
    expect(container.querySelector("thead td")?.getAttribute("colspan")).toBe("3");
  });

  it("adds a column after the code for end actions, which an annotation also spans", async () => {
    await render(
      <CodeDiff
        original="a"
        modified={"a\nb"}
        renderLineEndActions={(line) => <button type="button">{`menu ${line.side} ${line.lineNumber}`}</button>}
        renderLineAnnotation={(line) => (line.kind === "added" ? <p>note</p> : null)}
      />,
    );
    const [firstRow, addedRow] = all("row");
    // Each side ends with its end actions, straight after its code.
    expect([...firstRow.children].map((cell) => cell.getAttribute("data-slot")?.replace("code-diff-", ""))).toEqual([
      "line-number",
      "marker",
      "line",
      "line-end-actions",
      "line-number",
      "marker",
      "line",
      "line-end-actions",
    ]);
    expect(all("line-end-actions").map((cell) => cell.textContent)).toEqual([
      "menu original 1",
      "menu modified 1",
      "",
      "menu modified 2",
    ]);
    // The annotation skips the line number and spans marker, code and end actions.
    const cells = [...(addedRow.nextElementSibling?.querySelectorAll("td") ?? [])];
    expect(cells.map((cell) => cell.getAttribute("colspan"))).toEqual(["1", "3", "1", "3"]);
    expect(container.querySelector("th")?.getAttribute("colspan")).toBe("4");
  });

  it("gives a row with no line on one side neither actions nor an annotation there", async () => {
    await render(
      <CodeDiff
        original="a"
        modified={"a\nb"}
        renderLineActions={() => <button type="button">act</button>}
        renderLineAnnotation={() => <p>note</p>}
      />,
    );
    const [, addedRow] = all("row");
    const [originalActions, modifiedActions] = addedRow.querySelectorAll('[data-slot="code-diff-line-actions"]');
    expect(originalActions.textContent).toBe("");
    expect(modifiedActions.textContent).toBe("act");
    const annotation = addedRow.nextElementSibling;
    expect(annotation?.querySelector('[data-side="original"]')?.textContent).toBe("");
    expect(annotation?.querySelector('[data-side="modified"]')?.textContent).toBe("note");
  });

  it("ignores a result that arrives after the texts have changed", async () => {
    let failFirst: (error: Error) => void = () => {};
    vi.mocked(getCodeBlockHighlighter).mockReturnValueOnce(
      new Promise((_, reject) => {
        failFirst = reject;
      }),
    );
    await render(<CodeDiff original="old" modified="older" />);
    await render(<CodeDiff original="a" modified="b" />);
    await act(async () => {
      failFirst(new Error("late"));
      await Promise.resolve();
    });
    expect(lines("added").map((line) => line.textContent)).toEqual(["b"]);
  });
});
