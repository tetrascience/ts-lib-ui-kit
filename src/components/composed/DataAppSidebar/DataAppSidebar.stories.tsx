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

import DataAppSidebar from "./DataAppSidebar";

import type { SidebarPageEntry, WorkflowStep } from "./DataAppSidebar";
import type { Meta, StoryObj } from "@storybook/react-vite";

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof DataAppSidebar> = {
  title: "Components/DataAppSidebar",
  component: DataAppSidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex" }}>
        <Story />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
            padding: 24,
          }}
        >
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Main content area
          </p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DataAppSidebar>;

// =============================================================================
// Sample data
// =============================================================================

const samplePages: SidebarPageEntry[] = [
  { id: "project", label: "Project", icon: ClipboardList, active: true },
  { id: "explorer", label: "Explorer", icon: Search },
];

const sampleWorkflowSteps: WorkflowStep[] = [
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

const sampleUser = {
  name: "Emily Liu",
  role: "ADMIN",
};

const sampleMenuItems = [
  { label: "Home", onClick: () => console.log("Home") },
  { label: "Load Worksession", onClick: () => console.log("Load") },
  { label: "Switch User", onClick: () => console.log("Switch") },
  { label: "Log Out", onClick: () => console.log("Logout") },
];

// =============================================================================
// Stories
// =============================================================================

const DefaultComponent = ({ initialCollapsed = false }: { initialCollapsed?: boolean }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [activeStep, setActiveStep] = useState("data-overview");

  const steps = sampleWorkflowSteps.map((s) => ({
    ...s,
    active: s.id === activeStep,
    onClick: () => setActiveStep(s.id),
  }));

  return (
    <DataAppSidebar
      appName="HTS"
      appFullName="HTS Hit Finder"
      pages={samplePages}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      showWorkflow
      workflowSteps={steps}
      workflowCollapsed={collapsed}
      onWorkflowCollapseChange={setCollapsed}
    />
  );
};

export const Default: Story = {
  name: "Default",
  render: () => <DefaultComponent />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Sidebar renders app name", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
    });

    await step("Page entries render", async () => {
      expect(canvas.getByText("Project")).toBeInTheDocument();
      expect(canvas.getByText("Explorer")).toBeInTheDocument();
    });

    await step("Workflow steps render", async () => {
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
      expect(canvas.getByText("Global Filtering")).toBeInTheDocument();
      expect(canvas.getByText("Explore Clusters")).toBeInTheDocument();
    });

    await step("User initials render", async () => {
      expect(canvas.getByText("EL")).toBeInTheDocument();
    });
  },
};

export const CollapsedWorkflow: Story = {
  name: "Collapsed Workflow",
  render: () => <DefaultComponent initialCollapsed />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Main sidebar is hidden when workflow is collapsed", async () => {
      expect(canvas.queryByText("HTS")).not.toBeInTheDocument();
      expect(canvas.queryByText("Project")).not.toBeInTheDocument();
      // Step labels should not be visible either
      expect(canvas.queryByText("Data Overview")).not.toBeInTheDocument();
    });
  },
};

export const NoWorkflow: Story = {
  name: "No Workflow (Non-workflow Page)",
  args: {
    appName: "DEL",
    pages: [
      {
        id: "project",
        label: "Project",
        icon: ClipboardList,
        active: true,
      },
      { id: "explorer", label: "Explorer", icon: Search },
    ],
    user: { name: "John Doe", role: "USER" },
    userMenuItems: sampleMenuItems,
    showWorkflow: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Only sidebar rail shows, no workflow panel", async () => {
      expect(canvas.getByText("DEL")).toBeInTheDocument();
      expect(canvas.queryByText("Workflow")).not.toBeInTheDocument();
    });
  },
};

const InteractiveComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState("data-overview");
  const [activePage, setActivePage] = useState("project");

  const pages: SidebarPageEntry[] = [
    {
      id: "project",
      label: "Project",
      icon: ClipboardList,
      active: activePage === "project",
      onClick: () => setActivePage("project"),
    },
    {
      id: "explorer",
      label: "Explorer",
      icon: Search,
      active: activePage === "explorer",
      onClick: () => setActivePage("explorer"),
    },
  ];

  const steps: WorkflowStep[] = sampleWorkflowSteps.map((s) => ({
    ...s,
    active: s.id === activeStep,
    onClick: () => setActiveStep(s.id),
  }));

  return (
    <DataAppSidebar
      appName="HTS"
      appFullName="HTS Hit Finder"
      pages={pages}
      user={sampleUser}
      userMenuItems={sampleMenuItems}
      showWorkflow={activePage === "project"}
      workflowSteps={steps}
      workflowCollapsed={collapsed}
      onWorkflowCollapseChange={setCollapsed}
    />
  );
};

export const Interactive: Story = {
  name: "Interactive",
  render: () => <InteractiveComponent />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Interactive sidebar renders", async () => {
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
    });
  },
};
