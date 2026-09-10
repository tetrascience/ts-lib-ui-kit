import { expect, within } from "storybook/test"

import { Slider } from "./slider"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Slider> = {
  title: "Components/Forms & Inputs/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "default", "lg"],
    },
  },
  args: {
    defaultValue: [60],
    max: 100,
    step: 1,
  },
}

export default meta

type Story = StoryObj<typeof Slider>

function renderSlider(args: Story["args"]) {
  const containerClassName =
    args?.orientation === "vertical"
      ? "h-[260px] w-[120px] items-center"
      : "h-[80px] w-[320px]"

  return (
    <div className={`flex rounded-xl border bg-background p-6 ${containerClassName}`}>
      <Slider {...args} className={args?.orientation === "vertical" ? "h-full" : "w-full"} />
    </div>
  )
}

const playSliderSingleThumb: Story["play"] = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement)

  await step("Slider renders", async () => {
    expect(canvas.getByRole("slider")).toBeInTheDocument()
  })

  await step("Slider root present", async () => {
    expect(canvasElement.querySelector('[data-slot="slider"]')).toBeTruthy()
  })
}

export const Default: Story = {
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "SW-T1298" },
  },
  play: playSliderSingleThumb,
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
  },
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "SW-T1299" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Range slider renders", async () => {
      expect(canvas.getAllByRole("slider")).toHaveLength(2)
    })

    await step("Slider root present", async () => {
      expect(canvasElement.querySelector('[data-slot="slider"]')).toBeTruthy()
    })
  },
}

export const Vertical: Story = {
  args: {
    defaultValue: [40],
    orientation: "vertical",
  },
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "SW-T1300" },
  },
  play: playSliderSingleThumb,
}

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("xs slider thumb is 10px", async () => {
      const root = canvasElement.querySelector('[data-slot="slider"]')
      expect(root).toHaveAttribute("data-size", "xs")
      const thumb = canvas.getByRole("slider")
      expect(Math.round(thumb.getBoundingClientRect().height)).toBe(10)
    })
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("lg slider thumb is 14px", async () => {
      const thumb = canvas.getByRole("slider")
      expect(Math.round(thumb.getBoundingClientRect().height)).toBe(14)
    })
  },
}
