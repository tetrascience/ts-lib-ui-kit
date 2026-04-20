import {
  ClipboardList,
  Download,
  Filter,
  LayoutGrid,
  Library,
  Search,
} from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";


import { DataAppShell, DataCountPills, WorkflowPanel } from "./DataAppShell";

import type { DataCount, NavGroup, WorkflowStep } from "./DataAppShell";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof DataAppShell> = {
  title: "Patterns/DataAppShell",
  component: DataAppShell,
  parameters: {
    layout: "fullscreen",
  },
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
    label: "Data Overview",
    icon: LayoutGrid,
    isActive: true,
    inputCount: 649568,
    outputCount: 645396,
  },
  {
    id: "global-filtering",
    label: "Global Filtering",
    icon: Filter,
    inputCount: 645396,
    outputCount: 4803,
  },
  {
    id: "explore-clusters",
    label: "Explore Clusters",
    icon: Library,
    inputCount: 3917,
    outputCount: 20,
  },
  {
    id: "review-compound",
    label: "Review Selection",
    icon: Search,
    inputCount: 20,
    outputCount: 15,
  },
  {
    id: "export-list",
    label: "Export Primary List",
    icon: Download,
    inputCount: 15,
  },
];

const htsBreadcrumbs = [
  { label: "All Projects", onClick: () => console.log("All Projects") },
  { label: "DUX4", onClick: () => console.log("DUX4") },
  { label: "Primary Screening", onClick: () => console.log("Primary Screening") },
  { label: "Data Overview" },
];

const sampleUser = { name: "Emily Liu", role: "ADMIN" };

const sampleMenuItems = [
  { label: "Home", onClick: () => console.log("Home") },
  { label: "Load Worksession", onClick: () => console.log("Load") },
  { label: "Switch User", onClick: () => console.log("Switch") },
  { label: "Log Out", onClick: () => console.log("Logout") },
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
          { label: "INPUT", count: activeStep.inputCount, variant: "outline" },
          { label: "Output", count: activeStep.outputCount, variant: "primary" },
        ];

  const handleNext = () => {
    if (!isLastStep) setActiveStepId(htsWorkflowSteps[activeStepIndex + 1].id);
  };

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      navGroups={htsNavGroups}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      onBackToPlatform={() => console.log("Back to TDP Platform")}
      onHelpClick={() => console.log("Help")}
      breadcrumbs={htsBreadcrumbs}
      headerActions={
        <>
          <DataCountPills dataCounts={dataCounts} />
          <Button
            size="sm"
            disabled={isLastStep}
            onClick={handleNext}
            className="gap-1"
          >
            {isLastStep ? "Push to Downstream" : "Next"}
          </Button>
        </>
      }
      sidebarPanel={
        <WorkflowPanel
          steps={steps}
          collapsed={collapsed}
          onCollapseChange={setCollapsed}
        />
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
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
      expect(canvas.getByText("649,568")).toBeInTheDocument();
      expect(canvas.getByText("Next")).toBeInTheDocument();
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
    });

    await step("User avatar shows initials", async () => {
      expect(canvas.getByText("EL")).toBeInTheDocument();
    });
  },
};

export const CollapsedWorkflow: Story = {
  name: "Collapsed Workflow",
  render: () => <DefaultShell initialCollapsed />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Collapsed workflow — step labels hidden", async () => {
      expect(canvas.queryByText("Data Overview")).not.toBeInTheDocument();
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
      navGroups={htsNavGroups}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      breadcrumbs={[{ label: "All Projects" }]}
      version="v2.4.1"
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
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
    });

    await step("Version is shown in sidebar", async () => {
      expect(canvas.getByText("v2.4.1")).toBeInTheDocument();
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
        { label: "INPUT", count: activeStep.inputCount, variant: "outline" },
        ...(activeStep.outputCount == null
          ? []
          : [{ label: "Output", count: activeStep.outputCount, variant: "primary" as const }]),
      ];

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      navGroups={navGroups}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      onHelpClick={() => console.log("Help")}
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
            <Button size="sm" className="gap-1">
              Next
            </Button>
          </>
        )
      }
      sidebarPanel={
        isProjectPage ? (
          <WorkflowPanel
            steps={steps}
            collapsed={collapsed}
            onCollapseChange={setCollapsed}
          />
        ) : undefined
      }
    >
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-2">
          {activeStep?.label ?? "Select a step"}
        </h1>
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
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
    });
  },
};
