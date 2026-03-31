import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Skeleton renders", async () => {
      const skeleton = canvas
        .getAllByRole("generic")
        .find((el) => el.getAttribute("data-slot") === "skeleton")
      expect(skeleton).toBeTruthy()
    })

    await step("Skeleton uses pulse placeholder", async () => {
      const el = canvasElement.querySelector('[data-slot="skeleton"]')
      expect(el?.className).toMatch(/animate-pulse/)
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Skeleton placeholders render", async () => {
      const slots = canvas
        .getAllByRole("generic")
        .filter((el) => el.getAttribute("data-slot") === "skeleton")
      expect(slots).toHaveLength(3)
    })

    await step("Profile card container", async () => {
      expect(canvasElement.querySelector(".rounded-xl.border")).toBeTruthy()
    })
  },
}