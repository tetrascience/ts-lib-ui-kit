import { Bold, CalendarIcon, ChevronDownIcon, Italic, Underline } from "lucide-react"
import { type ReactNode } from "react"
import { expect, within } from "storybook/test"

import { Button } from "./button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/Button Group",
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Button group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
    })

    await step("Multiple segment buttons are visible", async () => {
      expect(canvas.getByRole("button", { name: "Today" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "This week" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "This month" })).toBeInTheDocument()
    })
  },
}

function VariationRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

/**
 * The ways a ButtonGroup is used: it's a presentational wrapper, so the variety
 * comes from the child buttons' variants + the SW-2445 `aria-pressed` selection
 * (ButtonGroup itself only owns `orientation` and the text/separator parts).
 */
export const Variations: Story = {
  parameters: {
    layout: "padded",
    zephyr: { testCaseId: "SW-T5648" },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <VariationRow label="Command group — no selection">
        <ButtonGroup>
          <Button variant="outline">Copy</Button>
          <Button variant="outline">Move</Button>
          <Button variant="outline">Archive</Button>
        </ButtonGroup>
      </VariationRow>

      <VariationRow label="Single active — aria-pressed">
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline" aria-pressed>
            Week
          </Button>
          <Button variant="outline">Month</Button>
        </ButtonGroup>
      </VariationRow>

      <VariationRow label="Toggle buttons — multiple aria-pressed">
        <ButtonGroup>
          <Button variant="outline" aria-pressed aria-label="Bold">
            <Bold />
          </Button>
          <Button variant="outline" aria-label="Italic">
            <Italic />
          </Button>
          <Button variant="outline" aria-pressed aria-label="Underline">
            <Underline />
          </Button>
        </ButtonGroup>
      </VariationRow>

      <VariationRow label="With text + separator">
        <ButtonGroup>
          <Button variant="outline">Prev</Button>
          <Button variant="outline">Next</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>Page 3 of 12</ButtonGroupText>
        </ButtonGroup>
      </VariationRow>

      <VariationRow label="Vertical">
        <ButtonGroup orientation="vertical" className="w-fit">
          <Button variant="outline">Top</Button>
          <Button variant="outline" aria-pressed>
            Middle
          </Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </VariationRow>

      <VariationRow label="Vertical with separator">
        <ButtonGroup orientation="vertical" className="w-fit">
          <Button variant="outline">Rename</Button>
          <Button variant="outline">Duplicate</Button>
          <ButtonGroupSeparator orientation="horizontal" />
          <Button variant="outline">Delete</Button>
        </ButtonGroup>
      </VariationRow>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("all variation groups render", async () => {
      expect(canvas.getAllByRole("group").length).toBeGreaterThanOrEqual(6)
    })

    await step("the active button is aria-pressed", async () => {
      expect(canvas.getByRole("button", { name: "Week" })).toHaveAttribute(
        "aria-pressed",
        "true",
      )
    })

    await step("aria-pressed carries the selected treatment", async () => {
      const selected = canvas.getByRole("button", { name: "Week" })
      const unselected = canvas.getByRole("button", { name: "Day" })
      const tint = getComputedStyle(selected).backgroundColor

      // The --selected tint must actually resolve to a paint, and must differ
      // from an unpressed sibling — this fails if the tokens go missing.
      expect(tint).not.toBe("")
      expect(tint).not.toBe("rgba(0, 0, 0, 0)")
      expect(tint).not.toBe(getComputedStyle(unselected).backgroundColor)
    })

    await step("a separator in a vertical group still draws a divider", async () => {
      const separator = canvasElement.querySelector(
        '[data-slot="button-group-separator"]',
      )
      expect(separator).not.toBeNull()
      // ButtonGroup strips the preceding button's bottom border, so the
      // separator is the only thing left drawing that line: it needs height.
      expect(separator!.getBoundingClientRect().height).toBeGreaterThan(0)
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical button group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
    })

    await step("Multiple segment buttons are visible", async () => {
      expect(canvas.getByRole("button", { name: "Today" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "This week" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "This month" })).toBeInTheDocument()
    })
  },
}