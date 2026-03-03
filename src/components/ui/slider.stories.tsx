import { Slider } from "./slider"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
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

export const Default: Story = {
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "SW-T1298" },
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
  },
  render: renderSlider,
  parameters: {
    zephyr: { testCaseId: "SW-T1299" },
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
}