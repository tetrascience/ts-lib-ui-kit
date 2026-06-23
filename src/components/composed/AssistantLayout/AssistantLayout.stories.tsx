import { SparklesIcon } from "lucide-react"
import { expect, userEvent } from "storybook/test"

import {
  AssistantDockControls,
  AssistantLayout,
  AssistantLayoutProvider,
} from "./AssistantLayout"

import type { AssistantDock } from "./dockLayout"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AssistantLayout> = {
  title: "AI Elements/Layout Manager",
  component: AssistantLayout,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AssistantLayout>

function MockAssistant() {
  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <SparklesIcon className="size-4 text-primary" />
        <span className="text-sm font-medium">AI Assistant</span>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3 text-sm">
        <div className="ml-auto w-fit max-w-[80%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
          Which leads have the best developability?
        </div>
        <div className="w-fit max-w-[85%] rounded-lg bg-muted px-3 py-2">
          Leads 3, 7 and 12 score highest on aggregation and thermostability. Want me to filter the table to those?
        </div>
      </div>
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex h-9 items-center rounded-lg border border-input px-3 text-sm text-muted-foreground">
          Ask anything…
        </div>
      </div>
    </>
  )
}

function MockContent() {
  return (
    <div className="flex-1 overflow-auto p-5">
      <h2 className="text-lg font-semibold">Antibody Lead Selection</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Main content area. Use the dock controls in the top bar to move the AI Assistant left, bottom, or right —
        or click the active icon again to hide it and reclaim the full width.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-background p-4 text-sm">
            Lead {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

function Demo({ defaultDock }: { defaultDock?: AssistantDock }) {
  return (
    <AssistantLayoutProvider defaultDock={defaultDock} persist={false}>
      <div className="flex h-screen w-full flex-col gap-2 p-3">
        <div className="flex shrink-0 items-center justify-between">
          <span className="text-sm font-semibold">Workspace</span>
          <AssistantDockControls />
        </div>
        <AssistantLayout assistant={<MockAssistant />}>
          <MockContent />
        </AssistantLayout>
      </div>
    </AssistantLayoutProvider>
  )
}

export const DockedLeft: Story = {
  render: () => <Demo defaultDock="left" />,
  play: async ({ canvasElement, step }) => {
    const body = () => canvasElement.querySelector('[data-slot="assistant-layout"]') as HTMLElement
    const assistant = () =>
      canvasElement.querySelector('[data-slot="assistant-layout-assistant"]') as HTMLElement
    // The three dock buttons are the only elements with aria-pressed.
    const dockButtons = () => [...canvasElement.querySelectorAll<HTMLElement>("[aria-pressed]")]

    await step("Starts docked left (row, assistant first)", async () => {
      expect(getComputedStyle(body()).flexDirection).toBe("row")
      expect(getComputedStyle(assistant()).order).toBe("0")
      expect(assistant()).toBeVisible()
    })

    await step("Dock bottom → column", async () => {
      await userEvent.click(dockButtons()[1]) // [left, bottom, right]
      expect(getComputedStyle(body()).flexDirection).toBe("column")
      expect(getComputedStyle(assistant()).order).toBe("2")
    })

    await step("Click the active dock again → hidden, no splitter, none pressed", async () => {
      await userEvent.click(dockButtons()[1]) // now active → hides
      expect(canvasElement.querySelector('[role="separator"]')).toBeNull()
      expect(dockButtons().some((b) => b.getAttribute("aria-pressed") === "true")).toBe(false)
      // assistant stays mounted (state preserved) but is visually hidden
      expect(assistant()).not.toBeVisible()
    })

    await step("Re-dock right → visible again, assistant after content", async () => {
      await userEvent.click(dockButtons()[2])
      expect(assistant()).toBeVisible()
      expect(getComputedStyle(body()).flexDirection).toBe("row")
      expect(getComputedStyle(assistant()).order).toBe("2")
    })
  },
}
export const DockedRight: Story = { render: () => <Demo defaultDock="right" /> }
export const DockedBottom: Story = { render: () => <Demo defaultDock="bottom" /> }
