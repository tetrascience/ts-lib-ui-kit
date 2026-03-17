import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "./field"
import { Input } from "./input"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["vertical", "horizontal", "responsive"],
    },
  },
  args: {
    orientation: "vertical",
  },
}

export default meta

type Story = StoryObj<typeof Field>

function renderField(args: Story["args"]) {
  return (
    <div className="w-[420px]">
      <Field {...args}>
        <FieldLabel htmlFor="field-story-input">
          <FieldTitle>Project name</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <Input id="field-story-input" placeholder="Enter a project name" />
          <FieldDescription>Used in dashboards and reports.</FieldDescription>
        </FieldContent>
      </Field>
    </div>
  )
}

function renderLegend(variant: "legend" | "label") {
  return (
    <div className="w-[420px]">
      <FieldSet>
        <FieldLegend variant={variant}>Workspace details</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-legend-input">
              <FieldTitle>Name</FieldTitle>
            </FieldLabel>
            <FieldContent>
              <Input id="field-legend-input" placeholder="My workspace" />
              <FieldDescription>Visible to all collaborators.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export const Vertical: Story = {
  render: renderField,
  parameters: {
    zephyr: { testCaseId: "SW-T1239" },
  },
}

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: renderField,
  parameters: {
    zephyr: { testCaseId: "SW-T1240" },
  },
}

export const Responsive: Story = {
  args: {
    orientation: "responsive",
  },
  render: renderField,
  parameters: {
    zephyr: { testCaseId: "SW-T1241" },
  },
}

export const Legend: Story = {
  render: () => renderLegend("legend"),
  parameters: {
    zephyr: { testCaseId: "SW-T1242" },
  },
}

export const Label: Story = {
  render: () => renderLegend("label"),
  parameters: {
    zephyr: { testCaseId: "SW-T1243" },
  },
}