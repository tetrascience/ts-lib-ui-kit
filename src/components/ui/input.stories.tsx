import { expect, within } from "storybook/test"

import { Input } from "./input"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Input> = {
  title: "Components/Forms & Inputs/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "default", "lg"],
    },
  },
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

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
  render: renderInput,
  parameters: {
    zephyr: { testCaseId: "SW-T5686" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("xs input renders at 24px, matching Button xs", async () => {
      const input = canvas.getByRole("textbox")
      expect(input).toHaveAttribute("data-size", "xs")
      expect(Math.round(input.getBoundingClientRect().height)).toBe(24)
    })
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderInput,
  parameters: {
    zephyr: { testCaseId: "SW-T5687" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("lg input renders at 36px", async () => {
      const input = canvas.getByRole("textbox")
      expect(Math.round(input.getBoundingClientRect().height)).toBe(36)
    })
  },
}
