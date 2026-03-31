import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Textarea renders", async () => {
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
    })

    await step("Placeholder is shown", async () => {
      expect(
        canvas.getByPlaceholderText("Add any notes for reviewers"),
      ).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Disabled textarea renders with value", async () => {
      const field = canvas.getByRole("textbox")
      expect(field).toBeDisabled()
      expect(field).toHaveValue("Review complete. Changes approved.")
    })
  },
}