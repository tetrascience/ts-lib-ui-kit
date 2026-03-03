import {
  FolderIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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

export const Default: Story = {
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1288" },
  },
}

export const Floating: Story = {
  args: {
    variant: "floating",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1289" },
  },
}

export const Inset: Story = {
  args: {
    variant: "inset",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1290" },
  },
}

export const RightSide: Story = {
  args: {
    side: "right",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1291" },
  },
}

export const CollapsedIcon: Story = {
  args: {
    collapsible: "icon",
  },
  render: (args) => renderSidebar(args, { open: false }),
  parameters: {
    zephyr: { testCaseId: "SW-T1292" },
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
}

export const OutlineMenuButtons: Story = {
  render: (args) => renderSidebar(args, { menuButtonVariant: "outline" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1294" },
  },
}

export const LargeMenuButtons: Story = {
  render: (args) => renderSidebar(args, { menuButtonSize: "lg" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1295" },
  },
}