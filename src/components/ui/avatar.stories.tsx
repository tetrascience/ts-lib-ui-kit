import { CheckIcon } from "lucide-react"

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
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderAvatar,
  parameters: {
    zephyr: { testCaseId: "SW-T1189" },
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
}

export const Group: Story = {
  render: () => (
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
}