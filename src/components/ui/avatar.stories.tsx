import { CheckIcon } from "lucide-react"
import { expect, within } from "storybook/test"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "./avatar"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg"],
    },
  },
  args: {
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof Avatar>

function renderAvatar(args: Story["args"]) {
  return (
    <Avatar {...args}>
      <AvatarFallback>OW</AvatarFallback>
      <AvatarBadge>
        <CheckIcon />
      </AvatarBadge>
    </Avatar>
  )
}

export const Default: Story = {
  render: renderAvatar,
  parameters: {
    zephyr: { testCaseId: "SW-T1188" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Avatar fallback initials render", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument()
    })
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderAvatar,
  parameters: {
    zephyr: { testCaseId: "SW-T1189" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Small avatar shows fallback initials", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument()
    })
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderAvatar,
  parameters: {
    zephyr: { testCaseId: "SW-T1190" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Large avatar shows fallback initials", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument()
    })
  },
}

export const Group: Story = {
  render: (args) => (
    <AvatarGroup>
      <Avatar size="sm">
        <AvatarFallback>OW</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>TS</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>UI</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+2</AvatarGroupCount>
    </AvatarGroup>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1191" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Avatar group shows fallbacks and count", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument()
      expect(canvas.getByText("TS")).toBeInTheDocument()
      expect(canvas.getByText("UI")).toBeInTheDocument()
      expect(canvas.getByText("+2")).toBeInTheDocument()
    })
  },
}