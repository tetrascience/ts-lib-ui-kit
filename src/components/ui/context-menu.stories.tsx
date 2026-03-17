import { CopyIcon, FolderIcon, PencilIcon, Trash2Icon } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ContextMenuItem> = {
  title: "Components/ContextMenu",
  component: ContextMenuItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
}

export default meta

type Story = StoryObj<typeof ContextMenuItem>

function renderMenu(args: Story["args"]) {
  const destructive = args?.variant === "destructive"

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        Right click this area
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>
          <PencilIcon />
          Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem {...args}>
          {destructive ? <Trash2Icon /> : <FolderIcon />}
          {destructive ? "Delete" : "Move to folder"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const Default: Story = {
  render: renderMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1228" },
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: renderMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1229" },
  },
}