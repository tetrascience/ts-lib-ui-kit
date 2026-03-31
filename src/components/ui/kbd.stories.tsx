import { expect, within } from "storybook/test"

import { Kbd, KbdGroup } from "./kbd"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  render: () => <Kbd>⌘K</Kbd>,
  parameters: {
    zephyr: { testCaseId: "SW-T1266" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Keyboard shortcut text renders", async () => {
      expect(canvas.getByText("⌘K")).toBeInTheDocument()
    })
  },
}

export const Grouped: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      Open command menu
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1267" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and grouped shortcut keys render", async () => {
      expect(canvas.getByText("Open command menu")).toBeInTheDocument()
      expect(canvas.getByText("⌘")).toBeInTheDocument()
      expect(canvas.getByText("K", { selector: "kbd" })).toBeInTheDocument()
    })
  },
}