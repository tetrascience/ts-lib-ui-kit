import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
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
    orientation: "horizontal",
  },
}

export default meta

type Story = StoryObj<typeof Carousel>

function renderCarousel(args: Story["args"]) {
  const vertical = args?.orientation === "vertical"

  return (
    <div className={vertical ? "h-[320px] px-12" : "w-[340px] px-12"}>
      <Carousel {...args} className="w-full">
        <CarouselContent className={vertical ? "h-[320px]" : undefined}>
          {["Analytics", "Reports", "Exports"].map((label) => (
            <CarouselItem key={label} className="basis-1/2">
              <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted text-sm font-medium">
                {label}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export const Horizontal: Story = {
  render: renderCarousel,
  parameters: {
    zephyr: { testCaseId: "SW-T1214" },
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: renderCarousel,
  parameters: {
    zephyr: { testCaseId: "SW-T1215" },
  },
}