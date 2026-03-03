import { Skeleton } from "./skeleton"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => <Skeleton className="h-8 w-[260px]" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1296" },
  },
}

export const ProfileCard: Story = {
  render: () => (
    <div className="flex w-[320px] items-center gap-4 rounded-xl border p-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1297" },
  },
}