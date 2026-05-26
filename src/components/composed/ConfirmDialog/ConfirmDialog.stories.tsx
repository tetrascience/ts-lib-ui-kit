import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { ConfirmDialog } from "./ConfirmDialog"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { PATTERNS_COMPONENT_PREFIX } from "@/components/storybook-categories"
import { Button } from "@/components/ui/button"

const meta: Meta<typeof ConfirmDialog> = {
  title: `${PATTERNS_COMPONENT_PREFIX}/ConfirmDialog`,
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof ConfirmDialog>

const defaultArgs = {
  title: "Archive workspace",
  description:
    "This workspace will be archived and hidden from your dashboard. You can restore it later.",
  confirmLabel: "Archive",
  cancelLabel: "Cancel",
  trigger: <Button variant="outline">Archive workspace</Button>,
} satisfies Story["args"]

const destructiveArgs = {
  title: "Delete experiment",
  description: "JOB-9142 and all its associated data will be permanently removed.",
  variant: "destructive",
  confirmLabel: "Delete",
  trigger: <Button variant="destructive">Delete experiment</Button>,
} satisfies Story["args"]

export const Default: Story = {
  args: defaultArgs,
  parameters: {
    zephyr: { testCaseId: "SW-T5156" },
  },
}

export const Destructive: Story = {
  args: destructiveArgs,
  parameters: {
    zephyr: { testCaseId: "SW-T5157" },
  },
}

export const WithLoading: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ConfirmDialog
        title="Submit pipeline run"
        description="JOB-9145 will be queued and start processing shortly."
        confirmLabel="Submit"
        loading={true}
        open={open}
        onOpenChange={setOpen}
      />
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5158" },
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
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ConfirmDialog
        title="Remove team member"
        description="This user will lose access to all shared workspaces and pipelines."
        variant="destructive"
        confirmLabel="Remove"
        open={open}
        onOpenChange={setOpen}
      />
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5159" },
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
    zephyr: { testCaseId: "SW-T5160" },
  },
}

// Keep interaction-only stories out of docs/sidebar so dialogs do not flash
// during manual Storybook browsing, while still preserving play-test coverage.
export const DefaultInteractionTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: defaultArgs,
  parameters: {
    zephyr: { testCaseId: "SW-T5161" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Trigger button renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Archive workspace" })
      ).toBeInTheDocument()
      expect(body.queryByRole("dialog")).not.toBeInTheDocument()
    })

    await step("Clicking trigger opens the dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Archive workspace" })
      )
      const dialog = body.getByRole("dialog")
      expect(dialog).toBeInTheDocument()
      expect(
        within(dialog).getByRole("heading", { name: "Archive workspace" })
      ).toBeInTheDocument()
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

export const DestructiveInteractionTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: destructiveArgs,
  parameters: {
    zephyr: { testCaseId: "SW-T5162" },
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

    await step("Warning callout renders in dialog body", async () => {
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

export const AsyncConfirmInteractionTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: AsyncConfirm.render,
  parameters: {
    zephyr: { testCaseId: "SW-T5163" },
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
