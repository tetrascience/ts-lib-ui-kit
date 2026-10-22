import { expect, within } from "storybook/test"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Accordion> = {
  title: "Components/Layout & Structure/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    // Docs "Show code": stories render via a local helper, so serialize the
    // rendered JSX tree instead of printing the helper call / story source.
    docs: { source: { type: "dynamic" } },
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Accordion>

function renderAccordion(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion className="w-[420px]" {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I use these components in Storybook?</AccordionTrigger>
        <AccordionContent>
          Yes. Each component can be composed into focused stories for docs and testing.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Do they support multiple open sections?</AccordionTrigger>
        <AccordionContent>
          The accordion root supports both single and multiple expansion modes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can content include links?</AccordionTrigger>
        <AccordionContent>
          Absolutely. You can include formatted content, actions, and <a href="./">inline links</a>.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const Single: Story = {
  render: () => renderAccordion({ type: "single", collapsible: true, defaultValue: "item-1" }),
  parameters: {
    zephyr: { testCaseId: "SW-T1180" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Accordion triggers and section headings render", async () => {
      expect(
        canvas.getByRole("button", { name: "Can I use these components in Storybook?" }),
      ).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Do they support multiple open sections?" }),
      ).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Can content include links?" })).toBeInTheDocument()
    })

    await step("Expanded section content is visible", async () => {
      expect(
        canvas.getByText(
          "Yes. Each component can be composed into focused stories for docs and testing.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const Multiple: Story = {
  render: () => renderAccordion({ type: "multiple", defaultValue: ["item-1", "item-2"] }),
  parameters: {
    zephyr: { testCaseId: "SW-T1181" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Accordion triggers render", async () => {
      expect(
        canvas.getByRole("button", { name: "Can I use these components in Storybook?" }),
      ).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Do they support multiple open sections?" }),
      ).toBeInTheDocument()
    })

    await step("Multiple expanded sections show content", async () => {
      expect(
        canvas.getByText(
          "Yes. Each component can be composed into focused stories for docs and testing.",
        ),
      ).toBeInTheDocument()
      expect(
        canvas.getByText("The accordion root supports both single and multiple expansion modes."),
      ).toBeInTheDocument()
    })
  },
}

/** UXT-254: the group draws the border, so one item is bounded and many close at both ends. */
export const Bounded: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Accordion type="single" collapsible data-testid="lone">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced options</AccordionTrigger>
          <AccordionContent>
            A single section is bounded by the group, with no border from the consumer.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="single" collapsible data-testid="several">
        <AccordionItem value="axes">
          <AccordionTrigger>Axes</AccordionTrigger>
          <AccordionContent>Tick density, gridlines and the axis label font size.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="series">
          <AccordionTrigger>Series</AccordionTrigger>
          <AccordionContent>Line width, marker shape and the per-series colour ramp.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="legend">
          <AccordionTrigger>Legend</AccordionTrigger>
          <AccordionContent>Placement, orientation and whether entries are clickable.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const width = (el: Element, side: "Top" | "Right" | "Bottom" | "Left") =>
      Math.round(parseFloat(getComputedStyle(el)[`border${side}Width`]))

    await step("A lone item is bounded on all four sides", async () => {
      const lone = canvasElement.querySelector('[data-testid="lone"]')!
      expect(width(lone, "Top")).toBe(1)
      expect(width(lone, "Right")).toBe(1)
      expect(width(lone, "Bottom")).toBe(1)
      expect(width(lone, "Left")).toBe(1)
    })

    await step("A multi-item group closes at both ends", async () => {
      const several = canvasElement.querySelector('[data-testid="several"]')!
      expect(width(several, "Top")).toBe(1)
      expect(width(several, "Bottom")).toBe(1)
    })

    await step("Each boundary carries exactly one rule, and none stack", async () => {
      const several = canvasElement.querySelector('[data-testid="several"]')!
      const items = [...several.querySelectorAll('[data-slot="accordion-item"]')]
      expect(items).toHaveLength(3)
      // No item draws a bottom rule, so a consumer's border-t replaces rather than stacks.
      expect(width(items[0], "Top")).toBe(0)
      items.forEach((item) => expect(width(item, "Bottom")).toBe(0))
      items.slice(1).forEach((item) => expect(width(item, "Top")).toBe(1))
    })
  },
}
