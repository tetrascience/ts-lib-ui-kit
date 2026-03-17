import { ChevronDownIcon } from "lucide-react"

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
  render: () => renderCollapsible(false),
  parameters: {
    zephyr: { testCaseId: "SW-T1219" },
  },
}

export const Open: Story = {
  render: () => renderCollapsible(true),
  parameters: {
    zephyr: { testCaseId: "SW-T1220" },
  },
}