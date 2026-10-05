import { expect, within } from "storybook/test"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps, ReactNode } from "react"

/** Args for the demos: the panel-group props plus the handle's `withHandle`. */
type DemoArgs = ComponentProps<typeof ResizablePanelGroup> & {
  withHandle?: boolean
}

const meta: Meta<DemoArgs> = {
  title: "Components/Layout & Structure/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "Axis the panels are laid out and resized along.",
    },
    withHandle: {
      control: { type: "boolean" },
      description:
        "Show the drag grip on the ResizableHandle. Omit (or set `false`) to render the handle without a grip.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    orientation: "horizontal",
    withHandle: true,
  },
}

export default meta

type Story = StoryObj<DemoArgs>

/* ---- shared panel content (mirrors the SW-2120 prototype) ---- */

function PanelShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  // padded wrapper so each section reads as its own card, with the panel-group
  // background showing through the gap between them
  return (
    <div className="h-full p-2">
      <div className="flex h-full flex-col gap-3 overflow-auto rounded-lg border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{value}</div>
    </div>
  )
}

function SummaryPanel() {
  return (
    <PanelShell title="Summary" subtitle="Lead developability">
      <div className="grid gap-2.5">
        <Stat label="Candidates" value="128" />
        <Stat label="Pass thermostability" value="41" />
        <Stat label="Flagged aggregation" value="12" />
      </div>
    </PanelShell>
  )
}

function LeadsPanel({
  subtitle,
  leads,
}: {
  subtitle: string
  leads: [string, string][]
}) {
  return (
    <PanelShell title="Detail" subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-2.5">
        {leads.map(([name, score]) => (
          <Stat key={name} label={name} value={score} />
        ))}
      </div>
    </PanelShell>
  )
}

function AssistantPanel() {
  return (
    <PanelShell title="AI Assistant">
      <div className="flex flex-col gap-2">
        <div className="max-w-[85%] self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          Which leads have the best developability?
        </div>
        <div className="max-w-[85%] self-start rounded-lg bg-muted px-3 py-2 text-sm">
          Leads 3, 7 and 12 score highest on aggregation and thermostability.
          Want me to filter the table to those?
        </div>
      </div>
    </PanelShell>
  )
}

/* ---- horizontal split: Summary | Detail ---- */

export const Horizontal: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T1276" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize="62%">
          <LeadsPanel
            subtitle="Selected leads"
            leads={[
              ["Lead 3", "0.91"],
              ["Lead 7", "0.88"],
              ["Lead 12", "0.86"],
              ["Lead 18", "0.84"],
              ["Lead 24", "0.81"],
              ["Lead 29", "0.79"],
            ]}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const handle = canvasElement.querySelector<HTMLElement>(
      '[data-slot="resizable-handle"]'
    )
    if (!handle) throw new Error("resize handle not found")

    await step("Panel content renders", async () => {
      expect(canvas.getByText("Summary")).toBeInTheDocument()
      expect(canvas.getByText("Selected leads")).toBeInTheDocument()
    })

    await step("Visible divider is 1px; with a grip the handle widens to contain it", async () => {
      const box = handle.getBoundingClientRect()
      const cs = getComputedStyle(handle)
      const divider = box.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      expect(Math.round(divider)).toBe(1)
      const grip = handle.querySelector("div")
      if (grip) {
        expect(cs.backgroundClip).toBe("content-box")
        const g = grip.getBoundingClientRect()
        expect(g.left).toBeGreaterThanOrEqual(box.left - 0.01)
        expect(g.right).toBeLessThanOrEqual(box.right + 0.01)
      }
    })

    await step("Panels clip instead of scrolling, with a 4px clip margin (SW-2648)", async () => {
      for (const panel of canvasElement.querySelectorAll("[data-panel]")) {
        const cs = getComputedStyle(panel.firstElementChild as HTMLElement)
        expect(cs.overflow).toBe("clip")
        expect(cs.overflowClipMargin).toBe("4px")
      }
    })

    await step("Divider is hidden until interaction", async () => {
      expect(getComputedStyle(handle).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    })

    await step("Grab area is a wide overlay that takes no layout", async () => {
      expect(getComputedStyle(handle, "::after").width).toBe("12px")
    })
  },
}

/* ---- vertical split: Detail / AI Assistant ---- */

export const VerticalWithHandle: Story = {
  args: {
    orientation: "vertical",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1277" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[520px] w-[480px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="55%" minSize="20%" maxSize="80%">
          <LeadsPanel
            subtitle="Main content area"
            leads={[
              ["Lead 1", "0.92"],
              ["Lead 2", "0.90"],
              ["Lead 3", "0.88"],
              ["Lead 4", "0.85"],
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize="45%">
          <AssistantPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Panel content renders", async () => {
      expect(canvas.getByText("AI Assistant")).toBeInTheDocument()
      expect(canvas.getByText("Main content area")).toBeInTheDocument()
    })

    await step("Resize handle is present", async () => {
      expect(canvas.getByRole("separator")).toBeInTheDocument()
    })
  },
}

/* ---- option: no grip (withHandle omitted) ---- */

export const WithoutGrip: Story = {
  args: {
    withHandle: false,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5440" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize="62%">
          <LeadsPanel
            subtitle="Selected leads"
            leads={[
              ["Lead 3", "0.91"],
              ["Lead 7", "0.88"],
              ["Lead 12", "0.86"],
              ["Lead 18", "0.84"],
            ]}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const handle = canvasElement.querySelector<HTMLElement>(
      '[data-slot="resizable-handle"]'
    )
    if (!handle) throw new Error("resize handle not found")

    await step("Handle has no grip child", async () => {
      expect(handle.querySelector("div")).toBeNull()
    })

    await step("Grab area is still a wide overlay", async () => {
      expect(getComputedStyle(handle, "::after").width).toBe("12px")
    })
  },
}

/* ---- option: always-visible divider (className override) ---- */

export const AlwaysVisibleDivider: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5441" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle
          withHandle={withHandle}
          className="bg-border [&>div]:bg-border"
        />
        <ResizablePanel defaultSize="62%">
          <LeadsPanel
            subtitle="Selected leads"
            leads={[
              ["Lead 3", "0.91"],
              ["Lead 7", "0.88"],
              ["Lead 12", "0.86"],
              ["Lead 18", "0.84"],
            ]}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const handle = canvasElement.querySelector<HTMLElement>(
      '[data-slot="resizable-handle"]'
    )
    if (!handle) throw new Error("resize handle not found")

    await step("Divider is visible at rest", async () => {
      expect(getComputedStyle(handle).backgroundColor).not.toBe(
        "rgba(0, 0, 0, 0)"
      )
    })
  },
}

/* ---- SW-2648: Cards fill the panels — no seam scrollbar, ring intact ---- */

function CardPanel({ title, rows }: { title: string; rows: number }) {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {/* the card scrolls its own content, so no scrollbar lands on the seam */}
      <CardContent
        className="min-h-0 flex-1 overflow-auto"
        tabIndex={0}
        aria-label={`${title} rows`}
      >
        <ul className="grid gap-1.5">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="rounded-md bg-muted/60 px-2 py-1.5">
              Row {i + 1}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export const CardsInPanels: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5721" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[320px] w-[760px] rounded-xl border bg-muted/40 p-3">
      {/* p-px: the group clips at its own edge, so give the cards' ring 1px */}
      <ResizablePanelGroup {...args} className="p-px">
        <ResizablePanel defaultSize="40%" minSize="20%">
          <CardPanel title="Summary" rows={3} />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize="60%">
          <CardPanel title="Detail" rows={20} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const group = canvasElement.querySelector<HTMLElement>("[data-group]")
    if (!group) throw new Error("panel group not found")
    const cards = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="card"]')]

    await step("The panel's clip margin leaves room for each card's ring", async () => {
      for (const card of cards) {
        const content = card.closest("[data-panel]")?.firstElementChild as HTMLElement
        expect(getComputedStyle(content).overflow).toBe("clip")
        expect(parseFloat(getComputedStyle(content).overflowClipMargin)).toBeGreaterThanOrEqual(1)
        expect(group.contains(card)).toBe(true)
      }
    })

    await step("Overflowing content scrolls inside the card, not the panel", async () => {
      const content = cards[1].querySelector<HTMLElement>('[data-slot="card-content"]')
      if (!content) throw new Error("card content not found")
      expect(content.scrollHeight).toBeGreaterThan(content.clientHeight)
    })
  },
}

/* ---- SW-2648: opt back in to a scrolling panel ---- */

export const ScrollablePanel: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5722" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[320px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="40%" minSize="20%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        {/* `scrollable` — the panel itself scrolls this unwrapped list */}
        <ResizablePanel defaultSize="60%" scrollable>
          <ul className="grid gap-1.5 p-3 text-sm">
            {Array.from({ length: 30 }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full rounded-md bg-card px-2 py-1.5 text-left"
                >
                  Row {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const [plain, scrolling] = [...canvasElement.querySelectorAll("[data-panel]")].map(
      (panel) => panel.firstElementChild as HTMLElement
    )

    await step("Only the `scrollable` panel is a scroll container", async () => {
      expect(getComputedStyle(plain).overflow).toBe("clip")
      expect(getComputedStyle(scrolling).overflow).toBe("auto")
      expect(scrolling.scrollHeight).toBeGreaterThan(scrolling.clientHeight)
    })
  },
}

/* ---- SW-2648: a collapsed panel puts the handle on the group's edge ---- */

export const CollapsedPanel: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5723" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[320px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="100%" minSize="30%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        {/* starts collapsed, so the handle sits on the group's right edge */}
        <ResizablePanel collapsible collapsedSize="0%" defaultSize="0%" minSize="25%">
          <div className="h-full bg-card p-4 text-sm">Details</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const group = canvasElement.querySelector<HTMLElement>("[data-group]")
    const handle = canvasElement.querySelector<HTMLElement>('[data-slot="resizable-handle"]')
    if (!group || !handle) throw new Error("group or handle not found")

    await step("The grip stays inside the group, so it isn't clipped", async () => {
      const grip = handle.querySelector("div")
      if (!grip) return
      const g = grip.getBoundingClientRect()
      const box = group.getBoundingClientRect()
      expect(g.left).toBeGreaterThanOrEqual(box.left - 0.01)
      expect(g.right).toBeLessThanOrEqual(box.right + 0.01)
    })
  },
}

/* ---- SW-2648: a collapsed panel on the leading edge doesn't bleed ---- */

export const CollapsedLeadingPanel: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  render: ({ withHandle, ...args }) => (
    <div className="h-[320px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        {/* collapsed sidebar first: its overflow points into the group */}
        <ResizablePanel collapsible collapsedSize="0%" defaultSize="0%" minSize="25%">
          <div className="h-full bg-card p-4 text-sm">Sidebar</div>
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} />
        <ResizablePanel defaultSize="100%" minSize="30%">
          <SummaryPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const [collapsed, main] = [...canvasElement.querySelectorAll("[data-panel]")].map(
      (panel) => getComputedStyle(panel.firstElementChild as HTMLElement)
    )

    await step("A collapsible panel clips at its edge, so nothing paints across the seam", async () => {
      expect(collapsed.overflow).toBe("clip")
      expect(collapsed.overflowClipMargin).toBe("0px")
    })

    await step("Non-collapsible panels keep the 4px margin for rings", async () => {
      expect(main.overflowClipMargin).toBe("4px")
    })
  },
}
