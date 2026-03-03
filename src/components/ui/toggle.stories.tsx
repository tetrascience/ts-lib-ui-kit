import { BoldIcon } from "lucide-react"

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
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1323" },
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
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderToggle,
  parameters: {
    zephyr: { testCaseId: "SW-T1325" },
  },
}