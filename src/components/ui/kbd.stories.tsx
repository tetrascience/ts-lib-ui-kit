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
}