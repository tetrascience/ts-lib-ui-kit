import {
  CalendarIcon,
  FileTextIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import { expect, within } from "storybook/test"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Command> = {
  title: "Components/Command",
  component: Command,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Command>

function CommandContent() {
  return (
    <Command>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem value="open-calendar">
            <CalendarIcon />
            Open calendar
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem value="view-reports">
            <FileTextIcon />
            View reports
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspace">
          <CommandItem value="account-settings">
            <SettingsIcon />
            Account settings
          </CommandItem>
          <CommandItem value="invite-collaborator">
            <UserIcon />
            Invite collaborator
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export const Inline: Story = {
  render: () => (
    <div className="w-[360px] overflow-hidden rounded-xl border bg-background">
      <CommandContent />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1225" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Command input renders", async () => {
      expect(canvas.getByPlaceholderText("Search commands...")).toBeInTheDocument()
    })

    await step("Group headings and items render", async () => {
      expect(canvas.getByText("Quick actions")).toBeInTheDocument()
      expect(canvas.getByText("Workspace")).toBeInTheDocument()
      expect(canvas.getByText("Open calendar")).toBeInTheDocument()
      expect(canvas.getByText("Account settings")).toBeInTheDocument()
    })
  },
}

export const Dialog: Story = {
  render: () => (
    <CommandDialog description="Search for a destination or command." open title="Command Palette">
      <CommandContent />
    </CommandDialog>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1226" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog command input in portal", async () => {
      expect(body.getByPlaceholderText("Search commands...")).toBeInTheDocument()
    })

    await step("Palette groups and shortcuts render", async () => {
      expect(body.getByText("Quick actions")).toBeInTheDocument()
      expect(body.getByText("Open calendar")).toBeInTheDocument()
      expect(body.getByText("⌘K")).toBeInTheDocument()
    })
  },
}

export const DialogWithCloseButton: Story = {
  render: () => (
    <CommandDialog
      description="Search for a destination or command."
      open
      showCloseButton
      title="Command Palette"
    >
      <CommandContent />
    </CommandDialog>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1227" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Command palette content in document", async () => {
      expect(body.getByPlaceholderText("Search commands...")).toBeInTheDocument()
      expect(body.getByText("View reports")).toBeInTheDocument()
    })

    await step("Dialog close control renders", async () => {
      expect(body.getByRole("button", { name: "Close" })).toBeInTheDocument()
    })
  },
}