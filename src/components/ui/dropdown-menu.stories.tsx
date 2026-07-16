import { ChevronDownIcon, EllipsisVerticalIcon } from "lucide-react"
import React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

// The caret trigger is the default pattern for this component (SW-2014).
function renderMenu(args: Story["args"]) {
  return (
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

    await step("Menu trigger renders with a caret icon", async () => {
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
    zephyr: { testCaseId: "SW-T5406" },
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

export const WithLabelsAndShortcuts: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Actions
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>File</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Rename
            <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Duplicate
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    layout: "centered",
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5505" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Label renders", async () => {
      expect(body.getByText("File")).toBeInTheDocument()
    })

    await step("Shortcuts render", async () => {
      expect(body.getByText("⌘R")).toBeInTheDocument()
      expect(body.getByText("⌘D")).toBeInTheDocument()
    })

    await step("Group items render", async () => {
      expect(body.getByRole("menuitem", { name: /Rename/ })).toBeInTheDocument()
      expect(body.getByRole("menuitem", { name: /Duplicate/ })).toBeInTheDocument()
    })
  },
}

export const WithCheckboxItems: Story = {
  render: () => {
    const [showGrid, setShowGrid] = React.useState(true)
    const [showRulers, setShowRulers] = React.useState(false)

    return (
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuLabel>Display</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
            Show rulers
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
  parameters: {
    layout: "centered",
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5506" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Checkbox items render", async () => {
      expect(body.getByText("Show grid")).toBeInTheDocument()
      expect(body.getByText("Show rulers")).toBeInTheDocument()
    })

    await step("Checked item has data-state checked", async () => {
      const gridItem = body.getByText("Show grid").closest("[data-slot='dropdown-menu-checkbox-item']")!
      expect(gridItem).toHaveAttribute("data-state", "checked")
      const rulersItem = body.getByText("Show rulers").closest("[data-slot='dropdown-menu-checkbox-item']")!
      expect(rulersItem).toHaveAttribute("data-state", "unchecked")
    })

    await step("Clicking unchecked item toggles it", async () => {
      await userEvent.click(body.getByText("Show rulers"))
      const rulersItem = body.getByText("Show rulers").closest("[data-slot='dropdown-menu-checkbox-item']")!
      expect(rulersItem).toHaveAttribute("data-state", "checked")
    })
  },
}

export const WithRadioItems: Story = {
  render: () => {
    const [theme, setTheme] = React.useState("system")

    return (
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Preferences</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
  parameters: {
    layout: "centered",
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5507" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Radio items render with correct initial selection", async () => {
      const systemItem = body.getByText("System").closest("[data-slot='dropdown-menu-radio-item']")!
      const lightItem = body.getByText("Light").closest("[data-slot='dropdown-menu-radio-item']")!
      expect(systemItem).toHaveAttribute("data-state", "checked")
      expect(lightItem).toHaveAttribute("data-state", "unchecked")
    })

    await step("Clicking a different radio item selects it", async () => {
      await userEvent.click(body.getByText("Dark"))
      const darkItem = body.getByText("Dark").closest("[data-slot='dropdown-menu-radio-item']")!
      expect(darkItem).toHaveAttribute("data-state", "checked")
    })
  },
}

export const WithSubMenu: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Actions
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>New file</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Slack</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    layout: "centered",
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5508" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Sub-trigger renders with correct data-slot", async () => {
      const shareTrigger = body.getByText("Share")
      expect(shareTrigger.closest("[data-slot='dropdown-menu-sub-trigger']")).toBeInTheDocument()
    })

    await step("Hovering sub-trigger opens sub-content", async () => {
      const shareTrigger = body.getByText("Share")
      await userEvent.hover(shareTrigger)
      await waitFor(() => {
        expect(body.getByText("Email")).toBeInTheDocument()
      })
      expect(body.getByText("Slack")).toBeInTheDocument()
      expect(body.getByText("Copy link")).toBeInTheDocument()
    })
  },
}