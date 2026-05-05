import { ActivityFeed } from "./ActivityFeed";

import type { ActivityFeedItem } from "./ActivityFeed";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ActivityFeed> = {
  title: "Composed/ActivityFeed",
  component: ActivityFeed,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[520px] rounded-lg border bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: ActivityFeedItem[] = [
  {
    id: "1",
    type: "success",
    title: "Job JOB-8821 completed",
    description: "Processed 4,800 records in 3.2 minutes.",
    actor: "Automated pipeline",
    timestamp: "2 min ago",
    badges: ["v2.4.1"],
  },
  {
    id: "2",
    type: "upload",
    title: "Dataset uploaded",
    description: "proteomics_run_42.csv (2.3 MB)",
    actor: "Dr. Jane Smith",
    timestamp: "18 min ago",
  },
  {
    id: "3",
    type: "error",
    title: "Job JOB-8820 failed",
    description: "Schema mismatch on column 'sample_id'. Expected string, got integer.",
    actor: "Automated pipeline",
    timestamp: "1h ago",
    badges: ["v2.4.0"],
  },
  {
    id: "4",
    type: "user",
    title: "New member added",
    description: "Sarah Chen joined the Chemistry team.",
    actor: "Mark Thompson",
    timestamp: "3h ago",
  },
  {
    id: "5",
    type: "warning",
    title: "High missing-value rate detected",
    description: "Column 'compound_id' has 34% missing values in the latest import.",
    timestamp: "5h ago",
    badges: ["Dataset Alpha"],
  },
  {
    id: "6",
    type: "deploy",
    title: "Pipeline configuration updated",
    actor: "Mark Thompson",
    timestamp: "Yesterday",
    badges: ["main", "v2.4.1"],
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const WithLoadMore: Story = {
  args: {
    items: sampleItems,
    onLoadMore: () => {},
  },
};

export const MinimalEvents: Story = {
  args: {
    items: [
      { id: "a", type: "success", title: "Build passed", timestamp: "Just now" },
      { id: "b", type: "info", title: "Deploy started", timestamp: "1 min ago" },
      { id: "c", type: "deploy", title: "Production updated", timestamp: "4 min ago" },
    ],
  },
};

export const AllEventTypes: Story = {
  args: {
    items: [
      { id: "1", type: "success", title: "Success event", timestamp: "Now" },
      { id: "2", type: "info", title: "Info event", timestamp: "1m" },
      { id: "3", type: "warning", title: "Warning event", timestamp: "2m" },
      { id: "4", type: "error", title: "Error event", timestamp: "3m" },
      { id: "5", type: "upload", title: "Upload event", timestamp: "4m" },
      { id: "6", type: "user", title: "User event", timestamp: "5m" },
      { id: "7", type: "deploy", title: "Deploy event", timestamp: "6m" },
    ],
  },
};
