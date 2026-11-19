import { expect, within } from "storybook/test";

import { QcMetricCard } from "./QcMetricCard";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof QcMetricCard> = {
  title: "Design Patterns/QC Metric Card",
  component: QcMetricCard,
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

type Story = StoryObj<typeof QcMetricCard>;

export const Pass: Story = {
  args: {
    label: "Recovery",
    value: "98.2",
    unit: "%",
    target: "95 - 105 %",
    status: "pass",
    trend: "up",
    delta: "+0.4 vs last run",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("group", { name: "Recovery" });

    await step("Metric name, value and unit render", async () => {
      expect(within(card).getByText("Recovery")).toBeInTheDocument();
      expect(within(card).getByText("98.2")).toBeInTheDocument();
      expect(within(card).getByText("%")).toBeInTheDocument();
    });

    await step("Target and delta render as text", async () => {
      expect(within(card).getByText("Target: 95 - 105 %")).toBeInTheDocument();
      expect(within(card).getByText("+0.4 vs last run")).toBeInTheDocument();
    });

    await step("Status is stated in text, not colour alone", async () => {
      expect(card).toHaveAttribute("data-status", "pass");
      expect(within(card).getByText("Pass")).toBeInTheDocument();
    });
  },
};

export const Warn: Story = {
  args: {
    label: "Peak Asymmetry",
    value: "1.9",
    target: "0.8 - 1.5",
    status: "warn",
    trend: "down",
    delta: "-0.2 vs last run",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("group", { name: "Peak Asymmetry" });

    await step("Warning status is stated in text", async () => {
      expect(card).toHaveAttribute("data-status", "warn");
      expect(within(card).getByText("Warning")).toBeInTheDocument();
    });

    await step("Value without unit renders", async () => {
      expect(within(card).getByText("1.9")).toBeInTheDocument();
      expect(within(card).getByText("Target: 0.8 - 1.5")).toBeInTheDocument();
    });
  },
};

export const Fail: Story = {
  args: {
    label: "Signal-to-Noise",
    value: 4,
    unit: "ratio",
    target: "≥ 10",
    status: "fail",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("group", { name: "Signal-to-Noise" });

    await step("Fail status is stated in text", async () => {
      expect(card).toHaveAttribute("data-status", "fail");
      expect(within(card).getByText("Fail")).toBeInTheDocument();
    });

    await step("Card without a trend renders no delta", async () => {
      expect(within(card).getByText("4")).toBeInTheDocument();
      expect(card.querySelectorAll("svg")).toHaveLength(1);
    });
  },
};

export const CustomLabels: Story = {
  args: {
    label: "Recuperación",
    value: "97.0",
    unit: "%",
    target: "95 - 105 %",
    status: "pass",
    passLabel: "Aprobado",
    targetLabel: "Objetivo",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("group", { name: "Recuperación" });

    await step("Overridden status and target labels render", async () => {
      expect(within(card).getByText("Aprobado")).toBeInTheDocument();
      expect(within(card).getByText("Objetivo: 95 - 105 %")).toBeInTheDocument();
      expect(within(card).queryByText("Pass")).toBeNull();
      expect(within(card).queryByText("Target: 95 - 105 %")).toBeNull();
    });
  },
};
