"use client";

import { PanelBottom, PanelLeft, PanelRight, X } from "lucide-react";
import * as React from "react";

import { dockPanels, type AssistantDock } from "./dockLayout";

import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Context + provider
// ---------------------------------------------------------------------------

interface AssistantLayoutContextValue {
  /** Where the assistant docks. Persisted. */
  dock: AssistantDock;
  setDock: (dock: AssistantDock) => void;
  /** Assistant size as a percentage of the layout along the dock axis. Persisted. */
  size: number;
  setSize: (size: number) => void;
  /** Whether the assistant is shown. Persisted. */
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const AssistantLayoutContext = React.createContext<AssistantLayoutContextValue | null>(null);

export interface AssistantLayoutProviderProps {
  children: React.ReactNode;
  /** localStorage key prefix for the persisted dock, size and visibility. */
  storageKey?: string;
  /** Default dock when nothing is persisted. */
  defaultDock?: AssistantDock;
  /** Default assistant size as a percentage (1–99) of the layout. */
  defaultSize?: number;
  /** Whether the assistant starts visible when nothing is persisted. */
  defaultVisible?: boolean;
  /** Persist dock, size and visibility to localStorage. Defaults to `true`. */
  persist?: boolean;
}

// Storage can be blocked (privacy mode, sandboxed iframe) or full. A failed
// read falls back to the default; a failed write leaves the state in memory.
function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not persisted; the in-memory state still applies for this session.
  }
}

function readDock(key: string, fallback: AssistantDock): AssistantDock {
  const v = readStored(`${key}.dock`);
  return v === "right" || v === "bottom" || v === "left" ? v : fallback;
}

function readSize(key: string, fallback: number): number {
  const v = Number(readStored(`${key}.size`));
  // Persisted as a percentage; ignore anything outside the open (0, 100) range.
  if (!Number.isFinite(v) || v <= 0 || v >= 100) return fallback;
  return v;
}

function readVisible(key: string, fallback: boolean): boolean {
  const v = readStored(`${key}.visible`);
  return v === "true" || v === "false" ? v === "true" : fallback;
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
    persist ? readDock(storageKey, defaultDock) : defaultDock,
  );
  const [size, setSizeState] = React.useState<number>(() =>
    persist ? readSize(storageKey, defaultSize) : defaultSize,
  );
  const [visible, setVisibleState] = React.useState<boolean>(() =>
    persist ? readVisible(storageKey, defaultVisible) : defaultVisible,
  );

  const setDock = React.useCallback(
    (next: AssistantDock) => {
      setDockState(next);
      if (persist) writeStored(`${storageKey}.dock`, next);
    },
    [storageKey, persist],
  );

  const setSize = React.useCallback(
    (next: number) => {
      setSizeState(next);
      if (persist) writeStored(`${storageKey}.size`, String(Math.round(next)));
    },
    [storageKey, persist],
  );

  const setVisible = React.useCallback(
    (next: boolean) => {
      setVisibleState(next);
      if (persist) writeStored(`${storageKey}.visible`, String(next));
    },
    [storageKey, persist],
  );

  const value = React.useMemo(
    () => ({ dock, setDock, size, setSize, visible, setVisible }),
    [dock, setDock, size, setSize, visible, setVisible],
  );

  return <AssistantLayoutContext.Provider value={value}>{children}</AssistantLayoutContext.Provider>;
}

export function useAssistantLayout(): AssistantLayoutContextValue {
  const ctx = React.useContext(AssistantLayoutContext);
  if (!ctx) throw new Error("useAssistantLayout must be used within an AssistantLayoutProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Dock controls (segmented icon control for a top bar)
// ---------------------------------------------------------------------------

const DOCK_OPTIONS: { value: AssistantDock; label: string; Icon: typeof PanelLeft }[] = [
  { value: "left", label: "Dock assistant left", Icon: PanelLeft },
  { value: "bottom", label: "Dock assistant bottom", Icon: PanelBottom },
  { value: "right", label: "Dock assistant right", Icon: PanelRight },
];

export interface AssistantDockControlsProps {
  /** Label shown before the icons. Pass `null` to hide it. */
  label?: React.ReactNode;
  className?: string;
}

/**
 * Segmented control of dock icons. Clicking an inactive icon docks + shows the
 * assistant there; clicking the active icon again hides it.
 */
export function AssistantDockControls({ label = "AI Assistant", className }: AssistantDockControlsProps) {
  const { dock, setDock, visible, setVisible } = useAssistantLayout();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label != null && <span className="text-sm font-medium">{label}</span>}
      <div className="inline-flex overflow-hidden rounded-lg border border-border">
        {DOCK_OPTIONS.map(({ value, label: optionLabel, Icon }) => {
          const active = visible && dock === value;
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
                if (active) setVisible(false);
                else {
                  setDock(value);
                  setVisible(true);
                }
              }}
            >
              <Icon className="size-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout body
// ---------------------------------------------------------------------------

// Each panel is padded so the resize handle sits in a comfortable gutter between
// the cards rather than a hairline seam (SW-2096). The padding lives inside the
// panel box, so react-resizable-panels' flex sizing is unaffected.
const PANEL_PAD = "flex min-h-0 min-w-0 p-2";
// The visible card surface rendered inside each panel.
const CARD_CLASS =
  "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card";

const ASSISTANT_PANEL_ID = "assistant";

export interface AssistantLayoutProps {
  /**
   * The AI Assistant panel content (e.g. a `<Chat />`). Pass `null` while no
   * assistant is available: the layout then shows the content alone, as when
   * hidden, without touching the persisted `visible` — so the pane comes back
   * the way it was left once an assistant is passed again.
   */
  assistant: React.ReactNode;
  /** The main content; fills the remaining space (and the whole body when the assistant is hidden). */
  children: React.ReactNode;
  /**
   * Title for the assistant panel's header cap (SW-2592). When set, the panel
   * renders a tinted (`bg-accent`) header band above `assistant` — the thing
   * that makes the assistant panel read as distinct from the content panel
   * (both are otherwise the same `bg-card` card). Omit to keep the panel a plain
   * card whose chrome you supply inside `assistant` (backward compatible).
   */
  assistantTitle?: React.ReactNode;
  /** Optional element before the title in the header cap (e.g. an icon). */
  assistantIcon?: React.ReactNode;
  /** Extra elements in the header cap, before the close button. */
  assistantHeaderActions?: React.ReactNode;
  /** Render a close button in the header cap that hides the panel. Defaults to `true` when `assistantTitle` is set. */
  showAssistantClose?: boolean;
  /** Min assistant size as a percentage of the layout. */
  minSize?: number;
  /** Max assistant size as a percentage of the layout. */
  maxSize?: number;
  className?: string;
  assistantClassName?: string;
  contentClassName?: string;
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
 *
 * Dock, size and visibility persist through the provider. With `assistant`
 * null the content fills the body regardless of `visible`.
 */
export function AssistantLayout({
  assistant,
  children,
  assistantTitle,
  assistantIcon,
  assistantHeaderActions,
  showAssistantClose,
  minSize = 20,
  maxSize = 70,
  className,
  assistantClassName,
  contentClassName,
}: AssistantLayoutProps) {
  const { dock, size, setSize, visible, setVisible } = useAssistantLayout();
  const { orientation, assistantFirst } = dockPanels(dock);

  // Hidden, or nothing to show: no resizable group, content fills the whole body.
  // A missing assistant (anything React renders as nothing) leaves `visible`
  // alone so the pane is restored, not re-opened, once one is available again.
  const hasAssistant = assistant != null && typeof assistant !== "boolean" && assistant !== "";
  if (!visible || !hasAssistant) {
    return (
      <div data-slot="assistant-layout" className={cn("flex min-h-0 flex-1 overflow-hidden", className)}>
        {/* flex-1 so the lone content panel fills the width (the ResizablePanel
            self-sizes when visible; this plain div needs to be told to grow).
            Padded to match the inset the visible panels carry. */}
        <div className={cn(PANEL_PAD, "flex-1")}>
          <div data-slot="assistant-layout-content" className={cn(CARD_CLASS, contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Accent header cap — the assistant panel's brand band. Only rendered when a
  // title is provided; content panel never gets one, so the two panels read as
  // distinct even though both are `bg-card` (SW-2592).
  const showClose = showAssistantClose ?? assistantTitle != null;
  const assistantHeader = assistantTitle != null && (
    <div
      data-slot="assistant-layout-assistant-header"
      className="flex shrink-0 items-center gap-2 border-b border-primary/15 bg-accent px-3 py-2"
    >
      {assistantIcon != null && <span className="flex shrink-0 items-center justify-center">{assistantIcon}</span>}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{assistantTitle}</span>
      {assistantHeaderActions}
      {showClose && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Hide assistant"
          onClick={() => setVisible(false)}
        >
          <X />
        </Button>
      )}
    </div>
  );

  const assistantPanel = (
    <ResizablePanel
      id={ASSISTANT_PANEL_ID}
      defaultSize={`${size}%`}
      minSize={`${minSize}%`}
      maxSize={`${maxSize}%`}
      className={PANEL_PAD}
    >
      <div data-slot="assistant-layout-assistant" className={cn(CARD_CLASS, assistantClassName)}>
        {assistantHeader}
        {assistant}
      </div>
    </ResizablePanel>
  );

  const contentPanel = (
    <ResizablePanel id="content" className={PANEL_PAD}>
      <div data-slot="assistant-layout-content" className={cn(CARD_CLASS, contentClassName)}>
        {children}
      </div>
    </ResizablePanel>
  );

  return (
    <ResizablePanelGroup
      key={dock}
      orientation={orientation}
      data-slot="assistant-layout"
      className={cn("min-h-0 flex-1 overflow-hidden", className)}
      onLayoutChanged={(layout) => {
        const pct = layout[ASSISTANT_PANEL_ID];
        if (typeof pct === "number") setSize(pct);
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
  );
}
