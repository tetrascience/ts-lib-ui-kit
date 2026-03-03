import { Textarea } from "./textarea"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Add any notes for reviewers",
    rows: 5,
  },
}

export default meta

type Story = StoryObj<typeof Textarea>

function renderTextarea(args: Story["args"]) {
  return <Textarea {...args} className="w-[360px]" />
}

export const Default: Story = {
  render: renderTextarea,
  parameters: {
    zephyr: { testCaseId: "SW-T1314" },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Review complete. Changes approved.",
  },
  render: renderTextarea,
  parameters: {
    zephyr: { testCaseId: "SW-T1315" },
  },
}