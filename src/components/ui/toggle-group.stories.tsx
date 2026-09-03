import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, XIcon } from "lucide-react"
import { type ReactNode } from "react"
import { expect, within } from "storybook/test"

import { Button } from "./button"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ToggleGroup> = {
  title: "Components/Toggle Group",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg"],
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    spacing: {
      control: { type: "number" },
    },
  },
  args: {
    variant: "default",
    size: "default",
    orientation: "horizontal",
    spacing: 0,
  },
}

export default meta

type Story = StoryObj<typeof ToggleGroup>

function renderToggleGroup(args: Story["args"]) {
  return (
    <ToggleGroup {...args} defaultValue={["left"]} type="multiple">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export const Default: Story = {
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1316" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Toggle group container renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
    })

    await step("Alignment toggle buttons render", async () => {
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1317" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Outline toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
    })
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1318" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Small toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
    })
  },
}

export const Large: Story = {
  args: {
    size: "lg",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1319" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Large toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1320" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Vertical toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align left" })).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align right" })).toBeInTheDocument()
    })
  },
}

export const Spaced: Story = {
  args: {
    spacing: 2,
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: { testCaseId: "SW-T1321" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Spaced toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Align center" })).toBeInTheDocument()
    })
  },
}

/**
 * SW-2445: labelled multi-select. Label-only items show the dotted-ring→check
 * indicator by default (no `selectedIndicator` prop needed), so even with every
 * option selected the items stay countable — each shows a check and the segments
 * keep their dividers + container outline, so "all selected" never collapses
 * into one solid button.
 */
export const SelectedIndicator: Story = {
  name: "Selected indicator (SW-2445)",
  parameters: {
    zephyr: { testCaseId: "SW-T5647" },
  },
  render: () => (
    <ToggleGroup
      type="multiple"
      variant="outline"
      defaultValue={["samples", "controls", "blanks"]}
    >
      <ToggleGroupItem value="samples">Samples</ToggleGroupItem>
      <ToggleGroupItem value="controls">Controls</ToggleGroupItem>
      <ToggleGroupItem value="blanks">Blanks</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("all three options are selected", async () => {
      const items = canvas.getAllByRole("button")
      expect(items).toHaveLength(3)
      items.forEach((el) => expect(el).toHaveAttribute("data-state", "on"))
    })

    await step("each selected item shows a check indicator", async () => {
      canvas.getAllByRole("button").forEach((el) => {
        expect(el.querySelector(".lucide-check")).not.toBeNull()
      })
    })

    await step("the segmented items are outlined (per-item borders)", async () => {
      const item = canvas.getAllByRole("button")[0]
      expect(getComputedStyle(item).borderTopWidth).not.toBe("0px")
    })
  },
}

function VariationRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

/**
 * The ways a ToggleGroup is used: single vs multi select, icon-only vs
 * label-only (which sets the SW-2445 indicator default), the segmented vs
 * spaced layout, the outline variant, and sizes.
 */
export const Variations: Story = {
  parameters: {
    layout: "padded",
    zephyr: { testCaseId: "SW-T5649" },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <VariationRow label="Single select — icon-only (no ring)">
        <ToggleGroup type="single" defaultValue="center" aria-label="Align">
          <ToggleGroupItem value="left" aria-label="Left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </VariationRow>

      <VariationRow label="Single select — label-only (ring on by default)">
        <ToggleGroup type="single" defaultValue="board">
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
          <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
        </ToggleGroup>
      </VariationRow>

      <VariationRow label="Multi select — all selected stays countable">
        <ToggleGroup type="multiple" defaultValue={["samples", "controls", "blanks"]}>
          <ToggleGroupItem value="samples">Samples</ToggleGroupItem>
          <ToggleGroupItem value="controls">Controls</ToggleGroupItem>
          <ToggleGroupItem value="blanks">Blanks</ToggleGroupItem>
        </ToggleGroup>
      </VariationRow>

      <VariationRow label="Outline variant + spaced (spacing=4)">
        <ToggleGroup type="single" variant="outline" defaultValue="center" aria-label="Align">
          <ToggleGroupItem value="left" aria-label="Left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" variant="outline" spacing={4} defaultValue="center" aria-label="Align spaced">
          <ToggleGroupItem value="left" aria-label="Left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </VariationRow>

      <VariationRow label="Joined to an adjacent control (consumer border override)">
        <ToggleGroup type="single" variant="outline" size="sm" defaultValue="plate-1">
          <div className="inline-flex items-stretch">
            <ToggleGroupItem
              value="plate-1"
              data-testid="joined-item"
              className="rounded-r-none border-r-0"
            >
              <span className="truncate">Plate 1</span>
            </ToggleGroupItem>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Remove Plate 1"
              className="rounded-l-none"
            >
              <XIcon />
            </Button>
          </div>
        </ToggleGroup>
      </VariationRow>

      <VariationRow label="Sizes — sm / default / lg">
        <ToggleGroup type="single" size="sm" defaultValue="board">
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" size="default" defaultValue="board">
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" size="lg" defaultValue="board">
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="table">Table</ToggleGroupItem>
        </ToggleGroup>
      </VariationRow>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step("all variation groups render", async () => {
      expect(
        canvasElement.querySelectorAll('[data-slot="toggle-group"]').length,
      ).toBeGreaterThanOrEqual(6)
    })

    await step("label-only selected items show a check", async () => {
      expect(canvasElement.querySelector(".lucide-check")).not.toBeNull()
    })

    await step("a consumer's className still wins over the item border", async () => {
      // The segmented border must stay at plain-utility specificity, or a
      // group-scoped selector silently beats `border-r-0` passed by a consumer
      // and the item no longer sits flush against its adjacent control.
      const joined = canvasElement.querySelector<HTMLElement>(
        '[data-testid="joined-item"]',
      )
      expect(joined).not.toBeNull()
      expect(getComputedStyle(joined!).borderRightWidth).toBe("0px")
    })
  },
}