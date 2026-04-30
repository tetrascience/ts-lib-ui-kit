import { expect, within } from "storybook/test"

import { Shimmer, TS_SHIMMER_GRADIENT } from "./shimmer"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Shimmer> = {
  title: "AI Elements/Shimmer",
  component: Shimmer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Shimmer>

export const Default: Story = {
  args: {
    children: "Generating response...",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Shimmer text renders", async () => {
      await expect(canvas.getByText("Generating response...")).toBeInTheDocument()
    })
  },
}

export const Heading: Story = {
  args: {
    as: "h2",
    children: "Thinking about your question",
    className: "text-2xl font-bold",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Shimmer heading renders", async () => {
      await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument()
    })
  },
}

export const LongText: Story = {
  args: {
    children:
      "The model is carefully reasoning through the problem and formulating a detailed response for you.",
    className: "max-w-sm text-sm text-muted-foreground",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Long shimmer text renders", async () => {
      await expect(canvas.getByText(/carefully reasoning/)).toBeInTheDocument()
    })
  },
}

export const CustomDuration: Story = {
  args: {
    children: "Processing...",
    duration: 3,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Custom duration shimmer renders", async () => {
      await expect(canvas.getByText("Processing...")).toBeInTheDocument()
    })
  },
}

export const BrandGradient: Story = {
  args: {
    children: "Thinking about your question...",
    gradient: TS_SHIMMER_GRADIENT,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Brand gradient shimmer renders", async () => {
      await expect(canvas.getByText("Thinking about your question...")).toBeInTheDocument()
    })
  },
}

export const InContext: Story = {
  render: () => (
    <div className="max-w-md space-y-2 rounded-lg border p-4">
      <Shimmer as="p" className="text-sm">Analyzing your data...</Shimmer>
      <Shimmer as="p" className="text-sm opacity-80">Cross-referencing sources...</Shimmer>
      <Shimmer as="p" className="text-sm opacity-60">Preparing summary...</Shimmer>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Multiple shimmers render", async () => {
      await expect(canvas.getByText("Analyzing your data...")).toBeInTheDocument()
      await expect(canvas.getByText("Preparing summary...")).toBeInTheDocument()
    })
  },
}
