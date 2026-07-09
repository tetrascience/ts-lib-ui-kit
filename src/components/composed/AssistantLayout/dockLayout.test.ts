import { describe, expect, it } from "vitest"

import { dockPanels } from "./dockLayout"

describe("dockPanels", () => {
  it("left dock → horizontal, assistant first", () => {
    expect(dockPanels("left")).toEqual({
      orientation: "horizontal",
      assistantFirst: true,
    })
  })

  it("right dock → horizontal, content first", () => {
    expect(dockPanels("right")).toEqual({
      orientation: "horizontal",
      assistantFirst: false,
    })
  })

  it("bottom dock → vertical, content first", () => {
    expect(dockPanels("bottom")).toEqual({
      orientation: "vertical",
      assistantFirst: false,
    })
  })
})
