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
import * as React from "react";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { AppShellSimple, type AppShellSimpleCrumb, type AppShellSimpleNavState } from "./AppShellSimple";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { AssistantLayout, AssistantLayoutProvider } from "@/components/composed/AssistantLayout";
import { type NavGroup } from "@/components/composed/DataAppShell";
import { Button } from "@/components/ui/button";
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
  args: { onNavChange: fn() },
  play: async ({ args, canvasElement, step }) => {
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

    await step("a move with no press on the handle does not resize", async () => {
      drag("pointermove", 4, 1);
      await settle();
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      expect(args.onNavChange).not.toHaveBeenCalled();
    });

    await step("dragging the border left past the rail hides the nav", async () => {
      drag("pointerdown", 220, 1);
      await settle();
      drag("pointermove", 100, 1);
      await settle();
      drag("pointermove", 4, 1);
      await settle();
      // Further moves inside the same snap zone are not new changes.
      drag("pointermove", 2, 1);
      await settle();
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
      expect(args.onNavChange).toHaveBeenCalledTimes(2);
      expect(args.onNavChange).toHaveBeenNthCalledWith(1, "rail");
      expect(args.onNavChange).toHaveBeenNthCalledWith(2, "hidden");
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

    await step("losing the button mid-drag clears the resize instead of snapping", async () => {
      // Press to start a drag (resizing = true), then a move whose `buttons`
      // reports no button held — the OS silently dropped the capture. The
      // handle's guard must bail out rather than snap to x=200 (sidebar).
      drag("pointerdown", 60, 1);
      await settle();
      drag("pointermove", 200, 0);
      await settle();
      expect(shell).toHaveAttribute("data-nav-state", "rail");
      expect(shell).not.toHaveClass("cursor-col-resize");
    });

    // The browser ends a drag without a `pointerup` when it cancels the
    // pointer (touch scroll, a modal) or the capture is taken away. Both must
    // clear `resizing`, or the next pressed move would still snap the nav.
    for (const interrupt of ["pointercancel", "lostpointercapture"]) {
      await step(`${interrupt} ends the drag`, async () => {
        drag("pointerdown", 60, 1);
        await settle();
        expect(shell).toHaveClass("cursor-col-resize");
        drag(interrupt, 60, 0);
        await settle();
        expect(shell).not.toHaveClass("cursor-col-resize");
        drag("pointermove", 200, 1);
        await settle();
        expect(shell).toHaveAttribute("data-nav-state", "rail");
      });
    }
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5673" },
  },
};

/**
 * The nav border is a keyboard-operable splitter: arrows step one state,
 * `Home` opens to labels and `End` hides the nav.
 */
export const ResizeWithKeyboard: Story = {
  args: { onNavChange: fn() },
  play: async ({ args, canvasElement, step }) => {
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

    await step("keys that can't widen past labels change nothing", async () => {
      await userEvent.keyboard("{ArrowRight}{Home}");
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      expect(args.onNavChange).not.toHaveBeenCalled();
    });

    await step("keys the splitter doesn't handle keep their default action", async () => {
      // fireEvent returns false when a handler called preventDefault.
      expect(fireEvent.keyDown(handle, { key: "ArrowUp" })).toBe(true);
      expect(fireEvent.keyDown(handle, { key: "PageDown" })).toBe(true);
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      // Handled keys do block it (no page scroll), even when clamped.
      expect(fireEvent.keyDown(handle, { key: "Home" })).toBe(false);
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

    await step("onNavChange fires once per actual change, never for clamped keys", async () => {
      await userEvent.keyboard("{ArrowLeft}{End}");
      expect(args.onNavChange).toHaveBeenCalledTimes(5);
      expect(args.onNavChange).toHaveBeenNthCalledWith(4, "sidebar");
      expect(args.onNavChange).toHaveBeenLastCalledWith("hidden");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5674" },
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

const NAV_STATES: AppShellSimpleNavState[] = ["sidebar", "rail", "hidden"];
// Unlabelled first group only — keeps the pre-existing section-label contrast
// finding (see BreadcrumbNavigation) out of this story.
const CONTROLLED_NAV: NavGroup[] = [NAV_GROUPS[0]];

/**
 * Controlled: the parent owns `nav` and applies each `onNavChange`. The shell
 * renders only what it is passed, so the parent can also move the nav itself
 * (here, from the buttons in the content) — the toggle then picks up from the
 * new state rather than where its own ping-pong left off.
 */
export const Controlled: Story = {
  render: function ControlledShell() {
    const [nav, setNav] = React.useState<AppShellSimpleNavState>("sidebar");
    return (
      <AppShellSimple navGroups={CONTROLLED_NAV} breadcrumbs={BREADCRUMBS} nav={nav} onNavChange={setNav}>
        <div className="space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            Parent state: <code data-testid="parent-nav">{nav}</code>
          </p>
          <div className="flex gap-2">
            {NAV_STATES.map((state) => (
              <Button key={state} size="sm" variant="outline" onClick={() => setNav(state)}>
                Set {state}
              </Button>
            ))}
          </div>
        </div>
      </AppShellSimple>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    const toggle = canvasElement.querySelector('[data-slot="app-shell-simple-nav-toggle"]');
    if (!(shell instanceof HTMLElement) || !(toggle instanceof HTMLElement)) {
      throw new Error("shell or nav toggle not found");
    }
    const parentNav = canvas.getByTestId("parent-nav");

    await step("the toggle reports each change and the parent's state drives the shell", async () => {
      await userEvent.click(toggle);
      expect(parentNav).toHaveTextContent("rail");
      expect(shell).toHaveAttribute("data-nav-state", "rail");
      await userEvent.click(toggle);
      expect(parentNav).toHaveTextContent("hidden");
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });

    await step("a parent-driven move resets the toggle's direction", async () => {
      // Arriving at rail by the toggle from hidden, the next click would
      // expand to labels; arriving by the parent, it continues to hidden.
      await userEvent.click(canvas.getByRole("button", { name: "Set rail" }));
      expect(shell).toHaveAttribute("data-nav-state", "rail");
      expect(toggle).toHaveAttribute("aria-label", "Hide navigation");
    });

    await step("the parent can restore the sidebar directly", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set sidebar" }));
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      expect(toggle).toHaveAttribute("aria-label", "Collapse navigation to icons");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5746" },
  },
};

const onCrumbClick = fn();

/**
 * Breadcrumb crumbs support three forms: a link (`href`), a button (`onClick`
 * with no `href`), and plain static text (neither). A crumb with both is a
 * link — `href` wins. The last crumb is always the current page, even if it
 * has an `href`.
 */
export const BreadcrumbNavigation: Story = {
  args: {
    // A single unlabelled nav group — this story is about the breadcrumb forms,
    // and a labelled group header would pull in an unrelated pre-existing
    // low-contrast a11y finding on the shared nav's section label.
    navGroups: [
      {
        pages: [
          { id: "overview", label: "Overview", icon: LayoutDashboard, isActive: true },
          { id: "datasets", label: "Datasets", icon: Database },
        ],
      },
    ],
    breadcrumbs: [
      { label: "Home", onClick: onCrumbClick },
      { label: "Projects", href: "#projects", onClick: onCrumbClick },
      { label: "Section" },
      { label: "Run 4821 overview", href: "#run-4821" },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("an onClick crumb renders as a button and fires its handler", async () => {
      const home = canvas.getByRole("button", { name: "Home" });
      await userEvent.click(home);
      expect(onCrumbClick).toHaveBeenCalled();
    });

    await step("a crumb with no href/onClick renders as static text", async () => {
      expect(canvas.queryByRole("link", { name: "Section" })).toBeNull();
      expect(canvas.queryByRole("button", { name: "Section" })).toBeNull();
      expect(canvas.getByText("Section")).toBeInTheDocument();
    });

    await step("a crumb with both href and onClick renders as a link", async () => {
      expect(canvas.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects");
      expect(canvas.queryByRole("button", { name: "Projects" })).toBeNull();
    });

    await step("the last crumb is the current page, not a link", async () => {
      const current = canvasElement.querySelector('[aria-current="page"]');
      expect(current).toHaveTextContent("Run 4821 overview");
      // BreadcrumbPage is `role="link" aria-disabled` by design, so check that
      // the crumb's own href never made it onto a real anchor.
      expect(canvasElement.querySelector('a[href="#run-4821"]')).toBeNull();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5675" },
  },
};

// An unlabelled nav group keeps the pre-existing section-label contrast finding
// (see BreadcrumbNavigation) out of these footer stories.
const BUILD_INFO_NAV: NavGroup[] = [
  {
    pages: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, isActive: true },
      { id: "datasets", label: "Datasets", icon: Database },
    ],
  },
];

/**
 * Pass `version` and/or `commitSha` and the shell renders a build-info footer
 * below the content (SW-2383). With short content it stays pinned to the bottom.
 */
export const WithBuildInfo: Story = {
  args: { navGroups: BUILD_INFO_NAV, version: "1.4.2", commitSha: "3f9c2a1" },
  play: async ({ canvasElement, step }) => {
    const main = canvasElement.querySelector('[data-slot="app-shell-simple-content"]');
    const footer = canvasElement.querySelector('[data-slot="build-info-footer"]');
    if (!(main instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
      throw new Error("content or footer not found");
    }

    await step("the footer shows the version and commit SHA", async () => {
      expect(footer).toHaveTextContent("v1.4.2");
      expect(footer).toHaveTextContent("3f9c2a1");
    });

    await step("with short content the footer is pinned to the bottom", async () => {
      const gap = main.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom;
      expect(Math.abs(gap)).toBeLessThanOrEqual(1);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5724" },
  },
};

/** With content taller than the viewport, the footer follows the content. */
export const WithBuildInfoLongContent: Story = {
  args: {
    navGroups: BUILD_INFO_NAV,
    version: "1.4.2",
    commitSha: "3f9c2a1",
    children: (
      <div className="space-y-3 p-6">
        {Array.from({ length: 40 }, (_, i) => (
          <button
            key={i}
            type="button"
            className="block w-full rounded-md bg-muted/60 px-3 py-2 text-left text-sm"
          >
            Sample {i + 1}
          </button>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const main = canvasElement.querySelector('[data-slot="app-shell-simple-content"]');
    const footer = canvasElement.querySelector('[data-slot="build-info-footer"]');
    if (!(main instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
      throw new Error("content or footer not found");
    }

    await step("the footer sits below the fold, after the content", async () => {
      expect(footer.getBoundingClientRect().top).toBeGreaterThan(main.getBoundingClientRect().bottom);
    });

    await step("scrolling to the end brings the footer into view", async () => {
      main.scrollTop = main.scrollHeight;
      const gap = main.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom;
      expect(Math.abs(gap)).toBeLessThanOrEqual(1);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5725" },
  },
};

const TRANSCRIPT = Array.from({ length: 40 }, (_, i) => `Message ${i + 1}`);

/** Asserts a full-height page stays inside the shell with the footer below it. */
async function expectBoundedPage(canvasElement: HTMLElement, step: (name: string, fn: () => Promise<void>) => Promise<void>) {
  const main = canvasElement.querySelector('[data-slot="app-shell-simple-content"]');
  const footer = canvasElement.querySelector('[data-slot="build-info-footer"]');
  const composer = canvasElement.querySelector('[data-testid="composer"]');
  const transcript = within(canvasElement).getByRole("group", { name: "Transcript" });
  if (!(main instanceof HTMLElement) || !(footer instanceof HTMLElement) || !(composer instanceof HTMLElement)) {
    throw new Error("content, footer or composer not found");
  }

  await step("the page fills the content area instead of growing", async () => {
    expect(main.scrollHeight).toBeLessThanOrEqual(main.clientHeight + 1);
  });

  await step("the composer stays on screen, above the footer", async () => {
    expect(composer.getBoundingClientRect().bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top + 1);
    const gap = main.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom;
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  });

  await step("the transcript scrolls internally", async () => {
    expect(transcript.scrollHeight).toBeGreaterThan(transcript.clientHeight);
  });
}

/**
 * A page that fills the viewport and scrolls internally marks its root with
 * `data-ts-shell-fill`, so the build-info footer doesn't push it taller (UXT-271).
 */
export const WithBuildInfoFullHeightPage: Story = {
  args: {
    navGroups: BUILD_INFO_NAV,
    version: "1.4.2",
    commitSha: "3f9c2a1",
    children: (
      <div data-ts-shell-fill className="flex h-full flex-col">
        <div role="group" aria-label="Transcript" tabIndex={0} className="min-h-0 flex-1 space-y-2 overflow-auto p-6">
          {TRANSCRIPT.map((message) => (
            <p key={message} className="rounded-md bg-muted/60 px-3 py-2 text-sm">
              {message}
            </p>
          ))}
        </div>
        <div data-testid="composer" className="shrink-0 border-t p-3 text-sm text-muted-foreground">
          Ask a question…
        </div>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => expectBoundedPage(canvasElement, step),
};

/** `AssistantLayout` fills the shell with no marker — it's detected by its `data-slot`. */
export const WithBuildInfoAssistantLayout: Story = {
  args: {
    navGroups: BUILD_INFO_NAV,
    version: "1.4.2",
    commitSha: "3f9c2a1",
    children: (
      <AssistantLayoutProvider persist={false}>
        <AssistantLayout
          assistantTitle="AI Assistant"
          assistant={
            <div className="flex h-full min-h-0 flex-col">
              <div role="group" aria-label="Transcript" tabIndex={0} className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
                {TRANSCRIPT.map((message) => (
                  <p key={message} className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                    {message}
                  </p>
                ))}
              </div>
              <div data-testid="composer" className="shrink-0 border-t p-3 text-sm text-muted-foreground">
                Ask a question…
              </div>
            </div>
          }
        >
          <div className="p-6 text-sm text-muted-foreground">Main content</div>
        </AssistantLayout>
      </AssistantLayoutProvider>
    ),
  },
  play: async ({ canvasElement, step }) => expectBoundedPage(canvasElement, step),
};
