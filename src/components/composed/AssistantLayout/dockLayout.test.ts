import { describe, expect, it } from "vitest"

import { clampAssistantSize, dockLayout, nextAssistantSize } from "./dockLayout"

describe("dockLayout", () => {
  it("left dock → row, assistant first", () => {
    expect(dockLayout("left")).toEqual({
      flexDirection: "row",
      assistantOrder: 0,
      contentOrder: 2,
      splitterOrder: 1,
    })
  })

  it("right dock → row, assistant after content", () => {
    const l = dockLayout("right")
    expect(l.flexDirection).toBe("row")
    expect(l.assistantOrder).toBe(2)
    expect(l.contentOrder).toBe(0)
  })

  it("bottom dock → column, assistant after content", () => {
    const l = dockLayout("bottom")
    expect(l.flexDirection).toBe("column")
    expect(l.assistantOrder).toBe(2)
    expect(l.contentOrder).toBe(0)
  })

  it("splitter order is always 1 (between the two)", () => {
    for (const dock of ["left", "right", "bottom"] as const) {
      expect(dockLayout(dock).splitterOrder).toBe(1)
    }
  })
})

describe("clampAssistantSize", () => {
  it("clamps below min", () => expect(clampAssistantSize(100, 240, 800)).toBe(240))
  it("clamps above max", () => expect(clampAssistantSize(900, 240, 800)).toBe(800))
  it("passes through in range", () => expect(clampAssistantSize(420, 240, 800)).toBe(420))
})

describe("nextAssistantSize", () => {
  it("left dock adds the drag delta (grows toward the splitter)", () => {
    expect(nextAssistantSize("left", 420, 50)).toBe(470)
  })
  it("right dock subtracts the drag delta", () => {
    expect(nextAssistantSize("right", 420, 50)).toBe(370)
  })
  it("bottom dock subtracts the drag delta", () => {
    expect(nextAssistantSize("bottom", 420, 50)).toBe(370)
  })
})
