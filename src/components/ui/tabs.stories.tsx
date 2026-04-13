import { expect, within } from "storybook/test"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Tabs>

function renderTabs(variant: "default" | "line", orientation: "horizontal" | "vertical") {
  return (
    <Tabs
      defaultValue="overview"
      orientation={orientation}
      className={orientation === "vertical" ? "w-[520px]" : "w-[420px]"}
    >
      <TabsList variant={variant}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-lg border p-4">
        Overview content for the selected workspace.
      </TabsContent>
      <TabsContent value="activity" className="rounded-lg border p-4">
        Recent activity and export history.
      </TabsContent>
      <TabsContent value="members" className="rounded-lg border p-4">
        Team members and permissions.
      </TabsContent>
    </Tabs>
  )
}

export const HorizontalDefault: Story = {
  render: (args) => renderTabs("default", "horizontal"),
  parameters: {
    zephyr: { testCaseId: "SW-T1310" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Tab list and tabs render", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Overview" })).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Activity" })).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Members" })).toBeInTheDocument()
    })

    await step("Default tab panel shows overview content", async () => {
      expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true",
      )
      expect(
        canvas.getByText("Overview content for the selected workspace."),
      ).toBeInTheDocument()
    })
  },
}

export const HorizontalLine: Story = {
  render: (args) => renderTabs("line", "horizontal"),
  parameters: {
    zephyr: { testCaseId: "SW-T1311" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Line variant tab list renders", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Overview" })).toBeInTheDocument()
    })

    await step("Overview panel is visible", async () => {
      expect(
        canvas.getByText("Overview content for the selected workspace."),
      ).toBeInTheDocument()
    })
  },
}

export const VerticalDefault: Story = {
  render: (args) => renderTabs("default", "vertical"),
  parameters: {
    zephyr: { testCaseId: "SW-T1312" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical tab list renders", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Members" })).toBeInTheDocument()
    })

    await step("Default vertical tab content shows", async () => {
      expect(
        canvas.getByText("Overview content for the selected workspace."),
      ).toBeInTheDocument()
    })
  },
}

export const VerticalLine: Story = {
  render: (args) => renderTabs("line", "vertical"),
  parameters: {
    zephyr: { testCaseId: "SW-T1313" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical line tabs render", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument()
      expect(canvas.getByRole("tab", { name: "Activity" })).toBeInTheDocument()
    })

    await step("Overview panel is visible", async () => {
      expect(
        canvas.getByText("Overview content for the selected workspace."),
      ).toBeInTheDocument()
    })
  },
}