import { StatusBadge } from "./status-badge";

import type { JobStatus } from "./status-badge";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof StatusBadge> = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: { type: "select" },
      options: ["running", "queued", "completed", "failed", "paused", "cancelled"] satisfies JobStatus[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: { status: "running" },
};

export const Queued: Story = {
  args: { status: "queued" },
};

export const Completed: Story = {
  args: { status: "completed" },
};

export const Failed: Story = {
  args: { status: "failed" },
};

export const Paused: Story = {
  args: { status: "paused" },
};

export const Cancelled: Story = {
  args: { status: "cancelled" },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["running", "queued", "completed", "failed", "paused", "cancelled"] satisfies JobStatus[]).map(
        (s) => <StatusBadge key={s} status={s} />
      )}
    </div>
  ),
};

export const PulseOff: Story = {
  name: "Running (pulse disabled)",
  args: { status: "running", pulse: false },
};
