import { expect, within } from "storybook/test"

import { StatCard } from "./StatCard"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof StatCard> = {
  title: "Design Patterns/StatCard",
  component: StatCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: "Files Processed",
    value: "12,480",
    delta: "+14%",
    deltaLabel: "vs. last 7 days",
    trend: "up",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1485" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and value render", async () => {
      expect(canvas.getByText("Files Processed")).toBeInTheDocument()
      expect(canvas.getByText("12,480")).toBeInTheDocument()
    })

    await step("Delta and label render", async () => {
      expect(canvas.getByText("+14%")).toBeInTheDocument()
      expect(canvas.getByText("vs. last 7 days")).toBeInTheDocument()
    })

    await step("Trend icon is present", async () => {
      expect(
        canvas.getByText("+14%").closest("[data-slot='stat-card']")!.querySelector("svg")
      ).toBeInTheDocument()
    })
  },
}

export const TrendDown: Story = {
  args: {
    label: "Failed Jobs",
    value: "23",
    delta: "+8",
    deltaLabel: "vs. last 7 days",
    trend: "down",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1486" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and value render", async () => {
      expect(canvas.getByText("Failed Jobs")).toBeInTheDocument()
      expect(canvas.getByText("23")).toBeInTheDocument()
    })

    await step("Negative delta renders", async () => {
      expect(canvas.getByText("+8")).toBeInTheDocument()
    })
  },
}

export const TrendNeutral: Story = {
  args: {
    label: "Active Pipelines",
    value: "7",
    delta: "0%",
    deltaLabel: "no change",
    trend: "neutral",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1487" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label, value, and neutral delta render", async () => {
      expect(canvas.getByText("Active Pipelines")).toBeInTheDocument()
      expect(canvas.getByText("7")).toBeInTheDocument()
      expect(canvas.getByText("0%")).toBeInTheDocument()
    })
  },
}

export const NoDelta: Story = {
  args: {
    label: "Total Workspaces",
    value: "4",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1488" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label and value render without delta", async () => {
      expect(canvas.getByText("Total Workspaces")).toBeInTheDocument()
      expect(canvas.getByText("4")).toBeInTheDocument()
    })
  },
}

export const GridOfFour: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      <StatCard
        label="Files Processed"
        value="12,480"
        delta="+14%"
        deltaLabel="vs. last 7 days"
        trend="up"
      />
      <StatCard
        label="Failed Jobs"
        value="23"
        delta="+8"
        deltaLabel="vs. last 7 days"
        trend="down"
      />
      <StatCard
        label="Avg Runtime"
        value="2m 14s"
        delta="-12%"
        deltaLabel="faster"
        trend="up"
      />
      <StatCard
        label="Pipeline Success Rate"
        value="98.1%"
        delta="0%"
        deltaLabel="no change"
        trend="neutral"
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1489" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("All four cards render", async () => {
      expect(canvas.getByText("Files Processed")).toBeInTheDocument()
      expect(canvas.getByText("Failed Jobs")).toBeInTheDocument()
      expect(canvas.getByText("Avg Runtime")).toBeInTheDocument()
      expect(canvas.getByText("Pipeline Success Rate")).toBeInTheDocument()
    })

    await step("Values are visible", async () => {
      expect(canvas.getByText("12,480")).toBeInTheDocument()
      expect(canvas.getByText("23")).toBeInTheDocument()
      expect(canvas.getByText("2m 14s")).toBeInTheDocument()
      expect(canvas.getByText("98.1%")).toBeInTheDocument()
    })
  },
}

export const WithDescription: Story = {
  args: {
    label: "Storage Used",
    value: "87.4 GB",
    delta: "+2.1 GB",
    deltaLabel: "this week",
    trend: "down",
    description: "Limit: 100 GB",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1490" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Label, value, and description render", async () => {
      expect(canvas.getByText("Storage Used")).toBeInTheDocument()
      expect(canvas.getByText("87.4 GB")).toBeInTheDocument()
      expect(canvas.getByText("Limit: 100 GB")).toBeInTheDocument()
    })
  },
}
