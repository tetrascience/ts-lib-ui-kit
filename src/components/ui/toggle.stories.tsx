import { BoldIcon } from "lucide-react"
import { expect, within } from "storybook/test"

import { Toggle } from "./toggle"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg"],
    },
  },
  args: {
    variant: "default",
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof Toggle>

function renderToggle(args: Story["args"]) {
  return (
    <Toggle {...args}>
      <BoldIcon />
      Bold
    </Toggle>
  )
}

export const Default: Story = {
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1322" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Toggle button renders with label", async () => {
      expect(canvas.getByRole("button", { name: /bold/i })).toBeInTheDocument()
    })
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1323" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Outline toggle renders", async () => {
      expect(canvas.getByRole("button", { name: /bold/i })).toBeInTheDocument()
    })
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1324" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Small toggle renders", async () => {
      expect(canvas.getByRole("button", { name: /bold/i })).toBeInTheDocument()
    })
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1325" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Large toggle renders", async () => {
      expect(canvas.getByRole("button", { name: /bold/i })).toBeInTheDocument()
    })
  },
}