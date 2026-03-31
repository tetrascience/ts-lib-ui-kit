import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Toggle group container renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
    })

    await step("Alignment toggle buttons render", async () => {
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Outline toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Small toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Large toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Spaced toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
    })
  },
}