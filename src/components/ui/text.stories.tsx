import { Beaker, CircleAlert, CircleCheck, FlaskConical, Info, TriangleAlert } from "lucide-react";
import { expect, within } from "storybook/test";

import { Text, type TextVariant } from "./text";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Text> = {
  title: "Components/Data Display/Text",
  component: Text,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "span", "div", "dt", "dd", "figcaption"],
      description: "Semantic element — controls the document outline only.",
    },
    variant: {
      control: "select",
      options: ["display", "title-lg", "title", "title-sm", "title-xs", "body", "label", "caption", "overline"],
      description: "Visual scale — controls size/weight/tracking only.",
    },
    state: {
      control: "inline-radio",
      options: ["default", "muted", "active", "positive", "warning", "destructive"],
      description: "Semantic colour — sets no colour on `default` so `Text` inherits.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

const SCALE: { variant: TextVariant; defaultAs: string; usage: string }[] = [
  { variant: "display", defaultAs: "h1", usage: "Largest — a single hero title per view" },
  { variant: "title-lg", defaultAs: "h1", usage: "Page titles" },
  { variant: "title", defaultAs: "h2", usage: "Section headings" },
  { variant: "title-sm", defaultAs: "h3", usage: "Sub-headings, card titles" },
  { variant: "title-xs", defaultAs: "h4", usage: "Dense panel and group titles" },
  { variant: "body", defaultAs: "p", usage: "Default body copy — the most common variant" },
  { variant: "label", defaultAs: "span", usage: "Field labels, table headers, emphasis" },
  { variant: "caption", defaultAs: "span", usage: "Secondary metadata, helper text" },
  { variant: "overline", defaultAs: "span", usage: "Nav section dividers, chart axis groups" },
];

export const Default: Story = {
  args: {
    variant: "body",
    children: "Sample run completed in 4 minutes 12 seconds.",
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
};

/**
 * The full scale in one view. Each row renders the variant at its default
 * element, alongside the token classes it maps to.
 */
export const Scale: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-6">
      {SCALE.map(({ variant, defaultAs, usage }) => (
        <div key={variant} className="space-y-1 border-b border-border pb-4 last:border-b-0">
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-1 py-0.5 text-xs">variant=&quot;{variant}&quot;</code>
            <Text variant="caption" state="muted">
              defaults to &lt;{defaultAs}&gt; — {usage}
            </Text>
          </div>
          <Text variant={variant}>The quick brown fox jumps over the lazy dog</Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * `as` and `variant` are independent. Here a visually large title is an `h2`
 * because the page already owns its `h1`, and an `h3` is rendered small.
 */
export const SemanticsIndependentOfScale: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-4">
      <Text as="h2" variant="title-lg" data-testid="big-h2">
        Run summary
      </Text>
      <Text as="h3" variant="caption" data-testid="small-h3">
        Instrument metadata
      </Text>
      <Text as="span" variant="title" data-testid="span-title">
        Not in the outline at all
      </Text>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("A large variant can render as h2, not h1", async () => {
      const heading = canvas.getByRole("heading", { level: 2, name: "Run summary" });
      expect(heading.tagName).toBe("H2");
      expect(heading).toHaveClass("text-2xl");
    });

    await step("A small variant still contributes its heading level", async () => {
      const heading = canvas.getByRole("heading", { level: 3, name: "Instrument metadata" });
      expect(heading.tagName).toBe("H3");
      expect(heading).toHaveClass("text-xs");
    });

    await step("A title-scaled span stays out of the document outline", async () => {
      const span = canvas.getByTestId("span-title");
      expect(span.tagName).toBe("SPAN");
      expect(canvas.queryByRole("heading", { name: "Not in the outline at all" })).toBeNull();
    });
  },
};

/**
 * The leading icon scales with the variant (`1em`) and is `aria-hidden`, so the
 * accessible name of a heading is its text alone.
 */
export const WithLeadingIcon: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-4">
      <Text as="h2" variant="title-lg" icon={FlaskConical}>
        Assay results
      </Text>
      <Text as="h3" variant="title-sm" icon={Beaker}>
        Sample preparation
      </Text>
      <Text variant="body" icon={Info} state="muted">
        Icon size derives from the type step, not a fixed pixel value
      </Text>
      <Text variant="caption" icon={CircleAlert} state="destructive">
        Two wells failed QC
      </Text>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Heading accessible name excludes the decorative icon", async () => {
      const heading = canvas.getByRole("heading", { level: 2 });
      expect(heading).toHaveAccessibleName("Assay results");
    });

    await step("Icon is hidden from assistive tech and sized in em", async () => {
      const heading = canvas.getByRole("heading", { level: 2 });
      const icon = heading.querySelector("svg");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveClass("size-[1em]");
    });

    await step("Icon renders before the text", async () => {
      const heading = canvas.getByRole("heading", { level: 2 });
      expect(heading.firstElementChild?.tagName.toLowerCase()).toBe("svg");
    });
  },
};

export const States: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-2">
      <Text variant="body">Default — inherits its colour from the container</Text>
      <Text variant="body" state="muted">
        Muted — subtitles, metadata, helper text
      </Text>
      <Text variant="body" state="active" icon={Info}>
        Active — the current selection, or a link-like emphasis
      </Text>
      <Text variant="body" state="positive" icon={CircleCheck}>
        Positive — a run that passed, a completed step
      </Text>
      <Text variant="body" state="warning" icon={TriangleAlert}>
        Warning — the caution slot: nearing a limit, needs review
      </Text>
      <Text variant="body" state="destructive" icon={CircleAlert}>
        Destructive — validation and failure messages
      </Text>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Each state maps to its semantic token, and default sets none", async () => {
      const expected: [RegExp, string | null][] = [
        [/^Default —/, null],
        [/^Muted —/, "text-muted-foreground"],
        [/^Active —/, "text-primary"],
        [/^Positive —/, "text-positive"],
        [/^Warning —/, "text-warning"],
        [/^Destructive —/, "text-destructive"],
      ];

      for (const [pattern, cls] of expected) {
        // `icon` wraps children in a span, so walk up to the `data-slot` root.
        const root = canvas.getByText(pattern).closest("[data-slot='text']");
        expect(root).not.toBeNull();
        if (cls === null) {
          expect(root!.className).not.toMatch(/\btext-(muted-foreground|primary|positive|warning|destructive)\b/);
        } else {
          expect(root).toHaveClass(cls);
        }
      }
    });
  },
};

/**
 * Truncation needs a bounded parent — `truncate` switches the root to a flex
 * box and shrinks the inner text node, but something has to cap the width.
 */
export const Truncation: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="max-w-md space-y-4 rounded-lg border border-border p-4">
      <Text as="h2" variant="title-sm" truncate icon={FlaskConical} data-testid="truncating-title">
        UPLC-MS peptide mapping — lot 4471-B qualification run, replicate 3
      </Text>
      <Text variant="caption" state="muted">
        The title truncates at the container edge; the leading icon is never clipped.
      </Text>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Truncating text wraps its children in a shrinkable node", async () => {
      const title = canvas.getByTestId("truncating-title");
      expect(title).toHaveClass("flex");
      const inner = title.querySelector("span");
      expect(inner).toHaveClass("truncate");
      expect(inner).toHaveClass("min-w-0");
    });

    await step("Text actually overflows its bounded container", async () => {
      const inner = canvas.getByTestId("truncating-title").querySelector("span");
      expect(inner).not.toBeNull();
      expect(inner!.scrollWidth).toBeGreaterThan(inner!.clientWidth);
    });
  },
};
