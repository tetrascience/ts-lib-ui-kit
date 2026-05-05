import * as React from "react";

import { LinearProgress } from "./linear-progress";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof LinearProgress> = {
  title: "UI/LinearProgress",
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
};

export const Determinate25: Story = {
  name: "Determinate 25%",
  args: {
    value: 25,
  },
};

export const Determinate50: Story = {
  name: "Determinate 50%",
  args: {
    value: 50,
  },
};

export const Determinate100: Story = {
  name: "Determinate 100%",
  args: {
    value: 100,
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
