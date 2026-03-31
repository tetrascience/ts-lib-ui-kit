import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { expect, within } from "storybook/test"

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "./menubar"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof MenubarItem> = {
  title: "Components/Menubar",
  component: MenubarItem,
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

type Story = StoryObj<typeof MenubarItem>

function renderMenubar(args: Story["args"]) {
  const destructive = args?.variant === "destructive"

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <PencilIcon />
            Rename
            <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <CopyIcon />
            Duplicate
            <MenubarShortcut>⌘D</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem {...args}>
            {destructive && <Trash2Icon />}
            {destructive ? "Delete project" : "Archive project"}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const Default: Story = {
  render: renderMenubar,
  parameters: {
    zephyr: { testCaseId: "SW-T1270" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Menubar triggers render", async () => {
      expect(canvas.getByText("File")).toBeInTheDocument()
      expect(canvas.getByText("Edit")).toBeInTheDocument()
    })
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: renderMenubar,
  parameters: {
    zephyr: { testCaseId: "SW-T1271" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Menubar triggers render", async () => {
      expect(canvas.getByText("File")).toBeInTheDocument()
      expect(canvas.getByText("Edit")).toBeInTheDocument()
    })
  },
}