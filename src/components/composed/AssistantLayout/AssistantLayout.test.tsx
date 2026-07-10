import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  AssistantDockControls,
  AssistantLayoutProvider,
  useAssistantLayout,
} from "./AssistantLayout"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

/** jsdom's bundled `localStorage` is a non-functional stub here, so use our own. */
function installLocalStorage() {
  const store = new Map<string, string>()
  const storage: Storage = {
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, String(v))
    },
    removeItem: (k) => {
      store.delete(k)
    },
    clear: () => {
      store.clear()
    },
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage })
}

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  installLocalStorage()
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

/** Surfaces the context values so assertions don't depend on the resizable layout. */
function Probe() {
  const { dock, size, visible } = useAssistantLayout()
  return (
    <span data-testid="probe" data-dock={dock} data-size={String(size)} data-visible={String(visible)} />
  )
}

function probe() {
  const el = q('[data-testid="probe"]')
  return {
    dock: el?.getAttribute("data-dock"),
    size: Number(el?.getAttribute("data-size")),
    visible: el?.getAttribute("data-visible") === "true",
  }
}

function Harness({
  dock = "left",
  size,
  persist = true,
  showLabel = true,
}: {
  dock?: "left" | "right" | "bottom"
  size?: number
  persist?: boolean
  showLabel?: boolean
}) {
  return (
    <AssistantLayoutProvider
      storageKey="spec.assistant"
      defaultDock={dock}
      defaultSize={size}
      persist={persist}
    >
      <AssistantDockControls label={showLabel ? undefined : null} />
      <Probe />
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

  it("reads persisted dock and size", () => {
    window.localStorage.setItem("spec.assistant.dock", "right")
    window.localStorage.setItem("spec.assistant.size", "45")

    render(<Harness dock="left" size={32} />)

    expect(probe().dock).toBe("right")
    expect(probe().size).toBe(45)
  })

  it("falls back to the default when the persisted size is out of the (0,100) range", () => {
    window.localStorage.setItem("spec.assistant.size", "150")

    render(<Harness dock="left" size={32} />)

    expect(probe().size).toBe(32)
  })

  it("ignores persisted values when persist is false", () => {
    window.localStorage.setItem("spec.assistant.dock", "bottom")

    render(<Harness dock="left" size={32} persist={false} />)

    expect(probe().dock).toBe("left")
  })

  it("shows the label by default and hides it when label is null", () => {
    render(<Harness dock="left" />)
    expect(container.textContent).toContain("AI Assistant")

    act(() => root.unmount())
    root = createRoot(container)
    render(<Harness dock="left" showLabel={false} />)
    expect(container.textContent).not.toContain("AI Assistant")
  })

  it("hides on active dock click and redocks (persisting the dock) on another icon", () => {
    render(<Harness dock="left" />)
    expect(probe().visible).toBe(true)
    expect(probe().dock).toBe("left")

    click('button[aria-label="Hide AI Assistant"]')
    expect(probe().visible).toBe(false)

    click('button[aria-label="Dock assistant right"]')
    expect(probe().visible).toBe(true)
    expect(probe().dock).toBe("right")
    expect(window.localStorage.getItem("spec.assistant.dock")).toBe("right")
  })
})
