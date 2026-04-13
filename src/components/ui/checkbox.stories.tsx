import { expect, within } from "storybook/test"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Checkbox>

function CheckboxExample(props: React.ComponentProps<typeof Checkbox>) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="storybook-checkbox" {...props} />
      <Label htmlFor="storybook-checkbox">Email me when the build completes</Label>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <CheckboxExample />,
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
  render: (args) => <CheckboxExample defaultChecked />,
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
  render: (args) => <CheckboxExample disabled />,
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