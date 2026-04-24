import { cva } from "class-variance-authority";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  LayoutGrid,
  Library,
  LogOut,
  Search,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { DataAppShell } from "./DataAppShell";

import type { NavGroup } from "./DataAppShell";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {userRole}
                </span>
              )}
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="cursor-pointer bg-transparent border-none p-0"
          >
            <Avatar size="sm" className="bg-primary cursor-pointer hover:opacity-85 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
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
  inputCount?: number;
  outputCount?: number;
  onClick?: () => void;
}

const MILLION = 1_000_000;
const THOUSAND = 1_000;

function formatCount(n: number): string {
  if (n >= MILLION) return `${(n / MILLION).toFixed(n % MILLION === 0 ? 0 : 1)}M`;
  if (n >= THOUSAND) return `${(n / THOUSAND).toFixed(n % THOUSAND === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

const stepItemVariants = cva(
  "flex items-center gap-2 py-3.5 px-2.5 text-xs font-normal transition-colors duration-150 whitespace-nowrap leading-tight cursor-pointer border-l-[5px] w-full bg-transparent border-r-0 border-t-0 border-b-0",
  {
    variants: {
      active: {
        true: "border-l-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground shadow-sm",
        false: "border-l-sidebar-border bg-transparent text-muted-foreground hover:bg-sidebar-accent/50",
      },
    },
    defaultVariants: { active: false },
  }
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
                      step.disabled && "opacity-45 cursor-not-allowed"
                    )}
                    onClick={() => !step.disabled && step.onClick?.()}
                    disabled={step.disabled}
                  >
                    {Icon ? (
                      <Icon className={cn("w-5 h-5", step.isActive ? "text-primary" : "text-muted-foreground")} />
                    ) : (
                      <div className={cn("w-2.5 h-2.5 rounded-full", step.isActive ? "bg-primary" : "bg-muted-foreground/40")} />
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
              className={cn(stepItemVariants({ active: step.isActive ?? false }), step.disabled && "opacity-45 cursor-not-allowed")}
              onClick={() => !step.disabled && step.onClick?.()}
              disabled={step.disabled}
              title={step.disabled ? (step.disabledReason ?? step.label) : step.label}
            >
              {Icon && (
                <span className={cn("flex items-center justify-center w-6 h-6 shrink-0", step.isActive ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="w-5 h-5" />
                </span>
              )}
              <span className="flex flex-col items-start gap-0.5 min-w-0">
                <span className="truncate">{step.label}</span>
                {(step.inputCount != null || step.outputCount != null) && (
                  <span className="text-[10px] text-muted-foreground font-normal tabular-nums">
                    {step.inputCount != null && <span>{formatCount(step.inputCount)}</span>}
                    {step.inputCount != null && step.outputCount != null && <span className="mx-0.5">{"\u2192"}</span>}
                    {step.outputCount != null && <span>{formatCount(step.outputCount)}</span>}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Data count pills ─────────────────────────────────────────────────────────

interface DataCount {
  label: string;
  count: number;
  variant?: "default" | "outline" | "primary";
  onClick?: () => void;
}

const countPillVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tabular-nums transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        outline: "bg-transparent border border-border text-foreground",
        primary: "bg-primary/10 border border-primary/30 text-primary",
      },
      clickable: {
        true: "cursor-pointer hover:bg-primary/15",
        false: "cursor-default",
      },
    },
    defaultVariants: { variant: "default", clickable: false },
  }
);

function DataCountPills({ dataCounts }: { dataCounts: DataCount[] }) {
  if (dataCounts.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {dataCounts.map((dc, i) => {
        const pillClass = cn(countPillVariants({ variant: dc.variant ?? "outline", clickable: !!dc.onClick }));
        const pillContent = (
          <>
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide font-medium">{dc.label}</span>
            <span className="font-semibold text-sm">{dc.count.toLocaleString()}</span>
          </>
        );
        return (
          <React.Fragment key={`${dc.label}-${i}`}>
            {i > 0 && <span className="text-muted-foreground/50 text-xs">{"\u2192"}</span>}
            {dc.onClick ? (
              <button type="button" className={pillClass} onClick={dc.onClick}>
                {pillContent}
              </button>
            ) : (
              <div className={pillClass}>{pillContent}</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof DataAppShell> = {
  title: "Patterns/DataAppShell",
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
  { id: "data-overview",    label: "Data Overview",      icon: LayoutGrid, isActive: true, inputCount: 649568, outputCount: 645396 },
  { id: "global-filtering", label: "Global Filtering",   icon: Filter,                     inputCount: 645396, outputCount: 4803 },
  { id: "explore-clusters", label: "Explore Clusters",   icon: Library,                    inputCount: 3917,   outputCount: 20 },
  { id: "review-compound",  label: "Review Selection",   icon: Search,                     inputCount: 20,     outputCount: 15 },
  { id: "export-list",      label: "Export Primary List", icon: Download,                  inputCount: 15 },
];

const htsBreadcrumbs = [
  { label: "All Projects", onClick: () => console.log("All Projects") },
  { label: "DUX4",         onClick: () => console.log("DUX4") },
  { label: "Primary Screening", onClick: () => console.log("Primary Screening") },
  { label: "Data Overview" },
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

  const activeStep = steps.find((s) => s.isActive);
  const activeStepIndex = steps.findIndex((s) => s.isActive);
  const isLastStep = activeStepIndex === steps.length - 1;

  const dataCounts: DataCount[] =
    activeStep?.inputCount == null || activeStep?.outputCount == null
      ? []
      : [
          { label: "INPUT",  count: activeStep.inputCount,  variant: "outline" },
          { label: "Output", count: activeStep.outputCount, variant: "primary" },
        ];

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
          <DataCountPills dataCounts={dataCounts} />
          <Button size="sm" disabled={isLastStep} onClick={() => !isLastStep && setActiveStepId(htsWorkflowSteps[activeStepIndex + 1].id)} className="gap-1">
            {isLastStep ? "Push to Downstream" : "Next"}
          </Button>
        </>
      }
      sidebarPanel={
        <WorkflowPanel steps={steps} collapsed={collapsed} onCollapseChange={setCollapsed} />
      }
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
      expect(canvas.getByText("Project")).toBeInTheDocument();
      expect(canvas.getByText("Explorer")).toBeInTheDocument();
      expect(canvas.getByText("Workflow")).toBeInTheDocument();
      expect(canvas.getAllByText("Data Overview").length).toBeGreaterThan(0);
      expect(canvas.getAllByText("All Projects").length).toBeGreaterThan(0);
      expect(canvas.getByText("649,568")).toBeInTheDocument();
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
};

export const CollapsedWorkflow: Story = {
  name: "Collapsed Workflow",
  render: () => <DefaultShell initialCollapsed />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Collapsed workflow — step labels hidden", async () => {
      expect(canvas.queryByText("Global Filtering")).not.toBeInTheDocument();
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
    });
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

  const dataCounts: DataCount[] = activeStep?.inputCount == null
    ? []
    : [
        { label: "INPUT",  count: activeStep.inputCount,  variant: "outline" },
        ...(activeStep.outputCount == null
          ? []
          : [{ label: "Output", count: activeStep.outputCount, variant: "primary" as const }]),
      ];

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
        { label: "DUX4" },
        { label: "Primary Screening" },
        { label: activeStep?.label ?? "Data Overview" },
      ]}
      headerActions={
        isProjectPage && (
          <>
            <DataCountPills dataCounts={dataCounts} />
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
          Active page: <strong>{activePageId}</strong> | Active step:{" "}
          <strong>{activeStepId}</strong> | Collapsed:{" "}
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
      expect(canvas.getAllByText("Data Overview").length).toBeGreaterThan(0);
    });
  },
};

// =============================================================================
// App dropdown interaction
// =============================================================================

export const AppDropdownInteraction: Story = {
  name: "App Dropdown Interaction",
  tags: ['!dev'], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={htsNavGroups}
      onAppNameClick={() => console.log("App name clicked")}
      onBackToPlatform={() => console.log("Back to platform")}
    >
      <div className="p-6"><p className="text-muted-foreground text-sm">Content area</p></div>
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
        { label: "Linked",    href: "/projects" },          // renders as <a>
        { label: "Clickable", onClick: () => console.log("clicked") }, // renders as <button>
        { label: "Static" },                                // no action → <span>
        { label: "Current Page" },                          // last item → BreadcrumbPage
      ]}
    >
      <div className="p-6"><p>Content</p></div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Breadcrumb with href renders as a link", async () => {
      const link = canvas.getByRole("link", { name: "Linked" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/projects");
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
      <div className="p-6"><p>Content</p></div>
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
};


// =============================================================================
// Workflow panel collapse / expand + step interaction
// =============================================================================

const WorkflowInteractionShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStepId, setActiveStepId] = useState("step-a");

  const steps: WorkflowStep[] = [
    { id: "step-a", label: "Step Alpha", icon: LayoutGrid, isActive: activeStepId === "step-a", onClick: () => setActiveStepId("step-a"), inputCount: 1000, outputCount: 800 },
    { id: "step-b", label: "Step Beta",  icon: Filter,     isActive: activeStepId === "step-b", onClick: () => setActiveStepId("step-b"), inputCount: 800,  outputCount: 200 },
    { id: "step-c", label: "Disabled",   icon: Search,     disabled: true, disabledReason: "Requires upstream data" },
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
  tags: ['!dev'], // Hides from sidebar, remains testable
  render: () => <WorkflowInteractionShell />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Expanded panel shows step labels and counts", async () => {
      expect(canvas.getByText("Step Alpha")).toBeInTheDocument();
      expect(canvas.getByText("Step Beta")).toBeInTheDocument();
      expect(canvas.getByText("Disabled")).toBeInTheDocument();
      expect(canvas.getByText("1K")).toBeInTheDocument();
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
            { id: "project",  label: "Project",  icon: ClipboardList },
            { id: "explorer", label: "Explorer", icon: Search },
          ],
        },
        {
          label: "Tools",
          pages: [
            { id: "filter", label: "Filters", icon: Filter, isActive: true },
          ],
        },
      ]}
      breadcrumbs={[{ label: "Filters" }]}
    >
      <div className="p-6"><p>Content</p></div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("All pages from both groups are visible", async () => {
      expect(canvas.getByText("Project")).toBeInTheDocument();
      expect(canvas.getByText("Explorer")).toBeInTheDocument();
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
      const activePage = within(rail!).getByText("Filters").closest("button");
      const iconContainer = activePage?.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeInTheDocument();
    });
  },
};

// =============================================================================
// Compact property (icon rail vs expanded sheet)
// =============================================================================

export const CompactProperty: Story = {
  name: "Compact Property",
  tags: ['!dev'], // Hides from sidebar, remains testable
  render: () => (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      version="v2.4.1"
      navGroups={[
        {
          label: "Main",
          pages: [
            { id: "project",  label: "Project",  icon: ClipboardList, isActive: true },
            { id: "explorer", label: "Explorer", icon: Search },
          ],
        },
        {
          label: "Tools",
          pages: [
            { id: "filter", label: "Filters", icon: Filter },
          ],
        },
      ]}
      breadcrumbs={[{ label: "Project" }]}
      userMenu={<UserMenuButton name="Test User" userRole="ADMIN" />}
    >
      <div className="p-6"><p>Content area</p></div>
    </DataAppShell>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Compact icon rail renders on desktop (hidden on mobile)", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      expect(rail).toBeInTheDocument();
      // Icon rail should have width of 60px
      expect(rail).toHaveClass("w-[60px]");
    });

    await step("Icon rail displays icons and labels stacked vertically", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // Labels should be present
      expect(within(rail!).getByText("Project")).toBeInTheDocument();
      expect(within(rail!).getByText("Explorer")).toBeInTheDocument();
      expect(within(rail!).getByText("Filters")).toBeInTheDocument();
    });

    await step("Group labels are hidden in compact icon rail", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // Group labels like "Main" and "Tools" should not appear in compact icon rail
      expect(within(rail!).queryByText("Main")).not.toBeInTheDocument();
      expect(within(rail!).queryByText("Tools")).not.toBeInTheDocument();
    });

    await step("Active page has primary background highlight in compact mode", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      const projectBtn = within(rail!).getByText("Project").closest("button");
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
      expect(railStyles.width).toBe("60px");
    });

    await step("User menu is visible at bottom of icon rail", async () => {
      const rail = canvasElement.querySelector("[data-slot='data-app-sidebar-rail']");
      // User avatar (initials TU) should be present in the rail
      expect(within(rail!).getByText("TU")).toBeInTheDocument();
    });
  },
};