import {
  ClipboardList,
  Download,
  Filter,
  FolderKanban,
  Info,
  Layers,
  LayoutGrid,
  Library,
  LogOut,
  PanelRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

import { AppHeaderMenu, DataAppShell } from "./DataAppShell";
import { DataAppShellPrimaryNav } from "./PrimaryNav";
import { DataAppShellRightPanel, DataAppShellRightPanelTrigger } from "./RightPanel";
import { DataAppShellSecondaryNav } from "./SecondaryNav";

import type { NavGroup } from "./DataAppShell";
import type { NavStep } from "./SecondaryNav";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TdpNavigationProvider } from "@/components/composed/tdp-link";
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
          <div className="border-b border-border bg-card px-4 py-2">{horizontalStepNav}</div>
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

/**
 * 1 · Default — just the left icon rail and the top bar.
 */
export const Default: Story = {
  name: "Default",
  render: () => <ShellDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Shell renders icon rail, top bar and content — no secondary or right panel", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Project" })).toBeInTheDocument();
      expect(canvas.getAllByText("All Projects").length).toBeGreaterThan(0);
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
      expect(canvas.queryByRole("complementary", { name: "Details" })).not.toBeInTheDocument();
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).toBeInTheDocument();
    });

    await step("Icon rail is compact — labels via aria, no collapse chevron", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      expect(rail).toHaveClass("w-12");
      // Labels are exposed as accessible names, not visible text
      expect(canvas.queryByText("Project")).not.toBeInTheDocument();
      expect(canvas.queryByRole("button", { name: "Collapse navigation" })).not.toBeInTheDocument();
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
    zephyr: { testCaseId: "" },
  },
};

/**
 * 2 · Secondary Nav with Sidebar — permanent icon rail for the primary nav
 * plus a menu-style secondary sidebar. Collapsing hides the primary rail too
 * (`hideNavOnCollapse`), leaving one icon rail — matching the playground's
 * "Hide primary rail" collapse mode.
 */
export const SecondaryNavSidebar: Story = {
  name: "Secondary Nav · Sidebar",
  render: () => <ShellDemo secondary="menu" hideNavOnCollapse />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Primary is a permanent icon rail; secondary sidebar shows menu items", async () => {
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).toBeInTheDocument();
      // Permanent rail — no expand chevron on the primary nav
      expect(canvas.queryByRole("button", { name: "Expand navigation" })).not.toBeInTheDocument();
      expect(canvas.getByText("Secondary Nav")).toBeInTheDocument();
      expect(canvas.getByText("Overview")).toBeVisible();
      expect(canvas.getByText("Datasets")).toBeVisible();
    });

    await step("Menu items select without step semantics", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Datasets/ }));
      expect(canvas.getByRole("button", { name: /Datasets/ })).toHaveAttribute("data-status", "active");
    });

    await step("Collapsing the secondary also hides the primary rail — one icon rail remains", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Collapse" }));
      expect(canvas.queryByText("Secondary Nav")).not.toBeInTheDocument();
      const nav = canvasElement.querySelector(
        "[data-slot='data-app-shell-secondary-nav'][data-collapsed='true']",
      );
      expect(nav).toBeInTheDocument();
      // hideNavOnCollapse — the primary rail leaves with it
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).not.toBeInTheDocument();
    });

    await step("The rail's expand chevron restores both zones", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
      expect(canvas.getByText("Secondary Nav")).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")).toBeInTheDocument();
    });
  },
};

/**
 * 3 · Workflow · Vertical — vertical stepper beside the sidebar with
 * `hideNavOnCollapse`: one toggle collapses nav + workflow together into a
 * single icon rail (the workflow rail carries the expand chevron).
 */
export const WorkflowVertical: Story = {
  name: "Workflow · Vertical",
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
};

/**
 * 4 · Workflow · Horizontal — stepper bar between the top bar and the content.
 * Collapsing tucks the steps into a compact step dropdown beside the
 * breadcrumbs (reflowing the bar away).
 */
export const WorkflowHorizontal: Story = {
  name: "Workflow · Horizontal",
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
};

/**
 * 5 · With Right Panel — the Default composition plus the docked, resizable
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
};

/**
 * 6 · Customizable — every shell zone and behavior exposed as Storybook
 * controls (like the `ui/sidebar` story): flip the nav axis, hide zones,
 * toggle collapse behaviors, and switch the secondary/right-panel content.
 */
export const Customizable: StoryObj<typeof ShellDemo> = {
  name: "Customizable",
  render: (args) => <ShellDemo {...args} />,
  args: {
    navVariant: "vertical",
    secondary: "workflow-vertical",
    rightPanel: "off",
    hideNavOnCollapse: false,
    showNavRail: true,
    showTopBar: true,
    triggerPlacement: "header",
  },
  argTypes: {
    navVariant: { control: "select", options: ["vertical", "horizontal"] },
    secondary: {
      control: "select",
      options: ["off", "menu", "workflow-vertical", "workflow-horizontal"],
    },
    rightPanel: { control: "select", options: ["off", "docked", "overlay"] },
    hideNavOnCollapse: { control: "boolean" },
    showNavRail: { control: "boolean" },
    showTopBar: { control: "boolean" },
    triggerPlacement: { control: "select", options: ["header", "fab"] },
    autoCollapse: { control: false },
    initialPanelOpen: { control: false },
  },
};

/**
 * Hidden test story — the right panel's `overlay` variant (scrim, no reflow)
 * with the FAB trigger.
 */
export const RightPanelOverlay: Story = {
  name: "Right Panel Overlay",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => <ShellDemo rightPanel="overlay" initialPanelOpen={false} triggerPlacement="fab" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Overlay panel slides over the content with a scrim (no reflow)", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open details panel" }));
      const overlayPanel = await body.findByRole("dialog", { name: "Details" });
      // waitFor — the sheet's slide/fade entry animation starts at opacity 0
      await waitFor(() => expect(overlayPanel).toBeVisible());
      expect(document.querySelector('[data-slot="sheet-overlay"]')).not.toBeNull();
      expect(canvas.queryByRole("complementary", { name: "Details" })).not.toBeInTheDocument();
    });

    await step("Esc closes the overlay and returns focus to the FAB", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByRole("dialog", { name: "Details" })).not.toBeInTheDocument());
      await waitFor(() => expect(canvas.getByRole("button", { name: "Open details panel" })).toHaveFocus());
    });
  },
};

// =============================================================================
// Non-workflow page
// =============================================================================

export const NonWorkflowPage: Story = {
  name: "Non-Workflow Page",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={htsNavGroups}
      userMenu={<UserMenuButton name="Emily Liu" userRole="ADMIN" />}
      breadcrumbs={[{ label: "All Projects" }]}
    >
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4">All Projects</h1>
        <p className="text-muted-foreground">Select a project to start a workflow.</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("No workflow panel or next button", async () => {
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
      expect(canvas.queryByText("Next")).not.toBeInTheDocument();
      expect(canvas.getAllByText("All Projects").length).toBeGreaterThan(0);
    });

    await step("Version shown inside the app dropdown under the title", async () => {
      await userEvent.click(canvas.getByText("HTS"));
      const body = within(document.body);
      await waitFor(() => expect(body.getByText("v2.4.1")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4667" },
  },
};

// =============================================================================
// Interactive (state-driven)
// =============================================================================

const InteractiveShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStepId, setActiveStepId] = useState("data-overview");
  const [activePageId, setActivePageId] = useState("project");

  const navGroups: NavGroup[] = [
    {
      pages: htsNavGroups[0].pages.map((p) => ({
        ...p,
        isActive: p.id === activePageId,
        onClick: () => setActivePageId(p.id),
      })),
    },
  ];

  const activeStep = htsWorkflowSteps.find((s) => s.id === activeStepId);
  const isProjectPage = activePageId === "project";

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={navGroups}
      userMenu={<UserMenuButton name="Emily Liu" userRole="ADMIN" />}
      breadcrumbs={[
        { label: "All Projects", onClick: () => setActivePageId("explorer") },
        { label: "Project Name" },
        { label: "worksession name" },
      ]}
      headerActions={
        isProjectPage && (
          <>
            <Button size="sm">Next</Button>
          </>
        )
      }
      sidebarPanel={
        isProjectPage ? (
          <DataAppShellSecondaryNav
            aria-label="Workflow steps"
            title="Workflow"
            collapsible
            steps={htsWorkflowSteps}
            activeKey={activeStepId}
            onSelect={setActiveStepId}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          />
        ) : undefined
      }
    >
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-2">{activeStep?.label ?? "Select a step"}</h1>
        <p className="text-sm text-muted-foreground">
          Active page: <strong>{activePageId}</strong> | Active step: <strong>{activeStepId}</strong> | Collapsed:{" "}
          <strong>{collapsed ? "yes" : "no"}</strong>
        </p>
      </div>
    </DataAppShell>
  );
};

export const Interactive: Story = {
  name: "Interactive",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => <InteractiveShell />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Interactive shell renders", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getAllByText("Step 1 Name").length).toBeGreaterThan(0);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4668" },
  },
};

// =============================================================================
// App dropdown interaction
// =============================================================================

export const AppDropdownInteraction: Story = {
  name: "App Dropdown Interaction",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={htsNavGroups}
      onAppNameClick={() => console.log("App name clicked")}
      onBackToPlatform={() => console.log("Back to platform")}
    >
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Content area</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("App icon shows app name abbreviation", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
    });

    await step("Clicking the app icon opens the dropdown", async () => {
      // The icon button contains the appName text
      await userEvent.click(canvas.getAllByText("HTS")[0]);
      // Dropdown renders in portal — check document.body
      await waitFor(() => {
        expect(body.getByText("HTS Hit Finder")).toBeInTheDocument();
      });
      expect(body.getByText("Back to TDP Platform")).toBeInTheDocument();
    });

    await step("Dropdown closes after pressing Escape", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => {
        expect(body.queryByText("Back to TDP Platform")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4669" },
  },
};

// =============================================================================
// Breadcrumb variants
// =============================================================================

export const BreadcrumbVariants: Story = {
  name: "Breadcrumb Variants",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="APP"
      navGroups={[{ pages: [{ id: "home", label: "Home", icon: ClipboardList }] }]}
      breadcrumbs={[
        { label: "Linked", href: "#" }, // renders as <a>
        { label: "Clickable", onClick: () => console.log("clicked") }, // renders as <button>
        { label: "Static" }, // no action → <span>
        { label: "Current Page" }, // last item → BreadcrumbPage
      ]}
    >
      <div className="p-6">
        <p>Content</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Breadcrumb with href renders as a link", async () => {
      const link = canvas.getByRole("link", { name: "Linked" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "#");
    });

    await step("Breadcrumb with onClick renders as a button", async () => {
      expect(canvas.getByRole("button", { name: "Clickable" })).toBeInTheDocument();
    });

    await step("Breadcrumb without href or onClick renders as static text", async () => {
      const el = canvas.getByText("Static");
      expect(el.tagName.toLowerCase()).toBe("span");
      expect(el).not.toHaveAttribute("href");
    });

    await step("Last breadcrumb renders as the current page indicator", async () => {
      const page = canvasElement.querySelector("[data-slot='breadcrumb-page']");
      expect(page).toBeInTheDocument();
      expect(page?.textContent).toBe("Current Page");
    });

    await step("Slash separators appear between items", async () => {
      const separators = canvasElement.querySelectorAll("[data-slot='breadcrumb-separator']");
      // 4 items → 3 separators
      expect(separators.length).toBe(3);
      separators.forEach((s) => expect(s.textContent).toBe("/"));
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4670" },
  },
};

// =============================================================================
// Help button visibility
// =============================================================================

// =============================================================================
// Workflow panel collapse / expand + step interaction
// =============================================================================

const WorkflowInteractionShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStepId, setActiveStepId] = useState("step-a");

  const steps: NavStep[] = [
    { id: "step-a", label: "Step Alpha", icon: LayoutGrid },
    { id: "step-b", label: "Step Beta", icon: Filter },
    { id: "step-c", label: "Disabled", icon: Search, disabled: true, disabledReason: "Requires upstream data" },
  ];

  return (
    <DataAppShell
      appName="T"
      navGroups={[{ pages: [{ id: "p1", label: "Project", icon: ClipboardList }] }]}
      sidebarPanel={
        <DataAppShellSecondaryNav
          aria-label="Workflow steps"
          title="Workflow"
          collapsible
          steps={steps}
          activeKey={activeStepId}
          onSelect={setActiveStepId}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      }
    >
      <div className="p-6">
        <p data-testid="active-step">Active: {activeStepId}</p>
        <p data-testid="collapsed-state">Collapsed: {String(collapsed)}</p>
      </div>
    </DataAppShell>
  );
};

export const WorkflowPanelInteractions: Story = {
  name: "Workflow Panel Interactions",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => <WorkflowInteractionShell />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Expanded panel shows step labels", async () => {
      expect(canvas.getByText("Step Alpha")).toBeInTheDocument();
      expect(canvas.getByText("Step Beta")).toBeInTheDocument();
      expect(canvas.getByText("Disabled")).toBeInTheDocument();
    });

    await step("Clicking Step Beta makes it the active step", async () => {
      await userEvent.click(canvas.getByText("Step Beta"));
      await waitFor(() => {
        expect(canvas.getByTestId("active-step").textContent).toBe("Active: step-b");
      });
    });

    await step("Clicking a disabled step does not change active step", async () => {
      await userEvent.click(canvas.getByText("Disabled"));
      // Active step should still be step-b
      expect(canvas.getByTestId("active-step").textContent).toBe("Active: step-b");
    });

    await step("Collapse button hides step labels", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Collapse" }));
      await waitFor(() => {
        const panel = canvasElement.querySelector("[data-slot='data-app-shell-secondary-nav']");
        expect(panel).toHaveAttribute("data-collapsed", "true");
        expect(canvas.queryByText("Step Alpha")).not.toBeInTheDocument();
      });
      expect(canvas.getByTestId("collapsed-state").textContent).toBe("Collapsed: true");
    });

    await step("Expand button restores step labels", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
      await waitFor(() => {
        expect(canvas.getByText("Step Alpha")).toBeInTheDocument();
      });
      expect(canvas.getByTestId("collapsed-state").textContent).toBe("Collapsed: false");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4672" },
  },
};

// =============================================================================
// Multiple nav groups with separators
// =============================================================================

export const MultipleNavGroups: Story = {
  name: "Multiple Nav Groups",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="APP"
      navGroups={[
        {
          label: "Main",
          pages: [
            { id: "project", label: "Project", icon: ClipboardList },
            { id: "explorer", label: "Explorer", icon: Search },
          ],
        },
        {
          label: "Tools",
          pages: [{ id: "filter", label: "Filters", icon: Filter, isActive: true }],
        },
      ]}
      breadcrumbs={[{ label: "Filters" }]}
    >
      <div className="p-6">
        <p>Content</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("All pages from both groups are visible", async () => {
      expect(canvas.getByRole("button", { name: "Project" })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Explorer" })).toBeInTheDocument();
      expect(canvas.getAllByText("Filters").length).toBeGreaterThan(0);
    });

    await step("A separator divides the two groups in the icon rail", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // The separator is a <div> with border-t inside the nav groups area
      const separatorDivs = rail?.querySelectorAll(".border-t.border-sidebar-border");
      expect(separatorDivs?.length).toBeGreaterThanOrEqual(1);
    });

    await step("Active page icon has primary highlight", async () => {
      // Filters page is isActive — its icon container has bg-primary/10
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      const activePage = within(rail!).getByRole("button", { name: "Filters" });
      const iconContainer = activePage?.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4673" },
  },
};

// =============================================================================
// Back to TDP Platform navigation (callback)
// =============================================================================

export const BackToPlatformCallback: Story = {
  name: "Back to TDP Platform Callback",
  tags: ["!dev"],
  render: () => {
    const [callbackCount, setCallbackCount] = React.useState(0);
    const handleBackClick = () => {
      setCallbackCount((prev) => prev + 1);
      console.log("Back to platform callback triggered");
    };

    return (
      <div>
        <DataAppShell
          appName="HTS"
          appFullName="HTS Hit Finder"
          version="v2.4.1"
          navGroups={htsNavGroups}
          onBackToPlatform={handleBackClick}
          breadcrumbs={[{ label: "Project" }]}
        >
          <div className="p-6">
            <p>Main content</p>
            <p data-testid="callback-count">Callbacks: {callbackCount}</p>
          </div>
        </DataAppShell>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Initial callback count is 0", async () => {
      expect(canvas.getByTestId("callback-count").textContent).toBe("Callbacks: 0");
    });

    await step("Clicking app icon opens dropdown menu", async () => {
      const appIcon = canvas.getAllByText("HTS")[0];
      await userEvent.click(appIcon);

      await waitFor(() => {
        expect(body.getByText("Back to TDP Platform")).toBeInTheDocument();
      });
    });

    await step("Back to TDP Platform text is visible in dropdown", async () => {
      expect(body.getByText("Back to TDP Platform")).toBeInTheDocument();
    });

    await step("Clicking Back to TDP Platform triggers the callback", async () => {
      // Find the button by looking for one that contains the arrow icon and text
      const dropdownItems = body.getAllByRole("menuitem");
      const backBtn = dropdownItems.find((item) => item.textContent?.includes("Back to TDP Platform"));
      expect(backBtn).toBeInTheDocument();

      await userEvent.click(backBtn!);

      await waitFor(() => {
        expect(canvas.getByTestId("callback-count").textContent).toBe("Callbacks: 1");
      });

      // Wait for the menu to fully close before the next step reopens it —
      // clicking the trigger while the exit transition is still running gets
      // swallowed as an outside-click and the reopen never happens.
      await waitFor(() => {
        expect(body.queryByText("Back to TDP Platform")).not.toBeInTheDocument();
      });
    });

    await step("Clicking app icon again and Back to TDP Platform increments callback count", async () => {
      const appIcon = canvas.getAllByText("HTS")[0];
      await userEvent.click(appIcon);

      await waitFor(() => {
        expect(body.getByText("Back to TDP Platform")).toBeInTheDocument();
      });

      const dropdownItems = body.getAllByRole("menuitem");
      const backBtn = dropdownItems.find((item) => item.textContent?.includes("Back to TDP Platform"));
      await userEvent.click(backBtn!);

      await waitFor(() => {
        expect(canvas.getByTestId("callback-count").textContent).toBe("Callbacks: 2");
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4674" },
  },
};

// =============================================================================
// Back to TDP Platform navigation (path-based TDPLink)
// =============================================================================

export const BackToPlatformPath: Story = {
  name: "Back to TDP Platform Path",
  tags: ["!dev"],
  render: () => (
    <TdpNavigationProvider tdpBaseUrl="https://tetrascience.com/my-org">
      <DataAppShell
        appName="HTS"
        appFullName="HTS Hit Finder"
        version="v2.4.1"
        navGroups={htsNavGroups}
        backToPlatformPath="/data-workspace"
        breadcrumbs={[{ label: "Project" }]}
      >
        <div className="p-6">
          <p>Main content</p>
        </div>
      </DataAppShell>
    </TdpNavigationProvider>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Clicking app icon opens dropdown menu", async () => {
      await userEvent.click(canvas.getAllByText("HTS")[0]);
      await waitFor(() => {
        expect(body.getByText("Back to TDP Platform")).toBeInTheDocument();
      });
    });

    await step("Back to TDP Platform renders as a link (not a button)", async () => {
      const menuItem = body.getByRole("menuitem", { name: /back to tdp platform/i });
      expect(menuItem.tagName.toLowerCase()).toBe("a");
    });

    await step("Link href contains the backToPlatformPath", async () => {
      const menuItem = body.getByRole("menuitem", { name: /back to tdp platform/i });
      expect(menuItem).toHaveAttribute("href", expect.stringContaining("/data-workspace"));
    });

    await step("Link href is fully resolved with the TDP base URL", async () => {
      const menuItem = body.getByRole("menuitem", { name: /back to tdp platform/i });
      expect(menuItem).toHaveAttribute("href", "https://tetrascience.com/my-org/data-workspace");
    });

    await step("Dropdown closes after pressing Escape", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => {
        expect(body.queryByText("Back to TDP Platform")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4675" },
  },
};

// =============================================================================
// Mobile navigation (setMobileNavOpen)
// =============================================================================

export const MobileNavigation: Story = {
  name: "Mobile Navigation",
  tags: ["!dev"],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    zephyr: { testCaseId: "SW-T4676" },
  },
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={[
        {
          label: "Main",
          pages: [
            { id: "project", label: "Project", icon: ClipboardList, isActive: true },
            { id: "explorer", label: "Explorer", icon: Search },
          ],
        },
      ]}
      breadcrumbs={[{ label: "Project" }]}
      userMenu={<UserMenuButton name="Test User" userRole="ADMIN" />}
    >
      <div className="p-6">
        <p>Main content</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step("Mobile nav sheet is initially closed", async () => {
      // Sheet should not be visible initially
      const sheetContent = body.queryByRole("dialog");
      expect(sheetContent).not.toBeInTheDocument();
    });

    await step("Clicking hamburger menu opens mobile nav sheet", async () => {
      // Find the hamburger button by aria-label
      const hamburgerBtn = canvas.getByLabelText("Open navigation menu");
      expect(hamburgerBtn).toBeInTheDocument();

      await userEvent.click(hamburgerBtn);

      await waitFor(() => {
        // Sheet renders in a portal, check document
        const sheetContent = document.querySelector("[data-slot='sheet-content']");
        expect(sheetContent).toBeInTheDocument();
        // Navigation items should be visible
        expect(within(sheetContent!).getByText("Project")).toBeInTheDocument();
        expect(within(sheetContent!).getByText("Explorer")).toBeInTheDocument();
      });
    });

    await step("Mobile nav shows all navigation pages with labels", async () => {
      // In expanded mobile view, labels should be visible
      const sheetContent = document.querySelector("[data-slot='sheet-content']");
      expect(within(sheetContent!).getByText("Project")).toBeInTheDocument();
      expect(within(sheetContent!).getByText("Explorer")).toBeInTheDocument();
    });

    await step("Clicking a nav item closes the mobile nav sheet", async () => {
      // Click Explorer to trigger close
      const sheetContent = document.querySelector("[data-slot='sheet-content']")!;
      const explorerBtn = within(sheetContent).getByRole("button", { name: "Explorer" });
      await userEvent.click(explorerBtn);

      await waitFor(() => {
        // Sheet should close
        const closedSheet = document.querySelector("[data-slot='sheet-content']");
        expect(closedSheet).not.toBeInTheDocument();
      });
    });

    await step("Hamburger menu can reopen the nav after closing", async () => {
      const hamburgerBtn = canvas.getByLabelText("Open navigation menu");
      await userEvent.click(hamburgerBtn);

      await waitFor(() => {
        const sheetContent = document.querySelector("[data-slot='sheet-content']");
        expect(within(sheetContent!).getByText("Project")).toBeInTheDocument();
      });
    });

    await step("Pressing Escape closes the mobile nav sheet", async () => {
      await userEvent.keyboard("{Escape}");

      await waitFor(() => {
        const closedSheet = document.querySelector("[data-slot='sheet-content']");
        expect(closedSheet).not.toBeInTheDocument();
      });
    });
  },
};

// =============================================================================
// Compact property (icon rail vs expanded sheet)
// =============================================================================

export const CompactProperty: Story = {
  name: "Compact Property",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={[
        {
          label: "Main",
          pages: [
            { id: "project", label: "Project", icon: ClipboardList, isActive: true },
            { id: "explorer", label: "Explorer", icon: Search },
          ],
        },
        {
          label: "Tools",
          pages: [{ id: "filter", label: "Filters", icon: Filter }],
        },
      ]}
      breadcrumbs={[{ label: "Project" }]}
      userMenu={<UserMenuButton name="Test User" userRole="ADMIN" />}
    >
      <div className="p-6">
        <p>Content area</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    await step("Compact icon rail renders on desktop (hidden on mobile)", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      expect(rail).toBeInTheDocument();
      // Icon rail should have width of 48px
      expect(rail).toHaveClass("w-12");
    });

    await step("Icon rail displays icon-only nav buttons labelled via aria-label", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // Labels are exposed as accessible names (aria-label), not visible text
      expect(within(rail!).getByRole("button", { name: "Project" })).toBeInTheDocument();
      expect(within(rail!).getByRole("button", { name: "Explorer" })).toBeInTheDocument();
      expect(within(rail!).getByRole("button", { name: "Filters" })).toBeInTheDocument();
    });

    await step("Group labels are hidden in compact icon rail", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // Group labels like "Main" and "Tools" should not appear in compact icon rail
      expect(within(rail!).queryByText("Main")).not.toBeInTheDocument();
      expect(within(rail!).queryByText("Tools")).not.toBeInTheDocument();
    });

    await step("Active page has primary background highlight in compact mode", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      const projectBtn = within(rail!).getByRole("button", { name: "Project" });
      const iconDiv = projectBtn?.querySelector(".bg-primary\\/10");
      expect(iconDiv).toBeInTheDocument();
    });

    await step("Mobile hamburger menu button is hidden on desktop", async () => {
      // The button has md:hidden class, so it should be hidden on desktop
      const mobileMenuBtn = canvasElement.querySelector("button.md\\:hidden");
      expect(mobileMenuBtn).toBeInTheDocument();
      const styles = window.getComputedStyle(mobileMenuBtn!);
      // On desktop, md:hidden should apply display: none
      expect(styles.display).toBe("none");
    });

    await step("Icon rail has compact width and hidden on small screens", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // Icon rail has md:flex which means it's hidden on mobile
      expect(rail).toHaveClass("hidden", "md:flex");
      const railStyles = window.getComputedStyle(rail!);
      expect(railStyles.width).toBe("48px");
    });

    await step("User menu is visible at bottom of icon rail", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // User avatar (initials TU) should be present in the rail
      expect(within(rail!).getByText("TU")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4677" },
  },
};

// =============================================================================
// Horizontal navigation (top PrimaryNav + horizontal SecondaryNav)
// =============================================================================

const topNavPages = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "explorer", label: "Explorer", icon: Search },
  { id: "policies", label: "Policies", icon: ShieldCheck },
];

const secondaryNavSteps: NavStep[] = [
  { id: "overview", label: "Data Overview", icon: LayoutGrid },
  {
    id: "filtering",
    label: "Filtering",
    icon: Filter,
    steps: [
      { id: "global-filters", label: "Global Filters" },
      { id: "cluster-filters", label: "Cluster Filters" },
    ],
  },
  { id: "review", label: "Review Compounds", icon: Library },
  { id: "export", label: "Export", icon: Download, badge: 12 },
];

/**
 * The fully horizontal shell chrome — top PrimaryNav (logo left, user right)
 * with the horizontal SecondaryNav stepper directly beneath it.
 */
const HorizontalNavigationExample = () => {
  const [activeKey, setActiveKey] = useState("projects");
  const [activeStep, setActiveStep] = useState("filtering");

  return (
    <div className="flex flex-col h-screen bg-background">
      <DataAppShellPrimaryNav
        variant="top"
        aria-label="Application navigation"
        navGroups={[{ pages: topNavPages }]}
        activeKey={activeKey}
        onSelect={setActiveKey}
        header={
          <AppHeaderMenu
            appName="APP"
            appFullName="Data App"
            version="v1.0.0"
            onBackToPlatform={() => console.log("Back to TDP Platform")}
            compact
            menuSide="bottom"
          />
        }
        user={<UserMenuButton name="Grace Pan" userRole="ADMIN" />}
        className="h-10 px-2 shrink-0 bg-sidebar border-b border-sidebar-border"
      />
      <DataAppShellSecondaryNav
        orientation="horizontal"
        aria-label="Steps"
        steps={secondaryNavSteps}
        activeKey={activeStep}
        onSelect={setActiveStep}
        className="h-10 px-2 shrink-0 bg-sidebar border-b border-sidebar-border"
      />
      <main className="flex-1 flex items-center justify-center overflow-auto">
        <p className="text-muted-foreground text-sm">Main content area</p>
      </main>
    </div>
  );
};

export const HorizontalNavigation: Story = {
  name: "Horizontal Navigation",
  tags: ["!dev"], // Hides from sidebar, remains testable
  render: () => <HorizontalNavigationExample />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Nav renders horizontally with visible labels", async () => {
      const nav = canvasElement.querySelector("[data-slot='data-app-shell-primary-nav']");
      expect(nav).toHaveAttribute("data-variant", "top");
      expect(canvas.getByText("Projects")).toBeVisible();
      expect(canvas.getByText("Explorer")).toBeVisible();
      expect(canvas.getByText("Policies")).toBeVisible();
    });

    await step("Active item carries aria-current", async () => {
      expect(canvas.getByRole("button", { name: /Projects/ })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    await step("User menu sits in the trailing slot", async () => {
      const userSlot = canvasElement.querySelector(
        "[data-slot='data-app-shell-primary-nav-user']"
      );
      expect(within(userSlot as HTMLElement).getByText("GP")).toBeInTheDocument();
    });

    await step("App menu opens below the bar with Back to TDP Platform", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "APP" }));
      const body = within(document.body);
      await waitFor(() =>
        expect(body.getByText("Back to TDP Platform")).toBeInTheDocument()
      );
      await userEvent.keyboard("{Escape}");
      // Wait for the menu to fully close — Radix keeps the rest of the page
      // aria-hidden until the exit transition completes.
      await waitFor(() =>
        expect(body.queryByText("Back to TDP Platform")).not.toBeInTheDocument()
      );
    });

    await step("Selecting an item moves the active state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Explorer/ }));
      await waitFor(() => {
        expect(canvas.getByRole("button", { name: /Explorer/ })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(canvas.getByRole("button", { name: /Projects/ })).not.toHaveAttribute(
          "aria-current"
        );
      });
    });

    const secondaryNav = () =>
      canvasElement.querySelector("[data-slot='data-app-shell-secondary-nav']") as HTMLElement;

    await step("Secondary nav stepper renders horizontally under the top nav", async () => {
      expect(secondaryNav()).toHaveAttribute("data-orientation", "horizontal");
      expect(within(secondaryNav()).getByText("Filtering")).toBeVisible();
      expect(within(secondaryNav()).getByText("Global Filters")).toBeVisible();
    });

    await step("Step statuses derive linearly along the row", async () => {
      expect(within(secondaryNav()).getByRole("button", { name: /Filtering/ })).toHaveAttribute(
        "aria-current",
        "step"
      );
      expect(
        within(secondaryNav()).getByRole("button", { name: /Data Overview/ })
      ).toHaveAttribute("data-status", "done");
      expect(within(secondaryNav()).getByRole("button", { name: /Export/ })).toHaveAttribute(
        "data-status",
        "todo"
      );
    });

    await step("Selecting a later step marks earlier steps done", async () => {
      await userEvent.click(
        within(secondaryNav()).getByRole("button", { name: /Review Compounds/ })
      );
      await waitFor(() => {
        expect(
          within(secondaryNav()).getByRole("button", { name: /Review Compounds/ })
        ).toHaveAttribute("aria-current", "step");
        expect(
          within(secondaryNav()).getByRole("button", { name: /Cluster Filters/ })
        ).toHaveAttribute("data-status", "done");
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5512" },
  },
};
