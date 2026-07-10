import { cva } from "class-variance-authority";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  FolderKanban,
  LayoutGrid,
  Library,
  LogOut,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { DataAppShell } from "./DataAppShell";
import { DataAppShellPrimaryNav } from "./PrimaryNav";

import type { NavGroup } from "./DataAppShell";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

// ── Workflow panel ───────────────────────────────────────────────────────────

interface WorkflowStep {
  id: string;
  label: string;
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick?: () => void;
}

const stepItemVariants = cva(
  "flex items-center gap-2 py-2 px-2.5 font-normal transition-colors duration-150 whitespace-nowrap leading-tight cursor-pointer border-l-[5px] w-full bg-transparent border-r-0 border-t-0 border-b-0",
  {
    variants: {
      active: {
        true: "border-l-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground shadow-sm",
        false: "border-l-sidebar-border bg-transparent text-muted-foreground hover:bg-sidebar-accent/50",
      },
    },
    defaultVariants: { active: false },
  },
);

function WorkflowPanel({
  steps,
  collapsed,
  onCollapseChange,
}: {
  steps: WorkflowStep[];
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}) {
  if (collapsed) {
    return (
      <div
        data-slot="data-app-panel-collapsed"
        className="flex flex-col shrink-0 w-[46px] bg-sidebar border-r border-sidebar-border"
      >
        <div className="flex justify-center items-center h-10 border-b border-sidebar-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="w-5 h-5" onClick={() => onCollapseChange(false)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex justify-center items-center py-3.5 border-l-[5px] cursor-pointer bg-transparent border-r-0 border-t-0 border-b-0 w-full",
                      step.isActive ? "border-l-primary" : "border-l-border",
                      step.disabled && "opacity-45 cursor-not-allowed",
                    )}
                    onClick={() => !step.disabled && step.onClick?.()}
                    disabled={step.disabled}
                  >
                    {Icon ? (
                      <Icon className={cn("w-4 h-4", step.isActive ? "text-primary" : "text-muted-foreground")} />
                    ) : (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          step.isActive ? "bg-primary" : "bg-muted-foreground/40",
                        )}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {step.disabled ? (step.disabledReason ?? step.label) : step.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <nav
      data-slot="data-app-panel-expanded"
      aria-label="Workflow steps"
      className="flex flex-col shrink-0 w-[180px] bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      <div className="flex items-center gap-1.5 h-10 px-2.5 pl-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-b border-sidebar-border">
        <span className="flex-1">Workflow</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="w-5 h-5" onClick={() => onCollapseChange(true)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              type="button"
              key={step.id}
              className={cn(
                stepItemVariants({ active: step.isActive ?? false }),
                step.disabled && "opacity-45 cursor-not-allowed",
              )}
              onClick={() => !step.disabled && step.onClick?.()}
              disabled={step.disabled}
              title={step.disabled ? (step.disabledReason ?? step.label) : step.label}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 shrink-0",
                    step.isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </span>
              )}
              <span className={cn("text-title-sm truncate min-w-0", !step.isActive && "font-light")}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
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

const htsWorkflowSteps: WorkflowStep[] = [
  {
    id: "data-overview",
    label: "Step 1 Name",
    icon: LayoutGrid,
    isActive: true,
  },
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
// Default (with workflow)
// =============================================================================

const DefaultShell = ({ initialCollapsed = false }: { initialCollapsed?: boolean }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [activeStepId, setActiveStepId] = useState("data-overview");

  const steps = htsWorkflowSteps.map((s) => ({
    ...s,
    isActive: s.id === activeStepId,
    onClick: () => setActiveStepId(s.id),
  }));

  const activeStepIndex = steps.findIndex((s) => s.isActive);
  const isLastStep = activeStepIndex === steps.length - 1;
  const isFirstStep = activeStepIndex <= 0;

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={htsNavGroups}
      onBackToPlatform={() => console.log("Back to TDP Platform")}
      onHelpClick={() => console.log("Help")}
      userMenu={<UserMenuButton name="Emily Liu" userRole="ADMIN" />}
      breadcrumbs={htsBreadcrumbs}
      headerActions={
        <>
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStepId(steps[activeStepIndex - 1].id)}
              className="gap-1"
            >
              Back
            </Button>
          )}
          <Button
            size="sm"
            disabled={isLastStep}
            onClick={() => !isLastStep && setActiveStepId(htsWorkflowSteps[activeStepIndex + 1].id)}
            className="gap-1"
          >
            {isLastStep ? "Push to Downstream" : "Next"}
          </Button>
        </>
      }
      showNavRail={!collapsed}
      sidebarPanel={<WorkflowPanel steps={steps} collapsed={collapsed} onCollapseChange={setCollapsed} />}
    >
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Main content area</p>
      </div>
    </DataAppShell>
  );
};

export const Default: Story = {
  name: "Default",
  render: () => <DefaultShell />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Shell renders all regions", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Project" })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Explorer" })).toBeInTheDocument();
      expect(canvas.getByText("Workflow")).toBeInTheDocument();
      expect(canvas.getAllByText("Step 1 Name").length).toBeGreaterThan(0);
      expect(canvas.getAllByText("All Projects").length).toBeGreaterThan(0);
      expect(canvas.getByText("Next")).toBeInTheDocument();
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
    });

    await step("User avatar shows initials", async () => {
      expect(canvas.getByText("EL")).toBeInTheDocument();
    });

    await step("Version is shown inside the app dropdown under the title", async () => {
      await userEvent.click(canvas.getAllByText("HTS")[0]);
      const body = within(document.body);
      await waitFor(() => expect(body.getByText("v2.4.1")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4665" },
  },
};

export const CollapsedWorkflow: Story = {
  name: "Collapsed Workflow",
  render: () => <DefaultShell initialCollapsed />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Collapsed workflow — step labels hidden", async () => {
      expect(canvas.queryByText("Step 2 Name")).not.toBeInTheDocument();
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
    });

    await step("Collapsed workflow — app nav rail is hidden", async () => {
      expect(
        canvasElement.querySelector("[data-slot='data-app-sidebar-rail']")
      ).not.toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4666" },
  },
};

// =============================================================================
// Non-workflow page
// =============================================================================

export const NonWorkflowPage: Story = {
  name: "Non-Workflow Page",
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

  const steps = htsWorkflowSteps.map((s) => ({
    ...s,
    isActive: s.id === activeStepId,
    onClick: () => setActiveStepId(s.id),
  }));

  const activeStep = steps.find((s) => s.isActive);
  const isProjectPage = activePageId === "project";

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={navGroups}
      onHelpClick={() => console.log("Help")}
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
          <WorkflowPanel steps={steps} collapsed={collapsed} onCollapseChange={setCollapsed} />
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

export const HelpButtonPresent: Story = {
  name: "Help Button",
  render: () => (
    <DataAppShell
      appName="APP"
      navGroups={htsNavGroups}
      onHelpClick={() => console.log("Help")}
      breadcrumbs={[{ label: "Page" }]}
    >
      <div className="p-6">
        <p>Content</p>
      </div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    await step("Help button renders when onHelpClick is provided", async () => {
      // Help button should be present in the top nav when onHelpClick is provided
      const topNav = canvasElement.querySelector("[data-slot='data-app-top-nav']");
      expect(topNav).toBeInTheDocument();
    });

    await step("Help icon is visible in the top nav", async () => {
      // The HelpCircle button is visible — check for its container
      const topNav = canvasElement.querySelector("[data-slot='data-app-top-nav']");
      expect(topNav).toBeInTheDocument();
      // Look for the help button (it has no text label, only icon)
      const buttons = within(topNav!).getAllByRole("button");
      // Top nav right side: help button should be present
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4671" },
  },
};

// =============================================================================
// Workflow panel collapse / expand + step interaction
// =============================================================================

const WorkflowInteractionShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStepId, setActiveStepId] = useState("step-a");

  const steps: WorkflowStep[] = [
    {
      id: "step-a",
      label: "Step Alpha",
      icon: LayoutGrid,
      isActive: activeStepId === "step-a",
      onClick: () => setActiveStepId("step-a"),
    },
    {
      id: "step-b",
      label: "Step Beta",
      icon: Filter,
      isActive: activeStepId === "step-b",
      onClick: () => setActiveStepId("step-b"),
    },
    { id: "step-c", label: "Disabled", icon: Search, disabled: true, disabledReason: "Requires upstream data" },
  ];

  return (
    <DataAppShell
      appName="T"
      navGroups={[{ pages: [{ id: "p1", label: "Project", icon: ClipboardList }] }]}
      sidebarPanel={<WorkflowPanel steps={steps} collapsed={collapsed} onCollapseChange={setCollapsed} />}
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
      const expandedPanel = canvasElement.querySelector("[data-slot='data-app-panel-expanded']");
      const collapseBtn = within(expandedPanel!).getAllByRole("button")[0];
      await userEvent.click(collapseBtn);
      await waitFor(() => {
        expect(canvasElement.querySelector("[data-slot='data-app-panel-collapsed']")).toBeInTheDocument();
        expect(canvas.queryByText("Step Alpha")).not.toBeInTheDocument();
      });
      expect(canvas.getByTestId("collapsed-state").textContent).toBe("Collapsed: true");
    });

    await step("Expand button restores step labels", async () => {
      const collapsedPanel = canvasElement.querySelector("[data-slot='data-app-panel-collapsed']");
      // First button in collapsed panel header is the expand button
      const expandBtn = within(collapsedPanel!).getAllByRole("button")[0];
      await userEvent.click(expandBtn);
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
      const menuItem = body.getByRole("menuitem");
      expect(menuItem.tagName.toLowerCase()).toBe("a");
    });

    await step("Link href contains the backToPlatformPath", async () => {
      const menuItem = body.getByRole("menuitem");
      expect(menuItem).toHaveAttribute("href", expect.stringContaining("/data-workspace"));
    });

    await step("Link href is fully resolved with the TDP base URL", async () => {
      const menuItem = body.getByRole("menuitem");
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
// PrimaryNav top variant (horizontal placement)
// =============================================================================

const topNavPages = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "explorer", label: "Explorer", icon: Search },
  { id: "policies", label: "Policies", icon: ShieldCheck },
];

/** The shell's nav engine in its horizontal placement — logo left, user right. */
const TopVariantExample = () => {
  const [activeKey, setActiveKey] = useState("projects");

  return (
    <div className="p-4 bg-background min-h-screen">
      <div className="border border-border rounded-lg overflow-hidden">
        <DataAppShellPrimaryNav
          variant="top"
          aria-label="Application navigation"
          navGroups={[{ pages: topNavPages }]}
          activeKey={activeKey}
          onSelect={setActiveKey}
          header={<span aria-hidden="true" className="w-9 h-6 rounded-lg bg-primary" />}
          user={<UserMenuButton name="Grace Pan" userRole="ADMIN" />}
          className="h-10 px-3 bg-sidebar border-b border-sidebar-border"
        />
        <div className="h-[300px] flex items-center justify-center bg-background">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </div>
    </div>
  );
};

export const PrimaryNavTopVariant: Story = {
  name: "Primary Nav Top Variant",
  render: () => <TopVariantExample />,
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
  },
};
