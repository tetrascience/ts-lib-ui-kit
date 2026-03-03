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
}