"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { PanelRightOpen, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// Width persistence — one localStorage entry per panel `id`
// =============================================================================

const STORAGE_PREFIX = "ts-ui.right-panel";

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}.${id}.width`;
}

function clampWidth(width: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, width));
}

function readWidth(id: string, fallback: number, min: number, max: number): number {
  if (typeof window === "undefined") return fallback;
  const v = Number(window.localStorage.getItem(storageKey(id)));
  if (!Number.isFinite(v) || v <= 0) return fallback;
  return clampWidth(v, min, max);
}

function persistWidth(id: string, width: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(id), String(Math.round(width)));
}

// =============================================================================
// FAB trigger — floats over the content area while the panel is closed
// =============================================================================

const dataAppShellRightPanelTriggerVariants = cva(
  "absolute bottom-4 right-4 z-40 inline-flex items-center justify-center rounded-full border-none bg-primary text-primary-foreground shadow-elevation-4 cursor-pointer transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
  {
    variants: {
      size: {
        default: "size-10 [&_svg:not([class*='size-'])]:size-4",
        lg: "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export interface DataAppShellRightPanelTriggerProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof dataAppShellRightPanelTriggerVariants> {}

/**
 * Floating action button that re-opens a closed `DataAppShellRightPanel`.
 * Rendered automatically by the panel when it is closed; exported for cases
 * where the trigger needs custom placement. Positioned `absolute` — place it
 * inside a `relative` container (normally the shell's content area).
 */
function DataAppShellRightPanelTrigger({
  className,
  size,
  children,
  ...props
}: DataAppShellRightPanelTriggerProps) {
  return (
    <button
      type="button"
      data-slot="data-app-shell-right-panel-trigger"
      className={cn(dataAppShellRightPanelTriggerVariants({ size }), className)}
      {...props}
    >
      {children ?? <PanelRightOpen />}
    </button>
  );
}

// =============================================================================
// DragHandle — pointer + keyboard resize on the panel's left edge
// =============================================================================

/** Pixels per arrow-key press when resizing with the keyboard. */
const KEYBOARD_RESIZE_STEP = 16;

interface DragHandleProps {
  width: number;
  minWidth: number;
  maxWidth: number;
  /** Live width updates while dragging (not yet persisted). */
  onResize: (width: number) => void;
  /** Final width once the interaction ends — persist here. */
  onCommit: (width: number) => void;
  onDraggingChange: (dragging: boolean) => void;
}

/**
 * Vertical resize handle docked on the panel's left edge. Pointer-driven
 * (px-based, unlike the percentage-based `Resizable` group primitive) so the
 * panel keeps an absolute width that can be persisted per `id`. Also a
 * keyboard-operable ARIA separator: arrows resize, Home/End jump to min/max.
 */
function DragHandle({ width, minWidth, maxWidth, onResize, onCommit, onDraggingChange }: DragHandleProps) {
  const dragState = React.useRef<{ startX: number; startWidth: number } | null>(null);
  const widthRef = React.useRef(width);
  widthRef.current = width;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Primary button / touch only
    if (e.button !== 0) return;
    dragState.current = { startX: e.clientX, startWidth: widthRef.current };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer events (play tests) have no active pointer to
      // capture; move/up still arrive via the handle's own listeners.
    }
    onDraggingChange(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    // Handle sits on the left edge — dragging left grows the panel.
    const delta = dragState.current.startX - e.clientX;
    onResize(clampWidth(dragState.current.startWidth + delta, minWidth, maxWidth));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    dragState.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onDraggingChange(false);
    onCommit(widthRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    switch (e.key) {
      case "ArrowLeft": // handle moves left → panel grows
        next = clampWidth(widthRef.current + KEYBOARD_RESIZE_STEP, minWidth, maxWidth);
        break;
      case "ArrowRight":
        next = clampWidth(widthRef.current - KEYBOARD_RESIZE_STEP, minWidth, maxWidth);
        break;
      case "Home":
        next = minWidth;
        break;
      case "End":
        next = maxWidth;
        break;
    }
    if (next == null) return;
    e.preventDefault();
    onResize(next);
    onCommit(next);
  };

  return (
    <div
      data-slot="data-app-shell-right-panel-drag-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      className={cn(
        // 1px seam over the panel's left border; wide invisible grab area via ::after
        "absolute inset-y-0 left-0 z-10 w-px cursor-col-resize touch-none select-none bg-transparent transition-colors",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
        // reveal on hover / drag (border color) and keyboard focus (ring color)
        "hover:bg-border active:bg-border focus-visible:outline-none focus-visible:bg-ring",
        // centered grip dots, revealed with the seam
        "flex items-center justify-center",
        "[&>div]:opacity-0 hover:[&>div]:opacity-100 active:[&>div]:opacity-100 focus-visible:[&>div]:opacity-100",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      <div className="z-10 h-6 w-1 shrink-0 rounded-lg bg-muted-foreground/40 transition-opacity" />
    </div>
  );
}

// =============================================================================
// DataAppShellRightPanel
// =============================================================================

export interface DataAppShellRightPanelProps extends Omit<React.ComponentProps<"aside">, "id" | "title"> {
  /** Unique panel id — keys the persisted width in localStorage. */
  id: string;
  /** Whether the panel is shown (docked) or collapsed to the FAB trigger. */
  open: boolean;
  /** Called with the next open state (close button, Esc, FAB). */
  onOpenChange?: (open: boolean) => void;
  /** Show the drag handle and allow resizing. Defaults to `true`. */
  resizable?: boolean;
  /** Width in px when nothing is persisted yet. */
  defaultWidth?: number;
  /** Minimum width in px the panel can be resized to. */
  minWidth?: number;
  /** Maximum width in px the panel can be resized to. */
  maxWidth?: number;
  /** Persist the width to localStorage. Defaults to `true`. */
  persist?: boolean;
  /** Header title. The header row also carries the close button. */
  title?: React.ReactNode;
  /** Optional element rendered before the title (e.g. an app icon). */
  icon?: React.ReactNode;
  /** Extra elements rendered in the header, before the close button. */
  headerActions?: React.ReactNode;
  /** Render the floating FAB trigger while closed. Defaults to `true`. */
  showTrigger?: boolean;
  /** Icon inside the FAB trigger. Defaults to a panel-open icon. */
  triggerIcon?: React.ReactNode;
  /** Accessible label for the FAB trigger. */
  triggerLabel?: string;
  /** Panel content — any React node (a chat, history list, inspector, …). */
  children?: React.ReactNode;
}

/**
 * Docked right-hand panel for the Data App Shell (SW-2117). Rendered in normal
 * flow as a flex sibling of the main content, so opening/resizing pushes main
 * narrower (unlike the overlay `Sheet`, which slides over content). Width is
 * drag-resizable and persisted per `id`; while closed a floating FAB trigger
 * re-opens it.
 *
 * Place it after the main content inside a `relative` flex row:
 *
 * ```tsx
 * <div className="relative flex flex-1 min-h-0">
 *   <main className="flex-1 min-w-0">…</main>
 *   <DataAppShellRightPanel id="chat" open={open} onOpenChange={setOpen} title="Chat">
 *     …
 *   </DataAppShellRightPanel>
 * </div>
 * ```
 */
function DataAppShellRightPanel({
  id,
  open,
  onOpenChange,
  resizable = true,
  defaultWidth = 320,
  minWidth = 240,
  maxWidth = 560,
  persist = true,
  title,
  icon,
  headerActions,
  showTrigger = true,
  triggerIcon,
  triggerLabel = "Open panel",
  children,
  className,
  ...props
}: DataAppShellRightPanelProps) {
  const [width, setWidth] = React.useState<number>(() =>
    persist ? readWidth(id, defaultWidth, minWidth, maxWidth) : clampWidth(defaultWidth, minWidth, maxWidth),
  );
  const [dragging, setDragging] = React.useState(false);

  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const commitWidth = React.useCallback(
    (next: number) => {
      if (persist) persistWidth(id, next);
    },
    [id, persist],
  );

  // Focus follows the open state: into the panel on open, back to the FAB on
  // close — but only on actual transitions, not on mount.
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (open) closeButtonRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  if (!open) {
    if (!showTrigger) return null;
    return (
      <DataAppShellRightPanelTrigger
        ref={triggerRef}
        aria-label={triggerLabel}
        aria-expanded={false}
        onClick={() => onOpenChange?.(true)}
      >
        {triggerIcon}
      </DataAppShellRightPanelTrigger>
    );
  }

  return (
    <aside
      data-slot="data-app-shell-right-panel"
      aria-label={typeof title === "string" ? title : "Side panel"}
      style={{ width }}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-l border-border bg-background",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4",
        !dragging && "motion-safe:transition-[width] motion-safe:duration-200",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange?.(false);
      }}
      {...props}
    >
      {resizable && (
        <DragHandle
          width={width}
          minWidth={minWidth}
          maxWidth={maxWidth}
          onResize={setWidth}
          onCommit={commitWidth}
          onDraggingChange={setDragging}
        />
      )}

      <div
        data-slot="data-app-shell-right-panel-header"
        className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2"
      >
        {icon != null && <span className="flex shrink-0 items-center justify-center">{icon}</span>}
        {title != null && <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</span>}
        {title == null && <span className="flex-1" />}
        {headerActions}
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Close panel"
          onClick={() => onOpenChange?.(false)}
        >
          <X />
        </Button>
      </div>

      <div data-slot="data-app-shell-right-panel-content" className="flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </div>
    </aside>
  );
}

export { DataAppShellRightPanel, DataAppShellRightPanelTrigger, dataAppShellRightPanelTriggerVariants };
