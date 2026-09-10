import { expect, within } from "storybook/test"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Checkbox> = {
  title: "Components/Forms & Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    // Docs "Show code": stories render via a local helper, so serialize the
    // rendered JSX tree instead of printing the helper call / story source.
    docs: { source: { type: "dynamic" } },
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Checkbox>

function renderCheckbox(props: React.ComponentProps<typeof Checkbox> = {}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="storybook-checkbox" {...props} />
      <Label htmlFor="storybook-checkbox">Email me when the build completes</Label>
    </div>
  )
}

export const Default: Story = {
  render: () => renderCheckbox(),
  parameters: {
    zephyr: { testCaseId: "SW-T1216" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Checkbox renders with label", async () => {
      expect(canvas.getByRole("checkbox")).toBeInTheDocument()
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument()
    })
  },
}

export const Checked: Story = {
  render: () => renderCheckbox({ defaultChecked: true }),
  parameters: {
    zephyr: { testCaseId: "SW-T1217" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Checkbox renders checked", async () => {
      expect(canvas.getByRole("checkbox")).toBeChecked()
    })

    await step("Label remains associated", async () => {
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument()
    })
  },
}

export const Disabled: Story = {
  render: () => renderCheckbox({ disabled: true }),
  parameters: {
    zephyr: { testCaseId: "SW-T1218" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Checkbox renders disabled", async () => {
      expect(canvas.getByRole("checkbox")).toBeDisabled()
    })

    await step("Label still visible", async () => {
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument()
    })
  },
}
export const ExtraSmall: Story = {
  render: () => renderCheckbox({ size: "xs", defaultChecked: true }),
  parameters: {
    zephyr: { testCaseId: "SW-T5693" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("xs checkbox box is 14px", async () => {
      const cb = canvas.getByRole("checkbox")
      expect(cb).toHaveAttribute("data-size", "xs")
      expect(Math.round(cb.getBoundingClientRect().height)).toBe(14)
    })
  },
}

export const Large: Story = {
  render: () => renderCheckbox({ size: "lg", defaultChecked: true }),
  parameters: {
    zephyr: { testCaseId: "SW-T5694" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("lg checkbox box is 20px", async () => {
      const cb = canvas.getByRole("checkbox")
      expect(Math.round(cb.getBoundingClientRect().height)).toBe(20)
    })
  },
}
