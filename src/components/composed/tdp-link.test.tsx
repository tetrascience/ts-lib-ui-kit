import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  TDPLink,
  TdpNavigationProvider,
  useTdpNavigation,
  useTdpNavigationContext,
} from "./tdp-link"

import type {
  TdpNavigationContextValue,
  UseTdpNavigationReturn,
} from "./tdp-link"

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  Object.defineProperty(document, "referrer", {
    value: "",
    writable: true,
    configurable: true,
  })
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  flushSync(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui))
  return container
}

// ---------------------------------------------------------------------------
// useTdpNavigationContext — error when outside provider
// ---------------------------------------------------------------------------

describe("useTdpNavigationContext", () => {
  it("throws when used outside a TdpNavigationProvider", () => {
    let caughtError: Error | undefined

    function ThrowingComponent() {
      try {
        useTdpNavigationContext()
      } catch (e) {
        caughtError = e as Error
      }
      return null
    }

    render(<ThrowingComponent />)

    expect(caughtError).toBeDefined()
    expect(caughtError!.message).toContain(
      "useTdpNavigationContext must be used within a TdpNavigationProvider",
    )
  })
})

// ---------------------------------------------------------------------------
// TdpNavigationProvider — base URL resolution and navigation
// ---------------------------------------------------------------------------

describe("TdpNavigationProvider", () => {
  function captureContext(providerProps?: { tdpBaseUrl?: string }) {
    let captured: TdpNavigationContextValue | undefined

    function Probe() {
      captured = useTdpNavigationContext()
      return null
    }

    render(
      <TdpNavigationProvider {...providerProps}>
        <Probe />
      </TdpNavigationProvider>,
    )

    return captured!
  }

  it("strips the trailing slash from an explicit base URL", () => {
    const ctx = captureContext({ tdpBaseUrl: "https://tetrascience.com/my-org/" })
    expect(ctx.tdpBaseUrl).toBe("https://tetrascience.com/my-org")
  })

  it("falls back to the referrer when no explicit base URL is given", () => {
    Object.defineProperty(document, "referrer", {
      value: "https://tetrascience.com/my-org/data-workspace/app/123",
    })
    const ctx = captureContext()
    expect(ctx.tdpBaseUrl).toBe("https://tetrascience.com/my-org")
  })

  it("builds full URLs via getTdpUrl and returns null when unresolved", () => {
    const resolved = captureContext({ tdpBaseUrl: "https://tetrascience.com/my-org" })
    expect(resolved.getTdpUrl("/file/abc")).toBe(
      "https://tetrascience.com/my-org/file/abc",
    )

    const unresolved = captureContext()
    expect(unresolved.tdpBaseUrl).toBeNull()
    expect(unresolved.getTdpUrl("/file/abc")).toBeNull()
  })

  it("navigateToTdp warns and does not navigate when the base URL is unresolved", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const ctx = captureContext()
    ctx.navigateToTdp("/file/abc", { newTab: true })

    expect(warnSpy).toHaveBeenCalledWith(
      "[TdpNavigation] Cannot navigate: TDP base URL not resolved",
    )
    expect(openSpy).not.toHaveBeenCalled()
  })

  it("navigateToTdp opens the built URL when resolved", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const ctx = captureContext({ tdpBaseUrl: "https://tetrascience.com/my-org" })
    ctx.navigateToTdp("/file/abc", { newTab: true })

    expect(openSpy).toHaveBeenCalledWith(
      "https://tetrascience.com/my-org/file/abc",
      "_blank",
      "noopener,noreferrer",
    )
  })
})

// ---------------------------------------------------------------------------
// useTdpNavigation — standalone hook (no provider)
// ---------------------------------------------------------------------------

describe("useTdpNavigation", () => {
  function captureHook(options?: { tdpBaseUrl?: string }) {
    let captured: UseTdpNavigationReturn | undefined

    function Probe() {
      captured = useTdpNavigation(options)
      return null
    }

    render(<Probe />)
    return captured!
  }

  it("strips the trailing slash from an explicit base URL", () => {
    const nav = captureHook({ tdpBaseUrl: "https://tetrascience.com/my-org/" })
    expect(nav.tdpBaseUrl).toBe("https://tetrascience.com/my-org")
  })

  it("falls back to the referrer when no explicit base URL is given", () => {
    Object.defineProperty(document, "referrer", {
      value: "https://tetrascience.com/my-org/file/abc-123",
    })
    const nav = captureHook()
    expect(nav.tdpBaseUrl).toBe("https://tetrascience.com/my-org")
  })

  it("builds full URLs via getTdpUrl and returns null when unresolved", () => {
    const resolved = captureHook({ tdpBaseUrl: "https://tetrascience.com/my-org" })
    expect(resolved.getTdpUrl("/search")).toBe(
      "https://tetrascience.com/my-org/search",
    )

    const unresolved = captureHook()
    expect(unresolved.tdpBaseUrl).toBeNull()
    expect(unresolved.getTdpUrl("/search")).toBeNull()
  })

  it("navigateToTdp warns and does not navigate when the base URL is unresolved", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const nav = captureHook()
    nav.navigateToTdp("/file/abc", { newTab: true })

    expect(warnSpy).toHaveBeenCalledWith(
      "[useTdpNavigation] Cannot navigate: TDP base URL not resolved",
    )
    expect(openSpy).not.toHaveBeenCalled()
  })

  it("navigateToTdp opens the built URL when resolved", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const nav = captureHook({ tdpBaseUrl: "https://tetrascience.com/my-org" })
    nav.navigateToTdp("/file/abc", { newTab: true })

    expect(openSpy).toHaveBeenCalledWith(
      "https://tetrascience.com/my-org/file/abc",
      "_blank",
      "noopener,noreferrer",
    )
  })
})

// ---------------------------------------------------------------------------
// TDPLink — click behavior
// ---------------------------------------------------------------------------

describe("TDPLink", () => {
  function renderLink(onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void) {
    const c = render(
      <TdpNavigationProvider tdpBaseUrl="https://tetrascience.com/my-org">
        <TDPLink path="/file/abc" onClick={onClick}>
          View File
        </TDPLink>
      </TdpNavigationProvider>,
    )
    return c.querySelector("a")!
  }

  // Prevent jsdom's unimplemented native navigation when a modifier-key
  // click is allowed to proceed with default anchor behavior.
  function clickSuppressingDefault(el: HTMLAnchorElement, init: MouseEventInit) {
    const suppress = (e: Event) => e.preventDefault()
    document.addEventListener("click", suppress)
    try {
      el.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, ...init }),
      )
    } finally {
      document.removeEventListener("click", suppress)
    }
  }

  it("renders an anchor with the resolved href", () => {
    const anchor = renderLink()
    expect(anchor.getAttribute("href")).toBe(
      "https://tetrascience.com/my-org/file/abc",
    )
    expect(anchor.getAttribute("target")).toBe("_blank")
  })

  it("intercepts plain clicks and navigates via the TDP helpers", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    const onClick = vi.fn()

    const anchor = renderLink(onClick)
    flushSync(() => {
      anchor.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      )
    })

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(openSpy).toHaveBeenCalledWith(
      "https://tetrascience.com/my-org/file/abc",
      "_blank",
      "noopener,noreferrer",
    )
  })

  it("lets modifier-key clicks fall through to native anchor behavior", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    const onClick = vi.fn()
    const anchor = renderLink(onClick)

    clickSuppressingDefault(anchor, { metaKey: true })
    clickSuppressingDefault(anchor, { ctrlKey: true })
    clickSuppressingDefault(anchor, { shiftKey: true })

    expect(onClick).not.toHaveBeenCalled()
    expect(openSpy).not.toHaveBeenCalled()
  })
})
