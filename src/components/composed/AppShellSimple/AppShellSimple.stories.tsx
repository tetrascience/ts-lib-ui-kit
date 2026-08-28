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

import {
  AppShellSimple,
  type AppShellSimpleCrumb,
  type AppShellSimpleNavState,
} from "./AppShellSimple";

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

function AppShellSimpleDemo({ defaultNav = "sidebar" }: { defaultNav?: AppShellSimpleNavState }) {
  return (
    <AppShellSimple navGroups={NAV_GROUPS} breadcrumbs={BREADCRUMBS} defaultNav={defaultNav}>
      <SampleContent />
    </AppShellSimple>
  );
}

// -- Stories ------------------------------------------------------------------

const meta = {
  title: "Design Patterns/App Shell - Simple",
  component: AppShellSimpleDemo,
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
} satisfies Meta<typeof AppShellSimpleDemo>;

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

    await step("ping-pongs back to the icon rail (does not wrap to sidebar)", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
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

/** Nav hidden — only the top bar. Next toggle click restores the sidebar. */
export const Hidden: Story = {
  args: { defaultNav: "hidden" },
  parameters: {
    zephyr: { testCaseId: "SW-T5646" },
  },
};
