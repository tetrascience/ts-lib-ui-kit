"use client"

import { PanelBottom, PanelLeft, PanelRight } from "lucide-react"
import * as React from "react"

import {
  clampAssistantSize,
  dockLayout,
  nextAssistantSize,
  type AssistantDock,
} from "./dockLayout"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Context + provider
// ---------------------------------------------------------------------------

interface AssistantLayoutContextValue {
  /** Where the assistant docks. Persisted. */
  dock: AssistantDock
  setDock: (dock: AssistantDock) => void
  /** Assistant size along the dock axis, in px (width for left/right, height for bottom). Persisted. */
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
  /** Default assistant size (px) when nothing is persisted. */
  defaultSize?: number
  /** Whether the assistant starts visible. */
  defaultVisible?: boolean
  /** Persist dock + size to localStorage. Defaults to `true`. */
  persist?: boolean
}

/** A persisted size is capped to this fraction of the viewport on read. */
const PERSISTED_SIZE_VIEWPORT_CAP = 0.85

function readDock(key: string, fallback: AssistantDock): AssistantDock {
  if (typeof window === "undefined") return fallback
  const v = window.localStorage.getItem(`${key}.dock`)
  return v === "right" || v === "bottom" || v === "left" ? v : fallback
}

function readSize(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback
  const v = Number(window.localStorage.getItem(`${key}.size`))
  if (!Number.isFinite(v) || v <= 0) return fallback
  // Clamp a stale persisted size to the current viewport so a value saved on a
  // larger screen can't crowd out the content panel on a smaller one.
  const cap = Math.min(window.innerWidth, window.innerHeight) * PERSISTED_SIZE_VIEWPORT_CAP
  return Math.min(v, cap)
}

export function AssistantLayoutProvider({
  children,
  storageKey = "ts-ui.assistant",
  defaultDock = "left",
  defaultSize = 420,
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
              className="rounded-none"
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
// Splitter
// ---------------------------------------------------------------------------

interface AssistantSplitterProps {
  dock: AssistantDock
  size: number
  onResize: (size: number) => void
  min: number
  maxRatio: number
  order: number
}

/**
 * Resize handle. Operable by mouse, touch, and pen (Pointer Events, with
 * pointer capture so a drag that ends off the handle — or unmounts mid-drag —
 * cleans up automatically) and by keyboard (arrow keys; Shift = larger step,
 * Home = collapse to min). Exposes `separator` semantics with `aria-valuenow`.
 */
function AssistantSplitter({ dock, size, onResize, min, maxRatio, order }: AssistantSplitterProps) {
  const horizontal = dock === "bottom" // bar is horizontal, resizes vertically
  const getMax = React.useCallback(
    () => (typeof window === "undefined" ? Infinity : (horizontal ? window.innerHeight : window.innerWidth) * maxRatio),
    [horizontal, maxRatio]
  )

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      const startPos = horizontal ? e.clientY : e.clientX
      const startSize = size
      const max = getMax()
      document.body.style.userSelect = "none"

      const onMove = (ev: PointerEvent) => {
        const cur = horizontal ? ev.clientY : ev.clientX
        onResize(clampAssistantSize(nextAssistantSize(dock, startSize, cur - startPos), min, max))
      }
      const onUp = (ev: PointerEvent) => {
        el.releasePointerCapture?.(ev.pointerId)
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerup", onUp)
        el.removeEventListener("pointercancel", onUp)
        document.body.style.userSelect = ""
      }
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerup", onUp)
      el.addEventListener("pointercancel", onUp)
    },
    [dock, horizontal, size, onResize, min, getMax]
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 48 : 16
      const growKey = horizontal ? "ArrowDown" : "ArrowRight"
      const shrinkKey = horizontal ? "ArrowUp" : "ArrowLeft"
      let delta: number | null = null
      if (e.key === growKey) delta = step
      else if (e.key === shrinkKey) delta = -step
      else if (e.key === "Home") {
        e.preventDefault()
        onResize(min)
        return
      }
      if (delta === null) return
      e.preventDefault()
      onResize(clampAssistantSize(nextAssistantSize(dock, size, delta), min, getMax()))
    },
    [dock, horizontal, size, onResize, min, getMax]
  )

  const max = getMax()
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      aria-label="Resize AI Assistant panel"
      aria-valuenow={Math.round(size)}
      aria-valuemin={min}
      aria-valuemax={Number.isFinite(max) ? Math.round(max) : undefined}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        "relative z-[1] shrink-0 touch-none self-stretch bg-transparent transition-colors hover:bg-border focus-visible:bg-ring focus-visible:outline-none",
        horizontal ? "h-2 cursor-row-resize" : "w-2 cursor-col-resize"
      )}
      style={{ order }}
    />
  )
}

// ---------------------------------------------------------------------------
// Layout body
// ---------------------------------------------------------------------------

export interface AssistantLayoutProps {
  /** The AI Assistant panel content (e.g. a `<Chat />`). */
  assistant: React.ReactNode
  /** The main content; fills the remaining space (and the whole body when the assistant is hidden). */
  children: React.ReactNode
  /** Min assistant size (px). */
  minSize?: number
  /** Max assistant size as a ratio of the viewport along the dock axis. */
  maxSizeRatio?: number
  className?: string
  assistantClassName?: string
  contentClassName?: string
}

/**
 * Flex body that docks the assistant left / right / bottom of the main content
 * and resizes it with an accessible splitter (mouse, touch, and keyboard).
 * Must be rendered inside an `AssistantLayoutProvider`; pair with
 * `AssistantDockControls` in a top bar.
 *
 * Implementation note: docking is a CSS `order` + `flex-direction` change on a
 * single flex container — the panels never re-mount, so the assistant's state
 * survives a redock *and* a hide (it stays mounted, hidden via `display:none`).
 * That cross-direction, no-remount behavior is why this uses an order-based
 * layout rather than `react-resizable-panels` (whose group/direction model
 * would re-mount panels when switching between a horizontal and vertical dock).
 */
export function AssistantLayout({
  assistant,
  children,
  minSize = 240,
  maxSizeRatio = 0.7,
  className,
  assistantClassName,
  contentClassName,
}: AssistantLayoutProps) {
  const { dock, size, setSize, visible } = useAssistantLayout()
  const layout = dockLayout(dock)

  return (
    <div
      data-slot="assistant-layout"
      className={cn("flex min-h-0 flex-1 overflow-hidden", className)}
      style={{ flexDirection: layout.flexDirection }}
    >
      {/* The assistant stays mounted when hidden (display:none) so its state —
          conversation, scroll, drafts — survives a hide/show toggle. */}
      <div
        data-slot="assistant-layout-assistant"
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card",
          !visible && "hidden",
          assistantClassName
        )}
        style={{ order: layout.assistantOrder, flex: `0 0 ${size}px` }}
      >
        {assistant}
      </div>

      {visible && (
        <AssistantSplitter
          dock={dock}
          size={size}
          onResize={setSize}
          min={minSize}
          maxRatio={maxSizeRatio}
          order={layout.splitterOrder}
        />
      )}

      <div
        data-slot="assistant-layout-content"
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card",
          contentClassName
        )}
        style={{ order: layout.contentOrder, flex: "1 1 0" }}
      >
        {children}
      </div>
    </div>
  )
}
