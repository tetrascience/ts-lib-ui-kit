/** Where the AI Assistant panel docks relative to the main content. */
export type AssistantDock = "left" | "right" | "bottom"

export interface DockPanels {
  /** Resizable group orientation for this dock. */
  orientation: "horizontal" | "vertical"
  /** Whether the assistant panel renders before the content panel. */
  assistantFirst: boolean
}

/**
 * Maps a dock position to the resizable group's orientation and panel order.
 *  - left   → horizontal, assistant first  [assistant | content]
 *  - right  → horizontal, content first    [content | assistant]
 *  - bottom → vertical,   content first    [content / assistant]
 */
export function dockPanels(dock: AssistantDock): DockPanels {
  return {
    orientation: dock === "bottom" ? "vertical" : "horizontal",
    assistantFirst: dock === "left",
  }
}
