import { expect, within } from "storybook/test"

import { Button } from "./button"
import { Spinner } from "./spinner"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "default", "md", "lg"],
      description: "Controls the spinner diameter. sm (20px) for inline use, default (24px) general purpose, md (32px) for panels, lg (48px) for full-page loading.",
    },
  },
}

export default meta

type Story = StoryObj<typeof Spinner>

const playSpinner: Story["play"] = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement)

  await step("Spinner renders with status role", async () => {
    expect(canvas.getByRole("status", { name: "Loading" })).toBeInTheDocument()
  })

  await step("Spinner is an SVG element", async () => {
    expect(canvas.getByRole("status", { name: "Loading" }).tagName.toLowerCase()).toBe("svg")
  })
}

export const Default: Story = {
  args: { size: "default" },
  parameters: {
    zephyr: { testCaseId: "SW-T1302" },
  },
  play: playSpinner,
}

export const Large: Story = {
  args: { size: "lg" },
  parameters: {
    zephyr: { testCaseId: "SW-T1303" },
  },
  play: playSpinner,
}

export const Small: Story = {
  args: { size: "sm" },
  play: playSpinner,
  parameters: {
    zephyr: { testCaseId: "SW-T1405" },
  },
}

export const Medium: Story = {
  args: { size: "md" },
  play: playSpinner,
  parameters: {
    zephyr: { testCaseId: "SW-T1406" },
  },
}

export const InlineWithText: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <Spinner size="sm" />
      <span>Loading results...</span>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Spinner and text render together", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument()
      expect(canvas.getByText("Loading results...")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1407" },
  },
}

export const FullPageLoader: Story = {
  render: (args) => (
    <div className="flex min-h-[200px] w-[400px] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Full page loader renders", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument()
      expect(canvas.getByText("Loading...")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1408" },
  },
}

export const InsideButton: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <Button disabled>
        <Spinner size="sm" />
        Saving...
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" />
        Loading
      </Button>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Both buttons with spinners render", async () => {
      const spinners = canvas.getAllByRole("status")
      expect(spinners).toHaveLength(2)
    })

    await step("Buttons are disabled while loading", async () => {
      const buttons = canvas.getAllByRole("button")
      buttons.forEach((btn) => expect(btn).toBeDisabled())
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1409" },
  },
}

export const CustomColor: Story = {
  args: { size: "md" },
  render: ({ size }) => (
    <div className="flex items-center gap-6">
      <Spinner size={size} className="text-blue-500" />
      <Spinner size={size} className="text-green-500" />
      <Spinner size={size} className="text-orange-500" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Three custom-colored spinners render", async () => {
      const spinners = canvas.getAllByRole("status")
      expect(spinners).toHaveLength(3)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1410" },
  },
}
