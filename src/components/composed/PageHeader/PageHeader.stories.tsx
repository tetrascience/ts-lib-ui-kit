import { Beaker, FlaskConical, MoreHorizontal } from "lucide-react";
import { expect, within } from "storybook/test";

import { PageHeader } from "./PageHeader";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const meta: Meta<typeof PageHeader> = {
  title: "Design Patterns/Page Header",
  component: PageHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      description: "Heading level for the title — never inferred from `variant`.",
    },
    variant: {
      control: "select",
      options: ["display", "title-lg", "title", "title-sm", "title-xs"],
      description: "Visual scale of the title. Independent of `as`.",
    },
    truncate: {
      control: "boolean",
      description: "Truncate a long title to one line so `trailing` is never pushed out of the row.",
    },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Peptide mapping",
    subtitle: "14 samples across 3 plates · last run 12 minutes ago",
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
};

/**
 * Title + subtitle. The subtitle is composed from a second `Text` call at
 * `body`/`muted` and renders as a `p` — never a heading tag, because a subtitle
 * inside an `h1` reads to a screen reader as a section that does not exist.
 *
 * The vertical rhythm (`space-y-0.5`) lives on the component so consumers stop
 * hand-tuning margins.
 *
 * Folded in from `Text`'s `TitleWithSubtitle` story, which was the spec for this
 * behaviour before `PageHeader` existed.
 */
export const WithSubtitle: Story = {
  args: {
    as: "h2",
    variant: "title",
    icon: FlaskConical,
    title: "Peptide mapping",
    subtitle: "14 samples across 3 plates · last run 12 minutes ago",
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Only the title is a heading", async () => {
      expect(canvas.getAllByRole("heading")).toHaveLength(1);
      expect(canvas.getByRole("heading", { level: 2 })).toHaveAccessibleName("Peptide mapping");
    });

    await step("Subtitle is a paragraph, not a heading", async () => {
      const subtitle = canvas.getByText(/14 samples across 3 plates/);
      expect(subtitle.tagName).toBe("P");
      expect(canvas.queryByRole("heading", { name: /14 samples/ })).toBeNull();
    });

    await step("Decorative icon stays out of the heading's accessible name", async () => {
      const heading = canvas.getByRole("heading", { level: 2 });
      const icon = heading.querySelector("svg");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(heading).toHaveAccessibleName("Peptide mapping");
    });
  },
};

/**
 * **The rule this component exists to enforce.** Interactive trailing content
 * renders as a *sibling* of the heading element, never a descendant — a button
 * or menu trigger nested inside an `h2` is announced as part of the heading.
 *
 * Folded in from `Text`'s `TrailingContent` story.
 */
export const WithTrailingAction: Story = {
  args: {
    as: "h2",
    variant: "title",
    title: "Interactive trailing content lives outside the heading",
    subtitle: "The button below is a sibling of the h2, not a child of it.",
    trailing: (
      <>
        <Button size="sm" variant="outline">
          Configure
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    ),
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2 });

    await step("Button is a sibling of the heading, not a descendant", async () => {
      const button = canvas.getByRole("button", { name: "Configure" });
      expect(heading.contains(button)).toBe(false);
      expect(button.parentElement?.parentElement).toBe(heading.parentElement);
    });

    await step("Menu trigger is also outside the heading", async () => {
      const trigger = canvas.getByRole("button", { name: "More actions" });
      expect(heading.contains(trigger)).toBe(false);
    });

    await step("Heading's accessible name is its text alone", async () => {
      expect(heading).toHaveAccessibleName("Interactive trailing content lives outside the heading");
    });

    await step("Trailing slot is pinned right and does not shrink", async () => {
      const row = canvasElement.querySelector('[data-slot="page-header-row"]') as HTMLElement;
      const trailing = canvasElement.querySelector('[data-slot="page-header-trailing"]') as HTMLElement;
      expect(trailing).not.toBeNull();

      // Assert the *used* layout, not the declaration: `margin-left: auto`
      // computes to a resolved pixel value, so checking for the string "auto"
      // would pass only by accident. Flush to the row's right edge is the
      // behaviour that actually matters.
      const rowRect = row.getBoundingClientRect();
      const trailingRect = trailing.getBoundingClientRect();
      expect(Math.abs(trailingRect.right - rowRect.right)).toBeLessThan(1);

      // And the title, not the trailing slot, is the item that gives up space.
      expect(getComputedStyle(trailing).flexShrink).toBe("0");
      expect(trailingRect.left).toBeGreaterThan(rowRect.left);
    });
  },
};

/**
 * A long title truncates; the trailing element keeps its full width. The title
 * is the flex item that gives up space (`min-w-0` + `Text`'s `truncate`), which
 * is the only arrangement where a pinned-right action can never be pushed out
 * of the row.
 */
export const TruncatingTitle: Story = {
  args: {
    as: "h2",
    variant: "title",
    icon: Beaker,
    title: "UPLC-MS peptide mapping — lot 4471-B qualification run, replicate 3 of 3, operator J. Okafor",
    subtitle: "The title truncates; the badge and button keep their width.",
    trailing: (
      <>
        <Badge variant="positive">Passed</Badge>
        <Button size="sm" variant="outline">
          Configure
        </Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl rounded-lg border border-border p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2 });

    await step("Title text overflows and is clipped to one line", async () => {
      const inner = heading.querySelector("span");
      expect(inner).not.toBeNull();
      expect(inner).toHaveClass("truncate");
      expect(inner!.scrollWidth).toBeGreaterThan(inner!.clientWidth);
    });

    await step("Trailing content is not clipped — it keeps its full width", async () => {
      const button = canvas.getByRole("button", { name: "Configure" });
      const badge = canvas.getByText("Passed");
      // scrollWidth === clientWidth means nothing overflowed, i.e. it never
      // gave up space to the title.
      expect(button.scrollWidth).toBe(button.clientWidth);
      expect(badge.scrollWidth).toBe(badge.clientWidth);
    });

    await step("Trailing stays inside the row, not pushed out of it", async () => {
      const row = canvasElement.querySelector('[data-slot="page-header-row"]') as HTMLElement;
      const button = canvas.getByRole("button", { name: "Configure" });
      const rowRect = row.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      expect(buttonRect.right).toBeLessThanOrEqual(Math.ceil(rowRect.right));
    });
  },
};

/**
 * Trailing content is baseline-aligned with the **title**, not vertically
 * centred against the title+subtitle block. This works because the subtitle
 * renders *outside* the title row — put all three in one flex container and the
 * trailing element drifts toward the middle of the block.
 *
 * The play function measures this numerically rather than trusting the eye.
 */
export const BaselineAlignment: Story = {
  args: {
    as: "h2",
    variant: "title-lg",
    title: "Run 4821 overview",
    subtitle: "Started 09:14 · completed 09:31 · 17 minutes elapsed",
    trailing: (
      <Button size="sm" variant="outline">
        Configure
      </Button>
    ),
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2 });
    const button = canvas.getByRole("button", { name: "Configure" });
    const root = canvasElement.querySelector('[data-slot="page-header"]') as HTMLElement;
    const row = canvasElement.querySelector('[data-slot="page-header-row"]') as HTMLElement;

    await step("The row aligns its items on the baseline", async () => {
      expect(getComputedStyle(row).alignItems).toBe("baseline");
    });

    await step("Subtitle is outside the title row, so it cannot affect alignment", async () => {
      const subtitle = canvas.getByText(/17 minutes elapsed/);
      expect(row.contains(subtitle)).toBe(false);
      expect(root.contains(subtitle)).toBe(true);
    });

    await step("Trailing tracks the title's centre, not the whole block's", async () => {
      const headingRect = heading.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const buttonMid = buttonRect.top + buttonRect.height / 2;
      const titleMid = headingRect.top + headingRect.height / 2;
      const blockMid = rootRect.top + rootRect.height / 2;

      // The subtitle makes the block meaningfully taller than the title, so
      // these two midpoints are genuinely distinguishable — otherwise this
      // assertion would prove nothing.
      expect(Math.abs(titleMid - blockMid)).toBeGreaterThan(4);
      expect(Math.abs(buttonMid - titleMid)).toBeLessThan(Math.abs(buttonMid - blockMid));
    });

    await step("Button's text baseline sits within a few px of the title's", async () => {
      // Measure the text itself, not the boxes: the button has padding and a
      // border, so its box bottom is not its baseline. A Range over the text
      // node gives the line box, whose bottom is baseline + descender — and the
      // descender difference between text-sm and text-2xl is the only slack
      // here, hence the 5px tolerance rather than an exact match.
      const measureTextBottom = (node: Node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().bottom;
      };

      const titleTextBottom = measureTextBottom(heading.querySelector("span") ?? heading);
      const buttonTextBottom = measureTextBottom(button);

      expect(Math.abs(titleTextBottom - buttonTextBottom)).toBeLessThan(5);
    });
  },
};

/**
 * `as` and `variant` are independent, and `as` is **never** inferred from the
 * visual size — unlike `Text`, which picks a default element per variant,
 * `PageHeader` always defaults to `h1` regardless of scale. Set `as` to what the
 * document outline needs; set `variant` to the size you want.
 */
export const HeadingLevelIsCallerControlled: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-8">
      <PageHeader
        as="h2"
        variant="display"
        title="display scale, h2"
        subtitle="The page already owns its h1 — a shell breadcrumb, for instance."
      />
      <PageHeader as="h3" variant="title-xs" title="title-xs scale, h3" subtitle="Small type, still a real heading." />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("A display-scaled title can be an h2", async () => {
      const heading = canvas.getByRole("heading", { level: 2, name: "display scale, h2" });
      expect(heading.tagName).toBe("H2");
      expect(heading).toHaveClass("text-3xl");
    });

    await step("A small-scaled title still contributes its heading level", async () => {
      const heading = canvas.getByRole("heading", { level: 3, name: "title-xs scale, h3" });
      expect(heading.tagName).toBe("H3");
      expect(heading).toHaveClass("text-base");
    });

    await step("Neither level was inferred from the scale", async () => {
      // display defaults to h1 on `Text`; here it is an h2 purely because `as`
      // said so.
      expect(canvas.queryByRole("heading", { level: 1 })).toBeNull();
    });
  },
};

/**
 * Where to put a status chip decides whether it joins the heading's accessible
 * name. In `title` it does; in `trailing` it does not. Both are legitimate —
 * pick the one that reads correctly when announced.
 */
export const BadgePlacementAndAccessibleName: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-8">
      <PageHeader
        as="h2"
        variant="title"
        title={
          <>
            Batch 4471 <Badge variant="info">Draft</Badge>
          </>
        }
        subtitle="Badge in `title` — it joins the accessible name."
      />
      <PageHeader
        as="h2"
        variant="title"
        title="Batch 4472"
        subtitle="Badge in `trailing` — it stays out of the accessible name."
        trailing={<Badge variant="positive">Complete</Badge>}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("A badge inside the title joins the heading's accessible name", async () => {
      expect(canvas.getByRole("heading", { name: "Batch 4471 Draft" })).toBeInTheDocument();
    });

    await step("A badge in the trailing slot does not", async () => {
      const heading = canvas.getByRole("heading", { name: "Batch 4472" });
      expect(heading).toHaveAccessibleName("Batch 4472");
      expect(heading.contains(canvas.getByText("Complete"))).toBe(false);
    });
  },
};

/**
 * Both themes side by side, so the muted subtitle's contrast can be compared
 * without toggling the toolbar. The subtitle uses the existing
 * `--muted-foreground` token, which is defined for both `:root` and `.dark`.
 */
export const BothThemes: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
  render: () => {
    const panel = (
      <div className="flex-1 space-y-8 bg-background p-8 text-foreground">
        <PageHeader
          as="h2"
          variant="title-lg"
          icon={FlaskConical}
          title="Run 4821 overview"
          subtitle="Started 09:14 · completed 09:31 · 17 minutes elapsed"
          trailing={
            <Button size="sm" variant="outline">
              Configure
            </Button>
          }
        />
        <PageHeader as="h2" variant="title" title="Section without a subtitle" />
        <PageHeader
          as="h2"
          variant="title-sm"
          title="Dense panel title"
          subtitle="Muted subtitle at the smallest title scale — the kit's most common contrast failure."
          trailing={<Badge variant="warning">Review</Badge>}
        />
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
 * The full title scale a page header supports. `body`, `label`, `caption` and
 * `overline` are deliberately not offered — those are `Text` variants for copy,
 * not titles.
 */
export const Scale: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="space-y-8">
      {(["display", "title-lg", "title", "title-sm", "title-xs"] as const).map((variant) => (
        <div key={variant} className="space-y-2 border-b border-border pb-6 last:border-b-0">
          <code className="rounded bg-muted px-1 py-0.5 text-xs">variant=&quot;{variant}&quot;</code>
          <PageHeader
            as="h2"
            variant={variant}
            title="Chromatography run summary"
            subtitle="14 samples across 3 plates · last run 12 minutes ago"
            trailing={
              <Button size="sm" variant="outline">
                Configure
              </Button>
            }
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * When *not* to reach for `PageHeader`.
 *
 * - **Component-internal titles keep their own styling.** `CardTitle`,
 *   `EmptyState`'s title, `DataAppShell`'s sidebar and panel headings
 *   (`text-sm font-semibold` chrome) and `AppShellSimple`'s top-bar breadcrumb
 *   are owned by those components. Retrofitting `PageHeader` onto them gives the
 *   kit two sources of truth for one set of pixels.
 * - **Full-width chrome is the shell's job.** `PageHeader` sits *inside* the
 *   page content; it is not a title bar. That is why it is not called
 *   `TitleBar`.
 * - **A title-scaled node that is not a heading** is a `Text` with
 *   `as="span"`, not a `PageHeader` — `PageHeader`'s title is always a heading
 *   by construction.
 * - **Multi-line titles** are out of scope today: there is no line-clamp prop.
 *   A clamp would need `Text` to grow a `lines` prop, and "baseline-aligned with
 *   the title" stops being well-defined once the title has more than one line.
 *   Long titles truncate; set `truncate={false}` if you would rather they wrap.
 */
export const WhenNotToUse: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: () => (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        as="h2"
        variant="title-sm"
        title="Use PageHeader for the page's own title row"
        subtitle="Title, optional subtitle, optional actions — inside the page content, not as full-width chrome."
      />
      <PageHeader
        as="h2"
        variant="title-sm"
        title="Wrapping instead of truncating"
        subtitle="With truncate={false} a long title wraps, and trailing aligns to the first line's baseline."
        truncate={false}
        trailing={
          <Button size="sm" variant="outline">
            Configure
          </Button>
        }
      />
    </div>
  ),
};
