import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ToggleGroup> = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
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
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    spacing: {
      control: { type: "number" },
    },
  },
  args: {
    variant: "default",
    size: "default",
    orientation: "horizontal",
    spacing: 0,
  },
}

export default meta

type Story = StoryObj<typeof ToggleGroup>

function renderToggleGroup(args: Story["args"]) {
  return (
    <ToggleGroup {...args} defaultValue={["left"]} type="multiple">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export const Default: Story = {
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1316" },
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1317" },
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1318" },
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1319" },
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1320" },
  },
}

export const Spaced: Story = {
  args: {
    spacing: 2,
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1321" },
  },
}