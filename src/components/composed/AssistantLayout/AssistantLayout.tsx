"use client"

import { PanelBottom, PanelLeft, PanelRight } from "lucide-react"
import * as React from "react"

import { dockPanels, type AssistantDock } from "./dockLayout"

import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Context + provider
// ---------------------------------------------------------------------------

interface AssistantLayoutContextValue {
  /** Where the assistant docks. Persisted. */
  dock: AssistantDock
  setDock: (dock: AssistantDock) => void
  /** Assistant size as a percentage of the layout along the dock axis. Persisted. */
  size: number
  setSize: (size: number) => void
  /** Whether the assistant is shown. In-memory by default (resets to visible on reload). */
  visible: boolean
  setVisible: (visible: boolean) => void
}

const AssistantLayoutContext = React.createContext<AssistantLayoutContextValue | null>(null)

export interface AssistantLayoutProviderProps {
  children: React.ReactNode
  /** localStorage key prefix for the persisted dock + size. */
  storageKey?: string
  /** Default dock when nothing is persisted. */
  defaultDock?: AssistantDock
  /** Default assistant size as a percentage (1–99) of the layout. */
  defaultSize?: number
  /** Whether the assistant starts visible. */
  defaultVisible?: boolean
  /** Persist dock + size to localStorage. Defaults to `true`. */
  persist?: boolean
}

function readDock(key: string, fallback: AssistantDock): AssistantDock {
  if (typeof window === "undefined") return fallback
  const v = window.localStorage.getItem(`${key}.dock`)
  return v === "right" || v === "bottom" || v === "left" ? v : fallback
}

function readSize(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback
  const v = Number(window.localStorage.getItem(`${key}.size`))
  // Persisted as a percentage; ignore anything outside the open (0, 100) range.
  if (!Number.isFinite(v) || v <= 0 || v >= 100) return fallback
  return v
}

export function AssistantLayoutProvider({
  children,
  storageKey = "ts-ui.assistant",
  defaultDock = "left",
  defaultSize = 32,
  defaultVisible = true,
  persist = true,
}: AssistantLayoutProviderProps) {
  const [dock, setDockState] = React.useState<AssistantDock>(() =>
    persist ? readDock(storageKey, defaultDock) : defaultDock
  )
  const [size, setSizeState] = React.useState<number>(() =>
    persist ? readSize(storageKey, defaultSize) : defaultSize
  )
  const [visible, setVisible] = React.useState(defaultVisible)

  const setDock = React.useCallback(
    (next: AssistantDock) => {
      setDockState(next)
      if (persist && typeof window !== "undefined")
        window.localStorage.setItem(`${storageKey}.dock`, next)
    },
    [storageKey, persist]
  )

  const setSize = React.useCallback(
    (next: number) => {
      setSizeState(next)
      if (persist && typeof window !== "undefined")
        window.localStorage.setItem(`${storageKey}.size`, String(Math.round(next)))
    },
    [storageKey, persist]
  )

  const value = React.useMemo(
    () => ({ dock, setDock, size, setSize, visible, setVisible }),
    [dock, setDock, size, setSize, visible]
  )

  return <AssistantLayoutContext.Provider value={value}>{children}</AssistantLayoutContext.Provider>
}

export function useAssistantLayout(): AssistantLayoutContextValue {
  const ctx = React.useContext(AssistantLayoutContext)
  if (!ctx) throw new Error("useAssistantLayout must be used within an AssistantLayoutProvider")
  return ctx
}

// ---------------------------------------------------------------------------
// Dock controls (segmented icon control for a top bar)
// ---------------------------------------------------------------------------

const DOCK_OPTIONS: { value: AssistantDock; label: string; Icon: typeof PanelLeft }[] = [
  { value: "left", label: "Dock assistant left", Icon: PanelLeft },
  { value: "bottom", label: "Dock assistant bottom", Icon: PanelBottom },
  { value: "right", label: "Dock assistant right", Icon: PanelRight },
]

export interface AssistantDockControlsProps {
  /** Label shown before the icons. Pass `null` to hide it. */
  label?: React.ReactNode
  className?: string
}

/**
 * Segmented control of dock icons. Clicking an inactive icon docks + shows the
 * assistant there; clicking the active icon again hides it.
 */
export function AssistantDockControls({ label = "AI Assistant", className }: AssistantDockControlsProps) {
  const { dock, setDock, visible, setVisible } = useAssistantLayout()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label != null && <span className="text-sm font-medium">{label}</span>}
      <div className="inline-flex overflow-hidden rounded-lg border border-border">
        {DOCK_OPTIONS.map(({ value, label: optionLabel, Icon }) => {
          const active = visible && dock === value
          return (
            <Button
              key={value}
              variant={active ? "secondary" : "ghost"}
              size="icon-sm"
              // bg-clip-border so the filled (active/hover) state reaches the
              // cell edge instead of leaving a 1px gap from the button's
              // transparent border + default bg-clip-padding.
              className="rounded-none bg-clip-border"
              aria-label={active ? "Hide AI Assistant" : optionLabel}
              aria-pressed={active}
              title={active ? "Hide AI Assistant" : optionLabel}
              onClick={() => {
                if (active) setVisible(false)
                else {
                  setDock(value)
                  setVisible(true)
                }
              }}
            >
              <Icon className="size-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout body
// ---------------------------------------------------------------------------

// Each panel is padded so the resize handle sits in a comfortable gutter between
// the cards rather than a hairline seam (SW-2096). The padding lives inside the
// panel box, so react-resizable-panels' flex sizing is unaffected.
const PANEL_PAD = "flex min-h-0 min-w-0 p-2"
// The visible card surface rendered inside each panel.
const CARD_CLASS =
  "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card"

const ASSISTANT_PANEL_ID = "assistant"

export interface AssistantLayoutProps {
  /** The AI Assistant panel content (e.g. a `<Chat />`). */
  assistant: React.ReactNode
  /** The main content; fills the remaining space (and the whole body when the assistant is hidden). */
  children: React.ReactNode
  /** Min assistant size as a percentage of the layout. */
  minSize?: number
  /** Max assistant size as a percentage of the layout. */
  maxSize?: number
  className?: string
  assistantClassName?: string
  contentClassName?: string
}

/**
 * Docks the assistant left / right / bottom of the main content and resizes it
 * with the design-system `Resizable` (react-resizable-panels). Must be rendered
 * inside an `AssistantLayoutProvider`; pair with `AssistantDockControls`.
 *
 * The group is keyed by `dock`, so changing dock remounts the panels. The
 * assistant panel is therefore re-created on redock (its transient state is not
 * preserved across a dock change) — a deliberate trade-off for using the shared
 * resizable primitive rather than a bespoke splitter.
 */
export function AssistantLayout({
  assistant,
  children,
  minSize = 20,
  maxSize = 70,
  className,
  assistantClassName,
  contentClassName,
}: AssistantLayoutProps) {
  const { dock, size, setSize, visible } = useAssistantLayout()
  const { orientation, assistantFirst } = dockPanels(dock)

  // Hidden: no resizable group, content fills the whole body.
  if (!visible) {
    return (
      <div
        data-slot="assistant-layout"
        className={cn("flex min-h-0 flex-1 overflow-hidden", className)}
      >
        {/* flex-1 so the lone content panel fills the width (the ResizablePanel
            self-sizes when visible; this plain div needs to be told to grow).
            Padded to match the inset the visible panels carry. */}
        <div className={cn(PANEL_PAD, "flex-1")}>
          <div data-slot="assistant-layout-content" className={cn(CARD_CLASS, contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  const assistantPanel = (
    <ResizablePanel
      id={ASSISTANT_PANEL_ID}
      defaultSize={`${size}%`}
      minSize={`${minSize}%`}
      maxSize={`${maxSize}%`}
      className={PANEL_PAD}
    >
      <div data-slot="assistant-layout-assistant" className={cn(CARD_CLASS, assistantClassName)}>
        {assistant}
      </div>
    </ResizablePanel>
  )

  const contentPanel = (
    <ResizablePanel id="content" className={PANEL_PAD}>
      <div data-slot="assistant-layout-content" className={cn(CARD_CLASS, contentClassName)}>
        {children}
      </div>
    </ResizablePanel>
  )

  return (
    <ResizablePanelGroup
      key={dock}
      orientation={orientation}
      data-slot="assistant-layout"
      className={cn("min-h-0 flex-1 overflow-hidden", className)}
      onLayoutChanged={(layout) => {
        const pct = layout[ASSISTANT_PANEL_ID]
        if (typeof pct === "number") setSize(pct)
      }}
    >
      {assistantFirst ? (
        <>
          {assistantPanel}
          <ResizableHandle withHandle />
          {contentPanel}
        </>
      ) : (
        <>
          {contentPanel}
          <ResizableHandle withHandle />
          {assistantPanel}
        </>
      )}
    </ResizablePanelGroup>
  )
}
