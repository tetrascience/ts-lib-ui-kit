import { expect, userEvent, within } from "storybook/test"

import { Button } from "./button"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof PopoverContent> = {
  title: "Components/Popover",
  component: PopoverContent,
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
    sideOffset: 4,
  },
}

export default meta

type Story = StoryObj<typeof PopoverContent>

function renderPopover(args: Story["args"]) {
  return (
    <div className="flex h-[260px] w-[360px] items-center justify-center rounded-xl border bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open settings</Button>
        </PopoverTrigger>
        <PopoverContent {...args}>
          <div className="grid gap-2">
            <div className="font-medium">Notifications</div>
            <p className="text-sm text-muted-foreground">
              Choose what you want to be notified about across your workspaces.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const Default: Story = {
  render: renderPopover,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Popover trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Open settings" })).toBeInTheDocument()
    })

    await step("Click trigger reveals portaled content", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open settings" }))
      expect(body.getByText("Notifications")).toBeInTheDocument()
    })
  },
}

export const WithAnchor: Story = {
  render: (args) => (
    <div className="flex h-[260px] w-[360px] items-center justify-center rounded-xl border bg-background">
      <Popover>
        <PopoverAnchor asChild>
          <div data-testid="popover-anchor" className="rounded-md border px-3 py-2">
            Anchor element
          </div>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button variant="outline">Open from anchor</Button>
        </PopoverTrigger>
        <PopoverContent {...args}>
          <div className="grid gap-2">
            <div className="font-medium">Anchored content</div>
            <p className="text-sm text-muted-foreground">
              This popover is positioned relative to the anchor element.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Anchor element renders with data-slot", async () => {
      const anchor = canvas.getByTestId("popover-anchor")
      expect(anchor).toBeInTheDocument()
      expect(anchor).toHaveAttribute("data-slot", "popover-anchor")
    })

    await step("Click trigger reveals content anchored to the anchor", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open from anchor" }))
      expect(body.getByText("Anchored content")).toBeInTheDocument()
    })
  },
}
