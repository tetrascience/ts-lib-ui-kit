import {
  BellIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"
import { expect, userEvent, within } from "storybook/test"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["left", "right"],
    },
    variant: {
      control: { type: "select" },
      options: ["sidebar", "floating", "inset"],
    },
    collapsible: {
      control: { type: "select" },
      options: ["offcanvas", "icon", "none"],
    },
  },
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "offcanvas",
  },
}

export default meta

type Story = StoryObj<typeof Sidebar>

function renderSidebar(
  args: Story["args"],
  options?: {
    open?: boolean
    menuButtonVariant?: "default" | "outline"
    menuButtonSize?: "default" | "sm" | "lg"
  }
) {
  const providerProps =
    typeof options?.open === "boolean" ? { open: options.open } : { defaultOpen: true }

  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider {...providerProps}>
        <Sidebar {...args}>
          <SidebarHeader>
            <SidebarInput placeholder="Search navigation" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add workspace section">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive
                      size={options?.menuButtonSize ?? "default"}
                      tooltip="Overview"
                      variant={options?.menuButtonVariant ?? "default"}
                    >
                      <HomeIcon />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size={options?.menuButtonSize ?? "default"}
                      tooltip="Projects"
                      variant={options?.menuButtonVariant ?? "default"}
                    >
                      <FolderIcon />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size={options?.menuButtonSize ?? "default"}
                      tooltip="Team"
                      variant={options?.menuButtonVariant ?? "default"}
                    >
                      <UsersIcon />
                      <span>Team</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size={options?.menuButtonSize ?? "default"}
                  variant={options?.menuButtonVariant ?? "default"}
                >
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <div>
              <div className="font-medium">Dashboard</div>
              <div className="text-sm text-muted-foreground">
                Example layout using the sidebar primitives.
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-xl border bg-background p-4 text-sm">
                Content panel {index + 1}
              </div>
            ))}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

const playSidebar: Story["play"] = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement)

  await step("Layout renders", async () => {
    expect(canvas.getByText("Dashboard")).toBeInTheDocument()
    expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  await step("Sidebar navigation", async () => {
    expect(canvas.getByPlaceholderText("Search navigation")).toBeInTheDocument()
    expect(canvas.getByText("Workspace")).toBeInTheDocument()
    expect(canvas.getByText("Overview")).toBeInTheDocument()
    expect(canvas.getByText("Projects")).toBeInTheDocument()
    expect(canvas.getByText("Settings")).toBeInTheDocument()
  })
}

export const Default: Story = {
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1288" },
  },
  play: playSidebar,
}

export const Floating: Story = {
  args: {
    variant: "floating",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1289" },
  },
  play: playSidebar,
}

export const Inset: Story = {
  args: {
    variant: "inset",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1290" },
  },
  play: playSidebar,
}

export const RightSide: Story = {
  args: {
    side: "right",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1291" },
  },
  play: playSidebar,
}

export const CollapsedIcon: Story = {
  args: {
    collapsible: "icon",
  },
  render: (args) => renderSidebar(args, { open: false }),
  parameters: {
    zephyr: { testCaseId: "SW-T1292" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Layout renders", async () => {
      expect(canvas.getByText("Dashboard")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument()
    })

    await step("Collapsed sidebar shell", async () => {
      expect(canvasElement.querySelector('[data-sidebar="sidebar"]')).toBeTruthy()
      expect(canvas.getByPlaceholderText("Search navigation")).toBeInTheDocument()
    })
  },
}

export const NonCollapsible: Story = {
  args: {
    collapsible: "none",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1293" },
  },
  play: playSidebar,
}

export const OutlineMenuButtons: Story = {
  render: (args) => renderSidebar(args, { menuButtonVariant: "outline" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1294" },
  },
  play: playSidebar,
}

export const LargeMenuButtons: Story = {
  render: (args) => renderSidebar(args, { menuButtonSize: "lg" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1295" },
  },
  play: playSidebar,
}

// --- New stories for expanded test coverage ---

export const ToggleSidebar: Story = {
  args: {
    collapsible: "icon",
  },
  render: (args) => renderSidebar(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1296" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Sidebar starts expanded", async () => {
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]')
      expect(sidebarSlot).toBeTruthy()
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded")
    })

    await step("Click trigger collapses sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i })
      await userEvent.click(trigger)
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]')
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed")
    })

    await step("Click trigger again expands sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i })
      await userEvent.click(trigger)
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]')
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded")
    })
  },
}

function renderRailSidebar(args: Story["args"]) {
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...args} collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Home">
                      <HomeIcon />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Inbox">
                      <InboxIcon />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <span className="font-medium">Rail Example</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const WithRail: Story = {
  render: renderRailSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1297" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Rail element renders", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]')
      expect(rail).toBeTruthy()
      expect(rail?.getAttribute("aria-label")).toBe("Toggle Sidebar")
    })

    await step("Sidebar content renders with rail", async () => {
      expect(canvas.getByText("Home")).toBeInTheDocument()
      expect(canvas.getByText("Inbox")).toBeInTheDocument()
    })

    await step("Rail click collapses sidebar", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement
      await userEvent.click(rail)
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]')
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed")
    })

    await step("Rail click expands sidebar again", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement
      await userEvent.click(rail)
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]')
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded")
    })
  },
}

function renderSubMenuSidebar(args: Story["args"]) {
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...args}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <FolderIcon />
                      <span>Projects</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive>
                          <span>Alpha</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Beta</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton size="sm">
                          <span>Gamma (small)</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <SettingsIcon />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Sub Menu Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const WithSubMenu: Story = {
  render: renderSubMenuSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1298" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Parent menu items render", async () => {
      expect(canvas.getByText("Projects")).toBeInTheDocument()
      expect(canvas.getByText("Settings")).toBeInTheDocument()
    })

    await step("Sub-menu items render", async () => {
      expect(canvas.getByText("Alpha")).toBeInTheDocument()
      expect(canvas.getByText("Beta")).toBeInTheDocument()
      expect(canvas.getByText("Gamma (small)")).toBeInTheDocument()
    })

    await step("Sub-menu structure uses correct slots", async () => {
      const subMenu = canvasElement.querySelector('[data-slot="sidebar-menu-sub"]')
      expect(subMenu).toBeTruthy()
      const subItems = canvasElement.querySelectorAll('[data-slot="sidebar-menu-sub-item"]')
      expect(subItems.length).toBe(3)
    })

    await step("Active sub-item has data-active attribute", async () => {
      const activeSubButton = canvasElement.querySelector(
        '[data-slot="sidebar-menu-sub-button"][data-active="true"]'
      )
      expect(activeSubButton).toBeTruthy()
    })
  },
}

function renderBadgesAndActionsSidebar(args: Story["args"]) {
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...args}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Inbox</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <InboxIcon />
                      <span>Messages</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BellIcon />
                      <span>Notifications</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                    <SidebarMenuAction aria-label="Mark all read">
                      <StarIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Badges & Actions Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const WithBadgesAndActions: Story = {
  render: renderBadgesAndActionsSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1299" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Badge counts render", async () => {
      expect(canvas.getByText("12")).toBeInTheDocument()
      expect(canvas.getByText("3")).toBeInTheDocument()
    })

    await step("Badge uses correct data slot", async () => {
      const badges = canvasElement.querySelectorAll('[data-slot="sidebar-menu-badge"]')
      expect(badges.length).toBe(2)
    })

    await step("Menu action renders", async () => {
      const action = canvas.getByRole("button", { name: "Mark all read" })
      expect(action).toBeInTheDocument()
    })

    await step("Menu action has correct data slot", async () => {
      const actions = canvasElement.querySelectorAll('[data-slot="sidebar-menu-action"]')
      expect(actions.length).toBe(1)
    })
  },
}

function renderSkeletonSidebar(args: Story["args"]) {
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...args}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Loading…</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Skeleton Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const SkeletonLoading: Story = {
  render: renderSkeletonSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1300" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Skeleton items render", async () => {
      const skeletons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-skeleton"]')
      expect(skeletons.length).toBe(3)
    })

    await step("Icon skeletons render for showIcon items", async () => {
      const iconSkeletons = canvasElement.querySelectorAll(
        '[data-sidebar="menu-skeleton-icon"]'
      )
      expect(iconSkeletons.length).toBe(2)
    })

    await step("Text skeletons render for all items", async () => {
      const textSkeletons = canvasElement.querySelectorAll(
        '[data-sidebar="menu-skeleton-text"]'
      )
      expect(textSkeletons.length).toBe(3)
    })
  },
}

function renderMultiGroupSidebar(args: Story["args"]) {
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...args}>
          <SidebarHeader>
            <SidebarInput placeholder="Quick search…" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <HomeIcon />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Resources</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add resource">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FolderIcon />
                      <span>Files</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <SettingsIcon />
                  <span>Preferences</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <span className="font-medium">Multi-Group Layout</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export const MultipleGroups: Story = {
  render: renderMultiGroupSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1301" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Header with search input renders", async () => {
      expect(canvas.getByPlaceholderText("Quick search…")).toBeInTheDocument()
      const header = canvasElement.querySelector('[data-sidebar="header"]')
      expect(header).toBeTruthy()
    })

    await step("Multiple groups render", async () => {
      const groups = canvasElement.querySelectorAll('[data-sidebar="group"]')
      expect(groups.length).toBe(2)
      expect(canvas.getByText("Main")).toBeInTheDocument()
      expect(canvas.getByText("Resources")).toBeInTheDocument()
    })

    await step("Group action button renders", async () => {
      const addButton = canvas.getByRole("button", { name: "Add resource" })
      expect(addButton).toBeInTheDocument()
    })

    await step("Separators render between sections", async () => {
      const separators = canvasElement.querySelectorAll('[data-slot="sidebar-separator"]')
      expect(separators.length).toBeGreaterThanOrEqual(2)
    })

    await step("Footer renders", async () => {
      const footer = canvasElement.querySelector('[data-sidebar="footer"]')
      expect(footer).toBeTruthy()
      expect(canvas.getByText("Preferences")).toBeInTheDocument()
    })

    await step("Active item has data-active attribute", async () => {
      const activeButton = canvasElement.querySelector(
        '[data-slot="sidebar-menu-button"][data-active="true"]'
      )
      expect(activeButton).toBeTruthy()
    })
  },
}

export const SmallMenuButtons: Story = {
  render: (args) => renderSidebar(args, { menuButtonSize: "sm" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1302" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Menu buttons render at small size", async () => {
      const buttons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]')
      expect(buttons.length).toBeGreaterThan(0)
      for (const btn of buttons) {
        expect(btn.getAttribute("data-size")).toBe("sm")
      }
    })

    await step("Sidebar content is intact", async () => {
      expect(canvas.getByText("Overview")).toBeInTheDocument()
      expect(canvas.getByText("Projects")).toBeInTheDocument()
      expect(canvas.getByText("Team")).toBeInTheDocument()
    })
  },
}
