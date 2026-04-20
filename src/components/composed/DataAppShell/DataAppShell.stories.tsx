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

import { DataAppShell } from "./DataAppShell";

import type { Meta, StoryObj } from "@storybook/react-vite";

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

const htsPages = [
  { id: "project", label: "Project", icon: ClipboardList, active: true },
  { id: "explorer", label: "Explorer", icon: Search },
];

const htsWorkflowSteps = [
  {
    id: "data-overview",
    label: "Data Overview",
    icon: LayoutGrid,
    active: true,
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
  { label: "All Projects", isClickable: true },
  { label: "DUX4", isClickable: true },
  { label: "Primary Screening", isClickable: true },
  { label: "Data Overview", isClickable: false },
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
  const [activeStep, setActiveStep] = useState("data-overview");

  const steps = htsWorkflowSteps.map((s) => ({
    ...s,
    active: s.id === activeStep,
    onClick: () => setActiveStep(s.id),
  }));

  const activeStepData = steps.find((s) => s.active);
  const activeStepIndex = steps.findIndex((s) => s.active);
  const isLastStep = activeStepIndex === steps.length - 1;

  const dataCounts =
    activeStepData?.inputCount == null || activeStepData?.outputCount == null
      ? []
      : [
          { label: "INPUT", count: activeStepData.inputCount, variant: "outline" as const },
          { label: "Output", count: activeStepData.outputCount, variant: "primary" as const },
        ];

  const handleNext = () => {
    if (!isLastStep) {
      setActiveStep(htsWorkflowSteps[activeStepIndex + 1].id);
    }
  };

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      pages={htsPages}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      onBackToPlatform={() => console.log("Back to TDP Platform")}
      showWorkflow
      workflowSteps={steps}
      workflowCollapsed={collapsed}
      onWorkflowCollapseChange={setCollapsed}
      breadcrumbs={htsBreadcrumbs}
      dataCounts={dataCounts}
      showNextButton
      nextButtonLabel={isLastStep ? "Push to Downstream" : "Next"}
      onNextClick={handleNext}
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

    await step("Workflow panel is collapsed — icon rail and step labels hidden", async () => {
      expect(canvas.queryByText("HTS")).not.toBeInTheDocument();
      expect(canvas.queryByText("Project")).not.toBeInTheDocument();
      expect(canvas.queryByText("Data Overview")).not.toBeInTheDocument();
    });
  },
};

// =============================================================================
// Non-workflow page
// =============================================================================

export const NonWorkflowPage: Story = {
  name: "Non-Workflow Page",
  args: {
    appName: "HTS",
    appFullName: "HTS Hit Finder",
    pages: htsPages,
    user: sampleUser,
    userMenuItems: sampleMenuItems,
    showWorkflow: false,
    breadcrumbs: [{ label: "All Projects", isClickable: false }],
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4">All Projects</h1>
        <p className="text-muted-foreground">Select a project to start a workflow.</p>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("No workflow panel or next button", async () => {
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
      expect(canvas.queryByText("Next")).not.toBeInTheDocument();
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
    });
  },
};

// =============================================================================
// Interactive (state-driven)
// =============================================================================

const InteractiveShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState("data-overview");
  const [activePage, setActivePage] = useState("project");

  const pages = htsPages.map((p) => ({
    ...p,
    active: p.id === activePage,
    onClick: () => setActivePage(p.id),
  }));

  const steps = htsWorkflowSteps.map((s) => ({
    ...s,
    active: s.id === activeStep,
    onClick: () => setActiveStep(s.id),
  }));

  const activeStepData = steps.find((s) => s.active);

  return (
    <DataAppShell
      appName="HTS"
      appFullName="HTS Hit Finder"
      pages={pages}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      showWorkflow={activePage === "project"}
      workflowSteps={steps}
      workflowCollapsed={collapsed}
      onWorkflowCollapseChange={setCollapsed}
      breadcrumbs={[
        { label: "All Projects", isClickable: true, onClick: () => setActivePage("project") },
        { label: "DUX4", isClickable: true },
        { label: "Primary Screening", isClickable: true },
        { label: activeStepData?.label ?? "Data Overview", isClickable: false },
      ]}
      dataCounts={
        activeStepData?.inputCount == null
          ? []
          : [
              { label: "INPUT", count: activeStepData.inputCount, variant: "outline" },
              ...(activeStepData.outputCount == null
                ? []
                : [{ label: "Output", count: activeStepData.outputCount, variant: "primary" as const }]),
            ]
      }
      showNextButton={activePage === "project"}
      nextButtonLabel="Next"
    >
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-2">
          {activeStepData?.label ?? "Select a step"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Active page: <strong>{activePage}</strong> | Active step:{" "}
          <strong>{activeStep}</strong> | Collapsed:{" "}
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
