import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Share workspace")).toBeInTheDocument()
    })

    await step("Description, body, and save action render", async () => {
      expect(
        body.getByText(
          "Invite teammates, manage permissions, and choose the default access level for new collaborators.",
        ),
      ).toBeInTheDocument()
      expect(body.getByText("Members: 12 active users")).toBeInTheDocument()
      expect(body.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
    })
  },
}

export const FooterCloseButton: Story = {
  render: (args) => renderDialog(args, true),
  parameters: {
    zephyr: { testCaseId: "SW-T1231" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Share workspace")).toBeInTheDocument()
    })

    await step("Footer save button renders", async () => {
      expect(body.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Share workspace")).toBeInTheDocument()
    })

    await step("Header close control is not shown", async () => {
      expect(body.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
    })
  },
}