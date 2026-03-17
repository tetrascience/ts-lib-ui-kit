import { AspectRatio } from "./aspect-ratio"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof AspectRatio> = {
  title: "Components/Aspect Ratio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: { type: "number" },
    },
  },
  args: {
    ratio: 16 / 9,
  },
}

export default meta

type Story = StoryObj<typeof AspectRatio>

function renderAspectRatio(args: Story["args"]) {
  return (
    <div className="w-[360px]">
      <AspectRatio {...args} className="overflow-hidden rounded-xl border bg-muted">
        <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-700 to-slate-500 text-sm font-medium text-white">
          {args?.ratio === 1 ? "1:1 Preview" : "16:9 Preview"}
        </div>
      </AspectRatio>
    </div>
  )
}

export const Default: Story = {
  render: renderAspectRatio,
  parameters: {
    zephyr: { testCaseId: "SW-T1186" },
  },
}

export const Square: Story = {
  args: {
    ratio: 1,
  },
  render: renderAspectRatio,
  parameters: {
    zephyr: { testCaseId: "SW-T1187" },
  },
}