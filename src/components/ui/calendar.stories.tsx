import { expect, within } from "storybook/test"

import { Calendar } from "./calendar"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"

const defaultMonth = new Date(2026, 2, 1)
const selectedDate = new Date(2026, 2, 6)
const selectedRange = {
  from: new Date(2026, 2, 4),
  to: new Date(2026, 2, 10),
}

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Calendar>

function renderCalendar(props: ComponentProps<typeof Calendar>) {
  return (
    <div className="rounded-xl border bg-background p-2">
      <Calendar defaultMonth={defaultMonth} {...props} />
    </div>
  )
}

export const Default: Story = {
  render: () => renderCalendar({ mode: "single", selected: selectedDate }),
  parameters: {
    zephyr: { testCaseId: "SW-T1208" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Calendar grid renders", async () => {
      expect(canvas.getByRole("grid")).toBeInTheDocument()
    })

    await step("Month and year caption is visible", async () => {
      expect(canvas.getByText("March 2026")).toBeInTheDocument()
    })

    await step("Month navigation buttons are present", async () => {
      expect(
        canvas.getByRole("button", { name: "Go to the Previous Month" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go to the Next Month" })).toBeInTheDocument()
    })
  },
}

export const Range: Story = {
  render: () =>
    renderCalendar({
      mode: "range",
      selected: selectedRange,
      numberOfMonths: 2,
    }),
  parameters: {
    zephyr: { testCaseId: "SW-T1209" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Range calendar grids render", async () => {
      expect(canvas.getAllByRole("grid").length).toBe(2)
    })

    await step("Month captions are visible", async () => {
      expect(canvas.getByText("March 2026")).toBeInTheDocument()
      expect(canvas.getByText("April 2026")).toBeInTheDocument()
    })

    await step("Month navigation buttons are present", async () => {
      expect(
        canvas.getByRole("button", { name: "Go to the Previous Month" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go to the Next Month" })).toBeInTheDocument()
    })
  },
}

export const DropdownCaption: Story = {
  render: () =>
    renderCalendar({
      mode: "single",
      selected: selectedDate,
      captionLayout: "dropdown",
      fromYear: 2024,
      toYear: 2028,
    }),
  parameters: {
    zephyr: { testCaseId: "SW-T1210" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Calendar grid renders", async () => {
      expect(canvas.getByRole("grid")).toBeInTheDocument()
    })

    await step("Dropdown caption shows month and year", async () => {
      expect(canvas.getAllByText("Mar").length).toBeGreaterThanOrEqual(1)
      expect(canvas.getAllByText("2026").length).toBeGreaterThanOrEqual(1)
    })

    await step("Month navigation buttons are present", async () => {
      expect(
        canvas.getByRole("button", { name: "Go to the Previous Month" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go to the Next Month" })).toBeInTheDocument()
    })
  },
}

export const WeekNumbers: Story = {
  render: () =>
    renderCalendar({
      mode: "single",
      selected: selectedDate,
      showWeekNumber: true,
    }),
  parameters: {
    zephyr: { testCaseId: "SW-T1211" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Calendar grid with week numbers renders", async () => {
      expect(canvas.getByRole("grid")).toBeInTheDocument()
    })

    await step("Week number column header is exposed", async () => {
      expect(canvas.getByLabelText("Week Number")).toBeInTheDocument()
    })

    await step("Month caption and navigation are present", async () => {
      expect(canvas.getByText("March 2026")).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Go to the Previous Month" })
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go to the Next Month" })).toBeInTheDocument()
    })
  },
}