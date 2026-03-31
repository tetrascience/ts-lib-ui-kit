import { expect, within } from "storybook/test"

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

const playSpinner: Story["play"] = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement)

  await step("Spinner renders with status role", async () => {
    expect(canvas.getByRole("status", { name: "Loading" })).toBeInTheDocument()
  })

  await step("Spinner is an SVG element", async () => {
    expect(canvas.getByRole("status", { name: "Loading" }).tagName.toLowerCase()).toBe("svg")
  })
}

export const Default: Story = {
  render: () => <Spinner />,
  parameters: {
    zephyr: { testCaseId: "SW-T1302" },
  },
  play: playSpinner,
}

export const Large: Story = {
  render: () => <Spinner className="size-8" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1303" },
  },
  play: playSpinner,
}