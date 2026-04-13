import { ChevronDownIcon } from "lucide-react"
import { expect, within } from "storybook/test"

import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Collapsible> = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Collapsible>

function renderCollapsible(defaultOpen = false) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="w-[360px] space-y-2">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <div className="text-sm font-medium">Release notes</div>
          <div className="text-sm text-muted-foreground">Expand to preview the latest changes.</div>
        </div>
        <CollapsibleTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <ChevronDownIcon />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
        Added new UI primitives, Storybook coverage, and layout examples for interactive components.
      </CollapsibleContent>
    </Collapsible>
  )
}

export const Closed: Story = {
  render: (args) => renderCollapsible(false),
  parameters: {
    zephyr: { testCaseId: "SW-T1219" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Header and trigger render", async () => {
      expect(canvas.getByText("Release notes")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: /toggle details/i })).toBeInTheDocument()
    })

    await step("Collapsed hint text visible", async () => {
      expect(
        canvas.getByText("Expand to preview the latest changes."),
      ).toBeInTheDocument()
    })
  },
}

export const Open: Story = {
  render: (args) => renderCollapsible(true),
  parameters: {
    zephyr: { testCaseId: "SW-T1220" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Trigger still present when open", async () => {
      expect(canvas.getByRole("button", { name: /toggle details/i })).toBeInTheDocument()
    })

    await step("Expanded content visible", async () => {
      expect(
        canvas.getByText(
          "Added new UI primitives, Storybook coverage, and layout examples for interactive components.",
        ),
      ).toBeInTheDocument()
    })
  },
}