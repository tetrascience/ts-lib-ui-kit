import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"

import { ConfirmDialog } from "./ConfirmDialog"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ConfirmDialog> = {
  title: "Design Patterns/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  args: {
    title: "Archive workspace",
    description:
      "This workspace will be archived and hidden from your dashboard. You can restore it later.",
    confirmLabel: "Archive",
    cancelLabel: "Cancel",
    trigger: <Button variant="outline">Archive workspace</Button>,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1515" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger button renders and dialog is initially closed", async () => {
      expect(
        canvas.getByRole("button", { name: "Archive workspace" })
      ).toBeInTheDocument()
      expect(body.queryByRole("dialog")).not.toBeInTheDocument()
    })

    await step("Clicking trigger opens the dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Archive workspace" })
      )
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Archive workspace")).toBeInTheDocument()
    })

    await step("Cancel and confirm buttons are present", async () => {
      expect(body.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(
        body.getByRole("button", { name: "Archive" })
      ).toBeInTheDocument()
    })

    await step("Clicking cancel closes the dialog", async () => {
      await userEvent.click(body.getByRole("button", { name: "Cancel" }))
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })
  },
}

export const Destructive: Story = {
  args: {
    title: "Delete experiment",
    description:
      "JOB-9142 and all its associated data will be permanently removed.",
    variant: "destructive",
    confirmLabel: "Delete",
    trigger: <Button variant="destructive">Delete experiment</Button>,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1516" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger opens destructive dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Delete experiment" })
      )
      expect(body.getByRole("dialog")).toBeInTheDocument()
    })

    await step("Warning alert renders in dialog body", async () => {
      expect(body.getByRole("alert")).toBeInTheDocument()
      expect(
        body.getByText("This action cannot be undone.")
      ).toBeInTheDocument()
    })

    await step("Destructive confirm button is present", async () => {
      expect(body.getByRole("button", { name: "Delete" })).toBeInTheDocument()
    })

    await step("Close dialog for cleanup", async () => {
      await userEvent.click(body.getByRole("button", { name: "Cancel" }))
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })
  },
}

export const WithLoading: Story = {
  args: {
    title: "Submit pipeline run",
    description: "JOB-9145 will be queued and start processing shortly.",
    confirmLabel: "Submit",
    loading: true,
    open: true,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1517" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog is open with loading state", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
    })

    await step("Confirm button is disabled while loading", async () => {
      const confirmBtn = body.getByRole("button", { name: /Submit/ })
      expect(confirmBtn).toBeDisabled()
    })

    await step("Spinner is visible in confirm button", async () => {
      const confirmBtn = body.getByRole("button", { name: /Submit/ })
      expect(confirmBtn.querySelector("[data-slot='spinner']")).toBeInTheDocument()
    })
  },
}

export const ControlledOpen: Story = {
  args: {
    title: "Remove team member",
    description:
      "This user will lose access to all shared workspaces and pipelines.",
    variant: "destructive",
    confirmLabel: "Remove",
    open: true,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1518" },
  },
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("Dialog renders open without a trigger", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument()
      expect(body.getByText("Remove team member")).toBeInTheDocument()
    })

    await step("No trigger button present in canvas", async () => {
      const canvas = within(canvasElement)
      expect(canvas.queryByRole("button", { name: "Remove team member" })).not.toBeInTheDocument()
    })
  },
}

export const AsyncConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    function handleConfirm() {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setOpen(false)
      }, 1500)
    }

    return (
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Delete dataset
        </Button>
        <ConfirmDialog
          title="Delete dataset"
          description="This dataset and all linked pipeline results will be permanently removed."
          variant="destructive"
          confirmLabel="Delete"
          open={open}
          onOpenChange={setOpen}
          onConfirm={handleConfirm}
          loading={loading}
        />
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1519" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger button renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Delete dataset" })
      ).toBeInTheDocument()
    })

    await step("Clicking trigger opens dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Delete dataset" })
      )
      expect(body.getByRole("dialog")).toBeInTheDocument()
    })

    await step("Cancel closes dialog", async () => {
      await userEvent.click(body.getByRole("button", { name: "Cancel" }))
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument()
      })
    })
  },
}
