import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof AlertDialogContent> = {
  title: "Components/AlertDialog",
  component: AlertDialogContent,
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["default", "sm"],
    },
  },
  args: {
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof AlertDialogContent>

function renderDialog(args: Story["args"]) {
  return (
    <AlertDialog open>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            This action permanently removes the workspace and its saved settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const Default: Story = {
  render: renderDialog,
  parameters: {
    zephyr: { testCaseId: "SW-T1182" },
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderDialog,
  parameters: {
    zephyr: { testCaseId: "SW-T1183" },
  },
}