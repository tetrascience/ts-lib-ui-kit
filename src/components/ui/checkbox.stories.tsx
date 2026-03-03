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
  render: () => <CheckboxExample />,
  parameters: {
    zephyr: { testCaseId: "SW-T1216" },
  },
}

export const Checked: Story = {
  render: () => <CheckboxExample defaultChecked />,
  parameters: {
    zephyr: { testCaseId: "SW-T1217" },
  },
}

export const Disabled: Story = {
  render: () => <CheckboxExample disabled />,
  parameters: {
    zephyr: { testCaseId: "SW-T1218" },
  },
}