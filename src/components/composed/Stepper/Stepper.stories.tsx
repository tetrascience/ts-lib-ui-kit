import { expect, within } from "storybook/test"

import { Stepper } from "./Stepper"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Stepper> = {
  title: "Patterns/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px] p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Stepper>

export const Default: Story = {
  args: {
    steps: [
      { title: "Start", status: "completed" },
      { title: "Authenticate", status: "active" },
      { title: "Download", status: "pending" },
      { title: "Transform", status: "pending" },
      { title: "Upload", status: "pending" },
    ],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("All step titles render", async () => {
      expect(canvas.getByText("Start")).toBeInTheDocument()
      expect(canvas.getByText("Authenticate")).toBeInTheDocument()
      expect(canvas.getByText("Download")).toBeInTheDocument()
    })

    await step("Completed step has check indicator", async () => {
      expect(stepper.querySelector("[data-status='completed']")).toBeInTheDocument()
    })

    await step("Active step has aria-current=step", async () => {
      const activeItem = stepper.querySelector("[aria-current='step']")
      expect(activeItem).toBeInTheDocument()
      expect(activeItem).toContainElement(
        stepper.querySelector("[data-status='active']") as HTMLElement
      )
    })

    await step("Only one step is current", async () => {
      const currentItems = stepper.querySelectorAll("[aria-current='step']")
      expect(currentItems).toHaveLength(1)
    })

    await step("Connectors are inside list items", async () => {
      const connectors = stepper.querySelectorAll("[data-slot='stepper-connector']")
      expect(connectors).toHaveLength(4)
      connectors.forEach((connector) => {
        expect(connector.closest("li")).not.toBeNull()
      })
    })
  },
}

export const AllCompleted: Story = {
  args: {
    steps: [
      { title: "Start", status: "completed" },
      { title: "Authenticate", status: "completed" },
      { title: "Download", status: "completed" },
      { title: "Transform", status: "completed" },
      { title: "Complete", status: "completed" },
    ],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("All 5 steps show completed status", async () => {
      const indicators = stepper.querySelectorAll("[data-status='completed']")
      expect(indicators).toHaveLength(5)
    })

    await step("No step has aria-current", async () => {
      expect(stepper.querySelector("[aria-current='step']")).toBeNull()
    })
  },
}

export const WithError: Story = {
  args: {
    steps: [
      { title: "Start", status: "completed" },
      { title: "Authenticate", status: "completed" },
      { title: "Download", status: "error" },
      { title: "Transform", status: "pending" },
      { title: "Upload", status: "pending" },
    ],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("Error step renders with error indicator", async () => {
      expect(stepper.querySelector("[data-status='error']")).toBeInTheDocument()
    })

    await step("Error step title visible", async () => {
      expect(canvas.getByText("Download")).toBeInTheDocument()
    })

    await step("Error step does not set aria-current", async () => {
      expect(stepper.querySelector("[aria-current='step']")).toBeNull()
    })
  },
}

export const WithWarning: Story = {
  args: {
    steps: [
      { title: "Start", status: "completed" },
      { title: "Authenticate", status: "completed" },
      { title: "Resolve", status: "warning" },
      { title: "Transform", status: "pending" },
      { title: "Upload", status: "pending" },
    ],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("Warning indicator renders", async () => {
      expect(stepper.querySelector("[data-status='warning']")).toBeInTheDocument()
      expect(canvas.getByText("Resolve")).toBeInTheDocument()
    })

    await step("Warning step does not set aria-current", async () => {
      expect(stepper.querySelector("[aria-current='step']")).toBeNull()
    })
  },
}

export const LongTitles: Story = {
  args: {
    steps: [
      { title: "Authentication", status: "completed" },
      { title: "Configuration", status: "active" },
      { title: "Validation", status: "pending" },
      { title: "Transformation", status: "pending" },
      { title: "Upload Complete", status: "pending" },
    ],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("Long titles render without overflow errors", async () => {
      expect(canvas.getByText("Authentication")).toBeInTheDocument()
      expect(canvas.getByText("Configuration")).toBeInTheDocument()
      expect(canvas.getByText("Transformation")).toBeInTheDocument()
    })

    await step("Active step has aria-current=step", async () => {
      expect(stepper.querySelector("[aria-current='step']")).toBeInTheDocument()
    })
  },
}

export const SingleStep: Story = {
  args: {
    steps: [{ title: "Start", status: "active" }],
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stepper = canvasElement.querySelector("[data-slot='stepper']")!

    await step("Single step renders", async () => {
      expect(canvas.getByText("Start")).toBeInTheDocument()
    })

    await step("No connectors when only one step", async () => {
      expect(
        stepper.querySelectorAll("[data-slot='stepper-connector']")
      ).toHaveLength(0)
    })

    await step("Single active step has aria-current=step", async () => {
      expect(stepper.querySelector("[aria-current='step']")).toBeInTheDocument()
    })
  },
}
