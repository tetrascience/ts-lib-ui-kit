import { BellIcon, TriangleAlertIcon } from "lucide-react"

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
      options: ["default", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
}

export default meta

type Story = StoryObj<typeof Alert>

function renderAlert(args: Story["args"]) {
  const isDestructive = args?.variant === "destructive"

  return (
    <div className="w-[420px]">
      <Alert {...args}>
        {isDestructive ? <TriangleAlertIcon /> : <BellIcon />}
        <AlertTitle>
          {isDestructive ? "Action required" : "Updates available"}
        </AlertTitle>
        <AlertDescription>
          {isDestructive
            ? "This action can’t be undone once the workspace is deleted."
            : "A new version of the UI kit is ready to review in Storybook."}
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant={isDestructive ? "destructive" : "secondary"}>
            {isDestructive ? "Review" : "Open"}
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}

export const Default: Story = {
  render: renderAlert,
  parameters: {
    zephyr: { testCaseId: "SW-T1184" },
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: renderAlert,
  parameters: {
    zephyr: { testCaseId: "SW-T1185" },
  },
}