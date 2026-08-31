import { expect, within } from "storybook/test"

import { Progress } from "./progress"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Progress> = {
  title: "Components/Feedback & Status/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description:
        "Completion percentage, 0–100. Pass `null` (or omit) for an indeterminate bar when total work is unknown.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: { value: 60, "aria-label": "Upload progress" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Renders with progressbar role and current value", async () => {
      const bar = canvas.getByRole("progressbar")
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveAttribute("aria-valuenow", "60")
      expect(bar).toHaveAttribute("data-state", "loading")
    })
  },
}

export const Empty: Story = {
  args: { value: 0, "aria-label": "Upload progress" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Zero progress still exposes a value", async () => {
      expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
    })
  },
}

export const Complete: Story = {
  args: { value: 100, "aria-label": "Upload progress" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Completed bar reports state as complete", async () => {
      const bar = canvas.getByRole("progressbar")
      expect(bar).toHaveAttribute("aria-valuenow", "100")
      expect(bar).toHaveAttribute("data-state", "complete")
    })
  },
}

export const Indeterminate: Story = {
  args: { value: null, "aria-label": "Upload progress" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Indeterminate bar omits a current value", async () => {
      const bar = canvas.getByRole("progressbar")
      expect(bar).toHaveAttribute("data-state", "indeterminate")
      expect(bar).not.toHaveAttribute("aria-valuenow")
    })
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">Ingesting run files</span>
        <span className="text-muted-foreground tabular-nums">42%</span>
      </div>
      <Progress value={42} aria-label="Ingesting run files" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Bar is labelled and matches the printed percentage", async () => {
      const bar = canvas.getByRole("progressbar", { name: "Ingesting run files" })
      expect(bar).toHaveAttribute("aria-valuenow", "42")
      expect(canvas.getByText("42%")).toBeInTheDocument()
    })
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress value={35} className="h-1" aria-label="Thin" />
      <Progress value={55} aria-label="Default" />
      <Progress value={75} className="h-3" aria-label="Thick" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("All three height overrides render", async () => {
      expect(canvas.getAllByRole("progressbar")).toHaveLength(3)
    })
  },
}

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress
        value={90}
        className="bg-green-500/20 [&_[data-slot=progress-indicator]]:bg-green-500"
        aria-label="Healthy"
      />
      <Progress
        value={70}
        className="bg-orange-500/20 [&_[data-slot=progress-indicator]]:bg-orange-500"
        aria-label="Caution"
      />
      <Progress
        value={25}
        className="bg-destructive/20 [&_[data-slot=progress-indicator]]:bg-destructive"
        aria-label="Error"
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Each semantic variant renders its own bar", async () => {
      expect(canvas.getByRole("progressbar", { name: "Healthy" })).toBeInTheDocument()
      expect(canvas.getByRole("progressbar", { name: "Caution" })).toBeInTheDocument()
      expect(canvas.getByRole("progressbar", { name: "Error" })).toBeInTheDocument()
    })
  },
}
