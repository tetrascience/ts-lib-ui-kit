import { expect, within } from "storybook/test"

import { Input } from "./input"
import { Label } from "./label"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = {
  render: (args) => (
    <div className="grid w-[320px] gap-2">
      <Label htmlFor="storybook-email">Email address</Label>
      <Input id="storybook-email" placeholder="name@company.com" />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1268" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and associated input render", async () => {
      expect(canvas.getByText("Email address")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("name@company.com")).toBeInTheDocument()
    })
  },
}

export const DisabledField: Story = {
  render: (args) => (
    <div className="grid w-[320px] gap-2">
      <Label htmlFor="storybook-disabled">Workspace</Label>
      <Input id="storybook-disabled" disabled value="Production" />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1269" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and disabled input render", async () => {
      expect(canvas.getByText("Workspace")).toBeInTheDocument()
      expect(canvas.getByDisplayValue("Production")).toBeInTheDocument()
    })
  },
}