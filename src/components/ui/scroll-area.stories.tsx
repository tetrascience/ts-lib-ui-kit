import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import { expect, within } from "storybook/test"

import { ScrollArea, ScrollBar } from "./scroll-area"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ScrollBar> = {
  title: "Components/ScrollArea",
  component: ScrollBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["vertical", "horizontal"],
    },
  },
  args: {
    orientation: "vertical",
  },
}

export default meta

type Story = StoryObj<typeof ScrollBar>

function renderVertical() {
  return (
    <ScrollArea className="h-48 w-[320px] rounded-lg border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="rounded-md bg-muted px-3 py-2 text-sm">
            Activity event #{index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function renderHorizontal(args: Story["args"]) {
  return (
    <ScrollAreaPrimitive.Root className="relative w-[360px] rounded-lg border">
      <ScrollAreaPrimitive.Viewport className="w-full rounded-[inherit]">
        <div className="flex w-max gap-3 p-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="flex h-24 w-28 items-center justify-center rounded-lg bg-muted text-sm font-medium"
            >
              Panel {index + 1}
            </div>
          ))}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar {...args} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export const Vertical: Story = {
  render: () => renderVertical(),
  parameters: {
    zephyr: { testCaseId: "SW-T1278" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Scrollable content renders", async () => {
      expect(canvas.getByText("Activity event #1")).toBeInTheDocument()
      expect(canvas.getByText("Activity event #12")).toBeInTheDocument()
    })
  },
}

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: renderHorizontal,
  parameters: {
    zephyr: { testCaseId: "SW-T1279" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Scrollable panel content renders", async () => {
      expect(canvas.getByText("Panel 1")).toBeInTheDocument()
      expect(canvas.getByText("Panel 8")).toBeInTheDocument()
    })
  },
}