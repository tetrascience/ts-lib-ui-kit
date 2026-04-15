import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
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

    await step("Menubar root has correct data-slot", async () => {
      const menubar = canvas.getByRole("menubar")
      expect(menubar).toHaveAttribute("data-slot", "menubar")
    })

    await step("Clicking File trigger opens menu content", async () => {
      await userEvent.click(canvas.getByText("File"))
      const body = within(canvasElement.ownerDocument.body)
      expect(body.getByText("Rename")).toBeInTheDocument()
      expect(body.getByText("Duplicate")).toBeInTheDocument()
      expect(body.getByText("Archive project")).toBeInTheDocument()
    })

    await step("Shortcuts render inside menu items", async () => {
      const body = within(canvasElement.ownerDocument.body)
      expect(body.getByText("⌘R")).toBeInTheDocument()
      expect(body.getByText("⌘D")).toBeInTheDocument()
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

    await step("Opening File shows destructive item", async () => {
      await userEvent.click(canvas.getByText("File"))
      const body = within(canvasElement.ownerDocument.body)
      const deleteItem = body.getByText("Delete project")
      expect(deleteItem).toBeInTheDocument()
      expect(deleteItem.closest("[data-slot='menubar-item']")).toHaveAttribute(
        "data-variant",
        "destructive",
      )
    })
  },
}

export const WithCheckboxItems: Story = {
  render: () => {
    const [showToolbar, setShowToolbar] = React.useState(true)
    const [showSidebar, setShowSidebar] = React.useState(false)
    const [showStatusBar, setShowStatusBar] = React.useState(true)

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Panels</MenubarLabel>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={showToolbar}
              onCheckedChange={setShowToolbar}
            >
              Toolbar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showSidebar}
              onCheckedChange={setShowSidebar}
            >
              Sidebar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showStatusBar}
              onCheckedChange={setShowStatusBar}
            >
              Status Bar
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Open View menu", async () => {
      await userEvent.click(canvas.getByText("View"))
    })

    const body = within(canvasElement.ownerDocument.body)

    await step("Label and checkbox items render", async () => {
      expect(body.getByText("Panels")).toBeInTheDocument()
      expect(body.getByText("Toolbar")).toBeInTheDocument()
      expect(body.getByText("Sidebar")).toBeInTheDocument()
      expect(body.getByText("Status Bar")).toBeInTheDocument()
    })

    await step("Checked items show indicator, unchecked do not", async () => {
      const toolbarItem = body.getByText("Toolbar").closest("[data-slot='menubar-checkbox-item']")!
      const sidebarItem = body.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']")!
      expect(toolbarItem).toHaveAttribute("data-state", "checked")
      expect(sidebarItem).toHaveAttribute("data-state", "unchecked")
    })

    await step("Clicking unchecked item toggles it to checked", async () => {
      await userEvent.click(body.getByText("Sidebar"))
      // Re-open the menu to verify
      await userEvent.click(canvas.getByText("View"))
      const sidebarItem = body.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']")!
      expect(sidebarItem).toHaveAttribute("data-state", "checked")
    })
  },
}

export const WithRadioGroup: Story = {
  render: () => {
    const [theme, setTheme] = React.useState("system")

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Preferences</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarSeparator />
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Open Preferences menu", async () => {
      await userEvent.click(canvas.getByText("Preferences"))
    })

    const body = within(canvasElement.ownerDocument.body)

    await step("Radio items render with correct initial selection", async () => {
      expect(body.getByText("Theme")).toBeInTheDocument()
      const systemItem = body.getByText("System").closest("[data-slot='menubar-radio-item']")!
      const lightItem = body.getByText("Light").closest("[data-slot='menubar-radio-item']")!
      expect(systemItem).toHaveAttribute("data-state", "checked")
      expect(lightItem).toHaveAttribute("data-state", "unchecked")
    })

    await step("Clicking a different radio item selects it", async () => {
      await userEvent.click(body.getByText("Dark"))
      // Re-open menu to verify
      await userEvent.click(canvas.getByText("Preferences"))
      const darkItem = body.getByText("Dark").closest("[data-slot='menubar-radio-item']")!
      const systemItem = body.getByText("System").closest("[data-slot='menubar-radio-item']")!
      expect(darkItem).toHaveAttribute("data-state", "checked")
      expect(systemItem).toHaveAttribute("data-state", "unchecked")
    })
  },
}

export const WithSubMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New File</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email</MenubarItem>
              <MenubarItem>Slack</MenubarItem>
              <MenubarItem>Copy Link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open File menu", async () => {
      await userEvent.click(canvas.getByText("File"))
      expect(body.getByText("New File")).toBeInTheDocument()
    })

    await step("Sub-trigger renders with correct data-slot", async () => {
      const shareTrigger = body.getByText("Share")
      expect(shareTrigger.closest("[data-slot='menubar-sub-trigger']")).toBeInTheDocument()
    })

    await step("Clicking sub-trigger opens sub-content", async () => {
      await userEvent.click(body.getByText("Share"))
      await waitFor(() => {
        expect(body.getByText("Email")).toBeInTheDocument()
      })
      expect(body.getByText("Slack")).toBeInTheDocument()
      expect(body.getByText("Copy Link")).toBeInTheDocument()
    })
  },
}

export const WithDisabledItems: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Select All
            <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open Edit menu", async () => {
      await userEvent.click(canvas.getByText("Edit"))
    })

    await step("Disabled item has data-disabled attribute", async () => {
      const pasteItem = body.getByText("Paste").closest("[data-slot='menubar-item']")!
      expect(pasteItem).toHaveAttribute("data-disabled")
    })

    await step("Enabled items do not have data-disabled", async () => {
      const cutItem = body.getByText("Cut").closest("[data-slot='menubar-item']")!
      expect(cutItem).not.toHaveAttribute("data-disabled")
    })
  },
}

export const WithGroupsAndLabels: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Actions</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Navigation</MenubarLabel>
            <MenubarItem>Go to Home</MenubarItem>
            <MenubarItem>Go to Settings</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel>Danger Zone</MenubarLabel>
            <MenubarItem variant="destructive">
              <Trash2Icon />
              Delete Account
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open Actions menu", async () => {
      await userEvent.click(canvas.getByText("Actions"))
    })

    await step("Labels render for each group", async () => {
      expect(body.getByText("Navigation")).toBeInTheDocument()
      expect(body.getByText("Danger Zone")).toBeInTheDocument()
    })

    await step("Items render in their groups", async () => {
      expect(body.getByText("Go to Home")).toBeInTheDocument()
      expect(body.getByText("Go to Settings")).toBeInTheDocument()
      expect(body.getByText("Delete Account")).toBeInTheDocument()
    })

    await step("Destructive item in group has correct variant", async () => {
      const deleteItem = body
        .getByText("Delete Account")
        .closest("[data-slot='menubar-item']")!
      expect(deleteItem).toHaveAttribute("data-variant", "destructive")
    })
  },
}