import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof DialogContent> = {
  title: "Components/Dialog",
  component: DialogContent,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
  argTypes: {
    showCloseButton: {
      control: { type: "boolean" },
    },
  },
  args: {
    showCloseButton: true,
  },
}

export default meta

type Story = StoryObj<typeof DialogContent>

function renderDialog(args: Story["args"]) {
  return (
    <Dialog open>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Share workspace</DialogTitle>
          <DialogDescription>
            Invite teammates, manage permissions, and choose the default access level for new collaborators.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-lg border p-3">Members: 12 active users</div>
          <div className="rounded-lg border p-3">Default role: Viewer</div>
        </div>
          <DialogFooter showCloseButton={args?.showCloseButton}>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Default: Story = {
  render: renderDialog,
  parameters: {
    zephyr: { testCaseId: "SW-T1230" },
  },
}

export const FooterCloseButton: Story = {
  render: (args) => renderDialog(args, true),
  parameters: {
    zephyr: { testCaseId: "SW-T1231" },
  },
}

export const WithoutCloseButton: Story = {
  args: {
    showCloseButton: false,
  },
  render: renderDialog,
  parameters: {
    zephyr: { testCaseId: "SW-T1232" },
  },
}