import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AssistantDockControls,
  AssistantLayout,
  AssistantLayoutProvider,
  useAssistantLayout,
} from "./AssistantLayout"

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  window.localStorage.clear()
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function q<T extends Element = HTMLElement>(selector: string) {
  return container.querySelector(selector) as T | null
}

function click(selector: string) {
  const el = q<HTMLElement>(selector)
  expect(el).not.toBeNull()
  act(() => {
    el!.click()
  })
}

function hasClass(el: HTMLElement | null, className: string) {
  return (el?.className.split(/\s+/) ?? []).includes(className)
}

function flexSizePx(el: HTMLElement | null) {
  const value = /0 0 (\d+)px/.exec(el?.style.flex ?? "")
  return value ? Number(value[1]) : null
}

function TestLayout({
  dock = "left",
  size = 420,
  persist = true,
  showLabel = true,
}: {
  dock?: "left" | "right" | "bottom"
  size?: number
  persist?: boolean
  showLabel?: boolean
}) {
  return (
    <AssistantLayoutProvider storageKey="spec.assistant" defaultDock={dock} defaultSize={size} persist={persist}>
      <AssistantDockControls label={showLabel ? undefined : null} />
      <AssistantLayout assistant={<div data-testid="assistant-content">assistant</div>}>
        <div>content</div>
      </AssistantLayout>
    </AssistantLayoutProvider>
  )
}

describe("AssistantLayout", () => {
  it("throws when useAssistantLayout is used outside the provider", () => {
    function Consumer() {
      useAssistantLayout()
      return null
    }

    expect(() => {
      render(<Consumer />)
    }).toThrow("useAssistantLayout must be used within an AssistantLayoutProvider")
  })

  it("reads persisted dock/size and clamps stale size to viewport cap", () => {
    window.localStorage.setItem("spec.assistant.dock", "right")
    window.localStorage.setItem("spec.assistant.size", "1000")
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(900)
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(500)

    render(<TestLayout dock="left" size={420} />)

    const body = q<HTMLElement>('[data-slot="assistant-layout"]')
    const assistant = q<HTMLElement>('[data-slot="assistant-layout-assistant"]')
    expect(body?.style.flexDirection).toBe("row")
    expect(assistant?.style.order).toBe("2")
    expect(assistant?.style.flex).toBe("0 0 425px")
  })

  it("hides on active dock click, shows label by default, and redocks when another icon is clicked", () => {
    render(<TestLayout dock="left" size={420} />)

    expect(container.textContent).toContain("AI Assistant")
    expect(q('[role="separator"]')).not.toBeNull()

    click('button[aria-label="Hide AI Assistant"]')
    const assistant = q<HTMLElement>('[data-slot="assistant-layout-assistant"]')
    expect(hasClass(assistant, "hidden")).toBe(true)
    expect(q('[role="separator"]')).toBeNull()

    click('button[aria-label="Dock assistant right"]')
    expect(window.localStorage.getItem("spec.assistant.dock")).toBe("right")
    expect(hasClass(assistant, "hidden")).toBe(false)
    expect(assistant?.style.order).toBe("2")
  })

  it("supports keyboard resize controls and persists rounded size", () => {
    render(<TestLayout dock="bottom" size={420} showLabel={false} />)

    expect(container.textContent).not.toContain("AI Assistant")
    const separator = q<HTMLElement>('[role="separator"]')
    const assistant = q<HTMLElement>('[data-slot="assistant-layout-assistant"]')
    expect(separator?.getAttribute("aria-orientation")).toBe("horizontal")

    const initial = flexSizePx(assistant)
    expect(initial).toBe(420)

    act(() => {
      separator?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    })
    const afterDown = flexSizePx(assistant)
    expect(afterDown).toBeLessThan(initial!)
    expect(window.localStorage.getItem("spec.assistant.size")).toBe(String(afterDown))

    act(() => {
      separator?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", shiftKey: true, bubbles: true })
      )
    })
    const afterShiftUp = flexSizePx(assistant)
    expect(afterShiftUp).toBeGreaterThan(afterDown!)
    expect(window.localStorage.getItem("spec.assistant.size")).toBe(String(afterShiftUp))

    act(() => {
      separator?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }))
    })
    expect(assistant?.style.flex).toBe("0 0 240px")
    expect(window.localStorage.getItem("spec.assistant.size")).toBe("240")
  })

  it("supports pointer resize and ignores non-primary pointer down", () => {
    render(<TestLayout dock="left" size={420} persist={false} />)

    const separator = q<HTMLElement>('[role="separator"]')
    const assistant = q<HTMLElement>('[data-slot="assistant-layout-assistant"]')
    expect(separator).not.toBeNull()

    const setPointerCapture = vi.fn()
    const releasePointerCapture = vi.fn()
    Object.defineProperties(separator as object, {
      setPointerCapture: { value: setPointerCapture, configurable: true },
      releasePointerCapture: { value: releasePointerCapture, configurable: true },
    })

    act(() => {
      separator?.dispatchEvent(
        new PointerEvent("pointerdown", { button: 1, pointerId: 7, clientX: 0, bubbles: true })
      )
    })
    expect(document.body.style.userSelect).toBe("")

    act(() => {
      separator?.dispatchEvent(
        new PointerEvent("pointerdown", { button: 0, pointerId: 7, clientX: 100, bubbles: true })
      )
    })
    expect(setPointerCapture).toHaveBeenCalledWith(7)
    expect(document.body.style.userSelect).toBe("none")

    act(() => {
      separator?.dispatchEvent(new PointerEvent("pointermove", { pointerId: 7, clientX: 140, bubbles: true }))
    })
    expect(assistant?.style.flex).toBe("0 0 460px")

    act(() => {
      separator?.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, bubbles: true }))
    })
    expect(releasePointerCapture).toHaveBeenCalledWith(7)
    expect(document.body.style.userSelect).toBe("")
  })
})
