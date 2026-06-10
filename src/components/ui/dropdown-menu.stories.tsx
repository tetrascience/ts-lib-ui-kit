import { ChevronDownIcon, EllipsisVerticalIcon } from "lucide-react"
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
  title: "Components/Dropdown Menu",
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

/**
 * Trigger with a trailing caret icon — composes the existing `asChild` Button
 * with a lucide `ChevronDownIcon`. No component API changes required.
 */
export const WithCaret: Story = {
  args: {
    children: "Rename",
    variant: "default",
  },
  render: (args) => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Open menu
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem {...args}>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger renders with a caret icon", async () => {
      const trigger = canvas.getByText("Open menu").closest("button")
      expect(trigger).toBeInTheDocument()
      expect(trigger?.querySelector(".lucide-chevron-down")).not.toBeNull()
    })

    await step("Menu items render", async () => {
      expect(body.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument()
      expect(body.getByRole("menuitem", { name: "Duplicate" })).toBeInTheDocument()
    })
  },
}

/**
 * Icon-only kebab (⋮) trigger — composes the existing `asChild` Button with
 * `variant="ghost"` / `size="icon"` and a lucide `EllipsisVerticalIcon`.
 * The `aria-label` is required since the trigger has no visible text.
 */
export const Kebab: Story = {
  args: {
    children: "Rename",
    variant: "default",
  },
  render: (args) => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More options">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem {...args}>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Kebab trigger is an icon-only button", async () => {
      // While the (modal) menu is open Radix marks the trigger aria-hidden,
      // so role queries can't see it — query the DOM directly instead.
      const trigger = canvasElement.querySelector('button[aria-label="More options"]')
      expect(trigger).toBeInTheDocument()
      expect(trigger?.querySelector(".lucide-ellipsis-vertical")).not.toBeNull()
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