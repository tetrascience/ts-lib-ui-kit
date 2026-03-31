import { expect, within } from "storybook/test"

import { Button } from "./button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof TooltipContent> = {
  title: "Components/Tooltip",
  component: TooltipContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
  },
  args: {
    side: "top",
    sideOffset: 8,
  },
}

export default meta

type Story = StoryObj<typeof TooltipContent>

function renderTooltip(args: Story["args"]) {
  return (
    <TooltipProvider>
      <div className="flex h-[180px] w-[260px] items-center justify-center rounded-xl border bg-background">
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button variant="outline">Export status</Button>
          </TooltipTrigger>
          <TooltipContent {...args}>Last synced 3 minutes ago</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export const Top: Story = {
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1326" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Right: Story = {
  args: {
    side: "right",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1327" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Bottom: Story = {
  args: {
    side: "bottom",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1328" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Left: Story = {
  args: {
    side: "left",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1329" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}