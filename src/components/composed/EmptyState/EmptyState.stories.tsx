import { FlaskConical } from "lucide-react";


import { EmptyState } from "./EmptyState";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof EmptyState> = {
  title: "Composed/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96 rounded-lg border bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoData: Story = {
  args: {
    variant: "no-data",
    action: <Button size="sm">Import data</Button>,
  },
};

export const NoResults: Story = {
  args: {
    variant: "no-results",
    action: (
      <Button variant="ghost" size="sm">
        Clear filters
      </Button>
    ),
  },
};

export const NoAccess: Story = {
  args: { variant: "no-access" },
};

export const EmptyFolder: Story = {
  args: {
    variant: "empty-folder",
    action: (
      <Button size="sm" variant="outline">
        Upload files
      </Button>
    ),
  },
};

export const ServerError: Story = {
  args: {
    variant: "server-error",
    action: (
      <Button size="sm" variant="outline">
        Retry
      </Button>
    ),
  },
};

export const CustomContent: Story = {
  args: {
    icon: FlaskConical,
    title: "No experiments run yet",
    description: "Configure your protocol and run your first experiment.",
    action: <Button size="sm">Create experiment</Button>,
  },
};

export const OverrideTitle: Story = {
  name: "Variant with overridden title",
  args: {
    variant: "no-data",
    title: "No pipelines configured",
    description: "Create a pipeline to start processing your data.",
  },
};
