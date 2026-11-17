import { PlusIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CodeDiff } from "./CodeDiff";
import {
  ADDED_CHARS_CLASS,
  ADDED_LINE_TINT,
  ADDED_MARKER_TEXT,
  QUIET_SURFACE,
  REMOVED_CHARS_CLASS,
  REMOVED_LINE_TINT,
  REMOVED_MARKER_TEXT,
  SUBTLE_TEXT,
  TOKEN_TEXT,
} from "./diff-styles";

import type { CodeDiffLine } from "./CodeDiff";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const meta: Meta<typeof CodeDiff> = {
  title: "Components/Data Display/Code Diff",
  component: CodeDiff,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    original: ORIGINAL,
    modified: MODIFIED,
    language: "json",
  },
  argTypes: {
    mode: { control: { type: "inline-radio" }, options: ["split", "unified"] },
    language: { control: { type: "select" }, options: ["plaintext", "json", "python", "javascript", "markdown"] },
    expandUnchangedLabel: { control: false },
    renderLineActions: { control: false },
    renderLineAnnotation: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SHIKI_TIMEOUT = { timeout: 10_000 };

const ADDED_LINE = '[data-slot="code-diff-line"][data-diff="added"]';
const REMOVED_LINE = '[data-slot="code-diff-line"][data-diff="removed"]';
const MARKER = '[data-slot="code-diff-marker"]';
const LINE_NUMBER = '[data-slot="code-diff-line-number"]';

function getViewer(canvasElement: HTMLElement) {
  const viewer = canvasElement.querySelector<HTMLElement>('[data-slot="code-diff"]');
  if (!viewer) throw new Error("CodeDiff root not found");
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
      const firstRow = viewer.querySelector('[data-slot="code-diff-row"]');
      expect(firstRow?.querySelectorAll('[data-slot="code-diff-line"]')).toHaveLength(2);
      expect(firstRow?.querySelectorAll(LINE_NUMBER)).toHaveLength(2);
      expect(viewer.querySelectorAll("th")).toHaveLength(2);
    });

    await step("Is as tall as the diff, with nothing to scroll", async () => {
      const scroller = viewer.querySelector('[data-slot="code-diff-scroller"]');
      expect(scroller?.scrollHeight).toBe(scroller?.clientHeight);
      expect(scroller).not.toHaveAttribute("tabindex");
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
    for (const row of viewer.querySelectorAll('[data-slot="code-diff-row"]')) {
      expect(row.querySelectorAll('[data-slot="code-diff-line"]')).toHaveLength(1);
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
    const folds = viewer.querySelectorAll('[data-slot="code-diff-fold"]');
    expect(folds).toHaveLength(2);
    expect(folds[0]).toHaveTextContent("Show 16 unchanged lines");
    expect(folds[1]).toHaveTextContent("Show 17 unchanged lines");
    // The changed line and three lines of context on each side stay visible.
    expect(viewer.querySelectorAll('[data-slot="code-diff-row"]')).toHaveLength(7);
  },
};

/** With `maxHeight`, a diff taller than the limit scrolls inside the viewer and becomes a tab stop. */
export const MaxHeight: Story = {
  args: {
    original: longText(20, "sample_20 = read_well(20)"),
    modified: longText(20, "sample_20 = read_well(20, gain=1.5)"),
    language: "python",
    maxHeight: 240,
  },
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    expect(viewer.getBoundingClientRect().height).toBe(240);
    const scroller = viewer.querySelector('[data-slot="code-diff-scroller"]');
    if (!scroller) throw new Error("scroller not found");
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await waitFor(() => expect(scroller).toHaveAttribute("tabindex", "0"));
    expect(scroller).toHaveAccessibleName("Diff, scrollable");
  },
};

export const WordWrapWithoutLineNumbers: Story = {
  args: {
    original: "The assay buffer is prepared fresh each day and kept on ice until the plate is loaded into the reader.",
    modified: "The assay buffer is prepared fresh each day and kept at 4 °C until the plate is loaded into the reader.",
    language: "plaintext",
    wordWrap: true,
    lineNumbers: false,
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
    const scroller = viewer.querySelector('[data-slot="code-diff-scroller"]');
    if (!scroller) throw new Error("scroller not found");
    expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
    const line = viewer.querySelector(ADDED_LINE);
    expect(line?.getBoundingClientRect().height).toBeGreaterThan(20);
  },
};

const lineId = (line: CodeDiffLine) => `${line.side === "original" ? "L" : "R"}${line.lineNumber}`;

/**
 * Your own components on a line. `renderLineActions` puts a control in the
 * line's gutter, shown on hover or focus; `renderLineAnnotation` puts content
 * in a row beneath the line. Which lines are open is the consumer's state.
 */
export const LineActionsAndAnnotations: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState<string[]>([]);
    const toggle = (id: string) =>
      setOpen((ids) => (ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]));
    return (
      <CodeDiff
        {...args}
        renderLineActions={(line) => (
          <Button
            size="icon-xs"
            className="size-4 rounded-sm"
            aria-label={`Comment on line ${lineId(line)}`}
            aria-expanded={open.includes(lineId(line))}
            onClick={() => toggle(lineId(line))}
          >
            <PlusIcon />
          </Button>
        )}
        renderLineAnnotation={(line) =>
          open.includes(lineId(line)) ? (
            <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>
                Comment on line {lineId(line)}: <code className="font-mono text-xs">{line.text.trim()}</code>
              </span>
              <Button size="xs" variant="outline" onClick={() => toggle(lineId(line))}>
                Cancel
              </Button>
            </div>
          ) : null
        }
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    const canvas = within(viewer);

    await step("Offers the action on every line, on its own side, and on no filler cell", async () => {
      expect(canvas.getAllByRole("button", { name: /^Comment on line L/ })).toHaveLength(10);
      expect(canvas.getAllByRole("button", { name: /^Comment on line R/ })).toHaveLength(10);
    });

    const action = canvas.getByRole("button", { name: "Comment on line R3" });

    await step("Keeps actions out of sight until the line is hovered or focused", async () => {
      const slot = action.parentElement;
      if (!slot) throw new Error("actions slot not found");
      expect(getComputedStyle(slot).opacity).toBe("0");
      action.focus();
      expect(getComputedStyle(slot).opacity).toBe("1");
    });

    await step("Renders the annotation in a row beneath its line, under its own side", async () => {
      await userEvent.click(action);
      const annotation = viewer.querySelector('[data-slot="code-diff-annotation"]');
      expect(annotation?.previousElementSibling).toContainElement(action);
      expect(annotation?.querySelector('[data-side="modified"]')).toHaveTextContent(
        'Comment on line R3: "version": "1.5.0",',
      );
      expect(annotation?.querySelector('[data-side="original"]')).toBeEmptyDOMElement();
    });
  },
};

const SYNTAX_TOKENS = ["fg", "comment", "keyword", "constant", "entity", "tag", "string", "variable"];

const CONTRAST_SURFACES = [
  { name: "Unchanged line", cell: undefined, chars: undefined, marker: undefined },
  { name: "Added line", cell: ADDED_LINE_TINT, chars: undefined, marker: ADDED_MARKER_TEXT },
  { name: "Added characters", cell: ADDED_LINE_TINT, chars: ADDED_CHARS_CLASS, marker: undefined },
  { name: "Removed line", cell: REMOVED_LINE_TINT, chars: undefined, marker: REMOVED_MARKER_TEXT },
  { name: "Removed characters", cell: REMOVED_LINE_TINT, chars: REMOVED_CHARS_CLASS, marker: undefined },
];

/** WCAG relative luminance of an 8-bit sRGB colour. */
function luminance([red, green, blue]: number[]) {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** Paints the given CSS colours on top of each other and reads the resulting pixel. */
function composite(layers: string[]) {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("no 2D canvas");
  context.canvas.width = 1;
  context.canvas.height = 1;
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
}

/** Contrast of an element's text against every background painted behind it, up to `root`. */
function contrastOf(element: Element, root: Element) {
  const backgrounds: string[] = [];
  for (let node: Element | null = element; node; node = node === root ? null : node.parentElement) {
    backgrounds.unshift(getComputedStyle(node).backgroundColor);
  }
  const text = luminance(composite([...backgrounds, getComputedStyle(element).color]));
  const surface = luminance(composite(backgrounds));
  return (Math.max(text, surface) + 0.05) / (Math.min(text, surface) + 0.05);
}

/**
 * Every colour the viewer writes text in, on every background it can sit on, in
 * light and dark, built from the viewer's own classes. The play test fails if
 * any combination drops under WCAG AA (4.5:1), and axe checks the same samples.
 */
export const TokenContrast: Story = {
  parameters: { docs: { canvas: { sourceState: "none" } } },
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {["light", "dark"].map((scheme) => (
        <div
          key={scheme}
          data-scheme={scheme}
          className={cn("rounded-lg border bg-card p-3 text-foreground", scheme === "dark" && "dark")}
        >
          <table className="w-full border-separate border-spacing-0 font-mono text-xs leading-5 text-[var(--shiki-fg)]">
            <caption className="pb-2 text-left font-sans text-sm font-medium capitalize">{scheme}</caption>
            <tbody>
              {CONTRAST_SURFACES.map((surface) => (
                <tr key={surface.name}>
                  <th scope="row" className="pr-3 text-left font-sans font-normal whitespace-nowrap">
                    {surface.name}
                  </th>
                  <td className={cn("px-2", surface.cell)}>
                    <span data-contrast-sample className={SUBTLE_TEXT}>
                      12
                    </span>{" "}
                    {surface.marker && (
                      <span data-contrast-sample className={surface.marker}>
                        +/-
                      </span>
                    )}{" "}
                    <span className={surface.chars}>
                      {SYNTAX_TOKENS.map((token) => (
                        <React.Fragment key={token}>
                          <span
                            data-contrast-sample
                            className={TOKEN_TEXT}
                            style={
                              {
                                "--shiki-light": `var(--shiki-${token})`,
                                "--shiki-dark": `var(--shiki-${token})`,
                              } as React.CSSProperties
                            }
                          >
                            {token}
                          </span>{" "}
                        </React.Fragment>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="pr-3 text-left font-sans font-normal whitespace-nowrap">
                  Fold row
                </th>
                <td className={cn("px-2 font-sans", QUIET_SURFACE)}>
                  <span data-contrast-sample className={SUBTLE_TEXT}>
                    Show 16 unchanged lines
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const scheme of ["light", "dark"]) {
      const root = canvasElement.querySelector(`[data-scheme="${scheme}"]`);
      if (!root) throw new Error(`${scheme} samples not found`);
      const samples = [...root.querySelectorAll("[data-contrast-sample]")];
      // 5 surfaces x (8 syntax tokens + a line number), two markers, the fold row.
      expect(samples).toHaveLength(48);
      const failures = samples
        .map((sample) => ({ sample, ratio: contrastOf(sample, root) }))
        .filter(({ ratio }) => ratio < 4.5)
        .map(({ sample, ratio }) => {
          const surface = sample.closest("tr")?.querySelector("th")?.textContent;
          return `${scheme}: "${sample.textContent}" on ${surface} is ${ratio.toFixed(2)}:1`;
        });
      expect(failures).toEqual([]);
    }
  },
};
