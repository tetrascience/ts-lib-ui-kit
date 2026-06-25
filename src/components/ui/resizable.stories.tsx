import { expect, within } from "storybook/test"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
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

type Story = StoryObj<typeof ResizablePanelGroup>

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
      <div className="flex h-full flex-col gap-3 overflow-auto rounded-lg border bg-card p-4 shadow-sm">
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
  render: (args) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
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

    await step("Divider footprint is 1px, on the panel seam", async () => {
      expect(Math.round(handle.getBoundingClientRect().width)).toBe(1)
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
  render: (args) => (
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
        <ResizableHandle withHandle />
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
  parameters: {
    zephyr: { testCaseId: "SW-T5440" },
  },
  render: (args) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle />
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
  render: (args) => (
    <div className="h-[360px] w-[760px] overflow-hidden rounded-xl border bg-muted/40">
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize="38%" minSize="20%" maxSize="80%">
          <SummaryPanel />
        </ResizablePanel>
        <ResizableHandle
          withHandle
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
