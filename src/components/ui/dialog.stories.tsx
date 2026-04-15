import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "./button"
import {
  Dialog,
  DialogClose,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

function renderDialog(args: Story["args"] & { footerCloseButton?: boolean }) {
  const { footerCloseButton = false, ...contentArgs } = args ?? {}
  return (
    <Dialog open>
      <DialogContent {...contentArgs}>
        <DialogHeader>
          <DialogTitle>Share workspace</DialogTitle>
          <DialogDescription>
            Invite teammates, manage permissions, and choose the default access level for new collaborators.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-lg border p-3">Members: 12 active users</div>
          <div className="rounded-lg border p-3">Default role: Viewer</div>
        </DialogBody>
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

    await step("Header close button is present", async () => {
      expect(body.getByRole("button", { name: "Close" })).toBeInTheDocument()
    })

    await step("Dialog has correct data-slot on content", async () => {
      const dialog = body.getByRole("dialog")
      expect(dialog).toHaveAttribute("data-slot", "dialog-content")
    })
  },
}

export const FooterCloseButton: Story = {
  render: (args) => renderDialog({ ...args, footerCloseButton: true }),
  parameters: {
    zephyr: { testCaseId: "SW-T1231" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Share workspace")).toBeInTheDocument()
    })

    await step("Footer close button and save button both render", async () => {
      const footer = body.getByText("Save changes").closest("[data-slot='dialog-footer']")!
      expect(within(footer).getByRole("button", { name: "Close" })).toBeInTheDocument()
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

export const WithTrigger: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Triggered dialog</DialogTitle>
          <DialogDescription>
            This dialog was opened via a trigger button.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger button renders and dialog is initially closed", async () => {
      expect(canvas.getByRole("button", { name: "Open Dialog" })).toBeInTheDocument()
      expect(body.queryByRole("dialog")).not.toBeInTheDocument()
    })

    await step("Clicking trigger opens the dialog", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open Dialog" }))
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Triggered dialog")).toBeInTheDocument()
    })

    await step("Dialog footer has cancel and confirm buttons", async () => {
      expect(body.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(body.getByRole("button", { name: "Confirm" })).toBeInTheDocument()
    })

    await step("Clicking cancel closes the dialog", async () => {
      await userEvent.click(body.getByRole("button", { name: "Cancel" }))
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })
  },
}

export const CloseViaHeaderButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Closable dialog</DialogTitle>
          <DialogDescription>
            Click the X button to close this dialog.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open the dialog", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open" }))
      expect(body.getByRole("dialog")).toBeInTheDocument()
    })

    await step("Clicking the header close button closes the dialog", async () => {
      await userEvent.click(body.getByRole("button", { name: "Close" }))
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })
  },
}