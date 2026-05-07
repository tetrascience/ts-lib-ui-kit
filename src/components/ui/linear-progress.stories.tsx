import * as React from "react";
import { expect, within } from "storybook/test";

import { LinearProgress } from "./linear-progress";

import type { Meta, StoryObj } from "@storybook/react-vite";

function getInnerBar(bar: HTMLElement): HTMLElement {
  const el = bar.querySelector("div");
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

const meta: Meta<typeof LinearProgress> = {
  title: "Design Patterns/LinearProgress",
  component: LinearProgress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    const inner = getInnerBar(bar);

    await step("Renders progressbar with correct ARIA attributes", async () => {
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveAttribute("data-slot", "linear-progress");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    await step("Does not set aria-valuenow in indeterminate mode", async () => {
      expect(bar).not.toHaveAttribute("aria-valuenow");
    });

    await step("Renders the sliding inner bar element", async () => {
      expect(inner).toBeInTheDocument();
    });
  },
};

export const Determinate25: Story = {
  name: "Determinate 25%",
  args: {
    value: 25,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    const inner = getInnerBar(bar);

    await step("Renders progressbar with aria-valuenow=25", async () => {
      expect(bar).toHaveAttribute("aria-valuenow", "25");
    });

    await step("Inner bar reflects 25% width", async () => {
      expect(inner.style.width).toBe("25%");
    });
  },
};

export const Determinate50: Story = {
  name: "Determinate 50%",
  args: {
    value: 50,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    const inner = getInnerBar(bar);

    await step("Renders progressbar with aria-valuenow=50", async () => {
      expect(bar).toHaveAttribute("aria-valuenow", "50");
    });

    await step("Inner bar reflects 50% width", async () => {
      expect(inner.style.width).toBe("50%");
    });
  },
};

export const Determinate100: Story = {
  name: "Determinate 100%",
  args: {
    value: 100,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    const inner = getInnerBar(bar);

    await step("Renders progressbar with aria-valuenow=100", async () => {
      expect(bar).toHaveAttribute("aria-valuenow", "100");
    });

    await step("Inner bar reflects 100% width", async () => {
      expect(inner.style.width).toBe("100%");
    });
  },
};

export const Interactive: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [running, setRunning] = React.useState(false);

    React.useEffect(() => {
      if (!running) return;
      if (progress >= 100) {
        setRunning(false);
        return;
      }
      const id = setInterval(() => setProgress((p) => Math.min(p + 5, 100)), 200);
      return () => clearInterval(id);
    }, [running, progress]);

    return (
      <div className="flex w-80 flex-col gap-4">
        <LinearProgress value={progress} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{progress}%</span>
          <button
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground"
            onClick={() => {
              setProgress(0);
              setRunning(true);
            }}
          >
            Start upload
          </button>
        </div>
      </div>
    );
  },
};
