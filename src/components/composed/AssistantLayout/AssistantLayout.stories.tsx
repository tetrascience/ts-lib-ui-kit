import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  AssistantDockControls,
  AssistantLayout,
  AssistantLayoutProvider,
} from "./AssistantLayout"

import type { AssistantDock } from "./dockLayout"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AssistantLayout> = {
  title: "AI Elements/Conversation/Layout Manager",
  component: AssistantLayout,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AssistantLayout>

// The header cap now comes from AssistantLayout (`assistantTitle`); the slot is
// just the message body + composer. The composer sits in a muted tray so it
// reads as a distinct compose zone.
function MockAssistant() {
  return (
    <>
      <div className="flex-1 space-y-3 overflow-auto p-3 text-sm">
        <div className="ml-auto w-fit max-w-[80%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
          Which leads have the best developability?
        </div>
        <div className="w-fit max-w-[85%] rounded-lg bg-muted px-3 py-2">
          Leads 3, 7 and 12 score highest on aggregation and thermostability. Want me to filter the table to those?
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-muted/40 p-3">
        <div className="flex h-9 items-center rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground">
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

/**
 * Docs "Show code": the stories render through a story-local Demo with mock
 * panels, so hand-written usage code is shown instead (same approach as
 * DataAppShell).
 */
const usageCode = (dock: AssistantDock) => `<AssistantLayoutProvider defaultDock="${dock}">
  <div className="flex h-screen w-full flex-col gap-2 p-3">
    <div className="flex shrink-0 items-center justify-between">
      <span className="text-sm font-semibold">Workspace</span>
      <AssistantDockControls />
    </div>
    <AssistantLayout assistant={<YourAssistantPanel />} assistantTitle="AI Assistant">
      <YourMainContent />
    </AssistantLayout>
  </div>
</AssistantLayoutProvider>`

function Demo({ defaultDock }: { defaultDock?: AssistantDock }) {
  return (
    <AssistantLayoutProvider defaultDock={defaultDock} persist={false}>
      <div className="flex h-screen w-full flex-col gap-2 p-3">
        <div className="flex shrink-0 items-center justify-between">
          <span className="text-sm font-semibold">Workspace</span>
          <AssistantDockControls />
        </div>
        <AssistantLayout assistant={<MockAssistant />} assistantTitle="AI Assistant">
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
    const content = () =>
      canvasElement.querySelector('[data-slot="assistant-layout-content"]') as HTMLElement
    // The three dock buttons are the only elements with aria-pressed.
    const dockButtons = () => [...canvasElement.querySelectorAll<HTMLElement>("[aria-pressed]")]
    // True when `a` appears before `b` in document order.
    const precedes = (a: HTMLElement, b: HTMLElement) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

    await step("Starts docked left (horizontal, assistant before content)", async () => {
      expect(getComputedStyle(body()).flexDirection).toBe("row")
      expect(assistant()).toBeVisible()
      expect(precedes(assistant(), content())).toBe(true)
      // The resizable handle is present while the assistant is visible.
      expect(canvasElement.querySelector('[role="separator"]')).not.toBeNull()
    })

    await step("Dock bottom → vertical", async () => {
      await userEvent.click(dockButtons()[1]) // [left, bottom, right]
      expect(getComputedStyle(body()).flexDirection).toBe("column")
      expect(precedes(content(), assistant())).toBe(true)
    })

    await step("Click the active dock again → hidden, no handle, none pressed", async () => {
      await userEvent.click(dockButtons()[1]) // now active → hides
      expect(canvasElement.querySelector('[role="separator"]')).toBeNull()
      expect(dockButtons().some((b) => b.getAttribute("aria-pressed") === "true")).toBe(false)
      expect(canvasElement.querySelector('[data-slot="assistant-layout-assistant"]')).toBeNull()
    })

    await step("Re-dock right → visible again, content before assistant", async () => {
      await userEvent.click(dockButtons()[2])
      expect(assistant()).toBeVisible()
      expect(getComputedStyle(body()).flexDirection).toBe("row")
      expect(precedes(content(), assistant())).toBe(true)
    })
  },
  parameters: {
    docs: { source: { code: usageCode("left"), language: "tsx" } },
    zephyr: { testCaseId: "SW-T5497" },
  },
}
export const DockedRight: Story = {
  render: () => <Demo defaultDock="right" />,
  parameters: {
    docs: { source: { code: usageCode("right"), language: "tsx" } },
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5498" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Assistant panel is differentiated from content by an accent header cap (SW-2592)", async () => {
      const cap = canvasElement.querySelector(
        '[data-slot="assistant-layout-assistant-header"]',
      ) as HTMLElement
      const content = canvasElement.querySelector(
        '[data-slot="assistant-layout-content"]',
      ) as HTMLElement
      expect(cap).not.toBeNull()
      // The cap is tinted (bg-accent); the content card has no such band.
      expect(getComputedStyle(cap).backgroundColor).not.toBe(getComputedStyle(content).backgroundColor)
    })

    await step("The cap's close button hides the assistant panel", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Hide assistant" }))
      await waitFor(() =>
        expect(canvasElement.querySelector('[data-slot="assistant-layout-assistant"]')).toBeNull(),
      )
    })
  },
}
export const DockedBottom: Story = {
  render: () => <Demo defaultDock="bottom" />,
  parameters: {
    docs: { source: { code: usageCode("bottom"), language: "tsx" } },
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5499" },
  },
}

export const ResizeByKeyboard: Story = {
  parameters: {
    docs: { source: { code: usageCode("right"), language: "tsx" } },
    zephyr: { testCaseId: "SW-T5500" },
  },
  render: () => <Demo defaultDock="right" />,
  play: async ({ canvasElement, step }) => {
    const separator = () => canvasElement.querySelector('[role="separator"]') as HTMLElement
    const assistant = () =>
      canvasElement.querySelector('[data-slot="assistant-layout-assistant"]') as HTMLElement

    await step("Resize handle is present and keyboard-focusable", async () => {
      expect(separator()).not.toBeNull()
      expect(assistant()).toBeVisible()
    })

    await step("Arrow keys resize the panels via the Resizable handle", async () => {
      const widthBefore = assistant().getBoundingClientRect().width
      separator().focus()
      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}")
      await waitFor(() =>
        expect(assistant().getBoundingClientRect().width).not.toBe(widthBefore)
      )
    })
  },
}
