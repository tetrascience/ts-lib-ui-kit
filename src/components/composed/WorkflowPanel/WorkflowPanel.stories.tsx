import {
  Database,
  Filter,
  FlaskConical,
  GitMerge,
  LineChart,
  Upload,
} from "lucide-react";
import * as React from "react";

import { WorkflowPanel } from "./WorkflowPanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof WorkflowPanel> = {
  title: "Composed/WorkflowPanel",
  component: WorkflowPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex h-[500px] border rounded-lg overflow-hidden">
        <Story />
        <div className="flex-1 p-6 bg-background">
          <p className="text-sm text-muted-foreground">Main content area</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSteps = [
  { id: "ingest", label: "Data Ingest", icon: Upload, input: 649000, output: 649000 },
  { id: "parse", label: "Parse & Validate", icon: Filter, input: 649000, output: 4800 },
  { id: "transform", label: "Transform", icon: GitMerge, input: 4800, output: 4800 },
  { id: "analyze", label: "Analysis", icon: FlaskConical, input: 4800, output: 20 },
  { id: "store", label: "Store Results", icon: Database, input: 20, output: 20 },
  { id: "visualize", label: "Visualize", icon: LineChart },
];

export const Expanded: Story = {
  args: {
    steps: sampleSteps,
    activeStepId: "transform",
    collapsed: false,
    onStepClick: () => {},
    onToggleCollapse: () => {},
  },
};

export const Collapsed: Story = {
  args: {
    steps: sampleSteps,
    activeStepId: "analyze",
    collapsed: true,
    onStepClick: () => {},
    onToggleCollapse: () => {},
  },
};

export const FirstStepActive: Story = {
  args: {
    steps: sampleSteps,
    activeStepId: "ingest",
    collapsed: false,
    onStepClick: () => {},
    onToggleCollapse: () => {},
  },
};

export const NoDataCounts: Story = {
  args: {
    steps: [
      { id: "step1", label: "Step One", icon: Upload },
      { id: "step2", label: "Step Two", icon: Filter },
      { id: "step3", label: "Step Three", icon: FlaskConical },
    ],
    activeStepId: "step2",
    collapsed: false,
    onStepClick: () => {},
    onToggleCollapse: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeStepId, setActiveStepId] = React.useState("parse");
    const [collapsed, setCollapsed] = React.useState(false);

    return (
      <div className="flex h-[500px] border rounded-lg overflow-hidden">
        <WorkflowPanel
          steps={sampleSteps}
          activeStepId={activeStepId}
          onStepClick={setActiveStepId}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <div className="flex-1 p-6 bg-background">
          <p className="text-sm text-muted-foreground">
            Active step: <strong>{activeStepId}</strong>
          </p>
        </div>
      </div>
    );
  },
};
