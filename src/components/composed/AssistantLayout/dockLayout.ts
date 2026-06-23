/** Where the AI Assistant panel docks relative to the main content. */
export type AssistantDock = "left" | "right" | "bottom"

export interface DockLayout {
  flexDirection: "row" | "column"
  /** CSS `order` for the assistant region. */
  assistantOrder: number
  /** CSS `order` for the main-content region. */
  contentOrder: number
  /** CSS `order` for the splitter — always between the two. */
  splitterOrder: number
}

/**
 * Flex layout of the body for a given dock position.
 *  - left   → row,    assistant first  [assistant | content]
 *  - right  → row,    assistant last   [content | assistant]
 *  - bottom → column, assistant last   [content / assistant]
 *
 * Both panels and the splitter live in one flex container in fixed DOM order;
 * changing only their `order` values (and the container's `flex-direction`)
 * reflows them for any dock position without re-mounting anything — so the
 * assistant's chat/scroll state survives a redock.
 */
export function dockLayout(dock: AssistantDock): DockLayout {
  return {
    flexDirection: dock === "bottom" ? "column" : "row",
    assistantOrder: dock === "left" ? 0 : 2,
    contentOrder: dock === "left" ? 2 : 0,
    splitterOrder: 1,
  }
}

/** Clamp a size (px) to `[min, max]`. */
export function clampAssistantSize(size: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, size))
}

/**
 * Proposed assistant size while dragging the splitter. The assistant grows
 * toward the splitter for a left dock and away from it for right/bottom docks
 * (it sits after the divider there), so the drag delta is added or subtracted.
 */
export function nextAssistantSize(dock: AssistantDock, startSize: number, delta: number): number {
  return dock === "left" ? startSize + delta : startSize - delta
}
