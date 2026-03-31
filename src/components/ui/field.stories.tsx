import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument()
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument()
    })

    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument()
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument()
    })

    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument()
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument()
    })

    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument()
    })
  },
}

export const Legend: Story = {
  render: () => renderLegend("legend"),
  parameters: {
    zephyr: { testCaseId: "SW-T1242" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Legend and field render", async () => {
      expect(canvas.getByText("Workspace details")).toBeInTheDocument()
      expect(canvas.getByText("Name")).toBeInTheDocument()
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("My workspace")).toBeInTheDocument()
    })

    await step("Field description renders", async () => {
      expect(canvas.getByText("Visible to all collaborators.")).toBeInTheDocument()
    })
  },
}

export const Label: Story = {
  render: () => renderLegend("label"),
  parameters: {
    zephyr: { testCaseId: "SW-T1243" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Legend label and field render", async () => {
      expect(canvas.getByText("Workspace details")).toBeInTheDocument()
      expect(canvas.getByText("Name")).toBeInTheDocument()
      expect(canvas.getByRole("textbox")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("My workspace")).toBeInTheDocument()
    })

    await step("Field description renders", async () => {
      expect(canvas.getByText("Visible to all collaborators.")).toBeInTheDocument()
    })
  },
}