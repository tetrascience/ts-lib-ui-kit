import { Spinner } from "./spinner"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  render: () => <Spinner />,
  parameters: {
    zephyr: { testCaseId: "SW-T1302" },
  },
}

export const Large: Story = {
  render: () => <Spinner className="size-8" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1303" },
  },
}