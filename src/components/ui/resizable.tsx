import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/**
 * Lays out `ResizablePanel`s along `orientation`, separated by
 * `ResizableHandle`s. Wraps `react-resizable-panels` v4: sizes given as
 * numbers are pixels, strings are percentages.
 *
 * Testing: react-resizable-panels constructs a `ResizeObserver` on mount, which
 * jsdom lacks — without a stub the component throws and nothing renders. Jest
 * consumers get one from the kit's `./jest-setup` entry; otherwise stub it.
 */
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/**
 * A panel inside a `ResizablePanelGroup`.
 *
 * Not a scroll container by default (SW-2648): content that needs to scroll
 * should scroll itself (e.g. a card with `overflow-auto`), so no scrollbar lands
 * on the resize seam. Oversized content is clipped at the panel edge — it never
 * spills onto a neighbouring panel, and a collapsed panel stays hidden — with a
 * 4px `overflow-clip-margin` so a `Card`'s ring and focus rings still paint
 * (browsers without `overflow-clip-margin`, e.g. Safari, clip at the edge).
 * Pass `scrollable` to make the panel itself scroll.
 */
function ResizablePanel({
  className,
  style,
  scrollable = false,
  ...props
}: ResizablePrimitive.PanelProps & {
  /** Make the panel its own scroll container. */
  scrollable?: boolean
}) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      // react-resizable-panels sets `overflow: auto` inline; clear it so the
      // class governs and consumers can override it with a plain utility.
      style={{ overflow: undefined, ...style }}
      className={cn(
        scrollable ? "overflow-auto" : "overflow-clip [overflow-clip-margin:4px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Resize handle between two panels.
 *
 * The visible divider is a **1px line that sits exactly on the panel
 * boundary**, so the divider, the grip, and the seam between the panels all
 * line up — regardless of the panels' backgrounds. Without a grip the handle's
 * footprint is that 1px; with `withHandle` it widens to the grip's 4px (the
 * divider stays 1px via `bg-clip-content`) so the grip is never clipped when
 * the handle sits on the group's edge, e.g. beside a collapsed panel. A wide, transparent
 * **grab area** is layered on top via `::after` (it overlaps both panels by 6px
 * without taking layout space) so the handle can be grabbed anywhere in the gap,
 * not just on the hairline.
 *
 * The 1px divider — and the optional grip (`withHandle`) — stay hidden at rest
 * and **reveal on hover, keyboard focus, or while dragging** (the handle tracks
 * the pointer, so it stays hovered). Keyboard focus reveals them in the `ring`
 * color for a clear focus indicator. Works in both orientations.
 *
 * Has a default `aria-label` so the separator always has an accessible name;
 * pass `aria-label` to override it with something context-specific.
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      aria-label="Resize"
      className={cn(
        // 1px divider on the seam (hidden at rest); centers the grip on it
        "relative flex shrink-0 items-center justify-center bg-transparent transition-colors ring-offset-background focus-visible:outline-hidden",
        "w-px aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
        // with a grip: footprint = grip width, background clipped to a 1px centre
        withHandle &&
          "w-1 bg-clip-content px-[1.5px] aria-[orientation=horizontal]:h-1 aria-[orientation=horizontal]:px-0 aria-[orientation=horizontal]:py-[1.5px]",
        // wide transparent grab area via ::after — overlays the panels, no layout
        "after:absolute after:w-3 after:inset-y-0 after:left-1/2 after:-translate-x-1/2",
        "aria-[orientation=horizontal]:after:inset-y-auto aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2",
        // reveal the divider on hover / active drag (border) and keyboard focus (ring)
        "hover:bg-border active:bg-border focus-visible:bg-ring",
        // reveal the grip likewise
        "hover:[&>div]:bg-border active:[&>div]:bg-border focus-visible:[&>div]:bg-ring",
        // grip rotates for the horizontal separator
        "[&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-transparent transition-colors" />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
