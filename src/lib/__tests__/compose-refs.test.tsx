import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useComposedRefs } from "../compose-refs"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

/**
 * A component that needs its own ref and also accepts a consumer's. The consumer ref
 * travels as an ordinary prop: React 18 strips a `ref` prop from plain function
 * components, and this tests the hook, not React's ref delivery.
 */
function Box({ consumer, internal }: { consumer?: React.Ref<HTMLDivElement>; internal: React.Ref<HTMLDivElement> }) {
  return <div data-testid="box" ref={useComposedRefs(internal, consumer)} />
}

const box = () => container.querySelector('[data-testid="box"]')

describe("useComposedRefs", () => {
  it("writes the node to both an object ref and a callback ref, and clears them on unmount", () => {
    const internal = React.createRef<HTMLDivElement>()
    const seen: Array<HTMLDivElement | null> = []
    act(() => root.render(<Box internal={internal} consumer={(node) => void seen.push(node)} />))
    expect(internal.current).toBe(box())
    expect(seen.at(-1)).toBe(box())

    act(() => root.render(<span />))
    expect(internal.current).toBeNull()
    expect(seen.at(-1)).toBeNull()
  })

  it("tolerates a missing consumer ref", () => {
    const internal = React.createRef<HTMLDivElement>()
    act(() => root.render(<Box internal={internal} />))
    expect(internal.current).toBe(box())
  })

  it("keeps one stable callback and writes to the refs passed on the latest render", () => {
    const internal = React.createRef<HTMLDivElement>()
    const first = React.createRef<HTMLDivElement>()
    const second = React.createRef<HTMLDivElement>()
    const callbacks: Array<React.RefCallback<HTMLDivElement>> = []
    function Probe({ consumer }: { consumer: React.Ref<HTMLDivElement> }) {
      const composed = useComposedRefs(internal, consumer)
      callbacks.push(composed)
      return <div data-testid="box" ref={composed} />
    }
    act(() => root.render(<Probe consumer={first} />))
    act(() => root.render(<Probe consumer={second} />))
    expect(callbacks[0]).toBe(callbacks.at(-1))
    expect(first.current).toBe(box())

    // The element stays mounted, so React does not call the stable callback again.
    // The next attach (here, unmount) goes to the refs from the latest render.
    act(() => root.render(<span />))
    expect(internal.current).toBeNull()
    // The detach went to the latest refs, so the earlier consumer ref was never cleared.
    expect(first.current).toBeInstanceOf(HTMLDivElement)
  })
})
