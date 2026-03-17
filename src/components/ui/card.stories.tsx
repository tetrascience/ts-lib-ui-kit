import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
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

type Story = StoryObj<typeof Card>

function renderCard(args: Story["args"]) {
  return (
    <div className="w-[320px]">
      <Card {...args}>
        <CardHeader>
          <CardTitle>Storage usage</CardTitle>
          <CardDescription>Current workspace allocation</CardDescription>
        </CardHeader>
        <CardContent>
          72% of your available storage is currently in use.
        </CardContent>
        <CardFooter>Last updated 5 minutes ago</CardFooter>
      </Card>
    </div>
  )
}

export const Default: Story = {
  render: renderCard,
  parameters: {
    zephyr: { testCaseId: "SW-T1212" },
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderCard,
  parameters: {
    zephyr: { testCaseId: "SW-T1213" },
  },
}