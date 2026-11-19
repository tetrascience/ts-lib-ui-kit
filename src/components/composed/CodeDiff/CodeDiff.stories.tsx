import { ChevronDownIcon, CopyIcon, LinkIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CodeDiff } from "./CodeDiff";
import {
  ADDED_CHARS_CLASS,
  ADDED_LINE_TINT,
  ADDED_MARKER_TEXT,
  FOLD_SURFACE,
  REMOVED_CHARS_CLASS,
  REMOVED_LINE_TINT,
  REMOVED_MARKER_TEXT,
  SUBTLE_TEXT,
  TOKEN_TEXT,
} from "./diff-styles";

import type { CodeDiffLine } from "./CodeDiff";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

/** Eighty numbered lines, with long unchanged runs to fold, except the lines given. */
const longText = (edits: Record<number, string> = {}) =>
  Array.from({ length: 80 }, (_, i) => edits[i + 1] ?? `sample_${i + 1} = read_well(${i + 1})`).join("\n");

const LONG_ORIGINAL = longText();
const LONG_MODIFIED = longText({
  20: "sample_20 = read_well(20, gain=1.5)",
  60: "sample_60 = read_well(60, gain=2.0)",
});

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
    renderLineEndActions: { control: false },
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
    original: LONG_ORIGINAL,
    modified: LONG_MODIFIED,
    language: "python",
    collapseUnchanged: true,
  },
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    const folds = viewer.querySelectorAll('[data-slot="code-diff-fold"]');
    expect(folds).toHaveLength(3);
    // Short runs open in one go; the long one between the changes opens a step at a time, either way.
    const buttons = (fold: Element) => within(fold as HTMLElement).getAllByRole("button");
    expect(buttons(folds[0]).map((button) => button.ariaLabel)).toEqual(["Show 16 unchanged lines"]);
    expect(buttons(folds[1]).map((button) => button.ariaLabel)).toEqual(["Expand down", "Expand up"]);
    expect(buttons(folds[2]).map((button) => button.ariaLabel)).toEqual(["Show 17 unchanged lines"]);
    // Like GitHub, a fold names the lines shown after it; the last one has none.
    expect(folds[0]).toHaveTextContent("@@ -17,7 +17,7 @@");
    expect(folds[1]).toHaveTextContent("@@ -57,7 +57,7 @@");
    expect(folds[2]).toHaveTextContent("");
    // The changed line and three lines of context on each side stay visible.
    expect(viewer.querySelectorAll('[data-slot="code-diff-row"]')).toHaveLength(14);
  },
};

/** With `maxHeight`, a diff taller than the limit scrolls inside the viewer and becomes a tab stop. */
export const MaxHeight: Story = {
  args: {
    original: LONG_ORIGINAL,
    modified: LONG_MODIFIED,
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

/** A comment form in the style of a code review, built from kit components. */
function CommentBox({ line, onClose }: { line: CodeDiffLine; onClose: () => void }) {
  const [draft, setDraft] = React.useState("");
  return (
    <div className="py-2 pr-2">
      <div className="max-w-xl rounded-lg border bg-card p-3 text-sm shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>TS</AvatarFallback>
          </Avatar>
          <span className="font-medium">Add a comment on line {lineId(line)}</span>
        </div>
        <Tabs defaultValue="write">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <Textarea
              aria-label={`Comment on line ${lineId(line)}`}
              placeholder="Leave a comment"
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </TabsContent>
          <TabsContent value="preview" className="min-h-24 rounded-md border p-3 whitespace-pre-wrap">
            {draft || "Nothing to preview"}
          </TabsContent>
        </Tabs>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!draft.trim()} onClick={onClose}>
            <MessageSquareIcon />
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Your own components on a line, here arranged like a code review.
 * `renderLineActions` puts a control in the line's gutter and
 * `renderLineEndActions` one at its right-hand end, both shown on hover or
 * focus; `renderLineAnnotation` puts content in a row beneath the line. Which
 * lines are open is the consumer's state.
 */
export const LineActionsAndAnnotations: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `const [open, setOpen] = React.useState<string[]>([]);
const toggle = (id: string) =>
  setOpen((ids) => (ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]));
const lineId = (line: CodeDiffLine) => \`\${line.side === "original" ? "L" : "R"}\${line.lineNumber}\`;

<CodeDiff
  original={original}
  modified={modified}
  language="json"
  renderLineActions={(line) => (
    <Button
      size="icon-xs"
      aria-label={\`Comment on line \${lineId(line)}\`}
      aria-expanded={open.includes(lineId(line))}
      onClick={() => toggle(lineId(line))}
    >
      <PlusIcon />
    </Button>
  )}
  renderLineEndActions={(line) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-xs" aria-label={\`More actions for line \${lineId(line)}\`}>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => toggle(lineId(line))}>Add comment on line {lineId(line)}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(line.text)}>Copy</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
  renderLineAnnotation={(line) =>
    open.includes(lineId(line)) ? <CommentBox line={line} onClose={() => toggle(lineId(line))} /> : null
  }
/>`,
      },
    },
  },
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
        renderLineEndActions={(line) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-xs"
                className="size-4 rounded-sm"
                aria-label={`More actions for line ${lineId(line)}`}
              >
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => toggle(lineId(line))}>
                <PlusIcon />
                {open.includes(lineId(line)) ? "Close" : "Add"} comment on line {lineId(line)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void navigator.clipboard?.writeText(line.text)}>
                <CopyIcon />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LinkIcon />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        renderLineAnnotation={(line) =>
          open.includes(lineId(line)) ? <CommentBox line={line} onClose={() => toggle(lineId(line))} /> : null
        }
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    const canvas = within(viewer);

    await step("Offers both sets of actions on every line, on its own side, and on no filler cell", async () => {
      expect(canvas.getAllByRole("button", { name: /^Comment on line L/ })).toHaveLength(10);
      expect(canvas.getAllByRole("button", { name: /^Comment on line R/ })).toHaveLength(10);
      expect(canvas.getAllByRole("button", { name: /^More actions for line/ })).toHaveLength(20);
    });

    const action = canvas.getByRole("button", { name: "Comment on line R3" });
    const menuButton = canvas.getByRole("button", { name: "More actions for line R3" });

    await step("Keeps actions out of sight until the line is hovered or focused", async () => {
      for (const control of [action, menuButton]) {
        const slot = control.parentElement;
        if (!slot) throw new Error("actions slot not found");
        expect(getComputedStyle(slot).opacity).toBe("0");
        control.focus();
        expect(getComputedStyle(slot).opacity).toBe("1");
      }
    });

    await step("Puts the end actions after the line's code", async () => {
      const code = menuButton.closest("tr")?.querySelector('[data-slot="code-diff-line"][data-side="modified"]');
      expect(menuButton.getBoundingClientRect().left).toBeGreaterThanOrEqual(code?.getBoundingClientRect().right ?? 0);
    });

    await step("Opens the comment box from the line's menu, in a row beneath the line", async () => {
      await userEvent.click(menuButton);
      const item = await within(document.body).findByRole("menuitem", { name: "Add comment on line R3" });
      await userEvent.click(item);
      const annotation = await waitFor(() => {
        const row = viewer.querySelector('[data-slot="code-diff-annotation"]');
        if (!row) throw new Error("annotation row not found");
        return row;
      });
      expect(annotation.previousElementSibling).toContainElement(action);
      expect(annotation.querySelector('[data-side="modified"]')).toHaveTextContent("Add a comment on line R3");
      expect(annotation.querySelector('[data-side="original"]')).toBeEmptyDOMElement();
      // It starts at the actions column, so the box lines up with the button above it.
      const box = annotation.querySelector('[data-side="modified"] > div');
      expect(box?.getBoundingClientRect().left).toBeCloseTo(action.getBoundingClientRect().left, 0);
      await waitFor(() => expect(action).toHaveAttribute("aria-expanded", "true"));
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
 * A test only: it is kept out of the Storybook sidebar and the docs page.
 */
export const TokenContrast: Story = {
  tags: ["!dev", "!autodocs"],
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
                <td className={cn("px-2", FOLD_SURFACE)}>
                  <span data-contrast-sample className={SUBTLE_TEXT}>
                    @@ -17,7 +17,7 @@
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
