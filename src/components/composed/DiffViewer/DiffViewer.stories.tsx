import { expect, waitFor } from "storybook/test";

import { cssColorToHex, resolveDiffColors } from "./diff-theme";
import { DiffViewer } from "./DiffViewer";

import type { DiffColorRole } from "./diff-theme";
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

const meta: Meta<typeof DiffViewer> = {
  title: "Components/Data Display/Diff Viewer",
  component: DiffViewer,
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
    options: { control: false },
    onMount: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const MONACO_TIMEOUT = { timeout: 10_000 };

function getViewer(canvasElement: HTMLElement) {
  const viewer = canvasElement.querySelector<HTMLElement>('[data-slot="diff-viewer"]');
  if (!viewer) throw new Error("DiffViewer root not found");
  return viewer;
}

/** Waits until Monaco has computed the diff and painted its line decorations. */
async function waitForDiff(viewer: HTMLElement) {
  await waitFor(() => {
    expect(viewer.querySelector(".line-insert")).toBeInTheDocument();
    expect(viewer.querySelector(".line-delete")).toBeInTheDocument();
  }, MONACO_TIMEOUT);
}

const channels = (hex: string) => [1, 3, 5, 7].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

/** Asserts that `selector` is painted in the colour the diff token resolves to. */
function expectPaintedWithToken(viewer: HTMLElement, selector: string, role: DiffColorRole) {
  const element = viewer.querySelector(selector);
  if (!element) throw new Error(`${selector} not found`);
  const expected = resolveDiffColors(viewer)[role];
  const painted = cssColorToHex(getComputedStyle(element).backgroundColor);
  if (!expected || !painted) throw new Error(`could not resolve a colour for ${role}`);
  // Both sides round-trip through an 8-bit canvas, so allow a rounding step.
  channels(painted).forEach((channel, i) => expect(Math.abs(channel - channels(expected)[i])).toBeLessThanOrEqual(2));
}

async function expectTokenColors(viewer: HTMLElement) {
  await waitFor(() => {
    expectPaintedWithToken(viewer, ".line-insert", "addedLine");
    expectPaintedWithToken(viewer, ".line-delete", "removedLine");
    expectPaintedWithToken(viewer, ".char-insert", "addedText");
    expectPaintedWithToken(viewer, ".char-delete", "removedText");
  }, MONACO_TIMEOUT);
}

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);

    await step("Renders side by side with line numbers", async () => {
      expect(viewer.querySelector(".monaco-diff-editor")).toHaveClass("side-by-side");
      expect(viewer.querySelector(".line-numbers")).toBeInTheDocument();
    });

    await step("Marks changes with + / - signs, not colour alone", async () => {
      expect(viewer.querySelector(".insert-sign")).toBeInTheDocument();
      expect(viewer.querySelector(".delete-sign")).toBeInTheDocument();
    });

    await step("Paints added and removed lines and characters from the diff tokens", async () => {
      await expectTokenColors(viewer);
    });
  },
};

export const Unified: Story = {
  args: { mode: "unified" },
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    expect(viewer).toHaveAttribute("data-mode", "unified");
    expect(viewer.querySelector(".monaco-diff-editor")).not.toHaveClass("side-by-side");
    await expectTokenColors(viewer);
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
    await waitFor(() => expect(viewer.querySelector(".diff-hidden-lines")).toBeInTheDocument(), MONACO_TIMEOUT);
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
    expect(viewer.querySelector(".line-numbers")).not.toBeInTheDocument();
  },
};

/**
 * The diff colours follow the theme: switching to dark re-resolves the tokens
 * and repaints the diff without remounting the editor.
 */
export const FollowsTheme: Story = {
  play: async ({ canvasElement, step }) => {
    const viewer = getViewer(canvasElement);
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    const paintedAddedLine = () => getComputedStyle(viewer.querySelector(".line-insert") as Element).backgroundColor;
    await waitForDiff(viewer);
    await expectTokenColors(viewer);
    const before = paintedAddedLine();

    await step("Repaints from the tokens after a theme switch", async () => {
      root.classList.toggle("dark", !wasDark);
      await waitFor(() => expect(paintedAddedLine()).not.toBe(before), MONACO_TIMEOUT);
      await expectTokenColors(viewer);
    });

    await step("Restores the original theme", async () => {
      root.classList.toggle("dark", wasDark);
      await waitFor(() => expect(paintedAddedLine()).toBe(before), MONACO_TIMEOUT);
      await expectTokenColors(viewer);
    });
  },
};

/**
 * Re-colour diffs by overriding the tokens on an ancestor. Monaco themes are
 * page-global, so every viewer on a page shares one set of diff colours — this
 * story is kept off the docs page for that reason.
 */
export const CustomTokens: Story = {
  tags: ["!autodocs"],
  decorators: [
    (Story) => (
      <div
        style={
          {
            "--diff-added": "oklch(0.55 0.15 250)",
            "--diff-added-line": "oklch(0.55 0.15 250 / 15%)",
            "--diff-added-text": "oklch(0.55 0.15 250 / 35%)",
            "--diff-removed": "oklch(0.6 0.15 60)",
            "--diff-removed-line": "oklch(0.6 0.15 60 / 15%)",
            "--diff-removed-text": "oklch(0.6 0.15 60 / 35%)",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const viewer = getViewer(canvasElement);
    await waitForDiff(viewer);
    await expectTokenColors(viewer);
    // The override is what was resolved, not the kit default.
    expect(resolveDiffColors(viewer).added).not.toBe(resolveDiffColors(document.body).added);
  },
};
