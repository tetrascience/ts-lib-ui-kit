import {
  BellIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { expect, within } from "storybook/test"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "info", "positive", "warning"],
    },
  },
  args: {
    variant: "default",
  },
}

export default meta

type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <BellIcon />
        <AlertTitle>Updates available</AlertTitle>
        <AlertDescription>
          A new version of the UI kit is ready to review in Storybook.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="secondary">
            Open
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1184" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Updates available")).toBeInTheDocument()
    })

    await step("Description and action render", async () => {
      expect(
        canvas.getByText(
          "A new version of the UI kit is ready to review in Storybook."
        )
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Open" })).toBeInTheDocument()
    })

    await step("Icon is present", async () => {
      expect(canvas.getByRole("alert").querySelector("svg")).toBeInTheDocument()
    })
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <TriangleAlertIcon />
        <AlertTitle>Action required</AlertTitle>
        <AlertDescription>
          This action can&apos;t be undone once the workspace is deleted.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="destructive">
            Review
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1185" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Destructive alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Action required")).toBeInTheDocument()
    })

    await step("Description and action render", async () => {
      expect(
        canvas.getByText(
          "This action can't be undone once the workspace is deleted."
        )
      ).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Review" })
      ).toBeInTheDocument()
    })

    await step("Icon is present", async () => {
      expect(canvas.getByRole("alert").querySelector("svg")).toBeInTheDocument()
    })
  },
}

export const Info: Story = {
  args: {
    variant: "info",
  },
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <InfoIcon />
        <AlertTitle>Did you know?</AlertTitle>
        <AlertDescription>
          You can drag and drop files directly into the upload area to get
          started faster.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1186" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Info alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Did you know?")).toBeInTheDocument()
    })

    await step("Description renders", async () => {
      expect(
        canvas.getByText(
          "You can drag and drop files directly into the upload area to get started faster."
        )
      ).toBeInTheDocument()
    })
  },
}

export const Positive: Story = {
  args: {
    variant: "positive",
  },
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <CircleCheckIcon />
        <AlertTitle>Pipeline complete</AlertTitle>
        <AlertDescription>
          All 12 files were processed successfully and are ready for review.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1187" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Positive alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(canvas.getByText("Pipeline complete")).toBeInTheDocument()
    })

    await step("Description renders", async () => {
      expect(
        canvas.getByText(
          "All 12 files were processed successfully and are ready for review."
        )
      ).toBeInTheDocument()
    })
  },
}

export const Warning: Story = {
  args: {
    variant: "warning",
  },
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <TriangleAlertIcon />
        <AlertTitle>Storage limit approaching</AlertTitle>
        <AlertDescription>
          Your workspace has used 90% of its storage quota. Consider archiving
          older files.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1188" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Warning alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument()
      expect(
        canvas.getByText("Storage limit approaching")
      ).toBeInTheDocument()
    })

    await step("Description renders", async () => {
      expect(
        canvas.getByText(
          "Your workspace has used 90% of its storage quota. Consider archiving older files."
        )
      ).toBeInTheDocument()
    })
  },
}
