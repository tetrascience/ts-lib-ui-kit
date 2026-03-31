import { expect, within } from "storybook/test"

import { Button } from "./button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof HoverCardContent> = {
  title: "Components/Hover Card",
  component: HoverCardContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: { type: "select" },
      options: ["start", "center", "end"],
    },
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
    sideOffset: {
      control: { type: "number" },
    },
  },
  args: {
    align: "center",
    side: "bottom",
    sideOffset: 8,
  },
}

export default meta

type Story = StoryObj<typeof HoverCardContent>

function renderHoverCard(args: Story["args"]) {
  return (
    <div className="flex h-[220px] w-[320px] items-center justify-center rounded-xl border bg-background">
      <HoverCard open>
        <HoverCardTrigger asChild>
          <Button variant="outline">Preview workspace</Button>
        </HoverCardTrigger>
        <HoverCardContent {...args}>
          <div className="grid gap-1.5">
            <div className="font-medium">Analytics workspace</div>
            <p className="text-sm text-muted-foreground">
              Shared with 12 collaborators and synced across three reporting destinations.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export const Default: Story = {
  render: renderHoverCard,
  parameters: {
    zephyr: { testCaseId: "SW-T1244" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Preview workspace" })).toBeInTheDocument()
    })

    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument()
      expect(
        body.getByText(
          "Shared with 12 collaborators and synced across three reporting destinations.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const StartAligned: Story = {
  args: {
    align: "start",
  },
  render: renderHoverCard,
  parameters: {
    zephyr: { testCaseId: "SW-T1245" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Preview workspace" })).toBeInTheDocument()
    })

    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument()
    })
  },
}

export const RightSide: Story = {
  args: {
    side: "right",
    sideOffset: 12,
  },
  render: renderHoverCard,
  parameters: {
    zephyr: { testCaseId: "SW-T1246" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Preview workspace" })).toBeInTheDocument()
    })

    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument()
    })
  },
}