import {
  BellIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { expect, userEvent, waitFor, within } from "storybook/test"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { PATTERNS_COMPONENT_PREFIX } from "@/components/storybook-categories"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"

const meta: Meta = {
  title: `${PATTERNS_COMPONENT_PREFIX}/ToastPatterns`,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const InlineAlerts: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-3">
      <Alert variant="info">
        <InfoIcon />
        <AlertTitle>New connector available</AlertTitle>
        <AlertDescription>
          The Benchling ELN connector is now in beta. Enable it from your
          workspace settings.
        </AlertDescription>
      </Alert>
      <Alert variant="positive">
        <CircleCheckIcon />
        <AlertTitle>Pipeline JOB-9142 completed</AlertTitle>
        <AlertDescription>
          All 6,200 records were processed successfully and are ready for
          review.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>Storage at 87% capacity</AlertTitle>
        <AlertDescription>
          Export or archive older datasets to avoid pipeline interruptions.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>API key expired</AlertTitle>
        <AlertDescription>
          Pipelines using the legacy key have been paused. Rotate your key to
          resume.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T5174" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("All four alert variants render", async () => {
      const alerts = canvas.getAllByRole("alert")
      expect(alerts).toHaveLength(4)
    })

    await step("Alert titles are visible", async () => {
      expect(canvas.getByText("New connector available")).toBeInTheDocument()
      expect(
        canvas.getByText("Pipeline JOB-9142 completed")
      ).toBeInTheDocument()
      expect(canvas.getByText("Storage at 87% capacity")).toBeInTheDocument()
      expect(canvas.getByText("API key expired")).toBeInTheDocument()
    })
  },
}

export const ToastTriggers: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-3 rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">
        Trigger each toast variant to preview Sonner styling with TDP-flavored
        content.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => {
            toast.dismiss()
            toast.success("Pipeline started", {
              description: "JOB-9143 is now running.",
            })
          }}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.dismiss()
            toast.error("Export failed", {
              description: "Destination credentials are invalid.",
            })
          }}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.dismiss()
            toast.warning("Retry scheduled", {
              description:
                "Connector reported a transient timeout.",
            })
          }}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.dismiss()
            toast.info("Sync in progress", {
              description: "Dataset refreshing from upstream source.",
            })
          }}
        >
          Info
        </Button>
        <Button
          className="col-span-2"
          variant="outline"
          onClick={() => {
            toast.dismiss()
            toast("Workspace settings saved.")
          }}
        >
          Default
        </Button>
      </div>
      <Toaster richColors />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T5175" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    const testToastTrigger = async (buttonName: string, expectedText: string) => {
      await userEvent.click(canvas.getByRole("button", { name: buttonName }))
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(() => {
        expect(body.getAllByText(expectedText).length).toBeGreaterThan(0)
      })
    }

    await step("All trigger buttons render", async () => {
      expect(
        canvas.getByRole("button", { name: "Success" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Error" })).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Warning" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Info" })).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Default" })
      ).toBeInTheDocument()
    })

    await step("Clicking success shows toast", async () => {
      await testToastTrigger("Success", "Pipeline started")
    })

    await step("Clicking error shows toast", async () => {
      await testToastTrigger("Error", "Export failed")
    })

    await step("Clicking warning shows toast", async () => {
      await testToastTrigger("Warning", "Retry scheduled")
    })

    await step("Clicking info shows toast", async () => {
      await testToastTrigger("Info", "Sync in progress")
    })

    await step("Clicking default shows toast", async () => {
      await testToastTrigger("Default", "Workspace settings saved.")
    })
  },
}

export const AlertWithAction: Story = {
  render: () => (
    <div className="w-[480px]">
      <Alert>
        <BellIcon />
        <AlertTitle>Report ready to export</AlertTitle>
        <AlertDescription>
          Your Q2 pipeline summary has been compiled and is ready to download.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="secondary">
            View report
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T5176" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Alert renders with title and description", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Report ready to export")).toBeInTheDocument()
    })

    await step("Action button renders in alert", async () => {
      expect(
        canvas.getByRole("button", { name: "View report" })
      ).toBeInTheDocument()
    })
  },
}

export const ContextualUsage: Story = {
  render: () => {
    const [showWarning, setShowWarning] = useState(true)

    return (
      <div className="w-[480px]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline JOB-9144</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {showWarning ? (
              <Alert variant="warning">
                <TriangleAlertIcon />
                <AlertTitle>Retry required</AlertTitle>
                <AlertDescription>
                  One downstream connector reported a transient error. Retry to
                  resume.
                </AlertDescription>
                <AlertAction>
                  <Button
                    aria-label="Dismiss alert"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setShowWarning(false)}
                  >
                    <XIcon />
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              Status: <span className="font-medium text-foreground">Paused</span>
            </div>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              Records processed:{" "}
              <span className="font-medium text-foreground">4,820 / 6,200</span>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              size="sm"
              onClick={() => {
                toast.success("Pipeline restarted", {
                  description: "JOB-9144 is resuming from the last checkpoint.",
                })
              }}
            >
              Retry pipeline
            </Button>
            <Button size="sm" variant="outline">
              View logs
            </Button>
            <Toaster richColors />
          </CardFooter>
        </Card>
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5177" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Card with warning alert renders", async () => {
      expect(canvas.getByText("Pipeline JOB-9144")).toBeInTheDocument()
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Retry required")).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Dismiss alert" })
      ).toBeInTheDocument()
    })

    await step("Warning alert can be dismissed", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Dismiss alert" }))
      await waitFor(() => {
        expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
      })
    })

    await step("Action buttons are present", async () => {
      expect(
        canvas.getByRole("button", { name: "Retry pipeline" })
      ).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "View logs" })
      ).toBeInTheDocument()
    })

    await step("Clicking retry shows success toast", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Retry pipeline" })
      )
      const body = within(canvasElement.ownerDocument.body)
      await waitFor(() => {
        expect(
          body.getAllByText("Pipeline restarted").length
        ).toBeGreaterThan(0)
      })
    })
  },
}
