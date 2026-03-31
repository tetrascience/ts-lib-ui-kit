import { expect, within } from "storybook/test"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof DropdownMenuItem> = {
  title: "Components/DropdownMenu",
  component: DropdownMenuItem,
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
}

export default meta

type Story = StoryObj<typeof DropdownMenuItem>

function renderMenu(args: Story["args"]) {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem {...args}>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Default: Story = {
  args: {
    children: "Rename",
    variant: "default",
  },
  render: renderMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1237" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Menu trigger renders", async () => {
      expect(canvas.getByText("Open menu")).toBeInTheDocument()
    })

    await step("Menu items render", async () => {
      expect(body.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument()
      expect(body.getByRole("menuitem", { name: "Duplicate" })).toBeInTheDocument()
    })
  },
}

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
  render: renderMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1238" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Menu trigger renders", async () => {
      expect(canvas.getByText("Open menu")).toBeInTheDocument()
    })

    await step("Menu items render", async () => {
      expect(body.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument()
      expect(body.getByRole("menuitem", { name: "Duplicate" })).toBeInTheDocument()
    })
  },
}