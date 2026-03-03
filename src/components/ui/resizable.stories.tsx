import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    orientation: "horizontal",
  },
}

export default meta

type Story = StoryObj<typeof ResizablePanelGroup>

function renderResizable(args: Story["args"], withHandle = false) {
  const containerClassName =
    args?.orientation === "vertical" ? "h-[360px] w-[420px]" : "h-[240px] w-[640px]"

  return (
    <div className={`rounded-xl border bg-background p-2 ${containerClassName}`}>
      <ResizablePanelGroup {...args} className="rounded-lg border">
        <ResizablePanel defaultSize={35}>
          <div className="flex h-full items-center justify-center bg-muted/30 p-6 text-sm text-muted-foreground">
            Summary panel
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize={65}>
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Detailed analytics
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export const Horizontal: Story = {
  render: (args) => renderResizable(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1276" },
  },
}

export const VerticalWithHandle: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => renderResizable(args, true),
  parameters: {
    zephyr: { testCaseId: "SW-T1277" },
  },
}