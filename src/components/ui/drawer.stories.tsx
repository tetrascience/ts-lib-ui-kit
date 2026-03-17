import { Button } from "./button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: { type: "select" },
      options: ["bottom", "right", "left", "top"],
    },
  },
  args: {
    direction: "bottom",
  },
}

export default meta

type Story = StoryObj<typeof Drawer>

function renderDrawer(args: Story["args"]) {
  return (
    <div className="relative h-[420px] w-[640px] overflow-hidden rounded-xl border bg-background">
      <Drawer open shouldScaleBackground={false} {...args}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter results</DrawerTitle>
            <DrawerDescription>
              Narrow the dataset by source, status, and reporting range before exporting.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 px-4 text-sm text-muted-foreground">
            <div className="rounded-lg border p-3">Source: All pipelines</div>
            <div className="rounded-lg border p-3">Status: Active and paused</div>
            <div className="rounded-lg border p-3">Range: Last 30 days</div>
          </div>
          <DrawerFooter>
            <Button>Apply filters</Button>
            <Button variant="outline">Reset</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export const Bottom: Story = {
  render: renderDrawer,
  parameters: {
    zephyr: { testCaseId: "SW-T1233" },
  },
}

export const Right: Story = {
  args: {
    direction: "right",
  },
  render: renderDrawer,
  parameters: {
    zephyr: { testCaseId: "SW-T1234" },
  },
}

export const Left: Story = {
  args: {
    direction: "left",
  },
  render: renderDrawer,
  parameters: {
    zephyr: { testCaseId: "SW-T1235" },
  },
}

export const Top: Story = {
  args: {
    direction: "top",
  },
  render: renderDrawer,
  parameters: {
    zephyr: { testCaseId: "SW-T1236" },
  },
}