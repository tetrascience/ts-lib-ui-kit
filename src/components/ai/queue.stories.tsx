import { ListChecksIcon, XIcon } from "lucide-react"
import { expect, userEvent, within } from "storybook/test"

import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemImage,
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

export const WithActionsAndDescription: Story = {
  render: () => {
    let removed = false
    return (
      <Queue className="w-full max-w-md">
        <QueueSection defaultOpen>
          <QueueSectionTrigger>
            <QueueSectionLabel icon={<ListChecksIcon className="size-4" />}>
              Tasks
            </QueueSectionLabel>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem>
                <QueueItemIndicator completed />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <QueueItemContent>Upload documents</QueueItemContent>
                  <QueueItemDescription completed>Done yesterday</QueueItemDescription>
                </div>
                <QueueItemActions>
                  <QueueItemAction
                    aria-label="Remove"
                    onClick={() => {
                      removed = true
                    }}
                  >
                    <XIcon className="size-3" />
                  </QueueItemAction>
                </QueueItemActions>
              </QueueItem>
              <QueueItem>
                <QueueItemIndicator />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <QueueItemContent>Follow-up review</QueueItemContent>
                  <QueueItemDescription>Scheduled for Monday</QueueItemDescription>
                </div>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
    )
    void removed
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Description and action render", async () => {
      await expect(canvas.getByText("Done yesterday")).toBeInTheDocument()
      const remove = canvas.getByRole("button", { name: "Remove" })
      await userEvent.click(remove)
    })
  },
}

export const WithAttachments: Story = {
  render: () => (
    <Queue className="w-full max-w-md">
      <QueueSection defaultOpen>
        <QueueSectionTrigger>
          <QueueSectionLabel count={1}>Messages</QueueSectionLabel>
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <QueueItemContent>Shared assets</QueueItemContent>
                <QueueItemAttachment>
                  <QueueItemImage
                    alt="thumbnail"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Crect width='2' height='2' fill='%236b7280'/%3E%3C/svg%3E"
                  />
                  <QueueItemFile>spec.pdf</QueueItemFile>
                  <QueueItemFile>notes.txt</QueueItemFile>
                </QueueItemAttachment>
              </div>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Attachments render", async () => {
      await expect(canvas.getByText("spec.pdf")).toBeInTheDocument()
      await expect(canvas.getByText("notes.txt")).toBeInTheDocument()
      await expect(canvas.getByAltText("thumbnail")).toBeInTheDocument()
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
