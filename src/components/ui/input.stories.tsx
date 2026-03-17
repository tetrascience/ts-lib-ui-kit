import { Input } from "./input"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Enter a value",
    type: "text",
  },
}

export default meta

type Story = StoryObj<typeof Input>

function renderInput(args: Story["args"]) {
  return <Input {...args} className="w-[320px]" />
}

export const Default: Story = {
  render: renderInput,
  parameters: {
    zephyr: { testCaseId: "SW-T1257" },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Build completed",
  },
  render: renderInput,
  parameters: {
    zephyr: { testCaseId: "SW-T1258" },
  },
}

export const File: Story = {
  args: {
    type: "file",
  },
  render: renderInput,
  parameters: {
    zephyr: { testCaseId: "SW-T1259" },
  },
}