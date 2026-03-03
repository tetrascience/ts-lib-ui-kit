import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "./button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
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

type Story = StoryObj<typeof ButtonGroup>

function renderGroup(args: Story["args"]) {
  const vertical = args?.orientation === "vertical"

  return (
    <ButtonGroup {...args}>
      <Button variant="outline">Today</Button>
      <Button variant="outline">This week</Button>
      <Button variant="outline">This month</Button>
      <ButtonGroupSeparator orientation={vertical ? "horizontal" : "vertical"} />
      <ButtonGroupText>
        <CalendarIcon />
        Range
        <ChevronDownIcon className="size-4" />
      </ButtonGroupText>
    </ButtonGroup>
  )
}

export const Horizontal: Story = {
  render: renderGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1200" },
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: renderGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1201" },
  },
}