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
  render: () => renderTabs("default", "horizontal"),
  parameters: {
    zephyr: { testCaseId: "SW-T1310" },
  },
}

export const HorizontalLine: Story = {
  render: () => renderTabs("line", "horizontal"),
  parameters: {
    zephyr: { testCaseId: "SW-T1311" },
  },
}

export const VerticalDefault: Story = {
  render: () => renderTabs("default", "vertical"),
  parameters: {
    zephyr: { testCaseId: "SW-T1312" },
  },
}

export const VerticalLine: Story = {
  render: () => renderTabs("line", "vertical"),
  parameters: {
    zephyr: { testCaseId: "SW-T1313" },
  },
}