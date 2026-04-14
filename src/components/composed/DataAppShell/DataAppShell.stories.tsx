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

import DataAppShell from "./DataAppShell";

import type { Meta, StoryObj } from "@storybook/react-vite";

// =============================================================================
// Meta
// =============================================================================

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
// Sample data (HTS Hit Finder scenario from screenshots)
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
// Mock compound data
// =============================================================================

interface CompoundRow {
  compoundId: string;
  run: string;
  inhibition: number;
  zScore: number;
  sigmaClass: string;
}

const mockCompounds: CompoundRow[] = [
  { compoundId: "CPD-104566", run: "R001", inhibition: 94.4, zScore: 7.62, sigmaClass: "3σ" },
  { compoundId: "CPD-394975", run: "R001", inhibition: 87.9, zScore: 7.09, sigmaClass: "3σ" },
  { compoundId: "CPD-318023", run: "R001", inhibition: 86.3, zScore: 6.96, sigmaClass: "3σ" },
  { compoundId: "CPD-503859", run: "R001", inhibition: 85.4, zScore: 6.89, sigmaClass: "3σ" },
  { compoundId: "CPD-470147", run: "R001", inhibition: 84.7, zScore: 6.83, sigmaClass: "3σ" },
  { compoundId: "CPD-509850", run: "R001", inhibition: 83.7, zScore: 6.76, sigmaClass: "3σ" },
  { compoundId: "CPD-175140", run: "R001", inhibition: 83.2, zScore: 6.71, sigmaClass: "3σ" },
  { compoundId: "CPD-180557", run: "R001", inhibition: 83.0, zScore: 6.70, sigmaClass: "3σ" },
  { compoundId: "CPD-453298", run: "R001", inhibition: 82.6, zScore: 6.66, sigmaClass: "3σ" },
  { compoundId: "CPD-172584", run: "R001", inhibition: 82.0, zScore: 6.61, sigmaClass: "3σ" },
  { compoundId: "CPD-389739", run: "R001", inhibition: 81.6, zScore: 6.59, sigmaClass: "3σ" },
  { compoundId: "CPD-198813", run: "R001", inhibition: 81.5, zScore: 6.57, sigmaClass: "3σ" },
  { compoundId: "CPD-396259", run: "R001", inhibition: 81.4, zScore: 6.57, sigmaClass: "3σ" },
  { compoundId: "CPD-510004", run: "R001", inhibition: 80.4, zScore: 6.49, sigmaClass: "3σ" },
  { compoundId: "CPD-395964", run: "R001", inhibition: 80.4, zScore: 6.48, sigmaClass: "3σ" },
  { compoundId: "CPD-110244", run: "R001", inhibition: 80.3, zScore: 6.48, sigmaClass: "3σ" },
  { compoundId: "CPD-509771", run: "R001", inhibition: 80.2, zScore: 6.47, sigmaClass: "3σ" },
  { compoundId: "CPD-143105", run: "R001", inhibition: 79.9, zScore: 6.45, sigmaClass: "3σ" },
  { compoundId: "CPD-287341", run: "R001", inhibition: 79.1, zScore: 6.38, sigmaClass: "3σ" },
  { compoundId: "CPD-662150", run: "R001", inhibition: 78.5, zScore: 6.31, sigmaClass: "3σ" },
];

function CompoundTable({ compounds }: { compounds: CompoundRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
          <th className="pt-3 pb-2 pr-4 pl-2">Compound ID</th>
          <th className="pt-3 pb-2 pr-4">Run</th>
          <th className="pt-3 pb-2 pr-4">% Inhibition ▼</th>
          <th className="pt-3 pb-2 pr-4">Z-Score</th>
          <th className="pt-3 pb-2 pr-2">Σ Class</th>
        </tr>
      </thead>
      <tbody>
        {compounds.map((c) => (
          <tr key={c.compoundId} className="border-b border-border/50">
            <td className="py-2.5 pr-4 pl-2 font-mono text-xs text-foreground">{c.compoundId}</td>
            <td className="py-2.5 pr-4 text-muted-foreground">{c.run}</td>
            <td className="py-2.5 pr-4 font-semibold">{c.inhibition.toFixed(1)}%</td>
            <td className="py-2.5 pr-4">{c.zScore.toFixed(2)}</td>
            <td className="py-2.5 pr-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {c.sigmaClass}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// Mock content component
// =============================================================================

function MockContent() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground text-sm">Main content area</p>
    </div>
  );
}

// =============================================================================
// Stories
// =============================================================================

const DefaultShell = ({ initialCollapsed = false }: { initialCollapsed?: boolean }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [activeStep, setActiveStep] = useState("data-overview");
  const [outputPanelOpen, setOutputPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const steps = htsWorkflowSteps.map((s) => ({
    ...s,
    active: s.id === activeStep,
    onClick: () => setActiveStep(s.id),
  }));

  const activeStepIndex = steps.findIndex((s) => s.active);
  const activeStepData = steps[activeStepIndex];
  const isLastStep = activeStepIndex === steps.length - 1;
  const outputCount = activeStepData?.outputCount;
  const inputCount = activeStepData?.inputCount;
  const totalInput = inputCount ?? 0;
  const totalOutput = outputCount ?? 0;

  const dataCounts =
    inputCount == null || outputCount == null
      ? []
      : [
          { label: "INPUT", count: inputCount, variant: "outline" as const },
          {
            label: "Output",
            count: totalOutput,
            variant: "primary" as const,
            onClick: () => setOutputPanelOpen(true),
          },
        ];

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = htsWorkflowSteps[activeStepIndex + 1];
      setActiveStep(nextStep.id);
      setOutputPanelOpen(false);
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
      <div className="relative h-full">
        {/* Main content */}
        <MockContent />

        {/* Output panel (overlay on right side) */}
        {outputPanelOpen && (
          <div className="absolute top-0 right-0 w-[520px] h-full border-l border-border bg-background flex flex-col shadow-lg z-10">
            <div className="flex items-start justify-between px-6 pt-5 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Output Data Table</h2>
                <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                  {totalOutput.toLocaleString()} of {totalInput.toLocaleString()} compounds passing threshold
                </p>
              </div>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer bg-transparent transition-colors"
                onClick={() => setOutputPanelOpen(false)}
              >
                ✕
              </button>
            </div>
            {(() => {
              const totalPages = Math.max(1, Math.ceil(mockCompounds.length / perPage));
              const page = Math.min(currentPage, totalPages);
              const startIdx = (page - 1) * perPage;
              const pageData = mockCompounds.slice(startIdx, startIdx + perPage);
              return (
                <>
                  <div className="flex-1 overflow-auto px-4 border-t border-border">
                    <CompoundTable compounds={pageData} />
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{totalOutput.toLocaleString()} compounds</span>
                      <span className="text-border">|</span>
                      <select
                        className="border border-border rounded px-1.5 py-0.5 text-xs bg-background text-foreground cursor-pointer"
                        value={perPage}
                        onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      >
                        {[10, 25, 50, 100].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <span>/ page</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{page} / {totalPages}</span>
                      <button
                        type="button"
                        disabled={page <= 1}
                        className={`w-7 h-7 flex items-center justify-center rounded border border-border bg-transparent transition-colors ${page <= 1 ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:bg-muted cursor-pointer"}`}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        className={`w-7 h-7 flex items-center justify-center rounded border border-border bg-transparent transition-colors ${page >= totalPages ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:bg-muted cursor-pointer"}`}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
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
      // Sidebar
      expect(canvas.getByText("HTS")).toBeInTheDocument();
      expect(canvas.getByText("Project")).toBeInTheDocument();
      expect(canvas.getByText("Explorer")).toBeInTheDocument();

      // Workflow panel
      expect(canvas.getByText("Workflow")).toBeInTheDocument();
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
      expect(canvas.getByText("Global Filtering")).toBeInTheDocument();

      // Top nav breadcrumbs
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
      expect(canvas.getByText("DUX4")).toBeInTheDocument();

      // Data counts
      expect(canvas.getByText("649,568")).toBeInTheDocument();
      expect(canvas.getByText("645,396")).toBeInTheDocument();

      // Next button
      expect(canvas.getByText("Next")).toBeInTheDocument();

      // Content
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

    await step("Workflow panel is collapsed", async () => {
      // Main sidebar is hidden when workflow is collapsed
      expect(canvas.queryByText("HTS")).not.toBeInTheDocument();
      expect(canvas.queryByText("Project")).not.toBeInTheDocument();
      // Step labels should not be visible in collapsed mode
      expect(canvas.queryByText("Data Overview")).not.toBeInTheDocument();
    });
  },
};

export const NonWorkflowPage: Story = {
  name: "Non-Workflow Page",
  args: {
    appName: "HTS",
    pages: htsPages,
    user: sampleUser,
    userMenuItems: sampleMenuItems,
    showWorkflow: false,
    breadcrumbs: [
      { label: "All Projects", isClickable: false },
    ],
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
