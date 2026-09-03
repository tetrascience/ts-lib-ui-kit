import { Beaker, CircleAlert, FlaskConical, Info } from "lucide-react";
import { expect, within } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
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
    tone: {
      control: "inline-radio",
      options: ["default", "muted", "destructive"],
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
            <Text variant="caption" tone="muted">
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
 * The same scale in both themes side by side, so muted tones and heading
 * contrast can be compared without toggling the toolbar.
 */
export const BothThemes: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
  render: () => {
    const panel = (
      <div className="flex-1 space-y-4 bg-background p-8 text-foreground">
        {SCALE.map(({ variant }) => (
          <div key={variant} className="space-y-0.5">
            <Text variant={variant}>Chromatography run summary</Text>
            {/* `as="p"` so the subtitle blocks onto its own line even under the
                variants that default to an inline `span`. */}
            <Text as="p" variant="caption" tone="muted">
              Subtitle at caption / muted — the kit&apos;s most common contrast failure
            </Text>
          </div>
        ))}
      </div>
    );

    return (
      <div className="flex min-h-screen">
        {panel}
        <div className="dark flex flex-1">{panel}</div>
      </div>
    );
  },
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
      <Text variant="body" icon={Info} tone="muted">
        Icon size derives from the type step, not a fixed pixel value
      </Text>
      <Text variant="caption" icon={CircleAlert} tone="destructive">
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

export const Tones: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-2">
      <Text variant="body">Default — inherits its colour from the container</Text>
      <Text variant="body" tone="muted">
        Muted — subtitles, metadata, helper text
      </Text>
      <Text variant="body" tone="destructive">
        Destructive — validation and failure messages
      </Text>
    </div>
  ),
};

/**
 * Truncation needs a bounded parent. The title truncates; anything trailing is
 * marked `shrink-0` so it never gives up space.
 */
export const Truncation: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="max-w-md space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-baseline gap-2">
        <Text as="h2" variant="title-sm" truncate icon={FlaskConical} data-testid="truncating-title">
          UPLC-MS peptide mapping — lot 4471-B qualification run, replicate 3
        </Text>
        <Badge variant="positive" className="shrink-0">
          Passed
        </Badge>
      </div>
      <Text variant="caption" tone="muted">
        The title truncates; the badge keeps its width.
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

/**
 * Title + subtitle is a **composition**, not a slot — two `Text` calls with a
 * documented rhythm. The subtitle renders as a `p`, never a heading tag: a
 * subtitle inside an `h3` reads to a screen reader as a section that does not
 * exist.
 */
export const TitleWithSubtitle: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-0.5">
      <Text as="h2" variant="title" icon={FlaskConical}>
        Peptide mapping
      </Text>
      <Text as="p" variant="body" tone="muted">
        14 samples across 3 plates · last run 12 minutes ago
      </Text>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Only the title is a heading", async () => {
      expect(canvas.getAllByRole("heading")).toHaveLength(1);
      expect(canvas.getByRole("heading", { level: 2 })).toHaveAccessibleName("Peptide mapping");
    });

    await step("Subtitle is a paragraph, not a heading", async () => {
      const subtitle = canvas.getByText(/14 samples across 3 plates/);
      expect(subtitle.tagName).toBe("P");
    });
  },
};

/**
 * **Interactive trailing content must sit outside the heading element.** A
 * button nested inside an `h2` is announced as part of the heading. Keep it a
 * sibling, as below.
 *
 * A non-interactive badge *may* sit inside the heading — but then it joins the
 * accessible name, so only do it when that reads correctly.
 */
export const TrailingContent: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="max-w-xl space-y-6">
      <div className="flex items-baseline gap-2">
        <Text as="h2" variant="title" truncate>
          Interactive trailing content lives outside the heading
        </Text>
        <Button size="sm" variant="outline" className="shrink-0">
          Configure
        </Button>
      </div>

      <div>
        <Text as="h2" variant="title">
          Batch 4471{" "}
          <Badge variant="info" className="align-middle">
            Draft
          </Badge>
        </Text>
        <Text variant="caption" tone="muted">
          Non-interactive badge inside the heading — it joins the accessible name.
        </Text>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Button is a sibling of the heading, not a descendant", async () => {
      const heading = canvas.getByRole("heading", {
        name: "Interactive trailing content lives outside the heading",
      });
      const button = canvas.getByRole("button", { name: "Configure" });
      expect(heading.contains(button)).toBe(false);
      expect(heading).toHaveAccessibleName("Interactive trailing content lives outside the heading");
    });

    await step("Non-interactive badge inside a heading joins its accessible name", async () => {
      expect(canvas.getByRole("heading", { name: "Batch 4471 Draft" })).toBeInTheDocument();
    });
  },
};

/**
 * When *not* to reach for `Text`: text that belongs to a component keeps that
 * component's own styling. `CardTitle`, `DataAppShell`'s app name, and
 * `EmptyState`'s title are component-internal — retrofitting `Text` onto them
 * would create a second source of truth for the same pixels.
 */
export const WhenNotToUse: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="max-w-xl space-y-3">
      <Text as="h2" variant="title-sm">
        Use `Text` for page and section copy you own
      </Text>
      <Text variant="body" tone="muted">
        Do not retrofit it onto component-internal text — card titles, shell chrome, empty-state copy, table headers.
        Those components already own their scale, and replacing it there gives the kit two sources of truth for one set
        of pixels.
      </Text>
      <Text variant="body" tone="muted">
        Do not use `as` to pick a size. Pick the `variant` for the size you want, then set `as` to whatever the document
        outline actually needs.
      </Text>
    </div>
  ),
};
