
import { Button } from "./button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./sheet"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof SheetContent> = {
  title: "Components/Sheet",
  component: SheetContent,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
  },
  args: {
    side: "right",
  },
}

export default meta

type Story = StoryObj<typeof SheetContent>

function renderSheet(args: Story["args"]) {
  return (
    <div className="relative h-[380px] w-[640px] overflow-hidden rounded-xl border bg-background">
      <Sheet open>
        <SheetContent {...args}>
          <SheetHeader>
            <SheetTitle>Workspace settings</SheetTitle>
            <SheetDescription>
              Configure the workspace name, sharing options, and export defaults.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4 text-sm text-muted-foreground">
            <div className="rounded-lg border p-3">Project name: TS UI Kit</div>
            <div className="rounded-lg border p-3">Default destination: Reports</div>
            <div className="rounded-lg border p-3">Sharing: Team only</div>
          </div>
          <SheetFooter>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export const Right: Story = {
  render: renderSheet,
  parameters: {
    zephyr: { testCaseId: "SW-T1284" },
  },
}

export const Left: Story = {
  args: {
    side: "left",
  },
  render: renderSheet,
  parameters: {
    zephyr: { testCaseId: "SW-T1285" },
  },
}

export const Top: Story = {
  args: {
    side: "top",
  },
  render: renderSheet,
  parameters: {
    zephyr: { testCaseId: "SW-T1286" },
  },
}

export const Bottom: Story = {
  args: {
    side: "bottom",
  },
  render: renderSheet,
  parameters: {
    zephyr: { testCaseId: "SW-T1287" },
  },
}