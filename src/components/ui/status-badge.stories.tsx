import { expect, within } from "storybook/test";

import { StatusBadge } from "./status-badge";

import type { JobStatus } from "./status-badge";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof StatusBadge> = {
  title: "Design Patterns/StatusBadge",
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Running' label", async () => {
      expect(canvas.getByText("Running")).toBeInTheDocument();
    });

    await step("Badge has data-status='running'", async () => {
      expect(badge).toHaveAttribute("data-status", "running");
    });

    await step("Dot pulses by default for running status", async () => {
      const dot = badge.querySelector("span");
      expect(dot).toHaveClass("animate-pulse");
    });
  },
};

export const Queued: Story = {
  args: { status: "queued" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Queued' label", async () => {
      expect(canvas.getByText("Queued")).toBeInTheDocument();
    });

    await step("Badge has data-status='queued'", async () => {
      expect(badge).toHaveAttribute("data-status", "queued");
    });

    await step("Dot does not pulse for queued status", async () => {
      const dot = badge.querySelector("span");
      expect(dot).not.toHaveClass("animate-pulse");
    });
  },
};

export const Completed: Story = {
  args: { status: "completed" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Completed' label", async () => {
      expect(canvas.getByText("Completed")).toBeInTheDocument();
    });

    await step("Badge has data-status='completed'", async () => {
      expect(badge).toHaveAttribute("data-status", "completed");
    });
  },
};

export const Failed: Story = {
  args: { status: "failed" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Failed' label", async () => {
      expect(canvas.getByText("Failed")).toBeInTheDocument();
    });

    await step("Badge has data-status='failed'", async () => {
      expect(badge).toHaveAttribute("data-status", "failed");
    });
  },
};

export const Paused: Story = {
  args: { status: "paused" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Paused' label", async () => {
      expect(canvas.getByText("Paused")).toBeInTheDocument();
    });

    await step("Badge has data-status='paused'", async () => {
      expect(badge).toHaveAttribute("data-status", "paused");
    });
  },
};

export const Cancelled: Story = {
  args: { status: "cancelled" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Cancelled' label", async () => {
      expect(canvas.getByText("Cancelled")).toBeInTheDocument();
    });

    await step("Badge has data-status='cancelled'", async () => {
      expect(badge).toHaveAttribute("data-status", "cancelled");
    });
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["running", "queued", "completed", "failed", "paused", "cancelled"] satisfies JobStatus[]).map(
        (s) => <StatusBadge key={s} status={s} />
      )}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("All six status labels are present", async () => {
      for (const label of ["Running", "Queued", "Completed", "Failed", "Paused", "Cancelled"]) {
        expect(canvas.getByText(label)).toBeInTheDocument();
      }
    });

    await step("All six badges are rendered", async () => {
      const badges = canvasElement.querySelectorAll('[data-slot="status-badge"]');
      expect(badges).toHaveLength(6);
    });
  },
};

export const PulseOff: Story = {
  name: "Running (pulse disabled)",
  args: { status: "running", pulse: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const badgeEl = canvasElement.querySelector('[data-slot="status-badge"]');
    expect(badgeEl).not.toBeNull();
    const badge = badgeEl as Element;

    await step("Renders 'Running' label", async () => {
      expect(canvas.getByText("Running")).toBeInTheDocument();
    });

    await step("Dot does not pulse when pulse=false", async () => {
      const dot = badge.querySelector("span");
      expect(dot).not.toHaveClass("animate-pulse");
    });
  },
};
