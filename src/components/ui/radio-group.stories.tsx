import { RadioGroup, RadioGroupItem } from "./radio-group"

import type { Meta, StoryObj } from "@storybook/react-vite"

const plans = [
  {
    value: "starter",
    label: "Starter",
    description: "For smaller workspaces with basic exports and notifications.",
  },
  {
    value: "team",
    label: "Team",
    description: "Includes shared dashboards, collaboration, and scheduled reports.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Advanced controls for governance, compliance, and large data volumes.",
  },
] as const

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Radio Group",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof RadioGroup>

function renderRadioGroup(disabledValue?: string) {
  return (
    <div className="w-[360px] rounded-xl border bg-background p-4">
      <RadioGroup className="gap-3" defaultValue="team">
        {plans.map((plan) => {
          const id = `radio-group-${plan.value}`

          return (
            <div key={plan.value} className="flex items-start gap-3 rounded-lg border p-3">
              <RadioGroupItem disabled={plan.value === disabledValue} id={id} value={plan.value} />
              <label className="grid gap-1" htmlFor={id}>
                <span className="font-medium">{plan.label}</span>
                <span className="text-sm text-muted-foreground">{plan.description}</span>
              </label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export const Default: Story = {
  render: () => renderRadioGroup(),
  parameters: {
    zephyr: { testCaseId: "SW-T1274" },
  },
}

export const DisabledOption: Story = {
  render: () => renderRadioGroup("enterprise"),
  parameters: {
    zephyr: { testCaseId: "SW-T1275" },
  },
}