import { expect, waitFor } from "storybook/test";

import { DiffViewer2 } from "./DiffViewer2";

import type { Meta, StoryObj } from "@storybook/react-vite";

const ORIGINAL = `{
  "name": "plate-reader-protocol",
  "version": "1.4.0",
  "steps": [
    { "id": "shake", "durationSeconds": 30 },
    { "id": "read", "wavelengthNm": 450 }
  ],
  "retries": 2
}
`;

const MODIFIED = `{
  "name": "plate-reader-protocol",
  "version": "1.5.0",
  "steps": [
    { "id": "shake", "durationSeconds": 45 },
    { "id": "read", "wavelengthNm": 450 },
    { "id": "export", "format": "csv" }
  ]
}
`;

/** Forty numbered lines, so there is a long unchanged run to fold. */
const longText = (changedLine: number, replacement: string) =>
  Array.from({ length: 40 }, (_, i) =>
    i + 1 === changedLine ? replacement : `sample_${i + 1} = read_well(${i + 1})`,
  ).join("\n");

const meta: Meta<typeof DiffViewer2> = {
  title: "Components/Data Display/Diff Viewer 2",
  component: DiffViewer2,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    original: ORIGINAL,
    modified: MODIFIED,
    language: "json",
    height: 280,
  },
  argTypes: {
    mode: { control: { type: "inline-radio" }, options: ["split", "unified"] },
    language: { control: { type: "select" }, options: ["plaintext", "json", "python", "javascript", "markdown"] },
    expandUnchangedLabel: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SHIKI_TIMEOUT = { timeout: 10_000 };

const ADDED_LINE = '[data-slot="diff-viewer-2-line"][data-diff="added"]';
const REMOVED_LINE = '[data-slot="diff-viewer-2-line"][data-diff="removed"]';
const MARKER = '[data-slot="diff-viewer-2-marker"]';
const LINE_NUMBER = '[data-slot="diff-viewer-2-line-number"]';

function getViewer(canvasElement: HTMLElement) {
  const viewer = canvasElement.querySelector<HTMLElement>('[data-slot="diff-viewer-2"]');
  if (!viewer) throw new Error("DiffViewer2 root not found");
  return viewer;
}

/** Waits until Shiki has highlighted both sides and the diff is on screen. */
async function waitForDiff(viewer: HTMLElement) {
  await waitFor(() => {
    expect(viewer).toHaveAttribute("data-state", "ready");
    expect(viewer.querySelector(ADDED_LINE)).toBeInTheDocument();
    expect(viewer.querySelector(REMOVED_LINE)).toBeInTheDocument();
  }, SHIKI_TIMEOUT);
}

const markers = (viewer: HTMLElement) => [...viewer.querySelectorAll(MARKER)].map((marker) => marker.textContent);

/** Asserts that `selector` is painted in exactly the colour `token` computes to in the viewer. */
function expectPaintedWithToken(viewer: HTMLElement, selector: string, token: string) {
  const element = viewer.querySelector(selector);
  if (!element) throw new Error(`${selector} not found`);
  const probe = document.createElement("span");
  probe.style.backgroundColor = `var(${token})`;
  viewer.append(probe);
  const expected = getComputedStyle(probe).backgroundColor;
  probe.remove();
  // A token that failed to resolve would compute to transparent on both sides.
  expect(expected).not.toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(element).backgroundColor).toBe(expected);
}

function expectTokenColors(viewer: HTMLElement) {
  expectPaintedWithToken(viewer, ADDED_LINE, "--diff-added-line");
  expectPaintedWithToken(viewer, REMOVED_LINE, "--diff-removed-line");
  expectPaintedWithToken(viewer, `${ADDED_LINE} .diff-chars`, "--diff-added-text");
  expectPaintedWithToken(viewer, `${REMOVED_LINE} .diff-chars`, "--diff-removed-text");
}

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);

    await step("Renders side by side with line numbers", async () => {
      expect(viewer).toHaveAttribute("data-mode", "split");
      const firstRow = viewer.querySelector('[data-slot="diff-viewer-2-row"]');
      expect(firstRow?.querySelectorAll('[data-slot="diff-viewer-2-line"]')).toHaveLength(2);
      expect(firstRow?.querySelectorAll(LINE_NUMBER)).toHaveLength(2);
      expect(viewer.querySelectorAll("th")).toHaveLength(2);
    });

    await step("Marks changes with + / - signs, not colour alone", async () => {
      expect(markers(viewer)).toContain("+");
      expect(markers(viewer)).toContain("-");
    });

    await step("Paints added and removed lines and characters from the diff tokens", async () => {
      expectTokenColors(viewer);
    });

    await step("Highlights syntax with Shiki", async () => {
      const token = viewer.querySelector<HTMLElement>(`${ADDED_LINE} span[style]`);
      expect(token?.style.getPropertyValue("--shiki-light")).toMatch(/^var\(--shiki-/);
    });
  },
};

export const Unified: Story = {
  args: { mode: "unified" },
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    expect(viewer).toHaveAttribute("data-mode", "unified");
    // One code column, with the original and the modified line number beside it.
    for (const row of viewer.querySelectorAll('[data-slot="diff-viewer-2-row"]')) {
      expect(row.querySelectorAll('[data-slot="diff-viewer-2-line"]')).toHaveLength(1);
      expect(row.querySelectorAll(LINE_NUMBER)).toHaveLength(2);
    }
    // Removed lines come before the added lines that replace them.
    expect(markers(viewer).join("")).toMatch(/^-\+-+\++$/);
    expectTokenColors(viewer);
  },
};

export const CollapseUnchanged: Story = {
  args: {
    original: longText(20, "sample_20 = read_well(20)"),
    modified: longText(20, "sample_20 = read_well(20, gain=1.5)"),
    language: "python",
    collapseUnchanged: true,
  },
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    const folds = viewer.querySelectorAll('[data-slot="diff-viewer-2-fold"]');
    expect(folds).toHaveLength(2);
    expect(folds[0]).toHaveTextContent("Show 16 unchanged lines");
    expect(folds[1]).toHaveTextContent("Show 17 unchanged lines");
    // The changed line and three lines of context on each side stay visible.
    expect(viewer.querySelectorAll('[data-slot="diff-viewer-2-row"]')).toHaveLength(7);
  },
};

export const WordWrapWithoutLineNumbers: Story = {
  args: {
    original: "The assay buffer is prepared fresh each day and kept on ice until the plate is loaded into the reader.",
    modified: "The assay buffer is prepared fresh each day and kept at 4 °C until the plate is loaded into the reader.",
    language: "plaintext",
    wordWrap: true,
    lineNumbers: false,
    height: 160,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    expect(viewer.querySelector(LINE_NUMBER)).not.toBeInTheDocument();
    // The long line wraps inside its column instead of scrolling sideways.
    const scroller = viewer.querySelector('[data-slot="diff-viewer-2-scroller"]');
    if (!scroller) throw new Error("scroller not found");
    expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
    const line = viewer.querySelector(ADDED_LINE);
    expect(line?.getBoundingClientRect().height).toBeGreaterThan(20);
  },
};
