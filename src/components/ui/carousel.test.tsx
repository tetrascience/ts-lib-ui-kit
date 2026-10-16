import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "./carousel"

/*
 * The carousel region's ArrowLeft / ArrowRight handling. Play tests drive the
 * prev/next buttons; this covers the keyboard path against a spied Embla API.
 */

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  // Embla observes slides and reads breakpoints; jsdom implements none of these APIs.
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  vi.stubGlobal("IntersectionObserver", NoopObserver)
  vi.stubGlobal("ResizeObserver", NoopObserver)
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  )
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function renderCarousel() {
  let api: CarouselApi
  act(() =>
    root.render(
      <Carousel setApi={(next) => (api = next)}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    ),
  )
  const region = container.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!
  return { region, api: api! }
}

describe("Carousel keyboard navigation", () => {
  it("scrolls with ArrowLeft and ArrowRight and ignores other keys", () => {
    const { region, api } = renderCarousel()
    expect(api).toBeDefined()
    const prev = vi.spyOn(api!, "scrollPrev")
    const next = vi.spyOn(api!, "scrollNext")

    const press = (key: string) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
      act(() => {
        region.dispatchEvent(event)
      })
      return event
    }

    expect(press("ArrowRight").defaultPrevented).toBe(true)
    expect(next).toHaveBeenCalledOnce()

    expect(press("ArrowLeft").defaultPrevented).toBe(true)
    expect(prev).toHaveBeenCalledOnce()

    expect(press("Enter").defaultPrevented).toBe(false)
    expect(prev).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledOnce()
  })
})
