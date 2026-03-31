import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Text input renders", async () => {
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Enter a value")).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Disabled input renders with value", async () => {
      const input = canvas.getByRole("textbox")
      expect(input).toBeDisabled()
      expect(input).toHaveValue("Build completed")
    })
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
  play: async ({ canvasElement, step }) => {
    await step("File input renders", async () => {
      const fileInput = canvasElement.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })
  },
}