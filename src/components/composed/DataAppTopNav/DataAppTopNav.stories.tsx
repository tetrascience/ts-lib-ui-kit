import { RefreshCw, Settings } from "lucide-react";
import { expect, within } from "storybook/test";

import DataAppTopNav from "./DataAppTopNav";

import type { DataCount, TopNavBreadcrumbItem } from "./DataAppTopNav";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof DataAppTopNav> = {
  title: "Components/DataAppTopNav",
  component: DataAppTopNav,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataAppTopNav>;

// =============================================================================
// Sample data
// =============================================================================

const sampleBreadcrumbs: TopNavBreadcrumbItem[] = [
  { label: "All Projects", isClickable: true, onClick: () => console.log("All Projects") },
  { label: "DUX4", isClickable: true, onClick: () => console.log("DUX4") },
  { label: "Primary Screening", isClickable: true, onClick: () => console.log("Primary Screening") },
  { label: "Data Overview", isClickable: false },
];

const sampleDataCounts: DataCount[] = [
  { label: "INPUT", count: 649568, variant: "outline" },
  { label: "Output", count: 645396, variant: "primary", onClick: () => console.log("Open output table") },
];

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  name: "Default",
  args: {
    breadcrumbs: sampleBreadcrumbs,
    dataCounts: sampleDataCounts,
    showNextButton: true,
    nextButtonLabel: "Next",
    onNextClick: () => console.log("Next clicked"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Breadcrumbs render", async () => {
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
      expect(canvas.getByText("DUX4")).toBeInTheDocument();
      expect(canvas.getByText("Data Overview")).toBeInTheDocument();
    });

    await step("Data counts render", async () => {
      expect(canvas.getByText("649,568")).toBeInTheDocument();
      expect(canvas.getByText("645,396")).toBeInTheDocument();
    });

    await step("Next button renders", async () => {
      expect(canvas.getByText("Next")).toBeInTheDocument();
    });
  },
};

export const BreadcrumbsOnly: Story = {
  name: "Breadcrumbs Only",
  args: {
    breadcrumbs: [
      { label: "All Projects", isClickable: true },
      { label: "My Project", isClickable: false },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Shows minimal breadcrumbs without actions", async () => {
      expect(canvas.getByText("All Projects")).toBeInTheDocument();
      expect(canvas.getByText("My Project")).toBeInTheDocument();
      expect(canvas.queryByText("Next")).not.toBeInTheDocument();
    });
  },
};

export const WithCustomActions: Story = {
  name: "With Custom Actions",
  args: {
    breadcrumbs: sampleBreadcrumbs,
    dataCounts: sampleDataCounts,
    showNextButton: true,
    actions: (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Custom action buttons render", async () => {
      expect(canvas.getByTitle("Refresh")).toBeInTheDocument();
      expect(canvas.getByTitle("Settings")).toBeInTheDocument();
    });
  },
};

export const DisabledNext: Story = {
  name: "Disabled Next Button",
  args: {
    breadcrumbs: sampleBreadcrumbs,
    showNextButton: true,
    nextButtonLabel: "Next",
    nextButtonDisabled: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Next button is disabled", async () => {
      const btn = canvas.getByText("Next").closest("button");
      expect(btn).toBeDisabled();
    });
  },
};
