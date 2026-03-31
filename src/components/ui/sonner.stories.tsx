import { toast } from "sonner"
import { expect, within } from "storybook/test"

import { Button } from "./button"
import { Toaster } from "./sonner"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Toaster> = {
  title: "Components/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Toaster>

function triggerToast(variant: "default" | "success" | "error" | "warning" | "info") {
  toast.dismiss()

  const message = "Workspace export queued"
  const description = "The latest run will be delivered to the reporting destination shortly."

  switch (variant) {
    case "success": {
      toast.success(message, { description })
      break
    }
    case "error": {
      toast.error("Export failed", { description: "The destination credentials need to be refreshed." })
      break
    }
    case "warning": {
      toast.warning("Retry required", { description: "One downstream connector reported a transient error." })
      break
    }
    case "info": {
      toast.info("Sync in progress", { description })
      break
    }
    default: {
      toast(message, { description })
    }
  }
}

function renderToaster(args: Story["args"]) {
  return (
      <div className="flex w-[420px] flex-col gap-3 rounded-xl border bg-background p-4">
        <p className="text-sm text-muted-foreground">Trigger each toast state to preview the local Sonner styling.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => triggerToast("default")} variant="outline">
            Default
          </Button>
          <Button onClick={() => triggerToast("success")} variant="outline">
            Success
          </Button>
          <Button onClick={() => triggerToast("error")} variant="outline">
            Error
          </Button>
          <Button onClick={() => triggerToast("warning")} variant="outline">
            Warning
          </Button>
          <Button className="col-span-2" onClick={() => triggerToast("info")} variant="outline">
            Info
          </Button>
        </div>
        <Toaster {...args} richColors />
      </div>
  )
}

export const Default: Story = {
  render: renderToaster,
  parameters: {
    zephyr: { testCaseId: "SW-T1301" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Toast trigger buttons render", async () => {
      expect(canvas.getByRole("button", { name: "Default" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Success" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Error" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Warning" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Info" })).toBeInTheDocument()
    })

    await step("Instructions render", async () => {
      expect(
        canvas.getByText("Trigger each toast state to preview the local Sonner styling."),
      ).toBeInTheDocument()
    })
  },
}