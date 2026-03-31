import { expect, within } from "storybook/test"

import { Separator } from "./separator"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    orientation: "horizontal",
  },
}

export default meta

type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <div className="text-sm font-medium">Overview</div>
      <Separator />
      <div className="text-sm text-muted-foreground">Separate sections without adding visual weight.</div>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1282" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Component renders", async () => {
      expect(canvas.getByText("Overview")).toBeInTheDocument()
      expect(
        canvas.getByText("Separate sections without adding visual weight."),
      ).toBeInTheDocument()
    })

    await step("Separator is present", async () => {
      expect(canvasElement.querySelector('[data-slot="separator"]')).toBeInTheDocument()
    })
  },
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm">Activity</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-muted-foreground">Deployments</span>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1283" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Component renders", async () => {
      expect(canvas.getByText("Activity")).toBeInTheDocument()
      expect(canvas.getByText("Deployments")).toBeInTheDocument()
    })

    await step("Separator is present", async () => {
      expect(canvasElement.querySelector('[data-slot="separator"]')).toBeInTheDocument()
    })
  },
}