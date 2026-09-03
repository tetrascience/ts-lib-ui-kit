/**
 * AppShellSimple (SW-2410) — Data App Shell stripped to two zones: a full-width
 * top bar (with the side-nav toggle + breadcrumb name) and a three-state side
 * nav. The toggle ping-pongs the nav (labels ↔ icons ↔ hidden); the nav's right
 * border can also be dragged to snap between the same three states.
 */
import {
  Database,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Settings,
  Table2,
} from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

import { AppShellSimple, type AppShellSimpleCrumb } from "./AppShellSimple";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { type NavGroup } from "@/components/composed/DataAppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



// -- Sample data for the demo -------------------------------------------------

const NAV_GROUPS: NavGroup[] = [
  {
    pages: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, isActive: true },
      { id: "datasets", label: "Datasets", icon: Database, badge: 12 },
      { id: "analysis", label: "Analysis", icon: LineChart },
      { id: "results", label: "Results", icon: Table2 },
    ],
  },
  {
    label: "Workspace",
    pages: [
      { id: "assays", label: "Assays", icon: FlaskConical },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const BREADCRUMBS: AppShellSimpleCrumb[] = [
  { label: "Application name", href: "#" },
  { label: "Overview", href: "#" },
  { label: "Run 4821 overview" },
];

function SampleContent() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Run 4821 overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The control in the top-left ping-pongs the nav (labels ↔ icons ↔ hidden), or drag the
          nav&rsquo;s right border to snap between them.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Samples", value: "384" },
          { title: "Passing QC", value: "97.4%" },
          { title: "Flagged", value: "6" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content area</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The body zone fills the remaining space beside the side nav and scrolls independently.
        </CardContent>
      </Card>
    </div>
  );
}

// -- Stories ------------------------------------------------------------------

const meta = {
  title: "Design Patterns/App Shell - Simple",
  component: AppShellSimple,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
  args: {
    navGroups: NAV_GROUPS,
    breadcrumbs: BREADCRUMBS,
    children: <SampleContent />,
  },
} satisfies Meta<typeof AppShellSimple>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sidebar with labels. Clicking the toggle cycles: labels → icons → hidden. */
export const Sidebar: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    const toggle = canvasElement.querySelector('[data-slot="app-shell-simple-nav-toggle"]');
    if (!(shell instanceof HTMLElement) || !(toggle instanceof HTMLElement)) {
      throw new Error("shell or nav toggle not found");
    }

    await step("starts in the labelled sidebar", async () => {
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      expect(canvas.getByRole("button", { name: "Overview" })).toBeVisible();
    });

    await step("toggle collapses to the icon rail", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });

    await step("toggle hides the nav entirely", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });

    await step("the hidden nav collapses to zero width and goes inert", async () => {
      const zone = canvasElement.querySelector('[data-slot="app-shell-simple-nav"]');
      const content = canvasElement.querySelector('[data-slot="app-shell-simple-nav-content"]');
      if (!(zone instanceof HTMLElement) || !(content instanceof HTMLElement)) {
        throw new Error("nav zone not found");
      }
      // Read the committed style, not the rect — the width is mid-transition.
      expect(zone.style.width).toBe("0px");
      expect(content.inert).toBe(true);
    });

    await step("ping-pongs back to the icon rail (does not wrap to sidebar)", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });

    await step("the toggle announces the transition, not just the destination", async () => {
      // At `rail` travelling backwards, the next click expands to labels.
      expect(toggle).toHaveAttribute("aria-label", "Expand navigation to labels");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5644" },
  },
};

/** Icon-only rail (48px). Next toggle click hides the nav. */
export const IconRail: Story = {
  args: { defaultNav: "rail" },
  parameters: {
    zephyr: { testCaseId: "SW-T5645" },
  },
};

/**
 * Nav hidden — only the top bar. The ping-pong does not wrap, so the next
 * toggle click restores the **icon rail**, and a further click the sidebar.
 * The drag handle stays on the left edge, so the nav can also be dragged open.
 */
export const Hidden: Story = {
  args: { defaultNav: "hidden" },
  play: async ({ canvasElement, step }) => {
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    const toggle = canvasElement.querySelector('[data-slot="app-shell-simple-nav-toggle"]');
    if (!(shell instanceof HTMLElement) || !(toggle instanceof HTMLElement)) {
      throw new Error("shell or nav toggle not found");
    }

    await step("the toggle offers to expand, not collapse", async () => {
      expect(toggle).toHaveAttribute("aria-label", "Expand navigation to icons");
    });

    await step("the drag handle stays reachable while hidden", async () => {
      expect(
        within(canvasElement).getByRole("separator", { name: "Resize navigation" })
      ).toBeInTheDocument();
    });

    await step("next click restores the icon rail", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5646" },
  },
};

/**
 * Dragging the border past the rail hides the nav. The nav zone stays mounted
 * at zero width, so the drag handle survives the release: without it the
 * captured pointer was destroyed mid-drag, `pointerup` never arrived, and the
 * shell stayed stuck in resize mode — a later plain hover would resize the nav.
 */
export const DragToResize: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    if (!(shell instanceof HTMLElement)) {
      throw new Error("shell not found");
    }
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    // Raw pointer events: user-event's pointer API does not model pointer
    // capture, which is the whole point of this regression.
    const drag = (type: string, clientX: number, buttons: number) =>
      handle.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          clientX,
          clientY: 200,
          buttons,
        })
      );
    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

    await step("dragging the border left past the rail hides the nav", async () => {
      drag("pointerdown", 220, 1);
      await settle();
      drag("pointermove", 100, 1);
      await settle();
      drag("pointermove", 4, 1);
      await settle();
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });

    await step("the handle survives the hidden state, so the release lands", async () => {
      expect(canvas.getByRole("separator", { name: "Resize navigation" })).toBeInTheDocument();
      drag("pointerup", 4, 0);
      await settle();
      expect(shell).not.toHaveClass("cursor-col-resize");
    });

    await step("a plain hover over the handle no longer resizes the nav", async () => {
      handle.focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(shell).toHaveAttribute("data-nav-state", "rail");
      // x=200 is past the sidebar snap threshold — a stale `resizing` would
      // widen the nav on hover alone.
      drag("pointermove", 200, 0);
      await settle();
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
};

/**
 * The nav border is a keyboard-operable splitter: arrows step one state,
 * `Home` opens to labels and `End` hides the nav.
 */
export const ResizeWithKeyboard: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    if (!(shell instanceof HTMLElement)) {
      throw new Error("shell not found");
    }
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });

    await step("the splitter is focusable", async () => {
      handle.focus();
      expect(handle).toHaveFocus();
    });

    await step("ArrowLeft narrows to the icon rail", async () => {
      await userEvent.keyboard("{ArrowLeft}");
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });

    await step("ArrowLeft again hides the nav, and clamps there", async () => {
      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });

    await step("ArrowRight widens back to the icon rail", async () => {
      await userEvent.keyboard("{ArrowRight}");
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });

    await step("Home opens to labels, End hides", async () => {
      await userEvent.keyboard("{Home}");
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      await userEvent.keyboard("{End}");
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
};

/**
 * `showNav={false}` — the app opts out of a side nav entirely. No nav zone and
 * no top-bar toggle; the body fills the full width. Unlike the runtime `hidden`
 * state, there's nothing for the user to toggle back open.
 */
export const NoSideNav: Story = {
  args: { showNav: false },
  play: async ({ canvasElement, step }) => {
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    if (!(shell instanceof HTMLElement)) {
      throw new Error("shell not found");
    }

    await step("no side nav zone is rendered", async () => {
      expect(canvasElement.querySelector('[data-slot="app-shell-simple-nav"]')).toBeNull();
    });

    await step("no top-bar nav toggle is rendered", async () => {
      expect(
        canvasElement.querySelector('[data-slot="app-shell-simple-nav-toggle"]')
      ).toBeNull();
    });

    await step("the breadcrumb name still shows in the top bar", async () => {
      // Scope to the breadcrumb's current-page crumb — the content <h1> repeats
      // the same text, and with the nav gone this is the only aria-current node.
      const crumb = canvasElement.querySelector('[aria-current="page"]');
      expect(crumb).toHaveTextContent("Run 4821 overview");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5650" },
  },
};
