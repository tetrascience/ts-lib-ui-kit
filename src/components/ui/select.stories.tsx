import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof SelectTrigger> = {
  title: "Components/Select",
  component: SelectTrigger,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["default", "sm"],
    },
  },
  args: {
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof SelectTrigger>

function renderSelect(args: Story["args"]) {
  return (
    <Select defaultValue="workspace">
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="workspace">Workspace</SelectItem>
        <SelectItem value="report">Report</SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Default: Story = {
  render: renderSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1280" },
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1281" },
  },
}