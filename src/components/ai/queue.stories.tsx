import { expect, within } from "storybook/test"

import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "./queue"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Queue",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Queue className="w-full max-w-sm">
      <QueueSection defaultOpen>
        <QueueSectionTrigger>
          <QueueSectionLabel count={3}>In Progress</QueueSectionLabel>
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="loading" />
              <QueueItemContent>Analyzing dataset structure</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="pending" />
              <QueueItemContent>Running statistical analysis</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="pending" />
              <QueueItemContent>Generating visualizations</QueueItemContent>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Queue items render", async () => {
      await expect(canvas.getByText("Analyzing dataset structure")).toBeInTheDocument()
      await expect(canvas.getByText("Running statistical analysis")).toBeInTheDocument()
    })
  },
}

export const WithCompletedItems: Story = {
  render: () => (
    <Queue className="w-full max-w-sm">
      <QueueSection defaultOpen>
        <QueueSectionTrigger>
          <QueueSectionLabel count={2}>Completed</QueueSectionLabel>
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <QueueItemContent completed>Fetch raw data</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <QueueItemContent completed>Clean and normalize</QueueItemContent>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
      <QueueSection defaultOpen>
        <QueueSectionTrigger>
          <QueueSectionLabel count={1}>In Progress</QueueSectionLabel>
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="loading" />
              <QueueItemContent>Train model</QueueItemContent>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Multiple sections render", async () => {
      await expect(canvas.getByText("Fetch raw data")).toBeInTheDocument()
      await expect(canvas.getByText("Train model")).toBeInTheDocument()
    })
  },
}

export const WithError: Story = {
  render: () => (
    <Queue className="w-full max-w-sm">
      <QueueSection defaultOpen>
        <QueueSectionTrigger>
          <QueueSectionLabel count={3}>Tasks</QueueSectionLabel>
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <QueueItemContent completed>Load configuration</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="error" />
              <QueueItemContent>Connect to database</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="pending" />
              <QueueItemContent>Run migrations</QueueItemContent>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Error state renders", async () => {
      await expect(canvas.getByText("Connect to database")).toBeInTheDocument()
    })
  },
}
