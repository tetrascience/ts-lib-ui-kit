import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu"

import type { Meta, StoryObj } from "@storybook/react-vite"

const menuLinks = [
  {
    title: "Runs",
    description: "Review pipeline executions, durations, and recent failures.",
  },
  {
    title: "Datasets",
    description: "Inspect sources, schema changes, and file ingestion activity.",
  },
  {
    title: "Exports",
    description: "Track outbound jobs and delivery status for reporting systems.",
  },
  {
    title: "Alerts",
    description: "Manage thresholds, notifications, and escalation policies.",
  },
] as const

const meta: Meta<typeof NavigationMenu> = {
  title: "Components/Navigation Menu",
  component: NavigationMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    viewport: {
      control: { type: "boolean" },
    },
  },
  args: {
    viewport: true,
  },
}

export default meta

type Story = StoryObj<typeof NavigationMenu>

function renderNavigationMenu(args: Story["args"]) {
  return (
    <div className="flex min-h-[280px] w-[440px] justify-center rounded-xl border bg-background p-6">
      <NavigationMenu className="w-full justify-start" defaultValue="platform" {...args}>
        <NavigationMenuList className="justify-start">
          <NavigationMenuItem value="platform">
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent className="md:w-[420px]">
              <ul className="grid gap-1 md:grid-cols-2">
                {menuLinks.map((link) => (
                  <li key={link.title}>
                    <NavigationMenuLink href="#" className="grid gap-1 p-3">
                      <span className="font-medium">{link.title}</span>
                      <span className="text-muted-foreground">{link.description}</span>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" className="px-3 py-2 font-medium">
              Documentation
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuIndicator />
      </NavigationMenu>
    </div>
  )
}

export const WithViewport: Story = {
  render: renderNavigationMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1272" },
  },
}

export const InlineContent: Story = {
  args: {
    viewport: false,
  },
  render: renderNavigationMenu,
  parameters: {
    zephyr: { testCaseId: "SW-T1273" },
  },
}