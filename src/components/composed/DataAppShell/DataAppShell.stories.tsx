import {
  ClipboardList,
  Download,
  Filter,
  Info,
  Layers,
  LayoutGrid,
  Library,
  LogOut,
  PanelRight,
  Search,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

import { DataAppShell } from "./DataAppShell";
import { DataAppShellRightPanel, DataAppShellRightPanelTrigger } from "./RightPanel";
import { DataAppShellSecondaryNav } from "./SecondaryNav";

import type { NavGroup } from "./DataAppShell";
import type { NavStep } from "./SecondaryNav";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// =============================================================================
// Story-local helpers
// =============================================================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ── User menu ────────────────────────────────────────────────────────────────

interface UserMenuButtonProps {
  /** User's full name */
  name: string;
  /** Role badge label (e.g. "ADMIN") */
  userRole?: string;
  /** Whether to show name + role beside the avatar (mobile/expanded nav) */
  expanded?: boolean;
}

/**
 * Example user menu for the DataAppShell `userMenu` slot.
 * Composes Avatar + DropdownMenu entirely at the story / consumer level.
 */
function UserMenuButton({ name, userRole, expanded = false }: UserMenuButtonProps) {
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {expanded ? (
          <button
            type="button"
            className="flex items-center gap-3 w-full px-1 py-1 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <Avatar size="sm" className="bg-primary shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-medium text-foreground truncate">{name}</span>
              {userRole && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{userRole}</span>
              )}
            </div>
          </button>
        ) : (
          <button type="button" className="cursor-pointer bg-transparent border-none p-0">
            <Avatar size="sm" className="bg-primary cursor-pointer hover:opacity-85 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground group-data-[size=sm]/avatar:text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="min-w-[180px]">
        {userRole && (
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {userRole}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Home")}>
          Home
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Load")}>
          Load Worksession
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Switch")}>
          Switch User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => console.log("Logout")}>
          <LogOut className="w-4 h-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof DataAppShell> = {
  title: "Design Patterns/Data App Shell",
  component: DataAppShell,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataAppShell>;

// =============================================================================
// Sample data (HTS Hit Finder scenario)
// =============================================================================

const htsNavGroups: NavGroup[] = [
  {
    pages: [
      { id: "project", label: "Project", icon: ClipboardList, isActive: true },
      { id: "explorer", label: "Explorer", icon: Search },
    ],
  },
];

const htsWorkflowSteps: NavStep[] = [
  { id: "data-overview", label: "Step 1 Name", icon: LayoutGrid },
  { id: "global-filtering", label: "Step 2 Name", icon: Filter },
  { id: "explore-clusters", label: "Step 3 Name", icon: Library },
  { id: "review-compound", label: "Step 4 Name", icon: Search },
  { id: "export-list", label: "Step 5 Name", icon: Download },
];

const htsBreadcrumbs = [
  { label: "All Projects", onClick: () => console.log("All Projects") },
  { label: "Project Name", onClick: () => console.log("Project Name") },
  { label: "worksession name" },
];

// =============================================================================
// ShellDemo — one configurable composition backing the variant stories below
// (mirrors the SW-2118 playground presets)
// =============================================================================

/** Menu-style secondary items — explicit statuses so no step semantics apply. */
const secondaryMenuSteps = (activeId: string): NavStep[] =>
  (
    [
      { id: "overview", label: "Overview", icon: LayoutGrid },
      { id: "datasets", label: "Datasets", icon: Layers },
      { id: "reports", label: "Reports", icon: Library },
    ] as const
  ).map((item) => ({ ...item, status: item.id === activeId ? "active" : "todo" }));

interface ShellDemoProps {
  /** Primary vertical nav presentation — a permanent icon `rail` or a
   *  collapsible `sidebar` (expanded ⇄ rail via its brand-row chevron). */
  primary?: "rail" | "sidebar";
  /** Shell nav axis. */
  navVariant?: "vertical" | "horizontal";
  /** Secondary nav zone content. */
  secondary?: "off" | "menu" | "workflow-vertical" | "workflow-horizontal";
  /** Right panel zone. */
  rightPanel?: "off" | "docked" | "overlay";
  /** Collapse hides the primary rail — one icon rail remains. */
  hideNavOnCollapse?: boolean;
  /** Zone visibility switches (pass false to hide a zone). */
  showNavRail?: boolean;
  showTopBar?: boolean;
  /** Auto-collapse media query passthrough (stories default to off for determinism). */
  autoCollapse?: string | false;
  initialPanelOpen?: boolean;
  /** Right panel trigger placement. */
  triggerPlacement?: "header" | "fab";
}

const ShellDemo = ({
  primary = "rail",
  navVariant = "vertical",
  secondary = "off",
  rightPanel = "off",
  hideNavOnCollapse = false,
  showNavRail = true,
  showTopBar = true,
  autoCollapse = false,
  initialPanelOpen = true,
  triggerPlacement = "header",
}: ShellDemoProps) => {
  const [activeStepId, setActiveStepId] = useState("data-overview");
  const [activeMenuId, setActiveMenuId] = useState("overview");
  const [wfCollapsed, setWfCollapsed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(initialPanelOpen);
  const detailsTriggerRef = React.useRef<HTMLButtonElement>(null);

  const activeStepIndex = htsWorkflowSteps.findIndex((s) => s.id === activeStepId);
  const isLastStep = activeStepIndex === htsWorkflowSteps.length - 1;
  const isWorkflow = secondary === "workflow-vertical" || secondary === "workflow-horizontal";

  // Horizontal workflow bar below the breadcrumbs: expanded → full stepper;
  // collapsed → the items fold into a compact step dropdown in the same bar.
  const horizontalStepNav = (
    <DataAppShellSecondaryNav
      aria-label="Workflow steps"
      orientation="horizontal"
      collapsible
      collapsed={wfCollapsed}
      onCollapsedChange={setWfCollapsed}
      steps={htsWorkflowSteps}
      activeKey={activeStepId}
      onSelect={setActiveStepId}
    />
  );

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={htsNavGroups}
      navVariant={navVariant}
      primaryNav={primary}
      hideNavOnCollapse={hideNavOnCollapse}
      showNavRail={showNavRail}
      showTopBar={showTopBar}
      autoCollapse={autoCollapse}
      onBackToPlatform={() => console.log("Back to TDP Platform")}
      userMenu={<UserMenuButton name="Emily Liu" userRole="ADMIN" />}
      breadcrumbs={htsBreadcrumbs}
      // Collapsing the horizontal workflow removes its bar and tucks the step
      // dropdown into the top bar's left group, right beside the breadcrumbs
      // (playground behavior).
      headerLeft={secondary === "workflow-horizontal" && wfCollapsed ? horizontalStepNav : undefined}
      secondaryBar={
        secondary === "workflow-horizontal" && !wfCollapsed ? (
          <div className="border-b border-border bg-card p-2">{horizontalStepNav}</div>
        ) : undefined
      }
      headerActions={
        <>
          {isWorkflow && (
            <Button
              size="sm"
              disabled={isLastStep}
              onClick={() => !isLastStep && setActiveStepId(htsWorkflowSteps[activeStepIndex + 1].id)}
              className="gap-1"
            >
              {isLastStep ? "Push to Downstream" : "Next"}
            </Button>
          )}
          {rightPanel !== "off" && triggerPlacement === "header" && (
            <DataAppShellRightPanelTrigger
              ref={detailsTriggerRef}
              variant="icon"
              aria-label="Toggle details panel"
              aria-expanded={detailsOpen}
              title="Toggle details panel"
              onClick={() => setDetailsOpen((o) => !o)}
            >
              <PanelRight />
            </DataAppShellRightPanelTrigger>
          )}
        </>
      }
      sidebarPanel={
        secondary === "menu" ? (
          <DataAppShellSecondaryNav
            aria-label="Secondary navigation"
            title="Secondary Nav"
            collapsible
            steps={secondaryMenuSteps(activeMenuId)}
            onSelect={setActiveMenuId}
          />
        ) : secondary === "workflow-vertical" ? (
          <DataAppShellSecondaryNav
            aria-label="Workflow steps"
            title="Workflow"
            collapsible
            steps={htsWorkflowSteps}
            activeKey={activeStepId}
            onSelect={setActiveStepId}
          />
        ) : undefined
      }
      rightPanel={
        rightPanel === "off" ? undefined : (
          <DataAppShellRightPanel
            id="hts-details"
            variant={rightPanel}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            title="Details"
            icon={<Info className="size-4 text-muted-foreground" />}
            showTrigger={triggerPlacement === "fab"}
            triggerRef={triggerPlacement === "header" ? detailsTriggerRef : undefined}
            triggerLabel="Open details panel"
          >
            {/* Example content only — the panel body is a plain slot (chat, history, inspector, …) */}
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-10 rounded-md bg-muted" />
              ))}
            </div>
          </DataAppShellRightPanel>
        )
      }
    >
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Main content area</p>
      </div>
    </DataAppShell>
  );
};

// =============================================================================
// Copyable composition snippets — surfaced in each story's Docs "Show code"
// block. The stories render through the shared ShellDemo helper (so the play
// tests can drive state); these snippets show the real DataAppShell
// composition a consumer would write, assuming local navGroups / breadcrumbs /
// step data and a <UserMenu /> in scope.
// =============================================================================

const DEFAULT_CODE = `<DataAppShell
  appName="HTS"
  appFullName="HTS Hit Finder"
  version="v2.4.1"
  primaryNav="sidebar"
  navGroups={navGroups}
  breadcrumbs={breadcrumbs}
  userMenu={<UserMenu />}
>
  {/* page content */}
</DataAppShell>`;

const WORKFLOW_VERTICAL_CODE = `<DataAppShell
  appName="HTS"
  navGroups={navGroups}
  breadcrumbs={breadcrumbs}
  userMenu={<UserMenu />}
  hideNavOnCollapse
  headerActions={<Button size="sm">Next</Button>}
  sidebarPanel={
    <DataAppShellSecondaryNav
      title="Workflow"
      collapsible
      steps={workflowSteps}
      activeKey={activeStep}
      onSelect={setActiveStep}
    />
  }
>
  {/* page content */}
</DataAppShell>`;

const WORKFLOW_HORIZONTAL_CODE = `const stepNav = (
  <DataAppShellSecondaryNav
    orientation="horizontal"
    collapsible
    collapsed={collapsed}
    onCollapsedChange={setCollapsed}
    steps={workflowSteps}
    activeKey={activeStep}
    onSelect={setActiveStep}
  />
);

<DataAppShell
  appName="HTS"
  navGroups={navGroups}
  breadcrumbs={breadcrumbs}
  userMenu={<UserMenu />}
  headerActions={<Button size="sm">Next</Button>}
  // collapsed → step dropdown beside the breadcrumbs; expanded → full stepper bar
  headerLeft={collapsed ? stepNav : undefined}
  secondaryBar={
    collapsed ? undefined : (
      <div className="border-b border-border bg-card p-2">{stepNav}</div>
    )
  }
>
  {/* page content */}
</DataAppShell>`;

const RIGHT_PANEL_CODE = `const triggerRef = React.useRef<HTMLButtonElement>(null);

<DataAppShell
  appName="HTS"
  navGroups={navGroups}
  breadcrumbs={breadcrumbs}
  userMenu={<UserMenu />}
  headerActions={
    <DataAppShellRightPanelTrigger
      ref={triggerRef}
      variant="icon"
      aria-label="Toggle details panel"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
    >
      <PanelRight />
    </DataAppShellRightPanelTrigger>
  }
  rightPanel={
    <DataAppShellRightPanel
      id="details"
      open={open}
      onOpenChange={setOpen}
      title="Details"
      showTrigger={false}
      triggerRef={triggerRef}
    >
      {/* panel content */}
    </DataAppShellRightPanel>
  }
>
  {/* page content */}
</DataAppShell>`;

/**
 * 1 · Default — a collapsible left sidebar and the top bar. The expanded
 * sidebar shows labelled nav with a collapse chevron in the brand row; the
 * chevron collapses it to an icon rail with an expand chevron under the logo.
 */
export const Default: Story = {
  name: "Default",
  render: () => <ShellDemo primary="sidebar" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Shell renders the expanded sidebar, top bar and content", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getAllByText("All Projects").length).toBeGreaterThan(0);
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
      expect(canvas.queryByRole("complementary", { name: "Details" })).not.toBeInTheDocument();
      // Expanded sidebar: labels are visible, not just aria names
      const sidebar = canvasElement.querySelector("[data-slot='data-app-sidebar']");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass("w-[220px]");
      expect(canvas.getByText("Project")).toBeVisible();
      expect(canvas.getByText("Explorer")).toBeVisible();
    });

    await step("The brand-row chevron collapses the sidebar to an icon rail", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Collapse navigation" }));
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      expect(rail).toBeInTheDocument();
      expect(rail).toHaveClass("w-12");
      // Labels drop to aria-only; the expand chevron sits under the logo
      expect(canvas.queryByText("Project")).not.toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Project" })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Expand navigation" })).toBeInTheDocument();
    });

    await step("The expand chevron restores the full sidebar", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand navigation" }));
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar']")).toBeInTheDocument();
      expect(canvas.getByText("Project")).toBeVisible();
    });

    await step("Version is shown inside the app dropdown under the title", async () => {
      await userEvent.click(canvas.getAllByText("HTS")[0]);
      await waitFor(() => expect(body.getByText("v2.4.1")).toBeInTheDocument());
      // Close via outside pointer-down — works even when the preview iframe
      // isn't the focused window (interactive Storybook UI), where synthetic
      // Escape key events don't reliably reach the menu.
      await userEvent.click(canvas.getByText("Main content area"));
      await waitFor(() => expect(body.queryByText("v2.4.1")).not.toBeInTheDocument());
    });
  },
  parameters: {
    docs: { source: { code: DEFAULT_CODE, language: "tsx" } },
    zephyr: { testCaseId: "" },
  },
};

/**
 * 2 · Secondary Navigation — a vertical secondary nav beside the primary rail
 * with `hideNavOnCollapse`: one toggle collapses the primary rail + secondary
 * together into a single icon rail (the secondary rail carries the expand
 * chevron).
 */
export const SecondaryNavigation: Story = {
  name: "Secondary Navigation",
  render: () => <ShellDemo secondary="workflow-vertical" hideNavOnCollapse />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Icon rail + vertical workflow render expanded", async () => {
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).toBeInTheDocument();
      expect(canvas.getByText("Workflow")).toBeInTheDocument();
      expect(canvas.getAllByText("Step 1 Name").length).toBeGreaterThan(0);
      expect(canvas.getByText("Next")).toBeInTheDocument();
    });

    await step("The collapse toggle lives only in the secondary nav — none on the rail", async () => {
      expect(canvas.queryByRole("button", { name: "Collapse navigation" })).not.toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
    });

    await step("Selecting a step advances status derivation", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Step 2 Name/ }));
      expect(canvas.getByRole("button", { name: /Step 2 Name/ })).toHaveAttribute(
        "data-status",
        "active",
      );
    });

    await step("One toggle collapses nav + workflow into a single icon rail", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Collapse" }));
      // hideNavOnCollapse — the primary rail is gone entirely
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).not.toBeInTheDocument();
      // The collapsed workflow rail is the single remaining rail
      expect(
        canvasElement.querySelector("[data-slot='data-app-shell-secondary-nav'][data-collapsed='true']"),
      ).toBeInTheDocument();
      expect(canvas.queryByText("Step 2 Name")).not.toBeInTheDocument();
    });

    await step("The rail's expand chevron restores both zones", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).toBeInTheDocument();
      expect(canvas.getByText("Workflow")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: { source: { code: WORKFLOW_VERTICAL_CODE, language: "tsx" } },
  },
};

/**
 * 3 · Secondary Navigation - Horizontal — the secondary nav as a stepper bar
 * between the top bar and the content. Collapsing tucks the steps into a
 * compact step dropdown beside the breadcrumbs (reflowing the bar away).
 */
export const SecondaryNavigationHorizontal: Story = {
  name: "Secondary Navigation - Horizontal",
  render: () => <ShellDemo secondary="workflow-horizontal" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Horizontal stepper bar renders under the top bar", async () => {
      const nav = canvasElement.querySelector(
        "[data-slot='data-app-shell-secondary-nav'][data-orientation='horizontal']",
      );
      expect(nav).toBeInTheDocument();
      expect(canvas.getByText("Step 3 Name")).toBeVisible();
    });

    await step("Collapsing removes the bar and tucks a step dropdown next to the breadcrumbs", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Collapse steps" }));
      expect(canvas.queryByText("Step 3 Name")).not.toBeInTheDocument();
      // The compact step nav lives in the top bar's LEFT group, after the crumbs
      const topBarLeft = canvasElement.querySelector("[data-slot='top-bar-left']") as HTMLElement;
      const select = within(topBarLeft).getByRole("combobox", { name: "Current step" });
      expect(select).toBeVisible();
      expect(select).toHaveTextContent("Step 1 · Step 1 Name");
      // …positioned after the breadcrumb trail in the reading order
      const crumbs = within(topBarLeft).getByText("All Projects");
      expect(crumbs.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    await step("The dropdown changes the active step", async () => {
      await userEvent.click(canvas.getByRole("combobox", { name: "Current step" }));
      await userEvent.click(await body.findByRole("option", { name: "Step 3 · Step 3 Name" }));
      await waitFor(() =>
        expect(canvas.getByRole("combobox", { name: "Current step" })).toHaveTextContent(
          "Step 3 · Step 3 Name",
        ),
      );
    });

    await step("Expanding restores the stepper bar with the selected step active", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Show steps" }));
      const active = canvas.getByRole("button", { name: /Step 3 Name/ });
      expect(active).toHaveAttribute("data-status", "active");
    });
  },
  parameters: {
    docs: { source: { code: WORKFLOW_HORIZONTAL_CODE, language: "tsx" } },
  },
};

/**
 * 4 · With Right Panel — the Default composition plus the docked, resizable
 * Details panel and its top-bar icon trigger.
 */
export const WithRightPanel: Story = {
  name: "With Right Panel",
  loaders: [
    () => {
      // Deterministic panel width — drop anything persisted by a previous run.
      window.localStorage.removeItem("ts-ui.right-panel.hts-details.width");
    },
  ],
  render: () => <ShellDemo rightPanel="docked" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Right panel is docked beside the content", async () => {
      const panel = await canvas.findByRole("complementary", { name: "Details" });
      // waitFor — the panel's fade-in entry animation starts at opacity 0
      await waitFor(() => expect(panel).toBeVisible());
      expect(panel.style.width).toBe("320px");
    });

    await step("Drag handle resizes the panel and persists width per id", async () => {
      const panel = canvas.getByRole("complementary", { name: "Details" });
      const handle = canvas.getByRole("separator", { name: "Resize panel" });
      fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 600 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 520 });
      expect(panel.style.width).toBe("400px");
      fireEvent.pointerUp(handle, { pointerId: 1, clientX: 520 });
      expect(window.localStorage.getItem("ts-ui.right-panel.hts-details.width")).toBe("400");
    });

    await step("Handle is a keyboard-operable ARIA separator", async () => {
      const panel = canvas.getByRole("complementary", { name: "Details" });
      const handle = canvas.getByRole("separator", { name: "Resize panel" });
      handle.focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(handle).toHaveAttribute("aria-valuenow", "416");
      await userEvent.keyboard("{End}");
      expect(panel.style.width).toBe("560px");
      await userEvent.keyboard("{Home}");
      expect(panel.style.width).toBe("240px");
    });

    await step("Close returns focus to the top-bar trigger; the trigger re-opens the panel", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Close panel" }));
      expect(canvas.queryByRole("complementary", { name: "Details" })).not.toBeInTheDocument();
      const trigger = canvas.getByRole("button", { name: "Toggle details panel" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      await waitFor(() => expect(trigger).toHaveFocus());
      await userEvent.click(trigger);
      const panel = await canvas.findByRole("complementary", { name: "Details" });
      await waitFor(() => expect(panel).toBeVisible());
      await waitFor(() => expect(canvas.getByRole("button", { name: "Close panel" })).toHaveFocus());
    });

    await step("Esc inside the docked panel closes it; re-open via the trigger", async () => {
      await userEvent.keyboard("{Escape}");
      expect(canvas.queryByRole("complementary", { name: "Details" })).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: "Toggle details panel" }));
      const panel = await canvas.findByRole("complementary", { name: "Details" });
      await waitFor(() => expect(panel).toBeVisible());
    });
  },
  parameters: {
    docs: { source: { code: RIGHT_PANEL_CODE, language: "tsx" } },
  },
};
