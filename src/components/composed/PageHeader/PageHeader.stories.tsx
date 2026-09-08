import { FlaskConical, MoreHorizontal } from "lucide-react";
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

/**
 * Default — a page's own title row at its simplest: just the title, which is a
 * real heading whose level you choose with `as`. Add an optional subtitle
 * beneath it (always a `p`) and an optional `trailing` slot for actions, which
 * renders as a sibling of the heading rather than inside it.
 *
 * Reach for it for the title of the page content you own. Do **not** reach for
 * it in these cases:
 *
 * - **Component-internal titles keep their own styling.** `CardTitle`,
 *   `EmptyState`'s title, `DataAppShell`'s sidebar and panel headings, and
 *   `AppShellSimple`'s top-bar breadcrumb are owned by those components;
 *   replacing their scale here would give the kit two sources of truth for one
 *   set of pixels.
 * - **Full-width chrome is the shell's job.** `PageHeader` sits inside the page
 *   content and is not a title bar — which is why it is not called `TitleBar`.
 * - **A title-scaled node that is not a heading** is a `Text` with `as="span"`.
 *   `PageHeader`'s title is always a heading by construction.
 * - **Multi-line titles** are out of scope: there is no line-clamp prop. A clamp
 *   would need `Text` to grow a `lines` prop, and "baseline-aligned with the
 *   title" stops being well-defined once a title wraps. Long titles truncate;
 *   pass `truncate={false}` if you would rather they wrap.
 */
export const Default: Story = {
  args: {
    title: "Peptide mapping",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5668" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Title is an h1 by default", async () => {
      const heading = canvas.getByRole("heading", { level: 1, name: "Peptide mapping" });
      expect(heading.tagName).toBe("H1");
    });

    await step("With no subtitle, no paragraph is rendered", async () => {
      expect(canvasElement.querySelector('[data-slot="page-header-subtitle"]')).toBeNull();
      expect(canvasElement.querySelector('[data-slot="page-header-trailing"]')).toBeNull();
    });
  },
};

/**
 * Title + subtitle. The subtitle is composed from a second `Text` call at
 * `body`/`muted` and renders as a `p` — never a heading tag, because a subtitle
 * inside an `h1` reads to a screen reader as a section that does not exist.
 *
 * The vertical rhythm (`space-y-0.5`) lives on the component so consumers stop
 * hand-tuning margins.
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
    zephyr: { testCaseId: "SW-T5669" },
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
 * The same row also carries the two layout rules that depend on that structure,
 * shown here in a bounded container so both engage: the title truncates rather
 * than pushing the actions out, and the actions sit on the title's baseline
 * rather than centred against the title+subtitle block — which is what happens
 * if all three go in one flex container. The play function measures both
 * numerically.
 */
export const WithTrailingAction: Story = {
  args: {
    as: "h2",
    variant: "title",
    title: "UPLC-MS peptide mapping — lot 4471-B qualification run, replicate 3 of 3",
    subtitle: "Actions are siblings of the h2; the title gives up space, they never do.",
    trailing: (
      <>
        <Badge variant="positive">Passed</Badge>
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
  decorators: [
    (Story) => (
      <div className="max-w-2xl rounded-lg border border-border p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    zephyr: { testCaseId: "SW-T5670" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2 });
    const button = canvas.getByRole("button", { name: "Configure" });
    const root = canvasElement.querySelector('[data-slot="page-header"]') as HTMLElement;
    const row = canvasElement.querySelector('[data-slot="page-header-row"]') as HTMLElement;
    const trailing = canvasElement.querySelector('[data-slot="page-header-trailing"]') as HTMLElement;

    await step("Interactive trailing content is a sibling of the heading", async () => {
      expect(heading.contains(button)).toBe(false);
      expect(button.parentElement?.parentElement).toBe(heading.parentElement);

      const trigger = canvas.getByRole("button", { name: "More actions" });
      expect(heading.contains(trigger)).toBe(false);
    });

    await step("Heading's accessible name is its text alone", async () => {
      expect(heading).toHaveAccessibleName("UPLC-MS peptide mapping — lot 4471-B qualification run, replicate 3 of 3");
      // The badge lives in `trailing`, so it stays out of the name. Put a badge
      // in `title` instead and it joins the name — both are legitimate; pick
      // whichever reads correctly when announced.
      expect(heading.contains(canvas.getByText("Passed"))).toBe(false);
    });

    await step("Trailing slot is pinned right and does not shrink", async () => {
      // Assert the *used* layout, not the declaration: `margin-left: auto`
      // computes to a resolved pixel value, so checking for the string "auto"
      // would pass only by accident.
      const rowRect = row.getBoundingClientRect();
      const trailingRect = trailing.getBoundingClientRect();
      expect(Math.abs(trailingRect.right - rowRect.right)).toBeLessThan(1);
      expect(getComputedStyle(trailing).flexShrink).toBe("0");
    });

    await step("Title truncates; trailing content keeps its full width", async () => {
      const inner = heading.querySelector("span");
      expect(inner).not.toBeNull();
      expect(inner).toHaveClass("truncate");
      expect(inner!.scrollWidth).toBeGreaterThan(inner!.clientWidth);

      // scrollWidth === clientWidth means nothing overflowed, i.e. these never
      // gave up space to the title.
      expect(button.scrollWidth).toBe(button.clientWidth);
      const badge = canvas.getByText("Passed");
      expect(badge.scrollWidth).toBe(badge.clientWidth);
    });

    await step("Trailing is baseline-aligned with the title, not centred on the block", async () => {
      expect(getComputedStyle(row).alignItems).toBe("baseline");

      // The subtitle sits outside the row, so it cannot influence alignment.
      const subtitle = canvas.getByText(/they never do/);
      expect(row.contains(subtitle)).toBe(false);
      expect(root.contains(subtitle)).toBe(true);

      const mid = (r: DOMRect) => r.top + r.height / 2;
      const titleMid = mid(heading.getBoundingClientRect());
      const blockMid = mid(root.getBoundingClientRect());
      const buttonMid = mid(button.getBoundingClientRect());

      // Guard: the subtitle makes the block meaningfully taller than the title,
      // so these midpoints are genuinely distinguishable — otherwise the
      // comparison below would prove nothing.
      expect(Math.abs(titleMid - blockMid)).toBeGreaterThan(4);
      expect(Math.abs(buttonMid - titleMid)).toBeLessThan(Math.abs(buttonMid - blockMid));

      // Measure the text, not the boxes: the button has padding and a border,
      // so its box bottom is not its baseline. A Range over the text node gives
      // the line box, whose bottom is baseline + descender — and the descender
      // difference between text-sm and text-xl is the only slack here.
      const textBottom = (node: Node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().bottom;
      };
      expect(Math.abs(textBottom(heading.querySelector("span")!) - textBottom(button))).toBeLessThan(5);
    });
  },
};

/**
 * `as` and `variant` are independent, and `as` is **never** inferred from the
 * visual size — unlike `Text`, which picks a default element per variant,
 * `PageHeader` always defaults to `h1` regardless of scale. Set `as` to what the
 * document outline actually needs; set `variant` to the size you want.
 */
export const HeadingLevel: Story = {
  name: "Heading level",
  parameters: {
    zephyr: { testCaseId: "SW-T5671" },
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
      // `display` defaults to h1 on `Text`; here it is an h2 purely because
      // `as` said so.
      expect(canvas.queryByRole("heading", { level: 1 })).toBeNull();
    });
  },
};

/**
 * The full title scale a page header supports. `body`, `label`, `caption` and
 * `overline` are deliberately not offered — those are `Text` variants for copy,
 * not titles.
 */
export const Scale: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5672" },
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
