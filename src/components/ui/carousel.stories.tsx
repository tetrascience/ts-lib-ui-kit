import { expect, within } from "storybook/test"

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Carousel region renders", async () => {
      expect(canvas.getAllByRole("region").length).toBeGreaterThanOrEqual(1)
    })

    await step("Slide content is visible", async () => {
      expect(canvas.getByText("Analytics")).toBeInTheDocument()
    })

    await step("Previous and next controls are present", async () => {
      expect(canvas.getByRole("button", { name: "Previous slide" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Next slide" })).toBeInTheDocument()
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical carousel region renders", async () => {
      expect(canvas.getAllByRole("region").length).toBeGreaterThanOrEqual(1)
    })

    await step("Slide content is visible", async () => {
      expect(canvas.getByText("Analytics")).toBeInTheDocument()
    })

    await step("Previous and next controls are present", async () => {
      expect(canvas.getByRole("button", { name: "Previous slide" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Next slide" })).toBeInTheDocument()
    })
  },
}